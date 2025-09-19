// import React from 'react';
// import './AppointmentList.css';

// const AppointmentList = ({ searchResults, handleEditClick, handleConfirmAppointment }) => {
//     return (
//         <div className="appointment-list">
//             {searchResults.map((appointment) => (
//                 <div key={appointment.appointment_id} className="appointment-card">
//                     <p><strong>Patient Name:</strong> {appointment.patient_name}</p>
//                     <p><strong>Doctor Name:</strong> {appointment.doctor_name}</p>
//                     <p><strong>Appointment Date:</strong> {new Date(appointment.appointment_date).toLocaleString()}</p>
//                     <p><strong>Appointment Date:</strong> {new Date(appointment.appointment_date).toLocaleString()}</p>
//                     <p><strong>Medical Day:</strong> {new Date(appointment.medical_day).toLocaleDateString()}</p>
//                     <p><strong>Slot:</strong> {appointment.slot}</p>
//                     <p><strong>Status:</strong> {appointment.status}</p>
//                     <p><strong>Payment Name:</strong> {appointment.payment_name}</p>
//                     <p><strong>Price:</strong> {appointment.price}</p>
//                     <button className="edit-button" onClick={() => handleEditClick(appointment)}>
//                         Edit
//                     </button>
//                     {appointment.status !== 'Confirmed' && (
//                         <button className="confirm-button" onClick={() => handleConfirmAppointment(appointment.appointment_id)}>
//                             Confirm
//                         </button>
//                     )}
//                 </div>
//             ))}
//         </div>
//     );
// };

// export default AppointmentList;
// import React, { useState } from 'react';
// import axios from 'axios';
// import './EditAppointmentModal.css';

// const EditAppointmentModal = ({ appointment, onClose, onSave }) => {
//     const [editedAppointment, setEditedAppointment] = useState(appointment);

//     const handleChange = (e) => {
//         const { name, value } = e.target;
//         setEditedAppointment((prev) => ({
//             ...prev,
//             [name]: value,
//         }));
//     };

//     const handleSave = () => {
//         const staffId = localStorage.getItem('staff_id');
//         const dataToSend = {
//             ...editedAppointment,
//             staff_id: staffId
//         };

//         axios.put('http://localhost:8081/api/v1/appointments/updateStatus', dataToSend)
//             .then(response => {
//                 onSave(editedAppointment);
//                 onClose();
//             })
//             .catch(error => {
//                 console.error('Error updating appointment status', error);
//             });
//     };

//     return (
//         <div className={`modal ${Boolean(appointment) ? 'modal-open' : ''}`} onClick={onClose}>
//             <div className="modal-box" onClick={(e) => e.stopPropagation()}>
//                 <h2>Edit Appointment</h2>
//                 <input
//                     type="text"
//                     name="status"
//                     value={editedAppointment.status}
//                     onChange={handleChange}
//                     className="text-field"
//                 />
//                 <div className="modal-actions">
//                     <button className="cancel-button" onClick={onClose}>Cancel</button>
//                     <button className="save-button" onClick={handleSave}>Save</button>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default EditAppointmentModal;
