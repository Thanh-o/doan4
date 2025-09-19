import 'package:flutter/material.dart';
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'google_signin_button.dart';

const primaryColor = Color(0xFF2196F3);
const secondaryColor = Color(0xFF1976D2);
const accentColor = Color(0xFF03DAC6);
const whiteColor = Color(0xFFFFFFFF);
const blackColor = Color(0xFF000000);
const greyColor = Color(0xFF757575);
const lightGreyColor = Color(0xFFF5F5F5);
const successColor = Color(0xFF4CAF50);

class Profile extends StatefulWidget {
  final bool isLoggedIn;
  final Function onLogout;
  final int? patientId;
  final VoidCallback onNavigateToDiagnosis;

  const Profile({
    super.key,
    required this.isLoggedIn,
    required this.onLogout,
    this.patientId,
    required this.onNavigateToDiagnosis,
  });

  @override
  _ProfileState createState() => _ProfileState();
}

class _ProfileState extends State<Profile> with TickerProviderStateMixin {
  String name = '';
  String imagePath = '';
  bool imageValid = false;
  bool isLoading = false;
  late AnimationController _animationController;
  late Animation<double> _fadeAnimation;
  late Animation<Offset> _slideAnimation;

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      duration: const Duration(milliseconds: 1500),
      vsync: this,
    );
    _fadeAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _animationController, curve: Curves.easeInOut),
    );
    _slideAnimation = Tween<Offset>(
      begin: const Offset(0, 0.3),
      end: Offset.zero,
    ).animate(CurvedAnimation(parent: _animationController, curve: Curves.easeOutCubic));

    if (!widget.isLoggedIn) {
      _animationController.forward();
    }

    if (widget.isLoggedIn && widget.patientId != null) {
      fetchPatientData();
    }
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  @override
  void didUpdateWidget(Profile oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.isLoggedIn != oldWidget.isLoggedIn || widget.patientId != oldWidget.patientId) {
      if (widget.isLoggedIn && widget.patientId != null) {
        fetchPatientData();
      }
    }
  }

  void updateImagePath(String newPath) {
    setState(() {
      imagePath = newPath;
      fetchPatientData();
    });
  }

  Future<void> _logout() async {
    SharedPreferences prefs = await SharedPreferences.getInstance();
    await prefs.remove('patient_id');
    await prefs.setBool('isLoggedIn', false);
    widget.onLogout();
  }

  Future<void> fetchPatientData() async {
    if (widget.patientId == null) return;

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
          setState(() {
            name = patientData[0]['patient_name'] ?? '';
            if (patientData[0]['patient_img'] != null &&
                patientData[0]['patient_img'] != '') {
              imagePath = '${patientData[0]['patient_img']}';
              imageValid = true;
            } else {
              imageValid = false;
            }
          });
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

  Widget _buildFeatureCard({
    required IconData icon,
    required String title,
    required String description,
    required Color color,
  }) {
    return Container(
      padding: const EdgeInsets.all(16), // Reduced padding
      decoration: BoxDecoration(
        color: whiteColor,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.08),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min, // Important: Use min size
        children: [
          Container(
            padding: const EdgeInsets.all(12), // Reduced padding
            decoration: BoxDecoration(
              color: color.withOpacity(0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(icon, color: color, size: 28), // Reduced icon size
          ),
          const SizedBox(height: 12), // Reduced spacing
          Text(
            title,
            style: const TextStyle(
              fontSize: 14, // Reduced font size
              fontWeight: FontWeight.bold,
              color: blackColor,
            ),
            textAlign: TextAlign.center,
            maxLines: 2, // Limit lines
            overflow: TextOverflow.ellipsis, // Handle overflow
          ),
          const SizedBox(height: 6), // Reduced spacing
          Flexible( // Use Flexible instead of fixed spacing
            child: Text(
              description,
              style: const TextStyle(
                fontSize: 11, // Reduced font size
                color: greyColor,
                height: 1.2, // Reduced line height
              ),
              textAlign: TextAlign.center,
              maxLines: 2, // Reduced max lines
              overflow: TextOverflow.ellipsis, // Handle overflow
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildServiceHighlight({
    required IconData icon,
    required String title,
    required String description,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(20),
        margin: const EdgeInsets.only(bottom: 16),
        decoration: BoxDecoration(
          color: whiteColor,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: primaryColor.withOpacity(0.2)),
          boxShadow: [
            BoxShadow(
              color: primaryColor.withOpacity(0.1),
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: primaryColor.withOpacity(0.1),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(icon, color: primaryColor, size: 24),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: blackColor,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    description,
                    style: const TextStyle(
                      fontSize: 14,
                      color: greyColor,
                    ),
                  ),
                ],
              ),
            ),
            const Icon(
              Icons.arrow_forward_ios,
              color: greyColor,
              size: 16,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildNotLoggedInUI() {
    return FadeTransition(
      opacity: _fadeAnimation,
      child: SlideTransition(
        position: _slideAnimation,
        child: SingleChildScrollView(
          child: Column(
            children: [
              // Hero Section
              Container(
                width: double.infinity,
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topCenter,
                    end: Alignment.bottomCenter,
                    colors: [
                      primaryColor.withOpacity(0.1),
                      whiteColor,
                    ],
                  ),
                ),
                child: Column(
                  children: [
                    const SizedBox(height: 60),
                    Container(
                      width: 100,
                      height: 100,
                      decoration: BoxDecoration(
                        color: primaryColor.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(50),
                      ),
                      child: const Icon(
                        Icons.person_outline,
                        size: 50,
                        color: primaryColor,
                      ),
                    ),
                    const SizedBox(height: 24),
                    const Text(
                      'Your Health Profile\nAwaits',
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontSize: 28,
                        fontWeight: FontWeight.bold,
                        color: blackColor,
                        height: 1.2,
                      ),
                    ),
                    const SizedBox(height: 16),
                    const Padding(
                      padding: EdgeInsets.symmetric(horizontal: 32),
                      child: Text(
                        'Access your complete medical history, book appointments, and manage your healthcare journey all in one place.',
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          fontSize: 16,
                          color: greyColor,
                          height: 1.5,
                        ),
                      ),
                    ),
                    const SizedBox(height: 40),
                  ],
                ),
              ),

              // Call to Action Section
              Container(
                margin: const EdgeInsets.all(24),
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [primaryColor, secondaryColor],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(20),
                  boxShadow: [
                    BoxShadow(
                      color: primaryColor.withOpacity(0.3),
                      blurRadius: 15,
                      offset: const Offset(0, 8),
                    ),
                  ],
                ),
                child: Column(
                  children: [
                    const Icon(
                      Icons.health_and_safety_outlined,
                      color: whiteColor,
                      size: 48,
                    ),
                    const SizedBox(height: 16),
                    const Text(
                      'Join Our Healthcare Community',
                      style: TextStyle(
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                        color: whiteColor,
                      ),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 8),
                    const Text(
                      'Sign in now to access all services and have the best healthcare experience',
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontSize: 16,
                        color: whiteColor,
                        height: 1.4,
                      ),
                    ),
                    const SizedBox(height: 24),
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton(
                        onPressed: () => Navigator.pushNamed(context, '/login'),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: whiteColor,
                          foregroundColor: primaryColor,
                          padding: const EdgeInsets.symmetric(vertical: 16),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                          elevation: 0,
                        ),
                        child: const Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Text(
                              'Sign In Now',
                              style: TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            SizedBox(width: 8),
                            Icon(Icons.arrow_forward, size: 20),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ),

              // Features Preview Section
              Padding(
                padding: const EdgeInsets.all(24),
                child: Column(
                  children: [
                    const Text(
                      'What You\'ll Get Access To',
                      style: TextStyle(
                        fontSize: 22,
                        fontWeight: FontWeight.bold,
                        color: blackColor,
                      ),
                    ),
                    const SizedBox(height: 24),
                    GridView.count(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      crossAxisCount: 2,
                      crossAxisSpacing: 16,
                      mainAxisSpacing: 16,
                      childAspectRatio: 1.2, // Increased aspect ratio for more height
                      children: [
                        _buildFeatureCard(
                          icon: Icons.medical_information_outlined,
                          title: 'Medical Records',
                          description: 'Access your complete medical history',
                          color: primaryColor,
                        ),
                        _buildFeatureCard(
                          icon: Icons.calendar_today_outlined,
                          title: 'Appointments',
                          description: 'Book and manage appointments',
                          color: successColor,
                        ),
                        _buildFeatureCard(
                          icon: Icons.local_hospital_outlined,
                          title: 'Emergency Services',
                          description: 'Quick access to emergency care',
                          color: Colors.red,
                        ),
                        _buildFeatureCard(
                          icon: Icons.camera_alt_outlined,
                          title: 'AI Diagnosis',
                          description: 'Get instant medical insights',
                          color: Colors.purple,
                        ),
                      ],
                    ),
                  ],
                ),
              ),




              // Benefits Section
              Container(
                margin: const EdgeInsets.symmetric(horizontal: 24),
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: lightGreyColor,
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Column(
                  children: [
                    const Text(
                      'Why Choose Our Platform?',
                      style: TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                        color: blackColor,
                      ),
                    ),
                    const SizedBox(height: 16),
                    Row(
                      children: [
                        const Icon(Icons.verified, color: successColor, size: 20),
                        const SizedBox(width: 12),
                        const Expanded(
                          child: Text(
                            'Trusted by thousands of patients',
                            style: TextStyle(
                              fontSize: 14,
                              color: blackColor,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        const Icon(Icons.security, color: primaryColor, size: 20),
                        const SizedBox(width: 12),
                        const Expanded(
                          child: Text(
                            'Secure and private data protection',
                            style: TextStyle(
                              fontSize: 14,
                              color: blackColor,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        const Icon(Icons.support_agent, color: Colors.orange, size: 20),
                        const SizedBox(width: 12),
                        const Expanded(
                          child: Text(
                            '24/7 customer support available',
                            style: TextStyle(
                              fontSize: 14,
                              color: blackColor,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),

              // Footer Section
              Container(
                margin: const EdgeInsets.only(top: 24),
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: lightGreyColor,
                  borderRadius: const BorderRadius.only(
                    topLeft: Radius.circular(24),
                    topRight: Radius.circular(24),
                  ),
                ),
                child: Column(
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(
                            color: primaryColor.withOpacity(0.1),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: const Icon(
                            Icons.phone_outlined,
                            color: primaryColor,
                            size: 20,
                          ),
                        ),
                        const SizedBox(width: 12),
                        const Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Need Help?',
                              style: TextStyle(
                                color: blackColor,
                                fontSize: 16,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            Text(
                              'Hotline: 1900 1234',
                              style: TextStyle(
                                color: primaryColor,
                                fontSize: 16,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),


                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: whiteColor,
      body: isLoading
          ? const Center(
        child: CircularProgressIndicator(
          valueColor: AlwaysStoppedAnimation<Color>(primaryColor),
        ),
      )
          : !widget.isLoggedIn
          ? _buildNotLoggedInUI()
          : SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(height: 50),
            Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  imageValid
                      ? CircleAvatar(
                    backgroundImage: NetworkImage(imagePath),
                    radius: 40,
                  )
                      : const Icon(
                    Icons.account_circle,
                    size: 80,
                    color: Colors.grey,
                  ),
                  imageValid ? const SizedBox(height: 5) : const SizedBox(height: 0),
                  Text(
                    name.toUpperCase(),
                    style: const TextStyle(
                      color: blackColor,
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 5),
                  SizedBox(
                    height: 35,
                    child: ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: primaryColor,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(15),
                        ),
                        padding: const EdgeInsets.only(left: 15, right: 15),
                      ),
                      onPressed: () async {
                        final newPath = await Navigator.pushNamed(context, '/user');
                        if (newPath != null) {
                          updateImagePath(newPath as String);
                        }
                      },
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          // Fixed: Use proper icon instead of NetworkImage for icons
                          const Icon(
                            Icons.edit,
                            color: whiteColor,
                            size: 20,
                          ),
                          const SizedBox(width: 8),
                          const Text(
                            'Update',
                            style: TextStyle(
                              color: whiteColor,
                              fontWeight: FontWeight.bold,
                              fontSize: 14,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),
            Container(
              width: double.infinity,
              height: 10,
              color: primaryColor.withOpacity(0.05),
            ),
            Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Container(
                    width: double.infinity,
                    alignment: Alignment.centerLeft,
                    child: const Text(
                      'Services',
                      style: TextStyle(
                        color: blackColor,
                        fontSize: 14,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                  const SizedBox(height: 20),
                  Row(
                    children: [
                      Expanded(
                        flex: 1,
                        child: GestureDetector(
                          onTap: () {
                            Navigator.pushNamed(context, '/booked_list');
                          },
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              // Fixed: Use proper icon instead of NetworkImage
                              Container(
                                width: 70,
                                height: 70,
                                decoration: BoxDecoration(
                                  color: primaryColor.withOpacity(0.1),
                                  borderRadius: BorderRadius.circular(35),
                                ),
                                child: const Icon(
                                  Icons.search_off,
                                  color: primaryColor,
                                  size: 35,
                                ),
                              ),
                              const SizedBox(height: 8),
                              const Text(
                                'Booked Ambulance',
                                textAlign: TextAlign.center,
                                overflow: TextOverflow.visible,
                                maxLines: 2,
                                style: TextStyle(
                                  color: Colors.black87,
                                  fontSize: 13,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                      Expanded(
                        flex: 1,
                        child: GestureDetector(
                          onTap: () {
                            Navigator.pushNamed(context, '/appointment_list');
                          },
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Container(
                                width: 70,
                                height: 70,
                                decoration: BoxDecoration(
                                  color: successColor.withOpacity(0.1),
                                  borderRadius: BorderRadius.circular(35),
                                ),
                                child: const Icon(
                                  Icons.calendar_today,
                                  color: successColor,
                                  size: 35,
                                ),
                              ),
                              const SizedBox(height: 8),
                              const Text(
                                'Booked Appointment',
                                textAlign: TextAlign.center,
                                overflow: TextOverflow.visible,
                                maxLines: 2,
                                style: TextStyle(
                                  color: Colors.black87,
                                  fontSize: 13,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                      Expanded(
                        flex: 1,
                        child: GestureDetector(
                          onTap: () {
                            Navigator.pushNamed(context, '/medical_records');
                          },
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Container(
                                width: 70,
                                height: 70,
                                decoration: BoxDecoration(
                                  color: Colors.red.withOpacity(0.1),
                                  borderRadius: BorderRadius.circular(35),
                                ),
                                child: const Icon(
                                  Icons.medical_information,
                                  color: Colors.red,
                                  size: 35,
                                ),
                              ),
                              const SizedBox(height: 8),
                              const Text(
                                'Medical Records',
                                textAlign: TextAlign.center,
                                overflow: TextOverflow.visible,
                                maxLines: 2,
                                style: TextStyle(
                                  color: Colors.black87,
                                  fontSize: 13,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                      Expanded(
                        flex: 1,
                        child: GestureDetector(
                          onTap: widget.onNavigateToDiagnosis,
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Container(
                                width: 70,
                                height: 70,
                                decoration: BoxDecoration(
                                  color: Colors.purple.withOpacity(0.1),
                                  borderRadius: BorderRadius.circular(35),
                                ),
                                child: const Icon(
                                  Icons.search,
                                  color: Colors.purple,
                                  size: 35,
                                ),
                              ),
                              const SizedBox(height: 8),
                              const Text(
                                'Diagnostic Imaging',
                                textAlign: TextAlign.center,
                                overflow: TextOverflow.visible,
                                maxLines: 2,
                                style: TextStyle(
                                  color: Colors.black87,
                                  fontSize: 13,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            // ... (rest of the logged-in UI with similar icon fixes)
            Container(
              width: double.infinity,
              height: 10,
              color: primaryColor.withOpacity(0.05),
            ),
            Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Container(
                    width: double.infinity,
                    alignment: Alignment.centerLeft,
                    child: const Text(
                      'Utilities',
                      style: TextStyle(
                        color: blackColor,
                        fontSize: 14,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                  const SizedBox(height: 20),
                  Row(
                    children: [
                      Expanded(
                        flex: 1,
                        child: GestureDetector(
                          onTap: () {
                            Navigator.pushNamed(context, '/user');
                          },
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Container(
                                width: 70,
                                height: 70,
                                decoration: BoxDecoration(
                                  color: primaryColor.withOpacity(0.1),
                                  borderRadius: BorderRadius.circular(35),
                                ),
                                child: const Icon(
                                  Icons.person,
                                  color: primaryColor,
                                  size: 35,
                                ),
                              ),
                              const SizedBox(height: 8),
                              const Text(
                                'Account Information',
                                textAlign: TextAlign.center,
                                overflow: TextOverflow.visible,
                                maxLines: 2,
                                style: TextStyle(
                                  color: Colors.black87,
                                  fontSize: 13,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                      Expanded(
                        flex: 1,
                        child: GestureDetector(
                          onTap: () {
                            Navigator.pushNamed(context, '/library');
                          },
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Container(
                                width: 70,
                                height: 70,
                                decoration: BoxDecoration(
                                  color: Colors.orange.withOpacity(0.1),
                                  borderRadius: BorderRadius.circular(35),
                                ),
                                child: const Icon(
                                  Icons.library_books,
                                  color: Colors.orange,
                                  size: 35,
                                ),
                              ),
                              const SizedBox(height: 8),
                              const Text(
                                'Ambulance Library',
                                textAlign: TextAlign.center,
                                overflow: TextOverflow.visible,
                                maxLines: 2,
                                style: TextStyle(
                                  color: Colors.black87,
                                  fontSize: 13,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                      Expanded(
                        flex: 1,
                        child: GestureDetector(
                          onTap: () {
                            Navigator.pushNamed(context, '/feedback');
                          },
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Container(
                                width: 70,
                                height: 70,
                                decoration: BoxDecoration(
                                  color: Colors.green.withOpacity(0.1),
                                  borderRadius: BorderRadius.circular(35),
                                ),
                                child: const Icon(
                                  Icons.comment,
                                  color: Colors.green,
                                  size: 35,
                                ),
                              ),
                              const SizedBox(height: 8),
                              const Text(
                                'Service Feedback',
                                textAlign: TextAlign.center,
                                overflow: TextOverflow.visible,
                                maxLines: 2,
                                style: TextStyle(
                                  color: Colors.black87,
                                  fontSize: 13,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                      Expanded(
                        flex: 1,
                        child: GestureDetector(
                          onTap: () {
                            Navigator.pushNamed(context, '/change_password');
                          },
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Container(
                                width: 70,
                                height: 70,
                                decoration: BoxDecoration(
                                  color: Colors.red.withOpacity(0.1),
                                  borderRadius: BorderRadius.circular(35),
                                ),
                                child: const Icon(
                                  Icons.lock,
                                  color: Colors.red,
                                  size: 35,
                                ),
                              ),
                              const SizedBox(height: 8),
                              const Text(
                                'Change Password',
                                textAlign: TextAlign.center,
                                overflow: TextOverflow.visible,
                                maxLines: 2,
                                style: TextStyle(
                                  color: Colors.black87,
                                  fontSize: 13,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            Container(
              width: double.infinity,
              height: 10,
              color: primaryColor.withOpacity(0.05),
            ),
            Padding(
              padding: const EdgeInsets.only(top: 10, bottom: 10, left: 12, right: 12),
              child: Column(
                children: [
                  GestureDetector(
                    onTap: () {
                      Navigator.pushNamed(context, '/about');
                    },
                    child: Container(
                      decoration: const BoxDecoration(
                        border: Border(
                          bottom: BorderSide(
                            color: Colors.grey,
                            width: 0.5,
                          ),
                        ),
                      ),
                      padding: const EdgeInsets.symmetric(vertical: 10),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.start,
                            children: [
                              Container(
                                decoration: BoxDecoration(
                                  color: primaryColor.withOpacity(0.1),
                                  borderRadius: BorderRadius.circular(10),
                                ),
                                padding: const EdgeInsets.all(8.0),
                                child: const Icon(
                                  Icons.verified_user,
                                  color: Colors.black54,
                                  size: 20,
                                ),
                              ),
                              const SizedBox(width: 20),
                              const Text(
                                "Terms & Conditions",
                                style: TextStyle(
                                  color: blackColor,
                                  fontWeight: FontWeight.bold,
                                  fontSize: 16,
                                ),
                              )
                            ],
                          ),
                          const Icon(
                            Icons.chevron_right_rounded,
                            color: Colors.grey,
                            size: 25,
                          ),
                        ],
                      ),
                    ),
                  ),
                  GestureDetector(
                    onTap: () {
                      showDialog(
                        context: context,
                        builder: (BuildContext context) {
                          return AlertDialog(
                            backgroundColor: whiteColor,
                            title: const Text(
                              'Confirm Logout',
                              style: TextStyle(
                                fontSize: 22,
                                fontWeight: FontWeight.bold,
                                color: blackColor,
                              ),
                            ),
                            content: const Text(
                              'Are you sure you want to logout?',
                              style: TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.bold,
                                color: blackColor,
                              ),
                            ),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(15),
                            ),
                            actions: [
                              TextButton(
                                onPressed: () {
                                  Navigator.of(context).pop();
                                },
                                child: const Text(
                                  'Cancel',
                                  style: TextStyle(
                                    color: primaryColor,
                                    fontWeight: FontWeight.bold,
                                    fontSize: 16,
                                  ),
                                ),
                              ),
                              TextButton(
                                onPressed: () {
                                  Navigator.of(context).pop();
                                  _logout();
                                },
                                child: const Text(
                                  'Logout',
                                  style: TextStyle(
                                    color: primaryColor,
                                    fontWeight: FontWeight.bold,
                                    fontSize: 16,
                                  ),
                                ),
                              ),
                            ],
                          );
                        },
                      );
                    },
                    child: Container(
                      decoration: const BoxDecoration(),
                      padding: const EdgeInsets.symmetric(vertical: 10),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.start,
                            children: [
                              Container(
                                decoration: BoxDecoration(
                                  color: primaryColor.withOpacity(0.1),
                                  borderRadius: BorderRadius.circular(10),
                                ),
                                padding: const EdgeInsets.all(8.0),
                                child: const Icon(
                                  Icons.logout,
                                  color: Colors.black54,
                                  size: 20,
                                ),
                              ),
                              const SizedBox(width: 20),
                              const Text(
                                "Log out",
                                style: TextStyle(
                                  color: blackColor,
                                  fontWeight: FontWeight.bold,
                                  fontSize: 16,
                                ),
                              )
                            ],
                          ),
                          const Icon(
                            Icons.chevron_right_rounded,
                            color: Colors.grey,
                            size: 25,
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
            Container(
              width: double.infinity,
              height: 10,
              color: primaryColor.withOpacity(0.05),
            ),
            const Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                SizedBox(height: 20),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(
                      Icons.phone_outlined,
                      color: blackColor,
                      size: 20,
                    ),
                    SizedBox(width: 10),
                    Text(
                      'Hotline:',
                      style: TextStyle(
                        color: blackColor,
                        fontSize: 14,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    SizedBox(width: 5),
                    Text(
                      '1900 1234',
                      style: TextStyle(
                        color: primaryColor,
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    )
                  ],
                ),

              ],
            ),
            const SizedBox(height: 30),
          ],
        ),
      ),
    );
  }
}