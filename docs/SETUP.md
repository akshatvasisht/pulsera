# Environment Setup Instructions

## Prerequisites

### System Requirements

* **macOS**: 14.0+ (Sonoma or later) — required for watchOS development
* **Xcode**: 15.0+ with watchOS 10.0+ SDK
* **Node.js**: 18.0+ (LTS recommended)
* **Python**: 3.11+

### Optional

* **Watchman**: For React Native file watching (`brew install watchman`)
* **Git LFS**: If working with large model checkpoints (`brew install git-lfs`)

## Setup

### Installation

**Clone and install dependencies:**

```bash
git clone https://github.com/akshatvasisht/pulsera.git
cd pulsera

# Install all JS/TS dependencies (web + mobile)
npm run install:all

# Install Python backend dependencies
cd apps/server
python3 -m pip install -e ".[dev]"
cd ../..
```

### Environment Variables

Create `.env` files in the appropriate directories:

#### Backend (apps/server/.env)

```ini
# Database
DATABASE_URL=sqlite+aiosqlite:///./pulsera.db

# CORS Origins (comma-separated)
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:19006

# External APIs
ELEVENLABS_API_KEY=your_elevenlabs_key_here
GEMINI_API_KEY=your_google_gemini_key_here
SMARTSPECTRA_API_KEY=your_smartspectra_key_here

# Optional: Model checkpoint path
PULSENET_CHECKPOINT_PATH=checkpoints/pulsenet_v1.pt

# Optional: Feature flags
ENABLE_COMMUNITY_DETECTION=true
DEBUG_MODE=true
```

#### Mobile (apps/mobile/.env, optional)

```ini
# WebSocket relay URL (replace <MAC_IP> with your local IP)
EXPO_PUBLIC_WS_URL=ws://<MAC_IP>:8765/ws

# Backend API URL
EXPO_PUBLIC_API_URL=http://<MAC_IP>:8000
```

Find your Mac's IP address: `ipconfig getifaddr en0`

## Running the Application

#### **1. Start the WebSocket Relay Server**

The relay bridges watch → mobile communication.

```bash
cd apps/relay
python3 relay.py
```

Server starts on `ws://localhost:8765/ws`. Keep this terminal running.

#### **2. Start the Backend Server**

In a new terminal:

```bash
npm run dev:server
# OR manually:
cd apps/server
uvicorn src.server.main:app --reload --port 8000
```

API docs available at [http://localhost:8000/docs](http://localhost:8000/docs).

#### **3. Start the Mobile App**

In a new terminal:

```bash
npm run dev:mobile
# OR manually:
cd apps/mobile
npx expo start
```

Scan the QR code with Expo Go (iOS/Android) or press `i`/`a` to open in simulator.

#### **4. Start the Web Dashboard**

In a new terminal:

```bash
npm run dev:web
# OR manually:
cd apps/web
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

#### **5. Start the Watch App**

Open `apps/watch/PulseraWatch.xcodeproj` in Xcode:

1. Select a watchOS simulator (Apple Watch Series 9 or later)
2. Press **Cmd+R** to build and run
3. In the pairing view, enter `localhost:8765` and tap **Connect**

> **Note:** On a physical watch, use your Mac's LAN IP instead of localhost.

### Production Build

#### Web (Next.js)

```bash
cd apps/web
npm run build
npm run start  # Serves production build on port 3000
```

#### Mobile (Expo)

```bash
cd apps/mobile
npx expo build:ios      # iOS app bundle
npx expo build:android  # Android APK/AAB
```

For production deployment, consider [Expo Application Services (EAS)](https://expo.dev/eas).

#### Backend (FastAPI)

```bash
cd apps/server
uvicorn src.server.main:app --host 0.0.0.0 --port 8000
```

For production, use Gunicorn with Uvicorn workers:

```bash
gunicorn src.server.main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

## Troubleshooting

### Issue: `npm run install:all` fails with workspace errors

**Fix:** Ensure you're using npm 7+ (workspaces support). Update npm:

```bash
npm install -g npm@latest
```

### Issue: Mobile app can't connect to backend or relay

**Fix:**
1. Verify backend and relay are running
2. Check that `EXPO_PUBLIC_WS_URL` and `EXPO_PUBLIC_API_URL` in `apps/mobile/.env` use your Mac's IP (not localhost)
3. Ensure Mac firewall allows connections on ports 8765 and 8000

### Issue: Xcode build fails for watch app

**Fix:**
1. Clean build folder: **Cmd+Shift+K**
2. Update Xcode to latest version
3. Ensure macOS and Xcode are compatible with watchOS 10+ SDK

### Issue: Python backend import errors

**Fix:**
1. Ensure you installed with editable mode: `pip install -e ".[dev]"`
2. Activate virtual environment if using one
3. Verify Python version is 3.11+: `python3 --version`

### Issue: HealthKit data not streaming on watch

**Fix:**
1. HealthKit only works on physical devices, not simulators (simulators show mock data)
2. Grant HealthKit permissions in watchOS Settings → Privacy
3. Restart the watch app

### Issue: ElevenLabs AI agent doesn't respond

**Fix:**
1. Verify `ELEVENLABS_API_KEY` is set in `apps/server/.env`
2. Check internet connection (AI agent requires network)
3. Review backend logs for WebSocket errors

## Next Steps

Once the environment is running:

1. **Test the full flow:**
   - Trigger an episode from the watch app
   - Verify the mobile app receives the alert popup
   - Check the backend API logs for episode creation
   - View episode history in the web dashboard

2. **Read the other docs:**
   - [API.md](./API.md) — Endpoint reference
   - [ARCHITECTURE.md](./ARCHITECTURE.md) — System design
   - [TESTING.md](./TESTING.md) — Running tests
   - [STYLE.md](./STYLE.md) — Coding standards

3. **Explore the code:**
   - Watch: `apps/watch/Pulsera Watch/ContentView.swift`
   - Mobile: `apps/mobile/app/(tabs)/index.tsx`
   - Web: `apps/web/src/app/dashboard/page.tsx`
   - Backend: `apps/server/src/server/main.py`
