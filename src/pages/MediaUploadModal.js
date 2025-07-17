import React, { useState } from 'react';
import './MediaUploadModal.css';

const MediaUploadModal = ({ isOpen, onClose, onMediaAdd }) => {
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaType, setMediaType] = useState('image');
  const [isValidUrl, setIsValidUrl] = useState(true);

  const validateUrl = (url) => {
    if (!url) return true;
    try {
      new URL(url);
      if (mediaType === 'image') {
        
        return /\.(jpeg|jpg|png|gif|webp|svg)$/i.test(url);
      } else if (mediaType === 'video') {
        return /\.(mp4|webm|ogg|avi|mov)$/i.test(url);
      }
      return true;
    } catch {
      return false;
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setMediaUrl(value);
    setIsValidUrl(validateUrl(value));
  };

  const handleSubmit = () => {
    if (mediaUrl && isValidUrl) {
      onMediaAdd(mediaUrl, mediaType);
      resetModal();
    }
  };

  const resetModal = () => {
    setMediaUrl('');
    setMediaType('image');
    setIsValidUrl(true);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>הוספת {mediaType === 'image' ? 'תמונה' : 'וידאו'}</h2>
          <button className="modal-close" onClick={resetModal}>×</button>
        </div>

        <div className="modal-body">
          <div className="media-type-selector">
            <button
              className={`type-btn ${mediaType === 'image' ? 'active' : ''}`}
              onClick={() => setMediaType('image')}
            >
              📷 תמונה
            </button>
            <button
              className={`type-btn ${mediaType === 'video' ? 'active' : ''}`}
              onClick={() => setMediaType('video')}
            >
              🎬 וידאו
            </button>
          </div>

          <div className="input-group">
            <input
              type="url"
              dir="ltr"
              className={`media-input ${!isValidUrl ? 'error' : ''}`}
              placeholder={
                mediaType === 'image'
                  ? 'https://example.com/image.jpg'
                  : 'https://example.com/video.mp4'
              }
              value={mediaUrl}
              onChange={handleInputChange}
            />
            {!isValidUrl && (
              <span className="error-message">
                הקישור לא תקין עבור {mediaType === 'image' ? 'תמונה' : 'וידאו'}
              </span>
            )}
            <div className="input-hint">
              {mediaType === 'image'
                ? 'פורמטים נתמכים: jpg, png, gif...'
                : 'פורמטים נתמכים: mp4, avi...'}
            </div>
          </div>

          {mediaUrl && isValidUrl && (
            <div className="preview-section">
              <h3>תצוגה מקדימה:</h3>
              {mediaType === 'image' ? (
                <img
                  src={mediaUrl}
                  alt="Preview"
                  className="preview-image"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    setIsValidUrl(false);
                  }}
                />
              ) : (
                <video
                  src={mediaUrl}
                  controls
                  className="preview-video"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    setIsValidUrl(false);
                  }}
                />
              )}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn-cancel" onClick={resetModal}>
            ביטול
          </button>
          <button
            className="btn-submit"
            onClick={handleSubmit}
            disabled={!mediaUrl || !isValidUrl}
          >
            הוסף
          </button>
        </div>
      </div>
    </div>
  );
};

export default MediaUploadModal;
