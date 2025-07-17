import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './UserProfile.css';

const UserProfile = () => {

  const { id: profileId } = useParams();   //  retrieve profile data/ check if its my own profile
  const navigate = useNavigate();
  const myId = localStorage.getItem('userId'); /// Get current user ID from localStorage

  const [profileUser, setProfileUser] = useState(null);         // Profile Details
  const [userPosts, setUserPosts] = useState([]);             
  const [userFriends, setUserFriends] = useState([]);           
  const [loadingProfile, setLoadingProfile] = useState(true);   
  const [relationStatus, setRelationStatus] = useState('none'); 
  const [isRequesting, setIsRequesting] = useState(false);      // For disabling the friend button

  useEffect(() => {
    const loadProfileData = async () => {
      try {
        setLoadingProfile(true);
        const token = localStorage.getItem('token');

        if (!token) {  // checking auth
          navigate('/login');
          return;
        }

        const { data } = await axios.get(`http://localhost:5000/api/users/${profileId}/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        setProfileUser(data.user);
        setUserPosts(data.posts);
        setUserFriends(data.user.friends || []);

        // if this not my profile , check friendship

        if (myId !== profileId) {
          await checkRelationStatus();
        }
      } catch (err) {

        if (err.response?.status === 404) {
          toast.error("משתמש לא נמצא");
        } else if (err.response?.status === 401) {
          navigate('/login'); // Not authorized
        } else {
          toast.error("שגיאה בעת טעינת הפרופיל");
        }
      } finally {
        setLoadingProfile(false);
      }
    };

    // check friendship

    const checkRelationStatus = async () => {

      try {
        const token = localStorage.getItem('token');
        const { data: me } = await axios.get('http://localhost:5000/api/users/me', {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (me.friends?.includes(profileId)) {
          setRelationStatus('friends');
        } else {
          const { data: requests } = await axios.get(`http://localhost:5000/api/users/${profileId}/friend-requests`, {
            headers: { Authorization: `Bearer ${token}` }
          });

          const alreadySent = requests.some(r => r._id === myId);
          setRelationStatus(alreadySent ? 'pending' : 'none');
        }
      } catch (err) {
        setRelationStatus('none');
      }
    };

    loadProfileData();
  }, [profileId, myId, navigate]);

  const handleLike = async (postId) => {
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.post(`http://localhost:5000/api/posts/${postId}/like`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const updated = data.post;
      setUserPosts(prev => prev.map(p => p._id === postId ? updated : p));
    } catch {
      toast.error("שגיאה בלייק, אולי נסה שוב?");
    }
  };

  const sendFriendRequest = async () => {
    if (myId === profileId) return;

    try {
      setIsRequesting(true);
      const token = localStorage.getItem('token');

      await axios.post(`http://localhost:5000/api/users/${profileId}/request-friend`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setRelationStatus('pending');
      toast.success('בקשת החברות נשלחה בהצלחה!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'שגיאה בשליחת בקשת החברות');
    } finally {
      setIsRequesting(false);
    }
  };

  const back = () => navigate(-1);

  const formatDate = (str) => {
    const d = new Date(str);
    return d.toLocaleDateString('he-IL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getBtnText = () => {
    if (isRequesting) return '🔄 שולח...';
    if (relationStatus === 'friends') return '✅ חברים';
    if (relationStatus === 'pending') return '⏳ בקשה נשלחה';
    return '👥 שליחת בקשת חברות';
  };

  if (loadingProfile) {
    return (
      <div className="profile-container">
        <div className="loading-container">
          <div className="spinner"></div>
          <p className="loading-text">טוען פרופיל...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="profile-container">
        <header className="profile-header">
          <div className="header-content">
            <button className="back-button" onClick={back}>← חזור</button>
            <h1 className="page-title">הפרופיל של {profileUser?.name}</h1>
          </div>
        </header>

        <main className="profile-main">
          <div className="profile-card">
            <div className="profile-info">
              <div className="profile-avatar">👤</div>

              <div className="profile-details">
                <h2 className="profile-name">{profileUser?.name}</h2>
                <p className="profile-email">{profileUser?.email}</p>
              </div>

              <div className="profile-stats">
                <div className="stat-item">
                  <p className="stat-number">{userPosts.length}</p>
                  <p className="stat-label">פוסטים</p>
                </div>
                <div className="stat-item">
                  <p className="stat-number">{userFriends.length}</p>
                  <p className="stat-label">חברים</p>
                </div>
              </div>

              <div className="profile-actions">
                <button
                  className={`friend-action-btn ${relationStatus}`}
                  onClick={sendFriendRequest}
                  disabled={isRequesting || relationStatus !== 'none'}
                >
                  {getBtnText()}
                </button>

                <Link to={`/chat/${profileId}`} className="message-btn">
                  💬 שלח הודעה
                </Link>
              </div>
            </div>
          </div>

          {userFriends.length > 0 && (
            <div className="friends-section">
              <div className="friends-header">
                <h3 className="friends-title">החברים של {profileUser.name}</h3>
                <div className="friends-count">{userFriends.length}</div>
              </div>

              <div className="friends-scroll">
                {userFriends.slice(0, 12).map(friend => (
                  <Link key={friend._id} to={`/profile/${friend._id}`} className="friend-card">
                    <div className="friend-avatar2">👤</div>
                    <p className="friend-name">{friend.name}</p>
                  </Link>
                ))}
              </div>

              {userFriends.length > 12 && (
                <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                  <Link to={`/profile/${profileId}/friends`} className="view-all-btn">
                    צפה בכל החברים ({userFriends.length})
                  </Link>
                </div>
              )}
            </div>
          )}

          <div className="posts-section">
            <div className="posts-header">
              <h3 className="posts-title">פוסטים</h3>
              <div className="posts-count">{userPosts.length}</div>
            </div>

            {userPosts.length > 0 ? (
              <div className="posts-list">
                {userPosts.map(post => (
                  <div key={post._id} className="post-card">
                    <div className="post-header">
                      <div className="post-avatar">👤</div>
                      <div className="post-info">
                        <p className="post-author">{profileUser?.name}</p>
                        <p className="post-date">{formatDate(post.createdAt)}</p>
                      </div>
                    </div>

                    <p className="post-content">{post.content}</p>

                    <div className="post-actions">
                      <button className="action-btn" onClick={() => handleLike(post._id)}>
                        {post.likes?.includes(myId) ? '💙 אהבתי' : '👍 לייק'} ({post.likes?.length || 0})
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                <p>אין עדיין פוסטים להצגה</p>
              </div>
            )}
          </div>
        </main>
      </div>

      <ToastContainer
        className="toast-msg"
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl
        pauseOnFocusLoss
        draggable
        pauseOnHover={false}
      />
    </>
  );
};

export default UserProfile;
