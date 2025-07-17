import React, { useEffect, useState  } from 'react';
import { useParams, Link } from 'react-router-dom';
import $ from 'jquery';
import './GroupProfile.css';

const GroupProfile = () => {
  const { groupId } = useParams(); 
  const id = groupId;
  const [group, setGroup] = useState(null);
  const [posts, setPosts] = useState([]);
  const [activeTab, setActiveTab] = useState('posts');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);
  const [pendingRequests, setPendingRequests] = useState([]);

  
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    isPrivate: false,
    imageUrl: ''
  });
  const [createPostForm, setCreatePostForm] = useState({
    title: '',
    content: '',
    imageUrl: ''
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setCurrentUser(payload);
      } catch (err) {
        console.error('Error decoding token:', err);
      }
    }
  }, []);

  // Fetch group data
  useEffect(() => {
    if (id) {
      fetchGroupData();
    }
  }, [id]);

  const fetchGroupData = () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    
    $.ajax({
      url: `http://localhost:5000/api/groups/${id}`,
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`
      },
      success: (data) => {
        setGroup(data.group);
        setPosts(data.posts || []);
        setPendingRequests(data.pendingRequests || []); 
        if (data.group.pendingRequests) {
          fetchPendingRequests(data.group.pendingRequests);
        }
        setEditForm({
          name: data.group.name,
          description: data.group.description,
          isPrivate: data.group.isPrivate,
          imageUrl: data.group.imageUrl
        });
        setLoading(false);
        setError('');
      },
      error: (jqXHR) => {
        setError(jqXHR.responseJSON?.message || 'שגיאה בטעינת הקבוצה');
        setLoading(false);
      }
    });
  };

  const approveRequest = (userId) => {
    const token = localStorage.getItem('token');
    $.ajax({
      url: `http://localhost:5000/api/groups/${id}/approve/${userId}`,
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
      success: () => {
        setPendingRequests(prev => prev.filter(u => u._id !== userId));
        setGroup(prev => ({ ...prev, members: [...prev.members, { _id: userId, name: '', email: '' }] }));
      }
    });
  };

  const rejectRequest = (userId) => {
    const token = localStorage.getItem('token');
    $.ajax({
      url: `http://localhost:5000/api/groups/${id}/reject/${userId}`,
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
      success: () => {
        setPendingRequests(prev => prev.filter(u => u._id !== userId));
      }
    });
  };

  // Fetch pending requests details
  const fetchPendingRequests = (requestIds) => {
    if (!requestIds || requestIds.length === 0) {
      setPendingRequests([]);
      return;
    }

    const token = localStorage.getItem('token');
    
    $.ajax({
      url: `http://localhost:5000/api/groups/${id}/pending-requests`,
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`
      },
      success: (data) => {
        setPendingRequests(data.pendingRequests || []);
      },
      error: (jqXHR) => {
        console.error('Error fetching pending requests:', jqXHR.responseJSON);
      }
    });
  };

  // Approve join request
  const approveJoinRequest = (userId) => {
    const token = localStorage.getItem('token');
    
    $.ajax({
      url: `http://localhost:5000/api/groups/${id}/approve/${userId}`,
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`
      },
      success: () => {
        setPendingRequests(prev => prev.filter(req => req._id !== userId));
        fetchGroupData();
        setError('');
      },
      error: (jqXHR) => {
        setError(jqXHR.responseJSON?.message || 'שגיאה באישור הבקשה');
      }
    });
  };

  // Reject join request
  const rejectJoinRequest = (userId) => {
    const token = localStorage.getItem('token');
    
    $.ajax({
      url: `http://localhost:5000/api/groups/${id}/reject/${userId}`,
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`
      },
      success: () => {
        setPendingRequests(prev => prev.filter(req => req._id !== userId));
        setError('');
      },
      error: (jqXHR) => {
        setError(jqXHR.responseJSON?.message || 'שגיאה בדחיית הבקשה');
      }
    });
  };

  // Remove member from group
  const removeMember = (userId) => {
    if (!window.confirm('האם אתה בטוח שברצונך להסיר את המשתמש מהקבוצה?')) return;
    
    const token = localStorage.getItem('token');
    
    $.ajax({
      url: `http://localhost:5000/api/groups/${id}/remove/${userId}`,
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`
      },
      success: () => {
        setGroup(prev => ({
          ...prev,
          members: prev.members.filter(member => member._id !== userId)
        }));
        setError('');
      },
      error: (jqXHR) => {
        setError(jqXHR.responseJSON?.message || 'שגיאה בהסרת המשתמש');
      }
    });
  };

  // Update group
  const handleUpdateGroup = (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    
    $.ajax({
      url: `http://localhost:5000/api/groups/${id}`,
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      data: JSON.stringify(editForm),
      success: (data) => {
        setGroup(data.group);
        setIsEditModalOpen(false);
        setError('');
      },
      error: (jqXHR) => {
        setError(jqXHR.responseJSON?.message || 'שגיאה בעדכון הקבוצה');
      }
    });
  };

  // Create post
  const handleCreatePost = (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    
    const postData = {
      content: createPostForm.content,
      imageUrl: createPostForm.imageUrl || '',
      groupId: id
    };

    $.ajax({
      url: 'http://localhost:5000/api/posts',
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      data: JSON.stringify(postData),
      success: (data) => {
        // Add new post to the beginning of posts array
        setPosts(prev => [data.post, ...prev]);
        setCreatePostForm({
          title: '',
          content: '',
          imageUrl: ''
        });
        setIsCreatePostModalOpen(false);
        setError('');
      },
      error: (jqXHR) => {
        setError(jqXHR.responseJSON?.message || 'שגיאה ביצירת הפוסט');
      }
    });
  };

  // Delete group
  const handleDeleteGroup = () => {
    if (!window.confirm('האם אתה בטוח שברצונך למחוק את הקבוצה? פעולה זו בלתי הפיכה!')) return;
    
    const token = localStorage.getItem('token');
    
    $.ajax({
      url: `http://localhost:5000/api/groups/${id}`,
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`
      },
      success: () => {
        window.location.href = '/mygroups';
      },
      error: (jqXHR) => {
        setError(jqXHR.responseJSON?.message || 'שגיאה במחיקת הקבוצה');
      }
    });
  };

  const truncateText = (text, maxLength = 100) => {
    if (!text) return '';
    if (text.length > maxLength) {
      return text.slice(0, maxLength) + '...';
    }
    return text;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('he-IL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const isGroupOwner = currentUser && group && group.createdBy._id === currentUser.id;

  if (loading) {
    return (
      <div className="group-profile-loading">
        <div className="spinner"></div>
        <p>טוען נתוני קבוצה...</p>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="group-profile-error">
        <h2>קבוצה לא נמצאה</h2>
        <button onClick={() => window.location.href = '/mygroups'}>חזור לקבוצות</button>
      </div>
    );
  }

  return (
    <div className="group-profile-page">
     
      <header className="header">
        <div className="header-content">
          <div className="search-bar">
            <input type="text" placeholder="חפש חברים, פוסטים..." />
            <button className="search-button" aria-label="חיפוש">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="25"
                height="25"
                fill="white"
                viewBox="0 0 24 24">
                <path d="M10 2a8 8 0 105.293 14.293l4.707 4.707 1.414-1.414-4.707-4.707A8 8 0 0010 2zm0 2a6 6 0 110 12A6 6 0 0110 4z" />
              </svg>
            </button>
          </div>
          
          <nav className="header-tabs">
            <Link to="/home" className="tab-item">
              <div className="tab-icon">🏠</div>
              <div className="tab-label">פיד</div>
            </Link>
            <Link to="/discoverfriends" className="tab-item">
              <div className="tab-icon">👥</div>
              <div className="tab-label">גלו חברים</div>
            </Link>
            <Link to="/mygroups" className="tab-item active">
              <div className="tab-icon">👥</div>
              <div className="tab-label">קבוצות</div>
            </Link>
        
           
          </nav>
          
        
        </div>
      </header>

      <div className="group-profile-container">
     
        <div className="page-header">
          <div className='group-header-details'>
            <img
              src={group.imageUrl}
              style={{ width: '120px', height: '120px', borderRadius: '8px', objectFit: 'cover', marginBottom: '10px' }} />
            
            <h1>{group.name}</h1>
            <span>{group.description}</span>
          </div>
          
          <div className='create-group-post'>
          </div>
           
          <div className="group-actions">
            {isGroupOwner ? (
              <>
                <button 
                  className="create-group-btn"
                  onClick={() => setIsEditModalOpen(true)}> ערוך קבוצה </button>
               
                <button 
                  className='create-group-btn-gp'
                  onClick={() => setIsCreatePostModalOpen(true)}
                >
                  יצירת פוסט חדש +
                </button>

                <button 
                  className="delete-group-btn"
                  onClick={handleDeleteGroup}>מחק קבוצה</button>
              </>
            ) : (
              <button 
                className='create-group-btn-gp'
                onClick={() => setIsCreatePostModalOpen(true)}
              >
                יצירת פוסט חדש +
              </button>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="view-toggle">
          <button 
            className={`toggle-btn ${activeTab === 'posts' ? 'active' : ''}`}
            onClick={() => setActiveTab('posts')}
          >
            פוסטים ({posts.length})
          </button>
          <button 
            className={`toggle-btn ${activeTab === 'details' ? 'active' : ''}`}
            onClick={() => setActiveTab('details')}
          >
            פרטי הקבוצה
          </button>
          {isGroupOwner && (
            <button 
              className={`toggle-btn ${activeTab === 'requests' ? 'active' : ''}`}
              onClick={() => setActiveTab('requests')}
            >
              בקשות חברות ({pendingRequests.length})
            </button>
          )}
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <div className="tab-content">
          {activeTab === 'posts' && (
            <div className="posts-section">
              {posts.length > 0 ? (
                <div className="posts-list">
                  {posts.map(post => (
                    <div key={post._id} className="post-card">
                      <div className="post-header">
                        <div className="post-author-gp">
                          <div className='author-hoz'>
                            <div className="author-avatar">👤</div>
                            <span className="author-name">{post.createdBy?.name}</span>
                          </div>
                          <span className="post-date-gp">{new Date(post.createdAt).toLocaleDateString('he-IL')}</span>
                        </div>
                      </div>
                      <div className="post-content">
                        <h4>{post.title}</h4>
                        <p>{truncateText(post.content)}</p>
                        {post.imageUrl && (
                          <img src={post.imageUrl} alt={post.title} className="post-image" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-posts">
                  <h3>אין פוסטים בקבוצה</h3>
                  <p>היה הראשון לפרסם בקבוצה זו!</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'details' && (
            <div className="details-section">
              <div className="detail-card">
                <h3>פרטי יסוד</h3>
                <div className="detail-item">
                  <strong>נוצר על ידי:</strong> {group.createdBy?.name}
                </div>
                <div className="detail-item">
                  <strong>תאריך יצירה:</strong> {formatDate(group.createdAt)}
                </div>
                <div className="detail-item">
                  <strong>סוג קבוצה:</strong> {group.isPrivate ? 'פרטית' : 'ציבורית'}
                </div>
              </div>

              <div className="detail-card">
                <h3>חברי הקבוצה ({group.members?.length || 0})</h3>
                <div className="members-grid">
                  {group.members?.map(member => (
                    <div key={member._id} className="member-card">
                      <div className="member-info">
                        <span className="member-name">{member.name}</span>
                        <span className="member-email">{member.email}</span>
                      </div>
                      {isGroupOwner && member._id !== group.createdBy._id && (
                        <button 
                          className="remove-btn"
                          onClick={() => removeMember(member._id)}
                          title="הסר מהקבוצה"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'requests' && isGroupOwner && (
            <div className="requests-section detail-card">
              <h3>בקשות חברות ממתינות</h3>
              {pendingRequests.length === 0 ? (
                <p>אין בקשות ממתינות כרגע</p>
              ) : (
                <ul className="requests-list">
                  {pendingRequests.map((user) => (
                    <li key={user._id} className="member-card">
                      <div className="member-info">
                        <span className="member-name">{user.name}</span>
                        <span className="member-email">{user.email}</span>
                      </div>
                      <div className='pending-buttons'>
                        <button className="create-group-btn-gp" onClick={() => approveRequest(user._id)}>אשר</button>
                        <button className="delete-group-btn" onClick={() => rejectRequest(user._id)}>דחה</button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        {/* Edit Modal */}
        {isEditModalOpen && (
          <div className="modal-overlay-gp">
            <div className="modal-content-gp">
              <div className="modal-header-gp">
                <h2>ערוך קבוצה</h2>
                <button 
                  className="close-btn"
                  onClick={() => setIsEditModalOpen(false)}
                >
                  ✕
                </button>
              </div>
              <form onSubmit={handleUpdateGroup} className="edit-form">
                <div className="form-group">
                  <label>שם הקבוצה</label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>תיאור</label>
                  <textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                    rows="4"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>תמונת הקבוצה (URL)</label>
                  <input
                    type="url"
                    value={editForm.imageUrl}
                    onChange={(e) => setEditForm({...editForm, imageUrl: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={editForm.isPrivate}
                      onChange={(e) => setEditForm({...editForm, isPrivate: e.target.checked})}
                    />
                    קבוצה פרטית
                  </label>
                </div>
                <div className="form-actions">
                  <button type="submit" className="submit-btn">שמור שינויים</button>
                  <button 
                    type="button" 
                    className="cancel-btn"
                    onClick={() => setIsEditModalOpen(false)}
                  >
                    ביטול
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Create Post Modal */}
        {isCreatePostModalOpen && (
          <div className="modal-overlay-gp">
            <div className="modal-content-gp">
              <div className="modal-header-gp">
                <h2>יצירת פוסט חדש</h2>
                <button 
                  className="close-btn"
                  onClick={() => setIsCreatePostModalOpen(false)}
                >
                  ✕
                </button>
              </div>
              <form onSubmit={handleCreatePost} className="create-post-form">
                <div className="form-group">
                  <label>תוכן הפוסט *</label>
                  <textarea
                    value={createPostForm.content}
                    onChange={(e) => setCreatePostForm({...createPostForm, content: e.target.value})}
                    rows="6"
                    placeholder="מה עובר לך בראש?"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>תמונה (URL)</label>
                  <input
                    type="url"
                    value={createPostForm.imageUrl}
                    onChange={(e) => setCreatePostForm({...createPostForm, imageUrl: e.target.value})}
                    placeholder="https://example.com/image.jpg"
                    required
                  />
                </div>
                <div className="form-actions">
                  <button type="submit" className="submit-btn">פרסם פוסט</button>
                  <button 
                    type="button" 
                    className="cancel-btn"
                    onClick={() => setIsCreatePostModalOpen(false)}
                  >
                    ביטול
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GroupProfile;