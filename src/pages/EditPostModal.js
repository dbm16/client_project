import React, { useState, useEffect } from 'react';
import './EditPostModal.css';

const EditPostModal = ({ isOpen, onClose, onPostUpdated, post }) => {
  const [postForm, setPostForm] = useState({ // based post model
    content: '',
    imageUrl: ''
  });

  const [loading, setLoading] = useState(false); // validation for disable btn
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (post) {
      setPostForm({
        content: post.content || '',
        imageUrl: post.imageUrl || ''
      });
    }
  }, [post]);

  const updateField = (e) => {
    const { name, value } = e.target;
    setPostForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!postForm.content.trim()) {
      setErrorMsg('תוכן הפוסט חובה');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/posts/${post._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(postForm)
      });

      if (response.ok) {
        const updated = await response.json();
        onPostUpdated(updated.post);
        onClose();
      } else {
        const err = await response.json();
        setErrorMsg(err.message || 'שגיאה בעדכון הפוסט');
      }
    } catch {
      setErrorMsg('שגיאה בחיבור לשרת');
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setErrorMsg('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay-gp" onClick={closeModal}>
      <div className="modal-content-gp" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header-gp">
          <h2>ערוך פוסט</h2>
          <button className="close-btn" onClick={closeModal}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="edit-post-form">
          <div className="form-group">
            <label htmlFor="content">תוכן הפוסט</label>
            <textarea
              id="content"
              name="content"
              value={postForm.content}
              onChange={updateField}
              placeholder="מה תרצה לשתף איתנו?"
              rows="5"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="imageUrl">כתובת תמונה (אופציונלי)</label>
            <input
              type="url"
              id="imageUrl"
              name="imageUrl"
              value={postForm.imageUrl}
              onChange={updateField}
              placeholder="הזן קישור לתמונה..."
            />
            {postForm.imageUrl && (
              <div className="image-preview">
                <img src={postForm.imageUrl} alt="Preview" />
              </div>
            )}
          </div>

          {errorMsg && (
            <div className="error-message">{errorMsg}</div>
          )}

          <div className="form-actions">
            <button
              type="button"
              className="cancel-btn"
              onClick={closeModal}
              disabled={loading}
            >
              ביטול
            </button>
            <button
              type="submit"
              className="submit-btn"
              disabled={loading}
            >
              {loading ? 'מעדכן פוסט...' : 'עדכן פוסט'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPostModal;
