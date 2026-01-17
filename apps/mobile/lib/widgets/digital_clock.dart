import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

class DigitalClock extends StatelessWidget {
  final DateTime currentTime;
  final String date;
  final String hijriDate;
  final String location;

  const DigitalClock({
    super.key,
    required this.currentTime,
    required this.date,
    required this.hijriDate,
    required this.location,
  });

  String formatTime(DateTime date) {
    return DateFormat('HH:mm:ss').format(date);
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Card(
      elevation: 8,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: BorderSide(
          color: theme.colorScheme.primary.withOpacity(0.3),
          width: 2,
        ),
      ),
      child: Container(
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(16),
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [theme.cardColor, theme.cardColor.withOpacity(0.5)],
          ),
        ),
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 32, horizontal: 24),
          child: Column(
            children: [
              // Date and Location Info
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Row(
                    children: [
                      Icon(
                        Icons.calendar_today,
                        size: 16,
                        color: theme.colorScheme.onSurface.withOpacity(0.6),
                      ),
                      const SizedBox(width: 8),
                      Text(
                        date,
                        style: theme.textTheme.bodySmall?.copyWith(
                          color: theme.colorScheme.onSurface.withOpacity(0.6),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(width: 32),
                  Row(
                    children: [
                      Icon(
                        Icons.location_on,
                        size: 16,
                        color: theme.colorScheme.onSurface.withOpacity(0.6),
                      ),
                      const SizedBox(width: 8),
                      Text(
                        location,
                        style: theme.textTheme.bodySmall?.copyWith(
                          color: theme.colorScheme.onSurface.withOpacity(0.6),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
              const SizedBox(height: 8),

              // Hijri Date
              Text(
                '$hijriDate AH',
                style: theme.textTheme.bodySmall?.copyWith(
                  color: theme.colorScheme.onSurface.withOpacity(0.6),
                ),
              ),
              const SizedBox(height: 24),

              // Digital Clock Display
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.baseline,
                textBaseline: TextBaseline.alphabetic,
                children: [
                  // Hours and Minutes
                  Text(
                    DateFormat('HH:mm').format(currentTime),
                    style: TextStyle(
                      fontSize: 64,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 2,
                      fontFeatures: const [FontFeature.tabularFigures()],
                      foreground: Paint()
                        ..shader = LinearGradient(
                          colors: [
                            theme.colorScheme.onSurface,
                            theme.colorScheme.onSurface.withOpacity(0.7),
                          ],
                        ).createShader(const Rect.fromLTWH(0, 0, 200, 70)),
                    ),
                  ),
                  const SizedBox(width: 4),
                  // Seconds
                  Text(
                    DateFormat(':ss').format(currentTime),
                    style: TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.w500,
                      letterSpacing: 1,
                      fontFeatures: const [FontFeature.tabularFigures()],
                      color: theme.colorScheme.onSurface.withOpacity(0.6),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
