import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const PrivateRoute = () => {
    const { user } = useAuth();
    const [alertShown, setAlertShown] = useState(false);

    useEffect(() => {
        if (!user && !alertShown) {
            alert('로그인 이후 사용할 수 있습니다.');
            setAlertShown(true);
        }
    }, [user, alertShown]);

    if (!user) {
        return <Navigate to="/login" />;
    }

    return <Outlet />;
};

export default PrivateRoute;
