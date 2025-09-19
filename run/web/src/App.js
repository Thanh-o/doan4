import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LoginAdmin from './components/admins/LoginAdmin';
import AdminDashboard from './components/admins/AdminDashboard';
import LoginDoctor from './components/doctors/LoginDoctor';
import DoctorDashboard from './components/doctors/DoctorDashboard';
import LoginStaff from './components/staffs/LoginStaff';
import StaffDashboard from './components/staffs/StaffDashboard';
import PrivateRoute from './PrivateRoute';
import DoctorsPage from './components/admins/DoctorsPage';
import PatientsPage from './components/admins/PatientsPage';
import AppointmentsPage from './components/admins/AppointmentsPage';
import StaffPage from './components/admins/StaffPage';
import DoctorDetailPage from './components/admins/DoctorDetailPage';
// import DoctorLayout from './components/doctors/DoctorLayout';
import StaffLayout from './components/staffs/StaffLayout';
import PatientDetailPage from "./components/admins/PatientDetailPage";
import AppointmentDetailPage from "./components/admins/AppointmentDetailPage";
import StaffDetailPage from "./components/admins/StaffDetailPage";
import TodayAppointments from "./components/doctors/TodayAppointments";
import MonthlyAppointments from "./components/doctors/MonthlyAppointments";
import MedicalRecords from "./components/doctors/MedicalRecords";
import RecordDetails from "./components/doctors/RecordDetails";
import StaffTodayAppointments from "./components/staffs/StaffTodayAppointments";
import SearchResultsPatients from "./components/admins/SearchResultsPatients";
import SearchResultsStaff from "./components/admins/SearchResultsStaff";
import SearchResultsAppointments from "./components/admins/SearchResultsAppointments";
import SearchResultsDoctors from "./components/admins/SearchResultsDoctors";
import UpcomingAppointments from './components/staffs/UpcomingAppointments';
import ExaminePatient from './components/doctors/ExaminePatient';
import HomePage from './components/HomePage';
import DoctorInfoPage from './components/doctors/DoctorInfoPage';
const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<HomePage />} /> {/* Trang chọn đăng nhập */}
                <Route path="/doctorinfo" element={<DoctorInfoPage />} />

                <Route path="/adminlogin" element={<LoginAdmin />} />
                <Route path="/admindashboard" element={<PrivateRoute role="admin"><AdminDashboard /></PrivateRoute>} />
                <Route path="/doctorlogin" element={<LoginDoctor />} />
                <Route path="/doctordashboard" element={<PrivateRoute role="doctor"><DoctorDashboard /></PrivateRoute>} />
                <Route path="/stafflogin" element={<LoginStaff />} />
                <Route path="/staffdashboard" element={<PrivateRoute role="staff"><StaffLayout><StaffDashboard /></StaffLayout></PrivateRoute>} />
                <Route path="/doctors" element={<PrivateRoute role="admin"><DoctorsPage /></PrivateRoute>} />
                <Route path="/patients" element={<PrivateRoute role="admin"><PatientsPage /></PrivateRoute>} />
                <Route path="/appointments" element={<PrivateRoute role="admin"><AppointmentsPage /></PrivateRoute>} />
                <Route path="/staff" element={<PrivateRoute role="admin"><StaffPage /></PrivateRoute>} />
                <Route path="/doctors/:doctorId" element={<PrivateRoute role="admin"><DoctorDetailPage /></PrivateRoute>} />
                <Route path="/patients/:patientId" element={<PatientDetailPage />} /> {/* Add this line */}
                <Route path="/appointments/:appointmentId" element={<AppointmentDetailPage />} /> {/* Add this line */}
                <Route path="/searchresults/patients" element={<PrivateRoute role="admin"><SearchResultsPatients /></PrivateRoute>} /> {/* Add this line */}
                <Route path="/searchresults/staff" element={<PrivateRoute role="admin"><SearchResultsStaff /></PrivateRoute>} /> {/* Add this line */}
                <Route path="/searchresults/appointments" element={<PrivateRoute role="admin"><SearchResultsAppointments /></PrivateRoute>} /> {/* Add this line */}
                <Route path="/searchresults/doctors" element={<PrivateRoute role="admin"><SearchResultsDoctors /></PrivateRoute>} /> {/* Add this line */}
                <Route path="/staffs/:staffId" element={<StaffDetailPage />} /> {/* Add this line */}
                <Route path="/todayappointments" element={<TodayAppointments />} />
                <Route path="/monthlyappointments" element={<MonthlyAppointments />} />
                <Route path="/medicalrecords" element={<MedicalRecords />} />
                <Route path="/record-details" element={<RecordDetails />} />
                <Route path="/stafftodayappointments" element={<StaffTodayAppointments />} />
                <Route path="/upcoming-appointments" element={<UpcomingAppointments />} />
                <Route path="/examine/:appointmentId" element={<ExaminePatient />} />
            </Routes>
        </Router>
    );
};

export default App;
