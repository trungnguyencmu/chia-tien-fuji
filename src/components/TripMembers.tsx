import { useState, useEffect, useRef, useCallback } from 'react';
import { Trip, TripMember, UserSearchResult, fetchTripMembers, addTripMember, removeTripMember, regenerateInviteCode, updateMyDisplayName, searchUsers, updateMemberSettled } from '../api/api';
import { useAuth } from '../contexts/auth-context';
import { Avatar } from './ui/Avatar';
import { Icon, Spinner } from './ui/Icon';
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

  const handleToggleSettled = async (member: TripMember) => {
    try {
      await updateMemberSettled(trip.tripId, member.userId, !member.isSettled);
      await loadMembers();
      onMembersChanged();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update settlement status');
    }
  };

  if (loading) {
    return (
      <div className="card">
        <div className="page-loader" role="status" style={{ padding: '1.5rem' }}>
          <Spinner size={24} />
          {t('loadingMembers')}
        </div>
      </div>
    );
  }

  const inviteUrl = `${window.location.origin}/join/${trip.inviteCode}`;

  return (
    <div className="card">
      <h2 className="card-title">
        <Icon name="users" size={22} />
        {t('membersCount', { count: members.length })}
      </h2>

      {/* Invite Code Section */}
      {trip.inviteCode && (
        <div className="invite-box">
          <div className="form-label">{t('inviteLink')}</div>
          <div className="invite-row">
            <code className="invite-code">{inviteUrl}</code>
            <button
              type="button"
              className="btn btn-primary"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(inviteUrl);
                  alert(t('copied'));
                } catch {
                  prompt('Copy this invite link:', inviteUrl);
                }
              }}
              title={t('copyInviteLink')}
            >
              <Icon name="copy" size={16} />
              {t('copy')}
            </button>
            <button
              type="button"
              className="icon-btn"
              onClick={handleRegenerateCode}
              disabled={regenerating}
              title={t('regenerateInviteCode')}
              aria-label={t('regenerateInviteCode')}
            >
              {regenerating ? <Spinner /> : <Icon name="refresh" />}
            </button>
          </div>
          <div className="form-hint">{t('shareLinkToInvite')}</div>
        </div>
      )}

      {/* Add Member Form (owner only) */}
      {isOwner && (
        <form onSubmit={handleAddMember} className="section-block">
          <div className="form-row">
            <div ref={dropdownRef} className="input-with-affix">
              <input
                type="text"
                className="form-input"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                onFocus={() => searchResults.length > 0 && setShowDropdown(true)}
                disabled={adding}
                placeholder={t('searchByNameOrEmail')}
                aria-label={t('searchByNameOrEmail')}
                autoComplete="off"
              />
              {searching && (
                <div className="input-affix">
                  <Spinner size={16} />
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
                      <Avatar name={user.displayName} size="sm" />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="search-dropdown-name">{user.displayName}</div>
                        <div className="search-dropdown-email truncate">{user.email}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              {showDropdown && !searching && searchResults.length === 0 && searchQuery.trim().length >= 2 && (
                <div className="search-dropdown">
                  <div className="search-dropdown-empty">{t('noUsersFound')}</div>
                </div>
              )}
            </div>
            <button type="submit" className="btn btn-primary" disabled={adding || !newEmail.trim()}>
              {adding ? <Spinner /> : <Icon name="user-plus" />}
              {t('invite')}
            </button>
          </div>
          {addError && (
            <div className="alert alert-error" role="alert" style={{ marginTop: '0.75rem', marginBottom: 0 }}>
              <Icon name="alert-circle" />
              <span className="alert-body">{addError}</span>
            </div>
          )}
        </form>
      )}

      {/* Error */}
      {error && (
        <div className="alert alert-error" role="alert">
          <Icon name="alert-circle" />
          <span className="alert-body">{error}</span>
        </div>
      )}

      {/* Members List */}
      {members.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <Icon name="user" size={26} />
          </div>
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
                <th>{t('settled')}</th>
                {isOwner && <th><span className="sr-only">{t('remove')}</span></th>}
              </tr>
            </thead>
            <tbody>
              {members.map((member) => {
                const isMe = member.email === userEmail;
                return (
                  <tr key={member.userId}>
                    <td>
                      {editingUserId === member.userId ? (
                        <div className="inline-edit">
                          <input
                            type="text"
                            className="form-input"
                            value={editDisplayName}
                            onChange={(e) => setEditDisplayName(e.target.value)}
                            disabled={updatingDisplayName}
                            aria-label={t('name')}
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveDisplayName();
                              if (e.key === 'Escape') handleCancelEdit();
                            }}
                          />
                          <button
                            type="button"
                            className="icon-btn"
                            onClick={handleSaveDisplayName}
                            disabled={updatingDisplayName || !editDisplayName.trim()}
                            aria-label={t('save')}
                          >
                            {updatingDisplayName ? <Spinner /> : <Icon name="check" />}
                          </button>
                          <button
                            type="button"
                            className="icon-btn"
                            onClick={handleCancelEdit}
                            disabled={updatingDisplayName}
                            aria-label={t('cancel')}
                          >
                            <Icon name="x" />
                          </button>
                        </div>
                      ) : isMe ? (
                        <button
                          type="button"
                          className="member-name-btn"
                          onClick={() => handleStartEdit(member)}
                          title={t('clickToEdit')}
                        >
                          <strong>{member.displayName}</strong> {t('you')}
                          <Icon name="pencil" size={14} />
                        </button>
                      ) : (
                        <strong>{member.displayName}</strong>
                      )}
                    </td>
                    <td>{member.email}</td>
                    <td>
                      <span className={`badge ${member.role === 'owner' ? 'badge-success' : 'badge-neutral'}`}>
                        {member.role === 'owner' ? t('owner') : t('memberRole')}
                      </span>
                    </td>
                    <td>
                      {member.isSettled ? (
                        <span className="badge badge-success">
                          <Icon name="check" size={12} />
                          {t('settled')}
                        </span>
                      ) : (
                        <span className="badge badge-neutral">{t('unsettled')}</span>
                      )}
                    </td>
                    {isOwner && (
                      <td>
                        {member.role !== 'owner' && (
                          <div className="row-actions">
                            <button
                              type="button"
                              className="link-btn"
                              onClick={() => handleToggleSettled(member)}
                            >
                              {member.isSettled ? t('markUnsettled') : t('markSettled')}
                            </button>
                            <button
                              type="button"
                              className="icon-btn icon-btn-danger"
                              onClick={() => handleRemoveMember(member.userId, member.displayName)}
                              title={t('remove')}
                              aria-label={`${t('remove')}: ${member.displayName}`}
                            >
                              <Icon name="x" />
                            </button>
                          </div>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
