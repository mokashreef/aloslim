import 'package:flutter/material.dart';

class HadithScreen extends StatelessWidget {
  const HadithScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('الأحاديث النبوية'),
        centerTitle: true,
      ),
      body: const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.library_books_rounded, size: 64, color: Colors.grey),
            SizedBox(height: 16),
            Text('قريباً: الأربعون النووية ورياض الصالحين'),
          ],
        ),
      ),
    );
  }
}
