import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children, role }) => {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const userRole = localStorage.getItem('role');

    if (!isLoggedIn || userRole !== role) {
        return <Navigate to={`/${role}login`} />;
    }

    return children;
};

export default PrivateRoute;
