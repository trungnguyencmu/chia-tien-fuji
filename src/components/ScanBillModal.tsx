import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreateExpenseRequest, ScannedBill, getBillUploadUrl, scanBill } from '../api/api';
import { Avatar } from './ui/Avatar';
import { useLanguage } from '../i18n';

interface ScanBillModalProps {
  tripId: string;
  members: string[];
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
        payer,
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
          className="modal-content card"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          style={{ maxWidth: '520px' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>
              📸 {t('scanBill')}
            </h2>
            <button
              onClick={onClose}
              className="btn btn-secondary"
              style={{ padding: '0.5rem', borderRadius: '8px' }}
            >
              ✕
            </button>
          </div>

          {step === 'upload' && (
            <>
              {/* Upload zone */}
              {loading ? (
                <div
                  style={{
                    border: '2px dashed var(--gray-300)',
                    borderRadius: '12px',
                    padding: '3rem 2rem',
                    textAlign: 'center',
                    background: 'var(--gray-50)',
                  }}
                >
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
                  <p style={{ color: 'var(--gray-600)', margin: 0 }}>{t('scanning')}</p>
                </div>
              ) : previewUrl ? (
                <div
                  onClick={() => galleryInputRef.current?.click()}
                  style={{
                    border: '2px dashed var(--gray-300)',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    textAlign: 'center',
                    cursor: 'pointer',
                  }}
                >
                  <img
                    src={previewUrl}
                    alt="Receipt preview"
                    style={{
                      maxWidth: '100%',
                      maxHeight: '200px',
                      borderRadius: '8px',
                      marginBottom: '1rem',
                    }}
                  />
                  <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem', margin: 0 }}>
                    {t('tapToChange')}
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: '1rem' }}>
                  {/* Camera option */}
                  <div
                    onClick={() => cameraInputRef.current?.click()}
                    style={{
                      flex: 1,
                      border: '2px dashed var(--gray-300)',
                      borderRadius: '12px',
                      padding: '2rem 1rem',
                      textAlign: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📷</div>
                    <p style={{ fontWeight: 600, fontSize: '0.9rem', margin: 0 }}>{t('takePhoto')}</p>
                  </div>
                  {/* Gallery option */}
                  <div
                    onClick={() => galleryInputRef.current?.click()}
                    style={{
                      flex: 1,
                      border: '2px dashed var(--gray-300)',
                      borderRadius: '12px',
                      padding: '2rem 1rem',
                      textAlign: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🖼️</div>
                    <p style={{ fontWeight: 600, fontSize: '0.9rem', margin: 0 }}>{t('chooseFromGallery')}</p>
                  </div>
                </div>
              )}
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/heic"
                capture="environment"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />
              <input
                ref={galleryInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/heic"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />

              {error && (
                <div className="alert alert-error" style={{ marginTop: '1rem' }}>
                  ⚠️ {error}
                </div>
              )}

              <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
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
              <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                {previewUrl && (
                  <img
                    src={previewUrl}
                    alt="Receipt"
                    style={{
                      maxWidth: '120px',
                      maxHeight: '120px',
                      borderRadius: '8px',
                      objectFit: 'cover',
                    }}
                  />
                )}
              </div>

              {/* Amount */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.875rem' }}>
                  {t('amount')} ({scannedBill.currency})
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  className="form-input"
                  value={displayAmount}
                  onChange={handleAmountChange}
                  disabled={submitting}
                  placeholder={t('enterAmount')}
                  style={{ fontSize: '1.25rem', textAlign: 'center' }}
                />
              </div>

              {/* Date */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.875rem' }}>
                  {t('date')}
                </label>
                <input
                  type="date"
                  className="form-input"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  disabled={submitting}
                />
              </div>

              {/* Title */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.875rem' }}>
                  {t('whatFor')}
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={submitting}
                  placeholder={t('enterDescription')}
                />
              </div>

              {/* Payer */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: 600, fontSize: '0.875rem' }}>
                  {t('whoPaid')}
                </label>
                <div className="avatar-picker" style={{ flexWrap: 'wrap' }}>
                  {members.map((name) => (
                    <motion.button
                      key={name}
                      type="button"
                      className={`avatar-picker-item ${payer === name ? 'selected' : ''}`}
                      onClick={() => setPayer(name)}
                      whileTap={{ scale: 0.95 }}
                      disabled={submitting}
                    >
                      <Avatar name={name} size="lg" />
                      <span className="avatar-picker-name">{name.split(' ')[0]}</span>
                    </motion.button>
                  ))}
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
                  onClick={() => setStep('upload')}
                  disabled={submitting}
                >
                  ← {t('rescan')}
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting || !payer || !amount || !title.trim() || !date}
                >
                  {submitting ? '⏳' : '💸'} {t('createExpense')}
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
