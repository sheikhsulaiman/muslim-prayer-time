import 'package:flutter/material.dart';

class PrayerCard extends StatelessWidget {
  final String name;
  final String time;
  final bool isCurrent;
  final bool isNext;

  const PrayerCard({
    super.key,
    required this.name,
    required this.time,
    required this.isCurrent,
    required this.isNext,
  });

  IconData _getIcon() {
    switch (name) {
      case 'Fajr':
        return Icons.nightlight_round;
      case 'Dhuhr':
        return Icons.wb_sunny;
      case 'Asr':
        return Icons.wb_twilight;
      case 'Maghrib':
        return Icons.wb_twilight;
      case 'Isha':
        return Icons.nightlight_round;
      default:
        return Icons.access_time;
    }
  }

  Color _getIconColor() {
    switch (name) {
      case 'Fajr':
        return Colors.indigo;
      case 'Dhuhr':
        return Colors.amber;
      case 'Asr':
        return Colors.orange;
      case 'Maghrib':
        return Colors.pink;
      case 'Isha':
        return Colors.deepPurple;
      default:
        return Colors.grey;
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    Color borderColor;
    Color backgroundColor;

    if (isCurrent) {
      borderColor = theme.colorScheme.primary;
      backgroundColor = theme.colorScheme.primary.withOpacity(0.1);
    } else if (isNext) {
      borderColor = theme.colorScheme.secondary.withOpacity(0.5);
      backgroundColor = theme.colorScheme.secondary.withOpacity(0.05);
    } else {
      borderColor = theme.colorScheme.outline.withOpacity(0.3);
      backgroundColor = theme.cardColor;
    }

    return Card(
      elevation: isCurrent ? 4 : 2,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: BorderSide(color: borderColor, width: isCurrent ? 2 : 1),
      ),
      child: Container(
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(12),
          color: backgroundColor,
        ),
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 12),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              // Icon and Name
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(_getIcon(), size: 20, color: _getIconColor()),
                  const SizedBox(width: 6),
                  Text(
                    name,
                    style: theme.textTheme.bodySmall?.copyWith(
                      fontWeight: FontWeight.w600,
                      color: theme.colorScheme.onSurface.withOpacity(0.6),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),

              // Time
              Text(
                time,
                style: theme.textTheme.headlineSmall?.copyWith(
                  fontWeight: FontWeight.bold,
                  fontFeatures: const [FontFeature.tabularFigures()],
                ),
              ),

              // Current Prayer Indicator
              if (isCurrent) ...[
                const SizedBox(height: 8),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    _PulsingDot(color: theme.colorScheme.primary),
                    const SizedBox(width: 4),
                    _PulsingDot(color: theme.colorScheme.primary, delay: 150),
                    const SizedBox(width: 4),
                    _PulsingDot(color: theme.colorScheme.primary, delay: 300),
                  ],
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}

class _PulsingDot extends StatefulWidget {
  final Color color;
  final int delay;

  const _PulsingDot({required this.color, this.delay = 0});

  @override
  State<_PulsingDot> createState() => _PulsingDotState();
}

class _PulsingDotState extends State<_PulsingDot>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: const Duration(milliseconds: 1000),
      vsync: this,
    );

    Future.delayed(Duration(milliseconds: widget.delay), () {
      if (mounted) {
        _controller.repeat(reverse: true);
      }
    });
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return FadeTransition(
      opacity: _controller,
      child: Container(
        width: 6,
        height: 6,
        decoration: BoxDecoration(color: widget.color, shape: BoxShape.circle),
      ),
    );
  }
}
