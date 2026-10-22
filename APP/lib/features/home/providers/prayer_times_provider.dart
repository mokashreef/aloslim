import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../services/api_service.dart';
import '../../../services/location_service.dart';
import '../../../core/constants/api_constants.dart';

// ─── Prayer Times State ────────────────────────────────────
class PrayerTimesState {
  final Map<String, String> times;
  final String? nextPrayer;
  final Duration? timeToNext;
  final String city;
  final String country;
  final String hijriDate;
  final String gregorianDate;
  final bool isLoading;
  final String? error;

  const PrayerTimesState({
    this.times = const {},
    this.nextPrayer,
    this.timeToNext,
    this.city = '',
    this.country = '',
    this.hijriDate = '',
    this.gregorianDate = '',
    this.isLoading = true,
    this.error,
  });

  PrayerTimesState copyWith({
    Map<String, String>? times,
    String? nextPrayer,
    Duration? timeToNext,
    String? city,
    String? country,
    String? hijriDate,
    String? gregorianDate,
    bool? isLoading,
    String? error,
  }) {
    return PrayerTimesState(
      times: times ?? this.times,
      nextPrayer: nextPrayer ?? this.nextPrayer,
      timeToNext: timeToNext ?? this.timeToNext,
      city: city ?? this.city,
      country: country ?? this.country,
      hijriDate: hijriDate ?? this.hijriDate,
      gregorianDate: gregorianDate ?? this.gregorianDate,
      isLoading: isLoading ?? this.isLoading,
      error: error,
    );
  }
}

// ─── Prayer Times Notifier ─────────────────────────────────
class PrayerTimesNotifier extends StateNotifier<PrayerTimesState> {
  PrayerTimesNotifier() : super(const PrayerTimesState()) {
    fetchPrayerTimes();
  }

  final ApiService _api = ApiService();
  final LocationService _location = LocationService();

  Future<void> fetchPrayerTimes() async {
    state = state.copyWith(isLoading: true, error: null);

    try {
      // Get location
      final locationData = await _location.getLocationData();

      // Fetch prayer times from Aladhan API
      final url = ApiConstants.prayerTimesByCoords(
        locationData.latitude,
        locationData.longitude,
        4, // Umm Al-Qura method
      );

      final data = await _api.get(url);

      if (data != null && data['data'] != null) {
        final timings = data['data']['timings'] as Map<String, dynamic>;
        final dateInfo = data['data']['date'];

        // Extract prayer times
        final prayerKeys = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
        final Map<String, String> times = {};
        for (final key in prayerKeys) {
          // Remove timezone info like "(EET)"
          String time = timings[key]?.toString() ?? '';
          time = time.replaceAll(RegExp(r'\s*\(.*\)'), '');
          times[key] = time;
        }

        // Hijri date
        final hijri = dateInfo['hijri'];
        final hijriStr = '${hijri['day']} ${hijri['month']['ar']} ${hijri['year']}';
        final gregorianStr = dateInfo['readable'] ?? '';

        // Find next prayer
        final nextPrayerInfo = _findNextPrayer(times);

        state = state.copyWith(
          times: times,
          nextPrayer: nextPrayerInfo['name'],
          timeToNext: nextPrayerInfo['duration'] as Duration?,
          city: locationData.city,
          country: locationData.country,
          hijriDate: hijriStr,
          gregorianDate: gregorianStr,
          isLoading: false,
        );
      }
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: 'فشل في تحميل مواقيت الصلاة',
      );
    }
  }

  Map<String, dynamic> _findNextPrayer(Map<String, String> times) {
    final now = DateTime.now();
    final prayerOrder = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

    for (final prayer in prayerOrder) {
      if (prayer == 'Sunrise') continue;
      final timeStr = times[prayer];
      if (timeStr == null) continue;

      final parts = timeStr.split(':');
      if (parts.length < 2) continue;

      final hour = int.tryParse(parts[0]) ?? 0;
      final minute = int.tryParse(parts[1]) ?? 0;
      final prayerTime = DateTime(now.year, now.month, now.day, hour, minute);

      if (prayerTime.isAfter(now)) {
        return {
          'name': prayer,
          'duration': prayerTime.difference(now),
        };
      }
    }

    // If all prayers passed, next is Fajr tomorrow
    final fajrStr = times['Fajr'] ?? '05:00';
    final parts = fajrStr.split(':');
    final hour = int.tryParse(parts[0]) ?? 5;
    final minute = int.tryParse(parts[1]) ?? 0;
    final tomorrowFajr = DateTime(now.year, now.month, now.day + 1, hour, minute);

    return {
      'name': 'Fajr',
      'duration': tomorrowFajr.difference(now),
    };
  }

  void updateCountdown() {
    if (state.times.isNotEmpty) {
      final nextInfo = _findNextPrayer(state.times);
      state = state.copyWith(
        nextPrayer: nextInfo['name'],
        timeToNext: nextInfo['duration'] as Duration?,
      );
    }
  }
}

// ─── Provider ──────────────────────────────────────────────
final prayerTimesProvider =
    StateNotifierProvider<PrayerTimesNotifier, PrayerTimesState>(
  (ref) => PrayerTimesNotifier(),
);
