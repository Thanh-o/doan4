import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar'; // Đảm bảo đường dẫn đúng đến component Sidebar
import FeedbackListWithReply from './FeedbackListWithReply';
import './PatientsPage.css'; // Đảm bảo đường dẫn đúng đến tệp CSS của bạn

const PatientsPage = () => {
    const [patients, setPatients] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchPatients = async () => {
            try {
                const response = await axios.get('http://localhost:8081/api/v1/patients/list');
                setPatients(response.data);
            } catch (error) {
                console.error('Error fetching patients', error);
            }
        };
        fetchPatients();
    }, []);

    const handleOpenFeedbackModal = () => {
        setIsFeedbackModalOpen(true);
    };

    const handleCloseFeedbackModal = () => {
        setIsFeedbackModalOpen(false);
    };

    const handleOpenDoctorsPage = () => {
        navigate('/doctors');
    };

    const handleOpenPatientsPage = () => {
        navigate('/patients');
    };

    const handleOpenAppointmentsPage = () => {
        navigate('/appointments');
    };

    const handleOpenStaffPage = () => {
        navigate('/staff');
    };

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const handleSearch = async () => {
        try {
            const response = await axios.get('http://localhost:8081/api/v1/patients/search-new', {
                params: { keyword: searchQuery }
            });
            setPatients(response.data);
            if (response.data.length > 0) {
                handlePatientClick(response.data[0].patient_id);
            } else {
                alert('No patients found');
            }
        } catch (error) {
            console.error('Error searching patients', error);
        }
    };

    const handlePatientClick = (patientId) => {
        navigate(`/patients/${patientId}`);
    };

    return (
        <div className="patients-page">
            <Sidebar
                onInboxClick={handleOpenFeedbackModal}
                handleOpenDoctorsPage={handleOpenDoctorsPage}
                handleOpenPatientsPage={handleOpenPatientsPage}
                handleOpenAppointmentsPage={handleOpenAppointmentsPage}
                handleOpenStaffPage={handleOpenStaffPage}
            />
            <div className="content">
                <div className="header">
                    <h2>Patients List</h2>
                    <div className="search">
                        <div className="input-container">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={handleSearchChange}
                            />
                            <label>Name or Email</label>
                        </div>
                        <button onClick={handleSearch}>Search</button>
                    </div>
                </div>
                <div className="table-container-1">
                <table>
                        <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>Address</th>
                        </tr>
                        </thead>
                        <tbody>
                        {patients.length > 0 ? (
                            patients.map((patient) => (
                                <tr key={patient.patient_id} onClick={() => handlePatientClick(patient.patient_id)}>
                                    <td>{patient.patient_id}</td>
                                    <td>{patient.patient_name}</td>
                                    <td>{patient.patient_email}</td>
                                    <td>{patient.patient_phone}</td>
                                    <td>{patient.patient_address}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} align="center">No patients found</td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>
                {isFeedbackModalOpen && (
                    <div className="feedback-modal">
                        <FeedbackListWithReply onClose={handleCloseFeedbackModal} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default PatientsPage;
