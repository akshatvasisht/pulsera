# Pulsera Mobile App

The Pulsera mobile app is an Expo/React Native application that serves as the family notification hub and contactless health check-in interface.

## Features

- **Real-Time Episode Alerts**: WebSocket-powered ring popup notifications when family members experience distress
- **Contactless Check-In**: SmartSpectra SDK integration for camera-based vital sign measurement (pulse, breathing rate, mood)
- **Family Map**: Geolocation tracking with geofencing for family members
- **Episode History**: Timeline view of health events across the family group
- **Dark Theme**: Consistent crimson-on-charcoal design matching watch and web apps

## Tech Stack

- **Framework**: Expo SDK 54
- **React Native**: 0.81
- **Navigation**: Expo Router v6 (file-based routing)
- **State Management**: Zustand
- **Styling**: NativeWind (Tailwind for React Native)
- **Mapping**: react-native-maps
- **Animation**: React Native Reanimated 4
- **Camera**: Expo Camera + SmartSpectra SDK (native module bridge)

## Project Structure

```
app/
├── (tabs)/                # Tab-based navigation
│   ├── index.tsx          # Home/Episode Feed
│   ├── map.tsx            # Family Map
│   └── profile.tsx        # User Profile
├── _layout.tsx            # Root layout with providers

components/
├── EpisodeCard.tsx        # Episode display card
├── NotificationOverlay.tsx # Ring popup for episode alerts
├── AlertBanner.tsx        # Top banner for active alerts
├── GlassCard.tsx          # Frosted glass UI component
└── HeartRateDisplay.tsx   # Animated heart rate visualization

lib/
├── api.ts                 # Backend API client
├── websocket.ts           # WebSocket connection manager
└── store.ts               # Zustand state store

modules/
└── smartspectra-bridge/   # Native module for SmartSpectra SDK
```

## Development

### Prerequisites

- Node.js 18+
- Expo CLI (installed via npx, no global install needed)
- iOS Simulator (macOS + Xcode) or Android Emulator (Android Studio)
- Physical device with Expo Go app (optional)

### Setup

```bash
cd apps/mobile
npm install
```

### Environment Configuration

Create `.env` file in `apps/mobile/`:

```ini
# WebSocket Relay URL (replace <MAC_IP> with your local IP)
EXPO_PUBLIC_WS_URL=ws://<MAC_IP>:8765/ws

# Backend API URL
EXPO_PUBLIC_API_URL=http://<MAC_IP>:8000
```

Find your Mac's local IP:

```bash
ipconfig getifaddr en0
```

> **Note**: `localhost` won't work on physical devices. Always use your machine's LAN IP.

### Running the App

```bash
# Start Expo dev server
npx expo start

# Or via npm root script
cd ../..
npm run dev:mobile
```

This opens the Expo Dev Tools. From here:

- **iOS Simulator**: Press `i`
- **Android Emulator**: Press `a`
- **Physical Device**: Scan QR code with Expo Go app

### Available Scripts

- `npm start` - Start Expo dev server
- `npm run android` - Build and run on Android
- `npm run ios` - Build and run on iOS
- `npm run web` - Run in web browser (limited functionality)
- `npm run lint` - Run ESLint
- `npm test` - Run Jest tests
- `npm run test:watch` - Run tests in watch mode

## Key Features

### WebSocket Episode Alerts

The app maintains a persistent WebSocket connection to the relay server:

```typescript
// lib/websocket.ts
const ws = new WebSocket(process.env.EXPO_PUBLIC_WS_URL!)

ws.onmessage = (event) => {
  const message = JSON.parse(event.data)
  if (message.type === 'episode-start') {
    showNotificationOverlay(message)
  }
}
```

When an episode starts on the watch, the mobile app receives the event within ~2 seconds and displays a full-screen ring popup.

### SmartSpectra Camera Check-In

The app uses the SmartSpectra SDK (via native module bridge) to measure vitals through the front-facing camera:

