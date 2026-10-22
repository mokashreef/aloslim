import 'package:geolocator/geolocator.dart';
import 'package:geocoding/geocoding.dart';

class LocationService {
  static final LocationService _instance = LocationService._internal();
  factory LocationService() => _instance;
  LocationService._internal();

  /// Check and request location permissions
  Future<bool> checkPermission() async {
    bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) {
      return false;
    }

    LocationPermission permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) {
        return false;
      }
    }

    if (permission == LocationPermission.deniedForever) {
      return false;
    }

    return true;
  }

  /// Get current position
  Future<Position?> getCurrentPosition() async {
    final hasPermission = await checkPermission();
    if (!hasPermission) return null;

    try {
      return await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.medium,
      );
    } catch (e) {
      return null;
    }
  }

  /// Get city and country name from coordinates
  Future<Map<String, String>?> getCityFromCoords(
      double latitude, double longitude) async {
    try {
      final placemarks = await placemarkFromCoordinates(latitude, longitude);
      if (placemarks.isNotEmpty) {
        final place = placemarks.first;
        return {
          'city': place.locality ?? place.subAdministrativeArea ?? 'Unknown',
          'country': place.country ?? 'Unknown',
          'countryCode': place.isoCountryCode ?? 'US',
        };
      }
    } catch (e) {
      // Fallback to default
    }
    return null;
  }

  /// Get location data (lat, lng, city, country)
  Future<LocationData> getLocationData() async {
    final position = await getCurrentPosition();
    if (position != null) {
      final cityInfo = await getCityFromCoords(
        position.latitude,
        position.longitude,
      );
      return LocationData(
        latitude: position.latitude,
        longitude: position.longitude,
        city: cityInfo?['city'] ?? 'Makkah',
        country: cityInfo?['country'] ?? 'Saudi Arabia',
      );
    }

    // Default to Makkah if location unavailable
    return LocationData(
      latitude: 21.4225,
      longitude: 39.8262,
      city: 'Makkah',
      country: 'Saudi Arabia',
    );
  }
}

class LocationData {
  final double latitude;
  final double longitude;
  final String city;
  final String country;

  LocationData({
    required this.latitude,
    required this.longitude,
    required this.city,
    required this.country,
  });
}
