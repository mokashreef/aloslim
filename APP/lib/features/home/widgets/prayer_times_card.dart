import 'package:flutter/material.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/constants/app_constants.dart';

class PrayerTimesCard extends StatelessWidget {
  final Map<String, String> times;
  final String? nextPrayer;
  final Duration? timeToNext;
  final bool isArabic;

  const PrayerTimesCard({
    super.key,
    required this.times,
    this.nextPrayer,
    this.timeToNext,
    this.isArabic = true,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final prayerNames =
        isArabic ? AppConstants.prayerNamesAr : AppConstants.prayerNamesEn;

    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: isDark ? AppTheme.darkCard : Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(isDark ? 0.2 : 0.05),
            blurRadius: 15,
            offset: const Offset(0, 5),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  gradient: AppTheme.primaryGradient,
                  borderRadius: BorderRadius.circular(10),
                ),
                child: const Icon(
                  Icons.mosque_rounded,
                  color: Colors.white,
                  size: 20,
                ),
              ),
              const SizedBox(width: 12),
              Text(
                isArabic ? 'مواقيت الصلاة' : 'Prayer Times',
                style: Theme.of(context).textTheme.headlineSmall,
              ),
            ],
          ),
          const SizedBox(height: 16),

          // Prayer time rows
          ...times.entries.map((entry) {
            final isNext = entry.key == nextPrayer;
            final name = prayerNames[entry.key] ?? entry.key;

            return _PrayerTimeRow(
              name: name,
              time: entry.value,
              isNext: isNext,
              icon: IconData(
                AppConstants.prayerIcons[entry.key] ?? 0xe518,
                fontFamily: 'MaterialIcons',
              ),
              isDark: isDark,
            );
          }),
        ],
      ),
    );
  }
}

class _PrayerTimeRow extends StatelessWidget {
  final String name;
  final String time;
  final bool isNext;
  final IconData icon;
  final bool isDark;

  const _PrayerTimeRow({
    required this.name,
    required this.time,
    required this.isNext,
    required this.icon,
    required this.isDark,
  });

  @override
  Widget build(BuildContext context) {
    return AnimatedContainer(
      duration: const Duration(milliseconds: 300),
      margin: const EdgeInsets.symmetric(vertical: 4),
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      decoration: BoxDecoration(
        color: isNext
            ? (isDark
                ? AppTheme.primaryLight.withOpacity(0.15)
                : AppTheme.primary.withOpacity(0.08))
            : Colors.transparent,
        borderRadius: BorderRadius.circular(12),
        border: isNext
            ? Border.all(
                color: isDark
                    ? AppTheme.primaryLight.withOpacity(0.3)
                    : AppTheme.primary.withOpacity(0.2),
                width: 1,
              )
            : null,
      ),
      child: Row(
        children: [
          Icon(
            icon,
            size: 20,
            color: isNext
                ? (isDark ? AppTheme.primaryLight : AppTheme.primary)
                : (isDark ? Colors.white54 : Colors.grey.shade600),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              name,
              style: TextStyle(
                fontSize: 15,
                fontWeight: isNext ? FontWeight.w700 : FontWeight.w500,
                color: isNext
                    ? (isDark ? AppTheme.primaryLight : AppTheme.primary)
                    : null,
              ),
            ),
          ),
          if (isNext)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
              margin: const EdgeInsets.only(left: 8),
              decoration: BoxDecoration(
                gradient: AppTheme.primaryGradient,
                borderRadius: BorderRadius.circular(6),
              ),
              child: const Text(
                'التالي',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 10,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
          Text(
            time,
            style: TextStyle(
              fontSize: 16,
              fontWeight: isNext ? FontWeight.w700 : FontWeight.w600,
              fontFamily: 'monospace',
              color: isNext
                  ? (isDark ? AppTheme.primaryLight : AppTheme.primary)
                  : null,
            ),
          ),
        ],
      ),
    );
  }
}
