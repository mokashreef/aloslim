import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../services/location_service.dart';

class LocationState {
  final double latitude;
  final double longitude;
  final String city;
  final String country;
  final bool isLoading;
  final String? error;

  const LocationState({
    this.latitude = 21.4225,
    this.longitude = 39.8262,
    this.city = 'مكة المكرمة',
    this.country = 'Saudi Arabia',
    this.isLoading = true,
    this.error,
  });

  LocationState copyWith({
    double? latitude,
    double? longitude,
    String? city,
    String? country,
    bool? isLoading,
    String? error,
  }) {
    return LocationState(
      latitude: latitude ?? this.latitude,
      longitude: longitude ?? this.longitude,
      city: city ?? this.city,
      country: country ?? this.country,
      isLoading: isLoading ?? this.isLoading,
      error: error,
    );
  }
}

class LocationNotifier extends StateNotifier<LocationState> {
  LocationNotifier() : super(const LocationState()) {
    _init();
  }

  final LocationService _locationService = LocationService();

  Future<void> _init() async {
    await fetchLocation();
  }

  Future<void> fetchLocation() async {
    state = state.copyWith(isLoading: true, error: null);

    try {
      final locationData = await _locationService.getLocationData();
      state = state.copyWith(
        latitude: locationData.latitude,
        longitude: locationData.longitude,
        city: locationData.city,
        country: locationData.country,
        isLoading: false,
      );
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: 'فشل في تحديد الموقع',
      );
    }
  }
}

final locationProvider =
    StateNotifierProvider<LocationNotifier, LocationState>(
  (ref) => LocationNotifier(),
);
