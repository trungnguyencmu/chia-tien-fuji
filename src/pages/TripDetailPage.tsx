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
  CreateExpenseRequest,
  Trip,
} from '../api/api';
import { ExpenseForm } from '../components/ExpenseForm';
import { ExpenseList } from '../components/ExpenseList';
import { Settlement } from '../components/Settlement';
import { TripMembers } from '../components/TripMembers';
import { TripPhotos } from '../components/TripPhotos';
import { TripEditModal } from '../components/TripEditModal';
import { ScanBillModal } from '../components/ScanBillModal';
import { Icon, Spinner } from '../components/ui/Icon';
import { PageLoader } from '../components/ui/PageLoader';
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

  // Scan bill modal state
  const [showScanBillModal, setShowScanBillModal] = useState(false);

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

  // Create settlement status map keyed by userId
  const memberSettledStatus = useMemo(() => {
    const map = new Map<string, boolean>();
    members.forEach((m) => map.set(m.userId, m.isSettled));
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
    return <PageLoader label={t('loadingExpenses')} />;
  }

  return (
    <div>
      {/* Hidden file input for cover */}
      <input
        ref={coverInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/heic"
        onChange={handleCoverUpload}
        className="file-input-hidden"
      />

      <button type="button" className="btn btn-ghost btn-sm back-link" onClick={() => navigate('/app')}>
        <Icon name="arrow-left" size={16} />
        {t('backToTrips')}
      </button>

      {/* Cover image banner */}
      {trip?.imageUrl && (
        <div className="trip-detail-cover">
          <img src={trip.imageUrl} alt="" />
          <div className="trip-detail-cover-actions">
            <button
              type="button"
              onClick={() => coverInputRef.current?.click()}
              disabled={coverUploading}
              className="trip-detail-cover-btn"
              aria-label={t('changeCoverPhoto')}
            >
              <Icon name="camera" size={16} />
              <span>{t('changeCoverPhoto')}</span>
            </button>
            <button
              type="button"
              onClick={handleRemoveCover}
              disabled={coverUploading}
              className="trip-detail-cover-btn trip-detail-cover-btn-danger"
              aria-label={t('removeCoverPhoto')}
            >
              <Icon name="x" size={16} />
              <span>{t('removeCoverPhoto')}</span>
            </button>
          </div>
          {coverUploading && (
            <div className="trip-detail-cover-loading" role="status">
              <Spinner />
              {t('uploadingCover')}
            </div>
          )}
        </div>
      )}

      {/* Trip name + actions */}
      <div className="page-header">
        <h1 className="page-title">{trip?.tripName}</h1>
        <div className="page-actions">
          {/* Add cover button when no cover exists */}
          {trip && !trip.imageUrl && (
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => coverInputRef.current?.click()}
              disabled={coverUploading}
            >
              {coverUploading ? <Spinner size={16} /> : <Icon name="camera" size={16} />}
              {coverUploading ? t('uploadingCover') : t('addCoverPhoto')}
            </button>
          )}
          {/* Edit trip button */}
          {trip && (
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowEditModal(true)}>
              <Icon name="pencil" size={16} />
              {t('editTrip')}
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="alert alert-error" role="alert">
          <Icon name="alert-circle" />
          <div className="alert-body">
            <strong>{t('error')}:</strong> {error}
          </div>
          <button type="button" onClick={handleRetry} className="btn btn-secondary btn-sm">
            <Icon name="refresh" size={16} />
            {t('retry')}
          </button>
        </div>
      )}

      {/* Scan a receipt instead of typing the expense */}
      <button
        type="button"
        className="btn btn-secondary btn-block"
        onClick={() => setShowScanBillModal(true)}
        style={{ marginBottom: '1rem' }}
      >
        <Icon name="scan" />
        {t('scanBill')}
      </button>

      <ExpenseForm members={members} onSubmit={handleAddExpense} />

      <ExpenseList tripId={tripId!} tripName={trip?.tripName} expenses={expenses} members={members} onExpenseDeleted={handleExpenseDeleted} />

      <Settlement expenses={expenses} members={members} memberSettledStatus={memberSettledStatus} />

      {tripId && (
        <TripPhotos tripId={tripId} images={images} onImagesChanged={handleImagesChanged} />
      )}

      {trip && (
        <TripMembers trip={trip} onMembersChanged={handleMembersChanged} />
      )}

      {/* Danger Zone */}
      <div className="card card-danger">
        <h2 className="card-title">
          <Icon name="alert-circle" size={22} />
          {t('dangerZone')}
        </h2>
        <form onSubmit={handleDeleteAllExpenses}>
          <p>{t('permanentlyDeleteAll')}</p>
          <div className="danger-form">
            <input
              type="text"
              className="form-input"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              disabled={deleteLoading}
              placeholder={t('enterPassword')}
              aria-label={t('enterPassword')}
              autoComplete="off"
            />
            <button
              type="submit"
              className="btn btn-danger"
              disabled={deleteLoading || !deletePassword}
            >
              {deleteLoading ? <Spinner /> : <Icon name="trash" />}
              {deleteLoading ? t('deleting') : t('deleteAll')}
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

      {/* Scan Bill Modal */}
      {showScanBillModal && (
        <ScanBillModal
          tripId={tripId!}
          members={members}
          onClose={() => setShowScanBillModal(false)}
          onExpenseCreated={async (expense) => {
            await addExpenseMutation.mutateAsync(expense);
          }}
        />
      )}
    </div>
  );
}
