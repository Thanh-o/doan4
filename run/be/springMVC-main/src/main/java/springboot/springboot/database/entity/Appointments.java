package springboot.springboot.database.entity;

import java.math.BigDecimal;
import java.util.Date;
import java.util.List;

public class Appointments extends Entity<Integer>{
    private Integer appointment_id;
    private Integer patient_id;
    private Integer doctor_id;
    private Date appointment_date;
    private Date medical_day;
    private Integer slot;
    private String status;
    private String payment_name;
    private BigDecimal price;
    private Integer staff_id;
    private String note;
    private List<Patients> patient;
    private List<Doctors> doctor;
    private List<Staffs> staff;
    public Appointments() {
    }

    public Integer getAppointment_id() {
        return appointment_id;
    }

    public void setAppointment_id(Integer appointment_id) {
        this.appointment_id = appointment_id;
    }

    public Integer getPatient_id() {
        return patient_id;
    }

    public void setPatient_id(Integer patient_id) {
        this.patient_id = patient_id;
    }

    public Integer getDoctor_id() {
        return doctor_id;
    }

    public void setDoctor_id(Integer doctor_id) {
        this.doctor_id = doctor_id;
    }

    public Date getAppointment_date() {
        return appointment_date;
    }

    public void setAppointment_date(Date appointment_date) {
        this.appointment_date = appointment_date;
    }

    public Date getMedical_day() {
        return medical_day;
    }

    public void setMedical_day(Date medical_day) {
        this.medical_day = medical_day;
    }

    public Integer getSlot() {
        return slot;
    }

    public void setSlot(Integer slot) {
        this.slot = slot;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getPayment_name() {
        return payment_name;
    }

    public void setPayment_name(String payment_name) {
        this.payment_name = payment_name;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public Integer getStaff_id() {
        return staff_id;
    }

    public void setStaff_id(Integer staff_id) {
        this.staff_id = staff_id;
    }

    public List<Patients> getPatient() {
        return patient;
    }

    public void setPatient(List<Patients> patient) {
        this.patient = patient;
    }

    public List<Doctors> getDoctor() {
        return doctor;
    }

    public void setDoctor(List<Doctors> doctor) {
        this.doctor = doctor;
    }

    public List<Staffs> getStaff() {
        return staff;
    }

    public void setStaff(List<Staffs> staff) {
        this.staff = staff;
    }

    public void setNote(String note) {this.note = note;}

    public String getNote() {return note;}
}
