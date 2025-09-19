import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Sidebar from './Sidebar'; // Import Sidebar
import './MonthlyAppointments.css';

const MonthlyAppointments = () => {
    const [monthAppointments, setMonthAppointments] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');

    const navigate = useNavigate(); // Define navigate
    const [statusFilter, setStatusFilter] = useState('');

    useEffect(() => {
        const storedDoctorId = localStorage.getItem('doctor_id');
        if (storedDoctorId) {
            const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
            const lastDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0];
            axios.get('http://localhost:8081/api/v1/appointments/search', {
                params: {
                    start_date: firstDayOfMonth,
                    end_date: lastDayOfMonth,
                    doctor_id: storedDoctorId
                }
            })
                .then(response => {
                    const filteredSorted = response.data
                        .filter(item => /^[A-Z]+$/.test(item.status)) // ✅ chỉ lấy status viết hoa
                        .sort((a, b) => {
                            const dateA = new Date(a.medical_day);
                            const dateB = new Date(b.medical_day);
                            if (dateA.getTime() !== dateB.getTime()) {
                                return dateA - dateB; // sắp theo ngày
                            }
                            return a.slot - b.slot; // cùng ngày sắp theo giờ (slot)
                        });

                    setMonthAppointments(filteredSorted);

                })
                .catch(error => {
                    console.error('Lỗi khi lấy lịch khám trong tháng', error);
                });
        }
    }, []);

    const formatTimeSlot = (slot) => {
        switch (slot) {
            case 1:
                return '8:00 AM - 9:00 AM';
            case 2:
                return '9:00 AM - 10:00 AM';
            case 3:
                return '10:00 AM - 11:00 AM';
            case 4:
                return '11:00 AM - 12:00 AM';
            case 5:
                return '01:00 PM - 02:00 PM';
            case 6:
                return '02:00 PM - 03:00 PM';
            case 7:
                return '03:00 PM - 04:00 PM';
            case 8:
                return '04:00 PM - 05:00 PM';
            default:
                return 'Slot Time Not Defined';
        }
    };

    const filteredMonthAppointments = monthAppointments.filter(appointment => {
        const patientName = appointment.patient?.[0]?.patient_name.toLowerCase() || '';
        const matchesSearch = patientName.includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === '' || appointment.status === statusFilter;
        return matchesSearch && matchesStatus;
    });


    const handleOpenTodayAppointments = () => {
        navigate('/todayappointments');
    };

    const handleOpenMonthlyAppointments = () => {
        navigate('/monthlyappointments');
    };

    const handleOpenMedicalRecords = () => {
        navigate('/medicalrecords');
    };

    return (
        <div className="monthly-appointments">
            <Sidebar
                handleOpenTodayAppointments={handleOpenTodayAppointments}
                handleOpenMonthlyAppointments={handleOpenMonthlyAppointments}
                handleOpenMedicalRecords={handleOpenMedicalRecords}
            />
            <div className="content">
                <h3 class="tab-title">Synthesis Appointments Schedule</h3>
                <div className="monthly-filter">

                    <input
                        type="text"
                        placeholder="Search Patient Name"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="search-bar"
                    />
                    <select
                        className="status-filter"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="">All Statuses</option>
                        <option value="PENDING">PENDING</option>
                        <option value="COMPLETED">COMPLETED</option>
                        <option value="CANCELLED">CANCELLED</option>
                    </select>
                </div>


                <ul className="appointments-list">
                    {filteredMonthAppointments.map((appointment, index) => (
                        <li key={index}>
                            <p>Patient Name: {appointment.patient?.[0]?.patient_name || ''}</p>
                            <p>Email: {appointment.patient?.[0]?.patient_email || ''}</p>
                            <p>Date: {new Date(appointment.medical_day).toLocaleDateString()}</p>
                            <p>Time: {formatTimeSlot(appointment.slot)}</p>
                            <p>
                                Status: <span
                                className={`status ${appointment.status.toLowerCase()}`}>{appointment.status}</span>
                            </p>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default MonthlyAppointments;
