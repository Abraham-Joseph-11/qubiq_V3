import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_inappwebview/flutter_inappwebview.dart';
import 'package:permission_handler/permission_handler.dart';

class TeachablePoseScreen extends StatefulWidget {
  const TeachablePoseScreen({super.key});

  @override
  State<TeachablePoseScreen> createState() => _TeachablePoseScreenState();
}

class _TeachablePoseScreenState extends State<TeachablePoseScreen> {
  InAppLocalhostServer? localhostServer;
  bool isServerRunning = false;

  @override
  void initState() {
    super.initState();
    _startLocalServer();
    _requestPermissions();
  }

  Future<void> _startLocalServer() async {
    if (kIsWeb) {
      setState(() {
        isServerRunning = true;
      });
      return;
    }

    // Using port 8088 for Teachable Pose to avoid conflicts
    localhostServer = InAppLocalhostServer(
      documentRoot: 'assets/teachable/pose',
      port: 8088,
    );

    try {
      await localhostServer?.start();
      setState(() {
        isServerRunning = true;
      });
      debugPrint("Teachable Pose Localhost server started on port 8088");
    } catch (e) {
      debugPrint("Error starting localhost server: $e");
    }
  }

  Future<void> _requestPermissions() async {
    if (!kIsWeb && Platform.isMacOS) {
      return;
    }
    await [Permission.camera, Permission.microphone].request();
  }

  @override
  void dispose() {
    localhostServer?.close();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Train Pose Model'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => Navigator.of(context).pop(),
        ),
      ),
      body: !isServerRunning
          ? const Center(child: CircularProgressIndicator())
          : SafeArea(
              child: InAppWebView(
                initialUrlRequest: URLRequest(
                  url: kIsWeb
                      ? WebUri(
                          "assets/assets/teachable/pose/index.html#/pose?mode=standalone")
                      : WebUri(
                          "http://localhost:8088/index.html#/pose?mode=standalone",
                        ),
                ),
                initialSettings: InAppWebViewSettings(
                  isInspectable: kDebugMode,
                  mediaPlaybackRequiresUserGesture: false,
                  allowsInlineMediaPlayback: true,
                  iframeAllow: "camera; microphone",
                  iframeAllowFullscreen: true,
                ),
                onPermissionRequest: (controller, request) async {
                  return PermissionResponse(
                    resources: request.resources,
                    action: PermissionResponseAction.GRANT,
                  );
                },
                onConsoleMessage: (controller, consoleMessage) {
                  if (kDebugMode) {
                    print("TEACHABLE POSE CONSOLE: ${consoleMessage.message}");
                  }
                },
              ),
            ),
    );
  }
}
