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
        navigate(-1);
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

                    <button className="back-buttonB1" onClick={handleBack}>  ← Back</button>
                    <h2>Patient Details</h2>
                    <p></p>
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
/* Reset default styles and ensure full-screen layout */
html, body, #root {
height: 100%;
width: 100%;
margin: 0;
padding: 0;
display: flex;
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* Main container for PatientDetailPage */
.patient-detail-pageB1 {
display: flex;
height: 100%;
width: 100%;
overflow: hidden;
}

/* Sidebar styling (consistent with DoctorsPageA1) */
.sidebarB1 {
width: 280px;
flex-shrink: 0;
height: 100vh;
background-color: #ffffff;
box-shadow: 4px 0 16px rgba(0, 0, 0, 0.1);
overflow-y: auto;
transition: width 0.3s ease, transform 0.3s ease;
}

/* Patient content container */
.patient-contentB1 {
flex: 1;
padding: 24px;
background-color: #f5f7fa;
overflow-y: auto;
display: flex;
flex-direction: column;
gap: 32px;
height: 90vh;
}

/* Header styling */
.headerB1 {
display: flex;
justify-content: space-between;
align-items: center;
gap: 16px;
flex-wrap: wrap;
}

.headerB1 h2 {
margin: 0;
font-size: 30px;
font-weight: 700;
color: #1e3a8a;
letter-spacing: -0.03em;
}

/* Back button */
.back-buttonB1 {
padding: 12px 24px;
background-color: #1e3a8a;
color: #ffffff;
border: none;
border-radius: 8px;
cursor: pointer;
font-size: 16px;
font-weight: 500;
transition: background-color 0.3s ease, transform 0.2s ease;
}

.back-buttonB1:hover {
background-color: #1e40af;
transform: translateY(-2px);
}

.back-buttonB1:active {
transform: translateY(0);
}

/* Patient info section */
.patient-infoB1 {
background-color: #004b91;
color: #ffffff;
padding: 24px;
border-radius: 12px;
box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
display: flex;
flex-direction: row;
gap: 24px;
align-items: center;
}

.patient-infoB1 img {
width: 120px;
height: 120px;
border-radius: 50%;
object-fit: cover;
border: 3px solid #ffffff;
box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.patient-infoB1 .info-text {
display: flex;
flex-direction: column;
gap: 12px;
}

.patient-infoB1 p {
margin: 0;
font-size: 16px;
line-height: 1.5;
}

.patient-infoB1 p strong {
font-weight: 600;
color: #ffffff;
}

/* Appointments and medical records container */
.appointments-containerB1 {
display: flex;
flex-direction: column;
gap: 24px;
}

/* Appointments and medical records card */
.appointments-cardB1 {
border-radius: 12px;
margin-top: 26px;
}

.appointments-cardB1 h6 {
margin: 0 0 16px 0;
font-size: 20px;
font-weight: 600;
color: #1e3a8a;
}

/* Table container */
.table-containerB1 {
width: 100%;
overflow-y: auto;
overflow-x: auto;
background-color: #ffffff;
border-radius: 12px;
scrollbar-width: thin;
scrollbar-color: #1e3a8a #e5e7eb;
}

.table-containerB1::-webkit-scrollbar {
width: 8px;
}

.table-containerB1::-webkit-scrollbar-track {
background: #e5e7eb;
border-radius: 12px;
}

.table-containerB1::-webkit-scrollbar-thumb {
background-color: #1e3a8a;
border-radius: 12px;
border: 2px solid #e5e7eb;
}

/* Table styling */
table {
width: 100%;
border-collapse: separate;
border-spacing: 0;
}

th, td {
padding: 16px;
text-align: left;
border-bottom: 1px solid #e5e7eb;
}

th {
background-color: #004b91;
font-weight: 600;
color: #f1f1f1;
font-size: 13px;
text-transform: uppercase;
letter-spacing: 0.05em;
position: sticky;
top: 0;
z-index: 1;
}

td {
font-size: 14px;
color: #374151;
}

tr:last-child td {
border-bottom: none;
}

tr:hover {
background-color: #f3f4f6;
cursor: pointer;
}

/* Animations */
@keyframes fadeIn {
from { opacity: 0; }
to { opacity: 1; }
}

@keyframes slideUp {
from { transform: translateY(30px); opacity: 0; }
to { transform: translateY(0); opacity: 1; }
}

/* Overlay content */
.overlay-contentB1 {
background: #ffffff;
padding: 40px;
border-radius: 16px;
width: 90%;
max-width: 900px;
max-height: 90vh;
overflow-y: auto;
position: relative;
box-shadow: 0 12px 32px rgba(0, 0, 0, 0.25);
animation: slideUp 0.4s ease;
}

/* Close button */
.close-buttonB1 {
position: absolute;
top: 16px;
right: 16px;
background: #dc2626;
color: #ffffff;
border: none;
border-radius: 50%;
width: 40px;
height: 40px;
cursor: pointer;
font-size: 20px;
display: flex;
align-items: center;
justify-content: center;
transition: background-color 0.3s ease, transform 0.2s ease;
}

.close-buttonB1:hover {
background-color: #b91c1c;
transform: rotate(90deg);
}

/* Search results page */
.search-results-pageB1 {
display: flex;
height: 100vh;
width: 100vw;
}

/* Result container */
.result-containerB1 {
padding: 32px;
width: 100%;
height: 100%;
overflow-y: auto;
background-color: #f5f7fa;
}

/* Result list */
.result-containerB1 ul {
display: flex;
flex-direction: column;
width: 100%;
gap: 24px;
margin: 0;
padding: 0;
}

/* Result list item */
.result-containerB1 ul li {
list-style-type: none;
width: 100%;
}

/* Result div */
.result-divB1 {
width: 100%;
max-width: 800px;
display: flex;
flex-direction: row;
background-color: #ffffff;
box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
padding: 16px;
border-radius: 12px;
transition: background-color 0.3s ease, transform 0.2s ease;
}

.result-divB1:hover {
background-color: #f3f4f6;
transform: translateY(-4px);
cursor: pointer;
}

.result-divB1 div {
width: 50%;
padding: 8px;
font-size: 15px;
color: #374151;
}

/* Result heading */
.result-containerB1 h3 {
margin: 0 0 16px 0;
font-size: 24px;
font-weight: 600;
color: #1e3a8a;
}

/* Responsive adjustments */
@media (max-width: 768px) {
.sidebarB1 {
width: 80px;
}

    .patient-contentB1,
    .result-containerB1 {
        padding: 24px;
    }

    .headerB1 h2 {
        font-size: 24px;
    }

    .patient-infoB1 {
        flex-direction: column;
        align-items: flex-start;
    }

    .patient-infoB1 img {
        width: 80px;
        height: 80px;
    }

    .result-divB1 {
        flex-direction: column;
        max-width: 100%;
    }

    .result-divB1 div {
        width: 100%;
    }

    .overlay-contentB1 {
        width: 95%;
        padding: 24px;
    }
}

@media (max-width: 480px) {
.headerB1 {
flex-direction: column;
align-items: flex-start;
gap: 12px;
}

    .back-buttonB1 {
        width: 100%;
    }

    .result-divB1 div {
        padding: 4px;
    }

    .patient-infoB1 img {
        width: 60px;
        height: 60px;
    }
}