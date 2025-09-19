import React, { useState, useEffect } from 'react';
import axios from 'axios';
import EditAppointmentModal from './EditAppointmentModal';
import { useNavigate, useLocation } from 'react-router-dom';
import './StaffDashboard.css';

const StaffDashboard = () => {
    // Tính toán ngày mặc định
    const getDefaultDates = () => {
        const today = new Date();
        const startDate = today.toISOString().split('T')[0]; // Ngày hôm nay
        
        const endDate = new Date(today);
        endDate.setDate(today.getDate() + 15); // Thêm 15 ngày
        
        return {
            start: startDate,
            end: endDate.toISOString().split('T')[0]
        };
    };

    const defaultDates = getDefaultDates();
    
    const [searchResults, setSearchResults] = useState([]);
    const [upcomingAppointments, setUpcomingAppointments] = useState([]);
    const [startDate, setStartDate] = useState(defaultDates.start);
    const [endDate, setEndDate] = useState(defaultDates.end);
    const [statusFilter, setStatusFilter] = useState('');
    const [error, setError] = useState('');
    const [editItem, setEditItem] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const status = params.get('status') || 'Pending';
        setStatusFilter(status);
        fetchAppointments();
    }, [location.search]);

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

    const fetchAppointments = () => {
        axios.get(`http://localhost:8081/api/v1/appointments/search-new`, {
            params: { start_date: startDate, end_date: endDate, status: statusFilter }
        })
            .then(response => {
                const flatData = response.data.map(item => ({
                    appointment_id: item.appointment_id,
                    patient_id: item.patient_id,
                    doctor_id: item.doctor_id,
                    appointment_date: item.appointment_date,
                    medical_day: item.medical_day,
                    slot: item.slot,
                    status: item.status,
                    price: item.price,
                    staff_id: item.staff_id,
                }));
                setSearchResults(flatData);
                console.log(searchResults)
            })
            .catch(error => {
                console.error('Error fetching appointments', error);
                setError('Error fetching appointments');
            });
    };

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const [patientResponse, doctorsResponse, departmentsResponse, staffsResponse] = await Promise.all([
                    axios.get('http://localhost:8081/api/v1/patients/list'),
                    axios.get('http://localhost:8081/api/v1/doctors/list'),
                    axios.get('http://localhost:8081/api/v1/departments/list'),
                    axios.get('http://localhost:8081/api/v1/staffs/list')
                ]);

                setPatients(patientResponse.data);
                setDoctors(doctorsResponse.data);
                setDepartments(departmentsResponse.data);
                setStaffs(staffsResponse.data);
            } catch (error) {
                console.error('Error fetching details', error);
            }
        };

        fetchDetails();
    }, []);

    const [patients, setPatients] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [staffs, setStaffs] = useState([]);

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

    const getStaffName = (staffId) => {
        const staff = staffs.find(sta => sta.staff_id === staffId);
        return staff ? staff.staff_name : 'Unknown Staff';
    };

    const handleStatusChange = (event) => {
        setStatusFilter(event.target.value);
    };

    const handleEditClick = (item) => {
        setEditItem(item);
    };

    const handleEditModalClose = () => {
        setEditItem(null);
    };

    const handleSaveEdit = (updatedItem) => {
        setSearchResults((prevResults) =>
            prevResults.map((item) =>
                item.appointment_id === updatedItem.appointment_id
                    ? updatedItem
                    : item
            )
        );
        setEditItem(null);
    };

    const handleUpdateStatus = async (appointmentId, newStatus) => {
        try {
            const staffId = localStorage.getItem('staffId');
            if (!staffId) {
                alert('Staff ID is missing. Please log in again.');
                return;
            }
            await axios.put(`http://localhost:8081/api/v1/appointments/updateStatus`, {
                appointment_id: appointmentId,
                status: newStatus,
                staff_id: staffId
            });
            setSearchResults((prevResults) =>
                prevResults.map((item) =>
                    item.appointment_id === appointmentId
                        ? { ...item, status: newStatus, staff_id: staffId }
                        : item
                )
            );
            alert(`Appointment ${newStatus.toLowerCase()} successfully.`);
        } catch (error) {
            console.error(`There was an error updating the appointment to ${newStatus.toLowerCase()}!`, error);
            alert(`Failed to update the appointment to ${newStatus.toLowerCase()}.`);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('role');
        localStorage.removeItem('staffId');
        navigate('/stafflogin');
    };

    const handleTodayStats = () => {
        navigate('/stafftodayappointments');
    };

    const handleUpcomingAppointments = () => {
        navigate('/upcoming-appointments');
    };

    console.log(upcomingAppointments)

    return (
        <div className="staff-dashboard">
            <div className="search">
                <div className="input-container">
                    <label>Start Date</label>
                    <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}/>
                </div>
                <div className="input-container">
                    <label>End Date</label>
                    <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}/>
                </div>
                <div className="input-container">
                    <label>Status</label>
                    <select value={statusFilter} onChange={handleStatusChange}>
                        <option value="">All</option>
                        <option value="Pending">Pending</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                    </select>
                </div>
                <a onClick={fetchAppointments}>
                    <img width="26" height="26" src="https://img.icons8.com/metro/26/004B91/search.png" alt="search"/>
                </a>
                <button onClick={handleTodayStats} className="today-stats-button">Today's schedule</button>
                <button onClick={handleUpcomingAppointments} className="upcoming-appointments-button">
                Schedule for the next 3 days
                </button>
            </div>
            <main>
                {error && <p className="error-message">{error}</p>}
             <section className="appointment-list">
    {searchResults.length > 0 ? (
        <table className="appointment-table">
            <thead>
                <tr>
                    <th>Patient</th>
                    <th>Doctor</th>
                    <th>Date & Time</th>
                    <th>Status</th>
                    <th>Price</th>
                    <th>Staff</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                {searchResults.map((appointment) => (
                    <tr key={appointment.appointment_id}>
                        <td>
                            <div className="patient-info">
                                {getPatientName(appointment.patient_id) || ''}
                            </div>
                        </td>
                        <td>
                            <div className="doctor-info">
                                {getDoctorName(appointment.doctor_id)}
                            </div>
                            <div className="date-time">
                                {getDepartmentName(appointment.doctor_id)}
                            </div>
                        </td>
                        <td>
                            <div>{appointment.medical_day}</div>
                            <div className="date-time">
                                {formatTimeSlot(appointment.slot)}
                            </div>
                        </td>
                        <td>
                            <span className={`status-badge status-${appointment.status.toLowerCase()}`}>
                                {appointment.status}
                            </span>
                        </td>
                        <td>
                            <div className="price-cell">
                                ${appointment.price}
                            </div>
                        </td>
                        <td>
                            <div className="staff-info">
                                {getStaffName(appointment.staff_id) || ''}
                            </div>
                        </td>
                        <td>
                            <div className="actions-cell">
                                {appointment.status === 'Pending' && (
                                    <button 
                                        onClick={() => handleUpdateStatus(appointment.appointment_id, 'Confirmed')}
                                        className="action-button confirm-button"
                                    >
                                        Confirm
                                    </button>
                                )}
                                {appointment.status === 'Confirmed' && (
                                    <>
                                        <button 
                                            onClick={() => handleUpdateStatus(appointment.appointment_id, 'Completed')}
                                            className="action-button complete-button"
                                        >
                                            Complete
                                        </button>
                                        <button 
                                            onClick={() => handleUpdateStatus(appointment.appointment_id, 'Cancelled')}
                                            className="action-button cancel-button"
                                        >
                                            Cancel
                                        </button>
                                    </>
                                )}
                                {appointment.status !== 'Completed' && (
                                    <button 
                                        onClick={() => handleEditClick(appointment)}
                                        className="action-button edit-button"
                                    >
                                        Edit
                                    </button>
                                )}
                            </div>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    ) : (
        <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
            <p>No appointments found for the selected criteria.</p>
        </div>
    )}
</section>
            </main>
            {editItem && (
                <EditAppointmentModal
                    appointment={editItem}
                    onClose={handleEditModalClose}
                    onSave={handleSaveEdit}
                />
            )}
        </div>
    );
};

export default StaffDashboard;