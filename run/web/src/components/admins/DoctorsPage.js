import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import FeedbackListWithReply from './FeedbackListWithReply';
import './DoctorsPage.css';

const DoctorsPageA1 = () => {
    const [departments, setDepartments] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [selectedDepartment, setSelectedDepartment] = useState(null);
    const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const navigate = useNavigate();
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
        const fetchDepartmentsAndDoctors = async () => {
            try {
                const [departmentsResponse, doctorsResponse] = await Promise.all([
                    axios.get('http://localhost:8081/api/v1/departments/list'),
                    axios.get('http://localhost:8081/api/v1/doctors/list')
                ]);

                setDepartments(departmentsResponse.data);
                setDoctors(doctorsResponse.data);
            } catch (error) {
                console.error('Error fetching departments and doctors', error);
            }
        };
        fetchDepartmentsAndDoctors();
    }, []);

    const handleDoctorClick = (doctorId) => {
        navigate(`/doctors/${doctorId}`);
    };

    const handleOpenFeedbackModal = () => {
        setIsFeedbackModalOpen(true);
    };

    const handleCloseFeedbackModal = () => {
        setIsFeedbackModalOpen(false);
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

    const handleDepartmentClick = (department) => {
        setSelectedDepartment(department);
    };

    const handleBackClick = () => {
        setSelectedDepartment(null);
        setIsSearching(false);
        setSearchResults([]);
        setSearchQuery('');
    };


    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchQuery(value);
        if (value.trim() === '') {
            setIsSearching(false);
            setSearchResults([]);
        }
    };


    const handleSearch = async () => {
        try {
            const response = await axios.get('http://localhost:8081/api/v1/doctors/search-new', {
                params: { keyword: searchQuery }
            });
            if (response.data.length === 0) {
                alert('No doctors found');
            }
            setSearchResults(response.data);
            setIsSearching(true); // 🔥 Đánh dấu là đang tìm kiếm
        } catch (error) {
            console.error('Error searching doctors', error);
        }
    };


    return (
        <div className="doctors-page-containerA1">
            <Sidebar
                onInboxClick={handleOpenFeedbackModal}
                handleOpenDoctorsPage={handleOpenDoctorsPage}
                handleOpenPatientsPage={handleOpenPatientsPage}
                handleOpenAppointmentsPage={handleOpenAppointmentsPage}
                handleOpenStaffPage={handleOpenStaffPage}
                className="sidebarA1"
            />
            <div className="content-containerA1">
                <div className="header-containerA1">
                    <h4>{selectedDepartment ? selectedDepartment.department_name : 'Departments & Doctors'}</h4>
                    <div className="searchA1">
                        <div className="input-containerA1">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={handleSearchChange}
                                placeholder="Search by name or email"
                            />
                            <label>Name or Email</label>
                        </div>
                        <button onClick={handleSearch}>Search</button>
                    </div>


                </div>
                {selectedDepartment ? (
                    // 👇 Khi chọn 1 department, render bảng
                    <div style={{ display: 'flow-root' }}>
                        <button onClick={handleBackClick} className="back-buttonA1" style={{ float: 'right' }}>
                            Departments List
                        </button>
                        <div className="table-containerA1">
                            <table>
                                <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Phone</th>
                                    <th>Address</th>
                                </tr>
                                </thead>
                                <tbody>
                                {doctors
                                    .filter(doctor => doctor.department_id === selectedDepartment.department_id)
                                    .map(doctor => (
                                        <tr
                                            key={doctor.doctor_id}
                                            onClick={() => handleDoctorClick(doctor.doctor_id)}
                                            className="doctor-rowA1"
                                        >
                                            <td>{doctor.doctor_id}</td>
                                            <td>{doctor.doctor_name}</td>
                                            <td>{doctor.doctor_email}</td>
                                            <td>{doctor.doctor_phone}</td>
                                            <td>{doctor.doctor_address}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : isSearching ? (
                    // 👇 Khi đang ở chế độ tìm kiếm, hiện danh sách kết quả dạng bảng
                    <div style={{ display: 'flow-root' }}>
                        <button onClick={handleBackClick} className="back-buttonA1" style={{ float: 'right' }}>
                            Departments List
                        </button>
                        <div className="table-containerA1">
                            <table>
                                <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Phone</th>
                                    <th>Address</th>
                                </tr>
                                </thead>
                                <tbody>
                                {searchResults.map(doctor => (
                                    <tr
                                        key={doctor.doctor_id}
                                        onClick={() => handleDoctorClick(doctor.doctor_id)}
                                        className="doctor-rowA1"
                                    >
                                        <td>{doctor.doctor_id}</td>
                                        <td>{doctor.doctor_name}</td>
                                        <td>{doctor.doctor_email}</td>
                                        <td>{doctor.doctor_phone}</td>
                                        <td>{doctor.doctor_address}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    // 👇 Giao diện departments mặc định
                    <div className="grid-containerA1">
                        {departments.map(department => (
                            <div className="grid-itemA1" key={department.department_id}>
                                <div className="department-cardA1" onClick={() => handleDepartmentClick(department)}>
                                    <div className="accordion-summaryA1">
                                        <h6>{department.department_name}</h6>
                                        <img
                                            width="28"
                                            height="28"
                                            src="https://img.icons8.com/ios/50/1e3a8a/view-file.png"
                                            alt="view-file"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {isFeedbackModalOpen && (
                    <div className="feedback-modal">
                        <FeedbackListWithReply onClose={handleCloseFeedbackModal} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default DoctorsPageA1;