import 'package:flutter/material.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_inappwebview/flutter_inappwebview.dart';

class PresentationWebViewScreen extends StatefulWidget {
  const PresentationWebViewScreen({super.key});

  @override
  State<PresentationWebViewScreen> createState() => _PresentationWebViewScreenState();
}

class _PresentationWebViewScreenState extends State<PresentationWebViewScreen> {
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
    // Using port 8081 to avoid conflict with other potential servers (e.g. pyblock using 8080)
    localhostServer = InAppLocalhostServer(
      documentRoot: 'assets/web/dist',
      port: 8083,
    );

    try {
      await localhostServer?.start();
      setState(() {
        isServerRunning = true;
      });
      debugPrint("Presentation Localhost server started on port 8083");
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
        title: const Text('Presentation'),
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
                          ? "assets/assets/web/dist/index.html"
                          : "http://localhost:8083/index.html",
                    ),
                  ),
                  initialSettings: InAppWebViewSettings(
                    isInspectable: kDebugMode,
                    javaScriptEnabled: true,
                    // Allow scaling if needed for the presentation
                    useWideViewPort: true,
                    loadWithOverviewMode: true,
                    // File access might not be strictly necessary with localhost but good to heva
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
                    debugPrint("Presentation JS: ${consoleMessage.message}");
                  },
                ),
                if (progress < 1.0)
                  LinearProgressIndicator(value: progress),
              ],
            ),
    );
  }
}
