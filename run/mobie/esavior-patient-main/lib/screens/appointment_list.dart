import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;

const primaryColor = Colors.blue;
const whiteColor = Color.fromARGB(255, 255, 255, 255);
const blackColor = Color.fromARGB(255, 0, 0, 0);
const blueColor = Color.fromARGB(255, 33, 150, 233);

class AppointmentList extends StatefulWidget {
  final bool isLoggedIn;
  final Function onLogout;
  final int? patientId;

  AppointmentList({
    required this.isLoggedIn,
    required this.onLogout,
    this.patientId,
  });

  @override
  _AppointmentListState createState() => _AppointmentListState();
}

class _AppointmentListState extends State<AppointmentList> {
  List<dynamic> appointments = [];
  List<dynamic> allAppointments = []; // Store all appointments
  int currentPage = 0;
  int appointmentsPerPage = 5;
  bool isLoading = false;

  // Filter variables
  DateTime? startDate;
  DateTime? endDate;
  String? selectedStatus;
  bool isDefaultView = true; // Track if we're in default view
  bool showFilters = false; // Add this line

  // Status options
  final List<String> statusOptions = ['All', 'PENDING', 'CANCELLED', 'COMPLETED'];

  String getSlotTime(int slot) {
    switch (slot) {
      case 1:
        return "08:00 AM - 09:00 AM";
      case 2:
        return "09:00 AM - 10:00 AM";
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
        return "Unknown Slot";
    }
  }

  @override
  void initState() {
    super.initState();
    fetchPatientData();
  }

  // Fetch patient data
  Future<void> fetchPatientData() async {
    setState(() {
      isLoading = true;
    });
    final url = Uri.parse(
        'http://10.0.2.2:8081/api/v1/patients/search?patient_id=${widget.patientId}');
    try {
      final response = await http.get(url);
      if (response.statusCode == 200) {
        var patientData = json.decode(response.body);
        if (patientData.isNotEmpty) {
          List<dynamic> fetchedAppointments = patientData[0]['appointmentsList'] ?? [];

          setState(() {
            allAppointments = fetchedAppointments;
          });

          // Apply default filter (future appointments)
          applyDefaultFilter();
        }
      } else {
        print('Error fetching patient data! Status Code: ${response.statusCode}');
      }
    } catch (error) {
      print('Error: $error');
    }
    setState(() {
      isLoading = false;
    });
  }

  // Apply default filter (future appointments from today onwards)
  void applyDefaultFilter() {
    DateTime today = DateTime.now();
    DateTime todayDateOnly = DateTime(today.year, today.month, today.day);

    List<dynamic> futureAppointments = allAppointments.where((appointment) {
      String medicalDayStr = appointment['medical_day'] ?? '';
      if (medicalDayStr.isEmpty) return false;

      try {
        DateTime medicalDay = DateTime.parse(medicalDayStr);
        DateTime medicalDayOnly = DateTime(medicalDay.year, medicalDay.month, medicalDay.day);

        return medicalDayOnly.isAtSameMomentAs(todayDateOnly) ||
            medicalDayOnly.isAfter(todayDateOnly);
      } catch (e) {
        print('Error parsing medical_day: $medicalDayStr');
        return false;
      }
    }).toList();

    // Sort by medical_day and slot
    futureAppointments.sort((a, b) {
      try {
        DateTime medicalDayA = DateTime.parse(a['medical_day'] ?? '');
        DateTime medicalDayB = DateTime.parse(b['medical_day'] ?? '');

        int dateComparison = medicalDayA.compareTo(medicalDayB);
        if (dateComparison != 0) {
          return dateComparison;
        }

        int slotA = a['slot'] ?? 0;
        int slotB = b['slot'] ?? 0;
        return slotA.compareTo(slotB);
      } catch (e) {
        print('Error sorting appointments: $e');
        return 0;
      }
    });

    setState(() {
      appointments = futureAppointments;
      currentPage = 0;
    });
  }

