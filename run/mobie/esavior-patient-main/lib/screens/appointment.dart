import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'dart:async';
import 'dart:math';
import 'paypal_payment_service.dart';


const primaryColor = Colors.blue;
const whiteColor = Color.fromARGB(255, 255, 255, 255);
const blackColor = Color.fromARGB(255, 0, 0, 0);
const blueColor = Color.fromARGB(255, 33, 150, 233);

class Appointment extends StatefulWidget {
  final bool isLoggedIn;
  final VoidCallback onLogout;
  final int? patientId;
  final VoidCallback onNavigateToHomePage;

  const Appointment(
      {super.key,
        required this.isLoggedIn,
        required this.onLogout,
        this.patientId,
        required this.onNavigateToHomePage});

  @override
  _AppointmentState createState() => _AppointmentState();
}

class StepBar extends StatelessWidget {
  final int currentStep;
  final int totalSteps;
  final List<String> stepLabels;

  const StepBar({
    super.key,
    required this.currentStep,
    required this.totalSteps,
    required this.stepLabels,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: List.generate(totalSteps, (index) {
            return Expanded(
              child: Column(
                children: [
                  Container(
                    margin: const EdgeInsets.symmetric(horizontal: 4.0),
                    height: 8.0,
                    decoration: BoxDecoration(
                      color: index + 1 < currentStep
                          ? Colors.green
                          : index + 1 == currentStep
                          ? primaryColor
                          : Colors.black54,
                      borderRadius: BorderRadius.circular(4.0),
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    stepLabels[index],
                    style: TextStyle(
                      color: index + 1 < currentStep
                          ? Colors.green
                          : index + 1 == currentStep
                          ? primaryColor
                          : Colors.black54,
                      fontSize: 14.0,
                    ),
                    textAlign: TextAlign.center,
                  ),
                ],
              ),
            );
          }),
        ),
      ],
    );
  }
}

class _AppointmentState extends State<Appointment> {
  int step = 1;
  bool showSuccess = false;
  bool isProcessingPayment = false;

  final _patientNameController = TextEditingController();
  final _patientEmailController = TextEditingController();
  final _patientPhoneController = TextEditingController();
  final _patientNoteController = TextEditingController();

  String? finalNote;

  List departments = [];
  List availableDoctors = [];
  String? selectedDepartment;
  String? selectedDoctor;
  String? selectedDay;
  String? selectedTimeSlot;
  Timer? _timer;
  bool isDateSelected = false;
  bool isTimeSelected = false;
  bool isLoading = false;
  bool isLoadingDepartment = false;
  bool isLoadingDoctors = false;
  bool isLoadingPatientData = false; // New loading state for patient data
  bool isPatientDataLoaded = false; // Track if patient data was loaded
  final _formKeyStep3 = GlobalKey<FormState>();
  String selectedPaymentMethod = "";
  TextEditingController _departmentSearchController = TextEditingController();
  List filteredDepartments = [];
  bool showDepartmentDropdown = false;
  FocusNode _departmentFocusNode = FocusNode();
  void _filterDepartments(String query) {
    setState(() {
      if (query.isEmpty) {
        filteredDepartments = departments;
      } else {
        filteredDepartments = departments.where((department) {
          return department['department_name']
              .toString()
              .toLowerCase()
              .contains(query.toLowerCase());
        }).toList();
      }
    });
  }

  // Danh sách các khung giờ
  List<Map<String, dynamic>> timeSlots = [
    {
      'label': '08:00 AM - 09:00 AM',
      'value': 1,
      'start': '08:00',
      'end': '09:00'
    },
    {
      'label': '09:00 AM - 10:00 AM',
      'value': 2,
      'start': '09:00',
      'end': '10:00'
    },
    {
      'label': '10:00 AM - 11:00 AM',
      'value': 3,
      'start': '10:00',
      'end': '11:00'
    },
    {
      'label': '11:00 AM - 12:00 PM',
      'value': 4,
      'start': '11:00',
      'end': '12:00'
    },
    {
      'label': '01:00 PM - 02:00 PM',
      'value': 5,
      'start': '13:00',
      'end': '14:00'
    },
    {
      'label': '02:00 PM - 03:00 PM',
      'value': 6,
      'start': '14:00',
      'end': '15:00'
    },
    {
      'label': '03:00 PM - 04:00 PM',
      'value': 7,
      'start': '15:00',
      'end': '16:00'
    },
    {
      'label': '04:00 PM - 05:00 PM',
      'value': 8,
      'start': '16:00',
      'end': '17:00'
    }
  ];

  @override
  void initState() {
    super.initState();
    fetchDepartments();


    // Initialize filtered departments
    filteredDepartments = departments;

    // Add listener to handle outside taps
    _departmentFocusNode.addListener(() {
      if (!_departmentFocusNode.hasFocus) {
        setState(() {
          showDepartmentDropdown = false;
        });
      }
    });
  }

  // NEW: Load patient data automatically when moving to step 2
  Future<void> _loadPatientData() async {
    if (!widget.isLoggedIn || widget.patientId == null) {
      return;
    }

    setState(() {
      isLoadingPatientData = true;
    });

    try {
      final url = Uri.parse(
          'http://10.0.2.2:8081/api/v1/patients/search?patient_id=${widget.patientId}');

      final response = await http.get(url);

      if (response.statusCode == 200) {
        var patientData = json.decode(response.body);

        if (patientData.isNotEmpty) {
          var patient = patientData[0];

          // Auto-populate form fields
          setState(() {
            _patientNameController.text = patient['patient_name'] ?? '';
            _patientEmailController.text = patient['patient_email'] ?? '';
            _patientPhoneController.text = patient['patient_phone'] ?? '';
            isPatientDataLoaded = true;
          });

          // Show success message
          showTemporaryMessage(context, "Patient information loaded automatically!");
        }
      } else {
        showTemporaryMessage(context, "Failed to load patient data");
      }
    } catch (error) {
      showTemporaryMessage(context, "Error loading patient data: $error");
      print('Error loading patient data: $error');
    }

    setState(() {
      isLoadingPatientData = false;
    });
  }

  String generatePassword() {
    const String lowerCase = 'abcdefghijklmnopqrstuvwxyz';
    const String upperCase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const String numbers = '0123456789';
    const String specialCharacters = '@#\$%^&*()_+!';

    const String allCharacters =
        lowerCase + upperCase + numbers + specialCharacters;
    final Random random = Random();

    String password = List.generate(8, (index) {
      return allCharacters[random.nextInt(allCharacters.length)];
    }).join();

    return password;
  }

