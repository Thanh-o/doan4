import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import FeedbackListWithReply from './FeedbackListWithReply';
import AppointmentsChart from './AppointmentsChart';
import AppointmentStatusPieChart from './AppointmentStatusPieChart';
import './DoctorDetailPage.css';

const DoctorDetailPage = () => {
    const { doctorId } = useParams();
    const [doctor, setDoctor] = useState(null);
    const [weekAppointments, setWeekAppointments] = useState([]);
    const [lastMonthAppointments, setLastMonthAppointments] = useState([]);
    const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [departments, setDepartments] = useState([]);

    const navigate = useNavigate();

    useEffect(() => {
        fetchAllData();
    }, [doctorId]);

    const fetchAllData = async () => {
        setLoading(true);
        try {
            await Promise.all([
                fetchDoctorDetails(),
                fetchWeekAppointments(),
                fetchLastMonthAppointments(),
                fetchDepartments()
            ]);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchDepartments = async () => {
        try {
            const response = await axios.get('http://localhost:8081/api/v1/departments/list');
            setDepartments(response.data);
        } catch (error) {
            console.error('Error fetching departments', error);
        }
    };

    const fetchDoctorDetails = async () => {
        try {
            const doctorResponse = await axios.get(`http://localhost:8081/api/v1/doctors/${doctorId}`);
            setDoctor(doctorResponse.data);
        } catch (error) {
            console.error('Error fetching doctor details', error);
        }
    };

    const fetchWeekAppointments = async () => {
        try {
            const today = new Date(); // Use current date
            const startDate = today.toISOString().split('T')[0]; // e.g., 2025-07-16
            const endDate = new Date(today.setDate(today.getDate() + 7)).toISOString().split('T')[0]; // e.g., 2025-07-22
            const response = await axios.get(`http://localhost:8081/api/v1/appointments/search`, {
                params: {
                    doctor_id: doctorId,
                    start_date: startDate,
                    end_date: endDate,
                }
            });
            // Additional client-side filtering to ensure correct date range
            const filteredAppointments = response.data.filter(appointment => {
                const appointmentDate = new Date(appointment.medical_day);
                return appointmentDate >= new Date(startDate) && appointmentDate <= new Date(endDate);
            });
            setWeekAppointments(filteredAppointments);
        } catch (error) {
            console.error("Error fetching week's appointments", error);
        }
    };

    const fetchLastMonthAppointments = async () => {
        try {
            const today = new Date(); // Use current date
            const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1).toISOString().split('T')[0]; // e.g., 2025-06-01
            const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0).toISOString().split('T')[0]; // e.g., 2025-06-30
            const response = await axios.get(`http://localhost:8081/api/v1/appointments/search`, {
                params: {
                    doctor_id: doctorId,
                    start_date: startOfLastMonth,
                    end_date: endOfLastMonth,
                }
            });
            // Additional client-side filtering to ensure only last month's appointments
            const filteredAppointments = response.data.filter(appointment => {
                const appointmentDate = new Date(appointment.medical_day);
                return appointmentDate >= new Date(startOfLastMonth) && appointmentDate <= new Date(endOfLastMonth);
            });
            setLastMonthAppointments(filteredAppointments);
        } catch (error) {
            console.error('Error fetching last month appointments', error);
        }
    };

    const getDepartmentNameById = (id) => {
        const dept = departments.find(d => d.department_id === id);
        return dept ? dept.department_name : 'Unknown Department';
    };

    const handleBack = () => {
        navigate('/doctors');
    };

    const handleOpenFeedbackModal = () => {
        setIsFeedbackModalOpen(true);
    };

    const handleCloseFeedbackModal = () => {
        setIsFeedbackModalOpen(false);
    };
        const handleAppointmentClick = (appointmentId) => {
        navigate(`/appointments/${appointmentId}`);
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

    const getStatusClass = (status) => {
        switch (status?.toLowerCase()) {
            case 'missed':
                return 'status-v2025 MISSED-v2025';
            case 'pending':
                return 'status-v2025 PENDING-v2025';
            case 'cancelled':
            case 'canceled': // Handle both spellings
                return 'status-v2025 CANCELLED-v2025';
            case 'completed':
                return 'status-v2025 COMPLETED-v2025';
            default:
                return 'status-v2025';
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const renderEmptyState = (message) => (
        <div className="empty-state-v2025">
            <div className="empty-state-icon-v2025">
                <svg fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                </svg>
            </div>
            <div className="empty-state-text-v2025">{message}</div>
        </div>
    );

    if (loading) {
        return (
            <div className="doctor-detail-page-v2025">
                <Sidebar
                    onInboxClick={handleOpenFeedbackModal}
                    handleOpenDoctorsPage={() => navigate('/doctors')}
                    handleOpenPatientsPage={() => navigate('/patients')}
                    handleOpenAppointmentsPage={() => navigate('/appointments')}
                    handleOpenStaffPage={() => navigate('/staff')}
                />
                <div className="content-v2025">
                    <div className="loading-spinner-v2025">
                        <div className="spinner-v2025"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="doctor-detail-page-v2025">
            <Sidebar
                onInboxClick={handleOpenFeedbackModal}
                handleOpenDoctorsPage={() => navigate('/doctors')}
                handleOpenPatientsPage={() => navigate('/patients')}
                handleOpenAppointmentsPage={() => navigate('/appointments')}
                handleOpenStaffPage={() => navigate('/staff')}
            />
            <div className="content-v2025">
                <div className="header-v2025">
                    <h2>Doctor Details</h2>
                    <button className="back-button-v2025" onClick={handleBack}>
                        Doctors List
                    </button>
                </div>

                {doctor && (
                    <div className="doctor-info-v2025">
                        <div className="doctor-info-header-v2025">
                            <img src={doctor.doctor_image}
                                 className="doctor-avatar-v2025"
                                 alt="doctor"
                            />
                            <div className="doctor-name-section-v2025">
                                <h5>{doctor.doctor_name}</h5>
                                <div className="doctor-specialty-v2025">{getDepartmentNameById(doctor.department_id)}</div>
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
                                    <div className="detail-value-v2025">{doctor.doctor_email}</div>
                                </div>
                            </div>
                            <div className="detail-item-v2025">
                                <div className="detail-icon-v2025">
                                    <svg fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                                    </svg>
                                </div>
                                <div className="detail-content-v2025">
                                    <div className="detail-label-v2025">Phone</div>
                                    <div className="detail-value-v2025">{doctor.doctor_phone}</div>
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
                                    <div className="detail-value-v2025">{doctor.doctor_address}</div>
                                </div>
                            </div>
                            <div className="detail-item-v2025">
                                <div className="detail-icon-v2025">
                                    <svg fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                    </svg>
                                </div>
                                <div className="detail-content-v2025">
                                    <div className="detail-label-v2025">Price</div>
                                    <div className="detail-value-v2025">
                                        <span className="working-status-v2025">
                                            {doctor.doctor_price ? `$ ${doctor.doctor_price} ` : ''}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="appointments-container-v2025">
                    <div className="appointments-card-v2025">
                        <div className="appointments-card-header-v2025">
                            <h2>Last Month's Appointment Status</h2>
                        </div>
                        <div className="chart-container-v2025">
                            {lastMonthAppointments.length > 0 ? (
                                <AppointmentStatusPieChart className="chart" appointments={lastMonthAppointments} />
                            ) : (
                                renderEmptyState('No appointments last month')
                            )}
                        </div>
                    </div>

                    <div className="appointments-card-v2025">
                        <div className="appointments-card-header-v2025">
                            <h2>Week's Appointments by Day</h2>
                        </div>
                        <div className="chart-container-v2025">
                            <h2>Appointment Statistics</h2>
                            {weekAppointments.length > 0 ? (
                                <AppointmentsChart className="chart" appointments={weekAppointments.map(apt => ({
                                    ...apt,
                                    appointment_date: apt.medical_day
                                }))} />
                            ) : (
                                renderEmptyState('No appointments this week')
                            )}
                        </div>
                    </div>
                </div>

                <div className="appointments-container-v20255">
                    <div className="appointments-card-v2025">
                        <div className="appointments-card-header-v2025">
                            <h2>Appointments (Today to Next 7 Days)</h2>
                        </div>
                                               <div className="table-container-v2025">
                            {weekAppointments.length > 0 ? (
                               <table>
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Date</th>
                                            <th>Time</th>
                                            <th>Patient</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {weekAppointments.map(appointment => (
                                            <tr 
                                                key={appointment.appointment_id} 
                                                onClick={() => handleAppointmentClick(appointment.appointment_id)}
                                                style={{ cursor: 'pointer' }}
                                            >
                                                <td>{appointment.appointment_id}</td>
                                                <td>{formatDate(appointment.medical_day)}</td>
                                                <td>
                                                    <span className="time-slot-v2025">
                                                        {getTimeFromSlot(appointment.slot)}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className="patient-name-v2025">
                                                        {appointment.patient?.[0]?.patient_name || ''}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className={getStatusClass(appointment.status)}>
                                                        {appointment.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                renderEmptyState('No appointments in the next 7 days')
                            )}
                        </div>
                    </div>
                </div>

                {isFeedbackModalOpen && (
                    <div className="feedback-modal-v2025">
                        <FeedbackListWithReply onClose={handleCloseFeedbackModal} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default DoctorDetailPage;