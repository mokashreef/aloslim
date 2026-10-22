import 'package:flutter_local_notifications/flutter_local_notifications.dart';

class NotificationService {
  static final NotificationService _instance = NotificationService._internal();
  factory NotificationService() => _instance;
  NotificationService._internal();

  final FlutterLocalNotificationsPlugin _localNotifications =
      FlutterLocalNotificationsPlugin();

  Future<void> init() async {
    const androidSettings = AndroidInitializationSettings('@mipmap/ic_launcher');
    const iosSettings = DarwinInitializationSettings(
      requestAlertPermission: true,
      requestBadgePermission: true,
      requestSoundPermission: true,
    );

    const initSettings = InitializationSettings(
      android: androidSettings,
      iOS: iosSettings,
    );

    await _localNotifications.initialize(
      initSettings,
      onDidReceiveNotificationResponse: _onNotificationTap,
    );
  }

  void _onNotificationTap(NotificationResponse response) {
    // Handle notification tap — navigate to relevant screen
  }

  /// Show a local notification for prayer time
  Future<void> showPrayerNotification({
    required int id,
    required String prayerName,
    required String time,
  }) async {
    const androidDetails = AndroidNotificationDetails(
      'prayer_channel',
      'Prayer Reminders',
      channelDescription: 'Notifications for prayer times',
      importance: Importance.high,
      priority: Priority.high,
      playSound: true,
      icon: '@mipmap/ic_launcher',
    );

    const notificationDetails = NotificationDetails(
      android: androidDetails,
      iOS: DarwinNotificationDetails(),
    );

    await _localNotifications.show(
      id,
      'حان وقت الصلاة',
      'حان الآن وقت صلاة $prayerName - $time',
      notificationDetails,
    );
  }

  /// Show a daily adhkar reminder
  Future<void> showAdhkarReminder({
    required int id,
    required String title,
    required String body,
  }) async {
    const androidDetails = AndroidNotificationDetails(
      'adhkar_channel',
      'Adhkar Reminders',
      channelDescription: 'Daily adhkar reminders',
      importance: Importance.defaultImportance,
      priority: Priority.defaultPriority,
      icon: '@mipmap/ic_launcher',
    );

    const notificationDetails = NotificationDetails(
      android: androidDetails,
      iOS: DarwinNotificationDetails(),
    );

    await _localNotifications.show(id, title, body, notificationDetails);
  }

  /// Schedule a notification at a specific time
  Future<void> schedulePrayerNotification({
    required int id,
    required String prayerName,
    required DateTime scheduledTime,
  }) async {
    // For scheduled notifications, use timezone-aware scheduling
    // This is a simplified version
    final delay = scheduledTime.difference(DateTime.now());
    if (delay.isNegative) return;

    Future.delayed(delay, () {
      showPrayerNotification(
        id: id,
        prayerName: prayerName,
        time: '${scheduledTime.hour}:${scheduledTime.minute.toString().padLeft(2, '0')}',
      );
    });
  }

  /// Cancel all notifications
  Future<void> cancelAll() async {
    await _localNotifications.cancelAll();
  }

  /// Cancel a specific notification
  Future<void> cancel(int id) async {
    await _localNotifications.cancel(id);
  }
}
