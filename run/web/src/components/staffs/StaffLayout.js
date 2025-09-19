import React from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import './StaffLayout.css';

const StaffLayout = ({ children }) => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('role');
        localStorage.removeItem('staffId');
        navigate('/stafflogin');
    };

    return (
        <div className="staff-layout">
            <header className="app-bar">
                <div className="toolbar">
                    <h1 className="title">Staff Dashboard</h1>
                    <button onClick={handleLogout}>
                        Logout
                        <img
                            width="20"
                            height="20"
                            src="https://img.icons8.com/ios/50/FFFFFF/exit--v1.png"
                            alt="exit--v1"
                        />
                    </button>
                </div>
            </header>
            <div className="staff-ctm">
                <Sidebar />
                <main className="main-content-staff">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default StaffLayout;
