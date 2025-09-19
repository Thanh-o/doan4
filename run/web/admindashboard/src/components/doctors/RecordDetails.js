import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import "../doctors/RecordDetails.css";
import axios from "axios";

const RecordDetails = () => {
    const [patientData, setPatientData] = useState({});
    const [patientRecords, setPatientRecords] = useState([]);

    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const location = useLocation();
    const { records } = location.state || { records: [] };

    useEffect(() => {
        const scrollToTop = () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        };
        scrollToTop();
    }, []);

    useEffect(() => {
        const fetchPatientData = async () => {
            try {
                if (records.length > 0 && records[0].patient_id) {
                    const response = await axios.get(
                        `http://localhost:8081/api/v1/patients/search?patient_id=${records[0].patient_id}`
                    );
                    setPatientData(response.data[0] || {});
                    setPatientRecords(response.data[0].medicalrecordsList || []);

                }
            } catch (error) {
                console.error("Error fetching patient data", error);
            } finally {
                setLoading(false);
            }
        };

        if (records.length > 0) {
            fetchPatientData();
        } else {
            setLoading(false);
        }
    }, [records]);

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getGenderIcon = (gender) => {
        if (gender?.toLowerCase() === 'male') return '👨';
        if (gender?.toLowerCase() === 'female') return '👩';
        return '👤';
    };

    const handleRecordClick = (record) => {
        // Navigate to medical record details page
        navigate('/medical-record-details', {
            state: {
                record: record,
                patientData: patientData,
                allRecords: records
            }
        });
    };

    const truncateText = (text, maxLength = 50) => {
        if (!text) return '';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    };

    // Sort records by follow_up_date in descending order
    const sortedRecords = [...patientRecords].sort((a, b) =>
        new Date(b.follow_up_date) - new Date(a.follow_up_date)
    );

    if (loading) {
        return (
            <div className="content">
                <div className="record-details-container">
                    <div style={{ textAlign: 'center', padding: '50px' }}>
                        <div style={{ fontSize: '18px', color: '#666' }}>Loading record details...</div>
                    </div>
                </div>
            </div>
        );
    }

    const handleBackToList = () => {
        navigate(-1);
    };

    return (
        <div className="content">
            <button onClick={handleBackToList} className="medical-record-back-button2">
                ← Back
            </button>
            <div className="record-details-container">

                <div className="record-header">
                    <h2 className="record-title">Medical Record Details</h2>
                    <span className="recordID">Patient email: {patientData.patient_email || ''}</span>
                </div>

                <section className="section">
                    <h4>
                        <div className="section-icon">I</div>
                        Patient Information
                    </h4>
                    <div className="patient-info-grid">

                        <div className="patient-info-item">
                            <div className="patient-info-icon">👤</div>
                            <div className="patient-info-content">
                                <div className="patient-info-label">Full Name</div>
                                <div className="patient-info-value">
                                    {patientData.patient_name || ''}
                                </div>
                            </div>
                        </div>
                        <div className="patient-info-item">
                            <div className="patient-info-icon">🎂</div>
                            <div className="patient-info-content">
                                <div className="patient-info-label">Date of Birth</div>
                                <div className="patient-info-value">
                                    {formatDate(patientData.patient_dob)}
                                </div>
                            </div>
                        </div>
                        <div className="patient-info-item">
                            <div className="patient-info-icon">{getGenderIcon(patientData.patient_gender)}</div>
                            <div className="patient-info-content">
                                <div className="patient-info-label">Gender</div>
                                <div className="patient-info-value">
                                    {patientData.patient_gender || ''}
                                </div>
                            </div>
                        </div>
                        <div className="patient-info-item">
                            <div className="patient-info-icon">🏠</div>
                            <div className="patient-info-content">
                                <div className="patient-info-label">Address</div>
                                <div className="patient-info-value">
                                    {patientData.patient_address || ''}
                                </div>
                            </div>
                        </div>
                        <div className="patient-info-item">
                            <div className="patient-info-icon">📧</div>
                            <div className="patient-info-content">
                                <div className="patient-info-label">Email</div>
                                <div className="patient-info-value">
                                    {patientData.patient_email || ''}
                                </div>
                            </div>
                        </div>
                        <div className="patient-info-item">
                            <div className="patient-info-icon">📅</div>
                            <div className="patient-info-content">
                                <div className="patient-info-label">Age</div>
                                <div className="patient-info-value">
                                    {patientData.patient_phone}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section>
                    <h4>
                        <div className="section-icon">II</div>
                        Medical Records List
                    </h4>

                    <div className="record-list-header">
                        <div className="record-list-id2">Record ID</div>
                        <div className="record-list-date2">Appointment Daay</div>
                        <div className="record-list-symptoms2">Symptoms</div>
                    </div>

                    <div className="records-list">
                        {sortedRecords.length === 0 ? (
                            <p style={{textAlign: 'center', fontSize: '18px', color: '#666'}}>
                                No record details available
                            </p>
                        ) : (
                            <>
                                {sortedRecords.map((record) => (
                                    <div
                                        key={record.record_id}
                                        className="record-list-item"
                                        onClick={() => handleRecordClick(record)}
                                        style={{cursor: 'pointer'}}
                                    >
                                        <div
                                            className="record-list-id">MR-{String(record.record_id).padStart(4, '0')}</div>
                                        <div className="record-list-date">{formatDate(record.follow_up_date)}</div>
                                        <div className="record-list-symptoms">
                                            {truncateText(record.symptoms)}
                                        </div>

                                    </div>
                                ))}
                            </>
                        )}
                    </div>
                </section>

                <div style={{
                    marginTop: '20px',
                    padding: '15px',
                    backgroundColor: '#f0f9ff',
                    border: '1px solid #0ea5e9',
                    borderRadius: '8px'
                }}>
                    <p style={{margin: '0', fontSize: '14px', color: '#0369a1'}}>
                        <strong>Important:</strong> These medical records are confidential and should be handled
                        according to HIPAA guidelines.
                        Please consult with your healthcare provider for any questions regarding this medical
                        information.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RecordDetails;