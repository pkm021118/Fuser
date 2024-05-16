// src/pages/LoginPage.js
import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../Firebase/fbInstance';
import NavBar from '../components/NavBar';
import backgroundImage from '../components/image/LoginBackground.png';
import loginButtonImg from '../components/image/LoginButtonImage.png';
import { useAuth } from '../contexts/AuthContext';
import './LoginSignUpPage.css';

function LoginPage() {
  const [inputFocused, setInputFocused] = useState(false);
  const [loginInfo, setLoginInfo] = useState({ username: '', password: '' });
  const [isPassword, setIsPassword] = useState(false);
  const inputRef = useRef(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (event) => {
    event.preventDefault();
    if (!isPassword) {
      setLoginInfo({ ...loginInfo, username: inputRef.current.value });
      setIsPassword(true);
      inputRef.current.value = '';
    } else {
      setLoginInfo({ ...loginInfo, password: inputRef.current.value });
      try {
        const userCredential = await signInWithEmailAndPassword(
          auth,
          loginInfo.username,
          inputRef.current.value
        );
        console.log('로그인 성공:', userCredential.user);
        login(userCredential.user);
        navigate('/store');
      } catch (error) {
        alert('이메일 또는 비밀번호가 잘못되었습니다.');
        console.error('로그인 실패:', error.message);
      }
    }
  };

  const handleInputFocus = () => {
    setInputFocused(true);
    inputRef.current.style.borderColor = '#9FDEE6';
  };

  const handleInputBlur = () => {
    setInputFocused(false);
    if (!inputRef.current.contains(document.activeElement)) {
      inputRef.current.style.borderColor = 'white';
    }
  };

  return (
    <div
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        height: '100vh',
        width: '100vw',
      }}
    >
      <NavBar />
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '90vh',
          marginTop: '0px',
          marginRight: '870px',
        }}
      >
        <div style={{ position: 'relative' }}>
          <input
            ref={inputRef}
            type={isPassword ? 'password' : 'text'}
            id={isPassword ? 'password' : 'username'}
            name={isPassword ? 'password' : 'username'}
            placeholder={isPassword ? '비밀번호' : '이메일 또는 아이디'}
            className='input-placeholder input-focused'
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            style={{
              width: '180%',
              padding: '25px',
              borderRadius: '18px',
              boxSizing: 'border-box',
              background: 'transparent',
              color: 'white',
              fontSize: '20px',
              outline: 'none',
              borderColor: inputFocused ? '#9FDEE6' : 'white',
            }}
          />
          <img
            src={loginButtonImg}
            alt='로그인'
            className='login-button'
            style={{
              position: 'absolute',
              right: '-180px',
              top: '18px',
              cursor: 'pointer',
              height: '40px',
            }}
            onMouseEnter={() => (inputRef.current.style.borderColor = '#9FDEE6')}
            onMouseLeave={() => (inputRef.current.style.borderColor = 'white')}
            onClick={handleLogin}
          />
          <div style={{ position: 'absolute', right: '-187px', top: '82px' }}>
            <Link to='/signup' style={{ color: '#9FDEE6', fontSize: '14px', textDecoration: 'none' }}>
              Fuser에 가입하기
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
