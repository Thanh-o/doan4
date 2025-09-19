import React, { useState, useEffect, useRef } from 'react';

import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ExaminePatient.css';

const ExaminePatient = () => {
    const { appointmentId } = useParams();
    const [appointment, setAppointment] = useState(null);
    const [patient, setPatient] = useState(null);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [newMedicalRecord, setNewMedicalRecord] = useState({
        symptoms: '',
        diagnosis: '',

        prescription: '',
        treatment: '',
        image: ''
    });
    const [doctorName, setDoctorName] = useState('');
    const navigate = useNavigate();
    const diagnosisEditorRef = useRef(null);

    const timeSlots = [
        { value: 1, label: '08:00 - 09:00' },
        { value: 2, label: '09:00 - 10:00' },
        { value: 3, label: '10:00 - 11:00' },
        { value: 4, label: '11:00 - 12:00' },
        { value: 5, label: '13:00 - 14:00' },
        { value: 6, label: '14:00 - 15:00' },
        { value: 7, label: '15:00 - 16:00' },
        { value: 8, label: '16:00 - 17:00' }
    ];

    const getTimeSlotLabel = (slotValue) => {
        const slot = timeSlots.find(s => s.value === slotValue);
        return slot ? slot.label : '';
    };

    useEffect(() => {
        if (!appointmentId) {
            console.error('No appointmentId available');
            setError('Appointment ID not found');
            return;
        }

        axios.get(`http://localhost:8081/api/v1/appointments/${appointmentId}`)
            .then(response => {
                console.log('Appointment data:', response.data);
                setAppointment(response.data);
                setPatient(response.data.patient?.[0] || null);
            })
            .catch(error => {
                console.error('Error fetching appointment details:', error);
                setError('Error loading appointment information');
            });

        const doctorId = localStorage.getItem('doctor_id');
        axios.get(`http://localhost:8081/api/v1/doctors/${doctorId}`)
            .then(response => {
                setDoctorName(response.data.doctor_name || 'Not specified');
            })
            .catch(error => {
                console.error('Error fetching doctor details:', error);
                setDoctorName('Not specified');
            });
    }, [appointmentId]);

    const handleNewMedicalRecordChange = (e) => {
        const { name, value } = e.target;
        setNewMedicalRecord((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                setNewMedicalRecord((prevData) => ({
                    ...prevData,
                    image: reader.result
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleConfirmComplete = () => {
        axios.put('http://localhost:8081/api/v1/appointments/updateStatus', {
            appointment_id: appointmentId,
            status: 'COMPLETED',
            doctor_id: localStorage.getItem('doctor_id')
        })
            .then(response => {
                setSuccessMessage('Examination completed successfully');
                setTimeout(() => {
                    setSuccessMessage('');
                    navigate('/todayappointments');
                }, 2000);
                axios.get(`http://localhost:8081/api/v1/appointments/${appointmentId}`)
                    .then(response => {
                        setAppointment(response.data);
                    })
                    .catch(error => {
                        console.error('Error fetching updated appointment', error);
                        setError('Error updating appointment information');
                    });
            })
            .catch(error => {
                console.error('Error updating status', error);
                setError('Error updating status');
            });
    };

    const handleAddMedicalRecordSubmit = () => {

        if (!newMedicalRecord.symptoms.trim()) {
            setError('Please enter symptoms');
            return;
        }
        const diagnosisText = diagnosisEditorRef.current?.textContent || diagnosisEditorRef.current?.innerText || '';
        if (!diagnosisText.trim()) {
            setError('Please enter diagnosis');
            return;
        }

        if (!newMedicalRecord.prescription.trim()) {
            setError('Please enter prescription');
            return;
        }
        if (!newMedicalRecord.treatment.trim()) {
            setError('Please enter treatment notes');
            return;
        }

        if (!patient?.patient_id) {

            setError('Patient ID not found');
            return;
        }

        const medicalRecordData = {
            ...newMedicalRecord,
            patient_id: patient.patient_id,
            doctor_id: localStorage.getItem('doctor_id'),
            follow_up_date: new Date().toISOString().split('T')[0],

            treatment: newMedicalRecord.treatment || 'No treatment treatment'
        };

        axios.post('http://localhost:8081/api/v1/medicalrecords/insert', medicalRecordData)
            .then(response => {

                setNewMedicalRecord({
                    symptoms: '',
                    diagnosis: '',

                    prescription: '',
                    treatment: '',
                    image: ''
                });
                setSuccessMessage('Medical record saved successfully');
                setTimeout(() => setSuccessMessage(''), 2000);
                setError('');
                handleConfirmComplete();
            })
            .catch(error => {
                console.error('Error adding medical record:', error);
                setError('Error saving medical record');
            });
    };

    if (!appointment || !patient) {
        return <div className="loading">Loading...</div>;
    }

    const execCommand = (command, value = null) => {
        document.execCommand(command, false, value);
        diagnosisEditorRef.current?.focus();
        updateDiagnosisContent();
    };

    const updateDiagnosisContent = () => {
        if (diagnosisEditorRef.current) {
            const htmlContent = diagnosisEditorRef.current.innerHTML;

            setNewMedicalRecord(prev => ({
                ...prev,
                diagnosis: htmlContent
            }));
        }
    };

    const formatText = (command) => {
        execCommand(command);
    };

    return (
        <div className="medical-form-container">
            {/* Header */}
            <div className="form-header">
                <button className="back-btn" onClick={() => navigate(-1)}>
                    ← Back
                </button>
                <h1>MEDICAL RECORD</h1>

            </div>

            {/* Patient Info */}
            <div className="patient-info-section">
                <h2>Patient Information</h2>
                <div className="patient-details">
                    <div className="patient-header">
                        <div className="patient-photo-container">
                            {patient.patient_img ? (
                                <img src={patient.patient_img} alt="Patient Photo" className="patient-photo"/>
                            ) : (
                                <div className="patient-photo-placeholder">
                                    <span>No Photo</span>
                                </div>
                            )}
                        </div>
                        <div className="patient-basic-info">
                            <h3 className="patient-name">{patient.patient_name || ''}</h3>
                            <p className="patient-email">{patient.patient_email || ''}</p>
                        </div>
                    </div>

                    <div className="patient-details-grid">

                        <div className="detail-item">
                            <span className="detail-label">Phone:</span>
                            <span className="detail-value">{patient.patient_phone || ''}</span>
                        </div>
                        <div className="detail-item">
                            <span className="detail-label">Date of Birth:</span>
                            <span className="detail-value">
                                {patient.patient_dob ? new Date(patient.patient_dob).toLocaleDateString('en-US') : ''}
                            </span>
                        </div>
                        <div className="detail-item">
                            <span className="detail-label">Gender:</span>
                            <span className="detail-value">{patient.patient_gender || ''}</span>
                        </div>
                        <div className="detail-item">
                            <span className="detail-label">Address:</span>
                            <span className="detail-value">{patient.patient_address || ''}</span>
                        </div>

                    </div>

                    <div className="appointment-details">
                        <h4>Appointment Details</h4>
                        <div className="appointment-grid">
                            <div className="detail-item">
                                <span className="detail-label">Examination Date:</span>
                                <span className="detail-value">
                                    {new Date(appointment.medical_day).toLocaleDateString('en-US')}
                                </span>
                            </div>
                            <div className="detail-item">
                                <span className="detail-label">Time Slot:</span>
                                <span className="detail-value">{getTimeSlotLabel(appointment.slot)}</span>
                            </div>
                            <div className="detail-item">
                                <span className="detail-label">Examining Doctor:</span>
                                <span className="detail-value">{doctorName}</span>
                            </div>
                            <div className="detail-item">
                                <span className="detail-label">Status:</span>
                                <span className={`detail-value sta-${appointment.status?.toLowerCase()}`}>
                                    {appointment.status || ''}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Medical Record Form */}
            <div className="medical-record-section">
                <h2>Medical Examination Information</h2>
                <div className="form-grid">
                    <div className="form-group full-width">
                        <label>Symptoms and Clinical Examination *</label>
                        <textarea
                            name="symptoms"
                            placeholder="Enter symptoms, clinical signs, medical history..."
                            value={newMedicalRecord.symptoms}
                            onChange={handleNewMedicalRecordChange}
                            rows="4"
                            required
                        />
                    </div>
                    <div className="form-group full-width">
                        <label>Diagnosis *</label>

                        {/* Toolbar cho rich text editor */}
                        <div className="rich-editor-toolbar">
                            <button type="button" onClick={() => formatText('bold')} className="toolbar-btn">
                                <strong>B</strong>
                            </button>
                            <button type="button" onClick={() => formatText('italic')} className="toolbar-btn">
                                <em>I</em>
                            </button>
                            <button type="button" onClick={() => formatText('underline')} className="toolbar-btn">
                                <u>U</u>
                            </button>
                            <button type="button" onClick={() => execCommand('insertUnorderedList')}
                                    className="toolbar-btn">
                                • List
                            </button>
                            <button type="button" onClick={() => execCommand('insertOrderedList')}
                                    className="toolbar-btn">
                                1. List
                            </button>
                            <select onChange={(e) => execCommand('formatBlock', e.target.value)}
                                    className="toolbar-select">
                                <option value="">Format</option>
                                <option value="h3">Heading 3</option>
                                <option value="h4">Heading 4</option>
                                <option value="p">Paragraph</option>
                            </select>
                        </div>

                        {/* Rich text editor */}
                        <div
                            ref={diagnosisEditorRef}
                            className="rich-text-editor"
                            contentEditable={true}
                            onInput={updateDiagnosisContent}
                            onBlur={updateDiagnosisContent}
                            data-placeholder="Enter confirmed or suspected diagnosis with formatting..."
                            style={{
                                minHeight: '120px',
                                border: '1px solid #ddd',
                                borderRadius: '4px',
                                padding: '12px',
                                fontSize: '14px',
                                lineHeight: '1.5',
                                outline: 'none'
                            }}
                        />
                    </div>

                    <div className="form-group full-width">
                        <label>Prescription *</label>
                        <textarea
                            name="prescription"
                            placeholder="Enter medication names, dosages, and instructions..."
                            value={newMedicalRecord.prescription}
                            onChange={handleNewMedicalRecordChange}
                            rows="4"
                            required
                        />
                    </div>

                    <div className="form-group full-width">
                        <label>Treatment Instructions and Follow-up *</label>
                        <textarea
                            name="treatment"
                            placeholder="Enter treatment guidelines and follow-up schedule..."
                            value={newMedicalRecord.treatment}
                            onChange={handleNewMedicalRecordChange}
                            rows="4"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Attached Images</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                        />
                        {newMedicalRecord.image && (
                            <div className="image-preview">
                                <img
                                    src={newMedicalRecord.image}
                                    alt="Medical Image"
                                    className="preview-image"
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Footer Buttons */}
            <div className="form-footer">
                <button
                    type="button"
                    onClick={() => {
                        setNewMedicalRecord({
                            symptoms: '',
                            diagnosis: '',

                            prescription: '',
                            treatment: '',
                            image: ''
                        });
                        // Clear rich text editor
                        if (diagnosisEditorRef.current) {
                            diagnosisEditorRef.current.innerHTML = '';
                        }
                    }}
                    className="btn-secondary"
                >
                    Clear Form
                </button>
                <button
                    type="button"
                    onClick={handleAddMedicalRecordSubmit}
                    className="btn-primary"
                >
                    Save Medical Record
                </button>
            </div>
            {successMessage && <div className="success-message">{successMessage}</div>}
            {error && <div className="error-message">{error}</div>}
        </div>

    );

};

export default ExaminePatient;