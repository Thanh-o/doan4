import 'package:esavior_doctor/screens/past_appointments_screen.dart';
import 'package:flutter/material.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:intl/intl.dart';
import 'package:intl/date_symbol_data_local.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:timezone/timezone.dart' as tz;

import '../service/appointment_service.dart';
import '../screens/settings_screen.dart'; // Add settings import

import 'appointment_details_screen.dart';
import 'dart:math' as math;

// Enum to define filter types
enum FilterType { today, thisMonth, thisYear }

class AppointmentsScreen extends StatefulWidget {
  const AppointmentsScreen({super.key, required this.doctorId});
  final int doctorId;

  @override
  State<AppointmentsScreen> createState() => _AppointmentsScreenState();
}

class _AppointmentsScreenState extends State<AppointmentsScreen> with TickerProviderStateMixin {
  final _storage = const FlutterSecureStorage();
  final _appointmentService = OptimizedAppointmentService(); // Updated service

  List<dynamic> appointments = [];
  int? _doctorId;
  bool _isLoading = true;
  String? _errorMessage;
  bool _isLocaleInitialized = false;
  bool _isRefreshing = false; // Add refresh state

  late AnimationController _mainAnimationController;
  late AnimationController _fabAnimationController;
  late AnimationController _filterAnimationController;

  late Animation<Offset> _slideAnimation;
  late Animation<double> _fadeAnimation;
  late Animation<double> _filterAnimation;

  FilterType _currentFilter = FilterType.today;

  static const Color primaryColor = Color(0xFF2196F3);
  static const Color primaryDarkColor = Color(0xFF1976D2);
  static const Color accentColor = Color(0xFFFF9800);
  static const Color backgroundColor = Color(0xFFF8FAFC);
  static const Color cardColor = Colors.white;
  static const Color errorColor = Color(0xFFE57373);
  static const Color successColor = Color(0xFF66BB6A);
  static const Color textColor = Color(0xFF1A1A1A);
  static const Color textSecondaryColor = Color(0xFF64748B);
  static const Color shadowColor = Color(0x1A000000);

  @override
  void initState() {
    super.initState();

    _mainAnimationController = AnimationController(
      duration: const Duration(milliseconds: 800),
      vsync: this,
    );

    _fabAnimationController = AnimationController(
      duration: const Duration(milliseconds: 600),
      vsync: this,
    );

    _filterAnimationController = AnimationController(
      duration: const Duration(milliseconds: 400),
      vsync: this,
    );

    _slideAnimation = Tween<Offset>(
      begin: const Offset(0, 0.3),
      end: Offset.zero,
    ).animate(CurvedAnimation(
      parent: _mainAnimationController,
      curve: Curves.easeOutCubic,
    ));

    _fadeAnimation = Tween<double>(
      begin: 0.0,
      end: 1.0,
    ).animate(CurvedAnimation(
      parent: _mainAnimationController,
      curve: Curves.easeInOut,
    ));

    _filterAnimation = Tween<double>(
      begin: 0.0,
      end: 1.0,
    ).animate(CurvedAnimation(
      parent: _filterAnimationController,
      curve: Curves.easeInOut,
    ));

    _initializeApp();
  }

  Future<void> _initializeApp() async {
    await _initializeDateFormatting();
    // Service is already initialized in main.dart
    await _loadDoctorIdAndFetch();
  }

  Future<void> _initializeDateFormatting() async {
    try {
      await initializeDateFormatting('en', null);
      _isLocaleInitialized = true;
      // print('Successfully initialized Vietnamese locale');
    } catch (e) {
      // print('Error initializing locale: $e');
      _isLocaleInitialized = false;
    }
  }

  @override
  void dispose() {
    _mainAnimationController.dispose();
    _fabAnimationController.dispose();
    _filterAnimationController.dispose();
    super.dispose();
  }

  Future<void> _loadDoctorIdAndFetch() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    final idString = await _storage.read(key: 'doctor_id');
    if (idString != null) {
      setState(() {
        _doctorId = int.tryParse(idString);
      });
      if (_doctorId != null) {
        await fetchAppointments();
        if (mounted) {
          _mainAnimationController.forward();
          Future.delayed(const Duration(milliseconds: 300), () {
            if (mounted) {
              _filterAnimationController.forward();
            }
          });
          Future.delayed(const Duration(milliseconds: 500), () {
            if (mounted) {
              _fabAnimationController.forward();
            }
          });
        }
      }
    }

