import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/prayer_provider.dart';
import '../widgets/digital_clock.dart';
import '../widgets/current_prayer_card.dart';
import '../widgets/next_prayer_card.dart';
import '../widgets/all_prayer_times_card.dart';

class PrayerTimesScreen extends StatefulWidget {
  const PrayerTimesScreen({super.key});

  @override
  State<PrayerTimesScreen> createState() => _PrayerTimesScreenState();
}

class _PrayerTimesScreenState extends State<PrayerTimesScreen>
    with WidgetsBindingObserver {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.resumed) {
      // App resumed from background, retry getting location if there was an error
      final provider = Provider.of<PrayerProvider>(context, listen: false);
      if (provider.error != null) {
        provider.getUserLocation();
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Consumer<PrayerProvider>(
        builder: (context, provider, child) {
          if (provider.loading) {
            return Center(
              child: Card(
                margin: const EdgeInsets.all(24),
                child: Padding(
                  padding: const EdgeInsets.all(32),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const CircularProgressIndicator(),
                      const SizedBox(height: 16),
                      Text(
                        'Loading prayer times...',
                        style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          color: Theme.of(
                            context,
                          ).colorScheme.onSurface.withOpacity(0.6),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            );
          }

          if (provider.error != null) {
            return Center(
              child: Card(
                margin: const EdgeInsets.all(24),
                child: Padding(
                  padding: const EdgeInsets.all(32),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(
                        Icons.error_outline,
                        size: 48,
                        color: Theme.of(context).colorScheme.error,
                      ),
                      const SizedBox(height: 16),
                      Text(
                        provider.error!,
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          color: Theme.of(context).colorScheme.error,
                        ),
                      ),
                      const SizedBox(height: 24),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          if (provider.error!.contains(
                            'Location services are disabled',
                          ))
                            ElevatedButton.icon(
                              onPressed: () async {
                                await provider.openLocationSettings();
                              },
                              icon: const Icon(Icons.settings),
                              label: const Text('Open Settings'),
                            ),
                          if (!provider.error!.contains(
                            'Location services are disabled',
                          ))
                            ElevatedButton(
                              onPressed: provider.getUserLocation,
                              child: const Text('Try Again'),
                            ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            );
          }

          return Container(
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [
                  Theme.of(context).colorScheme.surface,
                  Theme.of(context).colorScheme.surface.withOpacity(0.8),
                ],
              ),
            ),
            child: SafeArea(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(16),
                child: Column(
                  children: [
                    // Digital Clock
                    DigitalClock(
                      currentTime: provider.currentTime,
                      date: provider.date,
                      hijriDate: provider.hijriDate,
                      location: provider.location,
                    ),
                    const SizedBox(height: 16),

                    // Current and Next Prayer Cards (Side by side on tablets)
                    LayoutBuilder(
                      builder: (context, constraints) {
                        if (constraints.maxWidth > 600) {
                          // Tablet layout - side by side
                          return Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Expanded(
                                child: CurrentPrayerCard(
                                  isRestrictedTime: provider.isRestrictedTime,
                                  isPrayerWindowEnded:
                                      provider.isPrayerWindowEnded,
                                  currentPrayer: provider.currentPrayer,
                                  restrictedTimeReason:
                                      provider.restrictedTimeReason,
                                  prayerData: provider.prayerData,
                                ),
                              ),
                              const SizedBox(width: 16),
                              Expanded(
                                child: NextPrayerCard(
                                  nextPrayer: provider.nextPrayer,
                                  timeUntilNext: provider.timeUntilNext,
                                  progress: provider.progress,
                                  prayerData: provider.prayerData,
                                ),
                              ),
                            ],
                          );
                        } else {
                          // Mobile layout - stacked
                          return Column(
                            children: [
                              CurrentPrayerCard(
                                isRestrictedTime: provider.isRestrictedTime,
                                isPrayerWindowEnded:
                                    provider.isPrayerWindowEnded,
                                currentPrayer: provider.currentPrayer,
                                restrictedTimeReason:
                                    provider.restrictedTimeReason,
                                prayerData: provider.prayerData,
                              ),
                              const SizedBox(height: 16),
                              NextPrayerCard(
                                nextPrayer: provider.nextPrayer,
                                timeUntilNext: provider.timeUntilNext,
                                progress: provider.progress,
                                prayerData: provider.prayerData,
                              ),
                            ],
                          );
                        }
                      },
                    ),
                    const SizedBox(height: 16),

                    // All Prayer Times Card
                    AllPrayerTimesCard(
                      prayerData: provider.prayerData,
                      currentPrayer: provider.currentPrayer,
                      nextPrayer: provider.nextPrayer,
                      isRestrictedTime: provider.isRestrictedTime,
                      restrictedTimeReason: provider.restrictedTimeReason,
                      onRefresh: provider.getUserLocation,
                    ),
                    const SizedBox(height: 16),
                  ],
                ),
              ),
            ),
          );
        },
      ),
    );
  }
}
