import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './MedicalRecordDetails.css';
import axios from "axios";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const MedicalRecordDetails = () => {
    const [departmentData, setDepartmentData] = useState({});
    const [doctorData, setDoctorData] = useState({});
    const [loading, setLoading] = useState(true);

    const location = useLocation();
    const navigate = useNavigate();
    const { record, patientData, allRecords } = location.state || {};

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    useEffect(() => {
        const fetchDoctorData = async () => {
            try {
                if (record && record.doctors && record.doctors.length > 0) {
                    const doc = record.doctors[0];
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

        if (record) {
            fetchDoctorData();
        } else {
            setLoading(false);
        }
    }, [record]);


    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const generatePDF = () => {
        const button = document.querySelector('.medical-record-download-button');
        const originalDisplay = button.style.display;
        button.style.display = 'none';

        const input = document.getElementById('medical-record');

        html2canvas(input, {
            scale: 1.5, // Giảm scale để tối ưu kích thước
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff',
            width: input.scrollWidth,
            height: input.scrollHeight,
            scrollX: 0,
            scrollY: 0
        }).then((canvas) => {
            const imgData = canvas.toDataURL('image/png', 0.8); // Giảm chất lượng để tối ưu
            const pdf = new jsPDF('p', 'mm', 'a4');

            // Kích thước trang A4
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();

            // Tính toán kích thước để fit vào 1 trang
            const canvasAspectRatio = canvas.height / canvas.width;
            const pageAspectRatio = pageHeight / pageWidth;

            let imgWidth, imgHeight;

            if (canvasAspectRatio > pageAspectRatio) {
                // Nội dung cao hơn trang, fit theo chiều cao
                imgHeight = pageHeight - 10; // Để lại margin 5mm mỗi bên
                imgWidth = imgHeight / canvasAspectRatio;
            } else {
                // Nội dung rộng hơn trang, fit theo chiều rộng
                imgWidth = pageWidth - 10; // Để lại margin 5mm mỗi bên
                imgHeight = imgWidth * canvasAspectRatio;
            }

            // Căn giữa hình ảnh trên trang
            const xPos = (pageWidth - imgWidth) / 2;
            const yPos = (pageHeight - imgHeight) / 2;

            // Thêm hình ảnh vào PDF (chỉ 1 trang)
            pdf.addImage(imgData, 'PNG', xPos, yPos, imgWidth, imgHeight);

            const fileName = `medical-record-${record.record_id}-${new Date().toISOString().split('T')[0]}.pdf`;
            pdf.save(fileName);

            button.style.display = originalDisplay;
        }).catch((error) => {
            console.error('Error generating PDF:', error);
            button.style.display = originalDisplay;
        });
    };

    const handleBackToList = () => {
        navigate(-1);
    };

    const handleImageError = (e) => {
        e.target.style.display = 'none';
        const errorDiv = e.target.nextElementSibling;
        if (errorDiv && errorDiv.classList.contains('medical-record-image-error')) {
            errorDiv.style.display = 'block';
        }
    };

    const getGenderIcon = (gender) => {
        if (gender?.toLowerCase() === 'male') return '👨';
        if (gender?.toLowerCase() === 'female') return '👩';
        return '👤';
    };

    if (loading) {
        return (
            <div className="content">
                <div className="medical-record-container">
                    <div style={{ textAlign: 'center', padding: '50px' }}>
                        <div style={{ fontSize: '18px', color: '#666' }}>Loading medical record...</div>
                    </div>
                </div>
            </div>
        );
    }

    if (!record || !patientData) {
        return (
            <div className="content">
                <div className="medical-record-container">
                    <div className="medical-record-error">
                        <div className="medical-record-error-message">
                            Medical record not found
                        </div>
                        <button onClick={handleBackToList} className="medical-record-error-button">
                            ← Back to list
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="content">
            <button onClick={handleBackToList} className="medical-record-back-button2">
                ← Back
            </button>
            <div className="medical-record-container">
                <div id="medical-record">
                    {/* Header */}
                    <div className="record-header">
                        <h2 className="record-title">MEDICAL RECORD</h2>
                        <span className="recordID">
                            Record ID: MR-{String(record.record_id).padStart(4, '0')}
                        </span>
                    </div>

                    {/* Patient Info */}
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
                                <div className="patient-info-icon">📞</div>
                                <div className="patient-info-content">
                                    <div className="patient-info-label">Phone</div>
                                    <div className="patient-info-value">
                                        {patientData.patient_phone || ''}
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
                                <div className="patient-info-icon">🏠</div>
                                <div className="patient-info-content">
                                    <div className="patient-info-label">Address</div>
                                    <div className="patient-info-value">
                                        {patientData.patient_address || ''}
                                    </div>
                                </div>
                            </div>

                        </div>
                    </section>

                    {/* Doctor Info */}
                    <section className="section">
                        <h4>
                            <div className="section-icon">II</div>
                            Doctor Information
                        </h4>
                        <div className="patient-info-grid">
                            <div className="patient-info-item">
                                <div className="patient-info-icon">👨‍⚕️</div>
                                <div className="patient-info-content">
                                    <div className="patient-info-label">Doctor</div>
                                    <div className="patient-info-value">
                                        {doctorData.doctor_name || ''}
                                    </div>
                                </div>
                            </div>

                            <div className="patient-info-item">
                                <div className="patient-info-icon">🏥</div>
                                <div className="patient-info-content">
                                    <div className="patient-info-label">Department</div>
                                    <div className="patient-info-value">
                                        {departmentData.department_name || ''}
                                    </div>
                                </div>
                            </div>

                            <div className="patient-info-item">
                                <div className="patient-info-icon">📞</div>
                                <div className="patient-info-content">
                                    <div className="patient-info-label">Phone</div>
                                    <div className="patient-info-value">
                                        {doctorData.doctor_phone || ''}
                                    </div>
                                </div>
                            </div>

                            <div className="patient-info-item">
                                <div className="patient-info-icon">📧</div>
                                <div className="patient-info-content">
                                    <div className="patient-info-label">Email</div>
                                    <div className="patient-info-value">
                                        {doctorData.doctor_email || ''}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Examination Info */}
                    <section className="section">
                        <h4>
                            <div className="section-icon">III</div>
                            Examination Results
                        </h4>

                        <div className="medical-record-content-block">
                            <div className="medical-record-content-label">
                                <span style={{ marginRight: '8px' }}>🩺</span>
                                Follow-up Date
                            </div>
                            <div className="medical-record-content-text">
                                {formatDate(record.follow_up_date) || 'No information'}
                            </div>
                        </div>

                        <div className="medical-record-content-block">
                            <div className="medical-record-content-label">
                                <span style={{ marginRight: '8px' }}>😷</span>
                                Symptoms
                            </div>
                            <div className="medical-record-content-text">
                                {record.symptoms || 'No information'}
                            </div>
                        </div>

                        <div className="medical-record-content-block">
                            <div className="medical-record-content-label">
                                <span style={{ marginRight: '8px' }}>🔬</span>
                                Diagnosis
                            </div>
                            <div
                                className="medical-record-content-text"
                                dangerouslySetInnerHTML={{
                                    __html: record.diagnosis || 'No information'
                                }}
                            />
                        </div>

                        <div className="medical-record-content-block">
                            <div className="medical-record-content-label">
                                <span style={{ marginRight: '8px' }}>💊</span>
                                Prescription
                            </div>
                            <div className="medical-record-content-text">
                                {record.prescription || 'No prescription'}
                            </div>
                        </div>

                        <div className="medical-record-content-block">
                            <div className="medical-record-content-label">
                                <span style={{ marginRight: '8px' }}>🏥</span>
                                Treatment
                            </div>
                            <div className="medical-record-content-text">
                                {record.treatment || 'No treatment information'}
                            </div>
                        </div>

                        {record.image && (
                            <div className="medical-record-image-section">
                                <div className="medical-record-content-label">
                                    <span style={{ marginRight: '8px' }}>📸</span>
                                    Medical Image
                                </div>
                                <img
                                    src={record.image}
                                    alt="Medical imaging"
                                    className="medical-record-image"
                                    onError={handleImageError}
                                />
                                <div className="medical-record-image-error">
                                    Unable to load medical image
                                </div>
                            </div>
                        )}
                    </section>

                    <div className="medical-record-notice">
                        <p style={{ margin: '0', fontSize: '14px', color: '#0369a1' }}>
                            <strong>Important:</strong> This medical record is a confidential healthcare document.
                            Please consult with your healthcare provider for any questions regarding this medical
                            information.
                        </p>
                    </div>
                </div>

                {/* Download PDF */}
                <div className="aa">
                    <button onClick={generatePDF} className="medical-record-download-button">
                        📄 Download PDF
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MedicalRecordDetails;