  OverlayEntry? currentOverlayEntry;

  void showTemporaryMessage(BuildContext context, String message) {
    if (currentOverlayEntry != null) {
      currentOverlayEntry!.remove();
    }

    currentOverlayEntry = OverlayEntry(
      builder: (context) => Center(
        child: Material(
          color: Colors.transparent,
          child: Container(
            padding: const EdgeInsets.all(12.0),
            margin: const EdgeInsets.only(left: 12, right: 12),
            decoration: BoxDecoration(
              color: blackColor.withOpacity(0.7),
              borderRadius: BorderRadius.circular(15),
            ),
            child: Text(
              message,
              style: const TextStyle(
                  color: whiteColor,
                  fontSize: 16.0,
                  fontWeight: FontWeight.bold),
            ),
          ),
        ),
      ),
    );

    Overlay.of(context).insert(currentOverlayEntry!);

    Future.delayed(const Duration(seconds: 3), () {
      currentOverlayEntry?.remove();
      currentOverlayEntry = null;
    });
  }

  // Lấy danh sách khoa
  Future<void> fetchDepartments() async {
    setState(() {
      isLoadingDepartment = true;
    });
    final url = Uri.parse('http://10.0.2.2:8081/api/v1/departments/list');
    try {
      final response = await http.get(url);
      if (response.statusCode == 200) {
        setState(() {
          departments = json.decode(response.body);
          filteredDepartments = departments; // Initialize filtered list
        });
      } else {
        print('Lỗi khi lấy danh sách khoa!');
      }
    } catch (error) {
      print('Lỗi: $error');
    }
    setState(() {
      isLoadingDepartment = false;
    });
  }

  // Lấy danh sách bác sĩ có slot trống
  Future<void> fetchAvailableDoctors(String departmentId, String date, String timeSlot) async {
    setState(() {
      isLoadingDoctors = true;
    });
    final url = Uri.parse(
        'http://10.0.2.2:8081/api/v1/appointments/available-doctors?departmentId=$departmentId&date=$date&timeSlot=$timeSlot');
    try {
      final response = await http.get(url);

      setState(() {
        availableDoctors = json.decode(response.body);
      });

    } catch (error) {
      print('Error: $error');
      setState(() {
        availableDoctors = [];
      });
    }
    setState(() {
      isLoadingDoctors = false;
    });
  }

  // Hàm reset date selection
  void resetDateSelection() {
    setState(() {
      selectedDay = null;
      isDateSelected = false;
      selectedTimeSlot = null;
      isTimeSelected = false;
      selectedDepartment = null;
      selectedDoctor = null;
      availableDoctors = [];
    });
  }

  // Hàm reset department selection
  void resetDepartmentSelection() {
    setState(() {
      selectedDepartment = null;
      selectedDoctor = null;
      availableDoctors = [];
    });
  }