1. User taps "Quick Check-In"
2. Camera preview opens with face guide overlay
3. SmartSpectra analyzes video frames for 10-15 seconds
4. Returns:
   - Pulse rate (PPG algorithm)
   - Breathing rate (chest movement detection)
   - Facial expression (emotion classifier)

### Family Map

Real-time geolocation tracking of family group members:

- Uses `react-native-maps` with custom markers
- Geofencing alerts when members leave safe zones
- Privacy: location only shared within family group

## Styling

Using NativeWind (Tailwind CSS for React Native):

```typescript
import { View, Text } from 'react-native';

<View className="flex-1 bg-zinc-950">
  <Text className="text-xl font-bold text-red-700">
    Heart Rate: 145 BPM
  </Text>
</View>
```

Global styles defined in `global.css`.

## Testing

Tests use Jest + React Native Testing Library:

```bash
npm test                  # Run all tests
npm run test:watch        # Watch mode
```

Example test:

```typescript
import { render, screen } from '@testing-library/react-native';
import { EpisodeCard } from './EpisodeCard';

test('displays heart rate', () => {
  render(<EpisodeCard heartRate={145} />);
  expect(screen.getByText('145 BPM')).toBeTruthy();
});
```

## Building for Production

### Expo Application Services (EAS)

Recommended for production builds:

```bash
# Install EAS CLI
npm install -g eas-cli

# Configure project
eas build:configure

# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android
```

### Local Builds

For development builds without EAS:

```bash
# iOS (requires macOS + Xcode)
npx expo run:ios --configuration Release

# Android
npx expo run:android --variant release
```

## Platform-Specific Notes

### iOS

- **Camera permissions**: Automatically requested via `expo-camera`
- **Background location**: Requires `UIBackgroundModes` in `Info.plist`
- **HealthKit**: Future integration for iPhone-side vitals

### Android

- **Camera permissions**: Add to `AndroidManifest.xml` (handled by Expo)
- **Background location**: Requires `ACCESS_BACKGROUND_LOCATION` permission
- **Notification channels**: Must configure for Android 8+

## Troubleshooting

### WebSocket Connection Fails

**Issue**: App can't connect to relay server

**Fix**:

1. Verify relay server is running: `python3 apps/relay/relay.py`
2. Check `EXPO_PUBLIC_WS_URL` in `.env` uses LAN IP (not localhost)
3. Ensure Mac firewall allows port 8765

### SmartSpectra SDK Errors

**Issue**: Camera check-in crashes or doesn't return data

**Fix**:

1. Ensure camera permissions are granted
2. Check that native module bridge is built: `npx expo prebuild`
3. Rebuild app: `npx expo run:ios` (not Expo Go, which doesn't support custom native modules)

### App Crashes on Startup

**Issue**: React Native app crashes immediately

**Fix**:

1. Clear Metro cache: `npx expo start -c`
2. Reinstall dependencies: `rm -rf node_modules && npm install`
3. Check logs: `npx expo start` and view console errors

### Map Not Rendering

**Issue**: react-native-maps shows blank screen

**Fix**:

1. iOS: Ensure Xcode is configured with Apple Maps API key (if needed)
2. Android: Add Google Maps API key to `AndroidManifest.xml`
3. Fallback: Use web-based map provider instead

## Performance

### Optimization Tips

- **Images**: Use `expo-image` for optimized caching
- **Lists**: Use `FlashList` instead of `FlatList` for large datasets
- **Navigation**: Use screen options `lazy=true` for tab routes
- **Reanimated**: Offload animations to UI thread with `runOnUI()`

### Bundle Size

Current production bundle (estimated):

- **iOS**: ~15 MB (with Hermes)
- **Android**: ~20 MB (APK) / ~12 MB (AAB)

## Further Reading

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Docs](https://reactnative.dev/)
- [NativeWind Guide](https://www.nativewind.dev/)
- [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/)
- [EAS Build](https://docs.expo.dev/build/introduction/)
