class ApiConstants {
  ApiConstants._();

  // ─── Aladhan Prayer Times API ────────────────────────────
  static const String prayerTimesBase = 'https://api.aladhan.com/v1';
  static String prayerTimesByCity(String city, String country, int method) =>
      '$prayerTimesBase/timingsByCity?city=$city&country=$country&method=$method';
  static String prayerTimesByCoords(double lat, double lng, int method) =>
      '$prayerTimesBase/timings?latitude=$lat&longitude=$lng&method=$method';
  static String hijriDate(String date) =>
      '$prayerTimesBase/gpiToH/$date';

  // ─── Quran API (Al-Quran Cloud) ─────────────────────────
  static const String quranBase = 'https://api.alquran.cloud/v1';
  static const String quranSurahList = '$quranBase/surah';
  static String quranSurah(int number) => '$quranBase/surah/$number';
  static String quranSurahArabic(int number) => '$quranBase/surah/$number/ar.alafasy';
  static String quranSurahTranslation(int number, String edition) =>
      '$quranBase/surah/$number/$edition';
  static String quranAyah(int surah, int ayah) => '$quranBase/ayah/$surah:$ayah';
  static String quranAudio(int surah, String reciter) =>
      '$quranBase/surah/$surah/$reciter';
  static String quranSearch(String query) =>
      '$quranBase/search/$query/all/ar';

  // ─── Quran Tafsir ────────────────────────────────────────
  static String tafsir(int surah, int ayah) =>
      'https://api.quran-tafseer.com/tafseer/1/$surah/$ayah';

  // ─── Hadith API ──────────────────────────────────────────
  static const String hadithBase = 'https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1';
  static String hadithEditions = '$hadithBase/editions.json';
  static String hadithCollection(String collection, String lang) =>
      '$hadithBase/editions/$lang-$collection.json';

  // Alternative Hadith API
  static const String hadithApiBase = 'https://hadithapi.com/api';
  static String hadithBooks(String collection) =>
      '$hadithApiBase/$collection/books?apiKey=\$2y\$10\$abc';

  // ─── Audio Reciters ──────────────────────────────────────
  static const Map<String, String> reciters = {
    'ar.alafasy': 'مشاري العفاسي',
    'ar.abdurrahmaansudais': 'عبدالرحمن السديس',
    'ar.saaborayee': 'سعود الشريم',
    'ar.husary': 'محمود خليل الحصري',
    'ar.minshawi': 'محمد صديق المنشاوي',
    'ar.abdulbasit': 'عبدالباسط عبدالصمد',
  };

  // ─── Live Radio Streams ──────────────────────────────────
  static const Map<String, String> radioStreams = {
    'إذاعة القرآن الكريم': 'https://Qurango.net/radio/tarateel',
    'إذاعة القرآن - مشاري العفاسي': 'https://Qurango.net/radio/mishari_alafasi',
    'إذاعة القرآن - السديس': 'https://Qurango.net/radio/abdulrahman_alsudaes',
    'إذاعة القرآن - الحصري': 'https://Qurango.net/radio/mahmoud_khalil_alhussary',
    'إذاعة القرآن - المنشاوي': 'https://Qurango.net/radio/mohammad_siddiq_alminshawi',
    'إذاعة القرآن - عبدالباسط': 'https://Qurango.net/radio/abdulbasit_abdulsamad',
    'إذاعة القرآن - ماهر المعيقلي': 'https://Qurango.net/radio/maher_almuaiqly',
    'إذاعة القرآن - ياسر الدوسري': 'https://Qurango.net/radio/yasser_aldossari',
  };
}
