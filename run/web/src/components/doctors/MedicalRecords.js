import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Sidebar from './Sidebar';
import './MedicalRecords.css';
import { ChevronRight } from 'lucide-react';

const MedicalRecords = () => {
    const [medicalRecords, setMedicalRecords] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [sortBy, setSortBy] = useState('date');
    const [sortOrder, setSortOrder] = useState('desc');
    const [currentPage, setCurrentPage] = useState(1);
    const recordsPerPage = 10;

    const navigate = useNavigate();

    useEffect(() => {
        const fetchMedicalRecords = async () => {
            try {
                setLoading(true);
                const storedDoctorId = localStorage.getItem('doctor_id');
                if (storedDoctorId) {
                    const response = await axios.get(`http://localhost:8081/api/v1/medicalrecords/doctor/${storedDoctorId}`);

                    setMedicalRecords(response.data);
                    setError('');
                } else {
                    setError('Doctor ID not found');
                }
            } catch (error) {
                console.error('Error fetching medical records', error);
                setError('Unable to load medical records data');
            } finally {
                setLoading(false);
            }
        };

        fetchMedicalRecords();
    }, []);

    // Group records by patient_email
    const groupedRecords = medicalRecords.reduce((acc, record) => {
        const email = record.patients[0]?.patient_email || '';
        if (!acc[email]) {
            acc[email] = {
                patient_name: record.patients[0]?.patient_name || '',
                patient_email: email,
                records: [],
            };
        }
        acc[email].records.push(record);
        return acc;
    }, {});

    // Convert grouped records to array for filtering and sorting
    const groupedRecordsArray = Object.values(groupedRecords).filter(group =>
        group.patient_name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const sortedRecords = [...groupedRecordsArray].sort((a, b) => {
        let comparison = 0;
        switch (sortBy) {
            case 'date':
                // Sort by the most recent follow_up_date in the group
                const dateA = Math.max(...a.records.map(r => new Date(r.follow_up_date)));
                const dateB = Math.max(...b.records.map(r => new Date(r.follow_up_date)));
                comparison = dateA - dateB;
                break;

            default:
                comparison = 0;
        }
        return sortOrder === 'asc' ? comparison : -comparison;
    });

    const totalPages = Math.ceil(sortedRecords.length / recordsPerPage);
    const indexOfLastRecord = currentPage * recordsPerPage;
    const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
    const currentRecords = sortedRecords.slice(indexOfFirstRecord, indexOfLastRecord);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const handleSortChange = (newSortBy) => {
        if (sortBy === newSortBy) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(newSortBy);
            setSortOrder('desc');
        }
        setCurrentPage(1);
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

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getStatusColor = (diagnosis) => {
        const colors = ['#e3f2fd', '#f3e5f5', '#e8f5e8', '#fff3e0', '#fce4ec'];
        const hash = diagnosis.split('').reduce((a, b) => {
            a = ((a << 5) - a) + b.charCodeAt(0);
            return a & a;
        }, 0);
        return colors[Math.abs(hash) % colors.length];
    };

    const viewRecordDetails = (group) => {
        navigate('/record-details', { state: { records: group.records } });
    };

    if (loading) {
        return (
            <div className="medical-records">
                <Sidebar
                    handleOpenTodayAppointments={handleOpenTodayAppointments}
                    handleOpenMonthlyAppointments={handleOpenMonthlyAppointments}
                    handleOpenMedicalRecords={handleOpenMedicalRecords}
                />
                <div className="content">
                    <div className="loading-container">
                        <div className="loading-spinner"></div>
                        <p>Loading data...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="medical-records">
                <Sidebar
                    handleOpenTodayAppointments={handleOpenTodayAppointments}
                    handleOpenMonthlyAppointments={handleOpenMonthlyAppointments}
                    handleOpenMedicalRecords={handleOpenMedicalRecords}
                />
                <div className="content">
                    <div className="error-container">
                        <div className="error-icon">⚠️</div>
                        <h3>An error occurred</h3>
                        <p>{error}</p>
                        <button onClick={() => window.location.reload()} className="retry-btn">
                            Retry
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="medical-records">
            <Sidebar
                handleOpenTodayAppointments={handleOpenTodayAppointments}
                handleOpenMonthlyAppointments={handleOpenMonthlyAppointments}
                handleOpenMedicalRecords={handleOpenMedicalRecords}
            />
            <div className="content">
                <div className="header-section">
                    <h1 className="page-title">
                        <span className="title-icon">📋</span>
                        Medical Records
                    </h1>
                    <div className="controls-stats-container">
                        <div className="search-container-v1">
                            <div className="search-input-wrapper">
                                <input
                                    type="text"
                                    placeholder="Search by patient name..."
                                    value={searchQuery}
                                    onChange={(e) => {
                                        setSearchQuery(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    className="search-input"
                                />
                                {searchQuery && (
                                    <button
                                        className="clear-search-1"
                                        onClick={() => {
                                            setSearchQuery('');
                                            setCurrentPage(1);
                                        }}
                                    >
                                        ✕
                                    </button>
                                )}
                            </div>
                        </div>
                        <div className="sort-container">
                            <label>Sort by:</label>
                            <div className="sort-buttons">
                                <button
                                    className={`sort-btn ${sortBy === 'date' ? 'active' : ''}`}
                                    onClick={() => handleSortChange('date')}
                                >
                                    Date {sortBy === 'date' && (sortOrder === 'asc' ? '↑' : '↓')}
                                </button>

                            </div>
                        </div>
                        <div className="stats-container">
                            <div className="stat-card">
                                <div className="stat-number">{Object.keys(groupedRecords).length}</div>
                                <div className="stat-label">Total Patients</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-number">{groupedRecordsArray.length}</div>
                                <div className="stat-label">Search Results</div>
                            </div>
                        </div>
                    </div>
                </div>

                {currentRecords.length === 0 ? (
                    <div className="no-results">
                        <div className="no-results-icon">📄</div>
                        <h3>No medical records found</h3>
                        <p>
                            {searchQuery
                                ? `No results found for "${searchQuery}"`
                                : "No medical records have been created"}
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="records-list">
                            {currentRecords.map((group, index) => (
                                <div key={group.patient_email} className="record-item">
                                    <div className="record-content">
                                        <div className="record-header">
                                            <div className="record-id">
                                                <span className="id-label">Patient Email   </span>
                                                <span className="id-number">: {group.patient_email}</span>
                                            </div>
                                            <div
                                                className="diagnosis-badge"
                                                style={{ backgroundColor: getStatusColor(group.records[0]?.diagnosis || '') }}
                                            >
                                                {group.records.length} Record{group.records.length > 1 ? 's' : ''}
                                            </div>
                                        </div>

                                        <div className="record-body">
                                            <div className="patient-info">
                                                <img
                                                    className="patient-avatar"
                                                    src={group.records?.[0]?.patients?.[0]?.patient_img}
                                                    alt="Patient Avatar"
                                                />

                                                <div className="patient-details">
                                                    <h4 className="patient-name">{group.patient_name}</h4>
                                                    <p className="patient-email">{group.records?.[0]?.patients?.[0]?.patient_gender.toUpperCase()}</p>
                                                </div>
                                            </div>

                                            <div className="record-info">
                                                <div className="info-row">

                                                    <span className="info-text">
                                                        Latest: {formatDate(group.records[0]?.follow_up_date || '')}
                                                    </span>
                                                </div>
                                                <div className="info-row">
                                                <span className="info-text symptoms">
                                                    Diagnosis:    {group.records[0]?.diagnosis
                                                            || ''}
                                                    </span>
                                                    </div>
                                                <div className="info-row">
                                                                                                       <span className="info-text symptoms">
                                                       Symptoms: {group.records[0]?.symptoms || ''}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="record-actions">
                                                <button
                                                    className="view-details-btn"
                                                    onClick={() => viewRecordDetails(group)}
                                                >
                                                    Details  <ChevronRight size={20} />

                                                </button>
                                            </div>
                                        </div>


                                    </div>
                                </div>
                            ))}
                        </div>

                        {totalPages > 1 && (
                            <div className="pagination">
                                <button
                                    className="pagination-btn"
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                >
                                    Previous
                                </button>

                                {[...Array(totalPages)].map((_, index) => {
                                    const pageNumber = index + 1;
                                    if (
                                        pageNumber === 1 ||
                                        pageNumber === totalPages ||
                                        (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                                    ) {
                                        return (
                                            <button
                                                key={pageNumber}
                                                className={`pagination-btn ${currentPage === pageNumber ? 'active' : ''}`}
                                                onClick={() => handlePageChange(pageNumber)}
                                            >
                                                {pageNumber}
                                            </button>
                                        );
                                    } else if (
                                        pageNumber === currentPage - 2 ||
                                        pageNumber === currentPage + 2
                                    ) {
                                        return <span key={`dots-${pageNumber}`} className="pagination-dots">...</span>;
                                    }
                                    return null;
                                })}

                                <button
                                    className="pagination-btn"
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default MedicalRecords;