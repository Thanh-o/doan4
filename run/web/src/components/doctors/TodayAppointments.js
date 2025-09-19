
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Sidebar from './Sidebar';
import './TodayAppointments.css';

const TodayAppointments = () => {
    const [todayAppointments, setTodayAppointments] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const navigate = useNavigate();

    const timeSlots = [
        { label: '08:00 AM - 09:00 AM', value: 1 },
        { label: '09:00 AM - 10:00 AM', value: 2 },
        { label: '10:00 AM - 11:00 AM', value: 3 },
        { label: '11:00 AM - 12:00 PM', value: 4 },
        { label: '01:00 PM - 02:00 PM', value: 5 },
        { label: '02:00 PM - 03:00 PM', value: 6 },
        { label: '03:00 PM - 04:00 PM', value: 7 },
        { label: '04:00 PM - 05:00 PM', value: 8 }
    ];

    useEffect(() => {
        const storedDoctorId = localStorage.getItem('doctor_id');
        if (storedDoctorId) {
            const today = new Date().toISOString().split('T')[0];
            axios.get('http://localhost:8081/api/v1/appointments/search', {
                params: {
                    medical_day: today,
                    doctor_id: storedDoctorId
                }
            })
                .then(response => {
                    // ✅ Chỉ giữ lại status viết hoa hoàn toàn (ví dụ: PENDING)
                    const filtered = response.data.filter(item => /^[A-Z]+$/.test(item.status));
                    setTodayAppointments(filtered);
                })
                .catch(error => {
                    console.error('Lỗi khi lấy lịch khám hôm nay', error);
                });
        }
    }, []);

    const filteredTodayAppointments = todayAppointments
        .filter(appointment => {
            const patientName = appointment.patient?.[0]?.patient_name.toLowerCase() || '';
            return patientName.includes(searchQuery.toLowerCase());
        })
        .sort((a, b) => a.slot - b.slot); // ✅ slot nhỏ trước (giờ sớm trước)



    const getTimeSlotLabel = (slotValue) => {
        const slot = timeSlots.find(s => s.value === slotValue);
        return slot ? slot.label : '';
    };

    return (
        <div className="today-appointments">
            <Sidebar
                handleOpenTodayAppointments={() => navigate('/todayappointments')}
                handleOpenMonthlyAppointments={() => navigate('/monthlyappointments')}
                handleOpenMedicalRecords={() => navigate('/medicalrecords')}
            />
            <div className="content-appoint">
                {successMessage && <div className="success-message">{successMessage}</div>}

                <h3 className="tab-title">Today's Appointments Schedule</h3>

                <input
                    type="text"
                    placeholder="Search by patient name..."
                    className="search-input-appoint"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />

                <ul className="appointments-list">
                    {filteredTodayAppointments.map((appointment, index) => (
                        <li key={index}>
                            <div>
                                <p>Patient Name: {appointment.patient?.[0]?.patient_name || ''}</p>
                                <p>Date: {new Date(appointment.medical_day).toLocaleDateString()}</p>
                                <p>Time: {getTimeSlotLabel(appointment.slot)}</p>
                                <p>
                                    Status: <span
                                    className={`status ${appointment.status.toLowerCase()}`}>{appointment.status}</span>
                                </p>
                            </div>
                            <td>
                                <button
                                    className="btn btn-primary"
                                    onClick={() => navigate(`/examine/${appointment.appointment_id}`)}
                                >
                                Examine
                                </button>
                            </td>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default TodayAppointments;