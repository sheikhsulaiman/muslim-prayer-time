import 'dart:async';
import 'package:flutter/material.dart';
import '../models/prayer_timings.dart';
import '../services/prayer_service.dart';

class PrayerProvider extends ChangeNotifier {
  final PrayerService _service = PrayerService();

  PrayerTimings? _prayerData;
  String _location = '';
  String _date = '';
  String _hijriDate = '';
  bool _loading = true;
  String? _error;
  DateTime _currentTime = DateTime.now();
  String _currentPrayer = '';
  String _nextPrayer = '';
  String _timeUntilNext = '';
  double _progress = 0.0;
  bool _isRestrictedTime = false;
  String _restrictedTimeReason = '';
  bool _isPrayerWindowEnded = false;
  Timer? _timer;

  // Getters
  PrayerTimings? get prayerData => _prayerData;
  String get location => _location;
  String get date => _date;
  String get hijriDate => _hijriDate;
  bool get loading => _loading;
  String? get error => _error;
  DateTime get currentTime => _currentTime;
  String get currentPrayer => _currentPrayer;
  String get nextPrayer => _nextPrayer;
  String get timeUntilNext => _timeUntilNext;
  double get progress => _progress;
  bool get isRestrictedTime => _isRestrictedTime;
  String get restrictedTimeReason => _restrictedTimeReason;
  bool get isPrayerWindowEnded => _isPrayerWindowEnded;

  final List<String> mainPrayers = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

  PrayerProvider() {
    _startTimer();
    getUserLocation();
  }

