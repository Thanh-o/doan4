import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import "../doctors/RecordDetails.css";
import axios from "axios";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const RecordDetails = () => {
    const [patientData, setPatientData] = useState({});
    const [departmentData, setDepartmentData] = useState({});
    const [doctorData, setDoctorData] = useState({});
    const [loading, setLoading] = useState(true);
    const [selectedRecord, setSelectedRecord] = useState(null);

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
                }
            } catch (error) {
                console.error("Error fetching patient data", error);
            }
        };

        const fetchDoctorData = async () => {
            try {
                if (records.length > 0 && records[0].doctors && records[0].doctors.length > 0) {
                    const doc = records[0].doctors[0];
                    setDoctorData(doc);
                    if (doc.department_id) {
                        const response = await axios.get(
                            `http://localhost:8081/api/v1/departments/search?department_id=${doc.department_id}`
                        );
                        setDepartmentData(response.data[0] || {});

                    }
                }
            } catch (error) {
                console.error("Error fetching doctor data", error);
            } finally {
                setLoading(false);
            }
        };

        if (records.length > 0) {
            fetchPatientData();
            fetchDoctorData();
        } else {
            setLoading(false);
        }
    }, [records]);

    const calculateAge = (dob) => {
        if (!dob) return '';
        const birthDate = new Date(dob);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDifference = today.getMonth() - birthDate.getMonth();
        if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return `${age} years old`;
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const generatePDF = (record) => {
        const button = document.querySelector(`.download-pdf-button-${record.record_id}`);
        const originalDisplay = button.style.display;
        button.style.display = 'none';

        const input = document.getElementById(`record-form-${record.record_id}`);

        html2canvas(input, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff'
        }).then((canvas) => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const imgWidth = 210;
            const pageHeight = 295;
            const imgHeight = canvas.height * imgWidth / canvas.width;
            let heightLeft = imgHeight;
            let position = 0;

            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;

            while (heightLeft >= 0) {
                position -= pageHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }

            const fileName = `medical-record-${record.record_id}-${new Date().toISOString().split('T')[0]}.pdf`;
            pdf.save(fileName);

            button.style.display = originalDisplay;
        }).catch((error) => {
            console.error('Error generating PDF:', error);
            button.style.display = originalDisplay;
        });
    };

    const getGenderIcon = (gender) => {
        if (gender?.toLowerCase() === 'male') return '👨';
        if (gender?.toLowerCase() === 'female') return '👩';
        return '👤';
    };

    const handleRecordClick = (record) => {
        setSelectedRecord(record);
    };

    const closeModal = () => {
        setSelectedRecord(null);
    };

    const handleOverlayClick = (e) => {
        if (e.target.classList.contains('modal-overlay')) {
            closeModal();
        }
    };

    const truncateText = (text, maxLength = 50) => {
        if (!text) return '';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    };

    // Sort records by follow_up_date in descending order
    const sortedRecords = [...records].sort((a, b) => 
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

    return (
        <div className="content">
            <div className="record-details-container">
                <div className="record-header">
                    <h2 className="record-title">Medical Record Details</h2>
                    <span className="recordID">Patient email: {patientData.patient_email || ''}</span>
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
                                    {calculateAge(patientData.patient_dob)}
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
                    <div className="records-list">
                        {sortedRecords.length === 0 ? (
                            <p style={{ textAlign: 'center', fontSize: '18px', color: '#666' }}>
                                No record details available
                            </p>
                        ) : (
                            <>
                                {sortedRecords.map((record) => (

                                    <div
                                        key={record.record_id}
                                        className="record-list-item"
                                        onClick={() => handleRecordClick(record)}
                                    >
                                        <div className="record-list-id">MR-{String(record.record_id).padStart(4, '0')}</div>
                                        <div className="record-list-date">{formatDate(record.follow_up_date)}</div>
                                        <div className="record-list-symptoms">
                                            {truncateText(record.symptoms)}
                                        </div>
                                        <div className="record-list-diagnosis">
                                            {truncateText(record.diagnosis)}
                                        </div>
                                    </div>
                                ))}
                            </>
                        )}
                    </div>

                </section>



                <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f0f9ff', border: '1px solid #0ea5e9', borderRadius: '8px' }}>
                    <p style={{ margin: '0', fontSize: '14px', color: '#0369a1' }}>
                        <strong>Important:</strong> These medical records are confidential and should be handled according to HIPAA guidelines.
                        Please consult with your healthcare provider for any questions regarding this medical information.
                    </p>
                </div>
            </div>
            {selectedRecord && (
                <div className="modal-overlay" onClick={handleOverlayClick}>
                    <div className="modal-content record-item">
                        <button className="modal-close-button" onClick={closeModal}>
                            ✕
                        </button>

                        {/* Modal Header */}
                        <div className="modal-header">
                            <h5 className="record-header-title">
                                <span className="info-icon">📋</span>
                                Medical Record MR-{String(selectedRecord.record_id).padStart(4, '0')}
                            </h5>

                        </div>

                        <div className="modal-body">
                            <form id={`record-form-${selectedRecord.record_id}`} className="record-form">


                                <section className="modal-section">

                                    <h5 className="medicaltitle">

                                        Medical Record
                                    </h5>


                                    <h4 className="modal-section-title">
                                        <div className="section-icon">👤</div>
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
                                            <div
                                                className="patient-info-icon">{getGenderIcon(patientData.patient_gender)}</div>
                                            <div className="patient-info-content">
                                                <div className="patient-info-label">Gender</div>
                                                <div className="patient-info-value">
                                                    {patientData.patient_gender || ''}
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
                                            <div className="patient-info-icon">📞</div>
                                            <div className="patient-info-content">
                                                <div className="patient-info-label">Phone Number</div>
                                                <div className="patient-info-value">
                                                    {patientData.patient_phone || ''}
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
                                            <div className="patient-info-icon">📅</div>
                                            <div className="patient-info-content">
                                                <div className="patient-info-label">Age</div>
                                                <div className="patient-info-value">
                                                    {calculateAge(patientData.patient_dob)}
                                                </div>
                                            </div>
                                        </div>

                                    </div>
                                </section>

                                {/* Doctor & Department Information Section */}
                                <section className="modal-section">
                                    <h4 className="modal-section-title">
                                        <div className="section-icon">👨‍⚕️</div>
                                        Medical Team & Department
                                    </h4>
                                    <div className="doctor-info-grid">
                                        <div className="doctor-info-item">
                                            <div className="doctor-info-icon">👨‍⚕️</div>
                                            <div className="doctor-info-content">
                                                <div className="doctor-info-label">Attending Physician</div>
                                                <div className="doctor-info-value">
                                                    {doctorData.doctor_name || ''}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="doctor-info-item">
                                            <div className="doctor-info-icon">🏥</div>
                                            <div className="doctor-info-content">
                                                <div className="doctor-info-label">Department</div>
                                                <div className="doctor-info-value">
                                                    {departmentData.department_name || ''}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="doctor-info-item">
                                            <div className="doctor-info-icon">📧</div>
                                            <div className="doctor-info-content">
                                                <div className="doctor-info-label">Doctor Email</div>
                                                <div className="doctor-info-value">
                                                    {doctorData.doctor_email || ''}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="doctor-info-item">
                                            <div className="doctor-info-icon">📞</div>
                                            <div className="doctor-info-content">
                                                <div className="doctor-info-label">Doctor Phone</div>
                                                <div className="doctor-info-value">
                                                    {doctorData.doctor_phone || ''}
                                                </div>
                                            </div>
                                        </div>


                                    </div>
                                </section>

                                {/* Appointment Information Section */}
                                <section className="modal-section">
                                    <h4 className="modal-section-title">
                                        <div className="section-icon">📅</div>
                                        Appointment Details
                                    </h4>
                                    <div className="appointment-info-grid">
                                        <div className="appointment-info-item">
                                            <div className="appointment-info-icon">📅</div>
                                            <div className="appointment-info-content">
                                                <div className="appointment-info-label">Appointment Date</div>
                                                <div className="appointment-info-value">
                                                    {formatDate(selectedRecord.follow_up_date)}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="appointment-info-item">
                                            <div className="appointment-info-icon">📊</div>
                                            <div className="appointment-info-content">
                                                <div className="appointment-info-label">Status</div>
                                                <div className="appointment-info-value">
                                                    <span className="status-badge">Completed</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                {/* Medical Record Section */}
                                <section className="modal-section">
                                    <h4 className="modal-section-title">
                                        <div className="section-icon">🏥</div>
                                        Medical Record Details
                                    </h4>

                                    <div className="record-body">
                                        <div className="record-info">
                                            <div className="record-field">
                                                <p className="info-text"><strong>Chief Complaint & Symptoms:</strong></p>
                                                <div className="notes-container info-text symptoms">
                                                    {selectedRecord.symptoms || 'No symptoms recorded'}
                                                </div>
                                            </div>

                                            <div className="record-field">
                                                <p className="info-text"><strong>Primary Diagnosis:</strong></p>
                                                <div className="notes-container info-text symptoms">
                                                    {selectedRecord.diagnosis || 'No diagnosis recorded'}
                                                </div>
                                            </div>

                                            {selectedRecord.image && (
                                                <div className="medical-image-container">
                                                    <h5 className="record-header-title">
                                                        <span className="info-icon">🖼️</span>
                                                        Medical Imaging
                                                    </h5>
                                                    <img
                                                        src={selectedRecord.image}
                                                        alt={`Medical record imaging ${selectedRecord.record_id}`}
                                                        className="medical-image"
                                                        onError={(e) => {
                                                            e.target.style.display = 'none';
                                                            e.target.nextSibling.style.display = 'block';
                                                        }}
                                                    />
                                                    <div className="image-error" style={{ display: 'none' }}>
                                                        Medical image could not be loaded
                                                    </div>
                                                </div>
                                            )}

                                            <div className="record-field">
                                                <p className="info-text"><strong>Prescribed Medications:</strong></p>
                                                <div className="notes-container info-text symptoms">
                                                    {selectedRecord.prescription || 'No prescription recorded'}
                                                </div>
                                            </div>

                                            <div className="record-field">
                                                <p className="info-text"><strong>Treatment Plan & Prognosis:</strong></p>
                                                <div className="prognosis-container info-text symptoms">
                                                    {selectedRecord.treatment || 'No treatment plan recorded'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </section>
                            </form>
                        </div>

                        <div className="record-actions">
                            <button
                                type="button"
                                onClick={() => generatePDF(selectedRecord)}
                                className={`download-pdf-button download-pdf-button-${selectedRecord.record_id}`}
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="btn-icon">
                                    <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                                </svg>
                                <span>Download Medical Record</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RecordDetails;