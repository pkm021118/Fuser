import React, { useState } from 'react';
import { auth, db } from '../Firebase/fbInstance';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { doc, setDoc } from 'firebase/firestore';
import NavBar from '../components/NavBar';
import backgroundImage from '../components/image/LoginBackground2.svg';
import loginButtonImg from '../components/image/LoginButtonImage.png';
import { useAuth } from '../contexts/AuthContext';
import './LoginSignUpPage.css';

function SignUpPage() {
    const [signupInfo, setSignupInfo] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        fullName: '',
        phone: ''
    });
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setSignupInfo(prevInfo => ({
            ...prevInfo,
            [name]: value
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (signupInfo.password !== signupInfo.confirmPassword) {
            alert('비밀번호가 일치하지 않습니다.');
            return;
        }

        try {
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                signupInfo.email,
                signupInfo.password
            );
            const user = userCredential.user;
            await updateProfile(user, {
                displayName: signupInfo.fullName
            });

            // Firestore에 사용자 정보 저장
            await setDoc(doc(db, 'users', user.uid), {
                name: signupInfo.fullName,
                email: signupInfo.email,
                phone: signupInfo.phone
            });

            console.log('회원가입 성공:', user);
            login(user);
            navigate('/store');
        } catch (error) {
            if (error.code === 'auth/email-already-in-use') {
                alert('이미 가입한 이메일입니다.');
            } else {
                alert(`회원가입 실패: ${error.message}`);
            }
        }
    };

    return (
        <div style={{
            backgroundImage: `url(${backgroundImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            height: '100vh',
            width: '100vw'
        }}>
            <NavBar />
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '90vh'
            }}>
                <form onSubmit={handleSubmit} style={formStyle}>
                    <input type="email" name="email" value={signupInfo.email} onChange={handleInputChange} placeholder="이메일" className="input-field" />
                    <input type="password" name="password" value={signupInfo.password} onChange={handleInputChange} placeholder="비밀번호" className="input-field" />
                    <input type="password" name="confirmPassword" value={signupInfo.confirmPassword} onChange={handleInputChange} placeholder="비밀번호 확인" className="input-field" />
                    <input type="text" name="fullName" value={signupInfo.fullName} onChange={handleInputChange} placeholder="이름" className="input-field" />
                    <input type="text" name="phone" value={signupInfo.phone} onChange={handleInputChange} placeholder="전화번호" className="input-field" />
                    <button type="submit" className="submit-button" style={buttonStyle}>
                        제출하기
                        <img src={loginButtonImg} alt="Login" style={imageStyle} />
                    </button>
                </form>
            </div>
        </div>
    );
}

const formStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '450px',
    padding: '20px',
    borderRadius: '15px',
    margin: '0 auto',
    position: 'relative',
    top: '0px',
    left: '280px'
};

const buttonStyle = {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    fontSize: '20px',
    color: '#9FDEE6',
    padding: '0',
    display: 'flex',
    alignItems: 'center',
    marginTop: '-10px',
    marginLeft: '350px'
};

const imageStyle = {
    width: '20px',
    height: '20px',
    marginLeft: '5px'
};

export default SignUpPage;
