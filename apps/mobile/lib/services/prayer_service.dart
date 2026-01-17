import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:geolocator/geolocator.dart';
import '../models/prayer_timings.dart';

class PrayerService {
  static const String _baseUrl = 'https://api.aladhan.com/v1/timings';

  Future<AladhanResponse> fetchPrayerTimes(
    double latitude,
    double longitude,
  ) async {
    try {
      final response = await http.get(
        Uri.parse('$_baseUrl?latitude=$latitude&longitude=$longitude&method=2'),
      );

      if (response.statusCode == 200) {
        final Map<String, dynamic> data = json.decode(response.body);
        return AladhanResponse.fromJson(data);
      } else {
        throw Exception('Failed to fetch prayer times');
      }
    } catch (e) {
      throw Exception('Error fetching prayer times: $e');
    }
  }

  Future<bool> openLocationSettings() async {
    return await Geolocator.openLocationSettings();
  }

  Future<Position> getUserLocation() async {
    bool serviceEnabled;
    LocationPermission permission;

    // Test if location services are enabled
    serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) {
      throw Exception(
        'Location services are disabled. Please enable location services.',
      );
    }

    // Check current permission status
    permission = await Geolocator.checkPermission();

    // If permission is denied or deniedForever, request permission
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) {
        throw Exception(
          'Location permission denied. Please grant location access to get prayer times.',
        );
      }
    }

    if (permission == LocationPermission.deniedForever) {
      throw Exception(
        'Location permissions are permanently denied. Please enable location access in your device settings.',
      );
    }

    // Permission is granted, get the position
    return await Geolocator.getCurrentPosition(
      desiredAccuracy: LocationAccuracy.high,
    );
  }

  int convertToMinutes(String time) {
    final parts = time.split(':');
    final hours = int.parse(parts[0]);
    final minutes = int.parse(parts[1]);
    return hours * 60 + minutes;
  }

  String addMinutesToTime(String time, int minutes) {
    final timeMinutes = convertToMinutes(time);
    final newMinutes = timeMinutes + minutes;
    final hours = (newMinutes ~/ 60) % 24;
    final mins = newMinutes % 60;
    return '${hours.toString().padLeft(2, '0')}:${mins.toString().padLeft(2, '0')}';
  }
}
