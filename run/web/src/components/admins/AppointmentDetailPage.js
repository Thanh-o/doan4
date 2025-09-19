import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import FeedbackListWithReply from './FeedbackListWithReply';
import './AppointmentDetailPage.css';

const AppointmentDetailPageC1 = () => {
    const { appointmentId } = useParams();
    const [appointment, setAppointment] = useState(null);
    const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
    const [departmentData, setDepartmentData] = useState({});
    const navigate = useNavigate();

    useEffect(() => {
        const fetchAppointmentDetails = async () => {
            try {
                const response = await axios.get(`http://localhost:8081/api/v1/appointments/${appointmentId}`);
                setAppointment(response.data);

                // Fetch department data for the first doctor
                if (response.data?.doctor?.[0]?.department_id) {
                    const deptResponse = await axios.get(`http://localhost:8081/api/v1/departments/search?department_id=${response.data.doctor[0].department_id}`);
                    setDepartmentData(deptResponse.data[0] || {});
                }
            } catch (error) {
                console.error('Error fetching appointment details', error);
            }
        };
        fetchAppointmentDetails();
    }, [appointmentId]);

    const handleBack = () => {
        navigate('/appointments');
    };

    const handleOpenFeedbackModal = () => {
        setIsFeedbackModalOpen(true);
    };

    const handleCloseFeedbackModal = () => {
        setIsFeedbackModalOpen(false);
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
            case 'completed':
                return 'status-completedC1';
            case 'pending':
                return 'status-pendingC1';
            case 'cancelled':
                return 'status-cancelledC1';
            case 'missed':
                return 'status-missedC1';
            default:
                return '';
        }
    };

    const getPatientInitials = (name) => {
        if (!name) return 'PA';
        const nameParts = name.split(' ');
        return nameParts.length > 1 
            ? (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase()
            : name.substring(0, 2).toUpperCase();
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className="appointment-detail-pageC1">
            <Sidebar
                onInboxClick={handleOpenFeedbackModal}
                handleOpenDoctorsPage={() => navigate('/doctors')}
                handleOpenPatientsPage={() => navigate('/patients')}
                handleOpenAppointmentsPage={() => navigate('/appointments')}
                handleOpenStaffPage={() => navigate('/staff')}
                className="sidebarC1"
            />
            <div className="contentC1">
                <div className="headerC1">
                    <h2>Appointment Detail</h2>
                    <button className="back-buttonC1" onClick={handleBack}>
                       Appointments List
                    </button>
                </div>

                {appointment ? (
                    <div className="appointment-profileC1">
                        {/* Profile Header */}
                        <div className="profile-headerC1">
                             <div className="profile-avatarC1">
                                {appointment.patient?.[0]?.patient_img ? (
                                    <img
                                        src={appointment.patient[0].patient_img}
                                        alt={appointment.patient[0].patient_name || 'Patient Image'}
                                        style={{ width: '110px', height: '110px', objectFit: 'cover', borderRadius: '60px' }}
                                    />
                                ) : (
                                    getPatientInitials(appointment.patient?.[0]?.patient_name)
                                )}
                            </div>
                            <div className="profile-infoC1">
                                <h1>{appointment.patient?.[0]?.patient_name || 'Unknown Patient'}</h1>
                                <div className="appointment-idC1">
                                    Appointment ID: 191105{appointment.appointment_id}
                                </div>
                                <div className={`profile-statusC1 ${getStatusClass(appointment.status)}`}>
                                    {appointment.status}
                                </div>
                            </div>
                        </div>
 
                        <div className="info-cardC1">
                            <div className="card-headerC1">
                                <div className="card-iconC1">👤</div>
                                <h3>Patient Information</h3>
                            </div>
                            <div className="card-contentC1">
                                <div className="info-itemC1">
                                    <div className="info-labelC1">Full Name</div>
                                    <div className="info-valueC1">{appointment.patient?.[0]?.patient_name || 'Not provided'}</div>
                                </div>
                                <div className="info-itemC1">
                                    <div className="info-labelC1">Email</div>
                                    <div className="info-valueC1">{appointment.patient?.[0]?.patient_email || 'Not provided'}</div>
                                </div>
                                <div className="info-itemC1">
                                    <div className="info-labelC1">Phone</div>
                                    <div className="info-valueC1">{appointment.patient?.[0]?.patient_phone || 'Not provided'}</div>
                                </div>
                                <div className="info-itemC1">
                                    <div className="info-labelC1">Address</div>
                                    <div className="info-valueC1">{appointment.patient?.[0]?.patient_address || 'Not provided'}</div>
                                </div>
                            </div>
                        </div>
                        {/* Appointment Details */}
                        <div className="info-cardC1">
                            <div className="card-headerC1">
                                <div className="card-iconC1">📅</div>
                                <h3>Appointment Details</h3>
                            </div>
                            <div className="card-contentC1">
                                <div className="info-itemC1">
                                    <div className="info-labelC1">Date</div>
                                    <div className="info-valueC1">{formatDate(appointment.medical_day)}</div>
                                </div>
                                <div className="info-itemC1">
                                    <div className="info-labelC1">Time</div>
                                    <div className="info-valueC1">{getTimeFromSlot(appointment.slot)}</div>
                                </div>
                                <div className="info-itemC1">
                                    <div className="info-labelC1">Status</div>
                                    <div className="info-valueC1">
                                        <span className={`profile-statusC1 ${getStatusClass(appointment.status)}`}>
                                            {appointment.status}
                                        </span>
                                    </div>
                                </div>
                                <div className="info-itemC1">
                                    <div className="info-labelC1">Price</div>
                                    <div className="info-valueC1">
                                        <span className="price-highlightC1">
                                            ${appointment.price}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Medical Information */}
                        <div className="info-cardC1">
                            <div className="card-headerC1">
                                <div className="card-iconC1">⚕️</div>
                                <h3>Medical Information</h3>
                            </div>
                            <div className="card-contentC1">
                                <div className="info-itemC1">
                                    <div className="info-labelC1">Department</div>
                                    <div className="info-valueC1">{departmentData.department_name || 'Not specified'}</div>
                                </div>
                                <div className="info-itemC1">
                                    <div className="info-labelC1">Doctor</div>
                                    <div className="info-valueC1">{appointment.doctor?.[0]?.doctor_name || 'Not assigned'}</div>
                                </div>
                                <div className="info-itemC1">
                                    <div className="info-labelC1">Specialization</div>
                                    <div className="info-valueC1">{departmentData.department_name || 'General'}</div>
                                </div>
                            </div>
                        </div>

                        {/* Additional Information */}
                        <div className="info-cardC1">
                            <div className="card-headerC1">
                                <div className="card-iconC1">📋</div>
                                <h3>Additional Information</h3>
                            </div>
                            <div className="card-contentC1">
                                <div className="info-itemC1">
                                    <div className="info-labelC1">Created</div>
                                    <div className="info-valueC1">{formatDate(appointment.medical_day)}</div>
                                </div>
                                <div className="info-itemC1">
                                    <div className="info-labelC1">Appointment Type</div>
                                    <div className="info-valueC1">Regular Consultation</div>
                                </div>
                                <div className="info-itemC1">
                                    <div className="info-labelC1">Notes</div>
                                    <div className="info-valueC1">No additional notes</div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="loading-stateC1">
                        <p>Loading appointment details...</p>
                    </div>
                )}

                {isFeedbackModalOpen && (
                    <div className="feedback-modalC1">
                        <div className="overlay-contentC1">
                            <button onClick={handleCloseFeedbackModal} className="close-buttonC1">×</button>
                            <FeedbackListWithReply onClose={handleCloseFeedbackModal} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AppointmentDetailPageC1;