import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter/foundation.dart'; // For kIsWeb
import 'package:flutter/services.dart' show rootBundle;
import 'package:flutter_inappwebview/flutter_inappwebview.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:path_provider/path_provider.dart';
import 'package:archive/archive.dart';
// <-- ADDED import

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
    // Web Verification Guard
    try {
      if (Platform.isAndroid ||
          Platform.isIOS ||
          Platform.isMacOS ||
          Platform.isWindows ||
          Platform.isLinux) {
        _log("Platform: ${Platform.operatingSystem}");
      }
    } catch (e) {
      // Platform.is... throws on Web usually, or dart:io fails.
      // Actually dart:io import causes the crash at compile/runtime on web.
      // But we can't easily remove dart:io import without conditional imports.
      // We will assume this runs on Native.
      _log("Running on non-mobile/desktop platform?");
    }

    // 1. Setup Local Assets
    await _setupWebAssets();

    // 2. Request Permissions (Platform specific)
    // We wrap this carefully
    if (!kIsWeb && (Platform.isAndroid || Platform.isIOS)) {
      _log("Requesting Mobile Permissions...");
      await _requestPermissions();
    } else {
      _log("Skipping permissions (Desktop/Web)");
    }
  }

  Future<void> _setupWebAssets() async {
    try {
      // Get the document directory
      final dir = await getApplicationSupportDirectory();
      final webDir = Directory("${dir.path}/web_content");
      _log("Web Content Dir: ${webDir.path}");

      // Checking if assets already exist
      if (await webDir.exists()) {
        _log("Deleting existing web_content...");
        await webDir.delete(recursive: true); // Force update for this session
      }

      if (!mounted) return;
      if (!mounted) return;
      setState(() {
        _loadingText = "Unpacking assets...";
      });

      // Load zip from assets
      _log("Loading assets/web.zip...");
      final zipData = await rootBundle.load('assets/web.zip');
      final bytes = zipData.buffer.asUint8List();
      final archive = ZipDecoder().decodeBytes(bytes);

      _log("Extracting ${archive.length} files...");
      // Extract
      for (final file in archive) {
        final filename = file.name;
        if (file.isFile) {
          final data = file.content as List<int>;
          final outFile = File("${webDir.path}/$filename");
          await outFile.create(recursive: true);
          await outFile.writeAsBytes(data);
        } else {
          final outDir = Directory("${webDir.path}/$filename");
          await outDir.create(recursive: true);
        }
      }

      // Verify index.html
      final indexFile = File("${webDir.path}/index.html");
      if (await indexFile.exists()) {
        _log("✅ index.html found at ${indexFile.path}");
        
        if (!kIsWeb) {
           await _startLocalServer(webDir);
        }

        if (!mounted) return;
        setState(() {
          _loadingText = "Loading WebView...";
          _isLoading = false;
        });
      } else {
        _log("❌ index.html NOT FOUND!");
        // List top files
        final entities = await webDir.list().toList();
        _log(
          "Files in root: ${entities.map((e) => e.path.split('/').last).join(', ')}",
        );
        if (!mounted) return;
        setState(() {
          _loadingText = "Error: index.html missing";
        });
      }
    } catch (e) {
      _log("Asset Setup Error: $e");
      if (!mounted) return;
      setState(() {
        _loadingText = "Error: $e";
      });
    }
  }

  HttpServer? _server;

  Future<void> _startLocalServer(Directory webDir) async {
    try {
      // Close any existing server first
      await _server?.close(force: true);
      
      _server = await HttpServer.bind(InternetAddress.loopbackIPv4, 8084);
      _log("Localhost server running on http://localhost:8084");
      
      _server!.listen((HttpRequest request) async {
        try {
          final path = request.uri.path == '/' ? '/index.html' : request.uri.path;
          final file = File('${webDir.path}$path');
          
          if (await file.exists()) {
            // Set content type
            if (path.endsWith(".html")) {
              request.response.headers.contentType = ContentType.html;
            } else if (path.endsWith(".js")) {
              request.response.headers.contentType = ContentType("application", "javascript");
            } else if (path.endsWith(".css")) {
              request.response.headers.contentType = ContentType("text", "css");
            } else if (path.endsWith(".svg")) {
              request.response.headers.contentType = ContentType("image", "svg+xml");
            } else if (path.endsWith(".png")) {
              request.response.headers.contentType = ContentType("image", "png");
            } else if (path.endsWith(".json")) {
              request.response.headers.contentType = ContentType.json;
            }

            // Disable caching during dev/debug
            request.response.headers.add("Cache-Control", "no-cache, no-store, must-revalidate");
            request.response.headers.add("Access-Control-Allow-Origin", "*");
            
            await file.openRead().pipe(request.response);
          } else {
            request.response.statusCode = HttpStatus.notFound;
            await request.response.close();
          }
        } catch (e) {
          print("Server Error handling request: $e");
          try {
            request.response.statusCode = HttpStatus.internalServerError;
            await request.response.close();
          } catch (_) {}
        }
      });
    } catch (e) {
      _log("Server Start Error: $e");
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
    _server?.close(force: true);
    webViewController?.dispose(); // Ensure controller is disposed
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Scaffold(
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              CircularProgressIndicator(),
              SizedBox(height: 16),
              Text("Loading Python Environment..."),
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
                url: WebUri("http://localhost:8084/index.html"),
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
