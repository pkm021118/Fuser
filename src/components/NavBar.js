import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import loginIcon from './image/로그인.png';
import storeIcon from './image/스토어.png';
import saleIcon from './image/판매하기.png';
import myIcon from './image/MY.png';
import fuserIcon from './image/Fuser.png';
import logoutIcon from './image/로그아웃.png';

function NavBar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            navigate('/'); // 먼저 페이지 이동
            await logout(); // 그 후 로그아웃
            alert('로그아웃 되셨습니다.');
        } catch (error) {
            console.error('로그아웃 실패:', error);
        }
    };

    return (
        <nav>
            <ul style={{ listStyleType: 'none', padding: 0, display: 'flex', justifyContent: 'flex-end', margin: 0 }}>
                {user ? (
                    <>
                        <li style={{ marginLeft: '30px', paddingTop: '30px' }}>
                            <img 
                                src={logoutIcon} 
                                alt="Logout" 
                                onClick={handleLogout} 
                                style={{ cursor: 'pointer' }} 
                            />
                        </li>
                    </>
                ) : (
                    <li style={{ marginLeft: '30px', paddingTop: '30px' }}>
                        <Link to="/login"><img src={loginIcon} alt="Login" /></Link>
                    </li>
                )}
                <li style={{ marginLeft: '30px', paddingTop: '30px' }}><Link to="/store"><img src={storeIcon} alt="Store" /></Link></li>
                <li style={{ marginLeft: '30px', paddingTop: '30px' }}><Link to="/sale"><img src={saleIcon} alt="Sale" /></Link></li>
                <li style={{ marginLeft: '30px', paddingTop: '30px' }}><Link to="/my"><img src={myIcon} alt="My Page" /></Link></li>
                <li style={{ marginLeft: '30px', marginRight: '180px', paddingTop: '23px' }}><Link to="/store"><img src={fuserIcon} alt="Store" /></Link></li>
            </ul>
        </nav>
    );
}

export default NavBar;
