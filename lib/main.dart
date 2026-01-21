import 'dart:async';
import 'dart:io' show Platform; // Required for Platform checks
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:google_fonts/google_fonts.dart';

import 'package:little_emmi/Providers/block_provider.dart';
import 'Services/bluetooth_manager.dart';

// Firebase imports
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'firebase_options.dart';

// --- SCREENS IMPORTS ---
import 'Screens/BodyLayout/body_layout.dart';
import 'Screens/TopBar/top_bar.dart';
import 'package:camera_windows/camera_windows.dart';

// Import your screens
import 'package:little_emmi/Screens/Auth/login_screen.dart';
import 'package:little_emmi/Screens/Auth/activation_screen.dart';
import 'package:little_emmi/Screens/Dashboard/dashboard_screen.dart';
import 'package:little_emmi/Screens/Auth/student_dashboard.dart';
import 'package:little_emmi/Screens/Auth/teacher_dashboard.dart';
import 'package:little_emmi/Screens/MIT/mit_dashboard_screen.dart';
import 'package:little_emmi/Screens/MIT/mit_login_screen.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  // 🚀 Start UI Immediately
  runApp(const QubiQApp());
}

class QubiQApp extends StatelessWidget {
  const QubiQApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => BlockProvider()),
        ChangeNotifierProvider(create: (_) => BluetoothManager()),
      ],
      child: MaterialApp(
        debugShowCheckedModeBanner: false,
        title: 'QubiQAI',
        color: Colors.white,
        theme: ThemeData(
          brightness: Brightness.light,
          primarySwatch: Colors.indigo,
          scaffoldBackgroundColor: const Color(0xFFF8FAFC),
          useMaterial3: true,
        ),
        // 🚀 START HERE
        home: const RobotLaunchScreen(),

        routes: {
          '/activation': (context) => const ActivationScreen(),
          '/login': (context) => const LittleEmmiLoginScreen(),
          '/dashboard': (context) => const DashboardScreen(),
          '/auth/student': (context) => const StudentDashboardScreen(),
          '/auth/teacher': (context) => const TeacherDashboardScreen(),
          '/mit/login': (context) => const MitLoginScreen(),
          '/mit/dashboard': (context) => const MitDashboardScreen(),
          '/app/robot_workspace': (context) => const Scaffold(
            body: SafeArea(
              child: Column(
                children: [
                  TopBar(),
                  Expanded(child: BodyLayout()),
                ],
              ),
            ),
          ),
        },
      ),
    );
  }
}

// ------------------------------------------------------------------
// 🚀 SPLASH SCREEN
// ------------------------------------------------------------------
class RobotLaunchScreen extends StatefulWidget {
  const RobotLaunchScreen({super.key});

  @override
  State<RobotLaunchScreen> createState() => _RobotLaunchScreenState();
}

class _RobotLaunchScreenState extends State<RobotLaunchScreen> with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _opacityAnimation;
  late Animation<Offset> _slideAnimation;

  @override
  void initState() {
    super.initState();
    // 1. Start Animation Immediately
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 3),
    );

    _opacityAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _controller, curve: const Interval(0.0, 0.6, curve: Curves.easeIn)),
    );

    _slideAnimation = Tween<Offset>(begin: const Offset(0, 0.2), end: Offset.zero).animate(
      CurvedAnimation(parent: _controller, curve: const Interval(0.0, 0.6, curve: Curves.easeOutCubic)),
    );

    _controller.forward();

    // 2. Add a tiny delay before starting heavy logic to let the UI paint first
    // This fixes the "Intermittent Black Screen" on phones
    Future.delayed(const Duration(milliseconds: 100), () {
      _initializeApp();
    });
  }

  Future<void> _initializeApp() async {
    try {
      // A. Initialize Firebase
      await Firebase.initializeApp(
        options: DefaultFirebaseOptions.currentPlatform,
      );

      // 🛑 B. DESKTOP LOGOUT FIX (Added MacOS Support):
      if (Platform.isWindows || Platform.isMacOS) {
        await FirebaseAuth.instance.signOut();
      }

      // C. Initialize Camera (Windows Check)
      if (Platform.isWindows) {
        try {
          CameraWindows.registerWith();
        } catch (e) {
          debugPrint("Camera init skipped: $e");
        }
      }

      // D. Load Preferences
      SharedPreferences prefs = await SharedPreferences.getInstance();
      bool isActivated = prefs.getBool('is_activated') ?? false;

      // E. Wait (Total 3 seconds for animation)
      await Future.delayed(const Duration(seconds: 3));

      if (!mounted) return;

      // F. Navigate
      if (isActivated) {
        Navigator.of(context).pushReplacement(
          MaterialPageRoute(builder: (context) => const AuthWrapper()),
        );
      } else {
        Navigator.of(context).pushReplacementNamed('/activation');
      }

    } catch (e) {
      debugPrint("Critical Init Error: $e");
      if (mounted) {
        Navigator.of(context).pushReplacement(
          MaterialPageRoute(builder: (context) => const LittleEmmiLoginScreen()),
        );
      }
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [Colors.white, Color(0xFFF1F5F9)],
          ),
        ),
        child: Center(
          child: SlideTransition(
            position: _slideAnimation,
            child: FadeTransition(
              opacity: _opacityAnimation,
              child: Padding(
                padding: const EdgeInsets.all(40.0),
                child: Image.asset(
                  'assets/images/qubiq_logo.png',
                  width: 700,
                  fit: BoxFit.contain,
                  errorBuilder: (context, error, stackTrace) {
                    return const Icon(Icons.smart_toy_rounded, size: 100, color: Colors.indigo);
                  },
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

// ------------------------------------------------------------------
// 🚀 AUTH WRAPPER
// ------------------------------------------------------------------
class AuthWrapper extends StatelessWidget {
  const AuthWrapper({super.key});

  @override
  Widget build(BuildContext context) {
    return StreamBuilder<User?>(
      stream: FirebaseAuth.instance.authStateChanges(),
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Scaffold(body: Center(child: CircularProgressIndicator()));
        }
        if (snapshot.hasData) {
          return const StudentDashboardScreen();
        }
        return const LittleEmmiLoginScreen();
      },
    );
  }
}