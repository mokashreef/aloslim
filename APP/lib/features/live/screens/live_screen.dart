import 'package:flutter/material.dart';

class LiveScreen extends StatelessWidget {
  const LiveScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('بث مباشر'),
        centerTitle: true,
      ),
      body: const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.radio_rounded, size: 64, color: Colors.grey),
            SizedBox(height: 16),
            Text('قريباً: إذاعة القرآن الكريم'),
          ],
        ),
      ),
    );
  }
}
