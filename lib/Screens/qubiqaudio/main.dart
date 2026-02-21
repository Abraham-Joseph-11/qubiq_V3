import 'dart:async';
import 'dart:convert';
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart';
import 'package:path_provider/path_provider.dart';
import 'package:shelf/shelf.dart';
import 'package:shelf/shelf_io.dart' as shelf_io;
import 'package:shelf_static/shelf_static.dart';
import 'package:path/path.dart' as p;

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'QubiQ Audio',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.deepPurple),
        useMaterial3: true,
      ),
      home: const WebViewScreen(),
    );
  }
}

class WebViewScreen extends StatefulWidget {
  const WebViewScreen({super.key});

  @override
  State<WebViewScreen> createState() => _WebViewScreenState();
}

class _WebViewScreenState extends State<WebViewScreen> {
  late final WebViewController controller;
  HttpServer? _server;
  String? _localUrl;
  bool _isLoading = true;
  String _statusMessage = "Initializing...";

  @override
  void initState() {
    super.initState();
    _startLocalServer();
  }

  @override
  void dispose() {
    _server?.close(force: true);
    super.dispose();
  }

  Future<void> _startLocalServer() async {
    try {
      setState(() => _statusMessage = "Extracting assets...");
      final docsDir = await getApplicationDocumentsDirectory();
      final webRoot = Directory(p.join(docsDir.path, 'qubiq_web'));

      // Always re-extract in debug mode or if missing
      if (await webRoot.exists()) {
        await webRoot.delete(recursive: true);
      }
      await webRoot.create(recursive: true);

      // Read AssetManifest to find files
      final manifestContent = await DefaultAssetBundle.of(
        context,
      ).loadString('AssetManifest.json');
      final Map<String, dynamic> manifestMap = json.decode(manifestContent);

      final webAssets = manifestMap.keys
          .where((key) => key.startsWith('assets/qubiq_web/'))
          .toList();

      for (final assetPath in webAssets) {
        final data = await DefaultAssetBundle.of(context).load(assetPath);
        final bytes = data.buffer.asUint8List();

        // Relativize path: assets/qubiq_web/foo.js -> foo.js
        final relativePath = assetPath.replaceFirst('assets/qubiq_web/', '');
        final file = File(p.join(webRoot.path, relativePath));

        await file.parent.create(recursive: true);
        await file.writeAsBytes(bytes);
      }

      print('Extracted ${webAssets.length} files to ${webRoot.path}');
      webRoot
          .listSync(recursive: true)
          .forEach((f) => print('File: ${f.path}'));

      setState(() => _statusMessage = "Starting server...");

      // Configure Server with COOP/COEP headers
      final handler = const Pipeline()
          .addMiddleware(
            (innerHandler) => (request) async {
              print('Request: ${request.method} ${request.url}');
              final response = await innerHandler(request);
              print('Response: ${response.statusCode} for ${request.url}');
              print(
                'Headers: COOP=${response.headers['Cross-Origin-Opener-Policy']} Type=${response.headers['content-type']}',
              );
              return response.change(
                headers: {
                  'Cross-Origin-Opener-Policy': 'same-origin',
                  'Cross-Origin-Embedder-Policy': 'require-corp',
                  'Access-Control-Allow-Origin': '*',
                },
              );
            },
          )
          .addHandler(
            createStaticHandler(
              webRoot.path,
              defaultDocument: 'qubiq_audio.html',
            ),
          );

      _server = await shelf_io.serve(handler, InternetAddress.loopbackIPv4, 0);
      _localUrl = 'http://localhost:${_server!.port}';

      print('Server running on $_localUrl');

      // Initialize WebView
      controller = WebViewController()
        ..setJavaScriptMode(JavaScriptMode.unrestricted)
        ..setNavigationDelegate(
          NavigationDelegate(
            onPageStarted: (String url) => print('Page started: $url'),
            onPageFinished: (String url) => print('Page finished: $url'),
            onWebResourceError: (error) {
              print('Web Error: ${error.description}');
              print('Error Code: ${error.errorCode}');
              print('Error Type: ${error.errorType}');
            },
          ),
        )
        ..loadRequest(Uri.parse(_localUrl!));

      setState(() {
        _isLoading = false;
      });
    } catch (e, stack) {
      print("Error starting server: $e");
      print(stack);
      setState(() => _statusMessage = "Error: $e");
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: SafeArea(
        child: _isLoading
            ? Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const CircularProgressIndicator(),
                    const SizedBox(height: 20),
                    Text(
                      _statusMessage,
                      style: const TextStyle(color: Colors.white),
                    ),
                  ],
                ),
              )
            : Stack(
                children: [
                  WebViewWidget(controller: controller),
                  Positioned(
                    top: 10,
                    left: 10,
                    child: IconButton(
                      icon: Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: Colors.black.withOpacity(0.5),
                          shape: BoxShape.circle,
                        ),
                        child:
                            const Icon(Icons.arrow_back, color: Colors.white),
                      ),
                      onPressed: () => Navigator.of(context).pop(),
                    ),
                  ),
                ],
              ),
      ),
    );
  }
}
