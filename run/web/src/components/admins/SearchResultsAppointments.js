import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Sidebar from "./Sidebar";
import FeedbackListWithReply from "./FeedbackListWithReply";
import axios from "axios";

const SearchResultsAppointments = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { searchResults } = location.state || {};
    const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
    const [patients, setPatients] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [departments, setDepartments] = useState([]);

    const handleOpenFeedbackModal = () => setIsFeedbackModalOpen(true);
    const handleCloseFeedbackModal = () => setIsFeedbackModalOpen(false);
    const handleAppointmentClick = (appointmentId) => navigate(`/appointments/${appointmentId}`);

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    const convertSlotToTime = (slot) => {
        const slotMapping = {
            1: '08:00 AM - 09:00 AM',
            2: '09:00 AM - 10:00 AM',
            3: '10:00 AM - 11:00 AM',
            4: '11:00 AM - 12:00 PM',
            5: '01:00 PM - 02:00 PM',
            6: '02:00 PM - 03:00 PM',
            7: '03:00 PM - 04:00 PM',
            8: '04:00 PM - 05:00 PM'
        };
        return slotMapping[slot] || '';
    };

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const [patientResponse, doctorsResponse, departmentsResponse] = await Promise.all([
                    axios.get('http://localhost:8081/api/v1/patients/list'),
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

    const getDoctorName = (doctorId) => {
        const doctor = doctors.find(doc => doc.doctor_id === doctorId);
        return doctor ? doctor.doctor_name : 'Unknown Doctor';
    };

    const getDepartmentName = (doctorId) => {
        const doctor = doctors.find(doc => doc.doctor_id === doctorId);
        if (doctor) {
            const department = departments.find(dep => dep.department_id === doctor.department_id);
            return department ? department.department_name : 'Unknown Department';
        }
        return 'Unknown Department';
    };

    const getPatientName = (patientId) => {
        const patient = patients.find(pat => pat.patient_id === patientId);
        return patient ? patient.patient_name : 'Unknown Patient';
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
                <h2>Search Results for Appointments</h2>
                {searchResults && searchResults.length > 0 ? (
                    <ul>
                        {searchResults.map((result) => (
                            <li key={result.appointment_id} onClick={() => handleAppointmentClick(result.appointment_id)}>
                                <h3>Appointment ID: {result.appointment_id}</h3>
                                <div className="result-div">
                                    <div>
                                        <p><strong>Patient Name:</strong> {getPatientName(result.patient_id)}</p>
                                        <p><strong>Department:</strong> {getDepartmentName(result.doctor_id)}</p>
                                        <p><strong>Doctor Name:</strong> {getDoctorName(result.doctor_id)}</p>
                                    </div>
                                    <div>
                                        <p><strong>Appointment Date:</strong> {formatDate(result.medical_day)}</p>
                                        <p><strong>Appointment Time:</strong> {convertSlotToTime(result.slot)}</p>
                                    </div>
                                    <div>
                                        <p><strong>Price:</strong> {result.price}$</p>
                                        <p><strong>Status:</strong> {result.status}</p>
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

export default SearchResultsAppointments;
