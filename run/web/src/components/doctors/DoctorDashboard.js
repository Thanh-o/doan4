import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Sidebar from './Sidebar';
import './DoctorDashboard.css';

const DoctorDashboard = () => {
    const [doctor, setDoctor] = useState(null);
    const [todayAppointments, setTodayAppointments] = useState([]);
    const [monthAppointments, setMonthAppointments] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [medicalRecords, setMedicalRecords] = useState([]);
    const [patientMedicalRecords, setPatientMedicalRecords] = useState([]);

    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [status, setStatus] = useState('');
    const [searchType, setSearchType] = useState('appointments');
    const [searchQuery, setSearchQuery] = useState('');

    // Thêm state để kiểm soát việc hiển thị kết quả search
    const [showSearchResults, setShowSearchResults] = useState(false);

    const navigate = useNavigate();
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
    const [patients, setPatients] = useState([]);


    // Set default dates for startDate and endDate
    useEffect(() => {
        axios.get('http://localhost:8081/api/v1/patients/list')
            .then(res => setPatients(res.data))
            .catch(err => console.error('Error fetching patients list', err));

        const today = new Date();

        // Calculate 15 days before
        const defaultStartDate = new Date(today);
        defaultStartDate.setDate(today.getDate() - 15);

        // Calculate 15 days after
        const defaultEndDate = new Date(today);
        defaultEndDate.setDate(today.getDate() + 15);

        // Format date to YYYY-MM-DD
        const formatDate = (date) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };

        // Update state
        setStartDate(formatDate(defaultStartDate));
        setEndDate(formatDate(defaultEndDate));
    }, []); // Run once on component mount

    useEffect(() => {
        const storedDoctorId = localStorage.getItem('doctor_id');
        if (storedDoctorId) {
            axios.get(`http://localhost:8081/api/v1/doctors/${storedDoctorId}`)
                .then(response => {
                    setDoctor(response.data);

                })
                .catch(error => {
                    console.error('Error fetching doctor information', error);

                });

            const today = new Date().toISOString().split('T')[0];
            axios.get('http://localhost:8081/api/v1/appointments/search', {
                params: {
                    medical_day: today,
                    doctor_id: storedDoctorId,
                    status: 'PENDING'
                }
            })
                .then(response => {
                    // ✅ Chỉ lấy status là PENDING viết hoa 100%
                    const filtered = response.data
                        .filter(item => item.status === 'PENDING')
                        .sort((a, b) => a.slot - b.slot); // 👉 sắp theo slot tăng dần

                    setTodayAppointments(filtered);

                })

                .catch(error => {
                    console.error('Error fetching today\'s appointments', error);

                });

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
                    setMonthAppointments(response.data);
                })
                .catch(error => {
                    console.error('Error fetching monthly appointments', error);

                });

            axios.get(`http://localhost:8081/api/v1/medicalrecords/doctor/${storedDoctorId}`)
                .then(response => {
                    setMedicalRecords(response.data);
                })
                .catch(error => {
                    console.error('Error fetching medical records', error);

                });
        }
    }, []);

    const handleSearch = () => {
        const storedDoctorId = localStorage.getItem('doctor_id');
        if (storedDoctorId) {
            let url = '';
            let params = {};

            if (searchType === 'appointments') {
                url = 'http://localhost:8081/api/v1/appointments/searchByCriteriaAndDoctor';
                params = {
                    start_date: startDate,
                    end_date: endDate,
                    doctor_id: storedDoctorId
                };
                if (status.trim() !== '') {
                    params.status = status.toUpperCase();
                }
            } else if (searchType === 'medicalrecords') {
                url = 'http://localhost:8081/api/v1/medicalrecords/search';
                params = {
                    keyword: searchQuery,
                    doctor_id: storedDoctorId
                };
            }

            axios.get(url, { params })
                .then(response => {
                    console.log(response.data);
                    if (searchType === 'appointments') {
                        // ✅ luôn lọc các status viết hoa hoàn toàn
                        const filtered = response.data
                            .filter(item => /^[A-Z]+$/.test(item.status))
                            .sort((a, b) => {
                                const dateA = new Date(a.medical_day);
                                const dateB = new Date(b.medical_day);
                                if (dateA.getTime() !== dateB.getTime()) {
                                    return dateA - dateB; // Sắp theo ngày tăng dần
                                }
                                return a.slot - b.slot; // Nếu cùng ngày thì slot nhỏ trước (giờ sớm hơn)
                            });

                        setAppointments(filtered);
                    } else if (searchType === 'medicalrecords') {
                        setPatientMedicalRecords(response.data);
                    }
                    setShowSearchResults(true);
                })
                .catch(error => {
                    console.error('Error during search', error);

                });
        }
    };


    const getPatientNameById = (id) => {
        const patient = patients.find(p => p.patient_id === id);
        return patient ? patient.patient_name : '';
    };




    const handleLogout = () => {
        setIsLogoutModalOpen(true); // mở modal
    };

    const confirmLogout = () => {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('role');
        localStorage.removeItem('doctorId');
        navigate('/doctorlogin');
    };


    const handleOpenTodayAppointments = () => {
        navigate('/todayappointments');
    };

    const handleOpenMonthlyAppointments = () => {
        navigate('/monthlyappointments');
    };

    const handleOpenMedicalRecords = () => {
        navigate('/medicalrecords');
    };


    const handleDoctorInfoOpen = () => {
        navigate('/doctorinfo');
    };



    const getTimeSlotLabel = (slotValue) => {
        const timeSlots = [
            { value: 1, label: '08:00 AM - 09:00 AM' },
            { value: 2, label: '09:00 AM - 10:00 AM' },
            { value: 3, label: '10:00 AM - 11:00 AM' },
            { value: 4, label: '11:00 AM - 12:00 PM' },
            { value: 5, label: '01:00 PM - 02:00 PM' },
            { value: 6, label: '02:00 PM - 03:00 PM' },
            { value: 7, label: '03:00 PM - 04:00 PM' },
            { value: 8, label: '04:00 PM - 05:00 PM' }
        ];
        const slot = timeSlots.find(s => s.value === slotValue);
        return slot ? slot.label : '';
    };

    return (
        <div className="doctor-dashboard">
            <Sidebar
                handleOpenTodayAppointments={handleOpenTodayAppointments}
                handleOpenMonthlyAppointments={handleOpenMonthlyAppointments}
                handleOpenMedicalRecords={handleOpenMedicalRecords}
            />
            <div className="main-content">
                <div className="topbar">
                    <div className="search">
                        <div className="input-container">
                            <select value={searchType} onChange={(e) => setSearchType(e.target.value)}>
                                <option value="appointments">Appointments</option>
                                <option value="medicalrecords">Medical Records</option>
                            </select>
                            <label>Search Type</label>
                        </div>
                        {searchType === 'appointments' ? (
                            <>
                                <div className="input-container">
                                    <input
                                        type="date"
                                        placeholder="Start Date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                    />
                                    <label>Start Date</label>
                                </div>
                                <div className="input-container">
                                    <input
                                        type="date"
                                        placeholder="End Date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                    />
                                    <label>End Date</label>
                                </div>
                                <div className="input-container">
                                    <select value={status} onChange={(e) => setStatus(e.target.value)}>
                                        <option value="">Select Status</option>
                                        <option value="PENDING">Pending</option>
                                        <option value="COMPLETED">Completed</option>
                                        <option value="CANCELLED">Cancelled</option>
                                    </select>
                                    <label>Status</label>
                                </div>
                            </>
                        ) : (
                            <input
                                type="text"
                                placeholder="Search by patient name or email"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        )}
                        <button onClick={handleSearch}>Search</button>
                    </div>
                    <div className="profile">
                        <button onClick={handleLogout}>Logout <img width="20" height="20"
                            src="https://img.icons8.com/ios/50/FFFFFF/exit--v1.png"
                            alt="exit--v1" /></button>
                    </div>
                </div>
                <div className="content">
                    {doctor && (
                        <div className="doctor-info">
                            <div className="doctor-info-icon" onClick={handleDoctorInfoOpen}>
                                <img
                                    src={doctor.doctor_image}
                                    alt="avatar"
                                    style={{borderRadius: '50%',border: '2px solid #007bff'}}
                                    width="80"
                                    height="80"
                                />

                                <p>{doctor.doctor_name}</p>
                            </div>
                        </div>
                    )}

                    <div className="stats">
                    <div className="card">
                            <div className="card-content">
                                <h4>Today's Appointments</h4>
                                <h3>{todayAppointments.length}</h3>
                                <button className="btn btn-primary" onClick={() => navigate('/todayappointments')}>
                                    View Today's Appointments
                                </button>
                            </div>
                        </div>
                        <div className="card">
                            <div className="card-content">
                                <h4>Synthesis Appointments</h4>
                                <h3>{monthAppointments.length}</h3>
                                <button className="btn btn-primary" onClick={() => navigate('/monthlyappointments')}>
                                    Synthesis Appointments
                                </button>
                            </div>
                        </div>
                        <div className="card">
                            <div className="card-content">
                                <h4>Medical Records</h4>
                                <h3>{medicalRecords.length}</h3>
                                <button className="btn btn-primary" onClick={() => navigate('/medicalrecords')}>
                                    View Medical Records
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="today-appointments-table">
                        <h3>Today's Appointments</h3>
                        {todayAppointments.length === 0 ? (
                            <p>No appointments today.</p>
                        ) : (
                            <table className="appointment-table">
                                <thead>
                                <tr>
                                    <th>Patient Name</th>
                                    <th>Patient Email</th>

                                    <th>Time</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                                </thead>
                                <tbody>
                                {todayAppointments.map((appointment, index) => (
                                    <tr key={index}>
                                        <td>{appointment.patient?.[0]?.patient_name || ''}</td>
                                        <td>{appointment.patient?.[0]?.patient_email || ''}</td>

                                        <td>{getTimeSlotLabel(appointment.slot)}</td>
                                        <td className={`status ${appointment.status.toLowerCase()}`}>{appointment.status}</td>
                                        <td>
                                            <button
                                                className="btn btn-primary"
                                                onClick={() => navigate(`/examine/${appointment.appointment_id}`)}
                                            >
                                                Examine
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        )}
                    </div>


                    {/* Chỉ hiển thị kết quả search khi đã nhấn nút Search */}
                    {showSearchResults && (
                        <>
                            {searchType === 'appointments' && (
                                <div className="appointments-list">
                                    <h3>Search Results - Appointments</h3>
                                    {appointments.length === 0 ? (
                                        <p>No appointments found.</p>
                                    ) : (
                                        <ul>
                                            {appointments.map((appointment, index) => (
                                                <li key={index}>
                                                    <p>Patient: {getPatientNameById(appointment.patient_id)}</p>


                                                    <p>Date: {new Date(appointment.medical_day).toLocaleDateString()}</p>
                                                    <p>Time Slot: {getTimeSlotLabel(appointment.slot)}</p>
                                                    <p>
                                                        Status: <span
                                                        className={`status ${appointment.status.toLowerCase()}`}>{appointment.status}</span>
                                                    </p>

                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            )}

                            {searchType === 'medicalrecords' && (
                                <div className="medical-records-list">
                                    <h3>Search Results - Medical Records</h3>
                                    {patientMedicalRecords.length === 0 ? (
                                        <p>No medical records found.</p>
                                    ) : (
                                        <ul>
                                            {patientMedicalRecords.map((record, index) => (
                                                <li key={index}>
                                                    <p>Patient Name: {record.patients[0]?.patient_name || ''}</p>
                                                    <p>Patient Email: {record.patients[0]?.patient_email || ''}</p>
                                                    <p>Symptoms: {record.symptoms}</p>
                                                    <p>Diagnosis: {record.diagnosis}</p>
                                                    <p>Treatment: {record.treatment}</p>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {isLogoutModalOpen && (
                <div className="logout-modal-overlay">
                    <div className="logout-modal">
                        <h3>Logout</h3>
                        <p>Are you sure you want to log out?</p>
                        <div className="logout-modal-buttons">
                            <button className="btn btn-secondary" onClick={() => setIsLogoutModalOpen(false)}>Cancel</button>
                            <button className="btn btn-danger" onClick={confirmLogout}>Logout</button>
                        </div>
                    </div>
                </div>
            )}

        </div>

    );

};

export default DoctorDashboard;