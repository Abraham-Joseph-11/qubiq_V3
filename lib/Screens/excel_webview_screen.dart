import 'package:flutter/material.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_inappwebview/flutter_inappwebview.dart';

class ExcelWebViewScreen extends StatefulWidget {
  const ExcelWebViewScreen({super.key});

  @override
  State<ExcelWebViewScreen> createState() => _ExcelWebViewScreenState();
}

class _ExcelWebViewScreenState extends State<ExcelWebViewScreen> {
  InAppWebViewController? webViewController;
  InAppLocalhostServer? localhostServer;
  bool isServerRunning = false;
  double progress = 0;

  @override
  void initState() {
    super.initState();
    _startLocalServer();
  }

  Future<void> _startLocalServer() async {
    if (kIsWeb) {
      setState(() {
        isServerRunning = true;
      });
      return;
    }

    // Start localhost server to serve assets
    // Using port 8082 to avoid conflict with other potential servers (Presentation: 8081, PyBlock: 8080)
    localhostServer = InAppLocalhostServer(
      documentRoot: 'assets/excel_web/dist',
      port: 8082,
    );

    try {
      await localhostServer?.start();
      setState(() {
        isServerRunning = true;
      });
      debugPrint("Excel Localhost server started on port 8082");
    } catch (e) {
      debugPrint("Error starting localhost server: $e");
    }
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
        title: const Text('Excel'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () {
              webViewController?.reload();
            },
          ),
        ],
      ),
      body: !isServerRunning
          ? const Center(child: CircularProgressIndicator())
          : Stack(
              children: [
                InAppWebView(
                  initialUrlRequest: URLRequest(
                    url: WebUri(
                      kIsWeb
                          ? "assets/assets/excel_web/dist/index.html"
                          : "http://127.0.0.1:8082/index.html",
                    ),
                  ),
                  initialSettings: InAppWebViewSettings(
                    isInspectable: kDebugMode,
                    javaScriptEnabled: true,
                    // Allow scaling if needed
                    useWideViewPort: true,
                    loadWithOverviewMode: true,
                    allowFileAccessFromFileURLs: true,
                    allowUniversalAccessFromFileURLs: true,
                  ),
                  onWebViewCreated: (controller) {
                    webViewController = controller;
                  },
                  onProgressChanged: (controller, p) {
                    setState(() {
                      progress = p / 100;
                    });
                  },
                  onConsoleMessage: (controller, consoleMessage) {
                    debugPrint("Excel JS: ${consoleMessage.message}");
                  },
                ),
                if (progress < 1.0) LinearProgressIndicator(value: progress),
              ],
            ),
    );
  }
}
