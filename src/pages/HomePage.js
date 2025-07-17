import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './HomePage.css';
import { Link,useNavigate} from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {Dialog,DialogTitle,DialogContent, DialogActions,Button,Typography} from '@mui/material';
import EditPostModal from './EditPostModal';
import MediaUploadModal from './MediaUploadModal';

const HomePage = () => {

  const [posts, setPosts] = useState([]);
  const [friendsList, updateFriendsList] = useState([]);
  const [pendingRequests, updatePending] = useState([]);
  const [draftText, updateDraftText] = useState('');
  const [draftMedia, setDraftMedia] = useState(null); // הוספת state למדיה
  const [loadingSend, setLoadingSend] = useState(false);
  const [openLogoutDialog, setOpenLogoutDialog] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [mediaModalOpen, setMediaModalOpen] = useState(false); // הוספת state למודל המדיה

  const nav = useNavigate();
  const inappropriateWords = ['מטומטם', 'טיפש', 'זונה', 'בן זונה', 'בת זונה', 'טיפשה'];
  
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    const retrieveFeed = async () => {
      try {
        const token = localStorage.getItem('token');

        const [postsRes, friendsRes, requestsRes, groupsRes] = await Promise.all([
          axios.get('http://localhost:5000/api/posts/feed', {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`http://localhost:5000/api/users/${userId}/friends`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`http://localhost:5000/api/users/${userId}/friend-requests`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`http://localhost:5000/api/groups/my`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        setPosts(postsRes.data.posts);
        updateFriendsList(friendsRes.data);
        updatePending(requestsRes.data);

      } catch (e) {
        toast.error("לא ניתן לטעון את הפיד כעת");
      }
    };

    retrieveFeed();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    toast.success('התנתקת בהצלחה');
    setTimeout(() => {
      nav('/signin');
    }, 1000);
  };

  const handleDeletePost = async (postId) => {
    const confirm = window.confirm("האם אתה בטוח שברצונך למחוק את הפוסט?");
    if (!confirm) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/posts/${postId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setPosts(prev => prev.filter(p => p._id !== postId));
      toast.success("הפוסט נמחק בהצלחה");
    } catch (err) {
      toast.error("שגיאה בעת מחיקת הפוסט");
    }
  };

  const handleEditPost = (post) => {
    setSelectedPost(post);
    setEditModalOpen(true);
  };

  const handlePostUpdated = (updatedPost) => {
    setPosts(prev => 
      prev.map(post => 
        post._id === updatedPost._id ? updatedPost : post
      )
    );
    toast.success("הפוסט עודכן בהצלחה");
  };

  const handleMediaAdd = (url, type) => {
    setDraftMedia({
      url,
      type
    });
    setMediaModalOpen(false);
    toast.success('מדיה נוספה לפוסט');
  };

  const handleMediaRemove = () => {
    setDraftMedia(null);
    toast.info('מדיה הוסרה מהפוסט');
  };

  const checkBadWords = (text) => {
    return inappropriateWords.some(word =>
      text.toLowerCase().includes(word.toLowerCase())
    );
  };

  const sendPostNow = async () => {
    if (checkBadWords(draftText)) {
      toast.error("הפוסט שלך מכיל תוכן לא הולם");
      return;
    }

    setLoadingSend(true);

    try {
      const token = localStorage.getItem('token');

      const postData = {
        content: draftText
      };

      if (draftMedia) {
        postData.imageUrl = draftMedia.url;
      }

      const res = await axios.post(
        'http://localhost:5000/api/posts',
        postData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setPosts([res.data.post, ...posts]);
      updateDraftText('');
      setDraftMedia(null); 
      toast.success('איזה כיף ! הפוסט עלה בהצלחה');

    } catch (err) {
      toast.error("התרחשה שגיאה בעת יצירת הפוסט , אנא נסו שוב");
    } finally {
      setLoadingSend(false);
    }
  };

  const doLikeClick = async (postId) => {
    try {
      const token = localStorage.getItem('token');

      const res = await axios.post(
        `http://localhost:5000/api/posts/${postId}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const updatedPost = res.data.post;

      setPosts((prev) =>
        prev.map((p) => (p._id === postId ? updatedPost : p))
      );
    } catch (err) {
      toast.error("שגיאה בלייק, אולי נסה שוב?");
    }
  };

  const handleApprove = async (fromUserId) => {
    try {
      const token = localStorage.getItem('token');

      await axios.post(
        `http://localhost:5000/api/users/${fromUserId}/approve-friend`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      updatePending(prev => prev.filter(u => u._id !== fromUserId));

      const res = await axios.get(
        `http://localhost:5000/api/users/${userId}/friends`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      updateFriendsList(res.data);
    } catch (err) {
      toast.error("לא ניתן היה לאשר את הבקשה");
    }
  };

  return (
    <>
      <div className="home-container">
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
                  viewBox="0 0 24 24" >
                  <path d="M10 2a8 8 0 105.293 14.293l4.707 4.707 1.414-1.414-4.707-4.707A8 8 0 0010 2zm0 2a6 6 0 110 12A6 6 0 0110 4z" />
                </svg>
              </button>
            </div>
            
            <nav className="header-tabs">
              <Link to="/" className="tab-item active">
                <div className="tab-icon">🏠</div>
                <div className="tab-label">פיד</div>
              </Link>
              <Link to="/discoverfriends" className="tab-item">
                <div className="tab-icon">👥</div>
                <div className="tab-label">גלו חברים</div>
              </Link>
              <Link to="/mygroups" className="tab-item">
                <div className="tab-icon">👥</div>
                <div className="tab-label">קבוצות</div>
              </Link>
          
          
            </nav>
          </div>
        </header>

        <div className="main-content">
          <aside className="left-sidebar">
            <div className="sidebar-section">
              <h3>החברים שלי</h3>
              <div className="friends-list">
              {friendsList.map(friend => (
                <div key={friend._id} className="friend-item">
                  <div className="friend-avatar">👤</div>
                  <Link to={`/profile/${friend._id}`} className="friend-name">
                    {friend.name}
                  </Link>
                </div>
              ))}
            </div>
            </div>

           
          </aside>

          <main className="feed">
            <div className="create-post-card">
              <div className="create-post-header">
                <div className="user-avatar">👤</div>
                <input
                  type="text"
                  placeholder="מה תרצה לשתף איתנו ?"
                  value={draftText}
                  onChange={(e) => updateDraftText(e.target.value)}
                  className="create-post-input"
                />
              </div>
              
              {draftMedia && (
                <div className="draft-media-preview">
                  <div className="preview-header">
                    <h4>תצוגה מקדימה:</h4>
                    <button 
                      className="remove-media-btn"
                      onClick={handleMediaRemove}
                      title="הסר מדיה"
                    >
                      ✕
                    </button>
                  </div>
                  {draftMedia.type === 'image' ? (
                    <img 
                      src={draftMedia.url} 
                      alt="Draft media preview" 
                      className="draft-media-image" 
                    />
                  ) : (
                    <video 
                      src={draftMedia.url} 
                      controls 
                      className="draft-media-video"
                    />
                  )}
                </div>
              )}

              <div className="create-post-actions">
                <button 
                  className="post-action-btn"
                  onClick={() => setMediaModalOpen(true)}
                >
                  📸 תמונה/וידאו
                </button>
                <button
                  className="post-submit-btn"
                  onClick={sendPostNow}
                  disabled={!draftText.trim() || loadingSend}
                >
                  {loadingSend ? 'מפרסם...' : 'פרסם'}
                </button>
              </div>
            </div>

            <div className="post-list">
              {posts.map((post) => (
                <div key={post._id} className="post-card-home">
                  <div className="post-header">
                    <div className="post-author">
                      <div className="author-avatar">👤</div>
                      <div className="author-info">
                        {post.group && post.group._id && (
                          <div className="post-group">
                            <Link to={`/group/${post.group._id}`} className="group-name">
                              {post.group.name}
                            </Link>
                          </div>
                        )}
                       <span className="author-name">
                        {post.createdBy.name}
                      </span>
                        <span className="post-date">
                          {new Date(post.createdAt).toLocaleDateString('he-IL')}
                        </span>
                      </div>
                    </div>
                    {post.createdBy._id === userId && (
                      <div className="post-actions-menu">
                        <button
                          className="post-menu-btn"
                          onClick={() => handleEditPost(post)}
                          title="ערוך פוסט"
                        >
                          ✏️ ערוך
                        </button>
                        <button
                          className="post-menu-btn"
                          onClick={() => handleDeletePost(post._id)}
                          title="מחק פוסט"
                        >
                          🗑️ מחק
                        </button>
                      </div>
                    )}
                  </div>

 

                <div className="post-content">
                  <p>{post.content}</p>
                  {post.imageUrl && (
                    <div className="post-media">
                      {/* זיהוי אוטומטי של סוג הקובץ לפי הסיומת */}
                      {post.imageUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                        <img 
                          src={post.imageUrl} 
                          alt="Post media" 
                          className="post-image" 
                        />
                      ) : post.imageUrl.match(/\.(mp4|webm|ogg|mov|avi)$/i) ? (
                        <video 
                          src={post.imageUrl} 
                          controls 
                          className="post-video"
                          preload="metadata"
                        />
                      ) : (
                        // אם לא מזהה את הסוג, נסה כתמונה תחילה
                        <img 
                          src={post.imageUrl} 
                          alt="Post media" 
                          className="post-image"
                          onError={(e) => {
                            // אם נכשל כתמונה, נסה כווידאו
                            const videoElement = document.createElement('video');
                            videoElement.src = post.imageUrl;
                            videoElement.controls = true;
                            videoElement.className = 'post-video';
                            videoElement.preload = 'metadata';
                            e.target.parentNode.replaceChild(videoElement, e.target);
                          }}
                        />
                      )}
                    </div>
                  )}
                </div>

                  <div className="post-actions">
                    <button className="action-btn" onClick={() => doLikeClick(post._id)}>
                      {Array.isArray(post.likes) && post.likes.includes(userId)
                        ? '💙 אהבתי'
                        : '👍 לייק'} ({Array.isArray(post.likes) ? post.likes.length : 0})
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </main>

          <aside className="right-sidebar">
            <div className="sidebar-section">
              <h3>בקשות חברות</h3>
              <div className="friend-requests">
                {pendingRequests.length === 0 ? (
                  <p>אין בקשות כרגע</p>
                ) : (
                  pendingRequests.map((req) => (
                    <div key={req._id} className="friend-request">
                      <div className="request-avatar">👤</div>
                      <div className="request-info">
                        <strong>{req.name}</strong>
                        <div className="request-actions">
                          <button className="accept-btn" onClick={() => handleApprove(req._id)}>אישור בקשת חברות</button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="sidebar-section">
              <button className="logout-btn" onClick={() => setOpenLogoutDialog(true)}>
                <span className="logout-icon">🚪</span>
                <span>התנתקות מהחשבון</span>
              </button>
            </div>
          </aside>
        </div>
      </div>

      <MediaUploadModal
        isOpen={mediaModalOpen}
        onClose={() => setMediaModalOpen(false)}
        onMediaAdd={handleMediaAdd}
      />

      <EditPostModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onPostUpdated={handlePostUpdated}
        post={selectedPost}
      />

      <ToastContainer
        className="toast-msg"
        position="top-center"
        autoClose={500}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={true}
        pauseOnFocusLoss
        draggable
        pauseOnHover={false}
      />

      <Dialog open={openLogoutDialog} onClose={() => setOpenLogoutDialog(false)}>
        <DialogTitle>התנתקות מהחשבון</DialogTitle>
        <DialogContent>
          <Typography>האם אתה בטוח שברצונך להתנתק?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleLogout} variant="contained">
            התנתק
          </Button>
          <Button onClick={() => setOpenLogoutDialog(false)} color="primary">לא כרגע</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default HomePage;