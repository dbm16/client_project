import React, { useState } from 'react';
import './CreateGroupModal.css';

const CreateGroupModal = ({ isOpen, onClose, onGroupCreated }) => {

  const [groupDetails, setGroupDetails] = useState({  // define the object based group model
    name: '',
    description: '',
    isPrivate: false,  // private as default
    imageUrl: ''
  });

  const [saving, setSaving] = useState(false); // validation for disable btn
  const [formError, setFormError] = useState(''); // form msg error

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setGroupDetails(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!groupDetails.name.trim() || !groupDetails.description.trim() || !groupDetails.imageUrl.trim()) {
      setFormError('כל השדות חובה');
      return;
    }

    setSaving(true);
    setFormError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/groups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(groupDetails)
      });

      if (response.ok) {
        const data = await response.json();
        onGroupCreated(data.group);
        setGroupDetails({
          name: '',
          description: '',
          isPrivate: false,
          imageUrl: ''
        });
        onClose();
      } else {
        const errorData = await response.json();
        setFormError(errorData.message || 'שגיאה ביצירת הקבוצה');
      }
    } catch (err) {
      setFormError('שגיאה בחיבור לשרת');
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>צור קבוצה חדשה</h2>
          <button className="close-btn" onClick={handleClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="create-group-form">
          <div className="form-group">
            <label htmlFor="name">שם הקבוצה</label>
            <input
              type="text"
              id="name"
              name="name"
              value={groupDetails.name}
              onChange={handleInputChange}
              placeholder="הזן שם לקבוצה..."
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">תיאור הקבוצה</label>
            <textarea
              id="description"
              name="description"
              value={groupDetails.description}
              onChange={handleInputChange}
              placeholder="תאר את הקבוצה שלך..."
              rows="4"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="imageUrl">כתובת תמונה</label>
            <input
              type="url"
              id="imageUrl"
              name="imageUrl"
              value={groupDetails.imageUrl}
              onChange={handleInputChange}
              placeholder="הזן קישור לתמונה..."
              required
            />
            {groupDetails.imageUrl && (
              <div className="image-preview">
                <img src={groupDetails.imageUrl} alt="Group Preview" />
              </div>
            )}
          </div>

          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="isPrivate"
                checked={groupDetails.isPrivate}
                onChange={handleInputChange}
              />
              <span className="checkbox-text">
                🔒 קבוצה פרטית (מצריך אישור הצטרפות)
              </span>
            </label>
          </div>

          {formError && (
            <div className="error-message">{formError}</div>
          )}

          <div className="form-actions">
            <button
              type="button"
              className="cancel-btn"
              onClick={handleClose}
              disabled={saving}
            >
              ביטול
            </button>
            <button
              type="submit"
              className="submit-btn"
              disabled={saving}
            >
              {saving ? 'יוצר קבוצה...' : 'צור קבוצה'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateGroupModal;
