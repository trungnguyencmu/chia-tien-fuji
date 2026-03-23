import { useState, useEffect, useRef, useCallback } from 'react';
import { Trip, TripMember, UserSearchResult, fetchTripMembers, addTripMember, removeTripMember, regenerateInviteCode, updateMyDisplayName, searchUsers } from '../api/api';
import { useAuth } from '../contexts/auth-context';
import { useLanguage } from '../i18n';

interface TripMembersProps {
  trip: Trip;
  onMembersChanged: () => void;
}

export function TripMembers({ trip, onMembersChanged }: TripMembersProps) {
  const { userEmail } = useAuth();
  const { t } = useLanguage();
  const [members, setMembers] = useState<TripMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [newEmail, setNewEmail] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searching, setSearching] = useState(false);
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [regenerating, setRegenerating] = useState(false);

  // Edit display name state
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editDisplayName, setEditDisplayName] = useState('');
  const [updatingDisplayName, setUpdatingDisplayName] = useState(false);

  const isOwner = !!trip.inviteCode;

  useEffect(() => {
    loadMembers();
  }, [trip.tripId]);

  const loadMembers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchTripMembers(trip.tripId);
      setMembers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('loadingMembers'));
    } finally {
      setLoading(false);
    }
  };

  // Debounced user search
  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
    setNewEmail(value);
    setAddError(null);

    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    if (value.trim().length < 2) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    searchTimeoutRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const results = await searchUsers(value.trim());
        // Filter out existing members
        const memberEmails = new Set(members.map((m) => m.email));
        setSearchResults(results.filter((r) => !memberEmails.has(r.email)));
        setShowDropdown(true);
      } catch {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);
  }, [members]);

  const handleSelectUser = (user: UserSearchResult) => {
    setNewEmail(user.email);
    setSearchQuery(`${user.displayName} (${user.email})`);
    setShowDropdown(false);
    setSearchResults([]);
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim()) return;

    setAddError(null);
    setAdding(true);
    try {
      await addTripMember(trip.tripId, newEmail.trim());
      setNewEmail('');
      setSearchQuery('');
      setSearchResults([]);
      setShowDropdown(false);
      await loadMembers();
      onMembersChanged();
    } catch (err) {
      setAddError(err instanceof Error ? err.message : t('invite') + ' failed');
    } finally {
      setAdding(false);
    }
  };

  const handleRemoveMember = async (userId: string, _displayName: string) => {
    if (!window.confirm(t('deleteMemberConfirm'))) return;

    try {
      await removeTripMember(trip.tripId, userId);
      // Update local state instead of reloading
      setMembers((prev) => prev.filter((m) => m.userId !== userId));
      onMembersChanged();
    } catch (err) {
      alert(err instanceof Error ? err.message : t('remove') + ' failed');
    }
  };

  const handleRegenerateCode = async () => {
    if (!window.confirm(t('oldCodeStopWorking'))) return;

    setRegenerating(true);
    try {
      const updatedTrip = await regenerateInviteCode(trip.tripId);
      // Update the trip with new invite code via callback
      window.dispatchEvent(new CustomEvent('tripUpdated', { detail: updatedTrip }));
    } catch (err) {
      alert(err instanceof Error ? err.message : t('regenerateInviteCode'));
    } finally {
      setRegenerating(false);
    }
  };

  const handleStartEdit = (member: TripMember) => {
    setEditingUserId(member.userId);
    setEditDisplayName(member.displayName);
  };

  const handleCancelEdit = () => {
    setEditingUserId(null);
    setEditDisplayName('');
  };

  const handleSaveDisplayName = async () => {
    if (!editDisplayName.trim()) return;

    setUpdatingDisplayName(true);
    try {
      await updateMyDisplayName(editDisplayName.trim());
      // Update local state instead of reloading
      setMembers((prev) =>
        prev.map((m) =>
          m.email === userEmail ? { ...m, displayName: editDisplayName.trim() } : m
        )
      );
      setEditingUserId(null);
      setEditDisplayName('');
      onMembersChanged();
    } catch (err) {
      alert(err instanceof Error ? err.message : t('clickToEdit'));
    } finally {
      setUpdatingDisplayName(false);
    }
  };

  if (loading) {
    return (
      <div className="card">
        <div style={{ textAlign: 'center', padding: '1rem' }}>{t('loadingMembers')}</div>
      </div>
    );
  }

  return (
    <div className="card">
      <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: '700' }}>
        👥 {t('membersCount', { count: members.length })}
      </h2>

      {/* Invite Code Section */}
      {trip.inviteCode && (
        <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'var(--gray-50)', borderRadius: '8px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--gray-600)', fontWeight: '600', marginBottom: '0.25rem' }}>
            {t('inviteLink')}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <code style={{
              fontSize: '0.9rem',
              fontWeight: '600',
              letterSpacing: '0.05em',
              background: 'white',
              padding: '0.5rem 0.75rem',
              borderRadius: '6px',
              border: '1px solid var(--gray-200)',
              flex: 1,
              minWidth: '200px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {`${window.location.origin}/join/${trip.inviteCode}`}
            </code>
            <button
              onClick={async () => {
                const url = `${window.location.origin}/join/${trip.inviteCode}`;
                try {
                  await navigator.clipboard.writeText(url);
                  alert(t('copied'));
                } catch {
                  prompt('Copy this invite link:', url);
                }
              }}
              style={{
                padding: '0.5rem 0.75rem',
                borderRadius: '6px',
                background: '#4f46e5',
                color: 'white',
                border: 'none',
                fontSize: '0.75rem',
                fontWeight: '600',
                cursor: 'pointer',
              }}
              title={t('copyInviteLink')}
            >
              📋 {t('copy')}
            </button>
            <button
              onClick={handleRegenerateCode}
              disabled={regenerating}
              style={{
                padding: '0.5rem 0.75rem',
                borderRadius: '6px',
                background: 'rgba(199, 180, 243, 0.2)',
                border: '1px solid rgba(199, 180, 243, 0.3)',
                fontSize: '0.75rem',
                fontWeight: '600',
                cursor: regenerating ? 'not-allowed' : 'pointer',
                opacity: regenerating ? 0.5 : 1,
              }}
              title={t('regenerateInviteCode')}
            >
              {regenerating ? '⏳' : '🔄'}
            </button>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginTop: '0.5rem' }}>
            {t('shareLinkToInvite')}
          </div>
        </div>
      )}

      {/* Add Member Form (owner only) */}
      {isOwner && (
        <form onSubmit={handleAddMember} style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <div ref={dropdownRef} style={{ flex: 1, position: 'relative' }}>
              <input
                type="text"
                className="form-input"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                onFocus={() => searchResults.length > 0 && setShowDropdown(true)}
                disabled={adding}
                placeholder={t('searchByNameOrEmail')}
                style={{ width: '100%' }}
                autoComplete="off"
              />
              {searching && (
                <div style={{
                  position: 'absolute',
                  right: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  fontSize: '0.85rem',
                }}>
                  ⏳
                </div>
              )}
              {showDropdown && searchResults.length > 0 && (
                <div className="search-dropdown">
                  {searchResults.map((user) => (
                    <button
                      key={user.userId}
                      type="button"
                      className="search-dropdown-item"
                      onClick={() => handleSelectUser(user)}
                    >
                      <div className="search-dropdown-avatar">
                        {user.displayName.charAt(0).toUpperCase()}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: '600', fontSize: '0.875rem', color: 'var(--gray-900)' }}>
                          {user.displayName}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {user.email}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              {showDropdown && !searching && searchResults.length === 0 && searchQuery.trim().length >= 2 && (
                <div className="search-dropdown">
                  <div style={{ padding: '0.75rem 1rem', color: 'var(--gray-500)', fontSize: '0.85rem', textAlign: 'center' }}>
                    {t('noUsersFound')}
                  </div>
                </div>
              )}
            </div>
            <button type="submit" className="btn btn-primary" disabled={adding || !newEmail.trim()}>
              {adding ? '⏳' : '➕'} {t('invite')}
            </button>
          </div>
          {addError && (
            <div className="alert alert-error" style={{ marginTop: '0.75rem' }}>
              ⚠️ {addError}
            </div>
          )}
        </form>
      )}

      {/* Error */}
      {error && (
        <div className="alert alert-error" style={{ marginBottom: '1rem' }}>
          ⚠️ {error}
        </div>
      )}

      {/* Members List */}
      {members.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">👤</div>
          <p>{t('noMembersYet')}</p>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>{t('name')}</th>
                <th>{t('email')}</th>
                <th>{t('role')}</th>
                {isOwner && <th></th>}
              </tr>
            </thead>
            <tbody>
              {members.map((member) => (
                <tr key={member.userId}>
                  <td>
                    {editingUserId === member.userId ? (
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <input
                          type="text"
                          className="form-input"
                          value={editDisplayName}
                          onChange={(e) => setEditDisplayName(e.target.value)}
                          disabled={updatingDisplayName}
                          style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveDisplayName();
                            if (e.key === 'Escape') handleCancelEdit();
                          }}
                        />
                        <button
                          onClick={handleSaveDisplayName}
                          disabled={updatingDisplayName || !editDisplayName.trim()}
                          style={{
                            padding: '0.25rem 0.5rem',
                            borderRadius: '4px',
                            background: '#4f46e5',
                            color: 'white',
                            border: 'none',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            cursor: updatingDisplayName ? 'not-allowed' : 'pointer',
                          }}
                        >
                          {updatingDisplayName ? '⏳' : '✓'}
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          disabled={updatingDisplayName}
                          style={{
                            padding: '0.25rem 0.5rem',
                            borderRadius: '4px',
                            background: 'var(--gray-200)',
                            border: 'none',
                            fontSize: '0.75rem',
                            cursor: 'not-allowed',
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <span
                        style={{ cursor: member.email === userEmail ? 'pointer' : 'default' }}
                        onClick={() => member.email === userEmail && handleStartEdit(member)}
                        title={member.email === userEmail ? t('clickToEdit') : undefined}
                      >
                        <strong>{member.displayName}</strong>
                        {member.email === userEmail && ' ' + t('you')}
                        {member.email === userEmail && (
                          <span style={{ marginLeft: '0.5rem', fontSize: '0.75rem', opacity: 0.6 }}>✏️</span>
                        )}
                      </span>
                    )}
                  </td>
                  <td>{member.email}</td>
                  <td>
                    <span className={`badge ${member.role === 'owner' ? 'badge-success' : 'badge-neutral'}`}>
                      {member.role === 'owner' ? t('owner') : t('memberRole')}
                    </span>
                  </td>
                  {isOwner && member.role !== 'owner' && (
                    <td style={{ textAlign: 'right' }}>
                      <button
                        onClick={() => handleRemoveMember(member.userId, member.displayName)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '0.875rem',
                          color: '#991b1b',
                          padding: '0.25rem 0.5rem',
                        }}
                        title={t('remove')}
                      >
                        ✕
                      </button>
                    </td>
                  )}
                  {isOwner && member.role === 'owner' && <td></td>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
