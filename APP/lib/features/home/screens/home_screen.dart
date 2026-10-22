import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/prayer_times_provider.dart';
import '../widgets/prayer_times_card.dart';
import '../widgets/hijri_date_widget.dart';
import '../../../widgets/loading_widget.dart';
import '../../../widgets/error_widget.dart' as app_widgets;
import '../../../core/constants/app_constants.dart';
import '../../profile/providers/settings_provider.dart';

class HomeScreen extends ConsumerStatefulWidget {
  const HomeScreen({super.key});

  @override
  ConsumerState<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends ConsumerState<HomeScreen> {
  @override
  Widget build(BuildContext context) {
    final prayerState = ref.watch(prayerTimesProvider);
    final settings = ref.watch(settingsProvider);
    final isArabic = settings.locale == 'ar';

    if (prayerState.isLoading && prayerState.times.isEmpty) {
      return const LoadingWidget();
    }

    if (prayerState.error != null && prayerState.times.isEmpty) {
      return app_widgets.AppErrorWidget(
        message: prayerState.error!,
        onRetry: () => ref.read(prayerTimesProvider.notifier).fetchPrayerTimes(),
      );
    }

    return Scaffold(
      body: RefreshIndicator(
        onRefresh: () =>
            ref.read(prayerTimesProvider.notifier).fetchPrayerTimes(),
        child: CustomScrollView(
          physics: const BouncingScrollPhysics(),
          slivers: [
            // App Bar
            SliverAppBar(
              floating: true,
              expandedHeight: 80,
              title: Text(
                isArabic ? AppConstants.appName : AppConstants.appNameEn,
                style: const TextStyle(fontWeight: FontWeight.w800),
              ),
              centerTitle: true,
              actions: [
                IconButton(
                  icon: const Icon(Icons.refresh_rounded),
                  onPressed: () =>
                      ref.read(prayerTimesProvider.notifier).fetchPrayerTimes(),
                ),
              ],
            ),

            // Content
            SliverToBoxAdapter(
              child: Column(
                children: [
                  const SizedBox(height: 10),

                  // Hijri & Location Card
                  HijriDateWidget(
                    hijriDate: prayerState.hijriDate,
                    gregorianDate: prayerState.gregorianDate,
                    city: prayerState.city,
                    isArabic: isArabic,
                  ),

                  const SizedBox(height: 24),

                  // Next Prayer Countdown (Simplified for now)
                  if (prayerState.nextPrayer != null)
                    _NextPrayerCountdown(
                      prayerName: isArabic
                          ? (AppConstants.prayerNamesAr[prayerState.nextPrayer] ??
                              prayerState.nextPrayer!)
                          : prayerState.nextPrayer!,
                      timeToNext: prayerState.timeToNext,
                      isArabic: isArabic,
                    ),

                  const SizedBox(height: 24),

                  // Prayer Times Card
                  PrayerTimesCard(
                    times: prayerState.times,
                    nextPrayer: prayerState.nextPrayer,
                    timeToNext: prayerState.timeToNext,
                    isArabic: isArabic,
                  ),

                  const SizedBox(height: 30),

                  // Daily Inspiration Placeholder
                  _InspirationCard(isArabic: isArabic),

                  const SizedBox(height: 100), // Bottom padding
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _NextPrayerCountdown extends StatelessWidget {
  final String prayerName;
  final Duration? timeToNext;
  final bool isArabic;

  const _NextPrayerCountdown({
    required this.prayerName,
    this.timeToNext,
    required this.isArabic,
  });

  @override
  Widget build(BuildContext context) {
    if (timeToNext == null) return const SizedBox.shrink();

    final hours = timeToNext!.inHours;
    final minutes = timeToNext!.inMinutes.remainder(60);
    final seconds = timeToNext!.inSeconds.remainder(60);

    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16),
      padding: const EdgeInsets.symmetric(vertical: 24, horizontal: 20),
      decoration: BoxDecoration(
        color: Theme.of(context).cardColor,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: Theme.of(context).primaryColor.withOpacity(0.1),
          width: 1,
        ),
      ),
      child: Column(
        children: [
          Text(
            isArabic ? 'باقي على صلاة $prayerName' : 'Time to $prayerName',
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w600,
              color: Theme.of(context).textTheme.bodySmall?.color,
            ),
          ),
          const SizedBox(height: 16),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              _TimeUnit(
                  value: hours.toString().padLeft(2, '0'),
                  label: isArabic ? 'ساعة' : 'Hrs'),
              _Separator(),
              _TimeUnit(
                  value: minutes.toString().padLeft(2, '0'),
                  label: isArabic ? 'دقيقة' : 'Min'),
              _Separator(),
              _TimeUnit(
                  value: seconds.toString().padLeft(2, '0'),
                  label: isArabic ? 'ثانية' : 'Sec'),
            ],
          ),
        ],
      ),
    );
  }
}

class _TimeUnit extends StatelessWidget {
  final String value;
  final String label;

  const _TimeUnit({required this.value, required this.label});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text(
          value,
          style: TextStyle(
            fontSize: 32,
            fontWeight: FontWeight.w800,
            color: Theme.of(context).primaryColor,
            fontFamily: 'monospace',
          ),
        ),
        const SizedBox(height: 4),
        Text(
          label,
          style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w500),
        ),
      ],
    );
  }
}

class _Separator extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 12, marginBottom: 20),
      child: Text(
        ':',
        style: TextStyle(
          fontSize: 24,
          fontWeight: FontWeight.w900,
          color: Theme.of(context).primaryColor.withOpacity(0.5),
        ),
      ),
    );
  }
}

class _InspirationCard extends StatelessWidget {
  final bool isArabic;

  const _InspirationCard({required this.isArabic});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16),
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Theme.of(context).primaryColor.withOpacity(0.05),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: Theme.of(context).primaryColor.withOpacity(0.1),
          style: BorderStyle.solid,
        ),
      ),
      child: Column(
        children: [
          Icon(Icons.auto_awesome_rounded,
              color: Theme.of(context).primaryColor, size: 28),
          const SizedBox(height: 16),
          Text(
            isArabic
                ? '"إِنَّ الصَّلَاةَ كَانَتْ عَلَى الْمُؤْمِنِينَ كِتَابًا مَّوْقُوتًا"'
                : '"Prayer indeed has been enjoined on the believers at fixed times"',
            textAlign: TextAlign.center,
            style: const TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w700,
              height: 1.6,
            ),
          ),
          const SizedBox(height: 12),
          Text(
            isArabic ? 'سورة النساء - آية ١٠٣' : 'Surah An-Nisa - Ayah 103',
            style: TextStyle(
              fontSize: 13,
              color: Theme.of(context).textTheme.bodySmall?.color,
              fontStyle: FontStyle.italic,
            ),
          ),
        ],
      ),
    );
  }
}
