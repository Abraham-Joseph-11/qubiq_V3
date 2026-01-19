import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_chat_ui/flutter_chat_ui.dart';
import 'package:flutter_chat_types/flutter_chat_types.dart' as types;
import 'package:http/http.dart' as http; // ✅ Using raw HTTP
import 'package:uuid/uuid.dart';
import 'package:little_emmi/Screens/Help/app_knowledge.dart';
import 'package:little_emmi/secrets.dart';

class HelpChatScreen extends StatefulWidget {
  const HelpChatScreen({super.key});

  @override
  State<HelpChatScreen> createState() => _HelpChatScreenState();
}

class _HelpChatScreenState extends State<HelpChatScreen> {
  final List<types.Message> _messages = [];
  final _user = const types.User(id: 'user-id');
  final _bot = const types.User(id: 'bot-id', firstName: 'QubiQ Bot');

  bool _isLoading = false;

  // ⚡ Quick Questions
  final List<String> _quickQuestions = [
    "How do I use Suno?",
    "Robot not connecting",
    "What is Flowchart Python?",
    "I forgot my password",
  ];

  @override
  void initState() {
    super.initState();
    // Initial Greeting
    _addMessage(types.TextMessage(
      author: _bot,
      createdAt: DateTime.now().millisecondsSinceEpoch,
      id: const Uuid().v4(),
      text: "Hi! I'm the QubiQ Assistant. Ask me about Coding, Robotics, or AI tools!",
    ));
  }

  // ✅ THE NEW HTTP FUNCTION
  Future<void> _sendMessageToGemini(String text) async {
    const model = 'gemini-flash-latest'; // Or 'gemini-pro'
    final url = Uri.parse(
        'https://generativelanguage.googleapis.com/v1beta/models/$model:generateContent?key=$googleGeminiApiKey'
    );

    try {
      final response = await http.post(
        url,
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          // 🧠 SYSTEM INSTRUCTION (The Brain)
          // In the Raw API, it goes here:
          "system_instruction": {
            "parts": [
              {"text": appKnowledgeBase}
            ]
          },
          // 💬 CHAT HISTORY & CURRENT MESSAGE
          "contents": [
            {
              "parts": [
                {"text": text}
              ]
            }
          ]
        }),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        String botReply = "I'm not sure how to answer that.";

        // Parse the nested JSON response
        if (data['candidates'] != null && data['candidates'].isNotEmpty) {
          final parts = data['candidates'][0]['content']['parts'];
          if (parts != null && parts.isNotEmpty) {
            botReply = parts[0]['text'];
          }
        }

        _addMessage(types.TextMessage(
          author: _bot,
          createdAt: DateTime.now().millisecondsSinceEpoch,
          id: const Uuid().v4(),
          text: botReply,
        ));
      } else {
        debugPrint("🔴 API ERROR: ${response.body}");
        _showError("API Error: ${response.statusCode}");
      }
    } catch (e) {
      debugPrint("🔴 CONNECTION ERROR: $e");
      _showError("Connection Error. Check internet.");
    }
  }

  void _handleSend(String text) async {
    if (text.trim().isEmpty) return;

    // 1. Add User Message
    final textMessage = types.TextMessage(
      author: _user,
      createdAt: DateTime.now().millisecondsSinceEpoch,
      id: const Uuid().v4(),
      text: text,
    );
    _addMessage(textMessage);

    setState(() => _isLoading = true);

    // 2. Send to API
    await _sendMessageToGemini(text);

    setState(() => _isLoading = false);
  }

  void _addMessage(types.Message message) {
    setState(() {
      _messages.insert(0, message);
    });
  }

  void _showError(String msg) {
    _addMessage(types.TextMessage(
      author: _bot,
      createdAt: DateTime.now().millisecondsSinceEpoch,
      id: const Uuid().v4(),
      text: "⚠️ $msg",
    ));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: const Text("QubiQ Help Desk", style: TextStyle(fontWeight: FontWeight.bold, color: Colors.black)),
        backgroundColor: Colors.white,
        elevation: 0.5,
        iconTheme: const IconThemeData(color: Colors.black),
      ),
      body: Column(
        children: [
          // Quick Chips
          Container(
            height: 60,
            padding: const EdgeInsets.symmetric(vertical: 8),
            child: ListView.builder(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 16),
              itemCount: _quickQuestions.length,
              itemBuilder: (context, index) {
                return Padding(
                  padding: const EdgeInsets.only(right: 8),
                  child: ActionChip(
                    backgroundColor: Colors.white,
                    side: BorderSide(color: Colors.purple.withOpacity(0.2)),
                    label: Text(
                      _quickQuestions[index],
                      style: TextStyle(color: Colors.purple.shade700, fontSize: 13),
                    ),
                    onPressed: () => _handleSend(_quickQuestions[index]),
                  ),
                );
              },
            ),
          ),
          // Chat Interface
          Expanded(
            child: Chat(
              messages: _messages,
              onSendPressed: (partialText) => _handleSend(partialText.text),
              user: _user,
              typingIndicatorOptions: TypingIndicatorOptions(
                typingUsers: _isLoading ? [_bot] : [],
              ),
              theme: const DefaultChatTheme(
                primaryColor: Colors.deepPurple,
                secondaryColor: Colors.white,
                inputBackgroundColor: Color(0xFFEFF6FF),
              ),
            ),
          ),
        ],
      ),
    );
  }
}