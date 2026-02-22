import 'package:flutter/material.dart';
import 'package:flutter_inappwebview/flutter_inappwebview.dart';

class PowerPointWebViewPlatformComponent extends StatefulWidget {
  const PowerPointWebViewPlatformComponent({super.key});

  @override
  State<PowerPointWebViewPlatformComponent> createState() =>
      _PowerPointWebViewPlatformComponentState();
}

class _PowerPointWebViewPlatformComponentState
    extends State<PowerPointWebViewPlatformComponent> {
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
            url: WebUri("assets/assets/web/dist/index.html"),
          ),
          initialSettings: InAppWebViewSettings(
            isInspectable: true,
            javaScriptEnabled: true,
            useWideViewPort: true,
            loadWithOverviewMode: true,
            allowFileAccessFromFileURLs: true,
            allowUniversalAccessFromFileURLs: true,
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
            debugPrint("PPT WEBVIEW: ${consoleMessage.message}");
          },
          onLoadError: (controller, url, code, message) {
            debugPrint("PPT ERROR: $code $message");
          },
        ),
        if (progress < 1.0) LinearProgressIndicator(value: progress),
      ],
    );
  }
}
