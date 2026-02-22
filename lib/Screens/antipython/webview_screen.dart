import 'package:flutter/material.dart';
import 'package:flutter/foundation.dart'; // For kIsWeb
import 'package:flutter_inappwebview/flutter_inappwebview.dart';
import 'package:permission_handler/permission_handler.dart';

class WebViewScreen extends StatefulWidget {
  const WebViewScreen({super.key});

  @override
  State<WebViewScreen> createState() => _WebViewScreenState();
}

class _WebViewScreenState extends State<WebViewScreen> {
  final GlobalKey webViewKey = GlobalKey();
  InAppWebViewController? webViewController;
  InAppLocalhostServer? localhostServer;
  bool _isLoading = true;
  String _loadingText = "Preparing Python Environment...";
  List<String> _debugLog = [];

  InAppWebViewSettings settings = InAppWebViewSettings(
    isInspectable: true,
    mediaPlaybackRequiresUserGesture: false,
    allowsInlineMediaPlayback: true,
    iframeAllow: "camera; microphone",
    iframeAllowFullscreen: true,
    useHybridComposition: true,
    allowContentAccess: true,
    allowFileAccess: true,
    allowFileAccessFromFileURLs: true,
    allowUniversalAccessFromFileURLs: true,
  );

  @override
  void initState() {
    super.initState();
    _initApp();
  }

  void _log(String message) {
    debugPrint("[AppDebug] $message");
    _debugLog.add(message);
  }

  Future<void> _initApp() async {
    // 1. Setup Local Assets
    await _setupWebAssets();

    // 2. Request Permissions (Platform specific)
    if (!kIsWeb &&
        (defaultTargetPlatform == TargetPlatform.android ||
            defaultTargetPlatform == TargetPlatform.iOS)) {
      _log("Requesting Mobile Permissions...");
      await _requestPermissions();
    } else {
      _log("Skipping permissions (Desktop/Web)");
    }
  }

  Future<void> _setupWebAssets() async {
    try {
      if (!kIsWeb) {
        // Start localhost server to serve assets for Native platforms
        localhostServer = InAppLocalhostServer(
          documentRoot: 'assets/antipython_web',
          port: 8084,
        );
        await localhostServer?.start();
        _log("Localhost server started on port 8084");
      }

      if (!mounted) return;
      setState(() {
        _loadingText = "Loading WebView...";
        _isLoading = false;
      });
    } catch (e) {
      _log("Asset Setup Error: $e");
      if (!mounted) return;
      setState(() {
        _loadingText = "Error: $e";
      });
    }
  }

  Future<void> _requestPermissions() async {
    try {
      await [Permission.camera, Permission.microphone].request();
    } catch (e) {
      _log("Error requesting permissions: $e");
    }
  }

  @override
  void dispose() {
    localhostServer?.close();
    webViewController?.dispose(); // Ensure controller is disposed
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return Scaffold(
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const CircularProgressIndicator(),
              const SizedBox(height: 16),
              Padding(
                padding: const EdgeInsets.all(16.0),
                child: Text(
                  _loadingText,
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    color: _loadingText.startsWith("Error")
                        ? Colors.red
                        : Colors.black,
                  ),
                ),
              ),
            ],
          ),
        ),
      );
    }

    return Scaffold(
      body: Stack(
        fit: StackFit.expand, // Force children to fill the available space
        children: [
          Container(
            color: Colors.white, // Background to prevent transparency issues
            child: InAppWebView(
              key: webViewKey,
              initialUrlRequest: URLRequest(
                url: kIsWeb
                    ? WebUri("assets/assets/antipython_web/index.html")
                    : WebUri("http://127.0.0.1:8084/index.html"),
              ),
              initialSettings: settings,
              onWebViewCreated: (controller) {
                webViewController = controller;
              },
              onPermissionRequest: (controller, request) async {
                return PermissionResponse(
                  resources: request.resources,
                  action: PermissionResponseAction.GRANT,
                );
              },
              onConsoleMessage: (controller, consoleMessage) {
                debugPrint("WEBVIEW: ${consoleMessage.message}");
              },
              onLoadError: (controller, url, code, message) {
                _log("WebView Load Error: $code, $message");
              },
              onLoadHttpError: (controller, url, statusCode, description) {
                _log("WebView HTTP Error: $statusCode, $description");
              },
            ),
          ),
          Positioned(
            top: 10,
            left: 10,
            child: Material(
              color: Colors.transparent,
              child: InkWell(
                onTap: () => Navigator.of(context).pop(),
                borderRadius: BorderRadius.circular(30),
                child: Container(
                  padding: const EdgeInsets.all(8),
                  child: const Icon(Icons.arrow_back, color: Colors.black87),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
