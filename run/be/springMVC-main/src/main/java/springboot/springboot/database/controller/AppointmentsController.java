package springboot.springboot.database.controller;

import org.modelmapper.ModelMapper;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import springboot.springboot.database.entity.*;
import springboot.springboot.database.model.AppointmentLockManager;
import springboot.springboot.database.model.ModelBuid;
import springboot.springboot.database.model.SendEmailUsername;
import springboot.springboot.database.model.EntityToJSON;

import java.lang.reflect.Field;
import java.lang.reflect.InvocationTargetException;
import java.sql.SQLException;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/appointments")
public class AppointmentsController<T extends Entity<?>> {

    private EntityToJSON json = new EntityToJSON();
    private SendEmailUsername sendEmail = new SendEmailUsername();

    @Autowired
    private ModelBuid model;

    @Autowired
    private AppointmentLockManager appointmentLockManager;

    @GetMapping("/")
    public String showForm() {
        return "index";
    }

    @PostMapping("/insert")
    public Map<String, Object> insert(@RequestBody Map<String, Object> requestData) throws SQLException, IllegalAccessException, InstantiationException {
        ModelMapper modelMapper = new ModelMapper();
        modelMapper.addConverter(new StringToDateConverter());

        // Map requestData to Patients
        Patients patient = modelMapper.map(requestData, Patients.class);

        // Check if patient exists
        Patients patientExample = new Patients();
        patientExample.setPatient_email(patient.getPatient_email());
        List<Patients> existingPatients = model.getEntityById(patientExample);

        Integer patientId;
        if (existingPatients.isEmpty()) {
            // Insert new patient if not exists
            patientId = model.insert(patient);

            // Get patient_name, patient_email, and patient_password from requestData
            String patientName = (String) requestData.get("patient_name");
            String patientEmail = (String) requestData.get("patient_email");
            String patientPassword = (String) requestData.get("patient_password");

            // Send email with account information
            sendEmail.sendEmail(patientName, patientEmail, patientPassword);

        } else {
            patientId = existingPatients.get(0).getPatient_id();
        }

        // Map requestData to Appointments
        Appointments appointments = modelMapper.map(requestData, Appointments.class);
        appointments.setPatient_id(patientId);
        Integer appointmentId = model.insert(appointments); // Lấy id lịch hẹn vừa tạo

        // Trả về appointment_id cho FE
        Map<String, Object> response = new HashMap<>();
        response.put("appointment_id", appointmentId);
        return response;
    }


    @PutMapping("/update")
    public void update(@RequestBody Map<String, Object> requestData) throws SQLException, IllegalAccessException {
        ModelMapper modelMapper = new ModelMapper();
        modelMapper.addConverter(new StringToDateConverter());
        Appointments appointments = modelMapper.map(requestData, Appointments.class);
        model.update(appointments);
    }

    @DeleteMapping("/delete")
    public String delete(@RequestBody Map<String, Object> requestData) throws SQLException, IllegalAccessException {
        ModelMapper modelMapper = new ModelMapper();
        modelMapper.addConverter(new StringToDateConverter());
        Appointments appointments = modelMapper.map(requestData, Appointments.class);
        model.delete(appointments);
        return "success";
    }

    @GetMapping("/list")
    public List<Appointments> list() {
        try {
            List<Appointments> appointmentsList = new ArrayList<>();
            List<Appointments> appointments = model.getAll(new Appointments().getClass());

            for (Appointments appointment : appointments) {
                Appointments newAppointment = new Appointments();
                BeanUtils.copyProperties(appointment, newAppointment);

                if (appointment.getStaff_id() != null) {
                    Staffs staffsFilter = new Staffs();
                    staffsFilter.setStaff_id(appointment.getStaff_id());
                    newAppointment.setStaff(model.getEntityById(staffsFilter));
                }

                if (appointment.getDoctor_id() != null) {
                    Doctors doctorsFilter = new Doctors();
                    doctorsFilter.setDoctor_id(appointment.getDoctor_id());
                    newAppointment.setDoctor(model.getEntityById(doctorsFilter));
                }

                if (appointment.getPatient_id() != null) {
                    Patients patientsFilter = new Patients();
                    patientsFilter.setPatient_id(appointment.getPatient_id());
                    newAppointment.setPatient(model.getEntityById(patientsFilter));
                }

                appointmentsList.add(newAppointment);
            }

            return appointmentsList;
        } catch (Exception e) {
            e.printStackTrace();
            return new ArrayList<>();
        }
    }

