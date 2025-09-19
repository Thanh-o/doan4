import React, { useState, useEffect } from "react";
import axios from "axios";
import Select, { components } from "react-select";
import { useNavigate } from "react-router-dom";
import "./NewAppoint.css";
import $ from "jquery";
import logo from "../img/fpt-health-high-resolution-logo-transparent-white.png";

// Custom Option component to display summary information
const CustomOption = (props) => {
    return (
        <components.Option {...props}>
            <div>
                <strong>{props.data.label}</strong>
                <p style={{ fontSize: "12px", margin: "0" }}>{props.data.summary}</p>
            </div>
        </components.Option>
    );
};

const SuccessMessage = ({ id }) => {
    console.log("SuccessMessage id:", id);

    const navigate = useNavigate();

    const navigateToHomePage = () => {
        navigate(-1);
    };

    const navigateToAppointmentDetail = () => {
        if (id) {
            navigate(`/appointments/${id}`);
        } else {
            navigate(-1);
        }
    };

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };
    scrollToTop();
    return (
        <div className="success-message">
            <div className="success-content">
                <h2>Appointment booked successfully!</h2>
            </div>
            <div className="button-group">
                <button onClick={navigateToHomePage}>Back to homepage</button>
                <button onClick={navigateToAppointmentDetail}>View Appointment</button>
            </div>
        </div>
    );
};

// Popup component for doctor details
const DoctorDetailPopup = ({ doctor, onClose }) => {
    return (
        <div className="doctor-detail-popup">
            <div className="popup-content">
                <img src={doctor.doctor_image || "/placeholder.svg"} alt={doctor.doctor_name} />
                <h3>{doctor.doctor_name}</h3>
                <p>
                    <strong>Summary:</strong> {doctor.summary || "Not specified"}
                </p>
                <p>
                    <strong>Description:</strong>{" "}
                    {doctor.doctor_description || "Not specified"}
                </p>
                <p>
                    <strong>Phone:</strong> {doctor.doctor_phone || "Not specified"}
                </p>
                <p>
                    <strong>Address:</strong> {doctor.doctor_address || "Not specified"}
                </p>
                <button onClick={onClose} className="close-popup">
                    Close
                </button>
            </div>
        </div>
    );
};

