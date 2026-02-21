// lib/Screens/python_ide_screen.dart

import 'package:flutter/material.dart';
import 'package:flutter/services.dart'; // Needed for MethodChannel
import 'package:flutter_code_editor/flutter_code_editor.dart';
import 'package:flutter_highlight/themes/monokai-sublime.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:process_run/shell.dart';
import 'dart:io';
import 'package:path_provider/path_provider.dart';
import 'package:highlight/languages/python.dart';
import 'package:path/path.dart' as p;

class PythonIdeScreen extends StatefulWidget {
  const PythonIdeScreen({super.key});

  @override
  State<PythonIdeScreen> createState() => _PythonIdeScreenState();
}

class _PythonIdeScreenState extends State<PythonIdeScreen> {
  final controller = CodeController(
    text: 'print("Hello from your Flutter Python IDE!")\n'
        'print(f"The result of 10 * 10 is {10 * 10}")',
    language: python,
  );

  String _output = "Your script's output will appear here.";
  bool _isLoading = false;

  // Platform channel for Android communication
  static const platformChannel = MethodChannel('com.qubiq.app/python');

  Future<void> _runPythonScript() async {
    setState(() {
      _isLoading = true;
      _output = "Running script...";
    });

    try {
      if (Platform.isAndroid) {
        // --- Android Execution (via Chaquopy/MethodChannel) ---
        try {
          final String result = await platformChannel.invokeMethod('runPython', {
            'code': controller.text,
          });
          _output = result;
        } on PlatformException catch (e) {
          _output = "Failed to run on Android: '${e.message}'.\nEnsure Chaquopy is configured in your MainActivity.";
        }

      } else {
        // --- Desktop Execution (Windows/macOS) ---
        String appDirectory = p.dirname(Platform.resolvedExecutable);
        String pythonExePath;

        if (Platform.isMacOS) {
          // On macOS, the executable is inside Contents/MacOS.
          // We generally bundle resources in Contents/Resources.
          // Path: .../App.app/Contents/MacOS/../Resources/python_runtime/python
          pythonExePath = p.join(
              p.dirname(p.dirname(Platform.resolvedExecutable)),
              'Resources',
              'python_runtime',
              'python' // No .exe extension on Mac
          );
        } else {
          // Windows: Relative to the .exe
          pythonExePath = p.join(appDirectory, 'python_runtime', 'python.exe');
        }

        final directory = await getTemporaryDirectory();
        final scriptFile = File('${directory.path}/temp_script.py');
        await scriptFile.writeAsString(controller.text);

        if (!await File(pythonExePath).exists()) {
          _output = "Error: Bundled Python executable not found.\nExpected at: $pythonExePath\n\n(On macOS, ensure the runtime is in Contents/Resources)";
        } else {
          var shell = Shell();
          // Escape spaces in paths for safety
          var result = await shell.run('"$pythonExePath" "${scriptFile.path}"');

          if (result.first.stdout.isNotEmpty) {
            _output = result.first.stdout;
          } else if (result.first.stderr.isNotEmpty) {
            _output = "Error:\n${result.first.stderr}";
          } else {
            _output = "Script finished with no output.";
          }
        }
      }
    } catch (e) {
      _output = "Failed to run script.\nError: $e";
    }

    setState(() {
      _isLoading = false;
    });
  }

  @override
  void dispose() {
    controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("Python IDE"),
        backgroundColor: Colors.grey[900],
        foregroundColor: Colors.white,
        actions: [
          if (_isLoading)
            const Center(child: CircularProgressIndicator(color: Colors.white))
          else
            IconButton(
              icon: const Icon(Icons.play_arrow),
              onPressed: _runPythonScript,
              tooltip: "Run Script",
            ),
          const SizedBox(width: 10),
        ],
      ),
      body: Column(
        children: [
          // The Code Editor
          Expanded(
            flex: 3,
            child: CodeTheme(
              data: CodeThemeData(styles: monokaiSublimeTheme),
              child: Container(
                color: const Color(0xFF272822),
                width: double.infinity,
                child: SingleChildScrollView(
                  child: SingleChildScrollView(
                    scrollDirection: Axis.horizontal,
                    child: SizedBox(
                      width: MediaQuery.of(context).size.width > 600 ? 1000 : 800,
                      child: CodeField(
                        controller: controller,
                        textStyle: GoogleFonts.robotoMono(fontSize: 12),
                      ),
                    ),
                  ),
                ),
              ),
            ),
          ),

          // The Output Terminal
          Expanded(
            flex: 2,
            child: Container(
              width: double.infinity,
              padding: const EdgeInsets.all(16),
              color: Colors.black,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    "Output:",
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const Divider(color: Colors.grey),
                  Expanded(
                    child: SingleChildScrollView(
                      child: SelectableText(
                        _output,
                        style: GoogleFonts.robotoMono(color: Colors.white),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}