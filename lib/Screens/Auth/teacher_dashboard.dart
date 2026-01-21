import 'dart:async';
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:dotted_border/dotted_border.dart';
import 'package:intl/intl.dart';
import 'package:image_picker/image_picker.dart';

import 'package:firebase_auth/firebase_auth.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:little_emmi/Services/cloudinary_service.dart';
import 'package:little_emmi/Screens/Dashboard/dashboard_screen.dart';

// ✅ IMPORT THE LOGIN SCREEN (Adjust path if needed)
import 'package:little_emmi/Screens/Auth/login_screen.dart';

class TeacherDashboardScreen extends StatefulWidget {
  const TeacherDashboardScreen({super.key});

  @override
  State<TeacherDashboardScreen> createState() => _TeacherDashboardScreenState();
}

class _TeacherDashboardScreenState extends State<TeacherDashboardScreen> {
  String _teacherName = "Teacher";
  String _teacherSchoolId = "";
  bool _isUploading = false;
  File? _selectedImageFile;
  final CloudinaryService _cloudinary = CloudinaryService();

  // 🎓 Dynamic Classes State
  List<String> _classes = [];
  bool _isLoadingClasses = true;
  int _selectedClassIndex = 0;

  // 📢 BROADCAST STATE
  final TextEditingController _noticeTitleController = TextEditingController();
  final TextEditingController _noticeMessageController = TextEditingController();
  bool _isSendingNotice = false;

  final List<DashboardItem> _availableTools = [
    DashboardItem(title: 'Little Emmi', subtitle: '', icon: Icons.child_care_outlined, accentColor: Colors.teal, onTap: () {}),
    DashboardItem(title: 'Python IDE', subtitle: '', icon: Icons.code_outlined, accentColor: Colors.amber.shade700, onTap: () {}),
    DashboardItem(title: 'Flowchart', subtitle: '', icon: Icons.account_tree_outlined, accentColor: Colors.orange, onTap: () {}),
    DashboardItem(title: 'MIT App Inventor', subtitle: '', icon: Icons.extension_outlined, accentColor: Colors.green, onTap: () {}),
    DashboardItem(title: 'Office Suite', subtitle: '', icon: Icons.grid_view_rounded, accentColor: Colors.indigo, onTap: () {}),
    DashboardItem(title: 'Custom / Paper', subtitle: '', icon: Icons.edit_document, accentColor: Colors.pinkAccent, onTap: () {}),
  ];

  DashboardItem? _selectedToolForProject;
  final TextEditingController _projectTitleController = TextEditingController();
  final TextEditingController _projectDescController = TextEditingController();
  final TextEditingController _hintTextController = TextEditingController();

  DateTime? _selectedDueDate;
  String _hintType = 'none'; // 'none', 'text', 'image'

  @override
  void initState() {
    super.initState();
    _fetchTeacherDetails();
  }

  Future<void> _fetchTeacherDetails() async {
    final user = FirebaseAuth.instance.currentUser;
    if (user != null) {
      try {
        final doc = await FirebaseFirestore.instance.collection('users').doc(user.uid).get();
        if (doc.exists) {
          Map<String, dynamic> data = doc.data()!;
          setState(() {
            _teacherName = data['name'] ?? "Teacher";
            _teacherSchoolId = data['schoolId'] ?? "";
            if (data['assignedClasses'] != null) {
              _classes = List<String>.from(data['assignedClasses']);
            } else {
              _classes = [];
            }
            _isLoadingClasses = false;
          });
        }
      } catch (e) {
        debugPrint("Error fetching teacher details: $e");
        setState(() => _isLoadingClasses = false);
      }
    }
  }

  // --- FIXED DATE PICKER LOGIC ---
  Future<void> _pickDateTime() async {
    final DateTime? pickedDate = await showDatePicker(
      context: context,
      initialDate: DateTime.now(),
      firstDate: DateTime.now(),
      lastDate: DateTime.now().add(const Duration(days: 365)),
    );

    if (pickedDate != null) {
      if (!mounted) return;
      final TimeOfDay? pickedTime = await showTimePicker(
        context: context,
        initialTime: TimeOfDay.now(),
      );

      if (pickedTime != null) {
        setState(() {
          _selectedDueDate = DateTime(
            pickedDate.year,
            pickedDate.month,
            pickedDate.day,
            pickedTime.hour,
            pickedTime.minute,
          );
        });
      }
    }
  }