  void _startTimer() {
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      _currentTime = DateTime.now();
      _calculatePrayerStatus();
      _checkRestrictedTime();
      notifyListeners();
    });
  }

  Future<void> getUserLocation() async {
    try {
      _loading = true;
      _error = null;
      notifyListeners();

      final position = await _service.getUserLocation();
      await fetchPrayerTimes(position.latitude, position.longitude);
    } catch (e) {
      _error = 'Unable to get your location. Please enable location services.';
      _loading = false;
      notifyListeners();
    }
  }

  Future<void> fetchPrayerTimes(double latitude, double longitude) async {
    try {
      _loading = true;
      _error = null;
      notifyListeners();

      final response = await _service.fetchPrayerTimes(latitude, longitude);

      _prayerData = response.timings;
      _date = response.date.gregorian.date;
      _hijriDate =
          '${response.date.hijri.day} ${response.date.hijri.month.en} ${response.date.hijri.year}';
      _location =
          '${response.meta.latitude.toStringAsFixed(2)}°, ${response.meta.longitude.toStringAsFixed(2)}°';

      _calculatePrayerStatus();
      _checkRestrictedTime();

      _loading = false;
      notifyListeners();
    } catch (e) {
      _error = e.toString();
      _loading = false;
      notifyListeners();
    }
  }

  void _calculatePrayerStatus() {
    if (_prayerData == null) return;

    final now = DateTime.now();
    final currentMinutes = now.hour * 60 + now.minute;

    final prayers = mainPrayers.map((name) {
      return {
        'name': name,
        'time': _prayerData!.getPrayerTime(name),
        'minutes': _service.convertToMinutes(_prayerData!.getPrayerTime(name)),
      };
    }).toList();

    // Calculate Islamic midnight (midpoint between Maghrib and next Fajr)
    final maghribMinutes = _service.convertToMinutes(_prayerData!.maghrib);
    final fajrMinutes = _service.convertToMinutes(_prayerData!.fajr);
    final nightDuration = fajrMinutes < maghribMinutes
        ? (24 * 60 - maghribMinutes) + fajrMinutes
        : fajrMinutes - maghribMinutes;
    final islamicMidnight =
        (maghribMinutes + (nightDuration / 2).floor()) % (24 * 60);

    // Define prayer windows with their end times
    final sunriseMinutes = _service.convertToMinutes(_prayerData!.sunrise);
    final prayerWindows = {
      'Fajr': {'start': fajrMinutes, 'end': sunriseMinutes},
      'Dhuhr': {
        'start': _service.convertToMinutes(_prayerData!.dhuhr),
        'end': _service.convertToMinutes(_prayerData!.asr),
      },
      'Asr': {
        'start': _service.convertToMinutes(_prayerData!.asr),
        'end': maghribMinutes,
      },
      'Maghrib': {
        'start': maghribMinutes,
        'end': _service.convertToMinutes(_prayerData!.isha),
      },
      'Isha': {
        'start': _service.convertToMinutes(_prayerData!.isha),
        'end': islamicMidnight.toInt(),
      },
    };

    // Find current and next prayer
    String current = 'Isha';
    String next = 'Fajr';
    int nextTime = prayers[0]['minutes'] as int;
    int currentTime = prayers[prayers.length - 1]['minutes'] as int;

    for (int i = 0; i < prayers.length; i++) {
      if (currentMinutes >= (prayers[i]['minutes'] as int)) {
        current = prayers[i]['name'] as String;
        currentTime = prayers[i]['minutes'] as int;
        next = prayers[(i + 1) % prayers.length]['name'] as String;
        nextTime = prayers[(i + 1) % prayers.length]['minutes'] as int;
      } else {
        break;
      }
    }

    _currentPrayer = current;
    _nextPrayer = next;

    // Calculate time until next prayer
    int minutesUntilNext = nextTime - currentMinutes;
    if (minutesUntilNext < 0) {
      minutesUntilNext += 24 * 60;
    }

    final hours = minutesUntilNext ~/ 60;
    final minutes = minutesUntilNext % 60;
    _timeUntilNext = '${hours}h ${minutes.toString().padLeft(2, '0')}m';

    // Calculate progress
    int totalDuration = nextTime - currentTime;
    if (totalDuration < 0) {
      totalDuration += 24 * 60;
    }
    final elapsed = totalDuration - minutesUntilNext;
    final progressPercent = (elapsed / totalDuration) * 100;
    _progress = progressPercent.clamp(0.0, 100.0);

    // Check if prayer window has ended
    final currentWindow = prayerWindows[current];
    bool windowEnded = false;

    if (currentWindow != null) {
      final windowEnd = currentWindow['end'] as int;
      final windowStart = currentWindow['start'] as int;

      // Handle cases where end time might be past midnight
      if (windowEnd < windowStart) {
        // Window crosses midnight (e.g., Isha ending at Islamic midnight before Fajr)
        windowEnded =
            currentMinutes >= windowEnd && currentMinutes < windowStart;
      } else {
        // Normal case: window is within the same day
        windowEnded = currentMinutes >= windowEnd;
      }
    }

    _isPrayerWindowEnded = windowEnded;
  }

  void _checkRestrictedTime() {
    if (_prayerData == null) return;

    final now = DateTime.now();
    final currentMinutes = now.hour * 60 + now.minute;

    final sunriseMinutes = _service.convertToMinutes(_prayerData!.sunrise);
    final dhuhrMinutes = _service.convertToMinutes(_prayerData!.dhuhr);
    final asrMinutes = _service.convertToMinutes(_prayerData!.asr);
    final maghribMinutes = _service.convertToMinutes(_prayerData!.maghrib);

    final sunriseEnd = sunriseMinutes + 20;
    final dhuhrStart = dhuhrMinutes - 10;

    if (currentMinutes >= sunriseMinutes && currentMinutes <= sunriseEnd) {
      _isRestrictedTime = true;
      _isPrayerWindowEnded = false;
      _restrictedTimeReason =
          'Sunrise period - voluntary prayers not recommended (~20 min after sunrise)';
    } else if (currentMinutes >= dhuhrStart && currentMinutes < dhuhrMinutes) {
      _isRestrictedTime = true;
      _isPrayerWindowEnded = false;
      _restrictedTimeReason =
          'Sun at zenith - voluntary prayers not recommended (~10 min before Dhuhr)';
    } else if (currentMinutes >= asrMinutes &&
        currentMinutes < maghribMinutes) {
      _isRestrictedTime = true;
      _isPrayerWindowEnded = false;
      _restrictedTimeReason =
          'Afternoon period - voluntary prayers not recommended (after Asr until Maghrib)';
    } else {
      _isRestrictedTime = false;
      _restrictedTimeReason = '';
    }
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }
}
