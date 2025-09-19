import React, {useState} from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Sidebar from "./Sidebar";
import FeedbackListWithReply from "./FeedbackListWithReply";

const SearchResultsPatients = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { searchResults } = location.state;
    const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);

    const handleOpenFeedbackModal = () => {
        setIsFeedbackModalOpen(true);
    };
    const handleCloseFeedbackModal = () => {
        setIsFeedbackModalOpen(false);
    };
    const handlePatientClick = (patientId) => {
        navigate(`/patients/${patientId}`);
    };

    return (
        <div className="search-results-page">
            <Sidebar
                onInboxClick={handleOpenFeedbackModal}
                handleOpenDoctorsPage={() => navigate('/doctors')}
                handleOpenPatientsPage={() => navigate('/patients')}
                handleOpenAppointmentsPage={() => navigate('/appointments')}
                handleOpenStaffPage={() => navigate('/staff')}
            />
            <div className="result-container">
                <h2>Search Results for Patients</h2>
                {searchResults.length > 0 ? (
                    <ul>
                        {searchResults.map((result) => (
                            <li key={result.patient_id} onClick={() => handlePatientClick(result.patient_id)}>
                                <h3>Patient ID: {result.patient_id}</h3>
                                <div className="result-div">
                                    <div>
                                        <p><strong>Patient Name:</strong> {result.patient_name}</p>
                                        <p><strong>Email:</strong> {result.patient_email}</p>
                                    </div>
                                    <div>
                                        <p><strong>Phone:</strong> {result.patient_phone}</p>
                                        <p><strong>Address:</strong> {result.patient_address}</p>
                                    </div>
                                    <div>
                                        <p><strong>Date of Birth:</strong> {result.patient_dob}</p>
                                        <p><strong>Gender:</strong> {result.patient_gender}</p>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No results found.</p>
                )}
                {isFeedbackModalOpen && (
                    <div className="feedback-modal">
                        <FeedbackListWithReply onClose={handleCloseFeedbackModal}/>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SearchResultsPatients;
