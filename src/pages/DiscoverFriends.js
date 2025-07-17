import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './DiscoverFriends.css';
import { Link, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const DiscoverFriends = () => {
  
  const [peopleList, setPeopleList] = useState([]);
  const [requesting, setRequesting] = useState({});
  const [requestsSent, setRequestsSent] = useState(new Set());

  const currentUserId = localStorage.getItem('userId');
  const navigate = useNavigate();

  useEffect(() => {
    const getSuggestedUsers = async () => {
      try {
        const token = localStorage.getItem('token');
        const { data } = await axios.get('http://localhost:5000/api/users/explore-users', {
          headers: { Authorization: `Bearer ${token}` }
        });

        const others = data.filter(user => user._id !== currentUserId);
        setPeopleList(others);
      } catch (err) {
        toast.error("שגיאה בטעינת משתמשים");
      }
    };

    getSuggestedUsers();
  }, [currentUserId]);

  const sendRequest = async (targetId) => {
    try {
      setRequesting(prev => ({ ...prev, [targetId]: true }));
      const token = localStorage.getItem('token');

      await axios.post(`http://localhost:5000/api/users/${targetId}/request-friend`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setRequestsSent(prev => new Set([...prev, targetId]));
      toast.success("בקשה נשלחה!");
    } catch (err) {
      toast.error(err.response?.data?.message || "שגיאה בשליחה");
    } finally {
      setRequesting(prev => ({ ...prev, [targetId]: false }));
    }
  };

  return (
    <>
      <div className="discover-container">
        <header className="discover-header">
          <div className="header-content">
            <div className="search-bar">
              <input type="text" placeholder="חפש משתמש..." />
              <button className="search-button" aria-label="Search">
                🔍
              </button>
            </div>

            <nav className="header-tabs">
              <Link to="/home" className="tab-item">
                <div className="tab-icon">🏠</div>
                <div className="tab-label">פיד</div>
              </Link>
              <Link to="/discoverfriends" className="tab-item active">
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

        <main className="discover-main">
          <div className="users-grid">
            {peopleList.map(user => (
              <div key={user._id} className="user-card">
                <div className="user-avatar-large">👤</div>

                <div className="user-details">
                  <h3 className="user-name">{user.name}</h3>
                  <p className="user-email">{user.email}</p>
                </div>

                <div className="user-actions">
                  <Link to={`/profile/${user._id}`} className="view-profile-btn">
                    לצפייה בפרופיל
                  </Link>
                  <button
                    className={`friend-request-btn ${requestsSent.has(user._id) ? 'sent' : ''}`}
                    onClick={() => sendRequest(user._id)}
                    disabled={requesting[user._id] || requestsSent.has(user._id)}
                  >
                    {requesting[user._id]
                      ? '🔄 שולח...'
                      : requestsSent.has(user._id)
                        ? '✅ נשלח'
                        : '👥 שלח בקשת חברות'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {peopleList.length === 0 && (
            <div className="no-users">
              <h3>לא נמצאו משתמשים</h3>
              <p>אנא נסה שוב מאוחר יותר</p>
            </div>
          )}
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

export default DiscoverFriends;
