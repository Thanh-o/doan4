import React, {useEffect, useState} from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Sidebar from "./Sidebar";
import FeedbackListWithReply from "./FeedbackListWithReply";
import axios from "axios";

const SearchResultsDoctors = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { searchResults } = location.state;
    const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
    const [patients, setPatients] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [departments, setDepartments] = useState([]);
    const handleOpenFeedbackModal = () => {
        setIsFeedbackModalOpen(true);
    };
    const handleCloseFeedbackModal = () => {
        setIsFeedbackModalOpen(false);
    };
    const handleDoctorClick = (doctorId) => {
        navigate(`/doctors/${doctorId}`);
    };
    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const [patientResponse, doctorsResponse, departmentsResponse] = await Promise.all([
                    axios.get('http://localhost:8081api/v1/patients/list'),
                    axios.get('http://localhost:8081/api/v1/doctors/list'),
                    axios.get('http://localhost:8081/api/v1/departments/list')
                ]);

                setPatients(patientResponse.data);
                setDoctors(doctorsResponse.data);
                setDepartments(departmentsResponse.data);
            } catch (error) {
                console.error('Error fetching details', error);
            }
        };

        fetchDetails();
    }, []);
    console.log(searchResults)
    const getDepartmentName = (doctorId) => {
        const doctor = doctors.find(doc => doc.doctor_id === doctorId);
        if (doctor) {
            const department = departments.find(dep => dep.department_id === doctor.department_id);
            return department ? department.department_name : 'Unknown Department';
        }
        return 'Unknown Department';
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
            <h2>Search Results for Doctors</h2>
            {searchResults.length > 0 ? (
                <ul>
                    {searchResults.map((result) => (
                        <li key={result.appointment_id} onClick={() => handleDoctorClick(result.doctor_id)}>
                            <h3>Doctor ID: {result.doctor_id}</h3>
                            <div className="result-div">
                                <div>
                                    <p><strong>Doctor Name:</strong> {result.doctor_name}</p>
                                    <p><strong>Department:</strong> {getDepartmentName(result.doctor_id)}</p>
                                    <p><strong>Email:</strong> {result.doctor_email}</p>
                                </div>
                                <div>
                                    <p><strong>Address:</strong> {result.doctor_address}</p>
                                    <p><strong>Phone:</strong> {result.doctor_phone}</p>
                                </div>
                                <div>
                                    <p><strong>Price:</strong> {result.doctor_price}$</p>
                                    <p><strong>Status:</strong> {result.working_status}</p>
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

export default SearchResultsDoctors;
