import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SignUpPage from './pages/SignUpPage';
import SignInPage from './pages/SignInPage';
import HomePage from './pages/HomePage';
import GroupProfile from './pages/GroupProfile';
import MyGroups from './pages/MyGroups';
import UserProfile from './pages/UserProfile';
import DiscoverFriends from './pages/DiscoverFriends';
import ChatPage from './pages/ChatPage';





const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/mygroups" element={<MyGroups />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/" element={<SignUpPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/groups/:groupId" element={<GroupProfile />} />
        <Route path="/profile/:id" element={<UserProfile />} />
        <Route path="/discoverfriends" element={<DiscoverFriends />} />
        <Route path="/chat/:id" element={<ChatPage />} />


        
      </Routes>
    </Router>
  );
};

export default App;
