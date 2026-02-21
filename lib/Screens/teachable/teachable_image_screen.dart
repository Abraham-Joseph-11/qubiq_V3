import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_inappwebview/flutter_inappwebview.dart';
import 'package:permission_handler/permission_handler.dart';

class TeachableImageScreen extends StatefulWidget {
  const TeachableImageScreen({super.key});

  @override
  State<TeachableImageScreen> createState() => _TeachableImageScreenState();
}

class _TeachableImageScreenState extends State<TeachableImageScreen> {
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

    // Using port 8086 for Teachable Image to avoid conflicts
    localhostServer = InAppLocalhostServer(
      documentRoot: 'assets/teachable/image',
      port: 8086,
    );

    try {
      await localhostServer?.start();
      setState(() {
        isServerRunning = true;
      });
      debugPrint("Teachable Image Localhost server started on port 8086");
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
        title: const Text('Train Image Model'),
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
                          "assets/assets/teachable/image/teachable.html#/image?mode=standalone")
                      : WebUri(
                          "http://localhost:8086/teachable.html#/image?mode=standalone",
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
                    print("TEACHABLE IMAGE CONSOLE: ${consoleMessage.message}");
                  }
                },
              ),
            ),
    );
  }
}
