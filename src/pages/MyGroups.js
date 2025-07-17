import React, { useEffect, useState } from 'react';
import './MyGroups.css';
import retrieve_query from 'jquery';
import { Link, useNavigate } from 'react-router-dom';
import CreateGroupModal from './CreateGroupModal';

const MyGroups = () => {
  const [myGroups, setMyGroups] = useState([]);
  const [allGroups, setAllGroups] = useState([]);
  const [currentView, setCurrentView] = useState('my'); 
  const [errMsg, setErrMsg] = useState('');
  const [searchText, setSearchText] = useState('');
  const [joinRequests, setJoinRequests] = useState({});
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const navigate = useNavigate();


  /// func for edge case of long strings
  const truncateText = (text, maxLength = 41) => {
    if (!text) 
      return '';

    if (text.length > maxLength) {
      const shortened = text.slice(0, maxLength);
      return shortened + '...';
    }
    return text;
  };

  // retrieve my groups only

  const getMyGroups = () => {

    const token = localStorage.getItem('token');
    retrieve_query.ajax({
      url: `http://localhost:5000/api/groups/my`,
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`
      },
      success: (data) => {
        setMyGroups(data);
        setErrMsg('');
      },
      error: (jqXHR) => {
        setErrMsg(jqXHR.responseJSON?.message || 'שגיאה');
      }
    });
  };


  // retrieve all groups

 const fetchAllGroups = () => {
  retrieve_query.ajax({
    url: 'http://localhost:5000/api/groups',
    method: 'GET',
    success: (data) => {
      setAllGroups(data);
      setErrMsg('');
    },
    error: (jqXHR) => {
      setErrMsg(jqXHR.responseJSON?.message || 'שגיאה בטעינת הקבוצות');
    }
  });
};

  // Search groups function
  
const searchGroups = (query) => {

  retrieve_query.ajax({
    url: `http://localhost:5000/api/groups/search?name=${encodeURIComponent(query)}`,
    method: 'GET',
    success: (data) => {
      if (currentView === 'my') {
        setMyGroups(data);
      } else {
        setAllGroups(data);
      }
      setErrMsg('');
    },
    error: (jqXHR) => {
      setErrMsg(jqXHR.responseJSON?.message || 'שגיאה בחיפוש');
      console.error('Error While searching groups:', jqXHR);
    }
  });
};


  // Handle join group request

const handleJoinRequest = (groupId) => {
  const token = localStorage.getItem('token');

  retrieve_query.ajax({
    url: `http://localhost:5000/api/groups/${groupId}/request`, // group controller
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    success: () => {
      setJoinRequests(prev => ({ ...prev, [groupId]: 'pending' }));
      setErrMsg('');
    },
    error: (jqXHR) => {
      const msg = jqXHR.responseJSON?.message || 'שגיאה בשליחת בקשה';
      setErrMsg(msg);
      console.error('Error joining group:', jqXHR);
    }
  });
};

  // Handle group creation success

  const handleGroupCreated = (newGroup) => {

    setMyGroups(prev => [newGroup, ...prev]); // push the new group to the current groups array
    setCurrentView('my'); // Switch to "my groups" view
    setErrMsg('');
   
  };



  // Load groups when view changes
  
  useEffect(() => {
    if (currentView === 'my') {
      getMyGroups();
    } else {
      fetchAllGroups();
    }
  }, [currentView]);


  // Handle search
  const handleSearch = (e) => {
    if (e) e.preventDefault();
    searchGroups(searchText);
  };

  // Group Card Component
  const GroupCard = ({ group, showJoinButton = false }) => (

    <div className="group-card">
      <div className="group-image">
        <img src={group.imageUrl} alt={group.name} />
        {group.isPrivate && (
          <div className="private-badge">
            <span>קבוצה פרטית</span>
          </div>
        )}
      </div>
      <div className="group-content">
        <h3 className="group-name">{group.name}</h3>
        <p className="group-description">{truncateText(group.description)}</p>
        <div className="group-meta">
          <span className="member-count">{group.members?.length || 0} חברים</span>
          <span className="created-by">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="16"
              viewBox="0 0 24 24"
              width="16"
              fill="currentColor"
              style={{ marginLeft: '5px' }}
            >
              <path d="M0 0h24v24H0z" fill="none"/>
              <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM21.41 
                       6.34c.39-.39.39-1.02 0-1.41l-2.34-2.34a.9959.9959 
                       0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
            </svg>
            נוצר על ידי {group.createdBy?.name}
          </span>
        </div>
        <div className="group-actions">
          {showJoinButton ? (
            <button 
              className={`join-btn ${joinRequests[group._id] === 'pending' ? 'pending' : ''}`}
              onClick={() => handleJoinRequest(group._id)}
              disabled={joinRequests[group._id] === 'pending'}
            >
              {joinRequests[group._id] === 'pending' ? 'הבקשה נשלחה בהצלחה' : 'הצטרף לקבוצה'}
            </button>
          ) : (
            <button 
              className="view-btn"
              onClick={() => navigate(`/groups/${group._id}`)}
            >
              צפה בקבוצה
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="my-groups-page">
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
            <Link to="/home" className="tab-item">
              <div className="tab-icon">🏠</div>
              <div className="tab-label">פיד</div>
            </Link>
            <Link to="/discoverfriends" className="tab-item">
              <div className="tab-icon">👥</div>
              <div className="tab-label">חברים</div>
            </Link>
            <Link to="/mygroups" className="tab-item active">
              <div className="tab-icon">👥</div>
              <div className="tab-label">קבוצות</div>
            </Link>

            
          </nav>
          
        
        </div>
      </header>

      <div className="my-groups-container">
        <div className="page-header">
          <h1>קבוצות</h1>
          <button 
            className="create-group-btn"
            onClick={() => setIsCreateModalOpen(true)}
          >
            + צור קבוצה חדשה
          </button>
        </div>

        <div className="view-toggle">
          <button 
            className={`toggle-btn ${currentView === 'my' ? 'active' : ''}`}
            onClick={() => setCurrentView('my')}
          >
            הקבוצות שלי
          </button>
          <button 
            className={`toggle-btn ${currentView === 'discover' ? 'active' : ''}`}
            onClick={() => setCurrentView('discover')}
          >
            גלה קבוצות
          </button>
        </div>

        <div className="search-section">
          <div className="search-form">
            <input
              type="text"
              placeholder="חפש קבוצות..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="search-input"
              onKeyPress={(e) => e.key === 'Enter' && handleSearch(e)}
            />
            <button type="button" className="search-btn" onClick={handleSearch}>
              חפש
            </button>
          </div>
        </div>

        {errMsg && (
          <div className="error-message">
            {errMsg}
          </div>
        )}

        <div className="groups-grid">
          {currentView === 'my' ? (
            myGroups.length > 0 ? (
              myGroups.map(group => (
                <GroupCard key={group._id} group={group} />
              ))
            ) : (
              <div className="no-groups">
                <h3>אין לך קבוצות עדיין</h3>
                <p>התחל על ידי יצירת קבוצה חדשה או גלה קבוצות קיימות</p>
                <button 
                  className="discover-btn"
                  onClick={() => setCurrentView('discover')}
                >
                  גלה קבוצות
                </button>
              </div>
            )
          ) : (
            allGroups.length > 0 ? (
              allGroups.map(group => (
                <GroupCard key={group._id} group={group} showJoinButton={true} />
              ))
            ) : (
              <div className="no-groups">
                <h3>לא נמצאו קבוצות</h3>
                <p>נסה לחפש עם מילות מפתח אחרות</p>
              </div>
            )
          )}
        </div>

        {/* Create Group Modal */}
        <CreateGroupModal 
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onGroupCreated={handleGroupCreated}
        />
      </div>
    </div>
  );
};

export default MyGroups;