const Appointment = () => {
    const [formData, setFormData] = useState({
        patient_name: "",
        patient_email: "",
        patient_phone: "",
        department: "",
        doctor: "",
        date: "",
        timeSlot: "",
        note: "",
    });

    const [phoneError, setPhoneError] = useState("");
    const [emailError, setEmailError] = useState("");
    const [nameError, setNameError] = useState("");
    const [departments, setDepartments] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [availableDoctors, setAvailableDoctors] = useState([]);
    const [bookedSlots, setBookedSlots] = useState([]);
    const [availableSlots, setAvailableSlots] = useState([]);
    const [selectedDepartment, setSelectedDepartment] = useState(null);
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [doctorPrice, setDoctorPrice] = useState(null);
    const [showSuccess, setShowSuccess] = useState(false);
    const [showDoctorPopup, setShowDoctorPopup] = useState(false);
    const [selectedDoctorForPopup, setSelectedDoctorForPopup] = useState(null);
    const [newAppointmentId, setNewAppointmentId] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState("CASH");
    const navigate = useNavigate(); // Đảm bảo dòng này có ở đầu component
    const handleGoBack = () => {
        navigate(-1);
    }

    const timeSlots = [
        { label: "08:00 AM - 09:00 AM", value: 1, start: "08:00", end: "09:00" },
        { label: "09:00 AM - 10:00 AM", value: 2, start: "09:00", end: "10:00" },
        { label: "10:00 AM - 11:00 AM", value: 3, start: "10:00", end: "11:00" },
        { label: "11:00 AM - 12:00 AM", value: 4, start: "11:00", end: "12:00" },
        { label: "01:00 PM - 02:00 PM", value: 5, start: "13:00", end: "14:00" },
        { label: "02:00 PM - 03:00 PM", value: 6, start: "14:00", end: "15:00" },
        { label: "03:00 PM - 04:00 PM", value: 7, start: "15:00", end: "16:00" },
        { label: "04:00 PM - 05:00 PM", value: 8, start: "16:00", end: "17:00" },
    ];

    // Hàm xáo trộn mảng (Fisher-Yates shuffle)
    const shuffleArray = (array) => {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    };

    // Load departments on component mount
    useEffect(() => {
        axios
            .get("http://localhost:8081/api/v1/departments/list")
            .then((response) => {
                setDepartments(response.data);
            })
            .catch((error) => {
                console.error("Error fetching department list!", error);
            });
    }, []);

    // Load available time slots when date is selected
    useEffect(() => {
        if (formData.date) {
            // Reset form fields that depend on date
            setFormData((prev) => ({
                ...prev,
                timeSlot: "",
                department: "",
                doctor: "",
            }));
            setSelectedDepartment(null);
            setSelectedDoctor(null);
            setDoctorPrice(null);
            setAvailableDoctors([]);

            const today = new Date().toISOString().split("T")[0];
            const isToday = formData.date === today;

            if (isToday) {
                const filteredSlots = timeSlots.filter(
                    (slot) => !isTimeSlotPast(formData.date, slot.start)
                );

                if (filteredSlots.length === 0) {
                    // If no time slots are available, set empty array
                    setAvailableSlots([]);
                } else {
                    setAvailableSlots(filteredSlots);
                }
            } else {
                // For future dates, show all time slots
                setAvailableSlots(timeSlots);
            }
        }
    }, [formData.date]);



    // Load doctors when department is selected
    useEffect(() => {
        if (formData.department) {
            // Get department info
            axios
                .get(
                    `http://localhost:8081/api/v1/departments/search?department_id=${formData.department}`
                )
                .then((response) => {
                    if (response.data.length > 0) {
                        setSelectedDepartment(response.data[0]);
                    }
                })
                .catch((error) => {
                    console.error("Error fetching department info!", error);
                });

            // Get all doctors in Department
            axios
                .get(
                    `http://localhost:8081/api/v1/departments/${formData.department}/doctors`
                )
                .then((response) => {
                    const shuffledDoctors = shuffleArray(response.data);
                    setDoctors(shuffledDoctors);

                    // If time slot is selected, filter available doctors
                    if (formData.timeSlot) {
                        filterAvailableDoctors(
                            shuffledDoctors,
                            formData.date,
                            formData.timeSlot
                        );
                    } else {
                        setAvailableDoctors(shuffledDoctors);
                    }
                })
                .catch((error) => {
                    console.error("Error fetching doctor list!", error);
                });
        }
    }, [formData.department]);

    // Filter available doctors when time slot is selected
    useEffect(() => {
        if (formData.timeSlot && formData.department && doctors.length > 0) {
            filterAvailableDoctors(doctors, formData.date, formData.timeSlot);
        }
    }, [formData.timeSlot, formData.department, doctors, formData.date]);

    // Get doctor details when doctor is selected
    useEffect(() => {
        if (formData.doctor) {
            axios
                .get(
                    `http://localhost:8081/api/v1/doctors/search?doctor_id=${formData.doctor}`
                )
                .then((response) => {
                    if (response.data.length > 0) {
                        setSelectedDoctor(response.data[0]);
                        setDoctorPrice(response.data[0].doctor_price);
                    }
                })
                .catch((error) => {
                    console.error("Error fetching doctor info!", error);
                });
        }
    }, [formData.doctor]);

    // Function to filter available doctors based on selected time slot
    const filterAvailableDoctors = async (doctorList, date, timeSlot) => {
        if (!date || !timeSlot) {
            setAvailableDoctors(doctorList);
            return;
        }

        try {
            // Get all appointments for the selected date and time slot
            const appointmentPromises = doctorList.map((doctor) =>
                axios
                    .get(
                        `http://localhost:8081/api/v1/appointments/${doctor.doctor_id}/slots`
                    )
                    .then((response) => ({
                        doctorId: doctor.doctor_id,
                        appointments: response.data,
                    }))
                    .catch((error) => ({
                        doctorId: doctor.doctor_id,
                        appointments: [],
                    }))
            );

            const doctorAppointments = await Promise.all(appointmentPromises);

            // Filter out doctors who are already booked
            const finalAvailableDoctors = doctorList.filter((doctor) => {
                const doctorBookings = doctorAppointments.find(
                    (booking) => booking.doctorId === doctor.doctor_id
                );

                if (!doctorBookings || !doctorBookings.appointments) return true;

                const isBooked = doctorBookings.appointments.some((appointment) => {
                    const appointmentDate = new Date(appointment.medical_day)
                        .toISOString()
                        .split("T")[0];
                    return appointmentDate === date && appointment.slot === timeSlot;
                });

                return !isBooked;
            });

            setAvailableDoctors(finalAvailableDoctors);

            // Reset doctor selection if current doctor is not available
            if (
                formData.doctor &&
                !finalAvailableDoctors.find((d) => d.doctor_id === formData.doctor)
            ) {
                setFormData((prev) => ({ ...prev, doctor: "" }));
                setSelectedDoctor(null);
                setDoctorPrice(null);
            }
        } catch (error) {
            console.error("Error filtering available doctors!", error);
            setAvailableDoctors(doctorList);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });

        if (name === "patient_email") {
            if (
                value &&
                !/^[A-Za-z0-9._-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(value)
            ) {
                setEmailError("Invalid email format");
            } else {
                setEmailError("");
            }
        }

        if (name === "patient_name") {
            if (value && !/^[A-Za-z ]+$/.test(value)) {
                setNameError("Name must contain only English letters");
            } else {
                setNameError("");
            }
        }

        if (name === "patient_phone" && value.length > 10) {
            setPhoneError("Phone number must not exceed 10 digits");
        } else {
            setPhoneError("");
        }
    };

    const handleDateChange = (date) => {
        setFormData((prev) => ({
            ...prev,
            date: date,
            timeSlot: "",
            department: "",
            doctor: "",
        }));
        setSelectedDepartment(null);
        setSelectedDoctor(null);
        setDoctorPrice(null);
        setAvailableDoctors([]);
    };

    const handleTimeSlotChange = (slot) => {
        setFormData((prev) => ({
            ...prev,
            timeSlot: slot,
            department: "",
            doctor: "",
        }));
        setSelectedDepartment(null);
        setSelectedDoctor(null);
        setDoctorPrice(null);
        setAvailableDoctors([]);
    };

    const handleDepartmentChange = (selectedOption) => {
        setFormData((prev) => ({
            ...prev,
            department: selectedOption ? selectedOption.value : "",
            doctor: "",
        }));
        setSelectedDepartment(selectedOption);
        setSelectedDoctor(null);
        setDoctorPrice(null);
        setDoctors([]);
        setAvailableDoctors([]);
    };

    const handleDoctorSelect = (doctor) => {
        setFormData((prev) => ({
            ...prev,
            doctor: doctor.doctor_id,
        }));
        setSelectedDoctor(doctor);
        setDoctorPrice(doctor.doctor_price);
    };

    const handleShowDoctorDetails = (doctor) => {
        setSelectedDoctorForPopup(doctor);
        setShowDoctorPopup(true);
    };

    const handleCloseDoctorPopup = () => {
        setShowDoctorPopup(false);
        setSelectedDoctorForPopup(null);
    };

    const getTimeSlotLabel = (slotValue) => {
        const slot = timeSlots.find((s) => s.value === slotValue);
        return slot ? slot.label : "";
    };

    const isTimeSlotPast = (date, startTime) => {
        const appointmentDate = new Date(date);
        const currentDate = new Date();
        const [startHour, startMinute] = startTime.split(":").map(Number);

        appointmentDate.setHours(startHour, startMinute, 0, 0);

        return appointmentDate < currentDate;
    };

    const handlePaymentMethodChange = (e) => {
        setPaymentMethod(e.target.value);
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        await submitAppointment(paymentMethod);
    };

    const submitAppointment = async (paymentType = "CASH") => {
        const dataToSend = {
            ...formData,
            appointment_date: new Date().toISOString(),
            medical_day: formData.date,
            slot: formData.timeSlot,
            doctor_id: formData.doctor,
            status: "PENDING",
            patient_username: formData.patient_email,
            patient_password: generateRandomPassword(),
            doctor_name: selectedDoctor ? selectedDoctor.doctor_name : "",
            department_name: selectedDepartment
                ? selectedDepartment.department_name
                : "",
            price: doctorPrice,
            payment_name: paymentType,
            staff_id: Math.floor(Math.random() * 10) + 1,
        };

        console.log("Data To Send:", dataToSend);

        try {
            const response = await axios.post(
                "http://localhost:8081/api/v1/appointments/insert",
                dataToSend
            );
            console.log("API response:", response.data);
            setNewAppointmentId(response.data.appointment_id);
            setShowSuccess(true);

            const timeSlotLabel = getTimeSlotLabel(dataToSend.slot);

            await Promise.all([
                sendEmailFormRegister(
                    dataToSend.doctor_name,
                    dataToSend.department_name,
                    dataToSend.medical_day,
                    dataToSend.patient_email,
                    dataToSend.patient_name,
                    timeSlotLabel
                ),
                sendEmailToDoctor(
                    dataToSend.doctor_name,
                    dataToSend.department_name,
                    dataToSend.medical_day,
                    selectedDoctor.doctor_email,
                    dataToSend.patient_name,
                    timeSlotLabel
                ),
                new Promise((resolve) => setTimeout(resolve, 1000)),
            ]);
        } catch (error) {
            console.error("Error booking appointment!", error);
            alert("Booking failed.");
        }
    };

    const sendEmailFormRegister = (
        doctorName,
        departmentName,
        medicalDay,
        patientEmail,
        patientName,
        timeSlot
    ) => {
        console.log("Sending Email with the following data:");
        console.log("Doctor Name:", doctorName);
        console.log("Department Name:", departmentName);
        console.log("Appointment Date:", medicalDay);
        console.log("Patient Email:", patientEmail);
        console.log("Patient Name:", patientName);
        console.log("Macro Slot:", timeSlot);

        return axios
            .post("http://localhost:8081/api/v1/appointments/send-email", {
                doctorName,
                departmentName,
                medicalDay,
                patientEmail,
                patientName,
                timeSlot,
            })
            .then((response) => {
                console.log("Email sent successfully");
            })
            .catch((error) => {
                console.error("Error sending email", error);
            });
    };

    const sendEmailToDoctor = (
        doctorName,
        departmentName,
        medicalDay,
        doctorEmail,
        patientName,
        timeSlot
    ) => {
        console.log("Sending Email to Doctor with the following data:");
        console.log("Doctor Name:", doctorName);
        console.log("Department Name:", departmentName);
        console.log("Appointment Date:", medicalDay);
        console.log("Doctor Email:", doctorEmail);
        console.log("Patient Name:", patientName);
        console.log("Time Slot:", timeSlot);

        return axios
            .post("http://localhost:8081/api/v1/appointments/send-email-doctor", {
                doctorName,
                departmentName,
                medicalDay,
                doctorEmail,
                patientName,
                timeSlot,
            })
            .then((response) => {
                console.log("Email sent to doctor successfully");
            })
            .catch((error) => {
                console.error("Error sending email to doctor", error);
            });
    };

    const generateRandomPassword = () => {
        const length = 8;
        const lowercaseCharset = "abcdefghijklmnopqrstuvwxyz";
        const uppercaseCharset = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        const numericCharset = "0123456789";
        const specialCharset = "!@#$%^&*()_+";
        let password =
            lowercaseCharset[Math.floor(Math.random() * lowercaseCharset.length)] +
            uppercaseCharset[Math.floor(Math.random() * uppercaseCharset.length)] +
            numericCharset[Math.floor(Math.random() * numericCharset.length)] +
            specialCharset[Math.floor(Math.random() * specialCharset.length)];
        for (let i = 4; i < length; i++) {
            const charset =
                lowercaseCharset + uppercaseCharset + numericCharset + specialCharset;
            const randomIndex = Math.floor(Math.random() * charset.length);
            password += charset[randomIndex];
        }

        password = shuffleString(password);
        return password;
    };

    function shuffleString(str) {
        const array = str.split("");
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array.join("");
    }

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

    const renderDateButtons = () => {
        const dates = generateDateButtons();
        return (
            <div className="date-container">
                <label style={{ color: "black" }}>Date</label>
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
                    />
                </div>
            </div>
        );
    };

    const renderTimeSlots = () => {
        const today = new Date().toISOString().split("T")[0];
        const isToday = formData.date === today;

        if (isToday && availableSlots.length === 0) {
            return (
                <div className="time-container">
                    <p style={{ color: "red", textAlign: "center", padding: "20px" }}>
                        Today's working hours are over, please select tomorrow or another
                        date.
                    </p>
                </div>
            );
        }

        return (
            <div className="time-container">
                <label style={{ color: "black" }}>Time</label>
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

    const departmentOptions = departments.map((department) => ({
        value: department.department_id,
        label: department.department_name,
        summary: department.summary,
        description: department.department_description,
        img: department.department_img,
    }));

    const renderDoctorsList = () => {
        const doctorsToShow = availableDoctors.length > 0 ? availableDoctors : [];

        if (doctorsToShow.length === 0) {
            return (
                <div className="doctor-list">
                    <label style={{ color: "black" }}>Doctors</label>
                    <p style={{ textAlign: "center", color: "#666", padding: "20px" }}>
                        No doctors available for the selected time slot. Please choose a
                        different time.
                    </p>
                </div>
            );
        }

        return (
            <div className="doctor-list">
                <label style={{ color: "black" }}>
                    Doctors Available for Selected Time
                </label>
                <div className="doctors-container">
                    {doctorsToShow.map((doctor) => (
                        <div
                            key={doctor.doctor_id}
                            className={`doctor-card ${
                                formData.doctor === doctor.doctor_id ? "selected" : ""
                            }`}
                            onClick={() => handleDoctorSelect(doctor)}
                        >
                            <img src={doctor.doctor_image || "/placeholder.svg"} alt={doctor.doctor_name} />
                            <div>
                                <h4>{doctor.doctor_name}</h4>
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "75px",
                                    }}
                                >
                                    <p>Price: ${doctor.doctor_price}</p>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation(); // Prevent triggering handleDoctorSelect
                                            handleShowDoctorDetails(doctor);
                                        }}
                                        className="details-button"
                                    >
                                        View
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                {showDoctorPopup && selectedDoctorForPopup && (
                    <DoctorDetailPopup
                        doctor={selectedDoctorForPopup}
                        onClose={handleCloseDoctorPopup}
                    />
                )}
            </div>
        );
    };

    const isFormValid =
        formData.date &&
        formData.timeSlot &&
        formData.department &&
        formData.doctor &&
        formData.patient_name &&
        formData.patient_email &&
        formData.patient_phone &&
        !phoneError &&
        !emailError &&
        !nameError;



    return (

        <div className="new-services-container">

            {showSuccess ? (
                <SuccessMessage id={newAppointmentId}/>
            ) : (
            <div className="new-background">
                <h4 className="new-services-title">Appointment Booking</h4>
                {/* Thêm back button này */}
                <div className="back-button-container" style={{
                    position: 'absolute',
                    top: '20px',
                    left: '20px',
                    zIndex: 1000
                }}>
                    <button
                        onClick={handleGoBack}
                        className="back-button3"

                    >
                        ← Back
                    </button>
                </div>
                <section className="new-services-form-container">

                        <form className="new-appointment-form" onSubmit={handleSubmit}>
                            <div className="new-form-section1">
                                <h3>Select Appointment Date, Time, Department, and Doctor</h3>
                                {renderDateButtons()}
                                {formData.date && renderTimeSlots()}
                                {formData.timeSlot && (
                                    <div>
                                        <label style={{color: "black"}} htmlFor="department">
                                            Department
                                        </label>
                                        <Select
                                            id="department"
                                            name="department"
                                            options={departmentOptions}
                                            onChange={handleDepartmentChange}
                                            value={departmentOptions.find(
                                                (option) => option.value === formData.department
                                            )}
                                            components={{Option: CustomOption}}
                                        />
                                    </div>
                                )}
                                {formData.department && renderDoctorsList()}
                            </div>

                            <div className="new-form-section2">
                                <h3>Enter Patient Information</h3>
                                <div>
                                    <label style={{color: "black"}} htmlFor="patient_name">
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        id="patient_name"
                                        name="patient_name"
                                        value={formData.patient_name}
                                        onChange={handleChange}
                                        required
                                    />
                                    {nameError && <p style={{color: "red"}}>{nameError}</p>}
                                </div>
                                <div>
                                    <label style={{color: "black"}} htmlFor="patient_email">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        id="patient_email"
                                        name="patient_email"
                                        value={formData.patient_email}
                                        onChange={handleChange}
                                        required
                                    />
                                    {emailError && <p style={{color: "red"}}>{emailError}</p>}
                                </div>
                                <div>
                                    <label style={{color: "black"}} htmlFor="patient_phone">
                                        Phone Number
                                    </label>
                                    <input
                                        type="text"
                                        id="patient_phone"
                                        name="patient_phone"
                                        value={formData.patient_phone}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            if (/^\d{0,10}$/.test(value)) {
                                                handleChange(e);
                                            }
                                        }}
                                        maxLength={10}
                                        required
                                    />
                                    {phoneError && <p style={{color: "red"}}>{phoneError}</p>}
                                </div>
                                <div>
                                    <label style={{color: "black"}} htmlFor="note">
                                        Symptoms
                                    </label>
                                    <input
                                        type="text"
                                        id="note"
                                        name="note"
                                        value={formData.note}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="new-form-section3">
                                <h3>Confirm Information And Payment</h3>
                                <div className="new-profile-card">

                                    <div className="new-profile-section1 new-total-section">
                                        <div className="new-total-row">
                                            <span className="new-total-label">Total Amount:</span>
                                            <span className="new-total-amount">${doctorPrice}</span>
                                        </div>
                                    </div>
                                </div>

                                {doctorPrice && (
                                    <div className="new-payment-options">
                                        <h4>Payment Options</h4>
                                        <div className="new-payment-methods">
                                            <div className="new-payment-method">
                                                <input
                                                    type="radio"
                                                    id="cash"
                                                    name="paymentMethod"
                                                    value="CASH"
                                                    checked={paymentMethod === "CASH"}
                                                    onChange={handlePaymentMethodChange}
                                                />
                                                <label htmlFor="cash">Cash Payment (Pay at clinic)</label>
                                            </div>
                                            <div className="new-payment-method">
                                                <input
                                                    type="radio"
                                                    id="credit-card"
                                                    name="paymentMethod"
                                                    value="CREDIT_CARD"
                                                    checked={paymentMethod === "CREDIT_CARD"}
                                                    onChange={handlePaymentMethodChange}
                                                />
                                                <label htmlFor="credit-card">Credit Card</label>
                                            </div>
                                        </div>

                                        {paymentMethod === "CREDIT_CARD" && (
                                            <div className="new-credit-card-form">
                                                <div className="new-card-field">
                                                    <label htmlFor="card-name">Name on Card</label>
                                                    <input type="text" id="card-name" placeholder="John Doe"/>
                                                </div>
                                                <div className="new-card-field">
                                                    <label htmlFor="card-number">Card Number</label>
                                                    <input type="text" id="card-number"
                                                           placeholder="XXXX XXXX XXXX XXXX"/>
                                                </div>
                                                <div className="new-card-details">
                                                    <div className="new-card-field">
                                                        <label htmlFor="expiry-date">Expiry Date</label>
                                                        <input type="text" id="expiry-date" placeholder="MM/YY"/>
                                                    </div>
                                                    <div className="new-card-field">
                                                        <label htmlFor="cvv">CVV</label>
                                                        <input type="text" id="cvv" placeholder="XXX" maxLength="3"/>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    className="new-next-step"
                                    disabled={!isFormValid || doctorPrice === null}
                                >
                                    Confirm and Book Appointment
                                </button>
                            </div>
                        </form>

                </section>
            </div>
                        )}
        </div>

    );
};

export default Appointment;
