import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ExaminePatient.css';

const ExaminePatient = () => {
    const { appointmentId } = useParams();
    const [appointment, setAppointment] = useState(null);
    const [patient, setPatient] = useState(null);
    const [patientMedicalRecords, setPatientMedicalRecords] = useState([]);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [openAddMedicalRecordDialog, setOpenAddMedicalRecordDialog] = useState(false);
    const [openMedicalRecordsDialog, setOpenMedicalRecordsDialog] = useState(false);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [newMedicalRecord, setNewMedicalRecord] = useState({
        symptoms: '',
        diagnosis: '',
        test_results: '',
        prescription: '',
        notes: '',
        image: ''
    });
    const navigate = useNavigate();

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
        axios.get(`http://localhost:8081/api/v1/appointments/${appointmentId}`)
            .then(response => {
                console.log('Appointment API response:', response.data);
                setAppointment(response.data);
                setPatient(response.data.patient?.[0] || null);
            })
            .catch(error => {
                console.error('Error fetching appointment details', error);
                setError('ERROR FETCHING APPOINTMENT DETAILS');
            });
    }, [appointmentId]);

    const handleCompleteAppointment = () => {
        setShowConfirmDialog(true);
    };

    const handleConfirmComplete = () => {
        axios.put('http://localhost:8081/api/v1/appointments/updateStatus', {
            appointment_id: appointmentId,
            status: 'COMPLETED',
            doctor_id: localStorage.getItem('doctor_id')
        })
            .then(response => {
                console.log('Status updated successfully:', response.data);
                setSuccessMessage('APPOINTMENT COMPLETED SUCCESSFULLY');
                setTimeout(() => setSuccessMessage(''), 2000);
                setShowConfirmDialog(false);
                axios.get(`http://localhost:8081/api/v1/appointments/${appointmentId}`)
                    .then(response => {
                        setAppointment(response.data);
                    })
                    .catch(error => {
                        console.error('Error fetching updated appointment', error);
                        setError('ERROR FETCHING UPDATED APPOINTMENT');
                    });
            })
            .catch(error => {
                console.error('Error updating status', error);
                setError('ERROR UPDATING STATUS');
                setShowConfirmDialog(false);
            });
    };

    const handleCancelComplete = () => {
        setShowConfirmDialog(false);
    };

    const handleShowMedicalRecords = () => {
        if (!patient?.patient_id) {
            setError('NO PATIENT ID');
            return;
        }
        axios.get('http://localhost:8081/api/v1/medicalrecords/search', {
            params: { patient_id: patient.patient_id }
        })
            .then(response => {
                console.log('Medical records API response:', response.data);
                const records = Array.isArray(response.data) ? response.data : [];
                // Sort records by creation date (newest first)
                const sortedRecords = records.sort((a, b) => {
                    // Try to sort by record_id (assuming higher ID = newer record)
                    if (a.record_id && b.record_id) {
                        return b.record_id - a.record_id;
                    }
                    // If follow_up_date exists, sort by that
                    if (a.follow_up_date && b.follow_up_date) {
                        return new Date(b.follow_up_date) - new Date(a.follow_up_date);
                    }
                    // If created_at exists, sort by that
                    if (a.created_at && b.created_at) {
                        return new Date(b.created_at) - new Date(a.created_at);
                    }
                    return 0;
                });
                setPatientMedicalRecords(sortedRecords);
                setOpenMedicalRecordsDialog(true);
            })
            .catch(error => {
                console.error('Error fetching medical records', error);
                setError('ERROR FETCHING MEDICAL RECORDS');
                setPatientMedicalRecords([]);
            });
    };

    const handleCloseMedicalRecordsDialog = () => {
        setOpenMedicalRecordsDialog(false);
        setPatientMedicalRecords([]);
    };

    const handleAddMedicalRecordOpen = () => {
        setOpenAddMedicalRecordDialog(true);
    };

    const handleAddMedicalRecordClose = () => {
        setOpenAddMedicalRecordDialog(false);
        setNewMedicalRecord({
            symptoms: '',
            diagnosis: '',
            test_results: '',
            prescription: '',
            notes: '',
            image: ''
        });
        setError('');
    };

    const handleNewMedicalRecordChange = (e) => {
        const { name, value } = e.target;
        setNewMedicalRecord((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleAddMedicalRecordSubmit = () => {
        // Validate required fields
        if (!newMedicalRecord.symptoms.trim()) {
            setError('PLEASE ENTER SYMPTOMS');
            return;
        }
        if (!newMedicalRecord.diagnosis.trim()) {
            setError('PLEASE ENTER DIAGNOSIS');
            return;
        }
        if (!newMedicalRecord.test_results.trim()) {
            setError('PLEASE ENTER TEST RESULTS');
            return;
        }
        if (!newMedicalRecord.prescription.trim()) {
            setError('PLEASE ENTER PRESCRIPTION');
            return;
        }
        if (!newMedicalRecord.notes.trim()) {
            setError('PLEASE ENTER NOTES');
            return;
        }

        if (!patient?.patient_id) {
            console.error('No patient ID available');
            setError('NO PATIENT ID');
            return;
        }

        const medicalRecordData = {
            ...newMedicalRecord,
            patient_id: patient.patient_id,
            doctor_id: localStorage.getItem('doctor_id'),
            follow_up_date: new Date().toISOString().split('T')[0],
            test_results: newMedicalRecord.test_results || 'No test results',
            notes: newMedicalRecord.notes || 'No notes'
        };

        axios.post('http://localhost:8081/api/v1/medicalrecords/insert', medicalRecordData)
            .then(response => {
                console.log('Medical record added successfully:', response.data);
                setNewMedicalRecord({
                    symptoms: '',
                    diagnosis: '',
                    test_results: '',
                    prescription: '',
                    notes: '',
                    image: ''
                });
                setSuccessMessage('MEDICAL RECORD ADDED SUCCESSFULLY');
                setTimeout(() => setSuccessMessage(''), 2000);
                setOpenAddMedicalRecordDialog(false);
                setError('');
            })
            .catch(error => {
                console.error('Error adding medical record', error);
                setError('ERROR ADDING MEDICAL RECORD');
            });
    };

    const viewRecordDetails = (record) => {
        navigate('/record-details', { state: { record } });
    };

    if (error && !openAddMedicalRecordDialog) {
        return <div className="xiz-error-message">{error}</div>;
    }

    if (!appointment || !patient) {
        return <div className="xiz-loading">LOADING...</div>;
    }

    return (
        <div className="xiz-examine-patient-container">
            <div className="xiz-examine-patient-header">
                <h1>PATIENT EXAMINATION</h1>
                {successMessage && (
                    <div className="xiz-success-message">{successMessage}</div>
                )}
            </div>
            <div className="xiz-patient-card">
                <div className="xiz-patient-card-header">
                    <h2>PATIENT INFORMATION</h2>
                </div>
                <div className="xiz-patient-card-body">
                    <div className="xiz-patient-info-row">
                        <span className="xiz-info-label">Full Name:</span>
                        <span>{patient.patient_name || 'NO DATA'}</span>
                    </div>
                    <div className="xiz-patient-info-row">
                        <span className="xiz-info-label">Email:</span>
                        <span>{patient.patient_email || 'NO DATA'}</span>
                    </div>
                    <div className="xiz-patient-info-row">
                        <span className="xiz-info-label">Examination Date:</span>
                        <span>{new Date(appointment.medical_day).toLocaleDateString('en-US')}</span>
                    </div>
                    <div className="xiz-patient-info-row">
                        <span className="xiz-info-label">Time Slot:</span>
                        <span>{getTimeSlotLabel(appointment.slot)}</span>
                    </div>
                    <div className="xiz-patient-info-row">
                        <span className="xiz-info-label">Status:</span>
                        <span>{appointment.status}</span>
                    </div>
                    {appointment.status !== 'COMPLETED' && (
                        <div className="xiz-status-update-section">
                            <button onClick={handleCompleteAppointment} className="xiz-btn xiz-btn-primary">COMPLETE APPOINTMENT</button>
                        </div>
                    )}
                </div>
                <div className="xiz-patient-card-footer">
                    <button onClick={handleAddMedicalRecordOpen} className="xiz-btn xiz-btn-primary">EXAMINE</button>
                    <button onClick={handleShowMedicalRecords} className="xiz-btn xiz-btn-primary">VIEW MEDICAL RECORDS</button>
                    <button onClick={() => navigate('/todayappointments')} className="xiz-btn xiz-btn-secondary">BACK TO LIST</button>
                </div>
            </div>

            {/* Add Medical Record Dialog */}
            {openAddMedicalRecordDialog && (
                <div className="xiz-dialog-overlay">
                    <div className="xiz-dialog">
                        <div className="xiz-dialog-header">
                            <h2>ADD MEDICAL RECORD - {patient.patient_name || 'UNKNOWN'}</h2>
                            <button onClick={handleAddMedicalRecordClose} className="xiz-dialog-close-btn">×</button>
                        </div>
                        <div className="xiz-dialog-body">
                            {error && <div className="xiz-error-message">{error}</div>}
                            
                            <div className="xiz-form-group">
                                <label>Symptoms *</label>
                                <textarea
                                    name="symptoms"
                                    placeholder="Enter patient's symptoms"
                                    value={newMedicalRecord.symptoms}
                                    onChange={handleNewMedicalRecordChange}
                                    className="xiz-form-textarea"
                                />
                            </div>

                            <div className="xiz-form-group">
                                <label>Diagnosis *</label>
                                <textarea
                                    name="diagnosis"
                                    placeholder="Enter diagnosis"
                                    value={newMedicalRecord.diagnosis}
                                    onChange={handleNewMedicalRecordChange}
                                    className="xiz-form-textarea"
                                />
                            </div>

                            <div className="xiz-form-group">
                                <label>Test Results *</label>
                                <textarea
                                    name="test_results"
                                    placeholder="Enter test results"
                                    value={newMedicalRecord.test_results}
                                    onChange={handleNewMedicalRecordChange}
                                    className="xiz-form-textarea"
                                />
                            </div>

                            <div className="xiz-form-group">
                                <label>Prescription *</label>
                                <textarea
                                    name="prescription"
                                    placeholder="Enter prescription"
                                    value={newMedicalRecord.prescription}
                                    onChange={handleNewMedicalRecordChange}
                                    className="xiz-form-textarea"
                                />
                            </div>

                            <div className="xiz-form-group">
                                <label>Notes *</label>
                                <textarea
                                    name="notes"
                                    placeholder="Enter notes"
                                    value={newMedicalRecord.notes}
                                    onChange={handleNewMedicalRecordChange}
                                    className="xiz-form-textarea"
                                />
                            </div>

                            <div className="xiz-form-group">
                                <label>Upload Image</label>
                                <input
                                    type="file"
                                    name="imageFile"
                                    accept="image/*"
                                    onChange={(e) => {
                                        const file = e.target.files[0];
                                        if (file) {
                                            const reader = new FileReader();
                                            reader.onload = () => {
                                                handleNewMedicalRecordChange({
                                                    target: { name: 'image', value: reader.result }
                                                });
                                            };
                                            reader.readAsDataURL(file);
                                        }
                                    }}
                                    className="xiz-form-file"
                                />
                                {newMedicalRecord.image && (
                                    <div className="xiz-image-preview">
                                        <img
                                            src={newMedicalRecord.image}
                                            alt="Medical record image"
                                            className="xiz-preview-image"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="xiz-dialog-footer">
                            <button onClick={handleAddMedicalRecordClose} className="xiz-btn xiz-btn-danger">CANCEL</button>
                            <button onClick={handleAddMedicalRecordSubmit} className="xiz-btn xiz-btn-primary">SAVE MEDICAL RECORD</button>
                        </div>
                    </div>
                </div>
            )}

            {/* View Medical Records Dialog */}
            {openMedicalRecordsDialog && (
                <div className="xiz-dialog-overlay">
                    <div className="xiz-dialog xiz-dialog-records">
                        <div className="xiz-dialog-header">
                            <h2>MEDICAL RECORDS - {patient.patient_name || 'UNKNOWN'}</h2>
                            <button onClick={handleCloseMedicalRecordsDialog} className="xiz-dialog-close-btn">×</button>
                        </div>
                        <div className="xiz-dialog-body">
                            {patientMedicalRecords.length === 0 ? (
                                <p className="xiz-no-records">NO MEDICAL RECORDS</p>
                            ) : (
                                <ul className="xiz-medical-records-list">
                                    {patientMedicalRecords.map((record, index) => (
                                        <li key={index} className="xiz-medical-record-item">
                                            <div className="xiz-record-header">
                                                <h4>RECORD ID: {record.record_id}</h4>
                                            </div>
                                            <div className="xiz-record-details">
                                                <p><strong>Symptoms:</strong> {record.symptoms || 'No symptoms'}</p>
                                                <p><strong>Diagnosis:</strong> {record.diagnosis || 'No diagnosis'}</p>
                                                <p><strong>Test Results:</strong> {record.test_results || 'No test results'}</p>
                                                <p><strong>Prescription:</strong> {record.prescription || 'No prescription'}</p>
                                                <p><strong>Notes:</strong> {record.notes || 'No notes'}</p>
                                                <p><strong>Image:</strong> {record.image ? <img src={record.image} alt="Record" className="xiz-record-image" /> : 'No image'}</p>
                                                <p><strong>Follow-up Date:</strong> {record.follow_up_date || 'No follow-up date'}</p>
                                                <p><strong>Created:</strong> {record.created_at ? new Date(record.created_at).toLocaleString('en-US') : 'No date'}</p>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                        <div className="xiz-dialog-footer">
                            <button onClick={handleCloseMedicalRecordsDialog} className="xiz-btn xiz-btn-danger">CLOSE</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Confirm Complete Dialog */}
            {showConfirmDialog && (
                <div className="xiz-dialog-overlay">
                    <div className="xiz-dialog xiz-dialog-confirm">
                        <div className="xiz-dialog-header">
                            <h2>CONFIRM COMPLETION</h2>
                        </div>
                        <div className="xiz-dialog-body">
                            <div className="xiz-confirm-content">
                                <div className="xiz-confirm-icon">
                                    <div className="xiz-warning-icon">⚠️</div>
                                </div>
                                <p className="xiz-confirm-message">
                                    Are you sure you want to complete this appointment?
                                </p>
                                <div className="xiz-patient-confirm-info">
                                    <p><strong>Patient:</strong> {patient.patient_name}</p>
                                    <p><strong>Date:</strong> {new Date(appointment.medical_day).toLocaleDateString('en-US')}</p>
                                    <p><strong>Time:</strong> {getTimeSlotLabel(appointment.slot)}</p>
                                </div>
                                <p className="xiz-confirm-note">
                                    This action cannot be undone.
                                </p>
                            </div>
                        </div>
                        <div className="xiz-dialog-footer">
                            <button onClick={handleCancelComplete} className="xiz-btn xiz-btn-secondary">CANCEL</button>
                            <button onClick={handleConfirmComplete} className="xiz-btn xiz-btn-primary">YES, COMPLETE</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExaminePatient;