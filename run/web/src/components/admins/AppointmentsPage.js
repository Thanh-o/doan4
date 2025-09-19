import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import FeedbackListWithReply from "./FeedbackListWithReply";
import "./AppointmentsPage.css";

const AppointmentsPage = () => {
  // Helper function to format date to YYYY-MM-DD
  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Set default dates
  const today = new Date();
  const fifteenDaysLater = new Date(today);
  fifteenDaysLater.setDate(today.getDate() + 15);

  const [appointments, setAppointments] = useState([]);
  const [allAppointments, setAllAppointments] = useState([]); // Store the full list
  const [startDate, setStartDate] = useState(formatDate(today));
  const [endDate, setEndDate] = useState(formatDate(fifteenDaysLater));
  const [status, setStatus] = useState("");
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await axios.get("http://localhost:8081/api/v1/appointments/list");
      const sortedData = response.data.sort(
        (a, b) => new Date(b.medical_day) - new Date(a.medical_day)
      );
      setAllAppointments(sortedData); // Store the full list
      setAppointments(sortedData); // Display initially
    } catch (error) {
      console.error("Error fetching appointments", error);
      setAllAppointments([]);
      setAppointments([]);
    }
  };

  const convertSlotToTime = (slot) => {
    const slotMapping = {
      1: "08:00 AM - 09:00 AM",
      2: "09:00 AM - 10:00 AM",
      3: "10:00 AM - 11:00 AM",
      4: "11:00 AM - 12:00 PM",
      5: "01:00 PM - 02:00 PM",
      6: "02:00 PM - 03:00 PM",
      7: "03:00 PM - 04:00 PM",
      8: "04:00 PM - 05:00 PM",
    };
    return slotMapping[slot] || "";
  };

  const handleSearch = () => {
    // Filter data on the frontend
    const filteredAppointments = allAppointments.filter((appointment) => {
      const medicalDay = new Date(appointment.medical_day).toISOString().split("T")[0];
      const start = startDate;
      const end = endDate;
      const matchesDate = medicalDay >= start && medicalDay <= end;
      const matchesStatus = status ? appointment.status === status : true;
      return matchesDate && matchesStatus;
    });
    setAppointments(
      filteredAppointments.sort((a, b) => new Date(b.medical_day) - new Date(a.medical_day))
    );
  };

  const handleAppointmentClick = (appointmentId) => {
    navigate(`/appointments/${appointmentId}`);
  };

  return (
    <div className="appointments-page">
      <Sidebar
        onInboxClick={() => setIsFeedbackModalOpen(true)}
        handleOpenDoctorsPage={() => navigate("/doctors")}
        handleOpenPatientsPage={() => navigate("/patients")}
        handleOpenAppointmentsPage={() => navigate("/appointments")}
        handleOpenStaffPage={() => navigate("/staff")}
      />
      <div className="content">
        <div className="header">
          <h2>Appointments List</h2>
          <div className="search">
            <div className="input-container">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
              <label>Start Date</label>
            </div>
            <div className="input-container">
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
              <label>End Date</label>
            </div>
            <div className="input-container">
              <select value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="">All Statuses</option>
                <option value="CANCELLED">CANCELLED</option>
                <option value="MISSED">MISSED</option>
                <option value="PENDING">PENDING</option>
                <option value="COMPLETED">COMPLETED</option>
              </select>
              <label>Status</label>
            </div>
            <button onClick={handleSearch}>Search</button>
          </div>
        </div>
        <div className="table-container-1">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Patient</th>
                <th>Doctor</th>
                <th>Date</th>
                <th>Time</th>
                <th>Status</th>
                <th>Price</th>
              </tr>
            </thead>
            <tbody>
              {appointments.length > 0 ? (
                appointments.map((appointment) => (
                  <tr
                    key={appointment.appointment_id}
                    onClick={() => handleAppointmentClick(appointment.appointment_id)}
                    style={{ cursor: "pointer" }}
                  >
                    <td>{appointment.appointment_id || ""}</td>
                    <td>{appointment.patient?.[0]?.patient_name || ""}</td>
                    <td>{appointment.doctor?.[0]?.doctor_name || ""}</td>
                    <td>
                      {appointment.medical_day
                        ? new Date(appointment.medical_day).toLocaleDateString()
                        : ""}
                    </td>
                    <td>{convertSlotToTime(appointment.slot)}</td>
                    <td>{appointment.status || ""}</td>
                    <td>{appointment.price || ""}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} align="center">
                    No appointments found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {isFeedbackModalOpen && (
          <div className="feedback-modal">
            <FeedbackListWithReply onClose={() => setIsFeedbackModalOpen(false)} />
          </div>
        )}
      </div>
    </div>
  );
};

export default AppointmentsPage;