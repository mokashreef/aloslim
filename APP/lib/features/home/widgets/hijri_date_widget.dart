import 'package:flutter/material.dart';
import '../../../core/theme/app_theme.dart';

class HijriDateWidget extends StatelessWidget {
  final String hijriDate;
  final String gregorianDate;
  final String city;
  final bool isArabic;

  const HijriDateWidget({
    super.key,
    required this.hijriDate,
    required this.gregorianDate,
    required this.city,
    this.isArabic = true,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: AppTheme.primaryGradient,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: AppTheme.primary.withOpacity(0.3),
            blurRadius: 15,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Column(
        children: [
          // Hijri date
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.calendar_month_rounded,
                  color: Colors.white70, size: 18),
              const SizedBox(width: 8),
              Text(
                hijriDate.isNotEmpty ? hijriDate : '...',
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 22,
                  fontWeight: FontWeight.w700,
                ),
              ),
            ],
          ),
          const SizedBox(height: 6),

          // Gregorian date
          Text(
            gregorianDate.isNotEmpty ? gregorianDate : '...',
            style: TextStyle(
              color: Colors.white.withOpacity(0.8),
              fontSize: 14,
              fontWeight: FontWeight.w400,
            ),
          ),
          const SizedBox(height: 12),

          // Location
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.15),
              borderRadius: BorderRadius.circular(20),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(Icons.location_on_rounded,
                    color: Colors.white70, size: 14),
                const SizedBox(width: 4),
                Text(
                  city.isNotEmpty ? city : '...',
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 13,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
