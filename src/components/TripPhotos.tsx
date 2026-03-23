import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TripImage,
  getImageUploadUrl,
  saveImage,
  deleteImage,
} from '../api/api';
import { useLanguage } from '../i18n';

interface TripPhotosProps {
  tripId: string;
  images: TripImage[];
  onImagesChanged: () => void;
}

export function TripPhotos({ tripId, images, onImagesChanged }: TripPhotosProps) {
  const { t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<TripImage | null>(null);
  const [error, setError] = useState<string | null>(null);

  const uploadFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) return;

    setUploading(true);
    setUploadProgress(10);
    setError(null);

    try {
      // 1. Get presigned upload URL
      const { uploadUrl, imageId } = await getImageUploadUrl(
        tripId,
        file.name,
        file.type,
        file.size,
      );
      setUploadProgress(30);

      // 2. Upload to S3 via presigned URL
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      });

      if (!uploadResponse.ok) {
        throw new Error('Upload failed');
      }
      setUploadProgress(70);

      // 3. Save image metadata to backend
      await saveImage(tripId, {
        imageId,
        fileName: file.name,
        size: file.size,
        contentType: file.type,
      });
      setUploadProgress(100);

      // 4. Reload images
      onImagesChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  }, [tripId, onImagesChanged]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      uploadFile(files[0]);
    }
    // Reset input so same file can be re-selected
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      uploadFile(files[0]);
    }
  };

  const handleDelete = async (imageId: string) => {
    if (!window.confirm(t('deletePhotoConfirm'))) return;
    try {
      await deleteImage(tripId, imageId);
      setLightboxImage(null);
      onImagesChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="card">
      <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.25rem' }}>
        📸 {t('tripPhotos')}
      </h2>

      {/* Upload zone */}
      <div
        className={`photo-upload-zone ${dragOver ? 'drag-over' : ''}`}
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        <div className="photo-upload-zone-icon">📷</div>
        <div className="photo-upload-zone-text">{t('dragOrTap')}</div>
        <div className="photo-upload-zone-hint">JPG, PNG, HEIC</div>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            className="alert alert-error"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            style={{ marginTop: '0.75rem' }}
          >
            <span>⚠️</span>
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Photo grid */}
      {(images.length > 0 || uploading) && (
        <div className="photo-grid">
          {/* Upload progress placeholder */}
          {uploading && (
            <div className="photo-upload-progress">
              <div className="photo-upload-progress-text">
                {t('uploading')}
              </div>
              <div className="photo-upload-progress-bar">
                <div
                  className="photo-upload-progress-fill"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {images.map((image) => (
            <motion.div
              key={image.imageId}
              className="photo-grid-item"
              onClick={() => setLightboxImage(image)}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
            >
              <img
                src={image.url}
                alt={image.fileName}
                loading="lazy"
              />
              <div className="photo-grid-item-overlay">
                {image.uploaderDisplayName} • {formatDate(image.createdAt)}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {images.length === 0 && !uploading && (
        <div className="empty-state" style={{ padding: '2rem' }}>
          <div className="empty-state-icon">🏞️</div>
          <h3>{t('noPhotosYet')}</h3>
          <p style={{ color: 'var(--gray-600)', fontSize: '0.9rem' }}>
            {t('addFirstPhoto')}
          </p>
        </div>
      )}

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxImage && (
          <motion.div
            className="photo-lightbox"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightboxImage(null)}
          >
            <button
              className="photo-lightbox-close"
              onClick={(e) => { e.stopPropagation(); setLightboxImage(null); }}
            >
              ✕
            </button>
            <motion.img
              src={lightboxImage.url}
              alt={lightboxImage.fileName}
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
            />
            <div className="photo-lightbox-info">
              {lightboxImage.uploaderDisplayName} • {formatDate(lightboxImage.createdAt)}
            </div>
            <div className="photo-lightbox-actions">
              <button
                className="btn btn-danger"
                style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(lightboxImage.imageId);
                }}
              >
                🗑️ {t('deletePhoto')}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