    setState(() {
      _isLoading = false;
    });
  }

  Future<void> fetchAppointments({bool forceRefresh = false}) async {
    print('DEBUG: Fetching appointments for doctor_id: $_doctorId'); // 👈 Thêm dòng này

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      List<Map<String, dynamic>> fetchedAppointments;

      if (forceRefresh) {
        // Force a fresh API call by calling the service method directly
        fetchedAppointments = await _appointmentService.fetchAppointmentsWithRetry(_doctorId!);
      } else {
        // Use the normal fetch method which may use cache
        fetchedAppointments = await _appointmentService.fetchAppointments(_doctorId!);
      }

      setState(() {
        appointments = fetchedAppointments;
        _errorMessage = null;
      });
    } catch (e) {
      setState(() {
        _errorMessage = e.toString();
      });
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  // Add refresh method that forces API call
  Future<void> _refreshAppointments() async {
    if (_isRefreshing) return;

    setState(() {
      _isRefreshing = true;
    });

    try {
      // Load notification settings first
      await _appointmentService.loadNotificationSettings();

      // Force refresh appointments with fresh API call
      final fetchedAppointments = await _appointmentService.forceRefreshAppointments(_doctorId!);

      setState(() {
        appointments = fetchedAppointments;
        _errorMessage = null;
      });

      // Reschedule notifications with the new data
      await _appointmentService.scheduleOptimizedNotifications(fetchedAppointments);

      _showSnackBar('Successfully updated appointments!', successColor);

    } catch (e) {
      _showSnackBar('Error updating: $e', errorColor);
      setState(() {
        _errorMessage = e.toString();
      });
    } finally {
      setState(() {
        _isRefreshing = false;
      });
    }
  }

  void _showSnackBar(String message, Color color) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          message,
          style: GoogleFonts.lora(color: Colors.white),
        ),
        backgroundColor: color,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      ),
    );
  }

  String _formatDateVerbose(String? date) {
    if (date == null) return 'Not specified';
    try {
      final parsedDate = DateTime.parse(date);
      final now = DateTime.now();
      final today = DateTime(now.year, now.month, now.day);
      final tomorrow = today.add(const Duration(days: 1));
      final appointmentDate = DateTime(parsedDate.year, parsedDate.month, parsedDate.day);

      if (appointmentDate.isAtSameMomentAs(today)) {
        return 'Today';
      } else if (appointmentDate.isAtSameMomentAs(tomorrow)) {
        return 'Tomorrow';
      } else {
        if (_isLocaleInitialized) {
          return DateFormat('EEEE, dd/MM/yyyy', 'en').format(parsedDate);
        } else {
          return DateFormat('dd/MM/yyyy').format(parsedDate);
        }
      }
    } catch (e) {
      return date;
    }
  }

  List<dynamic> _getFilteredAppointments() {
    final now = tz.TZDateTime.now(tz.getLocation('Asia/Ho_Chi_Minh'));
    final todayStart = tz.TZDateTime(tz.getLocation('Asia/Ho_Chi_Minh'), now.year, now.month, now.day);
    final currentTime = DateTime.now();
    final currentHour = currentTime.hour;

    return appointments.where((appointment) {
      final Map<String, dynamic> a = Map<String, dynamic>.from(appointment);
      if (a['doctor_id'] != _doctorId) return false;

      if (a['status'] != 'PENDING') return false;

      final medicalDay = a['medical_day'];
      if (medicalDay == null) return false;

      try {
        final parsedMedicalDay = DateTime.parse(medicalDay.toString());

        switch (_currentFilter) {
          case FilterType.today:
          // Show all appointments for today regardless of time
            final appointmentDate = DateTime(parsedMedicalDay.year, parsedMedicalDay.month, parsedMedicalDay.day);
            final todayDate = DateTime(now.year, now.month, now.day);
            return appointmentDate.isAtSameMomentAs(todayDate);

          case FilterType.thisMonth:
            if (parsedMedicalDay.isBefore(todayStart)) {
              return false;
            }
            if (parsedMedicalDay.year == now.year && parsedMedicalDay.month == now.month) {
              return true;
            }
            return false;

          case FilterType.thisYear:
            if (parsedMedicalDay.isBefore(todayStart)) {
              return false;
            }
            if (parsedMedicalDay.year == now.year) {
              return true;
            }
            return false;
        }
      } catch (e) {
        return false;
      }
    }).toList();
  }

  Widget _buildHeader() {
    return SizedBox(
      height: 180,
      child: ClipRect(
        child: SingleChildScrollView(
          child: Container(
            padding: const EdgeInsets.fromLTRB(20, 16, 20, 8),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [
                  primaryColor,
                  primaryDarkColor,
                ],
              ),
            ),
            child: SafeArea(
              bottom: false,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: Colors.white.withOpacity(0.2),
                          borderRadius: BorderRadius.circular(16),
                        ),
                        child: const Icon(
                          Icons.calendar_today,
                          color: Colors.white,
                          size: 24,
                        ),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Appointment Schedule',
                              style: GoogleFonts.lora(
                                fontSize: 18,
                                fontWeight: FontWeight.w700,
                                color: Colors.white,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              _isLocaleInitialized
                                  ? DateFormat('EEEE, dd MMMM yyyy', 'en').format(DateTime.now())
                                  : DateFormat('dd/MM/yyyy').format(DateTime.now()),
                              style: GoogleFonts.lora(
                                fontSize: 14,
                                color: Colors.white.withOpacity(0.9),
                                fontWeight: FontWeight.w400,
                              ),
                            ),
                          ],
                        ),
                      ),
                      // Add notification and settings buttons
                      Row(
                        children: [
                          GestureDetector(
                            onTap: () {
                              Navigator.push(
                                context,
                                MaterialPageRoute(
                                  builder: (context) => PastAppointmentsScreen(doctorId: _doctorId!),
                                ),
                              );
                            },
                            child: Container(
                              padding: const EdgeInsets.all(8),
                              decoration: BoxDecoration(
                                color: Colors.white.withOpacity(0.2),
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: const Icon(
                                Icons.history,
                                color: Colors.white,
                                size: 20,
                              ),
                            ),
                          ),
                          const SizedBox(width: 8),
                          // Settings button
                          GestureDetector(
                            onTap: () {
                              Navigator.push(
                                context,
                                MaterialPageRoute(
                                  builder: (context) => const SettingsScreen(),
                                ),
                              ).then((_) {
                                // Refresh when returning from settings
                                _refreshAppointments();
                              });
                            },
                            child: Container(
                              padding: const EdgeInsets.all(8),
                              decoration: BoxDecoration(
                                color: Colors.white.withOpacity(0.2),
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: const Icon(
                                Icons.settings,
                                color: Colors.white,
                                size: 20,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildFilterButtons() {
    return AnimatedBuilder(
      animation: _filterAnimation,
      builder: (context, child) {
        final clampedOpacity = math.min(1.0, math.max(0.0, _filterAnimation.value));
        return Transform.translate(
          offset: Offset(0, (1 - _filterAnimation.value) * 50),
          child: Opacity(
            opacity: clampedOpacity,
            child: Container(
              margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              child: Row(
                children: [
                  Expanded(
                    child: _buildFilterButton(
                      'Today',
                      FilterType.today,
                      Icons.today_outlined,
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: _buildFilterButton(
                      'This Month',
                      FilterType.thisMonth,
                      Icons.calendar_month_outlined,
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: _buildFilterButton(
                      'This Year',
                      FilterType.thisYear,
                      Icons.calendar_today_outlined,
                    ),
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }

  Widget _buildFilterButton(String title, FilterType filterType, IconData icon) {
    final isSelected = _currentFilter == filterType;
    return AnimatedContainer(
      duration: const Duration(milliseconds: 200),
      child: ElevatedButton.icon(
        onPressed: () {
          setState(() {
            _currentFilter = filterType;
          });
        },
        style: ElevatedButton.styleFrom(
          backgroundColor: isSelected ? primaryColor : cardColor,
          foregroundColor: isSelected ? Colors.white : textColor,
          elevation: isSelected ? 4 : 1,
          shadowColor: isSelected ? primaryColor.withOpacity(0.3) : shadowColor,
          padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 12),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
            side: BorderSide(
              color: isSelected ? primaryColor : Colors.grey.shade300,
              width: isSelected ? 0 : 1,
            ),
          ),
        ),
        icon: Icon(icon, size: 18),
        label: Text(
          title,
          style: GoogleFonts.lora(
            fontSize: 12,
            fontWeight: isSelected ? FontWeight.w600 : FontWeight.w500,
          ),
        ),
      ),
    );
  }

  Widget _buildAppointmentCard(Map<dynamic, dynamic> appointment, int index) {
    final Map<String, dynamic> appointmentData = Map<String, dynamic>.from(appointment);

    final patientList = appointmentData['patient'] as List<dynamic>?;
    final patient = patientList != null && patientList.isNotEmpty
        ? patientList[0] as Map<String, dynamic>
        : null;

    final patientName = patientList != null && patientList.isNotEmpty
        ? (patientList[0] as Map<String, dynamic>)['patient_name']?.toString() ?? 'Patient ID: ${appointmentData['patient_id']}'
        : 'Patient ID: ${appointmentData['patient_id'] ?? ''}';
    final patientImg = patient?['patient_img']?.toString();

    final timeSlot = _appointmentService.getTimeSlot(appointmentData['slot']);
    final appointmentDate = _formatDateVerbose(appointmentData['medical_day']?.toString());
    final status = appointmentData['status']?.toString() ?? '';

    Color statusColor;
    switch (status) {
      case 'PENDING':
        statusColor = accentColor;
        break;
      case 'CANCELLED':
        statusColor = errorColor;
        break;
      case 'COMPLETED':
        statusColor = successColor;
        break;
      default:
        statusColor = textSecondaryColor;
    }

    return AnimatedBuilder(
      animation: _slideAnimation,
      builder: (context, child) {
        return Transform.translate(
          offset: Offset(0, (1 - _fadeAnimation.value) * 30),
          child: FadeTransition(
            opacity: _fadeAnimation,
            child: Container(
              margin: const EdgeInsets.only(bottom: 16),
              decoration: BoxDecoration(
                color: cardColor,
                borderRadius: BorderRadius.circular(16),
                boxShadow: [
                  BoxShadow(
                    color: shadowColor,
                    blurRadius: 10,
                    offset: const Offset(0, 4),
                  ),
                ],
                border: Border.all(
                  color: Colors.grey.shade100,
                  width: 1,
                ),
              ),
              child: Material(
                color: Colors.transparent,
                child: InkWell(
                  onTap: () {
                    Navigator.push(
                      context,
                      PageRouteBuilder(
                        pageBuilder: (context, animation, secondaryAnimation) =>
                            AppointmentDetailsScreen(appointment: appointmentData),
                        transitionsBuilder: (context, animation, secondaryAnimation, child) {
                          return SlideTransition(
                            position: Tween<Offset>(
                              begin: const Offset(1.0, 0.0),
                              end: Offset.zero,
                            ).animate(CurvedAnimation(
                              parent: animation,
                              curve: Curves.easeOutCubic,
                            )),
                            child: child,
                          );
                        },
                        transitionDuration: const Duration(milliseconds: 300),
                      ),
                    );
                  },
                  borderRadius: BorderRadius.circular(16),
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(

                    children: [
                            // 👇 Ảnh bệnh nhân hoặc icon fallback
                            Container(
                              width: 48,
                              height: 48,
                              decoration: BoxDecoration(
                                gradient: patientImg == null
                                    ? LinearGradient(colors: [primaryColor, primaryDarkColor])
                                    : null,
                                color: patientImg != null ? Colors.grey[200] : null,
                                borderRadius: BorderRadius.circular(12),
                                boxShadow: [
                                  BoxShadow(
                                    color: primaryColor.withOpacity(0.3),
                                    blurRadius: 8,
                                    offset: const Offset(0, 4),
                                  ),
                                ],
                              ),
                              child: ClipRRect(
                                borderRadius: BorderRadius.circular(12),
                                child: patientImg != null
                                    ? Image.network(
                                  patientImg,
                                  fit: BoxFit.cover,
                                  errorBuilder: (context, error, stackTrace) => Center(
                                    child: Icon(Icons.person, color: Colors.white),
                                  ),
                                )
                                    : const Center(
                                  child: Icon(Icons.person, color: Colors.white),
                                ),
                              ),
                            ),
                            const SizedBox(width: 16),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    patientName,
                                    style: GoogleFonts.lora(
                                      fontSize: 18,
                                      fontWeight: FontWeight.w700,
                                      color: textColor,
                                    ),
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                ],
                              ),
                            ),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                              decoration: BoxDecoration(
                                color: statusColor.withOpacity(0.1),
                                borderRadius: BorderRadius.circular(20),
                                border: Border.all(
                                  color: statusColor.withOpacity(0.3),
                                  width: 1,
                                ),
                              ),
                              child: Text(
                                status,
                                style: GoogleFonts.lora(
                                  fontSize: 11,
                                  fontWeight: FontWeight.w600,
                                  color: statusColor,
                                ),
                              ),
                            ),
                          ],
                        ),

                        const SizedBox(height: 16),
                        Container(
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: backgroundColor,
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Row(
                            children: [
                              Expanded(
                                child: _buildInfoItem(
                                  Icons.calendar_today,
                                  'Appointment Date',
                                  appointmentDate,
                                ),
                              ),
                              Container(
                                width: 1,
                                height: 40,
                                color: Colors.grey.shade300,
                                margin: const EdgeInsets.symmetric(horizontal: 12),
                              ),
                              Expanded(
                                child: _buildInfoItem(
                                  Icons.access_time,
                                  'Appointment Time',
                                  timeSlot,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ),
        );
      },
    );
  }

  Widget _buildInfoItem(IconData icon, String label, String value) {
    return Row(
      children: [
        Icon(
          icon,
          size: 16,
          color: primaryColor,
        ),
        const SizedBox(width: 8),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label,
                style: GoogleFonts.lora(
                  fontSize: 11,
                  color: textSecondaryColor,
                  fontWeight: FontWeight.w500,
                ),
              ),
              Text(
                value,
                style: GoogleFonts.lora(
                  fontSize: 13,
                  color: textColor,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildEmptyState() {
    return SingleChildScrollView(
      physics: AlwaysScrollableScrollPhysics(),
      child: Container(
        height: MediaQuery.of(context).size.height * 0.6,
        child: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: primaryColor.withOpacity(0.1),
                  shape: BoxShape.circle,
                ),
                child: Icon(
                  Icons.event_busy_outlined,
                  size: 64,
                  color: primaryColor,
                ),
              ),
              const SizedBox(height: 24),
              Text(
                _getEmptyMessage(),
                style: GoogleFonts.lora(
                  fontSize: 18,
                  fontWeight: FontWeight.w600,
                  color: textColor,
                ),
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildErrorState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              color: errorColor.withOpacity(0.1),
              shape: BoxShape.circle,
            ),
            child: Icon(
              Icons.error_outline,
              size: 64,
              color: errorColor,
            ),
          ),
          const SizedBox(height: 24),
          Text(
            'An error occurred',
            style: GoogleFonts.lora(
              fontSize: 20,
              fontWeight: FontWeight.w700,
              color: textColor,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            _errorMessage!,
            style: GoogleFonts.lora(
              fontSize: 14,
              color: textSecondaryColor,
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 24),
          ElevatedButton.icon(
            onPressed: _loadDoctorIdAndFetch,
            style: ElevatedButton.styleFrom(
              backgroundColor: primaryColor,
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 16),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
              elevation: 4,
            ),
            icon: const Icon(Icons.refresh, size: 20),
            label: Text(
              'Try Again',
              style: GoogleFonts.lora(
                fontSize: 16,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final filteredAppointments = _getFilteredAppointments();

    filteredAppointments.sort((a, b) {
      final Map<String, dynamic> appointmentA = Map<String, dynamic>.from(a);
      final Map<String, dynamic> appointmentB = Map<String, dynamic>.from(b);

      final dateA = appointmentA['medical_day'] != null ? DateTime.parse(appointmentA['medical_day'].toString()) : DateTime(1970);
      final dateB = appointmentB['medical_day'] != null ? DateTime.parse(appointmentB['medical_day'].toString()) : DateTime(1970);
      final dateComparison = dateA.compareTo(dateB);
      if (dateComparison == 0) {
        final slotA = appointmentA['slot'] ?? 0;
        final slotB = appointmentB['slot'] ?? 0;
        return slotA.compareTo(slotB);
      }
      return dateComparison;
    });

    return Scaffold(
      backgroundColor: backgroundColor,
      body: Column(
        children: [
          SizedBox(
            height: 80,
            child: _buildHeader(),
          ),
          SizedBox(
            height: 70,
            child: _buildFilterButtons(),
          ),
          Expanded(
            child: ClipRect(
              child: _isLoading
                  ? Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    CircularProgressIndicator(
                      color: primaryColor,
                      strokeWidth: 3,
                    ),
                    const SizedBox(height: 16),
                    Text(
                      'Loading appointments...',
                      style: GoogleFonts.lora(
                        fontSize: 16,
                        color: textSecondaryColor,
                      ),
                    ),
                  ],
                ),
              )
                  : _errorMessage != null
                  ? RefreshIndicator(
                onRefresh: _refreshAppointments,
                color: primaryColor,
                child: _buildErrorState(),
              )
                  : filteredAppointments.isEmpty
                  ? RefreshIndicator(
                onRefresh: _refreshAppointments,
                color: primaryColor,
                child: _buildEmptyState(),
              )
                  : RefreshIndicator(
                onRefresh: _refreshAppointments,
                color: primaryColor,
                child: ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: filteredAppointments.length,
                  itemBuilder: (context, index) {
                    return _buildAppointmentCard(
                      filteredAppointments[index],
                      index,
                    );
                  },
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  String _getEmptyMessage() {
    switch (_currentFilter) {
      case FilterType.today:
        return 'No appointments today';
      case FilterType.thisMonth:
        return 'No appointments this month';
      case FilterType.thisYear:
        return 'No appointments this year';
    }
  }
}