import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./AppointmentDetailsModal.css";

const AppointmentDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [appointmentDetails, setAppointmentDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const formatTimeSlot = (slot) => {
    switch (slot) {
      case 1:
        return "8:00 AM - 9:00 AM";
      case 2:
        return "9:00 AM - 10:00 AM";
      case 3:
        return "10:00 AM - 11:00 AM";
      case 4:
        return "11:00 AM - 12:00 PM";
      case 5:
        return "01:00 PM - 02:00 PM";
      case 6:
        return "02:00 PM - 03:00 PM";
      case 7:
        return "03:00 PM - 04:00 PM";
      case 8:
        return "04:00 PM - 05:00 PM";
      default:
        return "Time Not Available";
    }
  };

  const getInitials = (name) => {
    if (!name) return "?";
    return name
        .split(" ")
        .map((word) => word.charAt(0))
        .join("")
        .toUpperCase()
        .slice(0, 2);
  };

  useEffect(() => {
    const fetchAppointmentDetails = async () => {
      if (!id || id === "undefined") {
        setError("Invalid appointment ID.");
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(
            `http://localhost:8081/api/v1/appointments/${id}`
        );
        setAppointmentDetails(response.data);
        setLoading(false);
      } catch (err) {
        setError("Unable to load appointment details. Please try again.");
        setLoading(false);
      }
    };
    fetchAppointmentDetails();
  }, [id]);

  if (loading) {
    return (
        <div className="appointment-details-page">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p className="loading-text">Loading appointment details...</p>
          </div>
        </div>
    );
  }

  if (error) {
    return (
        <div className="appointment-details-page">
          <div className="error-state">
            <p>{error}</p>
            <button className="back-btn" onClick={() => navigate("/dashboard")}>
              Back to Dashboard
            </button>
          </div>
        </div>
    );
  }

  return (
      <div className="appointment-details-page">
        <div className="appointment-details-container">
          <button className="back-btn" onClick={() => navigate("/dashboard")}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 11H7.83l4.88-4.88-1.41-1.41L4.83 11l6.47 6.47 1.41-1.41L7.83 13H19v-2z" />
            </svg>
            Back
          </button>

          {appointmentDetails && (
              <>
                {/* Profile Card */}

                  <div className="profile-header">
                      <h1>Appointment Details</h1>
                  </div>


                {/* Appointment Details Section */}
                <div className="profile-section">
                  <div className="section-title1">
                    <svg className="section-icon" viewBox="0 0 24 24" fill="currentColor">
                      <path
                          d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
                    </svg>
                    <h2>Appointment Information</h2>
                  </div>
                  <div className="appointment-details-grid">
                    <div className="detail-item">
                      <div className="detail-label">Appointment Date</div>
                      <div className="detail-value">
                        {new Date(appointmentDetails.medical_day).toLocaleDateString("en-US", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </div>
                    </div>
                    <div className="detail-item">
                      <div className="detail-label">Time Slot</div>
                      <div className="detail-value">{formatTimeSlot(appointmentDetails.slot)}</div>
                    </div>
                    <div className="detail-item">
                      <div className="detail-label">Status</div>
                      <div className="detail-value">{appointmentDetails.status}</div>
                    </div>
                    {/*<div className="detail-item">*/}
                    {/*  <div className="detail-label">Appointment ID</div>*/}
                    {/*  <div className="detail-value">#{appointmentDetails.appointment_id}</div>*/}
                    {/*</div>*/}
                  </div>
                </div>

                {/* Patient Information */}
                {appointmentDetails.patient && appointmentDetails.patient.length > 0 && (
                    <div className="profile-section">
                      <div className="section-title1">
                        <svg className="section-icon" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                        </svg>
                        <h2>Patient Information</h2>
                      </div>
                      <div className="patient-section">
                        <div className="person-info">
                          <div className="person-avatar">
                            {getInitials(appointmentDetails.patient[0].patient_name)}
                          </div>
                          <div className="person-details">
                            <h3>{appointmentDetails.patient[0].patient_name}</h3>
                            <p className="person-role">Patient</p>
                          </div>
                        </div>
                        <div className="contact-list">
                          <div className="contact-item">
                            <svg className="contact-icon" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                            </svg>
                            <div className="contact-info">
                              <span className="label">Email</span>
                              <span className="value">{appointmentDetails.patient[0].patient_email}</span>
                            </div>
                          </div>
                          <div className="contact-item">
                            <svg className="contact-icon" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
                            </svg>
                            <div className="contact-info">
                              <span className="label">Phone</span>
                              <span className="value">{appointmentDetails.patient[0].patient_phone}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                )}

                {/* Doctor Information */}
                {appointmentDetails.doctor && appointmentDetails.doctor.length > 0 && (
                    <div className="profile-section">
                      <div className="section-title1">
                        <svg className="section-icon" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                        <h2>Doctor Information</h2>
                      </div>
                      <div className="doctor-section">
                        <div className="person-info">
                          <div className="person-avatar">
                            {getInitials(appointmentDetails.doctor[0].doctor_name)}
                          </div>
                          <div className="person-details">
                            <h3>{appointmentDetails.doctor[0].doctor_name}</h3>
                            <p className="person-role">Doctor</p>
                          </div>
                        </div>
                        <div className="contact-list">
                          <div className="contact-item">
                            <svg className="contact-icon" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                            </svg>
                            <div className="contact-info">
                              <span className="label">Email</span>
                              <span className="value">{appointmentDetails.doctor[0].doctor_email}</span>
                            </div>
                          </div>
                          <div className="contact-item">
                            <svg className="contact-icon" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
                            </svg>
                            <div className="contact-info">
                              <span className="label">Phone</span>
                              <span className="value">{appointmentDetails.doctor[0].doctor_phone}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                )}

                {/* Payment Information */}
                {appointmentDetails.price && (
                    <div className="profile-section">
                      <div className="section-title1">
                        <svg className="section-icon" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z" />
                        </svg>
                        <h2>Payment Information</h2>
                      </div>
                      <div className="payment-section">
                        <div className="payment-amount">${appointmentDetails.price}</div>
                        <div className="payment-method">Appointment Fee</div>
                      </div>
                    </div>
                )}

                {/* Notice */}
                <div className="notice-text">
                  <strong>Important:</strong> If you want to cancel the appointment, please contact us before
                  the processing time via <strong>0377792678</strong> or <strong>FPTHealth@gmail.com</strong> for
                  timely support.
                </div>
              </>
          )}
        </div>
      </div>
  );
};

export default AppointmentDetailsPage;