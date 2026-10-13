import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TripImage,
  getImageUploadUrl,
  saveImage,
  deleteImage,
} from '../api/api';
import { Icon } from './ui/Icon';
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
      <h2 className="card-title">
        <Icon name="image" size={22} />
        {t('tripPhotos')}
      </h2>

      {/* Upload zone */}
      <button
        type="button"
        className={`photo-upload-zone ${dragOver ? 'drag-over' : ''}`}
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        disabled={uploading}
      >
        <span className="photo-upload-zone-icon">
          <Icon name="camera" size={28} />
        </span>
        <span className="photo-upload-zone-text">{t('dragOrTap')}</span>
        <span className="photo-upload-zone-hint">JPG, PNG, HEIC</span>
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="file-input-hidden"
        tabIndex={-1}
      />

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            className="alert alert-error"
            role="alert"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            style={{ marginTop: '0.75rem' }}
          >
            <Icon name="alert-circle" />
            <span className="alert-body">{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Photo grid */}
      {(images.length > 0 || uploading) && (
        <div className="photo-grid">
          {/* Upload progress placeholder */}
          {uploading && (
            <div className="photo-upload-progress" role="status">
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
            <motion.button
              key={image.imageId}
              type="button"
              className="photo-grid-item"
              onClick={() => setLightboxImage(image)}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
            >
              <img
                src={image.url}
                alt={image.fileName}
                loading="lazy"
              />
              <span className="photo-grid-item-overlay">
                {image.uploaderDisplayName} · {formatDate(image.createdAt)}
              </span>
            </motion.button>
          ))}
        </div>
      )}

      {/* Empty state */}
      {images.length === 0 && !uploading && (
        <div className="empty-state">
          <div className="empty-state-icon">
            <Icon name="image" size={26} />
          </div>
          <h3>{t('noPhotosYet')}</h3>
          <p>{t('addFirstPhoto')}</p>
        </div>
      )}

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxImage && (
          <motion.div
            className="photo-lightbox"
            role="dialog"
            aria-modal="true"
            aria-label={lightboxImage.fileName}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightboxImage(null)}
          >
            <button
              type="button"
              className="photo-lightbox-close"
              onClick={(e) => { e.stopPropagation(); setLightboxImage(null); }}
              aria-label={t('cancel')}
            >
              <Icon name="x" size={22} />
            </button>
            <motion.img
              src={lightboxImage.url}
              alt={lightboxImage.fileName}
              initial={{ scale: 0.96 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.96 }}
              onClick={(e) => e.stopPropagation()}
            />
            <div className="photo-lightbox-info">
              {lightboxImage.uploaderDisplayName} · {formatDate(lightboxImage.createdAt)}
            </div>
            <div className="photo-lightbox-actions">
              <button
                type="button"
                className="btn btn-danger btn-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(lightboxImage.imageId);
                }}
              >
                <Icon name="trash" size={16} />
                {t('deletePhoto')}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
