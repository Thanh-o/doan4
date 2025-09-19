import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Sidebar from "./Sidebar";
import "./TodayAppointments.css";

const TodayAppointments = () => {
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  const timeSlots = [
    { label: "08:00 AM - 09:00 AM", value: 1 },
    { label: "09:00 AM - 10:00 AM", value: 2 },
    { label: "10:00 AM - 11:00 AM", value: 3 },
    { label: "11:00 AM - 12:00 PM", value: 4 },
    { label: "01:00 PM - 02:00 PM", value: 5 },
    { label: "02:00 PM - 03:00 PM", value: 6 },
    { label: "03:00 PM - 04:00 PM", value: 7 },
    { label: "04:00 PM - 05:00 PM", value: 8 },
  ];

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = () => {
    const storedDoctorId = localStorage.getItem("doctor_id");
    if (storedDoctorId) {
      const today = new Date().toISOString().split("T")[0];
      axios
        .get("http://localhost:8081/api/v1/appointments/search", {
          params: {
            medical_day: today,
            doctor_id: storedDoctorId,
          },
        })
        .then((response) => {
          const filtered = response.data.filter((item) =>
            /^[A-Z]+$/.test(item.status)
          );
          setTodayAppointments(filtered);
        })
        .catch((error) => {
          console.error("Lỗi khi lấy lịch khám hôm nay", error);
        });
    }
  };

  const filteredTodayAppointments = todayAppointments
    .filter((appointment) => {
      const patientName =
        appointment.patient?.[0]?.patient_name.toLowerCase() || "";
      return patientName.includes(searchQuery.toLowerCase());
    })
      .sort((a, b) => {
        // PENDING lên trước
        if (a.status === "PENDING" && b.status !== "PENDING") return -1;
        if (a.status !== "PENDING" && b.status === "PENDING") return 1;
        // Nếu cùng status thì sắp xếp theo slot
        return a.slot - b.slot;
      });

  const getTimeSlotLabel = (slotValue) => {
    const slot = timeSlots.find((s) => s.value === slotValue);
    return slot ? slot.label : "";
  };

  const handleViewDetails = async (appointment) => {
    try {
      const patientId = appointment.patient?.[0]?.patient_id;

      if (!patientId) {
        console.error("Patient ID not found in appointment");
        return;
      }

      const response = await axios.get(
        `http://localhost:8081/api/v1/medicalrecords/patient/${patientId}`
      );

      navigate("/record-details", {
        state: {
          records: response.data || [],
        },
      });
    } catch (error) {
      console.error("Error fetching medical records:", error);
      navigate("/record-details", {
        state: {
          records: [],
        },
      });
    }
  };

  return (
    <div className="today-appointments">
      <Sidebar
        handleOpenTodayAppointments={() => navigate("/todayappointments")}
        handleOpenMonthlyAppointments={() => navigate("/monthlyappointments")}
        handleOpenMedicalRecords={() => navigate("/medicalrecords")}
      />
      <div className="content-appoint">
        {successMessage && (
          <div className="success-message">{successMessage}</div>
        )}

        <h3 className="tab-title">Today's Appointments Schedule</h3>

        <input
          type="text"
          placeholder="Search by patient name..."
          className="search-input-appoint"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <ul className="appointments-list">
          {filteredTodayAppointments.map((appointment, index) => (
            <li key={index}>
              <div>
                <p>
                  Patient Name: {appointment.patient?.[0]?.patient_name || ""}
                </p>
                <p>
                  Date: {new Date(appointment.medical_day).toLocaleDateString()}
                </p>
                <p>Time: {getTimeSlotLabel(appointment.slot)}</p>
                <p>
                  Status:{" "}
                  <span
                    className={`status ${appointment.status.toLowerCase()}`}
                  >
                    {appointment.status}
                  </span>
                </p>
              </div>
              <div>
                {appointment.status === "PENDING" ? (
                    <div >
                      <button
                          className="btn btn-primary"
                          onClick={() =>
                              navigate(`/examine/${appointment.appointment_id}`)
                          }
                      >
                        Examine
                      </button>
                      <button
                          className="btn btn-secondary"
                          onClick={() => handleViewDetails(appointment)}
                      >
                        View Medical Record
                      </button>
                    </div>

                ) : (
                    <button
                        className="btn btn-secondary"
                        onClick={() => handleViewDetails(appointment)}
                    >
                      View Medical Record
                    </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default TodayAppointments;
