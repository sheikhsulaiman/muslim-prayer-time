class PrayerTimings {
  final String fajr;
  final String sunrise;
  final String dhuhr;
  final String asr;
  final String sunset;
  final String maghrib;
  final String isha;
  final String imsak;
  final String midnight;
  final String firstthird;
  final String lastthird;

  PrayerTimings({
    required this.fajr,
    required this.sunrise,
    required this.dhuhr,
    required this.asr,
    required this.sunset,
    required this.maghrib,
    required this.isha,
    required this.imsak,
    required this.midnight,
    required this.firstthird,
    required this.lastthird,
  });

  factory PrayerTimings.fromJson(Map<String, dynamic> json) {
    return PrayerTimings(
      fajr: json['Fajr'] as String,
      sunrise: json['Sunrise'] as String,
      dhuhr: json['Dhuhr'] as String,
      asr: json['Asr'] as String,
      sunset: json['Sunset'] as String,
      maghrib: json['Maghrib'] as String,
      isha: json['Isha'] as String,
      imsak: json['Imsak'] as String,
      midnight: json['Midnight'] as String,
      firstthird: json['Firstthird'] as String,
      lastthird: json['Lastthird'] as String,
    );
  }

  String getPrayerTime(String prayerName) {
    switch (prayerName.toLowerCase()) {
      case 'fajr':
        return fajr;
      case 'sunrise':
        return sunrise;
      case 'dhuhr':
        return dhuhr;
      case 'asr':
        return asr;
      case 'sunset':
        return sunset;
      case 'maghrib':
        return maghrib;
      case 'isha':
        return isha;
      default:
        return '';
    }
  }
}

class AladhanResponse {
  final PrayerTimings timings;
  final AladhanDate date;
  final AladhanMeta meta;

  AladhanResponse({
    required this.timings,
    required this.date,
    required this.meta,
  });

  factory AladhanResponse.fromJson(Map<String, dynamic> json) {
    return AladhanResponse(
      timings: PrayerTimings.fromJson(json['data']['timings']),
      date: AladhanDate.fromJson(json['data']['date']),
      meta: AladhanMeta.fromJson(json['data']['meta']),
    );
  }
}

class AladhanDate {
  final GregorianDate gregorian;
  final HijriDate hijri;

  AladhanDate({required this.gregorian, required this.hijri});

  factory AladhanDate.fromJson(Map<String, dynamic> json) {
    return AladhanDate(
      gregorian: GregorianDate.fromJson(json['gregorian']),
      hijri: HijriDate.fromJson(json['hijri']),
    );
  }
}

class GregorianDate {
  final String date;
  final String day;
  final GregorianMonth month;
  final String year;

  GregorianDate({
    required this.date,
    required this.day,
    required this.month,
    required this.year,
  });

  factory GregorianDate.fromJson(Map<String, dynamic> json) {
    return GregorianDate(
      date: json['date'] as String,
      day: json['day'] as String,
      month: GregorianMonth.fromJson(json['month']),
      year: json['year'] as String,
    );
  }
}

class GregorianMonth {
  final int number;
  final String en;

  GregorianMonth({required this.number, required this.en});

  factory GregorianMonth.fromJson(Map<String, dynamic> json) {
    return GregorianMonth(
      number: json['number'] as int,
      en: json['en'] as String,
    );
  }
}

class HijriDate {
  final String day;
  final HijriMonth month;
  final String year;

  HijriDate({required this.day, required this.month, required this.year});

  factory HijriDate.fromJson(Map<String, dynamic> json) {
    return HijriDate(
      day: json['day'] as String,
      month: HijriMonth.fromJson(json['month']),
      year: json['year'] as String,
    );
  }
}

class HijriMonth {
  final int number;
  final String en;
  final String ar;

  HijriMonth({required this.number, required this.en, required this.ar});

  factory HijriMonth.fromJson(Map<String, dynamic> json) {
    return HijriMonth(
      number: json['number'] as int,
      en: json['en'] as String,
      ar: json['ar'] as String,
    );
  }
}

class AladhanMeta {
  final double latitude;
  final double longitude;

  AladhanMeta({required this.latitude, required this.longitude});

  factory AladhanMeta.fromJson(Map<String, dynamic> json) {
    return AladhanMeta(
      latitude: json['latitude'] as double,
      longitude: json['longitude'] as double,
    );
  }
}
