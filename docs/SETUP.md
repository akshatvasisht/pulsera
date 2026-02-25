# Environment Setup Instructions

## Prerequisites

### System Requirements

- **macOS**: 14.0+ (Sonoma or later) — required for watchOS development
- **Xcode**: 15.0+ with watchOS 10.0+ SDK
- **Node.js**: 18.0+ (LTS recommended)
- **Python**: 3.11+

### Optional

- **Watchman**: For React Native file watching (`brew install watchman`)
- **Git LFS**: If working with large model checkpoints (`brew install git-lfs`)

## Setup

> **Note:** First-run execution may download models (PulseNet), caches, or dependencies before starting.

### Automated Setup (Recommended)

You can set up the entire environment automatically using the setup script:

```bash
git clone https://github.com/akshatvasisht/pulsera.git
cd pulsera
[command to run setup script, e.g., ./scripts/setup.sh]
```

### Manual Setup

If you prefer manual setup, follow these steps:

**1. Clone and install dependencies:**

```bash
git clone https://github.com/akshatvasisht/pulsera.git
cd pulsera

# Install all JS/TS dependencies (web + mobile)
npm run install:all

# Install Python backend dependencies
cd apps/server
python3 -m venv .venv
source .venv/bin/activate
pip install -e ".[dev]"
cd ../..
```

### Environment Variables

Create `.env` files in the appropriate directories.

#### Backend (`apps/server/.env`)

**Required Variables**

- `DATABASE_URL`: The connection string for the database.
- `ELEVENLABS_API_KEY`: API key for ElevenLabs conversational AI.
- `GEMINI_API_KEY`: API key for Google Gemini health analysis.
- `SMARTSPECTRA_API_KEY`: API key for contactless vital sign detection.

**Optional Variables**

- `ALLOWED_ORIGINS`: Comma-separated list of permitted CORS origins. Default: `http://localhost:3000,http://localhost:19006`.
- `PULSENET_CHECKPOINT_PATH`: Path to the custom PyTorch model checkpoint. Default: `checkpoints/pulsenet_v1.pt`.
- `ENABLE_COMMUNITY_DETECTION`: Toggle for zone-wide anomaly aggregation. Default: `true`.
- `DEBUG_MODE`: Enables detailed logging and debug endpoints. Default: `true`.

#### Mobile (`apps/mobile/.env`, optional)

**Required Variables**

- `EXPO_PUBLIC_WS_URL`: WebSocket relay URL (e.g., `ws://<MAC_IP>:8765/ws`).
- `EXPO_PUBLIC_API_URL`: Backend API URL (e.g., `http://<MAC_IP>:8000`).

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

## Logging

- **Location:** Log files are stored in `apps/server/logs/` and `apps/relay/logs/`.
- **Configuration:** Log level can be configured via the `DEBUG_MODE` environment variable in the backend.
- **Real-time Tail:** View backend logs in real-time by running `tail -f apps/server/logs/server.log`.
- **Rotation Policy:** Logs rotate daily, keeping the last 7 days of historical logs.

## Troubleshooting

### Environment & Dependency Issues

**Issue:** `npm run install:all` fails with workspace errors
**Fix:** Ensure you're using npm 7+ (workspaces support). Update npm: `npm install -g npm@latest`

**Issue:** Python backend import errors or missing `pip`
**Fix:** On Debian/Ubuntu, `pip` may be missing from the system Python. Use a virtual environment:

```bash
cd apps/server
python3 -m venv .venv
source .venv/bin/activate
pip install -e ".[dev]"
```

Verify Python version is 3.11+.

### Runtime Errors

**Issue:** HealthKit data not streaming on watch
**Fix:** HealthKit only works on physical devices, not simulators. Grant permissions in watchOS Settings → Privacy.

**Issue:** ElevenLabs AI agent doesn't respond
**Fix:** Verify `ELEVENLABS_API_KEY` is set in `apps/server/.env`. Check internet connection.

### Network & Config Issues

**Issue:** Mobile app can't connect to backend or relay
**Fix:** Verify backend and relay are running. Check that `EXPO_PUBLIC_WS_URL` and `EXPO_PUBLIC_API_URL` use your Mac's IP.

**Issue:** Xcode build fails for watch app
**Fix:** Clean build folder (Cmd+Shift+K). Update Xcode to latest version and ensure watchOS 10+ SDK compatibility.

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
