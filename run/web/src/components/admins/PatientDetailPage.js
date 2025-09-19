import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import FeedbackListWithReply from './FeedbackListWithReply';
import './PatientDetailPage.css';

const PatientDetailPageB1 = () => {
    const { patientId } = useParams();
    const [patient, setPatient] = useState(null);
    const [appointments, setAppointments] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [medicalRecords, setMedicalRecords] = useState([]);
    const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchPatientDetails = async () => {
            try {
                const patientResponse = await axios.get(`http://localhost:8081/api/v1/patients/${patientId}`);
                setPatient(patientResponse.data);

                const appointmentsResponse = await axios.get(`http://localhost:8081/api/v1/patients/${patientId}/appointments`);
                setAppointments(appointmentsResponse.data);

                const medicalRecordsResponse = await axios.get(`http://localhost:8081/api/v1/medicalrecords/search?patient_id=${patientId}`);
                setMedicalRecords(medicalRecordsResponse.data);

                const doctorsResponse = await axios.get(`http://localhost:8081/api/v1/doctors/list`);
                setDoctors(doctorsResponse.data);

                const departmentsResponse = await axios.get(`http://localhost:8081/api/v1/departments/list`);
                setDepartments(departmentsResponse.data);
            } catch (error) {
                console.error('Error fetching patient details', error);
            }
        };

        fetchPatientDetails();
    }, [patientId]);

    const handleBack = () => {
        navigate('/patients');
    };

    const handleOpenFeedbackModal = () => {
        setIsFeedbackModalOpen(true);
    };

    const handleCloseFeedbackModal = () => {
        setIsFeedbackModalOpen(false);
    };

    const getDoctorName = (doctorId) => {
        const doctor = doctors.find(doc => doc.doctor_id === doctorId);
        return doctor ? doctor.doctor_name : 'Unknown Doctor';
    };

    const getDepartmentName = (departmentId) => {
        const department = departments.find(dep => dep.department_id === departmentId);
        return department ? department.department_name : 'Unknown Department';
    };

    const getTimeFromSlot = (slot) => {
        const slotToTime = {
            1: "08:00 - 09:00",
            2: "09:00 - 10:00",
            3: "10:00 - 11:00",
            4: "11:00 - 12:00",
            5: "13:00 - 14:00",
            6: "14:00 - 15:00",
            7: "15:00 - 16:00",
            8: "16:00 - 17:00"
        };
        return slotToTime[slot] || "Unknown Time";
    };

    const handleAppointmentClick = (appointmentId) => {
        navigate(`/appointments/${appointmentId}`);
    };

    return (
        <div className="patient-detail-pageB1">
            <Sidebar
                onInboxClick={handleOpenFeedbackModal}
                handleOpenDoctorsPage={() => navigate('/doctors')}
                handleOpenPatientsPage={() => navigate('/patients')}
                handleOpenAppointmentsPage={() => navigate('/appointments')}
                handleOpenStaffPage={() => navigate('/staff')}
                className="sidebarB1"
            />
            <div className="patient-contentB1">
                <div className="headerB1">
                    <h2>Patient Details</h2>
                    <button className="back-buttonB1" onClick={handleBack}>Patients List</button>
                </div>
                {patient ? (
                   <div className="doctor-info-v2025">
                        <div className="doctor-info-header-v2025">
                            <img src={patient.patient_img}
                                 className="doctor-avatar-v2025"
                                 alt="doctor"
                            />
                            <div className="doctor-name-section-v2025">
                                <h5>{patient.patient_name}</h5>
                            </div>
                        </div>
                        <div className="doctor-details-grid-v2025">
                            <div className="detail-item-v2025">
                                <div className="detail-icon-v2025">
                                    <svg fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                                    </svg>
                                </div>
                                <div className="detail-content-v2025">
                                    <div className="detail-label-v2025">Email</div>
                                    <div className="detail-value-v2025">{patient.patient_email}</div>
                                </div>
                            </div>
                            <div className="detail-item-v2025">
                                <div className="detail-icon-v2025">
                                    <svg fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                                    </svg>
                                </div>
                                <div className="detail-content-v2025">
                                    <div className="detail-label-v2025">birthday</div>
                                    <div className="detail-value-v2025">{patient.patient_dob}</div>
                                </div>
                            </div>
                            <div className="detail-item-v2025">
                                <div className="detail-icon-v2025">
                                    <svg fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                                    </svg>
                                </div>
                                <div className="detail-content-v2025">
                                    <div className="detail-label-v2025">Address</div>
                                    <div className="detail-value-v2025">{patient.patient_address}</div>
                                </div>
                            </div>
                            <div className="detail-item-v2025">
                                <div className="detail-icon-v2025">
                                    <svg fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                    </svg>
                                </div>
                                <div className="detail-content-v2025">
                                    <div className="detail-label-v2025">Phone</div>
                                    <div className="detail-value-v2025">
                                        <span className="working-status-v2025">
                                            {patient.patient_phone}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <p>Loading patient details...</p>
                )}
                <div className="appointments-containerB1">
                    <div className="appointments-cardB1">
                        <h6>Appointments</h6>
                        <div className="table-containerB1">
                            <table>
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Date</th>
                                        <th>Time</th>
                                        <th>Doctor</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {appointments.length > 0 ? (
                                        appointments.map(appointment => (
                                            <tr
                                                key={appointment.appointment_id}
                                                onClick={() => handleAppointmentClick(appointment.appointment_id)}
                                            >
                                                <td>{appointment.appointment_id}</td>
                                                <td>{new Date(appointment.medical_day).toLocaleDateString()}</td>
                                                <td>{getTimeFromSlot(appointment.slot)}</td>
                                                <td>{appointment.doctor?.[0]?.doctor_name || ''}</td>
                                                <td>{appointment.status}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5">No appointments found.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                {medicalRecords && (
                    <div className="appointments-containerB1">
                        <div className="appointments-cardB1">
                            <h6>Medical Records</h6>
                            <div className="table-containerB1">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Date</th>
                                            <th>Department</th>
                                            <th>Doctor</th>
                                            <th>Symptoms</th>
                                            <th>Diagnosis</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {medicalRecords.length > 0 ? (
                                            medicalRecords.map(medicalRecord => (
                                                <tr key={medicalRecord.record_id}>
                                                    <td>{medicalRecord.record_id}</td>
                                                    <td>{medicalRecord.follow_up_date}</td>
                                                    <td>{medicalRecord.doctors.map(doc => getDepartmentName(doc.department_id)).join(', ')}</td>
                                                    <td>{getDoctorName(medicalRecord.doctor_id)}</td>
                                                    <td>{medicalRecord.symptoms}</td>
                                                    <td>{medicalRecord.diagnosis}</td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="6">No medical records found.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
                {isFeedbackModalOpen && (
                    <div className="feedback-modalB1">
                        <div className="overlay-contentB1">
                            <button onClick={handleCloseFeedbackModal} className="close-buttonB1">
                                ×
                            </button>
                            <FeedbackListWithReply onClose={handleCloseFeedbackModal} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PatientDetailPageB1;