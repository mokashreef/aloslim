import 'package:flutter/material.dart';
import '../../features/home/screens/home_screen.dart';
import '../../features/quran/screens/quran_screen.dart';
import '../../features/hadith/screens/hadith_screen.dart';
import '../../features/adhkar/screens/adhkar_screen.dart';
import '../../features/live/screens/live_screen.dart';
import '../../features/profile/screens/profile_screen.dart';

class AppRouter {
  AppRouter._();

  static const List<Widget> screens = [
    HomeScreen(),
    QuranScreen(),
    HadithScreen(),
    AdhkarScreen(),
    LiveScreen(),
    ProfileScreen(),
  ];

  static const List<String> routeNamesAr = [
    'الرئيسية',
    'القرآن',
    'الحديث',
    'الأذكار',
    'بث مباشر',
    'الملف',
  ];

  static const List<String> routeNamesEn = [
    'Home',
    'Quran',
    'Hadith',
    'Adhkar',
    'Live',
    'Profile',
  ];

  static const List<IconData> routeIcons = [
    Icons.home_rounded,
    Icons.menu_book_rounded,
    Icons.library_books_rounded,
    Icons.auto_awesome_rounded,
    Icons.radio_rounded,
    Icons.person_rounded,
  ];
}
