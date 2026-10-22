import 'package:flutter/material.dart';

class QuranScreen extends StatelessWidget {
  const QuranScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('القرآن الكريم'),
        centerTitle: true,
      ),
      body: const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.menu_book_rounded, size: 64, color: Colors.grey),
            SizedBox(height: 16),
            Text('قريباً: تصفح وقراءة القرآن الكريم'),
          ],
        ),
      ),
    );
  }
}
