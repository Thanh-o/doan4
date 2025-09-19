import React from 'react';
import {useNavigate} from 'react-router-dom';
import './Sidebar.css';

const Sidebar = ({
                     handleOpenTodayAppointments,
                     handleOpenMonthlyAppointments,
                     handleOpenMedicalRecords
                 }) => {
    const navigate = useNavigate();

    const handleBack = () => {
        navigate('/doctordashboard');
    };

    return (<div className="sidebar">
            <div className="sidebar-header">
                <h2>Doctor Dashboard</h2>
            </div>
            <div className="sidebar-menu">
                <ul>
                    <li onClick={handleBack}>
                <span className="icon">
                    <img width="30" height="30" src="https://img.icons8.com/ios/50/FFFFFF/control-panel--v2.png"
                         alt="control-panel--v2"/>
                </span>
                        <span className="text">Dashboard</span>
                    </li>
                    <li onClick={handleOpenTodayAppointments}>
                <span className="icon">
                    <img width="30" height="30" src="https://img.icons8.com/ios/50/FFFFFF/today.png" alt="today"/>
                </span>
                        <span className="text">Today's Appointments</span>
                    </li>
                    <li onClick={handleOpenMonthlyAppointments}>
                <span className="icon">
                    <img width="30" height="30" src="https://img.icons8.com/ios/50/FFFFFF/overtime--v1.png"
                         alt="overtime--v1"/>
                </span>
                        <span className="text">Monthly Appointments</span>
                    </li>
                    <li onClick={handleOpenMedicalRecords}>
                <span className="icon">
                    <img width="30" height="30" src="https://img.icons8.com/ios/50/FFFFFF/test-results.png"
                         alt="test-results"/>
                </span>
                        <span className="text">Medical Records</span>
                    </li>
                </ul>
            </div>

        </div>);
};

export default Sidebar;
