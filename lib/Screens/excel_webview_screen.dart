import 'package:flutter/material.dart';
import 'excel_webview_cross.dart';

class ExcelWebViewScreen extends StatelessWidget {
  const ExcelWebViewScreen({super.key});

  @override
  Widget build(BuildContext context) {
    // Scaffold is already provided by ExcelWebViewCross
    return const ExcelWebViewPlatformComponent();
  }
}
