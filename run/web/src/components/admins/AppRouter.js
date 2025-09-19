import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import AdminDashboard from './AdminDashboard';
import DoctorsPage from './DoctorsPage';
import PatientsPage from './PatientsPage';
import AppointmentsPage from './AppointmentsPage';
import StaffPage from './StaffPage';
import AdminLogin from './AdminLogin';

const AppRouter = () => {
    return (
        <Router>
            <Routes>
                <Route path="/adminlogin" element={<AdminLogin />} />
                <Route
                    path="/admindashboard/*"
                    element={
                        <AdminLayout>
                            <Routes>
                                <Route path="/" element={<AdminDashboard />} />
                                <Route path="/doctors" element={<DoctorsPage />} />
                                <Route path="/patients" element={<PatientsPage />} />
                                <Route path="/appointments" element={<AppointmentsPage />} />
                                <Route path="/staff" element={<StaffPage />} />
                                {/* Thêm các route khác tương ứng */}
                            </Routes>
                        </AdminLayout>
                    }
                />
                <Route path="*" element={<Navigate to="/admindashboard" replace />} />
            </Routes>
        </Router>
    );
};

export default AppRouter;
