// ✅ DoctorInfoPage.jsx - Giao diện dạng hồ sơ hiện đại (cải tiến)
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './DoctorInfoPage.css';
import Sidebar from "./Sidebar";
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaEdit, FaLock, FaArrowLeft } from 'react-icons/fa';

const DoctorInfoPage = () => {
    const [doctor, setDoctor] = useState(null);
    const [showEditDialog, setShowEditDialog] = useState(false);
    const [showChangePwDialog, setShowChangePwDialog] = useState(false);
    const [editData, setEditData] = useState({});
    const [selectedImage, setSelectedImage] = useState(null);
    const [imageUploading, setImageUploading] = useState(false);
    const [departments, setDepartments] = useState([]);
    const navigate = useNavigate();
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [showSuccessDialog, setShowSuccessDialog] = useState(false);

    useEffect(() => {
        const doctorId = localStorage.getItem('doctor_id');
        if (doctorId) {
            axios.get(`http://localhost:8081/api/v1/doctors/${doctorId}`).then(res => {
                setDoctor(res.data);
                setEditData({
                    doctor_name: res.data.doctor_name,
                    doctor_email: res.data.doctor_email,
                    doctor_address: res.data.doctor_address,
                    doctor_phone: res.data.doctor_phone,
                    doctor_description: res.data.doctor_description,
                    summary: res.data.summary,
                    doctor_price: res.data.doctor_price,
                    department_id: res.data.department_id,
                });
            });
        }
        axios.get('http://localhost:8081/api/v1/departments/list').then(res => setDepartments(res.data));
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        setSelectedImage(e.target.files[0]);
    };

    const uploadImageToImgBB = async () => {
        const apiKey = 'fa4176aa6360d22d4809f8799fbdf498';
        const formData = new FormData();
        formData.append('image', selectedImage);
        setImageUploading(true);
        try {
            const response = await axios.post(`https://api.imgbb.com/1/upload?key=${apiKey}`, formData);
            return response.data.data.url;
        } catch (error) {
            console.error('Image upload failed', error);
            return null;
        } finally {
            setImageUploading(false);
        }
    };

    const submitEdit = async () => {
        const doctorId = localStorage.getItem('doctor_id');
        if (!doctorId) return;

        let updatedData = {
            doctor_id: doctorId,
            ...editData
        };

        if (selectedImage) {
            const uploadedImageUrl = await uploadImageToImgBB();
            if (uploadedImageUrl) updatedData.doctor_image = uploadedImageUrl;
        }

        try {
            await axios.put('http://localhost:8081/api/v1/doctors/update', updatedData);
            setDoctor(prev => ({ ...prev, ...updatedData }));
            setShowEditDialog(false);
            setShowConfirmDialog(false);
            setShowSuccessDialog(true);
        } catch (error) {
            console.error('Update failed', error);

        }
    };


    const submitChangePassword = async () => {
        const doctorId = localStorage.getItem('doctor_id');
        if (!doctorId) return;

        if (editData.new_password !== editData.confirm_new_password) {
            setShowConfirmDialog(false);
            setShowSuccessDialog(false);
            // Bạn có thể tạo thêm một dialog thông báo lỗi nếu muốn
            return;
        }

        try {
            await axios.put('http://localhost:8081/api/v1/doctors/update', {
                doctor_id: doctorId,
                doctor_password: editData.new_password
            });
            setShowChangePwDialog(false);
            setShowConfirmDialog(false);
            setShowSuccessDialog(true);
        } catch (error) {
            console.error('Password update failed', error);
        }
    };


    const selectedDepartment = departments.find(
        dept => dept.department_id === doctor?.department_id
    );

    const handleOpenTodayAppointments = () => navigate('/todayappointments');
    const handleOpenMonthlyAppointments = () => navigate('/monthlyappointments');
    const handleOpenMedicalRecords = () => navigate('/medicalrecords');

    return (
        <div className="profiledoctor">
            <Sidebar
                handleOpenTodayAppointments={handleOpenTodayAppointments}
                handleOpenMonthlyAppointments={handleOpenMonthlyAppointments}
                handleOpenMedicalRecords={handleOpenMedicalRecords}
            />
            <div className="profile-container">
                <h2 className="profile-title">Doctor Profile</h2>
                {doctor && (
                    <>
                        <div className="profile-header">
                            <img src={doctor.doctor_image} alt="avatar" className="profile-avatar" />
                            <div className="profile-basic-info">
                                <h3>{doctor.doctor_name}</h3>
                                <p><FaEnvelope /> {doctor.doctor_email}</p>
                                <p><FaPhone /> {doctor.doctor_phone}</p>
                                <p><FaMapMarkerAlt /> {doctor.doctor_address}</p>

                            </div>
                        </div>

                        <div className="profile-details">
                            <h4>Professional Info</h4>
                            <p><strong>Summary:</strong> {doctor.summary}</p>
                            <p><strong>Description:</strong> {doctor.doctor_description}</p>
                            <p><strong>Price:</strong> ${doctor.doctor_price}</p>
                        </div>

                        {selectedDepartment && (
                            <div className="profile-department">
                                <h4>Department</h4>
                                <p><strong>Name:</strong> {selectedDepartment.department_name}</p>
                                <p><strong>Location:</strong> {selectedDepartment.location}</p>
                                <p><strong>Description:</strong> {selectedDepartment.department_description}</p>
                            </div>
                        )}

                        <div className="profile-actions">
                            <button className="btn doctorinfo-btn-secondary"
                                    onClick={() => navigate('/doctordashboard')}><FaArrowLeft/> Back
                            </button>
                            <button className="btn doctorinfo-btn-primary" onClick={() => setShowEditDialog(true)}>
                                <FaEdit/> Edit
                            </button>
                            <button className="btn doctorinfo-btn-warning" onClick={() => setShowChangePwDialog(true)}>
                                <FaLock/> Change Password
                            </button>

                        </div>
                    </>
                )}

                {showEditDialog && (
                    <div className="dialog-overlay">
                        <div className="dialog">
                            <div className="dialog-header">
                                <p></p>
                                <h3>Edit Info</h3>
                                <button className="dialog-close" onClick={() => setShowEditDialog(false)}>×</button>
                            </div>
                            <div className="dialog-content">
                                <label>Name</label>
                                <input name="doctor_name" value={editData.doctor_name || ''}
                                       onChange={handleInputChange}/>
                                <label>Address</label>
                                <input name="doctor_address" value={editData.doctor_address || ''}
                                       onChange={handleInputChange}/>
                                <label>Phone</label>
                                <input
                                    name="doctor_phone"
                                    value={editData.doctor_phone || ''}
                                    onChange={handleInputChange}
                                    type="tel"
                                    pattern="\d{10}"

                                    maxLength="10"
                                    required
                                    title="Phone number must be exactly 10 digits"
                                />

                                <label>Summary</label>
                                <input name="summary" value={editData.summary || ''} onChange={handleInputChange}/>
                                <label>Description</label>
                                <input name="doctor_description" value={editData.doctor_description || ''}
                                       onChange={handleInputChange}/>
                                <label>Price</label>
                                <input name="doctor_price" value={editData.doctor_price || ''}
                                       onChange={handleInputChange}/>
                                <label>Department</label>
                                <select name="department_id" value={editData.department_id || ''}
                                        onChange={handleInputChange}>

                                    {departments.map(dept => (
                                        <option key={dept.department_id}
                                                value={dept.department_id}>{dept.department_name}</option>
                                    ))}
                                </select>
                                <label>Upload Image</label>
                                <input type="file" accept="image/*" onChange={handleImageChange}/>
                                <div className="dialog-buttons">
                                    <button className="btn doctorinfo-btn-secondary"
                                            onClick={() => setShowEditDialog(false)}>Cancel
                                    </button>
                                    <button
                                        className="btn doctorinfo-btn-primary"
                                        onClick={() => setShowConfirmDialog(true)}
                                        disabled={imageUploading}
                                    >
                                        Save
                                    </button>
                                    {showConfirmDialog && (
                                        <div className="dialog-overlay">
                                            <div className="dialog">
                                                <div className="dialog-header">
                                                    <h3>Confirm Save</h3>
                                                    <button className="dialog-close"
                                                            onClick={() => setShowConfirmDialog(false)}>×
                                                    </button>
                                                </div>
                                                <div className="dialog-content">
                                                    <p>Are you sure you want to save the changes?</p>
                                                    <div className="dialog-buttons">
                                                        <button className="btn doctorinfo-btn-secondary"
                                                                onClick={() => setShowConfirmDialog(false)}>Cancel
                                                        </button>
                                                        <button className="btn doctorinfo-btn-primary"
                                                                onClick={submitEdit}>Save
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}


                                </div>

                            </div>

                        </div>
                    </div>
                )}
                {showSuccessDialog && (
                    <div className="dialog-overlay">
                        <div className="dialog">
                        <div className="dialog-header">
                                <h3>Success</h3>
                                <button className="dialog-close" onClick={() => setShowSuccessDialog(false)}>×</button>
                            </div>
                            <div className="dialog-content">
                                <p>Information updated successfully!</p>
                                <div className="dialog-buttons">
                                    <button className="btn doctorinfo-btn-primary" onClick={() => setShowSuccessDialog(false)}>OK</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                {showChangePwDialog && (
                    <div className="dialog-overlay">
                        <div className="dialog">
                            <div className="dialog-header">
                                <p></p>
                                <h3>Change Password</h3>
                                <button className="dialog-close" onClick={() => setShowChangePwDialog(false)}>×</button>
                            </div>
                            <div className="dialog-content">
                                <label>Current Password</label>
                                <input type="password" name="current_password" onChange={handleInputChange}/>
                                <label>New Password</label>
                                <input type="password" name="new_password" onChange={handleInputChange}/>
                                <label>Confirm New Password</label>
                                <input type="password" name="confirm_new_password" onChange={handleInputChange}/>
                                <div className="dialog-buttons">
                                    <button className="btn doctorinfo-btn-secondary"
                                            onClick={() => setShowChangePwDialog(false)}>Cancel
                                    </button>
                                    <button className="btn doctorinfo-btn-primary"
                                            onClick={() => setShowConfirmDialog(true)}>Save
                                    </button>
                                    {showConfirmDialog && (
                                        <div className="dialog-overlay">
                                            <div className="dialog">
                                                <div className="dialog-header">
                                                    <h3>Confirm Password Change</h3>
                                                    <button className="dialog-close" onClick={() => setShowConfirmDialog(false)}>×</button>
                                                </div>
                                                <div className="dialog-content">
                                                    <p>Are you sure you want to change your password?</p>
                                                    <div className="dialog-buttons">
                                                        <button className="btn doctorinfo-btn-secondary" onClick={() => setShowConfirmDialog(false)}>Cancel</button>
                                                        <button className="btn doctorinfo-btn-primary" onClick={submitChangePassword}>Yes</button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}



                                </div>
                            </div>
                        </div>
                    </div>
                )}
                {showSuccessDialog && (
                    <div className="dialog-overlay">
                        <div className="dialog">
                            <div className="dialog-header">
                                <h3>Password Updated</h3>
                                <button className="dialog-close" onClick={() => setShowSuccessDialog(false)}>×</button>
                            </div>
                            <div className="dialog-content">
                                <p>Your password has been successfully updated.</p>
                                <div className="dialog-buttons">
                                    <button className="btn doctorinfo-btn-primary" onClick={() => setShowSuccessDialog(false)}>OK</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                    </div>
        </div>
    );
};

export default DoctorInfoPage;
