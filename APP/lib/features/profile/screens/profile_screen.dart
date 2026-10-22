import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/settings_provider.dart';

class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final settings = ref.watch(settingsProvider);
    final isArabic = settings.locale == 'ar';

    return Scaffold(
      appBar: AppBar(
        title: Text(isArabic ? 'الإعدادات' : 'Settings'),
        centerTitle: true,
      ),
      body: ListView(
        children: [
          const SizedBox(height: 20),
          _buildSectionHeader(context, isArabic ? 'المظهر' : 'Appearance'),
          SwitchListTile(
            title: Text(isArabic ? 'الوضع الليلي' : 'Dark Mode'),
            secondary: const Icon(Icons.dark_mode_rounded),
            value: settings.isDarkMode,
            onChanged: (_) => ref.read(settingsProvider.notifier).toggleDarkMode(),
          ),
          _buildSectionHeader(context, isArabic ? 'اللغة' : 'Language'),
          ListTile(
            title: Text(isArabic ? 'العربية' : 'Arabic'),
            leading: const Icon(Icons.language_rounded),
            trailing: settings.locale == 'ar' ? const Icon(Icons.check, color: Colors.green) : null,
            onTap: () => ref.read(settingsProvider.notifier).setLocale('ar'),
          ),
          ListTile(
            title: Text(isArabic ? 'الإنجليزية' : 'English'),
            leading: const Icon(Icons.translate_rounded),
            trailing: settings.locale == 'en' ? const Icon(Icons.check, color: Colors.green) : null,
            onTap: () => ref.read(settingsProvider.notifier).setLocale('en'),
          ),
          _buildSectionHeader(context, isArabic ? 'عن التطبيق' : 'About'),
          const ListTile(
            title: Text('المسلم'),
            subtitle: Text('الإصدار 1.0.0'),
            leading: Icon(Icons.info_outline_rounded),
          ),
        ],
      ),
    );
  }

  Widget _buildSectionHeader(BuildContext context, String title) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 24, 16, 8),
      child: Text(
        title,
        style: TextStyle(
          color: Theme.of(context).primaryColor,
          fontWeight: FontWeight.bold,
          fontSize: 14,
        ),
      ),
    );
  }
}
