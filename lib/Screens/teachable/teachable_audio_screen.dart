import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_inappwebview/flutter_inappwebview.dart';
import 'package:permission_handler/permission_handler.dart';

class TeachableAudioScreen extends StatefulWidget {
  const TeachableAudioScreen({super.key});

  @override
  State<TeachableAudioScreen> createState() => _TeachableAudioScreenState();
}

class _TeachableAudioScreenState extends State<TeachableAudioScreen> {
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

    // Using port 8087 for Teachable Audio to avoid conflicts
    localhostServer = InAppLocalhostServer(
      documentRoot: 'assets/teachable/audio',
      port: 8087,
    );

    try {
      await localhostServer?.start();
      setState(() {
        isServerRunning = true;
      });
      debugPrint("Teachable Audio Localhost server started on port 8087");
    } catch (e) {
      debugPrint("Error starting localhost server: $e");
    }
  }

  Future<void> _requestPermissions() async {
    if (kIsWeb || Platform.isMacOS || Platform.isWindows) {
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
        title: const Text('Train Audio Model'),
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
                          "assets/assets/teachable/audio/teachable.html#/audio?mode=standalone")
                      : WebUri(
                          "http://localhost:8087/teachable.html#/audio?mode=standalone",
                        ),
                ),
                initialSettings: InAppWebViewSettings(
                  isInspectable: kDebugMode,
                  javaScriptEnabled: true,
                  domStorageEnabled: true,
                  hardwareAcceleration: true,
                  safeBrowsingEnabled: false,
                  mediaPlaybackRequiresUserGesture: false,
                  allowsInlineMediaPlayback: true,
                  iframeAllow: "camera; microphone",
                  iframeAllowFullscreen: true,
                  allowFileAccessFromFileURLs: true,
                  allowUniversalAccessFromFileURLs: true,
                ),
                onPermissionRequest: (controller, request) async {
                  return PermissionResponse(
                    resources: request.resources,
                    action: PermissionResponseAction.GRANT,
                  );
                },
                onConsoleMessage: (controller, consoleMessage) {
                  if (kDebugMode) {
                    print("TEACHABLE AUDIO CONSOLE: ${consoleMessage.message}");
                  }
                },
              ),
            ),
    );
  }
}