  // Build time slots UI
  Widget buildTimeSlots() {
    return Container(
      width: double.infinity,
      margin: const EdgeInsets.only(top: 20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Select Time Slot',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: blackColor,
            ),
          ),
          const SizedBox(height: 10),
          GridView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 2,
              childAspectRatio: 3,
              crossAxisSpacing: 10,
              mainAxisSpacing: 10,
            ),
            itemCount: timeSlots.length,
            itemBuilder: (context, index) {
              final slot = timeSlots[index];
              final isSelected = selectedTimeSlot == slot['value'].toString();

              return GestureDetector(
                onTap: () {
                  setState(() {
                    selectedTimeSlot = slot['value'].toString();
                    isTimeSelected = true;
                    // Reset selections when time changes
                    selectedDepartment = null;
                    selectedDoctor = null;
                    availableDoctors = [];
                  });
                },
                child: Container(
                  decoration: BoxDecoration(
                    color: isSelected ? primaryColor : whiteColor,
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(
                      color: isSelected ? primaryColor : Colors.grey.shade300,
                      width: 1,
                    ),
                  ),
                  child: Center(
                    child: Text(
                      slot['label'],
                      style: TextStyle(
                        color: isSelected ? whiteColor : blackColor,
                        fontSize: 14,
                        fontWeight: FontWeight.bold,
                      ),
                      textAlign: TextAlign.center,
                    ),
                  ),
                ),
              );
            },
          ),
        ],
      ),
    );
  }

  // Handle appointment submission after successful payment
  void handleAppointmentSubmit(String paymentMethod) async {
    setState(() {
      isLoading = true;
    });

    try {
      // Get selected doctor details
      final selectedDoctorData = availableDoctors.firstWhere(
            (doc) => doc['doctor_id'].toString() == selectedDoctor,
      );

      // Random staff_id from 1-20
      final Random random = Random();
      final randomStaffId = random.nextInt(20) + 1;

      // Prepare appointment data
      final appointmentData = {
        'patient_name': _patientNameController.text,
        'patient_email': _patientEmailController.text,
        'patient_phone': _patientPhoneController.text,
        'note' : _patientNoteController.text,
        'doctor_id': int.parse(selectedDoctor!),
        'department_id': int.parse(selectedDepartment!),
        'medical_day': selectedDay!.substring(0, 10),
        'slot': int.parse(selectedTimeSlot!),
        'patient_password': generatePassword(),
        'status': 'PENDING',
        'appointment_date': DateTime.now().toIso8601String().substring(0, 10),
        // Sử dụng payment method thực tế đã chọn
        'price': selectedDoctorData['doctor_price'] ?? 50,
        'payment_name': paymentMethod, // CREDIT_CARD hoặc CASH
        'staff_id': randomStaffId,
      };

      // Make API call to book appointment
      final url = Uri.parse('http://10.0.2.2:8081/api/v1/appointments/insert');
      final response = await http.post(
        url,
        headers: {
          'Content-Type': 'application/json',
        },
        body: json.encode(appointmentData),
      );

      if (response.statusCode == 200 || response.statusCode == 201) {
        setState(() {
          showSuccess = true;
          isLoading = false;
          selectedPaymentMethod = paymentMethod; // Lưu payment method đã chọn
        });

        showTemporaryMessage(context, "Appointment booked successfully!");
      } else {
        setState(() {
          isLoading = false;
        });

        String errorMessage = 'Failed to book appointment. Please try again.';
        if (response.statusCode == 400) {
          errorMessage = 'Invalid appointment data. Please check your information.';
        } else if (response.statusCode == 409) {
          errorMessage = 'This time slot is no longer available. Please select another time.';
        }

        showTemporaryMessage(context, errorMessage);
      }
    } catch (error) {
      setState(() {
        isLoading = false;
      });

      showTemporaryMessage(context, "Network error. Please check your connection and try again.");
      print('Error booking appointment: $error');
    }
  }

  // Handle PayPal payment
  void handlePayPalPayment() {
    if (availableDoctors.isEmpty || selectedDoctor == null) {
      showTemporaryMessage(context, "Please select a doctor first.");
      return;
    }

    final selectedDoctorData = availableDoctors.firstWhere(
          (doc) => doc['doctor_id'].toString() == selectedDoctor,
    );

    final amount = selectedDoctorData['doctor_price']?.toString() ?? '50';

    setState(() {
      isProcessingPayment = true;
      selectedPaymentMethod = "CREDIT_CARD"; // Set to CREDIT_CARD to show loading on PayPal button
    });

    PayPalPaymentService.makePayment(
      context: context,
      amount: amount,
      currency: 'USD',
      onSuccess: (params) {
        setState(() {
          isProcessingPayment = false;
        });

        // Confirm payment with backend
        confirmPaymentWithBackend();

        // Submit appointment với CREDIT_CARD
        handleAppointmentSubmit("CREDIT_CARD");

        showTemporaryMessage(context, "PayPal payment successful! Booking appointment...");
      },
      onError: (error) {
        setState(() {
          isProcessingPayment = false;
        });
        showTemporaryMessage(context, "Payment failed: $error");
      },
      onCancel: () {
        setState(() {
          isProcessingPayment = false;
        });
        showTemporaryMessage(context, "Payment cancelled.");
      },
    );
  }

  // Handle Cash payment
  void handleCashPayment() {
    if (availableDoctors.isEmpty || selectedDoctor == null) {
      showTemporaryMessage(context, "Please select a doctor first.");
      return;
    }

    // Show confirmation dialog
    showDialog(
      context: context,
      builder: (BuildContext context) {
        final selectedDoctorData = availableDoctors.firstWhere(
              (doc) => doc['doctor_id'].toString() == selectedDoctor,
        );
        final amount = selectedDoctorData['doctor_price']?.toString() ?? '50';

        return AlertDialog(
          backgroundColor: Colors.white,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(15),
          ),
          title: Row(
            children: [
              Icon(
                Icons.money,
                color: Colors.green.shade600,
                size: 24,
              ),
              const SizedBox(width: 8),
              const Text(
                'Cash Payment',
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                  color: blackColor,
                ),
              ),
              const Spacer(), // Đẩy nút X về bên phải
              GestureDetector(
                onTap: () => Navigator.of(context).pop(), // Đóng dialog
                child: const Icon(
                  Icons.close,
                  color: Colors.grey,
                  size: 30,
                ),
              ),
            ],
          ),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Please confirm your cash payment:',
                style: TextStyle(
                  fontSize: 16,
                  color: blackColor,
                ),
              ),
              const SizedBox(height: 15),
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.green.shade50,
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: Colors.green.shade200),
                ),
                child: Column(
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text(
                          'Amount to Pay:',
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w600,
                            color: blackColor,
                          ),
                        ),
                        Text(
                          '\$$amount',
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                            color: Colors.green.shade700,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 15),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.orange.shade50,
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: Colors.orange.shade200),
                ),
                child: Row(
                  children: [
                    Icon(
                      Icons.info_outline,
                      color: Colors.orange.shade700,
                      size: 20,
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        'Please bring exact amount to your appointment.',
                        style: TextStyle(
                          color: Colors.orange.shade700,
                          fontSize: 14,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          actions: [
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.red.shade600,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
              ),
              onPressed: () {
                Navigator.of(context).pop(); // Close dialog
              },
              child: const Text(
                'Cancel',
                style: TextStyle(
                  color: whiteColor,
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.green.shade600,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
              ),
              onPressed: () {
                Navigator.of(context).pop(); // Close dialog

                // Process cash payment
                setState(() {
                  isProcessingPayment = true;
                  selectedPaymentMethod = "CASH"; // Set to CASH to show loading on cash button
                });

                // Simulate processing time
                Future.delayed(const Duration(seconds: 2), () {
                  setState(() {
                    isProcessingPayment = false;
                  });

                  // Submit appointment với CASH
                  handleAppointmentSubmit("CASH");

                  showTemporaryMessage(context, "Cash payment confirmed! Booking appointment...");
                });
              },
              child: const Text(
                'Pay',
                style: TextStyle(
                  color: whiteColor,
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ],
        );
      },
    );
  }

  // Confirm payment with backend
  Future<void> confirmPaymentWithBackend() async {
    try {
      final url = Uri.parse('http://10.0.2.2:8081/api/v1/appointments/confirm-payment');
      await http.post(
        url,
        headers: {
          'Content-Type': 'application/json',
        },
        body: json.encode({
          'doctorId': selectedDoctor,
          'date': selectedDay!.substring(0, 10),
          'time': selectedTimeSlot,
        }),
      );
    } catch (error) {
      print('Error confirming payment: $error');
    }
  }

  // Bước 1: Chọn ngày và giờ (keeping original code)
  Widget buildFormStep1() {
    return Column(
      children: [
        Container(
          width: double.infinity,
          margin: const EdgeInsets.only(top: 20),
          alignment: Alignment.center,
          child: const Text(
            'Book Appointment',
            style: TextStyle(
              fontSize: 22,
              fontWeight: FontWeight.bold,
              color: primaryColor,
            ),
          ),
        ),
        const SizedBox(height: 20),

        // Date Selection with X button
        Container(
          width: double.infinity,
          margin: const EdgeInsets.only(top: 20.0),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(15),
            border: Border.all(
              color: Colors.black54,
              width: 1.0,
            ),
          ),
          child: InkWell(
            onTap: () async {
              final selected = await showDatePicker(
                context: context,
                initialDate: DateTime.now(),
                firstDate: DateTime.now(),
                lastDate: DateTime.now().add(const Duration(days: 30)),
                builder: (BuildContext context, Widget? child) {
                  return Theme(
                    data: ThemeData.light().copyWith(
                      primaryColor: primaryColor,
                      hintColor: primaryColor,
                      colorScheme: const ColorScheme.light(primary: primaryColor),
                      buttonTheme: const ButtonThemeData(
                          textTheme: ButtonTextTheme.primary),
                    ),
                    child: child!,
                  );
                },
              );
              if (selected != null) {
                setState(() {
                  selectedDay = selected.toIso8601String();
                  isDateSelected = true;
                  // Reset selections when date changes
                  selectedTimeSlot = null;
                  isTimeSelected = false;
                  selectedDepartment = null;
                  selectedDoctor = null;
                  availableDoctors = [];
                });
              }
            },
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 12.0, vertical: 10.0),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(
                    child: Text(
                      selectedDay != null
                          ? selectedDay!.substring(0, 10)
                          : 'Select Date',
                      style: TextStyle(
                          color: isDateSelected ? blackColor : Colors.black54,
                          fontSize: 16.0,
                          fontWeight: FontWeight.bold),
                    ),
                  ),
                  Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      if (isDateSelected)
                        GestureDetector(
                          onTap: resetDateSelection,
                          child: Container(
                            padding: const EdgeInsets.all(4),
                            child: const Icon(
                              Icons.close,
                              color: Colors.red,
                              size: 20,
                            ),
                          ),
                        ),
                      const SizedBox(width: 8),
                      const Icon(Icons.calendar_month_rounded, color: blackColor),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ),

        // Time Slots
        if (isDateSelected) buildTimeSlots(),

        // Department Dropdown with X button
        if (isDateSelected && selectedTimeSlot != null) ...[
          // const SizedBox(height: 20),

          // Department Search Field
          Container(
            width: double.infinity,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SizedBox(height: 20),
                const Text(
                  'Search Department',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: blackColor,
                  ),
                ),
                const SizedBox(height: 8),

                // Search Input Field
                Container(
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(15),
                    border: Border.all(color: Colors.black54, width: 1.0),
                  ),
                  child: TextFormField(
                    controller: _departmentSearchController,
                    focusNode: _departmentFocusNode,
                    style: const TextStyle(
                      color: blackColor,
                      fontSize: 16.0,
                      fontWeight: FontWeight.bold,
                    ),
                    decoration: InputDecoration(
                      prefixIcon: const Icon(Icons.search, color: Colors.black54),
                      suffixIcon: _departmentSearchController.text.isNotEmpty
                          ? GestureDetector(
                        onTap: () {
                          _departmentSearchController.clear();
                          setState(() {
                            selectedDepartment = null;
                            selectedDoctor = null;
                            availableDoctors = [];
                            showDepartmentDropdown = false;
                            filteredDepartments = departments;
                          });
                        },
                        child: const Icon(Icons.clear, color: Colors.red, size: 20,),

                      )

                          : null,
                      hintText: 'Search departments...',
                      hintStyle: const TextStyle(
                        color: Colors.black54,
                        fontSize: 16.0,
                        fontWeight: FontWeight.bold,
                      ),
                      border: InputBorder.none,
                      contentPadding: const EdgeInsets.symmetric(
                        horizontal: 16,
                        vertical: 12,
                      ),
                    ),
                    onChanged: (value) {
                      _filterDepartments(value);
                      setState(() {
                        showDepartmentDropdown = value.isNotEmpty;
                        selectedDepartment = null;
                        selectedDoctor = null;
                        availableDoctors = [];
                      });
                    },
                    onTap: () {
                      setState(() {
                        showDepartmentDropdown = true;
                        if (filteredDepartments.isEmpty) {
                          filteredDepartments = departments;
                        }
                      });
                    },
                  ),
                ),

                // Search Results Dropdown
                if (showDepartmentDropdown && filteredDepartments.isNotEmpty)
                  Container(
                    margin: const EdgeInsets.only(top: 4),
                    decoration: BoxDecoration(
                      color: whiteColor,
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: Colors.grey.shade300),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.grey.withOpacity(0.2),
                          spreadRadius: 1,
                          blurRadius: 4,
                          offset: const Offset(0, 2),
                        ),
                      ],
                    ),
                    constraints: const BoxConstraints(maxHeight: 200),
                    child: ListView.builder(
                      shrinkWrap: true,
                      itemCount: filteredDepartments.length,
                      itemBuilder: (context, index) {
                        final department = filteredDepartments[index];
                        return ListTile(
                          dense: true,
                          title: Text(
                            department['department_name'],
                            style: const TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.w600,
                              color: blackColor,
                            ),
                          ),

                          onTap: () {
                            setState(() {
                              selectedDepartment = department['department_id'].toString();
                              _departmentSearchController.text = department['department_name'];
                              showDepartmentDropdown = false;
                              selectedDoctor = null;
                              _departmentFocusNode.unfocus();

                              // Fetch available doctors for selected department
                              if (selectedDepartment != null && selectedDay != null && selectedTimeSlot != null) {
                                fetchAvailableDoctors(
                                    selectedDepartment!,
                                    selectedDay!.substring(0, 10),
                                    selectedTimeSlot!
                                );
                              }
                            });
                          },
                          trailing: selectedDepartment == department['department_id'].toString()
                              ? const Icon(Icons.check, color: Colors.green)
                              : null,
                        );
                      },
                    ),
                  ),

                // No results message
                if (showDepartmentDropdown && filteredDepartments.isEmpty)
                  Container(
                    margin: const EdgeInsets.only(top: 4),
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Colors.red.shade50,
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: Colors.red.shade200),
                    ),
                    child: Row(
                      children: [
                        Icon(Icons.search_off, color: Colors.red.shade600),
                        const SizedBox(width: 8),
                        Text(
                          'No departments found matching "${_departmentSearchController.text}"',
                          style: TextStyle(
                            color: Colors.red.shade600,
                            fontSize: 14,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ],
                    ),
                  ),


              ],
            ),
          ),
        ],

        // Available Doctors Grid (keeping original code)
        if (selectedDepartment != null && selectedDay != null && selectedTimeSlot != null) ...[
          const SizedBox(height: 20),
          Container(
            width: double.infinity,
            child: const Text(
              'Available Doctors',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: blackColor,
              ),
            ),
          ),
          const SizedBox(height: 10),

          if (isLoadingDoctors)
            const Center(
              child: CircularProgressIndicator(
                valueColor: AlwaysStoppedAnimation<Color>(primaryColor),
              ),
            )
          else if (availableDoctors.isEmpty)
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: Colors.red.shade50,
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: Colors.red.shade200),
              ),
              child: const Text(
                'No doctors available for the selected time slot.',
                style: TextStyle(
                  color: Colors.red,
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                ),
                textAlign: TextAlign.center,
              ),
            )
          else
            GridView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                childAspectRatio: 0.75,
                crossAxisSpacing: 10,
                mainAxisSpacing: 10,
              ),
              itemCount: availableDoctors.length,
              itemBuilder: (context, index) {
                final doctor = availableDoctors[index];
                final isSelected = selectedDoctor == doctor['doctor_id'].toString();

                return GestureDetector(
                  onTap: () {
                    setState(() {
                      selectedDoctor = doctor['doctor_id'].toString();
                    });
                  },
                  child: Container(
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(15),
                      border: Border.all(
                        color: isSelected ? primaryColor : Colors.grey.shade300,
                        width: isSelected ? 2 : 1,
                      ),
                      color: isSelected ? primaryColor.withOpacity(0.1) : whiteColor,
                      boxShadow: [
                        BoxShadow(
                          color: Colors.grey.withOpacity(0.2),
                          spreadRadius: 1,
                          blurRadius: 3,
                          offset: const Offset(0, 2),
                        ),
                      ],
                    ),
                    child: Padding(
                      padding: const EdgeInsets.all(12),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          // Doctor Image
                          Container(
                            width: 60,
                            height: 60,
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              border: Border.all(
                                color: isSelected ? primaryColor : Colors.grey.shade300,
                                width: 2,
                              ),
                            ),
                            child: ClipOval(
                              child: doctor['doctor_image'] != null && doctor['doctor_image'].toString().isNotEmpty
                                  ? Image.network(
                                doctor['doctor_image'],
                                fit: BoxFit.cover,
                                errorBuilder: (context, error, stackTrace) {
                                  return Container(
                                    color: primaryColor.withOpacity(0.1),
                                    child: const Icon(
                                      Icons.person,
                                      color: primaryColor,
                                      size: 30,
                                    ),
                                  );
                                },
                              )
                                  : Container(
                                color: primaryColor.withOpacity(0.1),
                                child: const Icon(
                                  Icons.person,
                                  color: primaryColor,
                                  size: 30,
                                ),
                              ),
                            ),
                          ),
                          const SizedBox(height: 8),

                          // Doctor Name
                          Text(
                            doctor['doctor_name'],
                            style: TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.bold,
                              color: isSelected ? primaryColor : blackColor,
                            ),
                            textAlign: TextAlign.center,
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                          ),
                          const SizedBox(height: 4),

                          // Specialization
                          if (doctor['specialization'] != null)
                            Text(
                              doctor['specialization'],
                              style: TextStyle(
                                fontSize: 12,
                                color: Colors.grey.shade600,
                              ),
                              textAlign: TextAlign.center,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          const SizedBox(height: 8),

                          // Price
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                            decoration: BoxDecoration(
                              color: isSelected ? primaryColor : Colors.green.shade100,
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Text(
                              '\$${doctor['doctor_price'] ?? '50'}',
                              style: TextStyle(
                                color: isSelected ? whiteColor : Colors.green.shade700,
                                fontSize: 12,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),

                          // Selected indicator
                          if (isSelected) ...[
                            const SizedBox(height: 4),
                            const Icon(
                              Icons.check_circle,
                              color: primaryColor,
                              size: 20,
                            ),
                          ],
                        ],
                      ),
                    ),
                  ),
                );
              },
            ),
        ],

        const SizedBox(height: 20),

        // Next Step Button
        Container(
          width: double.infinity,
          margin: const EdgeInsets.only(top: 20),
          child: ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: primaryColor,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(15),
              ),
              padding: const EdgeInsets.symmetric(vertical: 15),
            ),
            onPressed: () {
              if (selectedDay == null || selectedTimeSlot == null) {
                showTemporaryMessage(context, "Please select date and time slot.");
              } else if (selectedDepartment == null) {
                showTemporaryMessage(context, "Please select a department.");
              } else if (selectedDoctor == null) {
                showTemporaryMessage(context, "Please select a doctor.");
              } else {
                setState(() {
                  step = 2;
                });
                // MODIFIED: Auto-load patient data when moving to step 2
                _loadPatientData();
              }
            },
            child: const Text(
              'Next',
              style: TextStyle(
                  color: whiteColor,
                  fontSize: 16.0,
                  fontWeight: FontWeight.bold),
            ),
          ),
        ),
      ],
    );
  }

  // MODIFIED: Bước 2 with auto-population functionality
  Widget buildFormStep2() {
    return Form(
      key: _formKeyStep3,
      child: Column(
        children: [
          Container(
            width: double.infinity,
            margin: const EdgeInsets.only(top: 20),
            alignment: Alignment.center,
            child: const Text(
              'Patient Information',
              style: TextStyle(
                fontSize: 22,
                fontWeight: FontWeight.bold,
                color: primaryColor,
              ),
            ),
          ),
          const SizedBox(height: 10),

          // NEW: Auto-load status indicator
          if (widget.isLoggedIn && widget.patientId != null)

          Container(
            width: double.infinity,
            margin: const EdgeInsets.only(top: 10, bottom: 30),
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: primaryColor.withOpacity(0.1),
              borderRadius: BorderRadius.circular(15),
              border: Border.all(color: primaryColor.withOpacity(0.3)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Appointment Summary',
                  style: TextStyle(
                    color: primaryColor,
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  'Date: ${selectedDay!.substring(0, 10)}',
                  style: const TextStyle(
                    color: blackColor,
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                Text(
                  'Time: ${timeSlots.firstWhere((slot) => slot['value'].toString() == selectedTimeSlot)['label']}',
                  style: const TextStyle(
                    color: blackColor,
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                Text(
                  'Department: ${departments.firstWhere((dept) => dept['department_id'].toString() == selectedDepartment)['department_name']}',
                  style: const TextStyle(
                    color: blackColor,
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                Text(
                  'Doctor: ${availableDoctors.firstWhere((doc) => doc['doctor_id'].toString() == selectedDoctor)['doctor_name']}',
                  style: const TextStyle(
                    color: blackColor,
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                Text(
                  'Price: \$${availableDoctors.firstWhere((doc) => doc['doctor_id'].toString() == selectedDoctor)['doctor_price'] ?? '50'}',
                  style: const TextStyle(
                    color: Colors.green,
                    fontSize: 14,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
          ),

          // Patient Information Form (keeping original styling)
          SizedBox(
            width: double.infinity,
            child: TextFormField(
              controller: _patientNameController,
              cursorColor: Colors.black54,
              style: const TextStyle(
                  color: blackColor,
                  fontSize: 16.0,
                  fontWeight: FontWeight.bold),
              decoration: const InputDecoration(
                prefixIcon: Padding(
                  padding: EdgeInsets.symmetric(horizontal: 8.0),
                  child: Icon(
                    Icons.person,
                    color: Colors.black54,
                  ),
                ),
                hintText: 'Full Name',
                hintStyle: TextStyle(
                    color: Colors.black54,
                    fontSize: 16.0,
                    fontWeight: FontWeight.bold),
                focusedBorder: OutlineInputBorder(
                  borderSide: BorderSide(color: Colors.black54, width: 1.0),
                  borderRadius: BorderRadius.all(Radius.circular(15)),
                ),
                enabledBorder: OutlineInputBorder(
                  borderSide: BorderSide(color: Colors.black54, width: 1.0),
                  borderRadius: BorderRadius.all(Radius.circular(15)),
                ),
                errorBorder: OutlineInputBorder(
                  borderSide: BorderSide(
                    color: Colors.red,
                    width: 1.0,
                  ),
                  borderRadius: BorderRadius.all(Radius.circular(15)),
                ),
                focusedErrorBorder: OutlineInputBorder(
                  borderSide: BorderSide(
                    color: Colors.red,
                    width: 1.0,
                  ),
                  borderRadius: BorderRadius.all(Radius.circular(15)),
                ),
                errorStyle: TextStyle(
                    color: Colors.red,
                    fontSize: 12,
                    fontWeight: FontWeight.bold),
              ),
              validator: (value) {
                if (value == null || value.isEmpty) {
                  return 'Name cannot be empty';
                }
                return null;
              },
            ),
          ),
          const SizedBox(height: 20),
          SizedBox(
            width: double.infinity,
            child: TextFormField(
              controller: _patientEmailController,
              keyboardType: TextInputType.emailAddress,
              cursorColor: Colors.black54,
              style: const TextStyle(
                  color: blackColor,
                  fontSize: 16.0,
                  fontWeight: FontWeight.bold),
              decoration: const InputDecoration(
                prefixIcon: Padding(
                  padding: EdgeInsets.symmetric(horizontal: 8.0),
                  child: Icon(
                    Icons.email,
                    color: Colors.black54,
                  ),
                ),
                hintText: 'Email Address',
                hintStyle: TextStyle(
                    color: Colors.black54,
                    fontSize: 16.0,
                    fontWeight: FontWeight.bold),
                focusedBorder: OutlineInputBorder(
                  borderSide: BorderSide(color: Colors.black54, width: 1.0),
                  borderRadius: BorderRadius.all(Radius.circular(15)),
                ),
                enabledBorder: OutlineInputBorder(
                  borderSide: BorderSide(color: Colors.black54, width: 1.0),
                  borderRadius: BorderRadius.all(Radius.circular(15)),
                ),
                errorBorder: OutlineInputBorder(
                  borderSide: BorderSide(
                    color: Colors.red,
                    width: 1.0,
                  ),
                  borderRadius: BorderRadius.all(Radius.circular(15)),
                ),
                focusedErrorBorder: OutlineInputBorder(
                  borderSide: BorderSide(
                    color: Colors.red,
                    width: 1.0,
                  ),
                  borderRadius: BorderRadius.all(Radius.circular(15)),
                ),
                errorStyle: TextStyle(
                    color: Colors.red,
                    fontSize: 12,
                    fontWeight: FontWeight.bold),
              ),
              validator: (value) {
                if (value == null || value.isEmpty) {
                  return 'Email address cannot be empty';
                }
                if (!RegExp(r'^[^@]+@[^@]+\.[^@]+').hasMatch(value)) {
                  return 'Invalid email address';
                }
                return null;
              },
            ),
          ),
          const SizedBox(height: 20),
          SizedBox(
            width: double.infinity,
            child: TextFormField(
              controller: _patientPhoneController,
              keyboardType: TextInputType.number,
              cursorColor: Colors.black54,
              style: const TextStyle(
                  color: blackColor,
                  fontSize: 16.0,
                  fontWeight: FontWeight.bold),
              decoration: const InputDecoration(
                prefixIcon: Padding(
                  padding: EdgeInsets.symmetric(horizontal: 8.0),
                  child: Icon(
                    Icons.phone_outlined,
                    color: Colors.black54,
                  ),
                ),
                hintText: 'Phone Number',
                hintStyle: TextStyle(
                    color: Colors.black54,
                    fontSize: 16.0,
                    fontWeight: FontWeight.bold),
                focusedBorder: OutlineInputBorder(
                  borderSide: BorderSide(color: Colors.black54, width: 1.0),
                  borderRadius: BorderRadius.all(Radius.circular(15)),
                ),
                enabledBorder: OutlineInputBorder(
                  borderSide: BorderSide(color: Colors.black54, width: 1.0),
                  borderRadius: BorderRadius.all(Radius.circular(15)),
                ),
                errorBorder: OutlineInputBorder(
                  borderSide: BorderSide(
                    color: Colors.red,
                    width: 1.0,
                  ),
                  borderRadius: BorderRadius.all(Radius.circular(15)),
                ),
                focusedErrorBorder: OutlineInputBorder(
                  borderSide: BorderSide(
                    color: Colors.red,
                    width: 1.0,
                  ),
                  borderRadius: BorderRadius.all(Radius.circular(15)),
                ),
                errorStyle: TextStyle(
                    color: Colors.red,
                    fontSize: 12,
                    fontWeight: FontWeight.bold),
              ),
              validator: (value) {
                if (value == null || value.isEmpty) {
                  return 'Phone number cannot be empty';
                }
                if (!RegExp(r'^\d+$').hasMatch(value)) {
                  return 'Phone number must contain only digits';
                }
                return null;
              },
            ),
          ),
          const SizedBox(height: 20),
          SizedBox(
            width: double.infinity,
            child: TextFormField(
              controller: _patientNoteController,
              keyboardType: TextInputType.text,
              cursorColor: Colors.black54,
              style: const TextStyle(
                  color: blackColor,
                  fontSize: 16.0,
                  fontWeight: FontWeight.bold),
              decoration: const InputDecoration(
                prefixIcon: Padding(
                  padding: EdgeInsets.symmetric(horizontal: 8.0),
                  child: Icon(
                    Icons.note,
                    color: Colors.black54,
                  ),
                ),
                hintText: 'Note',
                hintStyle: TextStyle(
                    color: Colors.black54,
                    fontSize: 16.0,
                    fontWeight: FontWeight.bold),
                focusedBorder: OutlineInputBorder(
                  borderSide: BorderSide(color: Colors.black54, width: 1.0),
                  borderRadius: BorderRadius.all(Radius.circular(15)),
                ),
                enabledBorder: OutlineInputBorder(
                  borderSide: BorderSide(color: Colors.black54, width: 1.0),
                  borderRadius: BorderRadius.all(Radius.circular(15)),
                ),
                errorBorder: OutlineInputBorder(
                  borderSide: BorderSide(
                    color: Colors.red,
                    width: 1.0,
                  ),
                  borderRadius: BorderRadius.all(Radius.circular(15)),
                ),
                focusedErrorBorder: OutlineInputBorder(
                  borderSide: BorderSide(
                    color: Colors.red,
                    width: 1.0,
                  ),
                  borderRadius: BorderRadius.all(Radius.circular(15)),
                ),
                errorStyle: TextStyle(
                    color: Colors.red,
                    fontSize: 12,
                    fontWeight: FontWeight.bold),
              ),

            ),
          ),
          const SizedBox(height: 20),

          // Navigation Buttons
          Container(
            width: double.infinity,
            margin: const EdgeInsets.only(top: 20),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                SizedBox(
                  width: MediaQuery.of(context).size.width * 0.45,
                  child: ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: whiteColor,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(15),
                        side: const BorderSide(
                          color: primaryColor,
                          width: 1,
                        ),
                      ),
                      padding: const EdgeInsets.symmetric(vertical: 15),
                    ),
                    onPressed: () {
                      setState(() {
                        step = 1;
                      });
                    },
                    child: const Text(
                      'Back',
                      style: TextStyle(
                          color: primaryColor,
                          fontSize: 16.0,
                          fontWeight: FontWeight.bold),
                    ),
                  ),
                ),
                SizedBox(
                  width: MediaQuery.of(context).size.width * 0.45,
                  child: ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: primaryColor,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(15),
                      ),
                      padding: const EdgeInsets.symmetric(vertical: 15),
                    ),
                    onPressed: () {
                      if (_formKeyStep3.currentState!.validate()) {
                         setState(() {

                          step = 3;
                        });
                      }
                    },
                    child: const Text(
                      'Next',
                      style: TextStyle(
                          color: whiteColor,
                          fontSize: 16.0,
                          fontWeight: FontWeight.bold),
                    ),
                  ),
                )
              ],
            ),
          ),
        ],
      ),
    );
  }

  // Bước 3: Thanh toán và xác nhận (keeping original code)
  Widget buildFormStep3() {
    return Column(
      children: [
        Container(
          width: double.infinity,
          margin: const EdgeInsets.only(top: 20),
          alignment: Alignment.center,
          child: const Text(
            'Payment & Confirmation',
            style: TextStyle(
              fontSize: 22,
              fontWeight: FontWeight.bold,
              color: primaryColor,
            ),
          ),
        ),
        const SizedBox(height: 20),

        // Complete appointment summary (giữ nguyên code cũ)
        Container(
          width: double.infinity,
          margin: const EdgeInsets.only(top: 10, bottom: 30),
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            color: whiteColor,
            borderRadius: BorderRadius.circular(15),
            border: Border.all(color: primaryColor.withOpacity(0.3)),
            boxShadow: [
              BoxShadow(
                color: Colors.grey.withOpacity(0.1),
                spreadRadius: 1,
                blurRadius: 5,
                offset: const Offset(0, 2),
              ),
            ],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: primaryColor.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: const Icon(
                      Icons.calendar_today,
                      color: primaryColor,
                      size: 20,
                    ),
                  ),
                  const SizedBox(width: 12),
                  const Text(
                    'Appointment Details',
                    style: TextStyle(
                      color: primaryColor,
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 20),

              // Date & Time
              _buildConfirmationRow(
                Icons.calendar_month,
                'Date',
                selectedDay!.substring(0, 10),
              ),
              _buildConfirmationRow(
                Icons.access_time,
                'Time',
                timeSlots.firstWhere((slot) => slot['value'].toString() == selectedTimeSlot)['label'],
              ),

              const Divider(height: 30, thickness: 1),

              // Department & Doctor
              _buildConfirmationRow(
                Icons.local_hospital,
                'Department',
                departments.firstWhere((dept) => dept['department_id'].toString() == selectedDepartment)['department_name'],
              ),
              _buildConfirmationRow(
                Icons.person_outline,
                'Doctor',
                availableDoctors.firstWhere((doc) => doc['doctor_id'].toString() == selectedDoctor)['doctor_name'],
              ),

              const Divider(height: 30, thickness: 1),

              // Patient Information
              _buildConfirmationRow(
                Icons.person,
                'Patient Name',
                _patientNameController.text,
              ),
              _buildConfirmationRow(
                Icons.email,
                'Email',
                _patientEmailController.text,
              ),
              _buildConfirmationRow(
                Icons.phone,
                'Phone',
                _patientPhoneController.text,
              ),
              _buildConfirmationRow(
                Icons.note,
                'Note',
                _patientNoteController.text,
              ),

              const Divider(height: 30, thickness: 1),

              // Price
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.green.shade50,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: Colors.green.shade200),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text(
                      'Total Amount',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: blackColor,
                      ),
                    ),
                    Text(
                      '\$${availableDoctors.firstWhere((doc) => doc['doctor_id'].toString() == selectedDoctor)['doctor_price'] ?? '50'}',
                      style: const TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                        color: Colors.green,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),

        // Payment Methods Section
        Container(
          width: double.infinity,
          margin: const EdgeInsets.only(bottom: 20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Select Payment Method',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: blackColor,
                ),
              ),
              const SizedBox(height: 15),

              // PayPal Payment Button
              Container(
                width: double.infinity,
                margin: const EdgeInsets.only(bottom: 10),
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF0070BA), // PayPal blue color
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(15),
                    ),
                    padding: const EdgeInsets.symmetric(vertical: 15),
                  ),
                  onPressed: isProcessingPayment ? null : handlePayPalPayment,
                  child: isProcessingPayment && selectedPaymentMethod == "CREDIT_CARD"
                      ? const Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(
                          color: whiteColor,
                          strokeWidth: 2,
                        ),
                      ),
                      SizedBox(width: 10),
                      Text(
                        'Processing PayPal Payment...',
                        style: TextStyle(
                          color: whiteColor,
                          fontSize: 16.0,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  )
                      : const Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(
                        Icons.payment,
                        color: whiteColor,
                        size: 20,
                      ),
                      SizedBox(width: 10),
                      Text(
                        'Pay with PayPal (Credit Card)',
                        style: TextStyle(
                          color: whiteColor,
                          fontSize: 16.0,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                ),
              ),

              // Cash Payment Button
              Container(
                width: double.infinity,
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.green.shade600,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(15),
                    ),
                    padding: const EdgeInsets.symmetric(vertical: 15),
                  ),
                  onPressed: isProcessingPayment ? null : handleCashPayment,
                  child: isProcessingPayment && selectedPaymentMethod == "CASH"
                      ? const Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(
                          color: whiteColor,
                          strokeWidth: 2,
                        ),
                      ),
                      SizedBox(width: 10),
                      Text(
                        'Processing Cash Payment...',
                        style: TextStyle(
                          color: whiteColor,
                          fontSize: 16.0,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  )
                      : const Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(
                        Icons.money,
                        color: whiteColor,
                        size: 20,
                      ),
                      SizedBox(width: 10),
                      Text(
                        'Pay with Cash',
                        style: TextStyle(
                          color: whiteColor,
                          fontSize: 16.0,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),

        // Important Notice
        Container(
          width: double.infinity,
          padding: const EdgeInsets.all(16),
          margin: const EdgeInsets.only(bottom: 20),
          decoration: BoxDecoration(
            color: Colors.orange.shade50,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: Colors.orange.shade200),
          ),
          child: Row(
            children: [
              Icon(
                Icons.info_outline,
                color: Colors.orange.shade700,
                size: 20,
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Text(
                  'Choose your preferred payment method. For cash payment, please bring exact amount to the appointment.',
                  style: TextStyle(
                    color: Colors.orange.shade700,
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ],
          ),
        ),

        // Back Button
        Container(
          width: double.infinity,
          margin: const EdgeInsets.only(top: 20),
          child: ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: whiteColor,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(15),
                side: const BorderSide(
                  color: primaryColor,
                  width: 1,
                ),
              ),
              padding: const EdgeInsets.symmetric(vertical: 15),
            ),
            onPressed: isProcessingPayment ? null : () {
              setState(() {
                step = 2;
              });
            },
            child: const Text(
              'Back',
              style: TextStyle(
                  color: primaryColor,
                  fontSize: 16.0,
                  fontWeight: FontWeight.bold),
            ),
          ),
        ),
      ],
    );
  }

  // Helper method for confirmation rows
  Widget _buildConfirmationRow(IconData icon, String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        children: [
          Icon(
            icon,
            color: Colors.grey.shade600,
            size: 20,
          ),
          const SizedBox(width: 12),
          SizedBox(
            width: 100,
            child: Text(
              label,
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w600,
                color: Colors.grey.shade700,
              ),
            ),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              value,
              style: const TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.bold,
                color: blackColor,
              ),
            ),
          ),
        ],
      ),
    );
  }

  @override
  void dispose() {
    _timer?.cancel();
    _departmentSearchController.dispose();
    _departmentFocusNode.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        Scaffold(
          backgroundColor: whiteColor,
          appBar: AppBar(
            title: Container(
              alignment: Alignment.center,
              child: Text(
                step == 1
                    ? 'Book Appointment'
                    : step == 2
                    ? 'Patient Information'
                    : showSuccess
                    ? 'Appointment Success'
                    : 'Payment & Confirmation',
                style: const TextStyle(
                  color: whiteColor,
                  fontWeight: FontWeight.bold,
                  fontSize: 20,
                ),
              ),
            ),
            backgroundColor: primaryColor,
          ),
          body: SingleChildScrollView(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                StepBar(
                  currentStep: showSuccess ? 4 : step,
                  totalSteps: 3,
                  stepLabels: const ['Select & Book', 'Patient Info', 'Payment'],
                ),
                const SizedBox(height: 20),
                showSuccess
                    ? Center(
                  child: Container(
                    width: double.infinity,
                    margin: const EdgeInsets.only(top: 20),
                    child: Column(
                      children: [
                        const Icon(Icons.check_circle,
                            size: 60, color: Colors.green),
                        const SizedBox(height: 10),
                        const Text('Appointment booked and paid successfully!',
                            style: TextStyle(
                                fontSize: 20,
                                color: blackColor,
                                fontWeight: FontWeight.bold)),
                        const SizedBox(height: 40),
                        Container(
                          width: double.infinity,
                          margin: const EdgeInsets.only(top: 20),
                          child: ElevatedButton(
                            style: ElevatedButton.styleFrom(
                              backgroundColor: primaryColor,
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(15),
                              ),
                              padding: const EdgeInsets.symmetric(
                                  vertical: 15),
                            ),
                            onPressed: () {
                              Navigator.pushNamed(
                                  context, '/appointment_list');
                            },
                            child: const Text(
                              'View Appointment',
                              style: TextStyle(
                                  color: whiteColor,
                                  fontSize: 16.0,
                                  fontWeight: FontWeight.bold),
                            ),
                          ),
                        ),
                        Container(
                          width: double.infinity,
                          margin: const EdgeInsets.only(top: 20),
                          child: ElevatedButton(
                            style: ElevatedButton.styleFrom(
                              backgroundColor: whiteColor,
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(15),
                              ),
                              side: const BorderSide(
                                  color: primaryColor, width: 0.5),
                              padding: const EdgeInsets.symmetric(
                                  vertical: 15),
                            ),
                            onPressed: () {
                              setState(() {
                                step = 1;
                                showSuccess = false;
                                selectedDay = null;
                                selectedTimeSlot = null;
                                selectedDepartment = null;
                                selectedDoctor = null;
                                isDateSelected = false;
                                isTimeSelected = false;
                                _patientNameController.clear();
                                _patientEmailController.clear();
                                _patientPhoneController.clear();

                                // Reset auto-load states
                                isPatientDataLoaded = false;
                                isLoadingPatientData = false;
                              });
                            },
                            child: const Text(
                              'Book Another Appointment',
                              style: TextStyle(
                                  color: primaryColor,
                                  fontSize: 16.0,
                                  fontWeight: FontWeight.bold),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                )
                    : step == 1
                    ? buildFormStep1()
                    : step == 2
                    ? buildFormStep2()
                    : buildFormStep3(),
                const SizedBox(height: 30),
              ],
            ),
          ),
        ),

        // Loading overlay
        if (isLoading)
          Positioned.fill(
            child: Container(
              color: blackColor.withOpacity(0.1),
              child: const Center(
                child: CircularProgressIndicator(
                  valueColor: AlwaysStoppedAnimation<Color>(primaryColor),
                ),
              ),
            ),
          ),
      ],
    );
  }
}