  Future<void> _pickImage() async {
    try {
      final picker = ImagePicker();
      final pickedFile = await picker.pickImage(source: ImageSource.gallery);
      if (pickedFile != null) setState(() => _selectedImageFile = File(pickedFile.path));
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text("Gallery Error: $e"), backgroundColor: Colors.red));
    }
  }

  void _handleAppDrop(DashboardItem item) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: Row(children: [
          const Icon(Icons.post_add_rounded, color: Colors.deepPurple),
          const SizedBox(width: 10),
          Text("Assign ${item.title}?", style: GoogleFonts.poppins(fontSize: 18, fontWeight: FontWeight.bold)),
        ]),
        content: Text(
          "Do you want to create a new task for students using '${item.title}'?",
          style: GoogleFonts.poppins(fontSize: 14),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text("Cancel", style: GoogleFonts.poppins(color: Colors.grey)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.deepPurple,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
            onPressed: () {
              setState(() => _selectedToolForProject = item);
              Navigator.pop(context);
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text("Selected ${item.title} for assignment"),
                  backgroundColor: Colors.green,
                ),
              );
            },
            child: Text("Confirm", style: GoogleFonts.poppins(color: Colors.white)),
          ),
        ],
      ),
    );
  }

  // 📢 SEND BROADCAST FUNCTION
  Future<void> _sendBroadcast() async {
    if (_noticeTitleController.text.isEmpty || _noticeMessageController.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text("Please fill in Title and Message!")));
      return;
    }

    setState(() => _isSendingNotice = true);

    try {
      await FirebaseFirestore.instance.collection('broadcasts').add({
        'title': _noticeTitleController.text.trim(),
        'message': _noticeMessageController.text.trim(),
        'className': _classes[_selectedClassIndex],
        'teacherName': _teacherName,
        'schoolId': _teacherSchoolId,
        'timestamp': FieldValue.serverTimestamp(),
      });

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(
            content: Text("Notice sent to ${_classes[_selectedClassIndex]}!"),
            backgroundColor: Colors.orangeAccent
        ));
        setState(() {
          _noticeTitleController.clear();
          _noticeMessageController.clear();
          _isSendingNotice = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isSendingNotice = false);
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text("Error: $e"), backgroundColor: Colors.red));
      }
    }
  }

  Future<void> _createProject() async {
    if (_projectTitleController.text.isEmpty || _selectedToolForProject == null || _selectedDueDate == null) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text("Please fill in Title, Tool, and Due Date!")));
      return;
    }
    setState(() => _isUploading = true);
    try {
      String? imageUrl;
      if (_hintType == 'image' && _selectedImageFile != null) {
        imageUrl = await _cloudinary.uploadImage(_selectedImageFile!);
      }

      await FirebaseFirestore.instance.collection('assignments').add({
        'title': _projectTitleController.text.trim(),
        'description': _projectDescController.text.trim(),
        'tool': _selectedToolForProject!.title,
        'className': _classes[_selectedClassIndex],
        'schoolId': _teacherSchoolId,
        'dueDate': Timestamp.fromDate(_selectedDueDate!),
        'createdAt': FieldValue.serverTimestamp(),
        'teacherName': _teacherName,
        'hintType': _hintType,
        'hintContent': _hintType == 'text' ? _hintTextController.text.trim() : (imageUrl ?? ''),
        'status': 'active',
      });

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text("Assignment uploaded for ${_classes[_selectedClassIndex]}!"), backgroundColor: Colors.green));
        setState(() {
          _projectTitleController.clear();
          _projectDescController.clear();
          _hintTextController.clear();
          _selectedToolForProject = null;
          _selectedDueDate = null;
          _selectedImageFile = null;
          _hintType = 'none';
          _isUploading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isUploading = false);
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text("Error: $e"), backgroundColor: Colors.red));
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoadingClasses) return const Scaffold(body: Center(child: CircularProgressIndicator()));
    if (_classes.isEmpty) return const Scaffold(body: Center(child: Text("No classes assigned.")));

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      body: Stack(
        children: [
          const Positioned.fill(child: _TeacherBackground()),
          SafeArea(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildHeader(context),
                  const SizedBox(height: 24),

                  // Class Selector
                  SizedBox(
                    height: 50,
                    child: ListView.separated(
                      scrollDirection: Axis.horizontal, itemCount: _classes.length, separatorBuilder: (_, __) => const SizedBox(width: 12),
                      itemBuilder: (context, index) {
                        final isSelected = index == _selectedClassIndex;
                        return GestureDetector(
                          onTap: () => setState(() => _selectedClassIndex = index),
                          child: AnimatedContainer(duration: const Duration(milliseconds: 200), padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12), decoration: BoxDecoration(color: isSelected ? Colors.indigoAccent : Colors.white, borderRadius: BorderRadius.circular(25), border: Border.all(color: isSelected ? Colors.indigoAccent : Colors.grey.shade300)), child: Text(_classes[index], style: GoogleFonts.poppins(color: isSelected ? Colors.white : Colors.blueGrey[700], fontWeight: FontWeight.w600))),
                        );
                      },
                    ),
                  ),

                  const SizedBox(height: 30),
                  Text("Create Assignment", style: GoogleFonts.poppins(fontSize: 20, fontWeight: FontWeight.bold, color: Colors.blueGrey[900])),
                  const SizedBox(height: 16),

                  SizedBox(
                    height: 80,
                    child: ListView.builder(
                      scrollDirection: Axis.horizontal,
                      itemCount: _availableTools.length,
                      itemBuilder: (context, index) {
                        return Draggable<DashboardItem>(
                          data: _availableTools[index],
                          feedback: Material(
                            color: Colors.transparent,
                            child: Opacity(
                              opacity: 0.7,
                              child: _buildToolChip(_availableTools[index], isDragging: true),
                            ),
                          ),
                          childWhenDragging: Opacity(opacity: 0.3, child: _buildToolChip(_availableTools[index])),
                          child: _buildToolChip(_availableTools[index]),
                        );
                      },
                    ),
                  ),
                  const SizedBox(height: 16),

                  _buildProjectCreatorCard(),

                  const SizedBox(height: 30),

                  // 📢 NEW: BROADCAST SECTION
                  Text("Class Announcement", style: GoogleFonts.poppins(fontSize: 20, fontWeight: FontWeight.bold, color: Colors.blueGrey[900])),
                  const SizedBox(height: 16),
                  _buildBroadcastCard(),

                  const SizedBox(height: 40),
                  Text("Recent Uploads", style: GoogleFonts.poppins(fontSize: 20, fontWeight: FontWeight.bold, color: Colors.blueGrey[900])),
                  const SizedBox(height: 16),
                  _buildAssignmentList(),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  // --- WIDGET BUILDERS ---

  Widget _buildBroadcastCard() {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: const Color(0xFFFFF8E1), // Light Amber
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: Colors.orange.withOpacity(0.3), width: 1),
        boxShadow: [BoxShadow(color: Colors.orange.withOpacity(0.1), blurRadius: 20)],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.campaign_rounded, color: Colors.orange, size: 28),
              const SizedBox(width: 10),
              Text("Send Notice to ${_classes[_selectedClassIndex]}", style: GoogleFonts.poppins(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.brown[800])),
            ],
          ),
          const SizedBox(height: 16),
          _buildStyledTextField(_noticeTitleController, "Subject (e.g., Exam Postponed)", Icons.title),
          const SizedBox(height: 12),
          _buildStyledTextField(_noticeMessageController, "Type your message here...", Icons.message_outlined, maxLines: 3),
          const SizedBox(height: 16),
          SizedBox(
            width: double.infinity,
            height: 45,
            child: ElevatedButton.icon(
              onPressed: _isSendingNotice ? null : _sendBroadcast,
              style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.orange,
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  elevation: 0
              ),
              icon: _isSendingNotice
                  ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                  : const Icon(Icons.send_rounded, size: 18),
              label: Text("Broadcast Notice", style: GoogleFonts.poppins(fontWeight: FontWeight.bold)),
            ),
          )
        ],
      ),
    );
  }

  Widget _buildToolChip(DashboardItem item, {bool isDragging = false}) {
    return Container(
      margin: const EdgeInsets.only(right: 12),
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: item.accentColor.withOpacity(0.5)),
        boxShadow: isDragging ? [] : [BoxShadow(color: Colors.grey.withOpacity(0.1), blurRadius: 4, offset: const Offset(0, 2))],
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(item.icon, color: item.accentColor, size: 20),
          const SizedBox(width: 8),
          Text(item.title, style: GoogleFonts.poppins(fontSize: 12, fontWeight: FontWeight.w600, color: Colors.blueGrey[800])),
        ],
      ),
    );
  }

  Widget _buildProjectCreatorCard() {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.95),
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: Colors.white, width: 2),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 20)],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildStyledTextField(_projectTitleController, "Project Title", Icons.title),
          const SizedBox(height: 12),
          _buildStyledTextField(_projectDescController, "Instructions...", Icons.description, maxLines: 3),
          const SizedBox(height: 20),
          Text("Required Tool (Drag & Drop here)", style: GoogleFonts.poppins(fontSize: 12, fontWeight: FontWeight.w600, color: Colors.grey[600])),
          const SizedBox(height: 8),
          DragTarget<DashboardItem>(
            onAcceptWithDetails: (details) {
              _handleAppDrop(details.data);
            },
            builder: (context, candidateData, rejectedData) {
              bool isHovered = candidateData.isNotEmpty;
              return DottedBorder(
                borderType: BorderType.RRect,
                radius: const Radius.circular(12),
                color: isHovered ? Colors.indigoAccent : (_selectedToolForProject != null ? _selectedToolForProject!.accentColor : Colors.grey.shade400),
                strokeWidth: 2,
                dashPattern: const [6, 3],
                child: Container(
                  width: double.infinity,
                  height: 60,
                  alignment: Alignment.center,
                  decoration: BoxDecoration(
                    color: isHovered ? Colors.indigo.withOpacity(0.05) : (_selectedToolForProject != null ? _selectedToolForProject!.accentColor.withOpacity(0.1) : Colors.transparent),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: _selectedToolForProject != null
                      ? Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(_selectedToolForProject!.icon, color: _selectedToolForProject!.accentColor),
                      const SizedBox(width: 8),
                      Text(_selectedToolForProject!.title, style: GoogleFonts.poppins(fontWeight: FontWeight.bold, color: _selectedToolForProject!.accentColor)),
                      const SizedBox(width: 8),
                      IconButton(icon: const Icon(Icons.close, size: 16), onPressed: () => setState(() => _selectedToolForProject = null))
                    ],
                  )
                      : Text("Drop Tool Here", style: GoogleFonts.poppins(color: Colors.grey[500], fontSize: 13)),
                ),
              );
            },
          ),

          const SizedBox(height: 20),
          Text("Add Hint (Optional)", style: GoogleFonts.poppins(fontSize: 12, fontWeight: FontWeight.w600, color: Colors.grey[600])),
          const SizedBox(height: 8),
          Row(
            children: [
              _buildHintTypeChip('none', 'No Hint'),
              const SizedBox(width: 8),
              _buildHintTypeChip('text', 'Text Hint'),
              const SizedBox(width: 8),
              _buildHintTypeChip('image', 'Image Hint'),
            ],
          ),
          const SizedBox(height: 12),
          if (_hintType == 'text')
            _buildStyledTextField(_hintTextController, "Enter hint text...", Icons.lightbulb_outline),
          if (_hintType == 'image')
            GestureDetector(
              onTap: _pickImage,
              child: Container(
                height: 120,
                width: double.infinity,
                decoration: BoxDecoration(
                    color: Colors.grey[100],
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: Colors.grey.shade300),
                    image: _selectedImageFile != null
                        ? DecorationImage(image: FileImage(_selectedImageFile!), fit: BoxFit.cover)
                        : null
                ),
                child: _selectedImageFile == null
                    ? Column(mainAxisAlignment: MainAxisAlignment.center, children: [const Icon(Icons.add_photo_alternate, color: Colors.grey), Text("Tap to upload image", style: GoogleFonts.poppins(fontSize: 12, color: Colors.grey))])
                    : null,
              ),
            ),

          const SizedBox(height: 20),
          Text("Deadline", style: GoogleFonts.poppins(fontSize: 12, fontWeight: FontWeight.w600, color: Colors.grey[600])),
          const SizedBox(height: 8),
          InkWell(
            onTap: _pickDateTime,
            borderRadius: BorderRadius.circular(12),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              decoration: BoxDecoration(
                  color: _selectedDueDate != null ? Colors.indigoAccent.withOpacity(0.1) : Colors.grey[50],
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: _selectedDueDate != null ? Colors.indigoAccent : Colors.grey.shade300)
              ),
              child: Row(
                children: [
                  Icon(Icons.calendar_today_rounded, size: 18, color: _selectedDueDate != null ? Colors.indigoAccent : Colors.grey),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      _selectedDueDate == null ? "Select Date & Time" : DateFormat('MMM dd • HH:mm').format(_selectedDueDate!),
                      style: GoogleFonts.poppins(color: _selectedDueDate != null ? Colors.indigo[900] : Colors.grey[600], fontWeight: FontWeight.w600, fontSize: 13),
                    ),
                  ),
                ],
              ),
            ),
          ),

          const SizedBox(height: 24),
          SizedBox(
            width: double.infinity,
            height: 50,
            child: ElevatedButton(
              onPressed: (_isUploading) ? null : _createProject,
              style: ElevatedButton.styleFrom(backgroundColor: Colors.indigoAccent, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))),
              child: _isUploading
                  ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                  : Text("Assign to ${_classes.isNotEmpty ? _classes[_selectedClassIndex] : 'Class'}", style: GoogleFonts.poppins(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16)),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildHintTypeChip(String type, String label) {
    bool isSelected = _hintType == type;
    return GestureDetector(
      onTap: () => setState(() => _hintType = type),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        decoration: BoxDecoration(
          color: isSelected ? Colors.indigo : Colors.transparent,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: isSelected ? Colors.indigo : Colors.grey.shade300),
        ),
        child: Text(label, style: GoogleFonts.poppins(fontSize: 11, color: isSelected ? Colors.white : Colors.grey[600], fontWeight: isSelected ? FontWeight.w600 : FontWeight.normal)),
      ),
    );
  }

  Widget _buildAssignmentList() {
    return StreamBuilder<QuerySnapshot>(
      stream: FirebaseFirestore.instance.collection('assignments').where('className', isEqualTo: _classes.isNotEmpty ? _classes[_selectedClassIndex] : '').orderBy('createdAt', descending: true).snapshots(),
      builder: (context, snapshot) {
        if (!snapshot.hasData || snapshot.data!.docs.isEmpty) return const SizedBox.shrink();
        return ListView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: snapshot.data!.docs.length,
            itemBuilder: (context, index) {
              final data = snapshot.data!.docs[index].data() as Map<String, dynamic>;
              DateTime due = DateTime.now();
              if (data['dueDate'] != null && data['dueDate'] is Timestamp) due = (data['dueDate'] as Timestamp).toDate();
              return _buildProjectListTile({
                'title': data['title'] ?? 'Untitled',
                'tool': data['tool'] ?? 'Unknown',
                'due': due,
              });
            });
      },
    );
  }

  Widget _buildProjectListTile(Map<String, dynamic> project) {
    return Container(
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: Colors.grey.shade200)),
        child: Row(children: [
          const Icon(Icons.assignment),
          const SizedBox(width: 16),
          Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [Text(project['title']), Text("Due: ${DateFormat('MMM dd').format(project['due'])}", style: const TextStyle(fontSize: 12))]))
        ]));
  }

  Widget _buildStyledTextField(TextEditingController controller, String hint, IconData icon, {int maxLines = 1}) => TextField(controller: controller, maxLines: maxLines, decoration: InputDecoration(hintText: hint, prefixIcon: Icon(icon, size: 20, color: Colors.grey[400]), filled: true, fillColor: Colors.white, border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: Colors.grey.shade200))));

  // ✅ FIXED HEADER AND LOGOUT
  Widget _buildHeader(BuildContext context) => Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text("Teacher Portal", style: GoogleFonts.poppins(fontSize: 14, color: Colors.blueGrey[500], fontWeight: FontWeight.w600)),
              Text("Welcome, $_teacherName", style: GoogleFonts.poppins(fontSize: 28, fontWeight: FontWeight.bold, color: Colors.blueGrey[900]))
            ]
        ),
        IconButton(
            icon: const Icon(Icons.logout_rounded, color: Colors.redAccent),
            onPressed: () async {
              // 1. Sign out from Firebase
              await FirebaseAuth.instance.signOut();

              if (!context.mounted) return;

              // 2. Clear history and go to Login Screen
              Navigator.pushAndRemoveUntil(
                context,
                MaterialPageRoute(builder: (context) => const LittleEmmiLoginScreen()),
                    (route) => false,
              );
            }
        )
      ]
  );
}

class _TeacherBackground extends StatelessWidget { const _TeacherBackground(); @override Widget build(BuildContext context) => Container(color: const Color(0xFFF8FAFC)); }