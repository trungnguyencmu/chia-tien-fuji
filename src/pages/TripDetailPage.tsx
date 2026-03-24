import { useState, useCallback, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchCurrentTrip,
  fetchExpenses,
  fetchTripMembers,
  fetchImages,
  createExpense,
  deleteAllExpenses,
  updateTrip,
  getImageUploadUrl,
  saveImage,
  TripMember,
  CreateExpenseRequest,
  Trip,
} from '../api/api';
import { ExpenseForm } from '../components/ExpenseForm';
import { ExpenseList } from '../components/ExpenseList';
import { Settlement } from '../components/Settlement';
import { TripMembers } from '../components/TripMembers';
import { TripPhotos } from '../components/TripPhotos';
import { TripEditModal } from '../components/TripEditModal';
import { useLanguage } from '../i18n';

export default function TripDetailPage() {
  const { tripId } = useParams<{ tripId: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const queryClient = useQueryClient();

  // Cover image state
  const coverInputRef = useRef<HTMLInputElement>(null);
  const [coverUploading, setCoverUploading] = useState(false);

  // Delete all expenses state
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Edit trip modal state
  const [showEditModal, setShowEditModal] = useState(false);

  // Queries
  const { data: trip, isLoading: tripLoading, error: tripError } = useQuery({
    queryKey: ['trip', tripId],
    queryFn: () => fetchCurrentTrip(tripId!),
    enabled: !!tripId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const { data: expenses = [], isLoading: expensesLoading } = useQuery({
    queryKey: ['expenses', tripId],
    queryFn: () => fetchExpenses(tripId!),
    enabled: !!tripId,
    staleTime: 60 * 1000, // 1 minute
  });

  const { data: members = [] } = useQuery({
    queryKey: ['members', tripId],
    queryFn: () => fetchTripMembers(tripId!),
    enabled: !!tripId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  const { data: images = [] } = useQuery({
    queryKey: ['images', tripId],
    queryFn: () => fetchImages(tripId!),
    enabled: !!tripId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  const memberNames = useMemo(() => members.map((m: TripMember) => m.displayName), [members]);

  // Create settlement status map from members data
  const memberSettledStatus = useMemo(() => {
    const map = new Map<string, boolean>();
    members.forEach((m) => map.set(m.displayName, m.isSettled));
    return map;
  }, [members]);

  const loading = tripLoading || expensesLoading;
  const error = tripError?.message || null;

  // Mutations
  const addExpenseMutation = useMutation({
    mutationFn: (expense: CreateExpenseRequest) => createExpense(tripId!, expense),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses', tripId] });
    },
  });

  const handleAddExpense = async (expense: CreateExpenseRequest) => {
    if (!tripId) throw new Error('No trip selected');
    await addExpenseMutation.mutateAsync(expense);
  };

  const handleDeleteAllExpenses = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tripId || !deletePassword) return;

    if (!window.confirm(t('permanentlyDeleteAll'))) return;

    setDeleteLoading(true);
    try {
      await deleteAllExpenses(tripId, deletePassword);
      setDeletePassword('');
      queryClient.invalidateQueries({ queryKey: ['expenses', tripId] });
    } catch (err) {
      console.error('Failed to delete expenses:', err);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/') || !tripId) return;
    e.target.value = '';

    setCoverUploading(true);
    try {
      const { uploadUrl, imageId, s3Key } = await getImageUploadUrl(
        tripId, file.name, file.type, file.size,
      );

      await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      });

      await saveImage(tripId, {
        imageId,
        fileName: file.name,
        size: file.size,
        contentType: file.type,
      });

      await updateTrip(tripId, { imageS3Key: s3Key });

      // Invalidate trip query to refetch with new imageUrl
      queryClient.invalidateQueries({ queryKey: ['trip', tripId] });
    } catch (err) {
      console.error('Failed to upload cover:', err);
    } finally {
      setCoverUploading(false);
    }
  };

  const handleRemoveCover = async () => {
    if (!tripId) return;
    setCoverUploading(true);
    try {
      await updateTrip(tripId, { imageS3Key: '' });
      queryClient.invalidateQueries({ queryKey: ['trip', tripId] });
    } catch (err) {
      console.error('Failed to remove cover:', err);
    } finally {
      setCoverUploading(false);
    }
  };

  // Invalidation callbacks for child components
  const handleExpenseDeleted = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['expenses', tripId] });
  }, [queryClient, tripId]);

  const handleMembersChanged = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['members', tripId] });
  }, [queryClient, tripId]);

  const handleImagesChanged = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['images', tripId] });
  }, [queryClient, tripId]);

  const handleRetry = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['trip', tripId] });
  }, [queryClient, tripId]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
        <div style={{ color: 'white', fontSize: '1.25rem', fontWeight: '600' }}>
          {t('loadingExpenses')}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Hidden file input for cover */}
      <input
        ref={coverInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/heic"
        onChange={handleCoverUpload}
        style={{ display: 'none' }}
      />

      {/* Cover image banner */}
      {trip?.imageUrl && (
        <div className="trip-detail-cover">
          <img src={trip.imageUrl} alt={trip.tripName} />
          <div className="trip-detail-cover-overlay" />
          <div className="trip-detail-cover-actions">
            <button
              onClick={() => coverInputRef.current?.click()}
              disabled={coverUploading}
              className="trip-detail-cover-btn"
            >
              📷 {t('changeCoverPhoto')}
            </button>
            <button
              onClick={handleRemoveCover}
              disabled={coverUploading}
              className="trip-detail-cover-btn trip-detail-cover-btn-danger"
            >
              ✕ {t('removeCoverPhoto')}
            </button>
          </div>
          {coverUploading && (
            <div className="trip-detail-cover-loading">
              ⏳ {t('uploadingCover')}
            </div>
          )}
        </div>
      )}

      {/* Back button + Trip name */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        marginBottom: '1.5rem',
      }}>
        <button
          onClick={() => navigate('/app')}
          style={{
            padding: '0.625rem 1rem',
            borderRadius: '12px',
            background: 'rgba(255,255,255,0.2)',
            color: 'white',
            border: '1px solid rgba(255,255,255,0.3)',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: '600',
            transition: 'all 0.2s',
            backdropFilter: 'blur(4px)',
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.35)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
          }}
        >
          ← {t('backToTrips')}
        </button>
        <h1 style={{
          fontSize: '1.5rem',
          fontWeight: '700',
          color: 'white',
          margin: 0,
          textShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}>
          ✈️ {trip?.tripName}
        </h1>
        {/* Add cover button when no cover exists */}
        {trip && !trip.imageUrl && (
          <button
            onClick={() => coverInputRef.current?.click()}
            disabled={coverUploading}
            style={{
              marginLeft: 'auto',
              padding: '0.5rem 0.75rem',
              borderRadius: '10px',
              background: 'rgba(255,255,255,0.2)',
              color: 'white',
              border: '1px solid rgba(255,255,255,0.3)',
              cursor: coverUploading ? 'not-allowed' : 'pointer',
              fontSize: '0.8rem',
              fontWeight: '600',
              transition: 'all 0.2s',
              backdropFilter: 'blur(4px)',
              opacity: coverUploading ? 0.6 : 1,
            }}
          >
            {coverUploading ? '⏳' : '📷'} {coverUploading ? t('uploadingCover') : t('addCoverPhoto')}
          </button>
        )}
        {/* Edit trip button */}
        {trip && (
          <button
            onClick={() => setShowEditModal(true)}
            style={{
              marginLeft: '0.5rem',
              padding: '0.5rem 0.75rem',
              borderRadius: '10px',
              background: 'rgba(255,255,255,0.2)',
              color: 'white',
              border: '1px solid rgba(255,255,255,0.3)',
              cursor: 'pointer',
              fontSize: '0.8rem',
              fontWeight: '600',
              transition: 'all 0.2s',
              backdropFilter: 'blur(4px)',
            }}
          >
            ✏️ {t('editTrip')}
          </button>
        )}
      </div>

      {error && (
        <div className="alert alert-error">
          <span style={{ fontSize: '1.5rem' }}>⚠️</span>
          <div style={{ flex: 1 }}>
            <strong>{t('error')}:</strong> {error}
          </div>
          <button onClick={handleRetry} className="btn btn-primary">
            {t('retry')}
          </button>
        </div>
      )}

      <ExpenseForm members={memberNames} onSubmit={handleAddExpense} />

      <ExpenseList tripId={tripId!} expenses={expenses} members={memberNames} onExpenseDeleted={handleExpenseDeleted} />

      <Settlement expenses={expenses} payerNames={memberNames} memberSettledStatus={memberSettledStatus} />

      {tripId && (
        <TripPhotos tripId={tripId} images={images} onImagesChanged={handleImagesChanged} />
      )}

      {trip && (
        <TripMembers trip={trip} onMembersChanged={handleMembersChanged} />
      )}

      {/* Danger Zone */}
      <div className="card" style={{ background: '#fef2f2', border: '2px solid #fca5a5' }}>
        <h2 style={{ marginBottom: '1rem', fontSize: '1.25rem', fontWeight: '700', color: '#991b1b' }}>
          🗑️ {t('dangerZone')}
        </h2>
        <form onSubmit={handleDeleteAllExpenses}>
          <p style={{ color: '#991b1b', fontSize: '0.875rem', marginBottom: '0.75rem' }}>
            {t('permanentlyDeleteAll')}
          </p>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <input
              type="text"
              className="form-input"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              disabled={deleteLoading}
              placeholder={t('enterPassword')}
              style={{ flex: 1 }}
            />
            <button
              type="submit"
              disabled={deleteLoading || !deletePassword}
              style={{
                padding: '0.75rem 1.5rem',
                background: '#dc2626',
                color: 'white',
                borderRadius: '8px',
                fontWeight: '600',
                fontSize: '0.875rem',
                border: 'none',
                cursor: deleteLoading ? 'not-allowed' : 'pointer',
                opacity: deleteLoading ? 0.6 : 1,
              }}
            >
              {deleteLoading ? '⏳ ' + t('deleting') : '🗑️ ' + t('deleteAll')}
            </button>
          </div>
        </form>
      </div>

      {/* Edit Trip Modal */}
      {showEditModal && trip && (
        <TripEditModal
          trip={trip}
          onClose={() => setShowEditModal(false)}
          onTripUpdated={(updated: Trip) => {
            queryClient.setQueryData(['trip', tripId], updated);
          }}
        />
      )}
    </div>
  );
}