    @GetMapping("/search")
    public List<Appointments> getByField(@RequestParam Map<String, String> requestParams) {
        try {
            List<Appointments> appointmentsList = new ArrayList<>();
            ModelMapper modelMapper = new ModelMapper();
            modelMapper.addConverter(new StringToDateConverter());

            Appointments appointments1 = modelMapper.map(requestParams, Appointments.class);
            List<Appointments> appointments = model.getEntityById(appointments1);

            for (Appointments appointment : appointments) {
                Appointments newAppointment = new Appointments();
                BeanUtils.copyProperties(appointment, newAppointment);

                if (appointment.getStaff_id() != null) {
                    Staffs staffsFilter = new Staffs();
                    staffsFilter.setStaff_id(appointment.getStaff_id());
                    newAppointment.setStaff(model.getEntityById(staffsFilter));
                }

                if (appointment.getDoctor_id() != null) {
                    Doctors doctorsFilter = new Doctors();
                    doctorsFilter.setDoctor_id(appointment.getDoctor_id());
                    newAppointment.setDoctor(model.getEntityById(doctorsFilter));
                }

                if (appointment.getPatient_id() != null) {
                    Patients patientsFilter = new Patients();
                    patientsFilter.setPatient_id(appointment.getPatient_id());
                    newAppointment.setPatient(model.getEntityById(patientsFilter));
                }

                appointmentsList.add(newAppointment);
            }

            return appointmentsList;
        } catch (Exception e) {
            e.printStackTrace();
            return new ArrayList<>();
        }
    }

    @GetMapping("/{doctorId}/slots")
    public List<Appointments> getAppointmentsByDoctorId(@PathVariable("doctorId") int doctorId) throws SQLException, IllegalAccessException, InstantiationException {
        Appointments example = new Appointments();
        example.setDoctor_id(doctorId);
        List<Appointments> appointmentsList = new ArrayList<>();
        List<Appointments> appointments = model.getEntityById(example);

        for (Appointments appointment : appointments) {
            Appointments newAppointment = new Appointments();
            BeanUtils.copyProperties(appointment, newAppointment, "patient_id", "staff_id", "price", "payment_name", "status");
            appointmentsList.add(newAppointment);
        }

        return appointmentsList;
    }

    @PostMapping("/insertAll")
    public void insertAll(@RequestBody List<Map<String, Object>> dataList) throws SQLException, IllegalAccessException {
        List<Appointments> appointmentsList = new ArrayList<>();
        ModelMapper modelMapper = new ModelMapper();
        modelMapper.addConverter(new StringToDateConverter());

        for (Map<String, Object> data : dataList) {
            Appointments appointments = modelMapper.map(data, Appointments.class);
            appointmentsList.add(appointments);
        }
        model.insertAll(appointmentsList);
    }

    @PutMapping("/updateStatus")
    public ResponseEntity<?> updateStatus(@RequestBody Map<String, Object> requestData) throws SQLException, IllegalAccessException {
        ModelMapper modelMapper = new ModelMapper();
        modelMapper.addConverter(new StringToDateConverter());

        // Lấy thông tin appointment từ requestData
        Appointments appointments = modelMapper.map(requestData, Appointments.class);

        // Kiểm tra và lấy staff_id từ requestData nếu có
        if (requestData.containsKey("staff_id")) {
            try {
                Integer staffId = Integer.valueOf(requestData.get("staff_id").toString());
                appointments.setStaff_id(staffId);
            } catch (NumberFormatException e) {
                return ResponseEntity.badRequest().body("Invalid staff_id format");
            }
        }

        // Cập nhật trạng thái cuộc hẹn
        model.update(appointments);
        return ResponseEntity.ok("Appointment status updated successfully");
    }

    @GetMapping("/fields")
    public ResponseEntity<List<String>> getAppointmentFields() {
        Field[] fields = Appointments.class.getDeclaredFields();
        List<String> fieldNames = Arrays.stream(fields)
                .map(Field::getName)
                .collect(Collectors.toList());
        return ResponseEntity.ok(fieldNames);
    }

