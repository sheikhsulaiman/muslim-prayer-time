import 'package:flutter/material.dart';
import '../models/prayer_timings.dart';

class CurrentPrayerCard extends StatelessWidget {
  final bool isRestrictedTime;
  final bool isPrayerWindowEnded;
  final String currentPrayer;
  final String restrictedTimeReason;
  final PrayerTimings? prayerData;

  const CurrentPrayerCard({
    super.key,
    required this.isRestrictedTime,
    required this.isPrayerWindowEnded,
    required this.currentPrayer,
    required this.restrictedTimeReason,
    required this.prayerData,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    Color borderColor;
    Color backgroundColor;
    String title;
    IconData icon;
    Color iconColor;

    if (isRestrictedTime) {
      borderColor = theme.colorScheme.error.withOpacity(0.3);
      backgroundColor = theme.colorScheme.error.withOpacity(0.05);
      title = 'Restricted Time';
      icon = Icons.warning_outlined;
      iconColor = theme.colorScheme.error;
    } else if (isPrayerWindowEnded) {
      borderColor = Colors.orange.withOpacity(0.3);
      backgroundColor = Colors.orange.withOpacity(0.1);
      title = 'Prayer Window Ended';
      icon = Icons.access_time;
      iconColor = Colors.orange;
    } else {
      borderColor = theme.colorScheme.primary.withOpacity(0.3);
      backgroundColor = theme.colorScheme.primary.withOpacity(0.05);
      title = 'Current Prayer';
      icon = Icons.wb_sunny_outlined;
      iconColor = theme.colorScheme.primary;
    }

    return Card(
      elevation: 6,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: BorderSide(color: borderColor, width: 2),
      ),
      child: Container(
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(16),
          color: backgroundColor,
          boxShadow: [
            BoxShadow(color: borderColor, blurRadius: 8, spreadRadius: 1),
          ],
        ),
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header
              Row(
                children: [
                  Icon(icon, size: 20, color: iconColor),
                  const SizedBox(width: 8),
                  Text(
                    title,
                    style: theme.textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),

              // Content
              if (isRestrictedTime) ...[
                Text(
                  'Restricted Time',
                  style: theme.textTheme.headlineMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                    color: theme.colorScheme.error,
                  ),
                ),
                const SizedBox(height: 12),
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Icon(
                      Icons.warning_outlined,
                      size: 20,
                      color: theme.colorScheme.onSurface.withOpacity(0.6),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        restrictedTimeReason,
                        style: theme.textTheme.bodySmall?.copyWith(
                          color: theme.colorScheme.onSurface.withOpacity(0.6),
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: theme.colorScheme.surface.withOpacity(0.5),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Last prayer was:',
                        style: theme.textTheme.bodySmall?.copyWith(
                          color: theme.colorScheme.onSurface.withOpacity(0.6),
                        ),
                      ),
                      const SizedBox(height: 4),
                      Row(
                        children: [
                          Text(
                            currentPrayer,
                            style: theme.textTheme.titleMedium?.copyWith(
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                          if (prayerData != null) ...[
                            const SizedBox(width: 8),
                            Text(
                              'at ${prayerData!.getPrayerTime(currentPrayer)}',
                              style: theme.textTheme.bodySmall?.copyWith(
                                color: theme.colorScheme.onSurface.withOpacity(
                                  0.6,
                                ),
                              ),
                            ),
                          ],
                        ],
                      ),
                    ],
                  ),
                ),
              ] else if (isPrayerWindowEnded) ...[
                Text(
                  'Prayer Window Ended',
                  style: theme.textTheme.headlineMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                    color: Colors.orange,
                  ),
                ),
                const SizedBox(height: 12),
                Text(
                  'The window for $currentPrayer prayer has passed. You can still pray, but the preferred time has ended.',
                  style: theme.textTheme.bodySmall?.copyWith(
                    color: theme.colorScheme.onSurface.withOpacity(0.6),
                  ),
                ),
                const SizedBox(height: 16),
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: theme.colorScheme.surface.withOpacity(0.5),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: Colors.orange, width: 2),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Last prayer was:',
                        style: theme.textTheme.bodySmall?.copyWith(
                          color: theme.colorScheme.onSurface.withOpacity(0.6),
                        ),
                      ),
                      const SizedBox(height: 4),
                      Row(
                        children: [
                          Text(
                            currentPrayer,
                            style: theme.textTheme.titleMedium?.copyWith(
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                          if (prayerData != null) ...[
                            const SizedBox(width: 8),
                            Text(
                              'at ${prayerData!.getPrayerTime(currentPrayer)}',
                              style: theme.textTheme.bodySmall?.copyWith(
                                color: theme.colorScheme.onSurface.withOpacity(
                                  0.6,
                                ),
                              ),
                            ),
                          ],
                        ],
                      ),
                    ],
                  ),
                ),
              ] else ...[
                Text(
                  currentPrayer,
                  style: theme.textTheme.displaySmall?.copyWith(
                    fontWeight: FontWeight.bold,
                    color: theme.colorScheme.primary,
                  ),
                ),
                const SizedBox(height: 8),
                if (prayerData != null)
                  Row(
                    children: [
                      Icon(
                        Icons.access_time,
                        size: 24,
                        color: theme.colorScheme.onSurface.withOpacity(0.6),
                      ),
                      const SizedBox(width: 8),
                      Text(
                        prayerData!.getPrayerTime(currentPrayer),
                        style: theme.textTheme.headlineSmall?.copyWith(
                          fontWeight: FontWeight.w600,
                          fontFeatures: const [FontFeature.tabularFigures()],
                          color: theme.colorScheme.onSurface.withOpacity(0.6),
                        ),
                      ),
                    ],
                  ),
                const SizedBox(height: 12),
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: theme.colorScheme.primary.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(
                    'Current prayer window is active',
                    style: theme.textTheme.bodySmall?.copyWith(
                      color: theme.colorScheme.onSurface.withOpacity(0.6),
                    ),
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}
