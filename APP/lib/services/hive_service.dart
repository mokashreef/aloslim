import 'package:hive_flutter/hive_flutter.dart';
import '../core/constants/app_constants.dart';

class HiveService {
  static late Box settingsBox;
  static late Box adhkarProgressBox;
  static late Box bookmarksBox;
  static late Box notesBox;
  static late Box cacheBox;
  static late Box usageBox;

  static Future<void> init() async {
    settingsBox = await Hive.openBox(AppConstants.settingsBox);
    adhkarProgressBox = await Hive.openBox(AppConstants.adhkarProgressBox);
    bookmarksBox = await Hive.openBox(AppConstants.bookmarksBox);
    notesBox = await Hive.openBox(AppConstants.notesBox);
    cacheBox = await Hive.openBox(AppConstants.cacheBox);
    usageBox = await Hive.openBox(AppConstants.usageBox);
  }

  // ─── Settings ────────────────────────────────────────────
  static dynamic getSetting(String key, {dynamic defaultValue}) {
    return settingsBox.get(key, defaultValue: defaultValue);
  }

  static Future<void> saveSetting(String key, dynamic value) async {
    await settingsBox.put(key, value);
  }

  // ─── Adhkar Progress ────────────────────────────────────
  static int getAdhkarCount(String dhikrId) {
    return adhkarProgressBox.get(dhikrId, defaultValue: 0) as int;
  }

  static Future<void> incrementAdhkar(String dhikrId) async {
    final current = getAdhkarCount(dhikrId);
    await adhkarProgressBox.put(dhikrId, current + 1);
  }

  static Future<void> resetAdhkar(String dhikrId) async {
    await adhkarProgressBox.put(dhikrId, 0);
  }

  static Future<void> resetAllAdhkar() async {
    await adhkarProgressBox.clear();
  }

  // ─── Bookmarks ──────────────────────────────────────────
  static List<String> getBookmarks() {
    return (bookmarksBox.get('list', defaultValue: <String>[]) as List)
        .cast<String>();
  }

  static Future<void> addBookmark(String id) async {
    final bookmarks = getBookmarks();
    if (!bookmarks.contains(id)) {
      bookmarks.add(id);
      await bookmarksBox.put('list', bookmarks);
    }
  }

  static Future<void> removeBookmark(String id) async {
    final bookmarks = getBookmarks();
    bookmarks.remove(id);
    await bookmarksBox.put('list', bookmarks);
  }

  static bool isBookmarked(String id) {
    return getBookmarks().contains(id);
  }

  // ─── Notes ──────────────────────────────────────────────
  static String? getNote(String ayahKey) {
    return notesBox.get(ayahKey) as String?;
  }

  static Future<void> saveNote(String ayahKey, String note) async {
    await notesBox.put(ayahKey, note);
  }

  static Future<void> deleteNote(String ayahKey) async {
    await notesBox.delete(ayahKey);
  }

  static Map<String, String> getAllNotes() {
    return Map.fromEntries(
      notesBox.keys.map((key) => MapEntry(key.toString(), notesBox.get(key).toString())),
    );
  }

  // ─── Cache ──────────────────────────────────────────────
  static dynamic getCache(String key) {
    final cached = cacheBox.get(key);
    if (cached == null) return null;

    final expiry = cacheBox.get('${key}_expiry') as int?;
    if (expiry != null && DateTime.now().millisecondsSinceEpoch > expiry) {
      cacheBox.delete(key);
      cacheBox.delete('${key}_expiry');
      return null;
    }
    return cached;
  }

  static Future<void> setCache(String key, dynamic value, {Duration ttl = const Duration(hours: 1)}) async {
    await cacheBox.put(key, value);
    await cacheBox.put(
      '${key}_expiry',
      DateTime.now().add(ttl).millisecondsSinceEpoch,
    );
  }

  // ─── Usage Tracking ────────────────────────────────────
  static Future<void> trackScreenTime(String screen, int seconds) async {
    final today = DateTime.now().toIso8601String().split('T')[0];
    final key = '${today}_$screen';
    final current = usageBox.get(key, defaultValue: 0) as int;
    await usageBox.put(key, current + seconds);
  }

  static Map<String, int> getTodayUsage() {
    final today = DateTime.now().toIso8601String().split('T')[0];
    final Map<String, int> usage = {};
    for (final key in usageBox.keys) {
      if (key.toString().startsWith(today)) {
        final screen = key.toString().replaceFirst('${today}_', '');
        usage[screen] = usageBox.get(key) as int;
      }
    }
    return usage;
  }
}
