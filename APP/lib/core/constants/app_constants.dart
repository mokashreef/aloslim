class AppConstants {
  AppConstants._();

  // ─── Hive Box Names ──────────────────────────────────────
  static const String settingsBox = 'settings_box';
  static const String adhkarProgressBox = 'adhkar_progress_box';
  static const String bookmarksBox = 'bookmarks_box';
  static const String notesBox = 'notes_box';
  static const String cacheBox = 'cache_box';
  static const String usageBox = 'usage_box';

  // ─── Settings Keys ──────────────────────────────────────
  static const String isDarkModeKey = 'is_dark_mode';
  static const String localeKey = 'locale';
  static const String notificationsKey = 'notifications_enabled';
  static const String prayerMethodKey = 'prayer_method';
  static const String selectedReciterKey = 'selected_reciter';
  static const String lastCityKey = 'last_city';
  static const String lastCountryKey = 'last_country';
  static const String lastLatKey = 'last_lat';
  static const String lastLngKey = 'last_lng';
  static const String fontSizeKey = 'font_size';

  // ─── Prayer Calculation Methods ──────────────────────────
  static const Map<int, String> prayerMethods = {
    0: 'Shia Ithna-Ansari',
    1: 'University of Islamic Sciences, Karachi',
    2: 'Islamic Society of North America',
    3: 'Muslim World League',
    4: 'Umm Al-Qura University, Makkah',
    5: 'Egyptian General Authority of Survey',
    7: 'Institute of Geophysics, University of Tehran',
    8: 'Gulf Region',
    9: 'Kuwait',
    10: 'Qatar',
    11: 'Majlis Ugama Islam Singapura, Singapore',
    12: 'Union Organization Islamic de France',
    13: 'Diyanet İşleri Başkanlığı, Turkey',
    14: 'Spiritual Administration of Muslims of Russia',
    15: 'Moonsighting Committee Worldwide',
  };

  // ─── Prayer Names ────────────────────────────────────────
  static const Map<String, String> prayerNamesAr = {
    'Fajr': 'الفجر',
    'Sunrise': 'الشروق',
    'Dhuhr': 'الظهر',
    'Asr': 'العصر',
    'Maghrib': 'المغرب',
    'Isha': 'العشاء',
  };

  static const Map<String, String> prayerNamesEn = {
    'Fajr': 'Fajr',
    'Sunrise': 'Sunrise',
    'Dhuhr': 'Dhuhr',
    'Asr': 'Asr',
    'Maghrib': 'Maghrib',
    'Isha': 'Isha',
  };

  // ─── Prayer Icons ────────────────────────────────────────
  static const Map<String, int> prayerIcons = {
    'Fajr': 0xe518,     // brightness_4
    'Sunrise': 0xe81d,   // wb_sunny
    'Dhuhr': 0xe81b,     // wb_twilight
    'Asr': 0xe430,       // light_mode
    'Maghrib': 0xe518,   // brightness_6
    'Isha': 0xe51c,      // dark_mode
  };

  // ─── App Info ────────────────────────────────────────────
  static const String appName = 'المسلم';
  static const String appNameEn = 'ALmoslim';
  static const String appVersion = '1.0.0';
  static const String developerName = 'ALmoslim Team';
  static const String contactEmail = 'contact@almoslim.app';
}
