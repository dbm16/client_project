import React, { useState } from 'react';
import axios from 'axios';
import './SignUpPage.css';
import logo from '../assets/logo.svg';
import Button from '@mui/material/Button';
import { ToastContainer, toast } from 'react-toastify';

const SignUpPage = () => {
 
  const [userInput, setUserInput] = useState({   // based on User Model
    username: '',
    email: '',
    password1: '',
    password2: ''
  });

  const pageTitle = "הרשמה למערכת";
  const pageSubtitle = "הזן פרטים אישיים וסיסמה ליצירת חשבון";

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    // Updating  field
    setUserInput(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();

    try {
      // Submitting form data to server 
      await axios.post('http://localhost:5000/api/users/register', {
        name: userInput.username,
        email: userInput.email,
        password: userInput.password1,
        confirmPassword: userInput.password2
      });

      // reset the form after successful registration
      setUserInput({
        username: '',
        email: '',
        password1: '',
        password2: ''
      });

      toast.success('מזל טוב ! המשתמש נוצר בהצלחה ');
    } catch (err) {
      const errorMsg = err?.response?.data?.message || "משהו השתבש, נסה שוב.";
      toast.error(errorMsg);
    }
  };

  return (
    <>
      <div className="signup-page">
        <div className='logo-section'>
          <img src={logo} className="logo-image" alt="logo" />
          <h3 className='app-title'>{pageTitle}</h3>
          <span className='app-subtitle'>{pageSubtitle}</span>
        </div>

        <div className="form-box">
          <h3 className='form-header'>הרשמה באמצעות שם משתמש וסיסמה</h3>

          <form className="signup-form" onSubmit={handleFormSubmit}>
            <label>שם משתמש:</label>
            <input
              type="text"
              name="username"
              value={userInput.username}
              onChange={handleInputChange}
            />

            <label>כתובת אימייל:</label>
            <input
              type="email"
              name="email"
              value={userInput.email}
              onChange={handleInputChange}
            />

            <label>סיסמה:</label>
            <input
              type="password"
              name="password1"
              value={userInput.password1}
              onChange={handleInputChange}
            />

            <label>אישור סיסמה :</label>
            <input
              type="password"
              name="password2"
              value={userInput.password2}
              onChange={handleInputChange}
            />

            <Button color="primary" type="submit" variant="contained">
              הרשמה למערכת
            </Button>
          </form>
        </div>

        <span className='login-reminder'>
          יש לך משתמש? <a href="/signin" className='login-link'>התחבר</a>
        </span>
      </div>

      <ToastContainer
        className="toast-popup"
        position="top-center"
        autoClose={3000}
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

export default SignUpPage;