    @PostMapping("/send-email")
    public ResponseEntity<?> sendEmail(@RequestBody Map<String, String> emailData) {
        try {
            String doctorName = emailData.get("doctorName");
            String departmentName = emailData.get("departmentName");
            String medicalDay = emailData.get("medicalDay");
            String patientEmail = emailData.get("patientEmail");
            String patientName = emailData.get("patientName");
            String timeSlot = emailData.get("timeSlot");
            System.out.println(doctorName + "," + departmentName + "," + medicalDay + "," + patientEmail + "," + patientName + "," + timeSlot);
            // Gửi email với thông tin đã nhận
            sendEmail.sendEmailFormRegister(doctorName, departmentName, medicalDay, patientEmail, patientName, timeSlot);
            return ResponseEntity.ok("Email sent successfully");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error sending email");
        }
    }

    @PostMapping("/send-email-doctor")
    public ResponseEntity<?> sendEmailToDoctor(@RequestBody Map<String, String> emailData) {
        try {
            String doctorName = emailData.get("doctorName");
            String departmentName = emailData.get("departmentName");
            String appointmentDate = emailData.get("medicalDay");
            String doctorEmail = emailData.get("doctorEmail");
            String patientName = emailData.get("patientName");
            String timeSlot = emailData.get("timeSlot");

            // In ra các giá trị nhận được để kiểm tra
            System.out.println("Doctor Name: " + doctorName);
            System.out.println("Department Name: " + departmentName);
            System.out.println("Appointment Date: " + appointmentDate);
            System.out.println("Doctor Email: " + doctorEmail);
            System.out.println("Patient Name: " + patientName);
            System.out.println("Time Slot: " + timeSlot);

            sendEmail.sendEmailToDoctor(doctorName, departmentName, appointmentDate, doctorEmail, patientName, timeSlot);
            return ResponseEntity.ok("Email sent to doctor successfully");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error sending email to doctor");
        }
    }

    // API để khóa slot
    @PostMapping("/lock-slot")
    public ResponseEntity<?> lockSlot(@RequestBody Map<String, Object> slotData) {
        String doctorId = slotData.get("doctorId").toString();
        String date = slotData.get("date").toString();
        String time = slotData.get("time").toString();

        // Kiểm tra xem slot đã bị khóa chưa
        if (appointmentLockManager.isSlotLocked(doctorId, date, time)) {
            System.out.println("slot dang bi khoa");
            return ResponseEntity.status(409).body("Slot already locked");
        }

        // Khóa slot
        appointmentLockManager.lockSlot(doctorId, date, time);
        System.out.println("khoa slot");
        return ResponseEntity.ok("Slot locked successfully");
    }

    @PostMapping("/confirm-payment")
    public ResponseEntity<?> confirmPayment(@RequestBody Map<String, Object> slotData) {
        String doctorId = slotData.get("doctorId").toString();
        String date = slotData.get("date").toString();
        String time = slotData.get("time").toString();

        // Xác nhận thanh toán và hủy bỏ khóa
        appointmentLockManager.confirmPayment(doctorId, date, time);

        return ResponseEntity.ok("Payment confirmed and slot unlocked");
    }


    @GetMapping("/check-locked-slots")
    public ResponseEntity<List<Map<String, String>>> checkLockedSlots(
            @RequestParam("doctorId") String doctorId,
            @RequestParam("date") String date) {
        List<Map<String, String>> lockedSlots = new ArrayList<>();

        // Kiểm tra các slot đã bị khóa
        for (int i = 8; i <= 17; i++) {
            String time = String.format("%02d:00", i);
            if (appointmentLockManager.isSlotLocked(doctorId, date, time)) {
                Map<String, String> lockedSlot = new HashMap<>();
                lockedSlot.put("time", time);
                lockedSlots.add(lockedSlot);
            }
        }

        return ResponseEntity.ok(lockedSlots);
    }

    @GetMapping("/today")
    public ResponseEntity<List<Appointments>> getTodaysAppointments(@RequestParam int doctor_id) {
        LocalDate today = LocalDate.now();
        List<Appointments> appointmentsList = new ArrayList<>();

        try {
            Appointments example = new Appointments();
            example.setDoctor_id(doctor_id);
            List<Appointments> appointments = model.getEntityById(example);

            for (Appointments appointment : appointments) {
                LocalDate appointmentDate = appointment.getMedical_day().toInstant().atZone(ZoneId.systemDefault()).toLocalDate();
                if (appointmentDate.isEqual(today)) {
                    Appointments newAppointment = new Appointments();
                    BeanUtils.copyProperties(appointment, newAppointment);
                    appointmentsList.add(newAppointment);
                }
            }

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(appointmentsList);
        }

        return ResponseEntity.ok(appointmentsList);
    }

