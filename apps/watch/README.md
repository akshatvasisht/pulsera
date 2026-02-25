# Pulsera Watch App

The Pulsera Watch app is a SwiftUI-based watchOS companion that streams vital signs from Apple HealthKit, detects anomalies, and guides wearers through AI-powered calming interventions.

## Features

- **Real-time Vitals Monitoring**: Streams heart rate and HRV data from HealthKit
- **Anomaly Detection**: Identifies sustained elevated heart rate and triggers episodes
- **AI Calming Agent**: ElevenLabs conversational AI guides breathing exercises with voice and haptic feedback
- **WebSocket Communication**: Sends episode events to the relay server for family notifications
- **Episode Flow**: Complete episode lifecycle from detection → calming → check-in → resolution

## Prerequisites

- **macOS**: 14.0+ (Sonoma or later)
- **Xcode**: 15.0+ with watchOS 10.0+ SDK
- **Apple Developer Account**: Required for HealthKit entitlements
- **WebSocket Relay Server**: The relay server must be running (see `apps/relay/relay.py`)

## Project Structure

```
Pulsera Watch/
├── ContentView.swift          # Main app interface with episode flow
├── PairingView.swift          # WebSocket connection setup
├── Models/
│   ├── Episode.swift          # Episode data model
│   └── WebSocketMessage.swift # Message protocol
├── Services/
│   ├── HealthService.swift    # HealthKit integration
│   ├── WebSocketService.swift # WebSocket client
│   ├── AudioService.swift     # Music playback
│   └── AIAgentService.swift   # ElevenLabs AI integration
└── ViewModels/
    └── EpisodeViewModel.swift # Episode state management
```

## Setup Instructions

### 1. Open in Xcode

```bash
cd apps/watch
open PulseraWatch.xcodeproj
```

### 2. Configure Signing & Capabilities

1. Select the **Pulsera Watch** target in Xcode
2. Go to **Signing & Capabilities**
3. Select your development team
4. Ensure **HealthKit** capability is enabled
5. Confirm the following entitlements:
   - `com.apple.developer.healthkit`
   - `com.apple.developer.healthkit.access`

### 3. HealthKit Permissions

The app requests the following HealthKit permissions:

- **Heart Rate**: Read access
- **Heart Rate Variability (HRV)**: Read access

These will be requested on first launch.

### 4. Start the WebSocket Relay Server

Before running the watch app, start the relay server:

```bash
cd apps/relay
pip install websockets
python3 relay.py
```

The relay server will start on `localhost:8765`.

### 5. Build and Run

#### In Simulator:

1. Select a watchOS simulator (Apple Watch Series 9 or later recommended)
2. Press **Cmd+R** or click the Run button
3. The app will launch in the simulator

#### On Physical Device:

1. Pair your Apple Watch with your Mac via Xcode
2. Select your paired watch as the run destination
3. Press **Cmd+R** to build and deploy

> **Note**: HealthKit data streaming only works on physical devices, not simulators. The simulator will show mock data.

## Connecting to the Relay

On first launch, the app shows the **Pairing View**:

1. Enter the relay server address:
   - **Simulator**: `localhost:8765`
   - **Physical device on same network**: `<YOUR_MAC_IP>:8765`
     - Find your Mac's IP with: `ipconfig getifaddr en0`
2. Tap **Connect**
3. Once connected, the app transitions to the main episode flow

The WebSocket URL is saved and will auto-reconnect on subsequent launches.

## Episode Flow

1. **Idle State**: Monitoring heart rate in the background
2. **Anomaly Detected**: Sustained elevated HR triggers episode start
3. **AI Calming**: ElevenLabs agent guides 4-6-8 breathing with voice + haptics
4. **Music**: Calm music plays during the calming phase
5. **Resolution**: Episode marked complete and sent to relay
6. **Notification**: Family members receive real-time alerts via the mobile app

## Environment Variables

The watch app doesn't use environment files, but requires configuration for:

- **ElevenLabs Agent ID**: Hardcoded in `AIAgentService.swift` (update if using a different agent)
- **WebSocket URL**: Configured at runtime via Pairing View

## Development Notes

### Coordinator Pattern

The app uses SwiftUI's `@Observable` and Combine for reactive state management. `EpisodeViewModel` coordinates between services.

### HealthKit Streaming

`HealthService` uses `HKAnchoredObjectQuery` to stream live heart rate data. Updates arrive every ~5 seconds during active workouts, less frequently otherwise.

### WebSocket Protocol

Messages are JSON-encoded with a `type` field:

- `episode-start`: Sent when an episode begins
- `episode-resolution`: Sent when an episode completes
- `pulse-checkin`: (Future) Check-in data from phone

### Haptic Feedback

Custom haptic patterns sync with breathing cues:

- **Inhale**: Rising notification
- **Hold**: Continuous pattern
- **Exhale**: Falling notification

## Troubleshooting

### HealthKit Data Not Streaming

- Ensure HealthKit permissions are granted in watchOS Settings → Privacy
- Verify the app has both read and write access
- Restart the watch app and try again

### WebSocket Connection Fails

- Confirm the relay server is running (`python3 apps/relay/relay.py`)
- Check that the IP address is correct (use `ipconfig getifaddr en0` on Mac)
- Ensure firewall allows connections on port 8765

### ElevenLabs AI Not Responding

- Verify the ElevenLabs API key is valid in `AIAgentService.swift`
- Check your internet connection (AI agent requires network)
- Review console logs for WebSocket errors to the ElevenLabs endpoint

### Build Errors

- Clean build folder: **Cmd+Shift+K**
- Update to latest Xcode version
- Verify macOS and Xcode are compatible with watchOS 10+ SDK

## Testing

Since the watch app is primarily SwiftUI + HealthKit, testing is manual:

1. **Simulated Episode**: Temporarily lower the HR threshold in `HealthService.swift` to trigger episodes easily
2. **Mock HealthKit**: Use the Health app in the simulator to inject test data
3. **WebSocket**: Monitor relay server logs to confirm messages are being sent

## Production Considerations

- **Background Execution**: HealthKit queries run in the background but watchOS may throttle if battery is low
- **Network**: AI agent and WebSocket require active network connection
- **Battery**: Continuous HR monitoring + WebSocket + AI streaming will drain the watch battery faster than normal

## License

Built at UGAHacks 2026.
