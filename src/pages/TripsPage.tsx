import { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  fetchTrips,
  createTrip,
  deleteTrip,
  updateTrip,
  getImageUploadUrl,
  saveImage,
  Trip,
} from '../api/api';
import { Icon, Spinner } from '../components/ui/Icon';
import { PageLoader } from '../components/ui/PageLoader';
import { useLanguage } from '../i18n';

export default function TripsPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newTripName, setNewTripName] = useState('');
  const [newStartDate, setNewStartDate] = useState('');
  const [newEndDate, setNewEndDate] = useState('');
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'upcoming' | 'settled'>('all');
  const coverInputRef = useRef<HTMLInputElement>(null);

  const loadTrips = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchTrips();

      // Sort by newest first
      data.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );

      setTrips(data);
    } catch (err) {
      console.error('Failed to load trips:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTrips();
  }, [loadTrips]);

  const handleCoverSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    setCoverFile(file);
    const url = URL.createObjectURL(file);
    setCoverPreview(url);
  };

  const removeCover = () => {
    setCoverFile(null);
    if (coverPreview) URL.revokeObjectURL(coverPreview);
    setCoverPreview(null);
    if (coverInputRef.current) coverInputRef.current.value = '';
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTripName.trim()) return;

    setCreating(true);
    try {
      // 1. Create the trip
      const newTrip = await createTrip(
        newTripName,
        undefined,
        undefined,
        newStartDate || undefined,
        newEndDate || undefined
      );

      // 2. If cover photo selected, upload it
      if (coverFile) {
        try {
          const { uploadUrl, imageId, s3Key } = await getImageUploadUrl(
            newTrip.tripId,
            coverFile.name,
            coverFile.type,
            coverFile.size,
          );

          // Upload to S3
          await fetch(uploadUrl, {
            method: 'PUT',
            headers: { 'Content-Type': coverFile.type },
            body: coverFile,
          });

          // Save image metadata
          await saveImage(newTrip.tripId, {
            imageId,
            fileName: coverFile.name,
            size: coverFile.size,
            contentType: coverFile.type,
          });

          // PATCH trip with the image s3Key
          await updateTrip(newTrip.tripId, { imageS3Key: s3Key });
        } catch (err) {
          console.error('Cover upload failed, trip created without cover:', err);
        }
      }

      // Reset form
      setNewTripName('');
      setNewStartDate('');
      setNewEndDate('');
      removeCover();
      setShowCreate(false);
      navigate(`/app/trips/${newTrip.tripId}`);
    } catch (err) {
      console.error('Failed to create trip:', err);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (tripId: string, tripName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm(`Delete trip "${tripName}"? This cannot be undone.`)) return;

    try {
      await deleteTrip(tripId);
      await loadTrips();
    } catch (err) {
      console.error('Failed to delete trip:', err);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const startStr = start.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    const endStr = end.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    return `${startStr} - ${endStr}`;
  };

  const getStatusLabel = (status: 'active' | 'upcoming' | 'settled') => {
    switch (status) {
      case 'upcoming': return t('statusUpcoming');
      case 'active': return t('statusInProgress');
      case 'settled': return t('statusSettled');
    }
  };

  const getStatusMessage = (trip: Trip): string | null => {
    if (!trip.startDate) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(trip.startDate);

    if (trip.status === 'upcoming') {
      const diffDays = Math.ceil((start.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays > 0) return t('startsInDays', { days: diffDays });
    }
    return null;
  };

  const filteredTrips = trips.filter((trip) => {
    if (statusFilter === 'all') return true;
    return trip.status === statusFilter;
  });

  if (loading) {
    return <PageLoader label={t('loading')} />;
  }

  const filters = [
    { key: 'all', label: t('allTrips') },
    { key: 'active', label: t('statusInProgress') },
    { key: 'upcoming', label: t('statusUpcoming') },
    { key: 'settled', label: t('statusSettled') },
  ] as const;

  const closeCreateForm = () => {
    setShowCreate(false);
    setNewTripName('');
    setNewStartDate('');
    setNewEndDate('');
    removeCover();
  };

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">{t('yourTrips')}</h1>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => setShowCreate(!showCreate)}
          aria-expanded={showCreate}
        >
          <Icon name="plus" />
          {t('createNewTrip')}
        </button>
      </div>

      {/* Status filter */}
      <div className="chip-group" role="group" aria-label={t('allTrips')}>
        {filters.map((filter) => (
          <button
            key={filter.key}
            type="button"
            className="chip"
            aria-pressed={statusFilter === filter.key}
            onClick={() => setStatusFilter(filter.key)}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Create trip form */}
      <AnimatePresence>
        {showCreate && (
          <motion.div
            className="card"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
          >
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label className="form-label" htmlFor="new-trip-name">
                  {t('tripName')}
                </label>
                <input
                  id="new-trip-name"
                  type="text"
                  className="form-input"
                  value={newTripName}
                  onChange={(e) => setNewTripName(e.target.value)}
                  disabled={creating}
                  placeholder={t('newTripNamePlaceholder')}
                  autoFocus
                />
              </div>

              {/* Date inputs */}
              <div className="date-range">
                <input
                  type="date"
                  className="form-input"
                  value={newStartDate}
                  onChange={(e) => setNewStartDate(e.target.value)}
                  disabled={creating}
                  aria-label={t('startDate')}
                />
                <span className="date-range-sep" aria-hidden="true">–</span>
                <input
                  type="date"
                  className="form-input"
                  value={newEndDate}
                  onChange={(e) => setNewEndDate(e.target.value)}
                  disabled={creating}
                  aria-label={t('endDate')}
                />
              </div>

              {/* Cover photo picker */}
              <input
                ref={coverInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif,image/heic"
                onChange={handleCoverSelect}
                className="file-input-hidden"
              />

              {coverPreview ? (
                <div className="cover-preview">
                  <img src={coverPreview} alt="Cover preview" />
                  <button
                    type="button"
                    className="trip-card-delete"
                    onClick={removeCover}
                    aria-label={t('removeCoverPhoto')}
                    title={t('removeCoverPhoto')}
                  >
                    <Icon name="x" size={18} />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  className="dashed-btn"
                  onClick={() => coverInputRef.current?.click()}
                >
                  <Icon name="camera" />
                  {t('addCoverPhoto')}
                </button>
              )}

              <div className="modal-actions" style={{ marginTop: '1.25rem' }}>
                <button type="button" className="btn btn-secondary" onClick={closeCreateForm}>
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={creating || !newTripName.trim()}
                >
                  {creating ? <Spinner /> : <Icon name="check" />}
                  {t('create')}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty state: filter has no matches */}
      {filteredTrips.length === 0 && statusFilter !== 'all' && (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">
              <Icon name="search" size={26} />
            </div>
            <p>{t('noTripsYet')}</p>
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => setStatusFilter('all')}>
              {t('allTrips')}
            </button>
          </div>
        </div>
      )}

      {/* Empty state: no trips at all */}
      {filteredTrips.length === 0 && statusFilter === 'all' && (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon is-success">
              <Icon name="plane" size={26} />
            </div>
            <h2>{t('noTripsYet')}</h2>
            <p>{t('getStartedCreateTrip')}</p>
            {!showCreate && (
              <button type="button" className="btn btn-primary" onClick={() => setShowCreate(true)}>
                <Icon name="plus" />
                {t('createNewTrip')}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Trip cards grid */}
      {filteredTrips.length > 0 && (
        <div className="trip-card-grid">
          {filteredTrips.map((trip, i) => {
            const statusMessage = getStatusMessage(trip);
            const badge = trip.status === 'upcoming' ? 'upcoming' : trip.status === 'active' ? 'success' : 'neutral';
            return (
              <motion.article
                key={trip.tripId}
                className={`trip-card${trip.status === 'upcoming' ? ' trip-card-upcoming' : ''}`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i, 8) * 0.04, duration: 0.2 }}
              >
                <div className={`trip-card-cover${trip.imageUrl ? '' : ' is-empty'}`}>
                  {trip.imageUrl ? (
                    <img src={trip.imageUrl} alt="" loading="lazy" />
                  ) : (
                    <Icon name="plane" size={36} />
                  )}
                  <button
                    type="button"
                    className="trip-card-delete"
                    onClick={(e) => handleDelete(trip.tripId, trip.tripName, e)}
                    title={t('deleteTrip')}
                    aria-label={`${t('deleteTrip')}: ${trip.tripName}`}
                  >
                    <Icon name="trash" size={18} />
                  </button>
                </div>
                <div className="trip-card-body">
                  <div className="trip-card-heading">
                    <h2 className="trip-card-name">
                      <Link to={`/app/trips/${trip.tripId}`} className="trip-card-link">
                        {trip.tripName}
                      </Link>
                    </h2>
                    <span className={`badge badge-${badge}`}>{getStatusLabel(trip.status)}</span>
                  </div>
                  <div className="trip-card-meta">
                    <span>
                      <Icon name="users" size={14} />
                      {t('tripMembers', { count: trip.memberCount ?? 0 })}
                    </span>
                    {trip.startDate && trip.endDate && (
                      <span>
                        <Icon name="calendar" size={14} />
                        {formatDateRange(trip.startDate, trip.endDate)}
                      </span>
                    )}
                    {!trip.startDate && (
                      <span>
                        <Icon name="calendar" size={14} />
                        {t('createdOn', { date: formatDate(trip.createdAt) })}
                      </span>
                    )}
                  </div>
                  {statusMessage && <div className="trip-card-note">{statusMessage}</div>}
                </div>
              </motion.article>
            );
          })}
        </div>
      )}
    </div>
  );
}