  // Apply custom filters
  void applyFilters() {
    List<dynamic> filteredAppointments = List.from(allAppointments);

    // Filter by date range
    if (startDate != null || endDate != null) {
      filteredAppointments = filteredAppointments.where((appointment) {
        String medicalDayStr = appointment['medical_day'] ?? '';
        if (medicalDayStr.isEmpty) return false;

        try {
          DateTime medicalDay = DateTime.parse(medicalDayStr);
          DateTime medicalDayOnly = DateTime(medicalDay.year, medicalDay.month, medicalDay.day);

          bool afterStart = startDate == null || medicalDayOnly.isAtSameMomentAs(startDate!) || medicalDayOnly.isAfter(startDate!);
          bool beforeEnd = endDate == null || medicalDayOnly.isAtSameMomentAs(endDate!) || medicalDayOnly.isBefore(endDate!);

          return afterStart && beforeEnd;
        } catch (e) {
          print('Error parsing medical_day: $medicalDayStr');
          return false;
        }
      }).toList();
    }

    // Filter by status
    if (selectedStatus != null && selectedStatus != 'All') {
      filteredAppointments = filteredAppointments.where((appointment) {
        return appointment['status']?.toString().toUpperCase() == selectedStatus!.toUpperCase();
      }).toList();
    }

    // Sort filtered appointments
    filteredAppointments.sort((a, b) {
      try {
        DateTime medicalDayA = DateTime.parse(a['medical_day'] ?? '');
        DateTime medicalDayB = DateTime.parse(b['medical_day'] ?? '');

        int dateComparison = medicalDayA.compareTo(medicalDayB);
        if (dateComparison != 0) {
          return dateComparison;
        }

        int slotA = a['slot'] ?? 0;
        int slotB = b['slot'] ?? 0;
        return slotA.compareTo(slotB);
      } catch (e) {
        print('Error sorting appointments: $e');
        return 0;
      }
    });

    setState(() {
      appointments = filteredAppointments;
      currentPage = 0;
      isDefaultView = false;
    });
  }

  // Reset to default view
  void resetToDefault() {
    setState(() {
      startDate = null;
      endDate = null;
      selectedStatus = null;
      isDefaultView = true;
    });
    applyDefaultFilter();
  }

  // Date picker helper
  Future<void> _selectDate(BuildContext context, bool isStartDate) async {
    final DateTime? picked = await showDatePicker(
      context: context,
      initialDate: isStartDate ? startDate ?? DateTime.now() : endDate ?? DateTime.now(),
      firstDate: DateTime(2020),
      lastDate: DateTime(2030),
    );
    if (picked != null) {
      setState(() {
        if (isStartDate) {
          startDate = picked;
        } else {
          endDate = picked;
        }
      });
    }
  }

  List<dynamic> getPaginatedAppointments() {
    int startIndex = currentPage * appointmentsPerPage;
    int endIndex = (startIndex + appointmentsPerPage).clamp(0, appointments.length);
    return appointments.sublist(startIndex, endIndex);
  }

  String formatDisplayDate(String dateStr) {
    try {
      DateTime date = DateTime.parse(dateStr);
      DateTime now = DateTime.now();
      DateTime today = DateTime(now.year, now.month, now.day);
      DateTime tomorrow = today.add(Duration(days: 1));
      DateTime appointmentDate = DateTime(date.year, date.month, date.day);

      if (appointmentDate.isAtSameMomentAs(today)) {
        return "Today (${dateStr.substring(0, 10)})";
      } else if (appointmentDate.isAtSameMomentAs(tomorrow)) {
        return "${dateStr.substring(0, 10)}";
      } else {
        return dateStr.substring(0, 10);
      }
    } catch (e) {
      return dateStr.substring(0, 10);
    }
  }

