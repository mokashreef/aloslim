import 'package:flutter/material.dart';

class AdhkarScreen extends StatelessWidget {
  const AdhkarScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('الأذكار'),
        centerTitle: true,
      ),
      body: const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.auto_awesome_rounded, size: 64, color: Colors.grey),
            SizedBox(height: 16),
            Text('قريباً: أذكار الصباح والمساء'),
          ],
        ),
      ),
    );
  }
}
