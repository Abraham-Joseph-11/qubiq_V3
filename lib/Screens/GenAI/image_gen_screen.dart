import 'dart:convert';
import 'dart:typed_data';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:http/http.dart' as http;
import 'package:little_emmi/secrets.dart';

class ImageGenScreen extends StatefulWidget {
  const ImageGenScreen({super.key});

  @override
  State<ImageGenScreen> createState() => _ImageGenScreenState();
}

class _ImageGenScreenState extends State<ImageGenScreen> {
  final TextEditingController _controller = TextEditingController();

  Uint8List? _imageBytes;
  String? _imageUrl;
  bool _isLoading = false;
  String? _errorMessage;

  final String _apiUrl = "https://openrouter.ai/api/v1/chat/completions";

  // ✅ FIXED: The correct ID for FLUX.2 Klein 4B on OpenRouter
  final String _modelId = "black-forest-labs/flux.2-klein-4b";

  Future<void> _generateImage() async {
    final prompt = _controller.text.trim();
    if (prompt.isEmpty) return;

    FocusScope.of(context).unfocus();
    setState(() {
      _isLoading = true;
      _errorMessage = null;
      _imageBytes = null;
      _imageUrl = null;
    });

    try {
      debugPrint("🚀 Sending request to OpenRouter ($_modelId)...");

      final response = await http.post(
        Uri.parse(_apiUrl),
        headers: {
          'Authorization': 'Bearer $openRouterApiKey',
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://little-emmi.app',
          'X-Title': 'Little Emmi',
        },
        body: jsonEncode({
          "model": _modelId,
          "messages": [
            {
              "role": "user",
              "content": prompt
            }
          ],
          // Critical for OpenRouter image models
          "modalities": ["image", "text"],
        }),
      );

      debugPrint("📥 Status: ${response.statusCode}");

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);

        if (data['choices'] != null && data['choices'].isNotEmpty) {
          final message = data['choices'][0]['message'];

          // ---------------------------------------------------------
          // 🛡️ ROBUST PARSING (Prevents "Null" crash)
          // ---------------------------------------------------------
          String? foundUrl;

          // Check 1: Standard 'images' array (with nested 'image_url')
          if (message['images'] != null && (message['images'] as List).isNotEmpty) {
            final imgObj = message['images'][0];
            if (imgObj is Map && imgObj['image_url'] != null && imgObj['image_url']['url'] != null) {
              foundUrl = imgObj['image_url']['url'];
            } else if (imgObj is Map && imgObj['url'] != null) {
              foundUrl = imgObj['url'];
            }
          }

          // Check 2: Content string (Fallback for Base64 or markdown links)
          if (foundUrl == null && message['content'] != null) {
            final content = message['content'].toString();
            if (content.contains("base64,")) {
              foundUrl = content;
            } else if (content.contains("http")) {
              final match = RegExp(r'https?://\S+').firstMatch(content);
              if (match != null) foundUrl = match.group(0);
            }
          }

          if (foundUrl != null) {
            _parseImage(foundUrl);
          } else {
            throw Exception("No valid image found in response.");
          }
        } else {
          throw Exception("No 'choices' in API response");
        }
      } else {
        final errorData = jsonDecode(response.body);
        final errorMsg = errorData['error']['message'] ?? 'Unknown API Error';
        throw Exception("API Error: $errorMsg");
      }
    } catch (e) {
      debugPrint("❌ Error: $e");
      if (mounted) {
        setState(() {
          _isLoading = false;
          _errorMessage = e.toString().replaceAll("Exception: ", "");
        });
      }
    }
  }

  void _parseImage(String urlOrData) {
    if (urlOrData.startsWith("data:image")) {
      final base64String = urlOrData.split(",").last;
      _parseBase64(base64String);
    } else {
      setState(() {
        _imageUrl = urlOrData;
        _isLoading = false;
      });
    }
  }

  void _parseBase64(String base64String) {
    try {
      final cleanString = base64String.replaceAll(RegExp(r'\s+'), '');
      final bytes = base64Decode(cleanString);
      setState(() {
        _imageBytes = bytes;
        _isLoading = false;
      });
    } catch (e) {
      debugPrint("Base64 Decode Error: $e");
      throw Exception("Failed to decode image data");
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF1E1E2C),
      appBar: AppBar(
        title: Text("Vision Forge", style: GoogleFonts.poppins(color: Colors.white)),
        backgroundColor: Colors.transparent,
        elevation: 0,
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      body: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            Expanded(
              child: Container(
                width: double.infinity,
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.05),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: Colors.white12),
                ),
                child: Stack(
                  alignment: Alignment.center,
                  children: [
                    if (_imageUrl == null && _imageBytes == null && !_isLoading && _errorMessage == null)
                      Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Icon(Icons.palette_outlined, size: 60, color: Colors.white24),
                          const SizedBox(height: 10),
                          Text("Enter a prompt to start", style: GoogleFonts.poppins(color: Colors.white54)),
                        ],
                      ),
                    if (_isLoading)
                      Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            const CircularProgressIndicator(color: Colors.pinkAccent),
                            const SizedBox(height: 20),
                            Text("Generating With QubiQ Image Generation...", style: GoogleFonts.poppins(color: Colors.white70)),
                          ],
                        ),
                      ),
                    if (_errorMessage != null)
                      Padding(
                        padding: const EdgeInsets.all(20),
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            const Icon(Icons.error_outline, color: Colors.redAccent, size: 40),
                            const SizedBox(height: 10),
                            Text("Generation Failed", style: GoogleFonts.poppins(color: Colors.white, fontWeight: FontWeight.bold)),
                            const SizedBox(height: 5),
                            Text(_errorMessage!, textAlign: TextAlign.center, style: GoogleFonts.poppins(color: Colors.white70, fontSize: 12)),
                          ],
                        ),
                      ),
                    if (_imageBytes != null && !_isLoading)
                      ClipRRect(
                        borderRadius: BorderRadius.circular(20),
                        child: Image.memory(_imageBytes!, fit: BoxFit.contain).animate().fadeIn(),
                      ),
                    if (_imageUrl != null && !_isLoading)
                      ClipRRect(
                        borderRadius: BorderRadius.circular(20),
                        child: Image.network(_imageUrl!, fit: BoxFit.contain).animate().fadeIn(),
                      ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 20),
            Container(
              padding: const EdgeInsets.all(5),
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.1),
                borderRadius: BorderRadius.circular(30),
              ),
              child: Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _controller,
                      style: const TextStyle(color: Colors.white),
                      decoration: InputDecoration(
                        hintText: "e.g., Cyberpunk city...",
                        hintStyle: TextStyle(color: Colors.white.withOpacity(0.4)),
                        border: InputBorder.none,
                        contentPadding: const EdgeInsets.symmetric(horizontal: 20),
                      ),
                      onSubmitted: (_) => _generateImage(),
                    ),
                  ),
                  IconButton(
                    icon: _isLoading
                        ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.pinkAccent))
                        : const Icon(Icons.auto_awesome, color: Colors.pinkAccent),
                    onPressed: _isLoading ? null : _generateImage,
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}