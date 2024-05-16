import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../Firebase/fbInstance';
import { onAuthStateChanged, signOut } from 'firebase/auth';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true); // 로딩 상태 관리

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                // 사용자 정보를 설정합니다.
                setUser({
                    uid: user.uid,
                    email: user.email,
                    displayName: user.displayName || user.email.split('@')[0],
                    phone: user.phoneNumber
                });
            } else {
                setUser(null);
            }
            setLoading(false); // 로딩 상태 해제
        });

        return unsubscribe;
    }, []);

    const login = (user) => {
        setUser(user);
    };

    const logout = async () => {
        await signOut(auth);
        setUser(null);
    };

    if (loading) {
        return <div>Loading...</div>; // 로딩 중일 때 표시할 내용
    }

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
