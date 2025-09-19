
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import "../staffs/UpcomingAppointments.css"
import Sidebar from "./Sidebar";
import {useNavigate} from "react-router-dom";

const UpcomingAppointments = () => {
    const [upcomingAppointments, setUpcomingAppointments] = useState([]);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const [statusFilter, setStatusFilter] = useState('');


    useEffect(() => {
        const fetchUpcomingAppointments = () => {
            const today = new Date();
            const endDay = new Date(today);
            endDay.setDate(today.getDate() + 3);

            const start_date = today.toISOString().split('T')[0];
            const end_date = endDay.toISOString().split('T')[0];

            axios.get(`http://localhost:8081/api/v1/appointments/search-new`, {
                params: { start_date, end_date }
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
                        payment_name: item.payment_name,
                        price: item.price,
                        staff_id: item.staff_id,
                    }));
                    setUpcomingAppointments(flatData);
                })
                .catch(error => {
                    console.error('Error fetching upcoming appointments', error);
                    setError('Error fetching upcoming appointments');
                });
        };

        fetchUpcomingAppointments();
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
    const [searchResults, setSearchResults] = useState([]);

    const [editItem, setEditItem] = useState(null);

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
            window.location.reload();
        } catch (error) {
            console.error(`There was an error updating the appointment to ${newStatus.toLowerCase()}!`, error);
            alert(`Failed to update the appointment to ${newStatus.toLowerCase()}.`);
        }
    };

    const handleEditClick = (item) => {
        setEditItem(item);
    };
    const handleStatusChange = (event) => {
        setStatusFilter(event.target.value);
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
            <h3>Schedule for the next 3 days</h3>
                <ul className="staff-appointments-list">
            {upcomingAppointments.map((appointment) => (
                <li key={appointment.appointment_id}>
                    <div>
                        <p><strong>Patient Name:</strong> {getPatientName(appointment.patient_id)}</p>
                        <p><strong>Doctor Name:</strong> {getDoctorName(appointment.doctor_id)}</p>
                    </div>
                    <div>
                        <p><strong>Appointment Date:</strong> {appointment.medical_day}</p>
                        <p><strong>Appointment Time:</strong> {formatTimeSlot(appointment.slot)}</p>
                        <p><strong>Status:</strong> {appointment.status}</p>
                    </div>
                    <div>
                        <p><strong>Price:</strong> {appointment.price}</p>
                        <p><strong>Staff Name:</strong> {getStaffName(appointment.staff_id) || ''}</p>
                    </div>
                    <div>
                        {appointment.status === 'Pending' && (
                            <button onClick={() => handleUpdateStatus(appointment.appointment_id, 'Confirmed')}
                                    className="action-button confirm-button">Confirm</button>
                        )}
                        {appointment.status === 'Confirmed' && (
                            <>
                                <button onClick={() => handleUpdateStatus(appointment.appointment_id, 'Completed')}
                                        className="action-button complete-button">Complete
                                </button>
                                <button onClick={() => handleUpdateStatus(appointment.appointment_id, 'Cancelled')}
                                        className="action-button cancel-button">Cancel
                                </button>
                            </>
                        )}
                        {appointment.status !== 'Completed' && (
                            <button onClick={() => handleEditClick(appointment)}
                                    className="action-button edit-button">Edit</button>
                        )}
                    </div>
                </li>
            ))}
                </ul>
            </div>
        </div>
    );
};

export default UpcomingAppointments;
