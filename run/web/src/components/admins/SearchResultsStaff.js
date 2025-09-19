import React, {useState} from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import FeedbackListWithReply from "./FeedbackListWithReply";
import Sidebar from "./Sidebar";

const SearchResultsStaff = () => {
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
    const handleStaffClick = (staffId) => {
        navigate(`/staffs/${staffId}`);
    };

    console.log(searchResults)

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
            <h2>Search Results for Staff</h2>
            {searchResults.length > 0 ? (
                <ul>
                    {searchResults.map((result) => (
                        <li key={result.staff_id}>
                            <h3>Staff ID: {result.staff_id}</h3>
                            <div className="result-div">
                                <div>
                                    <p><strong>Staff Name:</strong> {result.staff_name}</p>
                                    <p><strong>Phone:</strong> {result.staff_phone}</p>
                                </div>
                                <div>
                                    <p><strong>Username:</strong> {result.staff_username}</p>
                                    <p><strong>Password:</strong> {result.staff_password}</p>
                                </div>
                                <div>
                                    <p><strong>Address:</strong> {result.staff_address}</p>
                                    <p><strong>Status:</strong> {result.staff_status}</p>
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

export default SearchResultsStaff;
