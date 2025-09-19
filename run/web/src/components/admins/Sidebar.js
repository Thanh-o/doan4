// src/components/admins/Sidebar.js
import { useNavigate } from 'react-router-dom';
import React from 'react';
import './Sidebar.css'; // Import CSS for Sidebar

const Sidebar = ({
                     onInboxClick,
                     handleOpenDoctorsPage,
                     handleOpenPatientsPage,
                     handleOpenAppointmentsPage,
                     handleOpenStaffPage
                 }) => {
    const navigate = useNavigate();

    const handleBack = () => {
        navigate('/admindashboard');
    };
    return (
        <div className="sidebar">
            <div className="sidebar-header">
                <h2>Admin Dashboard</h2>
            </div>
            <div className="sidebar-menu">
                <ul>
                    <li onClick={handleBack}>
                        <span className="icon"><img width="30" height="30"
                                                    src="https://img.icons8.com/ios/50/FFFFFF/control-panel--v2.png"
                                                    alt="control-panel--v2"/></span>
                        <span className="text">Dashboard</span>
                    </li>
                    <li onClick={handleOpenDoctorsPage}>
                        <span className="icon"><img width="30" height="30"
                                                    src="https://img.icons8.com/external-outline-lafs/64/FFFFFF/external-doctors-medicine-outline-part-1-v2-outline-lafs.png"
                                                    alt="external-doctors-medicine-outline-part-1-v2-outline-lafs"/></span>
                        <span className="text">Departments & Doctors</span>
                    </li>
                    <li onClick={handleOpenPatientsPage}>
                        <span className="icon"><img width="30" height="30"
                                                    src="https://img.icons8.com/external-others-pike-picture/50/FFFFFF/external-agreement-health-insurance-care-others-pike-picture-26.png"
                                                    alt="external-agreement-health-insurance-care-others-pike-picture-26"/></span>
                        <span className="text">Patients</span>
                    </li>
                    <li onClick={handleOpenAppointmentsPage}>
                        <span className="icon"><img width="30" height="30"
                                                    src="https://img.icons8.com/external-others-iconmarket/64/FFFFFF/external-appointments-health-and-medical-others-iconmarket-4.png"
                                                    alt="external-appointments-health-and-medical-others-iconmarket-4"/></span>
                        <span className="text">Appointments</span>
                    </li>
                    <li onClick={handleOpenStaffPage}>
                        <span className="icon"><img width="30" height="30"
                                                    src="https://img.icons8.com/ios/50/FFFFFF/user-group-man-man.png"
                                                    alt="user-group-man-man"/></span>
                        <span className="text">Staffs</span>
                    </li>
                    <li onClick={onInboxClick}>
                        <span className="icon"><img width="30" height="30"
                                                    src="https://img.icons8.com/ios/50/FFFFFF/download-mail.png"
                                                    alt="download-mail"/></span>
                        <span className="text">Feedbacks</span>
                    </li>
                </ul>
            </div>
        </div>
    );
};

export default Sidebar;
