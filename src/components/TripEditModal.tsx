import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trip, updateTrip } from '../api/api';
import { useLanguage } from '../i18n';

interface TripEditModalProps {
  trip: Trip;
  onClose: () => void;
  onTripUpdated: (updated: Trip) => void;
}

export function TripEditModal({ trip, onClose, onTripUpdated }: TripEditModalProps) {
  const { t } = useLanguage();
  const [tripName, setTripName] = useState(trip.tripName);
  const [startDate, setStartDate] = useState(trip.startDate || '');
  const [endDate, setEndDate] = useState(trip.endDate || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tripName.trim()) {
      setError(t('pleaseFillAllFields'));
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const status: 'active' | 'upcoming' | 'settled' = (() => {
        if (startDate) {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const start = new Date(startDate);
          if (start > today) return 'upcoming';
        }
        return 'active';
      })();
      const updated = await updateTrip(trip.tripId, {
        tripName: tripName.trim(),
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        status,
      });
      onTripUpdated(updated);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('failedToUpdateTrip'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="modal-content card"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>
              ✏️ {t('editTrip')}
            </h2>
            <button
              onClick={onClose}
              className="btn btn-secondary"
              style={{ padding: '0.5rem', borderRadius: '8px' }}
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.875rem' }}>
                {t('tripName')}
              </label>
              <input
                type="text"
                className="form-input"
                value={tripName}
                onChange={(e) => setTripName(e.target.value)}
                disabled={loading}
                placeholder={t('newTripNamePlaceholder')}
                autoFocus
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.875rem' }}>
                  {t('startDate')}
                </label>
                <input
                  type="date"
                  className="form-input"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.875rem' }}>
                  {t('endDate')}
                </label>
                <input
                  type="date"
                  className="form-input"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            {error && (
              <div className="alert alert-error" style={{ marginBottom: '1rem' }}>
                ⚠️ {error}
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
                disabled={loading}
              >
                {t('cancel')}
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading || !tripName.trim()}
              >
                {loading ? '⏳' : '💾'} {t('save')}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
