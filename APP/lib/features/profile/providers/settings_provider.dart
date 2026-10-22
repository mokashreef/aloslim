import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/constants/app_constants.dart';
import '../../../services/hive_service.dart';

class SettingsState {
  final bool isDarkMode;
  final String locale;
  final int prayerMethod;
  final bool notificationsEnabled;
  final double fontSize;
  final String selectedReciter;

  SettingsState({
    required this.isDarkMode,
    required this.locale,
    required this.prayerMethod,
    required this.notificationsEnabled,
    required this.fontSize,
    required this.selectedReciter,
  });

  SettingsState copyWith({
    bool? isDarkMode,
    String? locale,
    int? prayerMethod,
    bool? notificationsEnabled,
    double? fontSize,
    String? selectedReciter,
  }) {
    return SettingsState(
      isDarkMode: isDarkMode ?? this.isDarkMode,
      locale: locale ?? this.locale,
      prayerMethod: prayerMethod ?? this.prayerMethod,
      notificationsEnabled: notificationsEnabled ?? this.notificationsEnabled,
      fontSize: fontSize ?? this.fontSize,
      selectedReciter: selectedReciter ?? this.selectedReciter,
    );
  }
}

class SettingsNotifier extends StateNotifier<SettingsState> {
  SettingsNotifier()
      : super(SettingsState(
          isDarkMode: HiveService.getSetting(AppConstants.isDarkModeKey,
              defaultValue: false),
          locale: HiveService.getSetting(AppConstants.localeKey,
              defaultValue: 'ar'),
          prayerMethod: HiveService.getSetting(AppConstants.prayerMethodKey,
              defaultValue: 4), // Umm Al-Qura
          notificationsEnabled: HiveService.getSetting(
              AppConstants.notificationsKey,
              defaultValue: true),
          fontSize: HiveService.getSetting(AppConstants.fontSizeKey,
              defaultValue: 16.0),
          selectedReciter: HiveService.getSetting(
              AppConstants.selectedReciterKey,
              defaultValue: 'ar.alafasy'),
        ));

  void toggleDarkMode() {
    final newValue = !state.isDarkMode;
    state = state.copyWith(isDarkMode: newValue);
    HiveService.saveSetting(AppConstants.isDarkModeKey, newValue);
  }

  void setLocale(String locale) {
    state = state.copyWith(locale: locale);
    HiveService.saveSetting(AppConstants.localeKey, locale);
  }

  void setPrayerMethod(int method) {
    state = state.copyWith(prayerMethod: method);
    HiveService.saveSetting(AppConstants.prayerMethodKey, method);
  }

  void toggleNotifications() {
    final newValue = !state.notificationsEnabled;
    state = state.copyWith(notificationsEnabled: newValue);
    HiveService.saveSetting(AppConstants.notificationsKey, newValue);
  }

  void setFontSize(double size) {
    state = state.copyWith(fontSize: size);
    HiveService.saveSetting(AppConstants.fontSizeKey, size);
  }

  void setReciter(String reciter) {
    state = state.copyWith(selectedReciter: reciter);
    HiveService.saveSetting(AppConstants.selectedReciterKey, reciter);
  }
}

final settingsProvider = StateNotifierProvider<SettingsNotifier, SettingsState>(
  (ref) => SettingsNotifier(),
);
