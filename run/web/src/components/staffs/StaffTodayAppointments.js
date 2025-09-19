import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import EditAppointmentModal from './EditAppointmentModal';
import Sidebar from './Sidebar';
import './StaffTodayAppointments.css';

const StaffTodayAppointments = () => {
    const [todayAppointments, setTodayAppointments] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [newStatus, setNewStatus] = useState('');
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [openNewAppointmentDialog, setOpenNewAppointmentDialog] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const [newAppointment, setNewAppointment] = useState({
        patient_id: '',
        doctor_id: '',
        medical_day: '',
        timeSlot: '',
        status: 'Pending',
        patient_email: ''
    });
    const [doctors, setDoctors] = useState([]);

    const navigate = useNavigate();

    const timeSlots = [
        { label: '08:00 AM - 09:00 AM', value: 1, start: '08:00', end: '09:00' },
        { label: '09:00 AM - 10:00 AM', value: 2, start: '09:00', end: '10:00' },
        { label: '10:00 AM - 11:00 AM', value: 3, start: '10:00', end: '11:00' },
        { label: '11:00 AM - 12:00 PM', value: 4, start: '11:00', end: '12:00' },
        { label: '01:00 PM - 02:00 PM', value: 5, start: '13:00', end: '14:00' },
        { label: '02:00 PM - 03:00 PM', value: 6, start: '14:00', end: '15:00' },
        { label: '03:00 PM - 04:00 PM', value: 7, start: '15:00', end: '16:00' },
        { label: '04:00 PM - 05:00 PM', value: 8, start: '16:00', end: '17:00' }
    ];

    useEffect(() => {
        const today = new Date().toISOString().split('T')[0];
        axios.get('http://localhost:8081/api/v1/appointments/search', {
            params: {
                medical_day: today
            }
        })
            .then(response => {
                setTodayAppointments(response.data);
            })
            .catch(error => {
                console.error('Lỗi khi lấy lịch khám hôm nay', error);
            });

        axios.get('http://localhost:8081/api/v1/doctors/list')
            .then(response => {
                setDoctors(response.data);
            })
            .catch(error => {
                console.error('Lỗi khi lấy danh sách bác sĩ', error);
            });
    }, []);

    const handleNewStatusChange = (e) => {
        setNewStatus(e.target.value);
    };

    const handleUpdateStatus = (appointmentId, newStatus) => {
        axios.put('http://localhost:8081/api/v1/appointments/updateStatus', {
            appointment_id: appointmentId,
            status: newStatus,
            staff_id: localStorage.getItem('staffId')
        })
            .then(response => {
                console.log('Cập nhật trạng thái thành công:', response.data);
                setNewStatus('');
                setSelectedAppointment(null);
                const today = new Date().toISOString().split('T')[0];
                axios.get('http://localhost:8081/api/v1/appointments/search', {
                    params: {
                        medical_day: today
                    }
                })
                    .then(response => {
                        setTodayAppointments(response.data);
                    })
                    .catch(error => {
                        console.error('Lỗi khi lấy lịch khám hôm nay', error);
                    });
            })
            .catch(error => {
                console.error('Lỗi khi cập nhật trạng thái', error);
            });
    };

    const handleNewAppointmentOpen = (appointment) => {
        setSelectedAppointment(appointment);
        setNewAppointment((prevData) => ({
            ...prevData,
            patient_id: appointment.patient_id,
            patient_email: appointment.patient?.[0]?.patient_email || ''
        }));
        setOpenNewAppointmentDialog(true);
    };

    const handleNewAppointmentClose = () => {
        setOpenNewAppointmentDialog(false);
    };

    const handleNewAppointmentChange = (e) => {
        const { name, value } = e.target;
        setNewAppointment((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleNewAppointmentSubmit = () => {
        const appointmentData = {
            ...newAppointment,
            price: 19.99,
            appointment_date: new Date().toISOString()
        };

        axios.post('http://localhost:8081/api/v1/appointments/insert', appointmentData)
            .then(response => {
                console.log('Thêm lịch khám thành công:', response.data);
                setNewAppointment({
                    patient_id: '',
                    doctor_id: '',
                    medical_day: '',
                    timeSlot: '',
                    status: 'Pending',
                    patient_email: ''
                });
                setOpenNewAppointmentDialog(false);
            })
            .catch(error => {
                console.error('Lỗi khi thêm lịch khám', error);
            });
    };

    const handleEditClick = (item) => {
        setEditItem(item);
    };

    const handleEditModalClose = () => {
        setEditItem(null);
    };

    const handleSaveEdit = (updatedItem) => {
        setTodayAppointments((prevResults) =>
            prevResults.map((item) =>
                item.appointment_id === updatedItem.appointment_id
                    ? updatedItem
                    : item
            )
        );
        setEditItem(null);
    };

    const filteredTodayAppointments = todayAppointments.filter(appointment =>
        appointment.patient?.[0]?.patient_name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getTimeSlotLabel = (slotValue) => {
        const slot = timeSlots.find(s => s.value === slotValue);
        return slot ? slot.label : '';
    };

    return (
        <div className="staff-today-appointments">
            <header className="app-bar">
                <div className="toolbar">
                    <h1 className="title">Staff Dashboard</h1>
                </div>
            </header>
            <Sidebar
                onShowTodayAppointments={() => navigate('/todayappointments')}
                onShowMonthAppointments={() => navigate('/monthlyappointments')}
                onShowMedicalRecords={() => navigate('/medicalrecords')}
            />
            <div className="content">
                <h3>Today's Appointments Schedule</h3>
                <ul className="staff-appointments-list">
                    {filteredTodayAppointments.map((appointment, index) => (
                        <li key={index}>
                            <div>
                                <p>Patient Name: {appointment.patient?.[0]?.patient_name || ''}</p>
                                <p>Doctor Name: {appointment.doctor?.[0]?.doctor_name || ''}</p>
                            </div>
                            <div>
                                <p>Date: {new Date(appointment.medical_day).toLocaleDateString()}</p>
                                <p>Time: {getTimeSlotLabel(appointment.slot)}</p>
                                <p>Status: {appointment.status}</p>
                            </div>
                            {appointment.status !== 'Completed' && (
                                <div>
                                    <select value={newStatus} onChange={handleNewStatusChange}>
                                    <option value="">None</option>
                                        <option value="Cancelled">Cancelled</option>
                                        <option value="Completed">Completed</option>
                                    </select>
                                    <button
                                        onClick={() => handleUpdateStatus(appointment.appointment_id, newStatus)}>Update
                                        Status
                                    </button>
                                    {appointment.status !== 'Completed' && (
                                        <button onClick={() => handleEditClick(appointment)}
                                                className="action-button edit-button">Edit</button>
                                    )}
                                </div>
                            )}
                            {appointment.status === 'Completed' && (
                                <div>
                                    <button onClick={() => handleNewAppointmentOpen(appointment)}>Create new
                                        appointment
                                    </button>
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
                {openNewAppointmentDialog && (
                    <div className="dialog">
                        <div className="dialog-title">Create new appointment</div>
                        <div className="dialog-content">
                            <input
                                type="date"
                                name="medical_day"
                                placeholder="Medical Day"
                                value={newAppointment.medical_day}
                                onChange={handleNewAppointmentChange}
                            />
                            <select
                                name="timeSlot"
                                value={newAppointment.timeSlot}
                                onChange={handleNewAppointmentChange}
                            >
                                <option value="">Select Time Slot</option>
                                {timeSlots.map(slot => (
                                    <option key={slot.value} value={slot.value}>
                                        {slot.label}
                                    </option>
                                ))}
                            </select>
                            <select
                                name="doctor_id"
                                value={newAppointment.doctor_id}
                                onChange={handleNewAppointmentChange}
                            >
                                <option value="">Select Doctor</option>
                                {doctors.map(doctor => (
                                    <option key={doctor.doctor_id} value={doctor.doctor_id}>
                                        {doctor.doctor_name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="dialog-actions">
                            <button onClick={handleNewAppointmentClose} className="btn btn-danger">Cancel</button>
                            <button onClick={handleNewAppointmentSubmit} className="btn btn-primary">Create</button>
                        </div>
                    </div>
                )}
                {editItem && (
                    <EditAppointmentModal
                        appointment={editItem}
                        onClose={handleEditModalClose}
                        onSave={handleSaveEdit}
                    />
                )}
            </div>
        </div>
    );
};

export default StaffTodayAppointments;