    @GetMapping("/search-new")
    public List<Appointments> searchAppointments(
            @RequestParam(required = false) String start_date,
            @RequestParam(required = false) String end_date,
            @RequestParam(required = false) String status) throws SQLException, IllegalAccessException, InvocationTargetException, InstantiationException, NoSuchMethodException {
        return model.searchAppointmentsByCriteria(start_date, end_date, status);
    }
    @GetMapping("/{appointmentId}")
    public ResponseEntity<Appointments> getAppointmentDetails(@PathVariable int appointmentId) throws SQLException, IllegalAccessException, InstantiationException {
        Appointments appointment = new Appointments();
        appointment.setAppointment_id(appointmentId);
        List<Appointments> appointmentsList = model.getEntityById(appointment);

        if (appointmentsList.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Appointments detailedAppointment = appointmentsList.get(0);

        // Fetch patient details
        if (detailedAppointment.getPatient_id() != null) {
            Patients patientFilter = new Patients();
            patientFilter.setPatient_id(detailedAppointment.getPatient_id());
            List<Patients> patientList = model.getEntityById(patientFilter);
            if (!patientList.isEmpty()) {
                detailedAppointment.setPatient(patientList);
            }
        }

        // Fetch doctor details
        if (detailedAppointment.getDoctor_id() != null) {
            Doctors doctorFilter = new Doctors();
            doctorFilter.setDoctor_id(detailedAppointment.getDoctor_id());
            List<Doctors> doctorList = model.getEntityById(doctorFilter);
            if (!doctorList.isEmpty()) {
                detailedAppointment.setDoctor(doctorList);
            }
        }

        return ResponseEntity.ok(detailedAppointment);
    }
    @GetMapping("/searchByCriteriaAndDoctor")
    public List<Appointments> searchByCriteriaAndDoctor(@RequestParam Map<String, String> requestParams) {
        try {
            String startDate = requestParams.get("start_date");
            String endDate = requestParams.get("end_date");
            String status = requestParams.get("status");
            int doctorId = Integer.parseInt(requestParams.get("doctor_id"));

            return model.searchAppointmentsByCriteriaAndDoctor(startDate, endDate, status, doctorId);
        } catch (Exception e) {
            e.printStackTrace();
            return new ArrayList<>();
        }
    }

    @GetMapping("/todays-appointments")
    public ResponseEntity<List<Appointments>> getTodaysAppointments() {
        // Implementation for getting today's appointments
        return ResponseEntity.ok(new ArrayList<>()); // Placeholder
    }

    @GetMapping("/available-doctors")
    public ResponseEntity<List<Map<String, Object>>> getAvailableDoctors(
            @RequestParam("departmentId") int departmentId,
            @RequestParam("date") String date,
            @RequestParam("timeSlot") int timeSlot) {

        List<Map<String, Object>> availableDoctors = new ArrayList<>();

        try {
            // Get all doctors in the department
            Doctors doctorFilter = new Doctors();
            doctorFilter.setDepartment_id(departmentId);
            List<Doctors> doctors = model.getEntityById(doctorFilter);

            for (Doctors doctor : doctors) {
                // Check if doctor has available slot
                Appointments appointmentFilter = new Appointments();
                appointmentFilter.setDoctor_id(doctor.getDoctor_id());
                appointmentFilter.setSlot(timeSlot);
                // Convert date string to Date object for comparison
                try {
                    java.sql.Date sqlDate = java.sql.Date.valueOf(date);
                    appointmentFilter.setMedical_day(sqlDate);
                } catch (Exception e) {
                    continue; // Skip if date parsing fails
                }

                List<Appointments> existingAppointments = model.getEntityById(appointmentFilter);

                // If no existing appointment found, doctor is available
                if (existingAppointments.isEmpty()) {
                    Map<String, Object> doctorInfo = new HashMap<>();
                    doctorInfo.put("doctor_id", doctor.getDoctor_id());
                    doctorInfo.put("doctor_name", doctor.getDoctor_name());
                    doctorInfo.put("doctor_email", doctor.getDoctor_email());
                    doctorInfo.put("doctor_phone", doctor.getDoctor_phone());
                    doctorInfo.put("doctor_image", doctor.getDoctor_image());
                    doctorInfo.put("doctor_price", doctor.getDoctor_price());
                    availableDoctors.add(doctorInfo);
                }
            }

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(availableDoctors);
        }

        return ResponseEntity.ok(availableDoctors);
    }

}
