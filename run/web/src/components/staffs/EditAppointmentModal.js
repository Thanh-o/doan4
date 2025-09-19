import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './EditAppointmentModal.css';

const EditAppointmentModal = ({ appointment, onClose, onSave }) => {
    const [editedAppointment, setEditedAppointment] = useState(appointment);
    const [doctors, setDoctors] = useState([]);

    useEffect(() => {
        // Fetch list of doctors when the modal is opened
        axios.get('http://localhost:8081/api/v1/doctors/list')
            .then(response => {
                setDoctors(response.data);
            })
            .catch(error => {
                console.error('Error fetching doctors:', error);
            });
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEditedAppointment((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSave = () => {
        const staffId = localStorage.getItem('staffId');
        const dataToSend = {
            ...editedAppointment,
            staff_id: staffId,
            slot: parseInt(editedAppointment.slot) // Convert slot to integer
        };

        axios.put(`http://localhost:8081/api/v1/appointments/update`, dataToSend)
            .then(response => {
                onSave(editedAppointment);
                onClose();
            })
            .catch(error => {
                console.error('Error updating appointment', error);
            });
    };

    const slotOptions = [
        { value: 1, label: '08:00 - 09:00' },
        { value: 2, label: '09:00 - 10:00' },
        { value: 3, label: '10:00 - 11:00' },
        { value: 4, label: '11:00 - 12:00' },
        { value: 5, label: '13:00 - 14:00' },
        { value: 6, label: '14:00 - 15:00' },
        { value: 7, label: '15:00 - 16:00' },
        { value: 8, label: '16:00 - 17:00' }
    ];

    return (
        <div className={`modal ${Boolean(appointment) ? 'modal-open' : ''}`} onClick={onClose}>
            <div className="modal-box" onClick={(e) => e.stopPropagation()}>
                <h2>Edit Appointment</h2>
                <label>
                    Appointment Date:
                    <input
                        type="date"
                        name="appointment_date"
                        value={new Date(editedAppointment.appointment_date).toISOString().split('T')[0]}
                        onChange={handleChange}
                        className="text-field"
                    />
                </label>
                <label>
                    Slot:
                    <select
                        name="slot"
                        value={editedAppointment.slot}
                        onChange={handleChange}
                        className="text-field"
                    >
                        <option value="">Select Slot</option>
                        {slotOptions.map(slot => (
                            <option key={slot.value} value={slot.value}>
                                {slot.label}
                            </option>
                        ))}
                    </select>
                </label>
                <label>
                    Doctor:
                    <select
                        name="doctor_id"
                        value={editedAppointment.doctor_id}
                        onChange={handleChange}
                        className="text-field"
                    >
                        <option value="">Select Doctor</option>
                        {doctors.map(doctor => (
                            <option key={doctor.doctor_id} value={doctor.doctor_id}>
                                {doctor.doctor_name}
                            </option>
                        ))}
                    </select>
                </label>
                <div className="modal-actions">
                    <button className="cancel-button" onClick={onClose}>Cancel</button>
                    <button className="save-button" onClick={handleSave}>Save</button>
                </div>
            </div>
        </div>
    );
};

export default EditAppointmentModal;
