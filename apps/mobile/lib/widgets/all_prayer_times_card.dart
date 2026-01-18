import 'package:flutter/material.dart';
import '../models/prayer_timings.dart';
import '../services/prayer_service.dart';
import 'prayer_card.dart';

class AllPrayerTimesCard extends StatelessWidget {
  final PrayerTimings? prayerData;
  final String currentPrayer;
  final String nextPrayer;
  final bool isRestrictedTime;
  final String restrictedTimeReason;
  final VoidCallback onRefresh;

  const AllPrayerTimesCard({
    super.key,
    required this.prayerData,
    required this.currentPrayer,
    required this.nextPrayer,
    required this.isRestrictedTime,
    required this.restrictedTimeReason,
    required this.onRefresh,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Card(
      elevation: 6,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header
            Row(
              children: [
                Icon(
                  Icons.nightlight_round,
                  size: 24,
                  color: theme.colorScheme.primary,
                ),
                const SizedBox(width: 8),
                Text(
                  "Today's Prayer Times",
                  style: theme.textTheme.titleLarge?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Text(
              'All five daily prayers and restricted times',
              style: theme.textTheme.bodySmall?.copyWith(
                color: theme.colorScheme.onSurface.withOpacity(0.6),
              ),
            ),
            const SizedBox(height: 20),

            // Prayer Times Grid
            if (prayerData != null) ...[
              // Fajr
              PrayerCard(
                name: 'Fajr',
                time: prayerData!.fajr,
                isCurrent: currentPrayer == 'Fajr',
                isNext: nextPrayer == 'Fajr',
              ),
              const SizedBox(height: 12),

              // Restricted Time 1: After Sunrise (~20 min)
              _RestrictedTimeIndicator(
                startTime: prayerData!.sunrise,
                endTime: PrayerService().addMinutesToTime(
                  prayerData!.sunrise,
                  20,
                ),
                description: 'After sunrise',
              ),
              const SizedBox(height: 12),

              // Restricted Time 2: Before Dhuhr (~10 min)
              _RestrictedTimeIndicator(
                startTime: PrayerService().addMinutesToTime(
                  prayerData!.dhuhr,
                  -10,
                ),
                endTime: prayerData!.dhuhr,
                description: 'Before Dhuhr',
              ),
              const SizedBox(height: 12),

              // Dhuhr
              PrayerCard(
                name: 'Dhuhr',
                time: prayerData!.dhuhr,
                isCurrent: currentPrayer == 'Dhuhr',
                isNext: nextPrayer == 'Dhuhr',
              ),
              const SizedBox(height: 12),

              // Asr
              PrayerCard(
                name: 'Asr',
                time: prayerData!.asr,
                isCurrent: currentPrayer == 'Asr',
                isNext: nextPrayer == 'Asr',
              ),
              const SizedBox(height: 12),

              // Restricted Time 3: Before Maghrib (~20 min)
              _RestrictedTimeIndicator(
                startTime: PrayerService().addMinutesToTime(
                  prayerData!.maghrib,
                  -20,
                ),
                endTime: prayerData!.maghrib,
                description: 'Until sunset',
              ),
              const SizedBox(height: 12),

              // Maghrib
              PrayerCard(
                name: 'Maghrib',
                time: prayerData!.maghrib,
                isCurrent: currentPrayer == 'Maghrib',
                isNext: nextPrayer == 'Maghrib',
              ),
              const SizedBox(height: 12),

              // Isha
              PrayerCard(
                name: 'Isha',
                time: prayerData!.isha,
                isCurrent: currentPrayer == 'Isha',
                isNext: nextPrayer == 'Isha',
              ),
            ],

            // Restricted Time Warning
            if (isRestrictedTime) ...[
              const SizedBox(height: 16),
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: theme.colorScheme.error.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                    color: theme.colorScheme.error.withOpacity(0.5),
                    width: 2,
                  ),
                ),
                child: Row(
                  children: [
                    Icon(
                      Icons.warning_outlined,
                      size: 24,
                      color: theme.colorScheme.error,
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Restricted Prayer Time',
                            style: theme.textTheme.titleSmall?.copyWith(
                              fontWeight: FontWeight.bold,
                              color: theme.colorScheme.error,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            restrictedTimeReason,
                            style: theme.textTheme.bodySmall?.copyWith(
                              color: theme.colorScheme.onSurface.withOpacity(
                                0.6,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ],

            // Refresh Button
            const SizedBox(height: 24),
            SizedBox(
              width: double.infinity,
              child: OutlinedButton.icon(
                onPressed: onRefresh,
                icon: const Icon(Icons.refresh),
                label: const Text('Refresh Location'),
                style: OutlinedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _RestrictedTimeIndicator extends StatelessWidget {
  final String startTime;
  final String endTime;
  final String description;

  const _RestrictedTimeIndicator({
    required this.startTime,
    required this.endTime,
    required this.description,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Container(
      padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 16),
      decoration: BoxDecoration(
        color: theme.colorScheme.error.withOpacity(0.05),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(
          color: theme.colorScheme.error.withOpacity(0.3),
          width: 1,
        ),
      ),
      child: Row(
        children: [
          Icon(Icons.block, size: 16, color: theme.colorScheme.error),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              'Restricted: $description',
              style: theme.textTheme.bodySmall?.copyWith(
                color: theme.colorScheme.error,
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
          Text(
            '$startTime - $endTime',
            style: theme.textTheme.bodySmall?.copyWith(
              color: theme.colorScheme.onSurface.withOpacity(0.6),
              fontFeatures: const [FontFeature.tabularFigures()],
            ),
          ),
        ],
      ),
    );
  }
}
