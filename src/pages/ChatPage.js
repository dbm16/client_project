import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { io } from 'socket.io-client';

import './ChatPage.css'; 

const socket = io('http://localhost:5000');

const ChatPage = () => {

  // Extracting user ID from the URL params (e.g. /chat/:id)
  const { id: otherUserId } = useParams(); 

  const myId = localStorage.getItem('userId'); 

  // Messages list
  const [messages, setMessages] = useState([]);

  // Input field
  const [newMsg, setNewMsg] = useState('');

  // Other user's data 
  const [user, SetUser] = useState('');

  useEffect(() => {

    const token = localStorage.getItem('token'); // Get token for auth

    // Fetch chat history from back (we using fetch only here!)
    const loadHistory = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/messages/${otherUserId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const history = await res.json();
        setMessages(history); // retrieve messages
      } catch (err) {
        console.error('Failed to load chat history', err);
      }
    };

    // Fetch the other user's info
    const loadUserById = async (userId) => {
      try {
        const res = await fetch(`http://localhost:5000/api/users/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        const userData = await res.json();
        SetUser(userData); 
      } catch (err) {
        console.error('Error fetching user by ID:', err); 
      }
    };

    loadHistory();
    loadUserById(otherUserId);

    // Join the socket room
    socket.emit('join', { userId: myId });

    // Listen to incoming messages
    const handleIncoming = (msg) => {
      setMessages((prev) => [...prev, msg]); // Adding new msg to the end
    };

    socket.on('receive_message', handleIncoming); 

    return () => {
      socket.off('receive_message', handleIncoming);
    };
  }, [myId, otherUserId]); 

  const sendMessage = () => {
    if (!newMsg.trim()) return; // prevent empty messages

    const message = { from: myId, to: otherUserId, content: newMsg };
    socket.emit('send_message', message); 
    setMessages((prev) => [...prev, message]); 
    setNewMsg(''); // Reset input
  };

  // enable Enter as 'send' btn
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  return (
    <div className="chat-container">

      <div className="chat-header">
        <h2>צ׳אט עם {user?.name || 'משתמש'}</h2>
      </div>
      
      <div className="chat-messages">
        {messages.map((msg, index) => (
          <div 
            key={index} 
            className={`message ${msg.from === myId ? 'own' : 'other'}`}
          >
            <div className="message-bubble">
              {msg.content}
            </div>
          </div>
        ))}
      </div>
      
      <div className="chat-input-container">
        <input
          className="chat-input"
          value={newMsg}
          onChange={(e) => setNewMsg(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="כתוב הודעה..."
        />
        <button 
          className="send-button" 
          onClick={sendMessage}
          disabled={!newMsg.trim()}
        >
          שלח
        </button>
      </div>
    </div>
  );
};

export default ChatPage;
