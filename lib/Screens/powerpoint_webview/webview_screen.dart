import 'package:flutter/material.dart';
import '../powerpoint_webview_cross.dart';

class PresentationWebViewScreen extends StatelessWidget {
  const PresentationWebViewScreen({super.key});

  @override
  Widget build(BuildContext context) {
    // Scaffold is already provided by PowerPointWebViewCross
    return const PowerPointWebViewPlatformComponent(); // Connect to the cross-platform widget
  }
}
