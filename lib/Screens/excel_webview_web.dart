import 'package:flutter/material.dart';
import 'package:flutter_inappwebview/flutter_inappwebview.dart';

class ExcelWebViewPlatformComponent extends StatefulWidget {
  const ExcelWebViewPlatformComponent({super.key});

  @override
  State<ExcelWebViewPlatformComponent> createState() =>
      _ExcelWebViewPlatformComponentState();
}

class _ExcelWebViewPlatformComponentState
    extends State<ExcelWebViewPlatformComponent> {
  final GlobalKey webViewKey = GlobalKey();
  double progress = 0;

  @override
  Widget build(BuildContext context) {
    return Stack(
      fit: StackFit.expand, // Force WebViews to take full width and height
      children: [
        InAppWebView(
          key: webViewKey,
          initialUrlRequest: URLRequest(
            // On Flutter web, assets are served relative to the base URL under /assets/
            url: WebUri("assets/assets/excel_web/dist/index.html?v=2"),
          ),
          initialSettings: InAppWebViewSettings(
            isInspectable: true,
            javaScriptEnabled: true,
            useWideViewPort: true,
            loadWithOverviewMode: true,
            allowFileAccessFromFileURLs: true,
            allowUniversalAccessFromFileURLs: true,
            // These settings are critical for making InAppWebView's hidden IFrame behave on Web
            iframeAllow:
                "camera; microphone; fullscreen; clipboard-read; clipboard-write; autoplay",
            iframeAllowFullscreen: true,
          ),
          onProgressChanged: (controller, p) {
            setState(() {
              progress = p / 100;
            });
          },
          onConsoleMessage: (controller, consoleMessage) {
            debugPrint("EXCEL WEBVIEW: ${consoleMessage.message}");
          },
          onLoadError: (controller, url, code, message) {
            debugPrint("EXCEL ERROR: $code $message");
          },
        ),
        if (progress < 1.0) LinearProgressIndicator(value: progress),
      ],
    );
  }
}