  Widget buildFilterSection() {
    if (!showFilters) return const SizedBox.shrink();

    return Container(
      padding: const EdgeInsets.all(16),
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      decoration: BoxDecoration(
        color: Colors.grey[50],
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.grey[300]!),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Filter Options',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  color: primaryColor,
                ),
              ),
              if (!isDefaultView)
                TextButton.icon(
                  onPressed: resetToDefault,
                  icon: const Icon(Icons.refresh, size: 18),
                  label: const Text('Reset'),
                  style: TextButton.styleFrom(
                    foregroundColor: primaryColor,
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  ),
                ),
            ],
          ),
          const SizedBox(height: 12),

          // Date Range Selection
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('From Date:', style: TextStyle(fontWeight: FontWeight.w500)),
                    const SizedBox(height: 4),
                    InkWell(
                      onTap: () => _selectDate(context, true),
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                        decoration: BoxDecoration(
                          border: Border.all(color: Colors.grey[400]!),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              startDate != null
                                  ? '${startDate!.day}/${startDate!.month}/${startDate!.year}'
                                  : 'Select date',
                              style: TextStyle(
                                color: startDate != null ? Colors.black : Colors.grey[600],
                              ),
                            ),
                            const Icon(Icons.calendar_today, size: 16),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('To Date:', style: TextStyle(fontWeight: FontWeight.w500)),
                    const SizedBox(height: 4),
                    InkWell(
                      onTap: () => _selectDate(context, false),
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                        decoration: BoxDecoration(
                          border: Border.all(color: Colors.grey[400]!),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              endDate != null
                                  ? '${endDate!.day}/${endDate!.month}/${endDate!.year}'
                                  : 'Select date',
                              style: TextStyle(
                                color: endDate != null ? Colors.black : Colors.grey[600],
                              ),
                            ),
                            const Icon(Icons.calendar_today, size: 16),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),

          const SizedBox(height: 12),

          // Status Filter
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('Status:', style: TextStyle(fontWeight: FontWeight.w500)),
              const SizedBox(height: 4),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12),
                decoration: BoxDecoration(
                  border: Border.all(color: Colors.grey[400]!),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: DropdownButtonHideUnderline(
                  child: DropdownButton<String>(
                    value: selectedStatus ?? 'All',
                    isExpanded: true,
                    items: statusOptions.map((String status) {
                      return DropdownMenuItem<String>(
                        value: status,
                        child: Text(status),
                      );
                    }).toList(),
                    onChanged: (String? newValue) {
                      setState(() {
                        selectedStatus = newValue == 'All' ? null : newValue;
                      });
                    },
                  ),
                ),
              ),
            ],
          ),

          const SizedBox(height: 12),

          // Apply Filter Button
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: applyFilters,
              style: ElevatedButton.styleFrom(
                backgroundColor: primaryColor,
                foregroundColor: whiteColor,
                padding: const EdgeInsets.symmetric(vertical: 12),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
              ),
              child: const Text('Apply Filters'),
            ),
          ),
        ],
      ),
    );
  }

  Widget buildAppointments() {
    var paginatedAppointments = getPaginatedAppointments();

    return ListView.builder(
      itemCount: paginatedAppointments.length,
      itemBuilder: (context, index) {
        var appointment = paginatedAppointments[index];
        var doctorInfo =
        (appointment['doctor'] is List && appointment['doctor'].isNotEmpty)
            ? appointment['doctor'][0]
            : null;

        int slot = appointment['slot'] ?? 0;
        String slotTime = getSlotTime(slot);
        String medicalDay = appointment['medical_day'] ?? '01-01-2026';
        String displayDate = formatDisplayDate(medicalDay);

        return Card(
          margin: const EdgeInsets.symmetric(vertical: 8, horizontal: 16),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(15),
            side: const BorderSide(
              color: Colors.black54,
              width: 1,
            ),
          ),
          child: Container(
            decoration: BoxDecoration(
              color: whiteColor,
              borderRadius: BorderRadius.circular(15),
            ),
            child: Stack(
              children: [
                Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        "${appointment['appointment_date']}",
                        style: const TextStyle(
                            fontSize: 18,
                            color: primaryColor,
                            fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        "Doctor: ${doctorInfo != null ? doctorInfo['doctor_name'] : 'Doctor'}",
                        style: const TextStyle(
                            fontSize: 16,
                            color: blackColor,
                            fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        "Appointment Date: $displayDate",
                        style: const TextStyle(
                            fontSize: 18,
                            color: blackColor,
                            fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        "Appointment Time: $slotTime",
                        style: const TextStyle(
                            fontSize: 16,
                            color: blackColor,
                            fontWeight: FontWeight.bold),
                      ),
                      Text(
                        "Note: ${appointment['note'] ?? ''}",
                        style: const TextStyle(
                          fontSize: 18,
                          color: blackColor,
                          fontWeight: FontWeight.bold,
                        ),
                      ),

                    ],
                  ),
                ),
                Positioned(
                  top: 8,
                  right: 8,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                    decoration: BoxDecoration(
                      color: _getStatusColor(appointment['status'] ?? 'PENDING').withOpacity(0.1),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(
                        color: _getStatusColor(appointment['status'] ?? 'PENDING'),
                        width: 1,
                      ),
                    ),
                    child: Text(
                      " ${appointment['status'] ?? 'PENDING'}",
                      style: TextStyle(
                          fontSize: 14,
                          color: _getStatusColor(appointment['status'] ?? 'PENDING'),
                          fontWeight: FontWeight.bold),
                    ),
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Color _getStatusColor(String status) {
    switch (status.toUpperCase()) {
      case 'PENDING':
        return Colors.orange;
      case 'CANCELLED':
        return Colors.red;
      case 'COMPLETED':
        return Colors.blue;
      default:
        return Colors.grey;
    }
  }

  Widget buildPaginationControls() {
    int totalPages = (appointments.length / appointmentsPerPage).ceil();
    if (totalPages <= 1) return const SizedBox.shrink();

    return Container(
      padding: const EdgeInsets.symmetric(vertical: 16),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          IconButton(
            icon: const Icon(
              Icons.arrow_back,
              color: Colors.black54,
            ),
            onPressed: currentPage > 0
                ? () {
              setState(() {
                currentPage--;
              });
            }
                : null,
          ),
          Text(
            'Page ${currentPage + 1} of $totalPages',
            style: const TextStyle(
                color: primaryColor, fontSize: 14, fontWeight: FontWeight.bold),
          ),
          IconButton(
            icon: const Icon(
              Icons.arrow_forward,
              color: Colors.black54,
            ),
            onPressed: currentPage < totalPages - 1
                ? () {
              setState(() {
                currentPage++;
              });
            }
                : null,
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (!widget.isLoggedIn) {
      Future.delayed(Duration.zero, () {
        Navigator.pushReplacementNamed(context, '/login');
      });
    }
    return Scaffold(
      backgroundColor: whiteColor,
      appBar: AppBar(
        backgroundColor: primaryColor,
        leading: IconButton(
          icon: const Icon(
            Icons.arrow_back,
            color: whiteColor,
            size: 25,
          ),
          onPressed: () {
            Navigator.pop(context);
          },
        ),
        actions: [
          IconButton(
            icon: Icon(
              showFilters ? Icons.filter_list_off : Icons.filter_list,
              color: whiteColor,
              size: 25,
            ),
            onPressed: () {
              setState(() {
                showFilters = !showFilters;
              });
            },
          ),
        ],
      ),
      body: isLoading
          ? const Center(
        child: CircularProgressIndicator(
          valueColor: AlwaysStoppedAnimation<Color>(primaryColor),
        ),
      )
          : Column(
        children: [
          const SizedBox(height: 30),
          Container(
            width: double.infinity,
            decoration: const BoxDecoration(
              color: whiteColor,
            ),
            child: const Center(
              child: Text(
                'Booked Appointment',
                textAlign: TextAlign.center,
                style: TextStyle(
                    color: primaryColor,
                    fontSize: 22,
                    fontWeight: FontWeight.bold),
              ),
            ),
          ),
          const SizedBox(height: 20),

          // Filter Section
          buildFilterSection(),

          Container(
            height: 10,
            color: primaryColor.withOpacity(0.05),
          ),
          const SizedBox(height: 10),
          appointments.isEmpty
              ? Expanded(
              child: Center(
                child: Text(
                  isDefaultView
                      ? 'No booked appointment'
                      : 'No appointments found for selected filters',
                  style: const TextStyle(
                      color: blackColor,
                      fontWeight: FontWeight.bold,
                      fontSize: 18),
                ),
              ))
              : Expanded(
            child: buildAppointments(),
          ),
          buildPaginationControls(),
        ],
      ),
    );
  }
}