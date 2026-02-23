import 'dart:ui_web' as ui_web;
import 'package:web/web.dart' as web;

void registerIframe(String viewId, String src) {
  ui_web.platformViewRegistry.registerViewFactory(
    viewId,
    (int viewId) {
      final web.HTMLIFrameElement iframe = web.HTMLIFrameElement();
      iframe.src = src;
      iframe.style.border = 'none';
      iframe.style.width = '100%';
      iframe.style.height = '100%';
      iframe.allow =
          "camera; microphone; fullscreen; clipboard-read; clipboard-write; autoplay";
      return iframe;
    },
  );
}
