import React, { useState } from 'react';
import { Modal, Box, Typography, TextField, Button } from '@mui/material';
import axios from 'axios';

const EditDoctorModal = ({ doctor, onClose, onSave }) => {
    const [formData, setFormData] = useState(doctor);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleSave = () => {
        axios.put('http://localhost:8081/api/v1/doctors/update', formData)
            .then((response) => {
                onSave(formData);
                onClose();
            })
            .catch((error) => {
                console.error('Error updating doctor', error);
            });
    };

    return (
        <Modal
            open={Boolean(doctor)}
            onClose={onClose}
            aria-labelledby="edit-doctor-modal-title"
            aria-describedby="edit-doctor-modal-description"
        >
            <Box sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 400,
                bgcolor: 'background.paper',
                border: '2px solid #000',
                boxShadow: 24,
                p: 4
            }}>
                <Typography id="edit-doctor-modal-title" variant="h6" component="h2">
                    Edit Doctor
                </Typography>
                <TextField
                    label="Name"
                    name="doctor_name"
                    value={formData.doctor_name}
                    onChange={handleChange}
                    fullWidth
                    margin="normal"
                />
                <TextField
                    label="Phone"
                    name="doctor_phone"
                    value={formData.doctor_phone}
                    onChange={handleChange}
                    fullWidth
                    margin="normal"
                />
                <TextField
                    label="Address"
                    name="doctor_address"
                    value={formData.doctor_address}
                    onChange={handleChange}
                    fullWidth
                    margin="normal"
                />
                <TextField
                    label="Email"
                    name="doctor_email"
                    value={formData.doctor_email}
                    onChange={handleChange}
                    fullWidth
                    margin="normal"
                />
                <TextField
                    label="Department ID"
                    name="department_id"
                    value={formData.department_id}
                    onChange={handleChange}
                    fullWidth
                    margin="normal"
                />
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                    <Button variant="contained" color="primary" onClick={handleSave} sx={{ mr: 2 }}>
                        Save
                    </Button>
                    <Button variant="contained" color="secondary" onClick={onClose}>
                        Cancel
                    </Button>
                </Box>
            </Box>
        </Modal>
    );
};

export default EditDoctorModal;
