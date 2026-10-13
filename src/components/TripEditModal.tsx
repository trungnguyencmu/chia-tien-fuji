import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trip, updateTrip } from '../api/api';
import { Icon, Spinner } from './ui/Icon';
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
      const updated = await updateTrip(trip.tripId, {
        tripName: tripName.trim(),
        startDate: startDate || undefined,
        endDate: endDate || undefined,
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
          role="dialog"
          aria-modal="true"
          aria-labelledby="trip-edit-title"
          initial={{ opacity: 0, scale: 0.97, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.97, y: 12 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="card-header">
            <h2 className="card-title" id="trip-edit-title">
              <Icon name="pencil" size={20} />
              {t('editTrip')}
            </h2>
            <button type="button" onClick={onClose} className="icon-btn" aria-label={t('cancel')}>
              <Icon name="x" size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="trip-edit-name">
                {t('tripName')}
              </label>
              <input
                id="trip-edit-name"
                type="text"
                className="form-input"
                value={tripName}
                onChange={(e) => setTripName(e.target.value)}
                disabled={loading}
                placeholder={t('newTripNamePlaceholder')}
                autoFocus
              />
            </div>

            <div className="form-row form-group">
              <div>
                <label className="form-label" htmlFor="trip-edit-start">
                  {t('startDate')}
                </label>
                <input
                  id="trip-edit-start"
                  type="date"
                  className="form-input"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div>
                <label className="form-label" htmlFor="trip-edit-end">
                  {t('endDate')}
                </label>
                <input
                  id="trip-edit-end"
                  type="date"
                  className="form-input"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            {error && (
              <div className="alert alert-error" role="alert">
                <Icon name="alert-circle" />
                <span className="alert-body">{error}</span>
              </div>
            )}

            <div className="modal-actions">
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
                {loading ? <Spinner /> : <Icon name="check" />}
                {t('save')}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
