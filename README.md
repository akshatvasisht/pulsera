<p align="center">
  <img width="400" height="200" alt="Pulsera logo" src="docs/assets/pulserareference.png" />
</p>

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript&logoColor=white)
![Expo](https://img.shields.io/badge/Expo-54-000020?logo=expo&logoColor=white)
![Three.js](https://img.shields.io/badge/Three.js-r170-black?logo=three.js&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind-v4-06B6D4?logo=tailwindcss&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi&logoColor=white)
![PyTorch](https://img.shields.io/badge/PyTorch-2.5-EE4C2C?logo=pytorch&logoColor=white)
![SwiftUI](https://img.shields.io/badge/SwiftUI-watchOS_10-FA7343?logo=swift&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green)
![Event](https://img.shields.io/badge/Submission-UGAHacks_2026-FFD700)

**Your family circle, now with a pulse.**

Pulsera is a real-time community safety platform that uses Apple Watch vitals, iPhone computer vision, and AI-guided intervention to detect distress and keep families connected. When an anomaly is detected — like a sustained elevated heart rate — the system intervenes with a calming breathing exercise guided by an AI voice agent before alerting caregivers on their phones.

## Team

| Name               | Role                           |
| ------------------ | ------------------------------ |
| **Nik Nandi**      | Lead Software Engineer         |
| **Aritra Saha**    | Data Scientist & ML Researcher |
| **Akshat Vasisht** | Operations & Strategy          |
| **Caio Jahn**      | Product Strategy               |

## How It Works

1. **Input / Ingestion:** Apple Watch streams heart rate and HRV via HealthKit; iPhone front camera captures pulse and facial expressions via SmartSpectra SDK.
2. **Processing / Validation:** PulseNet (PyTorch) analyzes individual vitals against historical thresholds and correlates signals across the community to detect zone-wide events.
3. **Execution / State Update:** The system initiates a real-time episode flow, triggering an ElevenLabs AI calming agent for the wearer and updating the backend state.
4. **Output / Response:** Caregivers receive real-time alerts via the mobile hub, while the web dashboard generates 3D terrain heatmaps of safety status.

<details>
  <summary><b>View Demo</b></summary>
  <p align="center">
    <img src="docs/assets/pulsera-web.gif" alt="Pulsera Demo" width="800">
  </p>
</details>

---

| App        | Tech                                        | Description                                                                                                                                           |
| ---------- | ------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Watch**  | SwiftUI, HealthKit, Combine                 | Wearable companion — streams vitals, runs episode flow (anomaly detection, breathing exercise, calming music, resolution), sends events via WebSocket |
| **Mobile** | Expo (React Native), TypeScript, Zustand    | Family dashboard — receives real-time episode alerts, contactless camera check-in via SmartSpectra SDK, family member map with geofencing             |
| **Web**    | Next.js 16, React 19, Three.js, MapLibre GL | Community analytics portal — 3D terrain visualization of safety zones, geographic anomaly heatmaps, live status feeds                                 |
| **Server** | FastAPI, SQLModel, PyTorch                  | Backend — PulseNet ML inference, episode lifecycle management, WebSocket telemetry ingestion, Gemini LLM analysis                                     |
| **Relay**  | Python, websockets                          | Lightweight bridge — translates watch events to mobile notification format, broadcasts to subscribed family groups                                    |

## Tools & Technologies

**Frontend & Mobile**

- SwiftUI + HealthKit (watchOS)
- Expo SDK 54 + React Native 0.81 + Expo Router (mobile)
- Next.js 16 + React 19 + Tailwind CSS v4 (web)
- Three.js + React Three Fiber (3D visualization)
- React Map GL + MapLibre GL (geographic mapping)
- NativeWind + Zustand + React Native Reanimated (mobile state & animation)
- shadcn/ui + Radix UI + Lucide Icons (web components)

**Backend & ML**

- FastAPI + Uvicorn (async Python server)
- SQLModel + SQLAlchemy + SQLite (database ORM)
- PyTorch 2.5+ (PulseNet anomaly detection model)
- NumPy (data processing)

**External APIs & Services**

- [ElevenLabs Conversational AI](https://elevenlabs.io/) — Real-time voice agent for stress intervention via WebSocket, guides breathing exercises with synthesized speech on Apple Watch
- [SmartSpectra SDK](https://www.smartspectra.com/) — Contactless vital signs measurement through iPhone front camera (pulse rate, breathing rate, blink rate, facial expression detection)
- [Google Generative AI (Gemini)](https://ai.google.dev/) — LLM-powered health analysis and recommendations
- [Anthropic Claude](https://www.anthropic.com/) — Alternative LLM backend for analysis

**Infrastructure**

- WebSockets (real-time communication across all layers)
- Expo Camera (camera permissions and preview for check-in)
- Apple HealthKit (heart rate and HRV streaming)

## Challenges & Solutions

**Watch Simulator + Real Phone Communication**
The watchOS simulator runs on Mac and the mobile app runs on a physical phone via Expo Go, so Apple's WatchConnectivity framework doesn't work across them. We built a lightweight WebSocket relay server (~100 lines of Python) that bridges the two — the watch sends episode events to the relay, which translates and broadcasts them to subscribed mobile clients.

**Contactless Vital Sign Detection**
Integrating the SmartSpectra SDK required building a custom Expo native module bridge (`smartspectra-bridge`) with Swift on iOS. The SDK handles camera access internally, so we had to coordinate between the SDK's camera usage and our own CameraView preview overlay with face guide animations.

**Real-Time AI Voice Guidance on Watch**
Streaming ElevenLabs conversational AI audio to watchOS over WebSocket required handling raw PCM audio data, synchronizing breathing cue timing with the voice agent's responses, and managing connection lifecycle on a constrained device. We coordinated haptic feedback patterns with the AI agent's breathing instructions for a cohesive calming experience.

**ML Anomaly Detection at Scale**
PulseNet needed to detect individual anomalies while also aggregating signals across community members for zone-wide events. We designed a two-tier system — per-device inference with a community engine that applies spatial and temporal windowing to detect correlated anomalies affecting multiple members.

**Unified Theme Across Platforms**
Maintaining a consistent visual identity (red #942626 accent on black) across SwiftUI (watch), React Native (mobile), and Next.js (web) required separate but coordinated theme systems — `PulseraTheme` in Swift, a shared `colors` object in TypeScript, and CSS custom properties on the web.

## Documentation

- **[SETUP.md](docs/SETUP.md)**: Environment setup, installation, and start instructions
- **[ARCHITECTURE.md](docs/ARCHITECTURE.md)**: Architecture, tech stack, and design decisions
- **[API.md](docs/API.md)**: REST API and WebSocket event reference
- **[TESTING.md](docs/TESTING.md)**: Testing strategy and guidelines
- **[STYLE.md](docs/STYLE.md)**: Coding standards and conventions
