import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar'; // Đảm bảo đường dẫn đúng đến component Sidebar
import FeedbackListWithReply from './FeedbackListWithReply'; // Import FeedbackListWithReply component
import './StaffDetailPage.css'; // Đảm bảo đường dẫn đúng đến tệp CSS của bạn

const StaffDetailPage = () => {
    const { staffId } = useParams();
    const [staff, setStaff] = useState(null);
    const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchStaffDetails = async () => {
            try {
                const response = await axios.get(`http://localhost:8081/api/v1/staffs/${staffId}`);
                setStaff(response.data);
            } catch (error) {
                console.error('Error fetching staff details', error);
            }
        };

        fetchStaffDetails();
    }, [staffId]);

    const handleBack = () => {
        navigate('/staff');
    };

    const handleOpenFeedbackModal = () => {
        setIsFeedbackModalOpen(true);
    };

    const handleCloseFeedbackModal = () => {
        setIsFeedbackModalOpen(false);
    };

    return (
        <div className="staff-detail-page">
            <Sidebar
                onInboxClick={handleOpenFeedbackModal}
                handleOpenDoctorsPage={() => navigate('/doctors')}
                handleOpenPatientsPage={() => navigate('/patients')}
                handleOpenAppointmentsPage={() => navigate('/appointments')}
                handleOpenStaffPage={() => navigate('/staff')}
            />
            <div className="content">
                <div className="header">
                    <h2>Staff Details</h2>
                    <button className="back-button" onClick={handleBack}>Back to Staff Page</button>
                </div>
                {staff ? (
                    <div className="staff-info">
                        <h5>{staff.staff_name}</h5>
                        <p>Email: {staff.staff_email}</p>
                        <p>Phone: {staff.staff_phone}</p>
                        <p>Address: {staff.staff_address}</p>
                    </div>
                ) : (
                    <p>Loading staff details...</p>
                )}
                {isFeedbackModalOpen && (
                    <div className="feedback-modal">
                        <FeedbackListWithReply onClose={handleCloseFeedbackModal} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default StaffDetailPage;
