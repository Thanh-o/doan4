import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";
import bannerImg from "../img/pexels-pixabay-40568.jpg";
import axios from "axios";

function Dashboard() {
  const navigate = useNavigate();
  const [patientData, setPatientData] = useState(null);
  const [imageValid, setImageValid] = useState(false);
  const [imagePath, setImagePath] = useState("");
  const [appointmentVisible, setAppointmentVisible] = useState(true);
  const patientId = sessionStorage.getItem("patient_id");
  const [currentAppointmentPage, setCurrentAppointmentPage] = useState(1);
  const [currentRecordPage, setCurrentRecordPage] = useState(1);
  const itemsPerPage = 3;
  const [openEditAppointment, setOpenEditAppointment] = useState(false);
  const [editAppointmentData, setEditAppointmentData] = useState(null);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [openEditPatient, setOpenEditPatient] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [openChangePassword, setOpenChangePassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState({
    old: false,
    new: false,
    confirm: false,
  });

  // Simple solution: Convert to smaller base64 and resize image
  const resizeAndConvertImage = async (file) => {
    return new Promise((resolve) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();

      img.onload = () => {
        // Resize image to max 300x300 to reduce size
        const maxSize = 300;
        let { width, height } = img;

        if (width > height) {
          if (width > maxSize) {
            height = (height * maxSize) / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = (width * maxSize) / height;
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;

        ctx.drawImage(img, 0, 0, width, height);

        // Convert to base64 with lower quality to reduce size
        const base64 = canvas.toDataURL("image/jpeg", 0.7); // 70% quality
        resolve(base64);
      };

      img.src = URL.createObjectURL(file);
    });
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showNotification("Image size must be less than 5MB", "error");
      return;
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      showNotification("Please select a valid image file", "error");
      return;
    }

    setImageUploading(true);

    try {
      // Resize and use base64
      const imageUrl = await resizeAndConvertImage(file);

      // Update patient image using the /update-image API
      const response = await axios.put(
        "http://localhost:8081/api/v1/patients/update-image",
        {
          patient_id: Number.parseInt(patientId),
          patient_img: imageUrl,
        }
      );

      if (response.data.message === "Image updated successfully") {
        setImagePath(imageUrl);
        setPatientData((prev) => ({ ...prev, patient_img: imageUrl }));
        setImageValid(true);
        showNotification("Image updated successfully!", "success");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      showNotification("Failed to update image. Please try again.", "error");
    } finally {
      setImageUploading(false);
    }
  };

  const toggleAppointmentVisible = () => {
    setAppointmentVisible(!appointmentVisible);
    setCurrentRecordPage(1);
    setCurrentAppointmentPage(1);
  };

  const timeSlots = [
    { label: "08:00 AM - 09:00 AM", value: 1, start: "08:00", end: "09:00" },
    { label: "09:00 AM - 10:00 AM", value: 2, start: "09:00", end: "10:00" },
    { label: "10:00 AM - 11:00 AM", value: 3, start: "10:00", end: "11:00" },
    { label: "11:00 AM - 12:00 PM", value: 4, start: "11:00", end: "12:00" },
    { label: "01:00 PM - 02:00 PM", value: 5, start: "13:00", end: "14:00" },
    { label: "02:00 PM - 03:00 PM", value: 6, start: "14:00", end: "15:00" },
    { label: "03:00 PM - 04:00 PM", value: 7, start: "15:00", end: "16:00" },
    { label: "04:00 PM - 05:00 PM", value: 8, start: "16:00", end: "17:00" },
  ];

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
        return "Unknown Time Slot";
    }
  };

  const [formData, setFormData] = useState({
    date: "",
    timeSlot: "",
  });

  const handleCancelEditAppointment = () => {
    setFormData({
      date: "",
      timeSlot: "",
    });
    setBookedSlots([]);
    setAvailableSlots([]);
    setEditAppointmentData(null);
    setOpenEditAppointment(false);
  };

  useEffect(() => {
    if (formData.date && editAppointmentData) {
      axios
        .get(
          `http://localhost:8081/api/v1/appointments/${editAppointmentData.doctor_id}/slots`
        )
        .then((response) => {
          setBookedSlots(response.data);
        })
        .catch((error) => {
          console.error("Lỗi khi lấy danh sách khung giờ đã đặt!", error);
        });
    }
  }, [formData.date, editAppointmentData]);

  useEffect(() => {
    if (formData.date && bookedSlots.length > 0) {
      const bookedSlotsForDate = bookedSlots
        .filter((slot) => {
          const slotDate = new Date(slot.medical_day)
            .toISOString()
            .split("T")[0];
          return slotDate === formData.date;
        })
        .map((slot) => slot.slot);
      const available = timeSlots.filter(
        (slot) => !bookedSlotsForDate.includes(slot.value)
      );
      setAvailableSlots(available);
    } else {
      setAvailableSlots(timeSlots);
    }
  }, [formData.date, bookedSlots]);

  const handleDateChange = (date) => {
    setFormData({
      ...formData,
      date: date,
      timeSlot: "",
    });
  };

  const handleViewDetails = (record) => {
    const mergedRecord = {
      ...record,
      patient_name: patientData.patient_name,
      patient_email: patientData.patient_email,
      patient_phone: patientData.patient_phone,
      patient_address: patientData.patient_address,
      patient_gender: patientData.patient_gender,
      patient_dob: patientData.patient_dob,
      // ...các trường khác nếu cần
    };
    navigate("/medical-record-details", { state: { record: mergedRecord } });
  };

  const handleViewAppointmentDetails = (appointment) => {
    if (!appointment || !appointment.appointment_id) {
      showNotification(
        "Không thể xem chi tiết cuộc hẹn: ID không hợp lệ.",
        "error"
      );
      return;
    }
    navigate(`/appointment/${appointment.appointment_id}`);
  };

  const handleTimeSlotChange = (slot) => {
    setFormData({
      ...formData,
      timeSlot: slot,
    });
  };

  const renderDateButtons = () => {
    const dates = generateDateButtons();
    return (
      <div className="date-container">
        <label>Date</label>
        <div className="date-select">
          <div className="date-buttons">
            {dates.map((date) => (
              <button
                key={date.value}
                className={formData.date === date.value ? "selected" : ""}
                onClick={() => handleDateChange(date.value)}
              >
                {date.label}
              </button>
            ))}
          </div>
          <span>OR</span>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => handleDateChange(e.target.value)}
            min={new Date().toISOString().split("T")[0]}
            className="ipSelectDate"
          />
        </div>
      </div>
    );
  };

  const renderTimeSlots = () => {
    return (
      <div className="time-container">
        <label>Time</label>
        <div className="time-slots">
          {availableSlots.map((slot) => (
            <button
              key={slot.value}
              className={formData.timeSlot === slot.value ? "selected" : ""}
              onClick={() => handleTimeSlotChange(slot.value)}
              disabled={isTimeSlotPast(formData.date, slot.start)}
              style={{
                backgroundColor: isTimeSlotPast(formData.date, slot.start)
                  ? "#d3d3d3"
                  : "",
                pointerEvents: isTimeSlotPast(formData.date, slot.start)
                  ? "none"
                  : "auto",
              }}
            >
              {slot.label}
            </button>
          ))}
        </div>
      </div>
    );
  };

  useEffect(() => {
    if (openEditAppointment) {
      document.body.classList.add("no-scroll");
    } else {
      document.body.classList.remove("no-scroll");
    }
  }, [openEditAppointment]);

  const isTimeSlotPast = (date, startTime) => {
    const appointmentDate = new Date(date);
    const currentDate = new Date();
    const [startHour, startMinute] = startTime.split(":").map(Number);

    appointmentDate.setHours(startHour, startMinute, 0, 0);

    return appointmentDate < currentDate;
  };

  const generateDateButtons = () => {
    const today = new Date();
    const dates = [];
    for (let i = 0; i < 3; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dateString = date.toISOString().split("T")[0];
      dates.push({
        label:
          i === 0
            ? `Today (${dateString})`
            : i === 1
            ? `Tomorrow (${dateString})`
            : `Day after tomorrow (${dateString})`,
        value: dateString,
      });
    }
    return dates;
  };

  const handleConfirmEditAppointment = () => {
    if (editAppointmentData) {
      handleEditAppointment(editAppointmentData);
    }
    setOpenEditAppointment(false);
  };

  const handleEditAppointment = async (appointment) => {
    try {
      await axios.put(`http://localhost:8081/api/v1/appointments/update`, {
        appointment_id: appointment.appointment_id,
        medical_day: formData.date,
        slot: formData.timeSlot,
        status: "Pending",
      });
      sessionStorage.setItem(
        "appointmentMessage",
        "Cập nhật cuộc hẹn thành công!"
      );
      window.location.reload();
    } catch (error) {
      console.error("Không thể cập nhật cuộc hẹn.", error);
      showNotification(
        "Không thể cập nhật cuộc hẹn. Vui lòng thử lại.",
        "error"
      );
    }
  };

  const filterFutureAppointments = (appointments) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return appointments.filter((appointment) => {
      const appointmentDate = new Date(appointment.medical_day);
      appointmentDate.setHours(0, 0, 0, 0);
      return appointmentDate >= today;
    });
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
    const fetchPatientData = async () => {
      try {
        if (!patientId) {
          console.error("patientId không hợp lệ:", patientId);
          showNotification("Vui lòng đăng nhập để xem thông tin.", "error");
          return;
        }

        const response = await axios.get(
          `http://localhost:8081/api/v1/patients/search?patient_id=${patientId}`
        );
        const patientData = response.data[0];
        console.log("API trả về patientData:", patientData); // Thêm dòng này để kiểm tra
        if (!patientData || !patientData.appointmentsList) {
          console.error(
            "Dữ liệu bệnh nhân hoặc danh sách cuộc hẹn không hợp lệ:",
            patientData
          );
          showNotification("Không thể tải dữ liệu bệnh nhân.", "error");
          return;
        }

        setPatientData(patientData);
        setEditFormData({
          patient_name: patientData.patient_name || "",
          patient_dob: patientData.patient_dob
            ? formatDateToInput(patientData.patient_dob)
            : "",
          patient_gender: patientData.patient_gender || "Male",
          patient_email: patientData.patient_email || "",
          patient_phone: patientData.patient_phone || "",
          patient_address: patientData.patient_address || "",
        });

        if (patientData.patient_img) {
          if (
            patientData.patient_img.startsWith("http") ||
            patientData.patient_img.startsWith("data:")
          ) {
            setImagePath(patientData.patient_img);
          } else {
            setImagePath(`http://localhost:8081/${patientData.patient_img}`);
          }
          setImageValid(true);
        } else {
          setImageValid(false);
        }
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu bệnh nhân:", error);
        showNotification(
          "Không thể tải dữ liệu bệnh nhân. Vui lòng thử lại.",
          "error"
        );
      }
    };

    fetchPatientData();
  }, [patientId]);

  const appointments =
    patientData && Array.isArray(patientData.appointmentsList)
      ? patientData.appointmentsList
      : [];
  const medicalRecords =
    patientData && Array.isArray(patientData.medicalrecordsList)
      ? patientData.medicalrecordsList
      : [];
  const futureAppointments = filterFutureAppointments(appointments);
  const sortedAppointments = futureAppointments
    .slice()
    .sort((a, b) => b.appointment_id - a.appointment_id); // Sắp xếp theo id từ lớn đến nhỏ
  const sortedMedicalRecords = medicalRecords
    .slice()
    .sort((a, b) => new Date(b.follow_up_date) - new Date(a.follow_up_date));

  const totalAppointmentPages = Math.ceil(
    sortedAppointments.length / itemsPerPage
  );
  const startAppointmentIndex = (currentAppointmentPage - 1) * itemsPerPage;
  const currentAppointments = sortedAppointments.slice(
    startAppointmentIndex,
    startAppointmentIndex + itemsPerPage
  );

  const totalRecordPages = Math.ceil(medicalRecords.length / itemsPerPage);
  const startRecordIndex = (currentRecordPage - 1) * itemsPerPage;
  const currentRecords = sortedMedicalRecords.slice(
    startRecordIndex,
    startRecordIndex + itemsPerPage
  );

  const getStatusIcon = (status) => {
    switch (status) {
      case "PENDING":
        return <span className="status-icon pending"></span>;
      case "COMPLETED":
        return <span className="status-icon completed"></span>;
      case "CANCELLED":
        return <span className="status-icon cancelled"></span>;
      default:
        return <span className="status-icon"></span>;
    }
  };

  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const [patientResponse, doctorsResponse, departmentsResponse] =
          await Promise.all([
            axios.get("http://localhost:8081/api/v1/patients/list"),
            axios.get("http://localhost:8081/api/v1/doctors/list"),
            axios.get("http://localhost:8081/api/v1/departments/list"),
          ]);

        setDoctors(doctorsResponse.data);
        setDepartments(departmentsResponse.data);
        localStorage.setItem("doctors", JSON.stringify(doctorsResponse.data));
        localStorage.setItem(
          "departments",
          JSON.stringify(departmentsResponse.data)
        );
      } catch (error) {
        console.error("Lỗi khi lấy chi tiết:", error);
        showNotification("Không thể tải dữ liệu bác sĩ hoặc khoa.", "error");
      }
    };

    fetchDetails();
  }, []);

  const getDepartmentName = (doctorId) => {
    const doctor = doctors.find((doc) => doc.doctor_id === doctorId);
    if (doctor) {
      const department = departments.find(
        (dep) => dep.department_id === doctor.department_id
      );
      return department ? department.department_name : "Khoa Không Xác Định";
    }
    return "Khoa Không Xác Định";
  };

  const handleOpenEditAppointment = (appointment) => {
    if (!appointment || !appointment.appointment_id) {
      showNotification(
        "Không thể chỉnh sửa cuộc hẹn: ID không hợp lệ.",
        "error"
      );
      return;
    }
    setEditAppointmentData(appointment);
    setOpenEditAppointment(true);
  };

  const isEditCancelDisabled = (appointmentDate, appointmentSlot) => {
    const startTime = appointmentSlot.split(" - ")[0];
    const appointmentDateTime = new Date(
      `${appointmentDate}T${convertTo24Hour(startTime)}`
    );
    const currentTime = new Date();
    const timeDifference = appointmentDateTime - currentTime;
    const twoHoursInMillis = 2 * 60 * 60 * 1000;
    return timeDifference < twoHoursInMillis;
  };

  const convertTo24Hour = (time) => {
    const [timePart, modifier] = time.split(" ");
    let [hours, minutes] = timePart.split(":");
    if (modifier === "PM" && hours !== "12") {
      hours = Number.parseInt(hours, 10) + 12;
    }
    if (modifier === "AM" && hours === "12") {
      hours = "00";
    }
    hours = hours < 10 ? `0${hours}` : hours;
    return `${hours}:${minutes}:00`;
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;

    if (name === "patient_phone") {
      const phoneRegex = /^\d{0,10}$/;
      if (!phoneRegex.test(value)) {
        return;
      }
    }

    if (name === "patient_dob") {
      const digitsOnly = value.replace(/\D/g, "");
      let formattedValue = "";
      if (digitsOnly.length >= 1) {
        formattedValue = digitsOnly.substring(0, 2);
      }
      if (digitsOnly.length >= 3) {
        formattedValue += "/" + digitsOnly.substring(2, 4);
      }
      if (digitsOnly.length >= 5) {
        formattedValue += "/" + digitsOnly.substring(4, 8);
      }

      setEditFormData((prev) => ({
        ...prev,
        [name]: formattedValue,
      }));
      return;
    }

    setEditFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const parseDateFromInput = (str) => {
    if (!str) return "";
    try {
      const parts = str.split("/");
      if (parts.length !== 3) return "";
      const day = parts[0].padStart(2, "0");
      const month = parts[1].padStart(2, "0");
      const year = parts[2];
      const dayNum = Number.parseInt(day, 10);
      const monthNum = Number.parseInt(month, 10);
      const yearNum = Number.parseInt(year, 10);

      if (
        dayNum < 1 ||
        dayNum > 31 ||
        monthNum < 1 ||
        monthNum > 12 ||
        yearNum < 1900 ||
        yearNum > 2100
      ) {
        return "";
      }
      // Trả về định dạng ISO LocalDateTime
      return `${year}-${month}-${day}T00:00:00`;
    } catch (error) {
      console.error("Lỗi khi phân tích ngày:", error);
      return "";
    }
  };

  const isValidDateFormat = (dateStr) => {
    if (!dateStr) return false;
    const regex = /^\d{2}\/\d{2}\/\d{4}$/;
    if (!regex.test(dateStr)) return false;
    try {
      const [day, month, year] = dateStr.split("/").map(Number);
      if (
        day < 1 ||
        day > 31 ||
        month < 1 ||
        month > 12 ||
        year < 1900 ||
        year > 2100
      ) {
        return false;
      }
      const date = new Date(year, month - 1, day);
      return (
        date.getFullYear() === year &&
        date.getMonth() === month - 1 &&
        date.getDate() === day
      );
    } catch (error) {
      return false;
    }
  };

  const showNotification = (message, type = "success") => {
    const notification = document.createElement("div");
    notification.className = `notification ${type}`;
    notification.innerHTML = `
    <div style="
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 15px 25px;
      border-radius: 8px;
      background-color: ${type === "success" ? "#4caf50" : "#f44336"};
      color: white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      z-index: 1000;
      animation: slideIn 0.3s ease-out, fadeOut 0.3s ease-in 2.7s;
    ">
      ${message}
    </div>
    <style>
      @keyframes slideIn {
        from { transform: translateX(100%); }
        to { transform: translateX(0); }
      }
      @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
      }
      .notification {
        display: flex;
        align-items: center;
      }
    </style>
  `;
    document.body.appendChild(notification);
    setTimeout(() => {
      notification.remove();
    }, 3000);
  };

  const showConfirmModal = (message, onConfirm, onCancel) => {
    const modal = document.createElement("div");
    modal.className = "confirm-modal";
    modal.innerHTML = `
    <div style="
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    ">
      <div style="
        background: white;
        padding: 20px;
        border-radius: 8px;
        max-width: 400px;
        width: 100%;
        text-align: center;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      ">
        <h3 style="margin: 0 0 15px; font-size: 18px;">Confirm Action</h3>
        <p style="margin: 0 0 20px;">${message}</p>
        <div style="display: flex; justify-content: center; gap: 10px;">
          <button style="
            padding: 10px 20px;
            background: #004b91;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
          " class="confirm-btn">Yes</button>
          <button style="
            padding: 10px 20px;
            background: #f44336;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
          " class="cancel-btn">No</button>
        </div>
      </div>
    </div>
  `;
    document.body.appendChild(modal);

    const confirmBtn = modal.querySelector(".confirm-btn");
    const cancelBtn = modal.querySelector(".cancel-btn");

    confirmBtn.addEventListener("click", () => {
      onConfirm();
      modal.remove();
    });
    cancelBtn.addEventListener("click", () => {
      onCancel();
      modal.remove();
    });
  };

  const handleSavePatient = async () => {
    if (editFormData.patient_phone.length !== 10) {
      showNotification("Phone number must be exactly 10 digits", "error");
      return;
    }

    if (!isValidDateFormat(editFormData.patient_dob)) {
      showNotification("Please enter the date in dd/mm/yyyy format", "error");
      return;
    }

    showConfirmModal(
      "Are you sure you want to save the changes to your profile?",
      async () => {
        try {
          const backendDateFormat = parseDateFromInput(
            editFormData.patient_dob
          );
          if (!backendDateFormat) {
            showNotification(
              "Invalid date format. Please use dd/mm/yyyy.",
              "error"
            );
            return;
          }

          const updateData = {
            patient_id: Number.parseInt(patientId),
            patient_name: editFormData.patient_name,
            patient_dob: backendDateFormat,
            patient_gender: editFormData.patient_gender,
            patient_phone: editFormData.patient_phone,
            patient_address: editFormData.patient_address,
            patient_email: patientData.patient_email,
            patient_password: patientData.patient_password,
            patient_username: patientData.patient_username,
            patient_code: patientData.patient_code,
            patient_img: patientData.patient_img,
          };

          const response = await axios.put(
            "http://localhost:8081/api/v1/patients/update2",
            updateData
          );
          setPatientData((prev) => ({
            ...prev,
            patient_name: editFormData.patient_name,
            patient_dob: backendDateFormat,
            patient_gender: editFormData.patient_gender,
            patient_phone: editFormData.patient_phone,
            patient_address: editFormData.patient_address,
          }));

          setOpenEditPatient(false);
          showNotification(
            "Patient information updated successfully!",
            "success"
          );
        } catch (error) {
          console.error("Error updating patient information:", error);
          showNotification(
            "Unable to update patient information. Please try again.",
            "error"
          );
        }
      },
      () => {}
    );
  };

  const formatDateToInput = (dateStr) => {
    if (!dateStr) return "";
    let datePart = dateStr;
    if (dateStr.includes("T")) {
      datePart = dateStr.split("T")[0];
    }
    const [year, month, day] = datePart.split("-");
    return `${day}/${month}/${year}`;
  };

  const handleCancelEdit = () => {
    setEditFormData({
      patient_name: patientData.patient_name || "",
      patient_dob: patientData.patient_dob
        ? formatDateToInput(patientData.patient_dob)
        : "",
      patient_gender: patientData.patient_gender || "Male",
      patient_email: patientData.patient_email || "",
      patient_phone: patientData.patient_phone || "",
      patient_address: patientData.patient_address || "",
    });
    setOpenEditPatient(false);
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitChangePassword = async () => {
    if (
      !passwordForm.oldPassword ||
      !passwordForm.newPassword ||
      !passwordForm.confirmPassword
    ) {
      showNotification("Please fill in all fields", "error");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showNotification("New passwords do not match", "error");
      return;
    }
    try {
      await axios.post(
        "http://localhost:8081/api/v1/patients/change-password",
        {
          patient_id: Number.parseInt(patientId),
          currentPassword: passwordForm.oldPassword, // Đúng tên trường backend yêu cầu
          newPassword: passwordForm.newPassword,
        }
      );
      showNotification("Password changed successfully!", "success");
      setOpenChangePassword(false);
      setPasswordForm({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      showNotification("Failed to change password", "error");
    }
  };

  return (
    <main className="dashboard-container">
      {openEditAppointment && (
        <div className="appointments-popup-container">
          <div className="appointments-popup-overlay"></div>
          <div className="appointments-popup">
            {renderDateButtons()}
            {formData.date && renderTimeSlots()}
            <div className="edit-appointment-action">
              <button
                className="appointments-cancel"
                onClick={handleCancelEditAppointment}
              >
                Cancel
              </button>
              <button
                className="appointments-save"
                onClick={handleConfirmEditAppointment}
                disabled={!formData.date || !formData.timeSlot}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
      {openChangePassword && (
        <div className="change-password-popup-container">
          <div className="change-password-popup-overlay"></div>
          <div className="change-password-popup">
            <h3>Change Password</h3>
            <div className="change-password-form">
              <div className="form-group">
                <label>Old Password</label>
                <div className="password-input-wrapper">
                  <input
                    type={showPassword.old ? "text" : "password"}
                    name="oldPassword"
                    value={passwordForm.oldPassword}
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        oldPassword: e.target.value,
                      })
                    }
                    required
                  />
                  <button
                    className="password-toggle"
                    onClick={() =>
                      setShowPassword((prev) => ({
                        ...prev,
                        old: !prev.old,
                      }))
                    }
                    aria-label={
                      showPassword.old ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword.old ? (
                      <svg
                        width="30"
                        height="30"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M12 4.5C7 4.5 2.73 7.61 1 12C2.73 16.39 7 19.5 12 19.5C17 19.5 21.27 16.39 23 12C21.27 7.61 17 4.5 12 4.5ZM12 17C9.24 17 7 14.76 7 12C7 9.24 9.24 7 12 7C14.76 7 17 9.24 17 12C17 14.76 14.76 17 12 17ZM12 9C10.34 9 9 10.34 9 12C9 13.66 10.34 15 12 15C13.66 15 15 13.66 15 12C15 10.34 13.66 9 12 9Z"
                          fill="#718096"
                        />
                      </svg>
                    ) : (
                      <svg
                        width="30"
                        height="30"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M12 6C15.31 6 18.09 7.79 19.78 10.38L22.86 7.29C20.95 4.97 18.17 3.5 15 3.5C12.81 3.5 10.76 4.27 9.12 5.5L12 8.38C12.27 8.23 12.56 8.12 12.86 8.07C12.91 8.06 12.96 8.06 13.01 8.06C13.66 8.06 14.28 8.36 14.73 8.86C15.18 9.36 15.41 10.04 15.35 10.72C15.29 11.4 14.93 12.01 14.36 12.44C13.79 12.87 13.06 13.06 12.34 13C11.62 12.94 10.94 12.63 10.44 12.12C9.94 11.61 9.66 10.93 9.72 10.25C9.78 9.57 10.14 8.96 10.71 8.53C10.93 8.36 11.17 8.23 11.42 8.14L14.35 11.07C14.07 11.39 13.71 11.65 13.31 11.83C12.91 12.01 12.47 12.11 12.02 12.11C11.11 12.11 10.26 11.69 9.69 11C9.12 10.31 8.85 9.41 8.94 8.5C9.03 7.59 9.45 6.76 10.14 6.15C10.83 5.54 11.71 5.19 12.62 5.28C12.66 5.28 12.7 5.29 12.74 5.29L12 6ZM12 19.5C8.69 19.5 5.91 17.79 4.22 15.2L1.14 18.29C3.05 20.61 5.83 22 9 22C11.19 22 13.24 21.23 14.88 20L12 17.62C11.73 17.77 11.44 17.88 11.14 17.93C11.09 17.94 11.04 17.94 10.99 17.94C10.34 17.94 9.72 17.64 9.27 17.14C8.82 16.64 8.59 15.96 8.65 15.28C8.71 14.6 9.07 13.99 9.64 13.56C10.21 13.13 10.94 12.94 11.66 13C12.38 13.06 13.06 13.37 13.56 13.88C14.06 14.39 14.34 15.07 14.28 15.75C14.22 16.43 13.86 17.04 13.29 17.47C13.07 17.64 12.83 17.77 12.58 17.86L9.65 14.93C9.93 14.61 10.29 14.35 10.69 14.17C11.09 13.99 11.53 13.89 11.98 13.89C12.89 13.89 13.74 14.31 14.31 15C14.88 15.69 15.15 16.59 15.06 17.5C14.97 18.41 14.55 19.24 13.86 19.85C13.17 20.46 12.29 20.81 11.38 20.72C11.34 20.72 11.3 20.71 11.26 20.71L12 19.5Z"
                          fill="#718096"
                        />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              <div className="form-group">
                <label>New Password</label>
                <div className="password-input-wrapper">
                  <input
                    type={showPassword.new ? "text" : "password"}
                    name="newPassword"
                    value={passwordForm.newPassword}
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        newPassword: e.target.value,
                      })
                    }
                    required
                  />
                  <button
                    className="password-toggle"
                    onClick={() =>
                      setShowPassword((prev) => ({
                        ...prev,
                        new: !prev.new,
                      }))
                    }
                    aria-label={
                      showPassword.new ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword.new ? (
                      <svg
                        width="30"
                        height="30"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M12 4.5C7 4.5 2.73 7.61 1 12C2.73 16.39 7 19.5 12 19.5C17 19.5 21.27 16.39 23 12C21.27 7.61 17 4.5 12 4.5ZM12 17C9.24 17 7 14.76 7 12C7 9.24 9.24 7 12 7C14.76 7 17 9.24 17 12C17 14.76 14.76 17 12 17ZM12 9C10.34 9 9 10.34 9 12C9 13.66 10.34 15 12 15C13.66 15 15 13.66 15 12C15 10.34 13.66 9 12 9Z"
                          fill="#718096"
                        />
                      </svg>
                    ) : (
                      <svg
                        width="30"
                        height="30"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M12 6C15.31 6 18.09 7.79 19.78 10.38L22.86 7.29C20.95 4.97 18.17 3.5 15 3.5C12.81 3.5 10.76 4.27 9.12 5.5L12 8.38C12.27 8.23 12.56 8.12 12.86 8.07C12.91 8.06 12.96 8.06 13.01 8.06C13.66 8.06 14.28 8.36 14.73 8.86C15.18 9.36 15.41 10.04 15.35 10.72C15.29 11.4 14.93 12.01 14.36 12.44C13.79 12.87 13.06 13.06 12.34 13C11.62 12.94 10.94 12.63 10.44 12.12C9.94 11.61 9.66 10.93 9.72 10.25C9.78 9.57 10.14 8.96 10.71 8.53C10.93 8.36 11.17 8.23 11.42 8.14L14.35 11.07C14.07 11.39 13.71 11.65 13.31 11.83C12.91 12.01 12.47 12.11 12.02 12.11C11.11 12.11 10.26 11.69 9.69 11C9.12 10.31 8.85 9.41 8.94 8.5C9.03 7.59 9.45 6.76 10.14 6.15C10.83 5.54 11.71 5.19 12.62 5.28C12.66 5.28 12.7 5.29 12.74 5.29L12 6ZM12 19.5C8.69 19.5 5.91 17.79 4.22 15.2L1.14 18.29C3.05 20.61 5.83 22 9 22C11.19 22 13.24 21.23 14.88 20L12 17.62C11.73 17.77 11.44 17.88 11.14 17.93C11.09 17.94 11.04 17.94 10.99 17.94C10.34 17.94 9.72 17.64 9.27 17.14C8.82 16.64 8.59 15.96 8.65 15.28C8.71 14.6 9.07 13.99 9.64 13.56C10.21 13.13 10.94 12.94 11.66 13C12.38 13.06 13.06 13.37 13.56 13.88C14.06 14.39 14.34 15.07 14.28 15.75C14.22 16.43 13.86 17.04 13.29 17.47C13.07 17.64 12.83 17.77 12.58 17.86L9.65 14.93C9.93 14.61 10.29 14.35 10.69 14.17C11.09 13.99 11.53 13.89 11.98 13.89C12.89 13.89 13.74 14.31 14.31 15C14.88 15.69 15.15 16.59 15.06 17.5C14.97 18.41 14.55 19.24 13.86 19.85C13.17 20.46 12.29 20.81 11.38 20.72C11.34 20.72 11.3 20.71 11.26 20.71L12 19.5Z"
                          fill="#718096"
                        />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              <div className="form-group">
                <label>Confirm Password</label>
                <div className="password-input-wrapper">
                  <input
                    type={showPassword.confirm ? "text" : "password"}
                    name="confirmPassword"
                    value={passwordForm.confirmPassword}
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        confirmPassword: e.target.value,
                      })
                    }
                    required
                  />
                  <button
                    className="password-toggle"
                    onClick={() =>
                      setShowPassword((prev) => ({
                        ...prev,
                        confirm: !prev.confirm,
                      }))
                    }
                    aria-label={
                      showPassword.confirm ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword.confirm ? (
                      <svg
                        width="30"
                        height="30"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M12 4.5C7 4.5 2.73 7.61 1 12C2.73 16.39 7 19.5 12 19.5C17 19.5 21.27 16.39 23 12C21.27 7.61 17 4.5 12 4.5ZM12 17C9.24 17 7 14.76 7 12C7 9.24 9.24 7 12 7C14.76 7 17 9.24 17 12C17 14.76 14.76 17 12 17ZM12 9C10.34 9 9 10.34 9 12C9 13.66 10.34 15 12 15C13.66 15 15 13.66 15 12C15 10.34 13.66 9 12 9Z"
                          fill="#718096"
                        />
                      </svg>
                    ) : (
                      <svg
                        width="30"
                        height="30"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M12 6C15.31 6 18.09 7.79 19.78 10.38L22.86 7.29C20.95 4.97 18.17 3.5 15 3.5C12.81 3.5 10.76 4.27 9.12 5.5L12 8.38C12.27 8.23 12.56 8.12 12.86 8.07C12.91 8.06 12.96 8.06 13.01 8.06C13.66 8.06 14.28 8.36 14.73 8.86C15.18 9.36 15.41 10.04 15.35 10.72C15.29 11.4 14.93 12.01 14.36 12.44C13.79 12.87 13.06 13.06 12.34 13C11.62 12.94 10.94 12.63 10.44 12.12C9.94 11.61 9.66 10.93 9.72 10.25C9.78 9.57 10.14 8.96 10.71 8.53C10.93 8.36 11.17 8.23 11.42 8.14L14.35 11.07C14.07 11.39 13.71 11.65 13.31 11.83C12.91 12.01 12.47 12.11 12.02 12.11C11.11 12.11 10.26 11.69 9.69 11C9.12 10.31 8.85 9.41 8.94 8.5C9.03 7.59 9.45 6.76 10.14 6.15C10.83 5.54 11.71 5.19 12.62 5.28C12.66 5.28 12.7 5.29 12.74 5.29L12 6ZM12 19.5C8.69 19.5 5.91 17.79 4.22 15.2L1.14 18.29C3.05 20.61 5.83 22 9 22C11.19 22 13.24 21.23 14.88 20L12 17.62C11.73 17.77 11.44 17.88 11.14 17.93C11.09 17.94 11.04 17.94 10.99 17.94C10.34 17.94 9.72 17.64 9.27 17.14C8.82 16.64 8.59 15.96 8.65 15.28C8.71 14.6 9.07 13.99 9.64 13.56C10.21 13.13 10.94 12.94 11.66 13C12.38 13.06 13.06 13.37 13.56 13.88C14.06 14.39 14.34 15.07 14.28 15.75C14.22 16.43 13.86 17.04 13.29 17.47C13.07 17.64 12.83 17.77 12.58 17.86L9.65 14.93C9.93 14.61 10.29 14.35 10.69 14.17C11.09 13.99 11.53 13.89 11.98 13.89C12.89 13.89 13.74 14.31 14.31 15C14.88 15.69 15.15 16.59 15.06 17.5C14.97 18.41 14.55 19.24 13.86 19.85C13.17 20.46 12.29 20.81 11.38 20.72C11.34 20.72 11.3 20.71 11.26 20.71L12 19.5Z"
                          fill="#718096"
                        />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              <div className="change-password-actions">
                <button
                  className="change-password-save"
                  onClick={handleSubmitChangePassword}
                >
                  Save
                </button>
                <button
                  className="change-password-cancel"
                  onClick={() => setOpenChangePassword(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <section className="dashboard-banner">
        <img
          className="dashboard-banner-img"
          src={bannerImg || "/placeholder.svg"}
          alt="dashboard-banner-img"
        />
        <h4>Patient Overview</h4>
        <div className="dashboard-overlay"></div>
      </section>
      {patientData ? (
        <section className="dashboard-content">
          <div className="patient-container">
            {imageValid ? (
              <img
                id="patientImg"
                src={imagePath || "/placeholder.svg"}
                alt="Patient"
              />
            ) : (
              <img
                id="patientImg"
                width="150"
                height="150"
                src="https://img.icons8.com/ios-filled/200/004b91/user-male-circle.png"
                alt="user-male-circle"
              />
            )}
            <div
              className="img-overlay"
              onClick={() =>
                !imageUploading &&
                document.getElementById("ipPatientImg").click()
              }
              style={{
                opacity: imageUploading ? 0.5 : 1,
                cursor: imageUploading ? "not-allowed" : "pointer",
              }}
            >
              <img
                width="30"
                height="30"
                src="https://img.icons8.com/ios-filled/200/FFFFFF/available-updates.png"
                alt="available-updates"
              />
              {imageUploading ? "Uploading..." : "Change Photo"}
            </div>
            <input
              id="ipPatientImg"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              style={{ display: "none" }}
              disabled={imageUploading}
            />
            <div className="container-title">
              Personal Information
              {!openEditPatient ? (
                <div className="container-title-action">
                  <a onClick={() => setOpenEditPatient(true)}>
                    Edit Information
                  </a>
                  /
                  <a onClick={() => setOpenChangePassword(true)}>
                    Change Password
                  </a>
                </div>
              ) : (
                <div className="container-title-action">
                  <a onClick={handleSavePatient}>Save</a>/
                  <a onClick={handleCancelEdit}>Cancel</a>
                </div>
              )}
            </div>
            <div className="patient-info">
              {openEditPatient ? (
                <>
                  <div className="patient-info-item">
                    <h4>Full Name</h4>
                    <input
                      type="text"
                      name="patient_name"
                      value={editFormData.patient_name}
                      onChange={handleEditFormChange}
                      required
                    />
                  </div>
                  <div className="patient-info-item">
                    <h4>Date of Birth</h4>
                    <input
                      type="text"
                      name="patient_dob"
                      value={editFormData.patient_dob}
                      onChange={handleEditFormChange}
                      placeholder="dd/mm/yyyy (e.g. 15/03/1990)"
                      maxLength="10"
                      required
                    />
                  </div>
                  <div className="patient-info-item">
                    <h4>Gender</h4>
                    <select
                      name="patient_gender"
                      value={editFormData.patient_gender}
                      onChange={handleEditFormChange}
                      required
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="patient-info-item">
                    <h4>Email</h4>
                    <input
                      type="email"
                      name="patient_email"
                      value={editFormData.patient_email}
                      disabled
                      style={{
                        backgroundColor: "#f5f5f5",
                        cursor: "not-allowed",
                      }}
                      title="Email cannot be changed"
                    />
                  </div>
                  <div className="patient-info-item">
                    <h4>Phone Number</h4>
                    <input
                      type="text"
                      name="patient_phone"
                      value={editFormData.patient_phone}
                      onChange={handleEditFormChange}
                      placeholder="Enter 10 digits"
                      maxLength="10"
                      required
                    />
                  </div>
                  <div className="patient-info-item">
                    <h4>Address</h4>
                    <input
                      type="text"
                      name="patient_address"
                      value={editFormData.patient_address}
                      onChange={handleEditFormChange}
                      required
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="patient-info-item">
                    <h4>Full Name</h4>
                    <p>{patientData.patient_name ?? ""}</p>
                  </div>
                  <div className="patient-info-item">
                    <h4>Date of Birth</h4>
                    <p>
                      {patientData.patient_dob
                        ? formatDateToInput(patientData.patient_dob)
                        : ""}
                    </p>
                  </div>
                  <div className="patient-info-item">
                    <h4>Gender</h4>
                    <p>{patientData.patient_gender ?? ""}</p>
                  </div>
                  <div className="patient-info-item">
                    <h4>Email</h4>
                    <p>{patientData.patient_email ?? ""}</p>
                  </div>
                  <div className="patient-info-item">
                    <h4>Phone Number</h4>
                    <p>{patientData.patient_phone ?? ""}</p>
                  </div>
                  <div className="patient-info-item">
                    <h4>Address</h4>
                    <p>{patientData.patient_address ?? ""}</p>
                  </div>
                </>
              )}
            </div>
            {editFormData.patient_phone &&
              editFormData.patient_phone.length !== 10 && (
                <small style={{ color: "red" }}>
                  Phone number must be exactly 10 digits
                </small>
              )}
            <div className="container-title">
              Appointments & Medical Records
            </div>
            <div className="medical-info">
              <ul>
                <li
                  className={`${appointmentVisible ? "active" : ""}`}
                  onClick={toggleAppointmentVisible}
                >
                  Appointments
                </li>
                <li
                  className={`${appointmentVisible ? "" : "active"}`}
                  onClick={toggleAppointmentVisible}
                >
                  Medical Records
                </li>
              </ul>
              {appointmentVisible ? (
                <div className="appointment-container">
                  {currentAppointments.length > 0 ? (
                    currentAppointments.map((app) => (
                      <div
                        className="appointment-item"
                        key={app.appointment_id || Math.random()}
                      >
                        <div className="appointment-item-header">
                          <h3>
                            {new Date(app.appointment_date).toLocaleDateString(
                              "en-US"
                            )}
                          </h3>
                        </div>
                        <p>
                          <strong>Doctor:</strong>{" "}
                          {app.doctor && app.doctor.length > 0
                            ? app.doctor[0].doctor_name
                            : "N/A"}
                        </p>
                        <p>
                          <strong>Department:</strong>{" "}
                          {app.doctor &&
                          app.doctor.length > 0 &&
                          app.doctor[0].department &&
                          app.doctor[0].department.length > 0
                            ? app.doctor[0].department[0].department_name
                            : "N/A"}
                        </p>
                        <p>
                          <strong>Appointment Date:</strong>{" "}
                          {new Date(app.medical_day).toLocaleDateString(
                            "en-US"
                          )}
                        </p>
                        <p>
                          <strong>Time Slot:</strong> {formatTimeSlot(app.slot)}
                        </p>
                        <div className="appointment-action">
                          <button
                            className="record-detail-button"
                            onClick={() => handleViewAppointmentDetails(app)}
                          >
                            Details
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p>No appointments found.</p>
                  )}
                  <div className="pagination-controls">
                    <a onClick={() => setCurrentAppointmentPage(1)}>
                      <img
                        width="18"
                        height="18"
                        src="https://img.icons8.com/ios-filled/200/004b91/first-1.png"
                        alt="first-1"
                      />
                    </a>
                    <a
                      onClick={() =>
                        setCurrentAppointmentPage((prev) =>
                          Math.max(prev - 1, 1)
                        )
                      }
                    >
                      <img
                        width="18"
                        height="18"
                        src="https://img.icons8.com/ios-filled/200/004b91/back.png"
                        alt="back"
                      />
                    </a>
                    <span>
                      Page {currentAppointmentPage} / {totalAppointmentPages}
                    </span>
                    <a
                      onClick={() =>
                        setCurrentAppointmentPage((prev) =>
                          Math.min(prev + 1, totalAppointmentPages)
                        )
                      }
                    >
                      <img
                        width="18"
                        height="18"
                        src="https://img.icons8.com/ios-filled/200/004b91/forward.png"
                        alt="forward"
                      />
                    </a>
                    <a
                      onClick={() =>
                        setCurrentAppointmentPage(totalAppointmentPages)
                      }
                    >
                      <img
                        width="18"
                        height="18"
                        src="https://img.icons8.com/ios-filled/200/004b91/last-1.png"
                        alt="last-1"
                      />
                    </a>
                  </div>
                </div>
              ) : (
                <div className="record-container">
                  {currentRecords.length > 0 ? (
                    currentRecords.map((record) => (
                      <div
                        key={record.record_id || Math.random()}
                        className="record-item"
                      >
                        <div className="record-item-header">
                          <h3>{record.follow_up_date}</h3>
                        </div>
                        <p>
                          <strong>Department:</strong>{" "}
                          {record.doctors && record.doctors.length > 0
                            ? getDepartmentName(record.doctors[0].department_id)
                            : "No department information"}
                        </p>
                        <p>
                          <strong>Doctor:</strong>{" "}
                          {record.doctors && record.doctors.length > 0
                            ? record.doctors[0].doctor_name
                            : "No doctor information"}
                        </p>
                        <p>
                          <strong>Symptoms:</strong> {record.symptoms}
                        </p>
                        <p>
                          <strong>Diagnosis:</strong> {record.diagnosis}
                        </p>
                        <div className="record-action">
                          <button
                            className="record-detail-button"
                            onClick={() => handleViewDetails(record)}
                          >
                            Details
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p>No medical records found.</p>
                  )}
                  <div className="pagination-controls">
                    <a onClick={() => setCurrentRecordPage(1)}>
                      <img
                        width="18"
                        height="18"
                        src="https://img.icons8.com/ios-filled/200/004b91/first-1.png"
                        alt="first-1"
                      />
                    </a>
                    <a
                      onClick={() =>
                        setCurrentRecordPage((prev) => Math.max(prev - 1, 1))
                      }
                    >
                      <img
                        width="18"
                        height="18"
                        src="https://img.icons8.com/ios-filled/200/004b91/back.png"
                        alt="back"
                      />
                    </a>
                    <span>
                      Page {currentRecordPage} / {totalRecordPages}
                    </span>
                    <a
                      onClick={() =>
                        setCurrentRecordPage((prev) =>
                          Math.min(prev + 1, totalRecordPages)
                        )
                      }
                    >
                      <img
                        width="18"
                        height="18"
                        src="https://img.icons8.com/ios-filled/200/004b91/forward.png"
                        alt="forward"
                      />
                    </a>
                    <a onClick={() => setCurrentRecordPage(totalRecordPages)}>
                      <img
                        width="18"
                        height="18"
                        src="https://img.icons8.com/ios-filled/200/004b91/last-1.png"
                        alt="last-1"
                      />
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      ) : (
        <h1 className="dashboard-alert">
          To view information, please log in and refresh this page.
        </h1>
      )}
    </main>
  );
}

export default Dashboard;
