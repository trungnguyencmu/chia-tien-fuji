import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreateExpenseRequest, ScannedBill, TripMember, getBillUploadUrl, scanBill } from '../api/api';
import { Avatar } from './ui/Avatar';
import { Icon, Spinner } from './ui/Icon';
import { useLanguage } from '../i18n';

interface ScanBillModalProps {
  tripId: string;
  members: TripMember[];
  onClose: () => void;
  onExpenseCreated: (expense: CreateExpenseRequest) => Promise<void>;
}

export function ScanBillModal({ tripId, members, onClose, onExpenseCreated }: ScanBillModalProps) {
  const { t } = useLanguage();
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<'upload' | 'review'>('upload');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scannedBill, setScannedBill] = useState<ScannedBill | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Form fields
  const [payer, setPayer] = useState('');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [displayAmount, setDisplayAmount] = useState('');
  const [date, setDate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    e.target.value = '';

    setError(null);
    setLoading(true);
    setPreviewUrl(URL.createObjectURL(file));

    try {
      // 1. Get presigned URL for bill
      const { uploadUrl, s3Key } = await getBillUploadUrl(
        tripId,
        file.name,
        file.type,
      );

      // 2. Upload to S3
      await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      });

      // 3. Scan the bill
      const bill = await scanBill(tripId, s3Key);
      setScannedBill(bill);
      setAmount(bill.totalAmount.toString());
      setDisplayAmount(bill.totalAmount.toLocaleString());
      setDate(bill.billDate);
      setStep('review');
    } catch (err) {
      setError(err instanceof Error ? err.message : t('scanBillFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nums = e.target.value.replace(/\D/g, '');
    setAmount(nums);
    setDisplayAmount(nums ? Number(nums).toLocaleString() : '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!payer || !amount || !title.trim() || !date) {
      setError(t('pleaseFillAllFields'));
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setError(t('pleaseEnterValidAmount'));
      return;
    }

    setSubmitting(true);
    try {
      await onExpenseCreated({
        payerUserId: payer,
        title: title.trim(),
        amount: amountNum,
        date,
        billId: scannedBill?.billId,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('failedToAddExpense'));
    } finally {
      setSubmitting(false);
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
          className="modal-content modal-wide card"
          role="dialog"
          aria-modal="true"
          aria-labelledby="scan-bill-title"
          initial={{ opacity: 0, scale: 0.97, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.97, y: 12 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="card-header">
            <h2 className="card-title" id="scan-bill-title">
              <Icon name="scan" size={20} />
              {t('scanBill')}
            </h2>
            <button type="button" onClick={onClose} className="icon-btn" aria-label={t('cancel')}>
              <Icon name="x" size={20} />
            </button>
          </div>

          {step === 'upload' && (
            <>
              {/* Upload zone */}
              {loading ? (
                <div className="upload-option is-static" role="status">
                  <Spinner size={32} />
                  {t('scanning')}
                </div>
              ) : previewUrl ? (
                <button
                  type="button"
                  className="upload-option"
                  style={{ width: '100%' }}
                  onClick={() => galleryInputRef.current?.click()}
                >
                  <img src={previewUrl} alt="Receipt preview" />
                  <span className="upload-option-hint">{t('tapToChange')}</span>
                </button>
              ) : (
                <div className="upload-options">
                  {/* Camera option */}
                  <button
                    type="button"
                    className="upload-option"
                    onClick={() => cameraInputRef.current?.click()}
                  >
                    <Icon name="camera" size={32} />
                    {t('takePhoto')}
                  </button>
                  {/* Gallery option */}
                  <button
                    type="button"
                    className="upload-option"
                    onClick={() => galleryInputRef.current?.click()}
                  >
                    <Icon name="image" size={32} />
                    {t('chooseFromGallery')}
                  </button>
                </div>
              )}
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/heic"
                capture="environment"
                onChange={handleFileSelect}
                className="file-input-hidden"
              />
              <input
                ref={galleryInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/heic"
                onChange={handleFileSelect}
                className="file-input-hidden"
              />

              {error && (
                <div className="alert alert-error" role="alert" style={{ marginTop: '1rem', marginBottom: 0 }}>
                  <Icon name="alert-circle" />
                  <span className="alert-body">{error}</span>
                </div>
              )}

              <div className="modal-actions" style={{ marginTop: '1.5rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={onClose}
                >
                  {t('cancel')}
                </button>
              </div>
            </>
          )}

          {step === 'review' && scannedBill && (
            <form onSubmit={handleSubmit}>
              {/* Scanned preview */}
              {previewUrl && (
                <img src={previewUrl} alt="Receipt" className="receipt-thumb" />
              )}

              {/* Amount */}
              <div className="form-group">
                <label className="form-label" htmlFor="scan-bill-amount">
                  {t('amount')} ({scannedBill.currency})
                </label>
                <input
                  id="scan-bill-amount"
                  type="text"
                  inputMode="numeric"
                  className="form-input amount-input-lg"
                  value={displayAmount}
                  onChange={handleAmountChange}
                  disabled={submitting}
                  placeholder={t('enterAmount')}
                />
              </div>

              {/* Date */}
              <div className="form-group">
                <label className="form-label" htmlFor="scan-bill-date">
                  {t('date')}
                </label>
                <input
                  id="scan-bill-date"
                  type="date"
                  className="form-input"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  disabled={submitting}
                />
              </div>

              {/* Title */}
              <div className="form-group">
                <label className="form-label" htmlFor="scan-bill-title-input">
                  {t('whatFor')}
                </label>
                <input
                  id="scan-bill-title-input"
                  type="text"
                  className="form-input"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={submitting}
                  placeholder={t('enterDescription')}
                />
              </div>

              {/* Payer */}
              <div className="section-block">
                <div className="form-label">{t('whoPaid')}</div>
                <div className="avatar-picker">
                  {members.map((m) => (
                    <motion.button
                      key={m.userId}
                      type="button"
                      className={`avatar-picker-item ${payer === m.userId ? 'selected' : ''}`}
                      onClick={() => setPayer(m.userId)}
                      aria-pressed={payer === m.userId}
                      whileTap={{ scale: 0.97 }}
                      disabled={submitting}
                    >
                      <Avatar name={m.displayName} size="lg" />
                      <span className="avatar-picker-name">{m.displayName.split(' ')[0]}</span>
                    </motion.button>
                  ))}
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
                  onClick={() => setStep('upload')}
                  disabled={submitting}
                >
                  <Icon name="arrow-left" />
                  {t('rescan')}
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting || !payer || !amount || !title.trim() || !date}
                >
                  {submitting ? <Spinner /> : <Icon name="plus" />}
                  {t('createExpense')}
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
