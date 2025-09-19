import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:intl/intl.dart';
import 'package:google_fonts/google_fonts.dart';

import 'PatientMedicalListScreen.dart';

class AppointmentDetailsScreen extends StatefulWidget {
  final Map<String, dynamic> appointment;

  const AppointmentDetailsScreen({super.key, required this.appointment});

  @override
  State<AppointmentDetailsScreen> createState() => _AppointmentDetailsScreenState();
}

class _AppointmentDetailsScreenState extends State<AppointmentDetailsScreen> with SingleTickerProviderStateMixin {
  Map<String, dynamic>? _appointmentDetails;
  bool _isLoading = true;
  bool _isUpdating = false;
  String? _errorMessage;
  late AnimationController _animationController;
  late Animation<Offset> _slideAnimation;

  String getTimeSlot(dynamic slot) {
    const timeSlots = [8, 9, 10, 11, 13, 14, 15, 16];
    if (slot is int && slot >= 1 && slot <= 8) {
      return '${timeSlots[slot - 1]}:00';
    }
    return 'Not determined';
  }

  // Color palette
  static const Color primaryColor = Color(0xFF0288D1);
  static const Color accentColor = Color(0xFFFFB300);
  static const Color backgroundColor = Color(0xFFF5F7FA);
  static const Color cardColor = Colors.white;
  static const Color errorColor = Color(0xFFE57373);
  static const Color textColor = Color(0xFF1A1A1A);

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      duration: const Duration(milliseconds: 600),
      vsync: this,
    );
    _slideAnimation = Tween<Offset>(
      begin: const Offset(0, 0.2),
      end: Offset.zero,
    ).animate(CurvedAnimation(
      parent: _animationController,
      curve: Curves.easeOutQuad,
    ));
    _animationController.forward();
    _fetchAppointmentDetails();
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  Future<void> _fetchAppointmentDetails() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });
    final appointmentId = widget.appointment['appointment_id'].toString();
    final url = Uri.parse('http://10.0.2.2:8081/api/v1/appointments/$appointmentId');
    try {
      final response = await http.get(url);
      if (response.statusCode == 200) {
        final appointmentData = jsonDecode(response.body);
        setState(() {
          _appointmentDetails = appointmentData;
          _isLoading = false;
        });
      } else {
        setState(() {
          _errorMessage = 'Error loading appointment details: ${response.statusCode}';
          _isLoading = false;
        });
      }
    } catch (e) {
      setState(() {
        _errorMessage = 'Connection error. Please try again.!';
        _isLoading = false;
      });
    }
  }

  Future<void> _updateStatus(String newStatus) async {
    setState(() {
      _isUpdating = true;
      _errorMessage = null;
    });
    final appointmentId = (_appointmentDetails?['appointment_id'] ?? widget.appointment['appointment_id']).toString();
    final url = Uri.parse('http://10.0.2.2:8081/api/v1/appointments/updateStatus');
    try {
      final response = await http.put(
        url,
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'appointment_id': appointmentId,
          'status': newStatus,
        }),
      );
      if (response.statusCode == 200) {
        setState(() {
          _appointmentDetails?['status'] = newStatus;
          _isUpdating = false;
        });
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              'Status update successful: $newStatus',
              style: GoogleFonts.lora(
                fontSize: 14,
                color: Colors.white,
              ),
            ),
            backgroundColor: primaryColor,
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
          ),
        );
        await _fetchAppointmentDetails();
      } else {
        setState(() {
          _errorMessage = 'Error while updating status: ${response.statusCode}';
          _isUpdating = false;
        });
      }
    } catch (e) {
      setState(() {
        _errorMessage = 'Connection error while updating status. Please try again.!';
        _isUpdating = false;
      });
    }
  }

  String _formatDate(String? date) {
    if (date == null) return 'Chưa có';
    try {
      final parsedDate = DateTime.parse(date);
      return DateFormat('dd/MM/yyyy').format(parsedDate);
    } catch (e) {
      return date;
    }
  }

  // Check if appointment time has passed
  bool _hasAppointmentTimePassed() {
    final appointment = _appointmentDetails ?? widget.appointment;
    final medicalDayStr = appointment['medical_day']?.toString();

    if (medicalDayStr == null) return false;

    try {
      final now = DateTime.now();
      final medicalDay = DateTime.parse(medicalDayStr);
      final today = DateTime(now.year, now.month, now.day);
      final appointmentDate = DateTime(medicalDay.year, medicalDay.month, medicalDay.day);

      // If appointment is on a future date, it hasn't passed
      if (appointmentDate.isAfter(today)) {
        return false;
      }

      // If appointment is on a past date, it has passed
      if (appointmentDate.isBefore(today)) {
        return true;
      }

      // If appointment is today, check the time slot
      final slot = appointment['slot'];
      if (slot is int && slot >= 1 && slot <= 8) {
        const timeSlots = [8, 9, 10, 11, 13, 14, 15, 16];
        final appointmentHour = timeSlots[slot - 1];
        return now.hour >= appointmentHour;
      }

      return false;
    } catch (e) {
      return false;
    }
  }

  @override
  Widget build(BuildContext context) {
    final appointment = _appointmentDetails ?? widget.appointment;
    final patientName = appointment['patient'] != null && appointment['patient'].isNotEmpty
        ? appointment['patient'][0]['patient_name']?.toString() ?? ' ${appointment['patient_id']?.toString() ?? 'Loading...'}'
        : ' ${appointment['patient_id']?.toString() ?? 'Loading...'}';

    final status = appointment['status']?.toString() ?? 'Loading...';

    return Scaffold(
      backgroundColor: backgroundColor,
      appBar: AppBar(
        title: Text(
          'Appointment Details',
          style: GoogleFonts.lora(
            fontSize: 20,
            fontWeight: FontWeight.w600,
            color: Colors.white,
          ),
        ),
        backgroundColor: primaryColor,
        elevation: 2,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios, color: Colors.white),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: SafeArea(
        child: _isLoading
            ? Center(
          child: CircularProgressIndicator(
            color: accentColor,
            strokeWidth: 4,
          ),
        )
            : _errorMessage != null
            ? Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                Icons.error_outline,
                color: errorColor,
                size: 60,
              ),
              const SizedBox(height: 16),
              Text(
                _errorMessage!,
                style: GoogleFonts.lora(
                  color: errorColor,
                  fontSize: 18,
                  fontWeight: FontWeight.w500,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 20),
              ElevatedButton.icon(
                onPressed: _fetchAppointmentDetails,
                style: ElevatedButton.styleFrom(
                  backgroundColor: primaryColor,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(horizontal: 30, vertical: 14),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                  elevation: 3,
                ),
                icon: const Icon(Icons.refresh, size: 20),
                label: Text(
                  'Retry',
                  style: GoogleFonts.lora(
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ],
          ),
        )
            : SlideTransition(
          position: _slideAnimation,
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _buildPatientHeader(patientName),
                const SizedBox(height: 20),
                _buildSectionHeader('Appointment Details'),
                const SizedBox(height: 12),
                _buildDetailCard([

                  _buildDetailRow('Booking date', _formatDate(appointment['appointment_date']?.toString())),
                  _buildDetailRow('Date of examination', _formatDate(appointment['medical_day']?.toString())),
                  _buildDetailRow('Time frame', getTimeSlot(appointment['slot'])),
                  _buildDetailRow('Status', status),
                  _buildDetailRow('Payment type', appointment['payment_name']?.toString() ?? ''),
                  _buildDetailRow('Note', appointment['note']?.toString() ?? ''),
                  _buildDetailRow('Officer in charge', appointment['staff_id']?.toString() ?? ''),
                  _buildDetailRow('Price', '\$${appointment['price']?.toInt().toString() ?? '0'}'),
                ]),
                if (status == 'PENDING') ...[
                  const SizedBox(height: 12),
                  _buildActionButtons(),
                ],
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildPatientHeader(String patientName) {
    final patient = (_appointmentDetails ?? widget.appointment)['patient'];
    final patientImg = patient != null && patient.isNotEmpty ? patient[0]['patient_img'] : null;
    final patientId = patient != null && patient.isNotEmpty ? patient[0]['patient_id'] : null;


    return Material(
      color: Colors.transparent,
      child: InkWell(
        borderRadius: BorderRadius.circular(12),
        onTap: () {
          if (patientId != null) {
            Navigator.push(
              context,
              MaterialPageRoute(
                builder: (_) => PatientMedicalListScreen(
                  patientId: patientId,
                  patientName: patientName,
                ),
              ),
            );
          }
        },
        child: Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: cardColor,
            borderRadius: BorderRadius.circular(12),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.08),
                blurRadius: 8,
                offset: const Offset(0, 2),
              ),
            ],
          ),
          child: Row(
            children: [
              Container(
                width: 60,
                height: 60,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  boxShadow: [
                    BoxShadow(
                      color: primaryColor.withOpacity(0.3),
                      blurRadius: 6,
                      offset: const Offset(0, 3),
                    ),
                  ],
                ),
                child: ClipOval(
                  child: patientImg != null
                      ? Image.network(
                    patientImg,
                    fit: BoxFit.cover,
                    errorBuilder: (context, error, stackTrace) => Container(
                      color: primaryColor.withOpacity(0.2),
                      child: const Icon(Icons.person, color: primaryColor, size: 40),
                    ),
                  )
                      : Container(
                    color: primaryColor.withOpacity(0.2),
                    child: const Icon(Icons.person, color: primaryColor, size: 40),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      patientName,
                      style: GoogleFonts.lora(
                        fontSize: 22,
                        fontWeight: FontWeight.w700,
                        color: textColor,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Tap to view medical records',
                      style: GoogleFonts.lora(
                        fontSize: 12,
                        fontStyle: FontStyle.italic,
                        color: Colors.grey[600],
                      ),
                    ),
                  ],
                ),
              ),
              const Icon(Icons.arrow_forward_ios, size: 16, color: Colors.grey),
            ],
          ),
        ),
      ),
    );


  }


  Widget _buildDoctorHeader(String doctorName) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: cardColor,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.08),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Row(
        children: [
          CircleAvatar(
            radius: 30,
            backgroundColor: accentColor.withOpacity(0.2),
            child: const Icon(
              Icons.medical_services,
              size: 40,
              color: accentColor,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              doctorName,
              style: GoogleFonts.lora(
                fontSize: 22,
                fontWeight: FontWeight.w700,
                color: textColor,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSectionHeader(String title) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 12),
      decoration: BoxDecoration(
        color: primaryColor.withOpacity(0.1),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Text(
        title,
        style: GoogleFonts.lora(
          fontSize: 18,
          fontWeight: FontWeight.w600,
          color: primaryColor,
        ),
      ),
    );
  }

  Widget _buildDetailCard(List<Widget> children) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: cardColor,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.08),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: children,
        ),
      ),
    );
  }

  Widget _buildDetailRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: GoogleFonts.lora(
              fontSize: 14,
              fontWeight: FontWeight.w600,
              color: Colors.black54,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            value,
            style: GoogleFonts.lora(
              fontSize: 14,
              color: textColor,
              height: 1.4,
            ),
          ),
          const Divider(height: 20, thickness: 1, color: Colors.grey),
        ],
      ),
    );
  }

  Widget _buildActionButtons() {
    final hasTimePassed = _hasAppointmentTimePassed();

    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
      children: [
        // Cancel button - only show if appointment time hasn't passed
        if (!hasTimePassed)
          Expanded(
            child: ElevatedButton.icon(
              onPressed: _isUpdating ? null : () => _updateStatus('MISSED'),
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.orange,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
                elevation: 3,
              ),
              icon: _isUpdating
                  ? const SizedBox(
                width: 20,
                height: 20,
                child: CircularProgressIndicator(
                  color: Colors.white,
                  strokeWidth: 2,
                ),
              )
                  : const Icon(	Icons.error_outline, size: 20),
              label: Text(
                'MISSED',
                style: GoogleFonts.lora(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
          ),

        // Add spacing only if both buttons are shown
        if (!hasTimePassed && hasTimePassed) const SizedBox(width: 16),

        // Confirm button - only show if appointment time has passed
        if (hasTimePassed)
          Expanded(
            child: ElevatedButton.icon(
              onPressed: _isUpdating ? null : () => _updateStatus('COMPLETED'),
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.green,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
                elevation: 3,
              ),
              icon: _isUpdating
                  ? const SizedBox(
                width: 20,
                height: 20,
                child: CircularProgressIndicator(
                  color: Colors.white,
                  strokeWidth: 2,
                ),
              )
                  : const Icon(Icons.check_circle, size: 20),
              label: Text(
                'COMPLETED',
                style: GoogleFonts.lora(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
          ),
      ],
    );
  }
}