import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import AppointmentsChart from './AppointmentsChart';
import AppointmentStatusPieChart from './AppointmentStatusPieChart';
import FeedbackListWithReply from './FeedbackListWithReply';
import Sidebar from './Sidebar';
import './AdminDashboard.css'; // Import the CSS file

const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleDateString(undefined, { year: 'numeric', month: '2-digit', day: '2-digit' });
};

const convertSlotToTime = (slot) => {
    const slotMapping = {
        1: '08:00 AM - 09:00 AM',
        2: '09:00 AM - 10:00 AM',
        3: '10:00 AM - 11:00 AM',
        4: '11:00 AM - 12:00 PM',
        5: '01:00 PM - 02:00 PM',
        6: '02:00 PM - 03:00 PM',
        7: '03:00 PM - 04:00 PM',
        8: '04:00 PM - 05:00 PM',
    };
    return slotMapping[slot] || '';
};

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        doctors: 0,
        patients: 0,
        appointments: 0,
        staff: 0,
    });
    const [todayAppointments, setTodayAppointments] = useState([]);
    const [appointmentsRange, setAppointmentsRange] = useState([]);
    const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
    const [showTodayAppointments, setShowTodayAppointments] = useState(false);
    const [feedbacks, setFeedbacks] = useState([]);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [searchType, setSearchType] = useState('patients');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [status, setStatus] = useState('');
    const [recentDoctors, setRecentDoctors] = useState([]);
    const [recentPatients, setRecentPatients] = useState([]);
    const [recentStaff, setRecentStaff] = useState([]);
    const [adminInfo, setAdminInfo] = useState({ staff_name: 'Admin' });
    const navigate = useNavigate();

    useEffect(() => {
        const isLoggedIn = localStorage.getItem('isLoggedIn');
        const role = localStorage.getItem('role');
        const adminId = localStorage.getItem('adminId');

        if (!isLoggedIn || role !== 'admin') {
            navigate('/adminlogin');
            return;
        }

        fetchStats();
        fetchTodayAppointments();
        fetchAppointmentsRange();
        fetchFeedbacks();
        fetchRecentDoctors();
        fetchRecentPatients();
        fetchRecentStaff();
        fetchAdminInfo(adminId);
    }, [navigate]);

    const fetchAdminInfo = async (adminId) => {
        try {
            const response = await axios.get(`http://localhost:8081/api/v1/staffs/${adminId}`);
            setAdminInfo(response.data || { staff_name: 'Admin' });
        } catch (error) {
            console.error('Error fetching admin info:', error);
            setError('Failed to fetch admin information. Please try again later.');
        }
    };

    const fetchStats = async () => {
        try {
            const [doctorsRes, patientsRes, appointmentsRes, staffRes] = await Promise.all([
                axios.get('http://localhost:8081/api/v1/doctors/list'),
                axios.get('http://localhost:8081/api/v1/patients/list'),
                axios.get('http://localhost:8081/api/v1/appointments/list'),
                axios.get('http://localhost:8081/api/v1/staffs/list'),
            ]);

            setStats({
                doctors: doctorsRes.data?.length || 0,
                patients: patientsRes.data?.length || 0,
                appointments: appointmentsRes.data?.length || 0,
                staff: staffRes.data?.length || 0,
            });
        } catch (error) {
            console.error('Error fetching statistics:', error);
            setError('Failed to fetch statistics. Please try again later.');
        }
    };

    const fetchTodayAppointments = async () => {
        try {
            const today = new Date().toISOString().split('T')[0];
            const params = { appointment_date: today };
            const response = await axios.get('http://localhost:8081/api/v1/appointments/search', { params });
            setTodayAppointments(response.data || []);
        } catch (error) {
            console.error('Error fetching today\'s appointments:', error);
            setError('Failed to fetch today\'s appointments. Please try again later.');
        }
    };

    const fetchAppointmentsRange = async () => {
        try {
            const today = new Date();
            const tenDaysAgo = new Date();
            tenDaysAgo.setDate(today.getDate() - 7);
            const threeDaysLater = new Date();
            threeDaysLater.setDate(today.getDate());

            const response = await axios.get('http://localhost:8081/api/v1/appointments/list');
            const allAppointments = response.data || [];

            const filteredAppointments = allAppointments.filter((appointment) => {
                const medicalDay = new Date(appointment.medical_day);
                return medicalDay >= tenDaysAgo && medicalDay <= threeDaysLater;
            });
            console.log(filteredAppointments);
            setAppointmentsRange(filteredAppointments);
        } catch (error) {
            console.error('Error fetching appointments range:', error);
            setError('Failed to fetch recent appointments. Please try again later.');
        }
    };

    const fetchFeedbacks = async () => {
        try {
            const response = await axios.get('http://localhost:8081/api/v1/feedbacks/list');
            setFeedbacks(response.data || []);
        } catch (error) {
            console.error('Error fetching feedbacks:', error);
            setError('Failed to fetch feedbacks. Please try again later.');
        }
    };

    const fetchRecentDoctors = async () => {
        try {
            const appointmentsResponse = await axios.get('http://localhost:8081/api/v1/appointments/list');
            const appointments = appointmentsResponse.data || [];

            const today = new Date();
            const previousMonthDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
            const previousMonth = previousMonthDate.getMonth();
            const previousYear = previousMonthDate.getFullYear();

            const currentMonthAppointments = appointments.filter((appointment) => {
                const medicalDay = new Date(appointment.medical_day);
                return (
                    medicalDay.getMonth() === previousMonth &&
                    medicalDay.getFullYear() === previousYear
                );
            });


            const doctorSuccessCount = currentMonthAppointments.reduce((acc, appointment) => {
                if (appointment.status && appointment.status.toUpperCase() === 'COMPLETED' && appointment.doctor_id) {
                    acc[appointment.doctor_id] = (acc[appointment.doctor_id] || 0) + 1;
                }
                return acc;
            }, {});

            const topDoctorIds = Object.entries(doctorSuccessCount)
                .sort(([, countA], [, countB]) => countB - countA)
                .slice(0, 5)
                .map(([doctorId]) => parseInt(doctorId));

            const doctorsResponse = await axios.get('http://localhost:8081/api/v1/doctors/list');
            const allDoctors = doctorsResponse.data || [];
            const topDoctors = allDoctors
                .filter((doctor) => topDoctorIds.includes(doctor.doctor_id))
                .map((doctor) => ({
                    ...doctor,
                    successfulAppointments: doctorSuccessCount[doctor.doctor_id] || 0,
                }))
                .sort((a, b) => b.successfulAppointments - a.successfulAppointments);

            setRecentDoctors(topDoctors);
        } catch (error) {
            console.error('Error fetching recent doctors:', error);
            setError('Failed to fetch recent doctors. Please try again later.');
        }
    };

    const fetchRecentPatients = async () => {
        try {
            const response = await axios.get('http://localhost:8081/api/v1/patients/list');
            const sortedPatients = (response.data || [])
                .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
                .slice(0, 5);
            setRecentPatients(sortedPatients);
        } catch (error) {
            console.error('Error fetching recent patients:', error);
            setError('Failed to fetch recent patients. Please try again later.');
        }
    };

    const fetchRecentStaff = async () => {
        try {
            const response = await axios.get('http://localhost:8081/api/v1/staffs/list');
            const sortedStaff = (response.data || [])
                .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
                .slice(0, 5);
            setRecentStaff(sortedStaff);
        } catch (error) {
            console.error('Error fetching recent staff:', error);
            setError('Failed to fetch recent staff. Please try again later.');
        }
    };

    const handleSearchTypeChange = (e) => {
        setSearchType(e.target.value);
    };

    const handleSearch = async () => {
        let url = '';
        let params = {};

        switch (searchType) {
            case 'patients':
                url = 'http://localhost:8081/api/v1/patients/search-new';
                params = { keyword: searchQuery };
                break;
            case 'staff':
                url = 'http://localhost:8081/api/v1/staffs/search-new';
                params = { keyword: searchQuery };
                break;
            case 'appointments':
                url = 'http://localhost:8081/api/v1/appointments/search-new';
                params = { start_date: startDate, end_date: endDate, status: status };
                break;
            case 'doctors':
                url = 'http://localhost:8081/api/v1/doctors/search-new';
                params = { keyword: searchQuery };
                break;
            default:
                return;
        }

        try {
            const response = await axios.get(url, { params });
            if (searchType === 'doctors') {
                navigate('/doctors', { state: { searchResults: response.data } });
            } else if (searchType === 'patients') {
                navigate('/patients', { state: { searchResults: response.data } });
            } else if (searchType === 'staff') {
                navigate('/staff', { state: { searchResults: response.data } });
            } else if (searchType === 'appointments') {
                navigate('/appointments', { state: { searchResults: response.data } });
            }
        } catch (error) {
            console.error('Error searching data:', error);
            setError('Failed to search data. Please try again later.');
        }
    };

    const handleOpenFeedbackModal = () => {
        setIsFeedbackModalOpen(true);
    };

    const handleCloseFeedbackModal = () => {
        setIsFeedbackModalOpen(false);
    };

    const handleLogout = () => {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('role');
        localStorage.removeItem('adminId');
        navigate('/adminlogin');
    };

    const handleOpenDoctorsPage = () => {
        navigate('/doctors');
    };

    const handleOpenPatientsPage = () => {
        navigate('/patients');
    };

    const handleOpenAppointmentsPage = () => {
        navigate('/appointments');
    };

    const handleOpenStaffPage = () => {
        navigate('/staff');
    };

    const handleDoctorClick = (doctorId) => {
        navigate(`/doctors/${doctorId}`);
    };

    const handlePatientClick = (patientId) => {
        navigate(`/patients/${patientId}`);
    };

    return (
        <div className="admin-dashboard">
            <Sidebar
                onInboxClick={handleOpenFeedbackModal}
                handleOpenDoctorsPage={handleOpenDoctorsPage}
                handleOpenPatientsPage={handleOpenPatientsPage}
                handleOpenAppointmentsPage={handleOpenAppointmentsPage}
                handleOpenStaffPage={handleOpenStaffPage}
            />
            <div className="main-content">
                <div className="topbar">
                    <div className="search">
                        <div className="input-container">
                            <select id="type-select" value={searchType} onChange={handleSearchTypeChange}>
                                <option value="patients">Patients</option>
                                <option value="staff">Staff</option>
                                <option value="appointments">Appointments</option>
                                <option value="doctors">Doctors</option>
                            </select>
                            <label htmlFor="type-select">Search Type</label>
                        </div>
                        <button onClick={handleSearch}>Search</button>
                    </div>
                    <div className="profile">
                        <button onClick={handleLogout}>
                            Logout <img width="20" height="20" src="https://img.icons8.com/ios/50/FFFFFF/exit--v1.png" alt="exit--v1" />
                        </button>
                    </div>
                </div>
                <div className="content">
                    <h2>Welcome, {adminInfo.staff_name || 'Admin'}</h2>
                    <div className="stats">
                        <div className="card" onClick={handleOpenDoctorsPage}>
                            <h3>{stats.doctors}</h3>
                            <p>Doctors</p>
                        </div>
                        <div className="card" onClick={handleOpenPatientsPage}>
                            <h3>{stats.patients}</h3>
                            <p>Patients</p>
                        </div>
                        <div className="card" onClick={handleOpenAppointmentsPage}>
                            <h3>{stats.appointments}</h3>
                            <p>Appointments</p>
                        </div>
                        <div className="card" onClick={handleOpenStaffPage}>
                            <h3>{stats.staff}</h3>
                            <p>Staff</p>
                        </div>
                    </div>

                    <div className="charts">
                        <AppointmentStatusPieChart appointments={appointmentsRange} />
                        <div className="chart">
                            <h2>Appointment Statistics</h2>
                            <AppointmentsChart appointments={appointmentsRange} />
                        </div>
                    </div>

                    <div className="recent-sections">
                        <h2>Top Performing Doctor (Last Month)</h2>
                        <table className="recent-table">
                            <thead>
                                <tr>
                                    <th>Image</th>
                                    <th>Name</th>
                                    <th>Phone</th>
                                    <th>Email</th>
                                    <th>Successful</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentDoctors.length > 0 ? (
                                    recentDoctors.map((doctor) => (
                                        <tr key={doctor.doctor_id} onClick={() => handleDoctorClick(doctor.doctor_id)}>
                                            <td>
                                                {doctor.doctor_image ? (
                                                    <img
                                                        src={doctor.doctor_image}
                                                        alt={doctor.doctor_name || 'Doctor Image'}
                                                        style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '35px' }}
                                                    />
                                                ) : (
                                                    ''
                                                )}
                                            </td>
                                            <td>{doctor.doctor_name || ''}</td>
                                            <td>{doctor.doctor_phone || ''}</td>
                                            <td>{doctor.doctor_email || ''}</td>
                                            <td>{doctor.successfulAppointments || 0}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5">No recent doctors found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                        <div className="recent-sections-row">
                            <div className="recent-section">
                                <h2>Recent Patients</h2>
                                <table className="recent-table">
                                    <thead>
                                        <tr>
                                            <th>Name</th>
                                            <th>Phone</th>
                                            <th>Email</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {recentPatients.length > 0 ? (
                                            recentPatients.map((patient) => (
                                                <tr key={patient.patient_id} onClick={() => handlePatientClick(patient.patient_id)}>
                                                    <td>{patient.patient_name || ''}</td>
                                                    <td>{patient.patient_phone || ''}</td>
                                                    <td>{patient.patient_email || ''}</td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="4">No recent patients found.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            <div className="recent-section">
                                <h2>Recent Staff</h2>
                                <table className="recent-table">
                                    <thead>
                                        <tr>
                                            <th>Name</th>
                                            <th>Phone</th>
                                            <th>Email</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {recentStaff.length > 0 ? (
                                            recentStaff.map((staff) => (
                                                <tr key={staff.staff_id} >
                                                    <td>{staff.staff_name || ''}</td>
                                                    <td>{staff.staff_phone || ''}</td>
                                                    <td>{staff.staff_email || ''}</td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="4">No recent staff found.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
                {isFeedbackModalOpen && (
                    <div className="feedback-modal">
                        <FeedbackListWithReply onClose={handleCloseFeedbackModal} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;