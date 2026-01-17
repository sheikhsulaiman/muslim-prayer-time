# Muslim Prayer Time

A cross-platform application for displaying Islamic prayer times with restricted prayer periods.

## 📱 Applications

This is a monorepo containing both web and mobile applications:

### Web App (`apps/web`)

- **Tech Stack**: React + TypeScript + Vite
- **UI**: shadcn/ui components with Tailwind CSS v4
- **Features**:
  - Real-time digital clock
  - Current and next prayer times
  - Prayer countdown with progress bar
  - Restricted prayer time warnings
  - Responsive design
  - Modern UI with animations and effects

### Mobile App (`apps/mobile`)

- **Tech Stack**: Flutter
- **Platform**: iOS & Android
- **Features**: Coming soon

## 🚀 Getting Started

### Prerequisites

- Node.js (for web app)
- pnpm (for web app)
- Flutter SDK (for mobile app)

### Web App

```bash
cd apps/web
pnpm install
pnpm dev
```

### Mobile App

```bash
cd apps/mobile
flutter pub get
flutter run
```

## 📖 API

Uses the [Aladhan API](https://aladhan.com/prayer-times-api) for prayer times calculation.

## 🎨 Features

- **Prayer Times**: Displays Fajr, Dhuhr, Asr, Maghrib, and Isha times
- **Restricted Times**: Shows Islamic restricted prayer periods
- **Geolocation**: Automatic location detection
- **Real-time Updates**: Clock and countdown timers update every second
- **Modern UI**: Smooth animations, rings, gradients, and backdrop blur effects
- **Responsive**: Works on all screen sizes

## 📄 License

MIT
