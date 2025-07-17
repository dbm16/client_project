import React, { useState } from 'react';
import axios from 'axios';
import './SignUpPage.css';
import logo from '../assets/logo.svg';
import { Button } from '@mui/material';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const SignInPage = () => {
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false); // prevent multiple clicks

  const pageTitle = "כניסה למערכת";
  const pageSubtitle = "הזן אימייל וסיסמה לכניסה לחשבון";

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setLoginData(prev => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('http://localhost:5000/api/users/login', loginData);
      toast.success('התחברת בהצלחה');
      setLoginData({ email: '', password: '' });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('userId', response.data.userId);
      setIsSubmitting(true);
      setTimeout(() => {
        window.location.href = "/home";
      }, 1500);
    } catch (e) {
      toast.error('שגיאה בהתחברות');
    }
  };

  return (
    <>
      <div className="signup-page">
        <div className="logo-section">
          <img src={logo} className="logo-image" alt="Logo" />
          <h3 className="app-title">{pageTitle}</h3>
          <span className="app-subtitle">{pageSubtitle}</span>
        </div>

        <div className="form-box">
          <h3 className="form-header">כניסה באמצעות שם משתמש וסיסמה</h3>

          <form className="signup-form" onSubmit={handleLogin}>
            <label>כתובת אימייל:</label>
            <input
              type="email"
              name="email"
              value={loginData.email}
              onChange={handleInputChange}
            />

            <label>סיסמה:</label>
            <input
              type="password"
              name="password"
              value={loginData.password}
              onChange={handleInputChange}
            />

            <Button type="submit" color="primary" variant="contained" disabled={isSubmitting}>
              כניסה למערכת
            </Button>
          </form>
        </div>

        <span className="login-reminder">
          אין לך משתמש? <a href="/signup" className="login-link">הירשם כעת</a>
        </span>
      </div>

      <ToastContainer
        className="toast-popup"
        position="top-center"
        autoClose={1000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </>
  );
};

export default SignInPage;
