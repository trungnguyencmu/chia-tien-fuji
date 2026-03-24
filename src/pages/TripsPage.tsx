import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
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
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
        <div style={{ color: 'white', fontSize: '1.25rem', fontWeight: '600' }}>
          {t('loading')}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.5rem',
      }}>
        <h1 style={{
          fontSize: '1.75rem',
          fontWeight: '700',
          color: 'white',
          margin: 0,
          textShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}>
          ✈️ {t('yourTrips')}
        </h1>
        <button
          className="btn btn-primary"
          onClick={() => setShowCreate(!showCreate)}
          style={{ fontSize: '0.9rem' }}
        >
          ➕ {t('createNewTrip')}
        </button>
      </div>

      {/* Status filter buttons */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <button
          className={statusFilter === 'all' ? 'btn btn-primary' : 'btn btn-secondary'}
          onClick={() => setStatusFilter('all')}
          style={{ fontSize: '0.85rem' }}
        >
          {t('allTrips')}
        </button>
        <button
          className={statusFilter === 'active' ? 'btn btn-primary' : 'btn btn-secondary'}
          onClick={() => setStatusFilter('active')}
          style={{ fontSize: '0.85rem' }}
        >
          {t('statusInProgress')}
        </button>
        <button
          className={statusFilter === 'upcoming' ? 'btn btn-primary' : 'btn btn-secondary'}
          onClick={() => setStatusFilter('upcoming')}
          style={{ fontSize: '0.85rem' }}
        >
          {t('statusUpcoming')}
        </button>
        <button
          className={statusFilter === 'settled' ? 'btn btn-primary' : 'btn btn-secondary'}
          onClick={() => setStatusFilter('settled')}
          style={{ fontSize: '0.85rem' }}
        >
          {t('statusSettled')}
        </button>
      </div>

      {/* Create trip form */}
      <AnimatePresence>
        {showCreate && (
          <motion.div
            className="card"
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            style={{ marginBottom: '1.5rem' }}
          >
            <form onSubmit={handleCreate}>
              <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <input
                  type="text"
                  className="form-input"
                  value={newTripName}
                  onChange={(e) => setNewTripName(e.target.value)}
                  disabled={creating}
                  placeholder={t('newTripNamePlaceholder')}
                  style={{ flex: 1 }}
                  autoFocus
                />
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={creating || !newTripName.trim()}
                >
                  {creating ? '⏳' : t('create')}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => { setShowCreate(false); setNewTripName(''); setNewStartDate(''); setNewEndDate(''); removeCover(); }}
                >
                  {t('cancel')}
                </button>
              </div>

              {/* Date inputs */}
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '0.75rem' }}>
                <input
                  type="date"
                  className="form-input"
                  value={newStartDate}
                  onChange={(e) => setNewStartDate(e.target.value)}
                  disabled={creating}
                  style={{ minWidth: '130px' }}
                />
                <span style={{ color: 'var(--gray-500)' }}>-</span>
                <input
                  type="date"
                  className="form-input"
                  value={newEndDate}
                  onChange={(e) => setNewEndDate(e.target.value)}
                  disabled={creating}
                  style={{ minWidth: '130px' }}
                />
              </div>

              {/* Cover photo picker */}
              <input
                ref={coverInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif,image/heic"
                onChange={handleCoverSelect}
                style={{ display: 'none' }}
              />

              {coverPreview ? (
                <div style={{
                  position: 'relative',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  height: '120px',
                }}>
                  <img
                    src={coverPreview}
                    alt="Cover preview"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                  <button
                    type="button"
                    onClick={removeCover}
                    style={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      background: 'rgba(0,0,0,0.6)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '50%',
                      width: '28px',
                      height: '28px',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => coverInputRef.current?.click()}
                  style={{
                    marginTop: '0.75rem',
                    padding: '0.625rem 1rem',
                    background: 'var(--gray-100)',
                    border: '2px dashed var(--gray-300)',
                    borderRadius: '12px',
                    color: 'var(--gray-500)',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    width: '100%',
                    transition: 'all 0.2s',
                  }}
                >
                  📷 {t('addCoverPhoto')}
                </button>
              )}
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty state */}
      {filteredTrips.length === 0 && statusFilter !== 'all' && (
        <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
          <p style={{ color: 'var(--gray-600)' }}>
            {statusFilter === 'upcoming' && t('noTripsYet')}
            {statusFilter === 'active' && t('noTripsYet')}
            {statusFilter === 'settled' && t('noTripsYet')}
          </p>
        </div>
      )}

      {/* Empty state */}
      {filteredTrips.length === 0 && statusFilter === 'all' && (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✈️</div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem', color: 'var(--gray-900)' }}>
            {t('noTripsYet')}
          </h2>
          <p style={{ color: 'var(--gray-600)', marginBottom: '2rem', fontSize: '1.1rem' }}>
            {t('getStartedCreateTrip')}
          </p>
          <button
            className="btn btn-primary"
            onClick={() => setShowCreate(true)}
            style={{ fontSize: '1rem', padding: '1rem 2rem' }}
          >
            ➕ {t('createNewTrip')}
          </button>
        </div>
      )}

      {/* Trip cards grid */}
      {filteredTrips.length > 0 && (
        <div className="trip-card-grid">
          {filteredTrips.map((trip, i) => (
            <motion.div
              key={trip.tripId}
              className="trip-card"
              onClick={() => navigate(`/app/trips/${trip.tripId}`)}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileTap={{ scale: 0.98 }}
              style={trip.imageUrl ? { padding: 0 } : undefined}
            >
              {trip.imageUrl ? (
                <>
                  {/* Cover image */}
                  <div className="trip-card-cover">
                    <img src={trip.imageUrl} alt={trip.tripName} />
                    <button
                      className="trip-card-delete"
                      onClick={(e) => handleDelete(trip.tripId, trip.tripName, e)}
                      title={t('deleteTrip')}
                      style={{ opacity: 0 }}
                    >
                      🗑️
                    </button>
                  </div>
                  <div style={{ padding: '0.75rem 1.25rem 1.25rem' }}>
                    <h3 className="trip-card-name" style={{ marginBottom: '0.5rem' }}>
                      {trip.tripName}
                      <span
                        className={`badge badge-${trip.status === 'upcoming' ? 'info' : trip.status === 'active' ? 'success' : 'neutral'}`}
                        style={{ marginLeft: '0.5rem', fontSize: '0.7rem', verticalAlign: 'middle' }}
                      >
                        {getStatusLabel(trip.status)}
                      </span>
                    </h3>
                    <div className="trip-card-meta">
                      <span>👥 {t('tripMembers', { count: trip.memberCount ?? 0 })}</span>
                      {trip.startDate && trip.endDate && (
                        <span>📅 {formatDateRange(trip.startDate, trip.endDate)}</span>
                      )}
                      {!trip.startDate && (
                        <span>📅 {t('createdOn', { date: formatDate(trip.createdAt) })}</span>
                      )}
                    </div>
                    {getStatusMessage(trip) && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginTop: '0.25rem' }}>
                        {getStatusMessage(trip)}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div className="trip-card-header">
                    <span className="trip-card-emoji">✈️</span>
                    <button
                      className="trip-card-delete"
                      onClick={(e) => handleDelete(trip.tripId, trip.tripName, e)}
                      title={t('deleteTrip')}
                    >
                      🗑️
                    </button>
                  </div>
                  <h3 className="trip-card-name">
                    {trip.tripName}
                    <span
                      className={`badge badge-${trip.status === 'upcoming' ? 'info' : trip.status === 'active' ? 'success' : 'neutral'}`}
                      style={{ marginLeft: '0.5rem', fontSize: '0.7rem', verticalAlign: 'middle' }}
                    >
                      {getStatusLabel(trip.status)}
                    </span>
                  </h3>
                  <div className="trip-card-meta">
                    <span>👥 {t('tripMembers', { count: trip.memberCount ?? 0 })}</span>
                    {trip.startDate && trip.endDate && (
                      <span>📅 {formatDateRange(trip.startDate, trip.endDate)}</span>
                    )}
                    {!trip.startDate && (
                      <span>📅 {t('createdOn', { date: formatDate(trip.createdAt) })}</span>
                    )}
                  </div>
                  {getStatusMessage(trip) && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginTop: '0.25rem' }}>
                      {getStatusMessage(trip)}
                    </div>
                  )}
                </>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
