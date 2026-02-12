# Testing Guidelines

This document outlines the testing strategy, tools, and procedures for Pulsera.

## Strategy

Pulsera uses a **pragmatic testing approach** prioritizing:

1. **Unit tests** for business logic (episode detection, HRV calculation, PulseNet inference)
2. **Integration tests** for API endpoints and database operations
3. **Manual verification** for platform-specific features (HealthKit, camera integration, 3D rendering)

We prioritize **fast iteration** over 100% coverage for the hackathon MVP, but aim for good coverage of critical paths (episode lifecycle, alert routing).

## Testing Frameworks

| App | Framework | Description |
|-----|-----------|-------------|
| **Web** | Vitest + React Testing Library | Fast unit tests for Next.js components |
| **Mobile** | Jest + React Native Testing Library | Component and integration tests for Expo app |
| **Backend** | pytest + httpx | Async API tests and service layer validation |
| **Watch** | Manual testing | SwiftUI + HealthKit best tested on device |

## Running Tests

### Automated Suite

#### Web (Next.js)
```bash
cd apps/web
npm test              # Run all tests
npm run test:watch    # Watch mode
npm run coverage      # Generate coverage report
```

#### Mobile (Expo/React Native)
```bash
cd apps/mobile
npm test              # Run all tests
npm run test:watch    # Watch mode
```

#### Backend (FastAPI)
```bash
cd apps/server
make test             # Run pytest with coverage
# OR manually:
pytest tests/ -v      # Verbose output
pytest tests/ --cov=src --cov-report=html  # Coverage report
```

#### Run all tests (web + mobile + server)
```bash
# From root directory
npm run test:all      # Runs web + mobile tests
npm run test:server   # Runs backend tests
```

## Test Structure

### Web & Mobile (Component Tests)

Basic component test example:

```typescript
import { render, screen } from '@testing-library/react-native';
import { EpisodeCard } from './EpisodeCard';

describe('EpisodeCard', () => {
  it('displays episode heart rate', () => {
    const episode = {
      id: '123',
      heartRate: 145,
      status: 'active',
    };
    
    render(<EpisodeCard episode={episode} />);
    expect(screen.getByText('145 BPM')).toBeTruthy();
  });
});
```

### Backend (API Tests)

FastAPI test example:

```python
import pytest
from httpx import AsyncClient
from src.server.main import app

@pytest.mark.asyncio
async def test_create_episode():
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.post(
            "/episodes/start",
            json={
                "user_id": "test-user",
                "heart_rate": 145,
                "timestamp": "2026-02-10T13:00:00Z"
            }
        )
        assert response.status_code == 201
        data = response.json()
        assert data["status"] == "active"
```

## Manual Verification

For features that require physical hardware or complex user interactions:

### Watch App (HealthKit Integration)

**Scenario A: HealthKit Data Streaming**
1. Build and run on a physical Apple Watch
2. Start a workout (e.g., Indoor Walk) to activate live HR streaming
3. Verify heart rate updates appear in the app UI every ~5 seconds
4. Check console logs for HKAnchoredObjectQuery updates

**Scenario B: Episode Trigger**
1. Temporarily lower HR threshold to 80 BPM in `HealthService.swift`
2. Start a workout to elevate HR above threshold
3. Verify episode starts and calming flow begins
4. Confirm WebSocket message sent to relay (check relay logs)

### Mobile App (Camera Check-In)

**Scenario A: SmartSpectra SDK Integration**
1. Grant camera permissions on physical iOS device
2. Tap "Quick Check-In" in app
3. Position face in front-facing camera guide
4. Wait for SDK to analyze (10-15 seconds)
5. Verify pulse, breathing rate, and mood are displayed

**Scenario B: WebSocket Real-Time Alerts**
1. Ensure relay server is running
2. Connect watch app to relay
3. Trigger episode from watch app
4. Verify mobile app shows ring popup alert within 2 seconds
5. Check that episode data matches watch-sent data

### Web Dashboard (3D Visualization)

**Scenario A: 3D Terrain Rendering**
1. Navigate to `/dashboard` in browser
2. Wait for Three.js scene to load (3-5 seconds)
3. Verify terrain mesh renders with heatmap overlay
4. Test mouse/trackpad interaction (pan, zoom, rotate)

**Scenario B: Real-Time Episode Feed**
1. Start backend server
2. Create test episodes via API or watch app
3. Verify episodes appear in dashboard feed within 5 seconds
4. Check that episode markers appear on 3D map at correct coordinates

## Mocking Standards

### External APIs

Always mock external APIs (ElevenLabs, Gemini, SmartSpectra) in tests:

```python
# Backend example (pytest)
@pytest.fixture
def mock_elevenlabs(monkeypatch):
    async def mock_generate_speech(text):
        return b"mock audio data"
    
    monkeypatch.setattr(
        "server.services.ai_agent.ElevenLabsClient.generate",
        mock_generate_speech
    )
```

```typescript
// TypeScript example (Vitest)
vi.mock('@/lib/api', () => ({
  fetchEpisodes: vi.fn(() => Promise.resolve(mockEpisodes))
}));
```

### Database Connections

Use in-memory SQLite for backend tests:

```python
# conftest.py
@pytest.fixture
async def test_db():
    engine = create_async_engine("sqlite+aiosqlite:///:memory:")
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)
    yield engine
    await engine.dispose()
```

## Coverage Goals

We aim for **pragmatic coverage**, not 100%:

| Component | Target | Rationale |
|-----------|--------|-----------|
| **Backend services** | 80%+ | Critical business logic |
| **API endpoints** | 70%+ | Main integration points |
| **Web components** | 50%+ | Focus on interactive components |
| **Mobile components** | 50%+ | Focus on core flows (episode alert, check-in) |
| **Watch app** | Manual only | HealthKit best tested on device |

## CI/CD Integration

*Note: CI/CD workflows were removed from the plan as the app won't be deployed. However, if you choose to add GitHub Actions in the future, tests should run on every push/PR.*

Example workflow structure:

```yaml
# .github/workflows/test.yml (for reference)
name: Test All Apps
on: [push, pull_request]
jobs:
  test-web:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: cd apps/web && npm install && npm test
  
  test-mobile:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: cd apps/mobile && npm install && npm test
  
  test-server:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: cd apps/server && pip install -e ".[dev]" && pytest
```

## Debugging Tests

### Web/Mobile
```bash
# Run a single test file
npx vitest path/to/test.test.ts

# Run tests matching a pattern
npx vitest -t "EpisodeCard"

# Debug mode (Node inspector)
node --inspect-brk node_modules/.bin/vitest
```

### Backend
```bash
# Run a single test file
pytest tests/test_episodes.py -v

# Run a specific test
pytest tests/test_episodes.py::test_create_episode -v

# Debug with pdb
pytest --pdb tests/test_episodes.py
```

## Best Practices

1. **Test behavior, not implementation:** Focus on what the user sees/experiences
2. **Keep tests isolated:** Each test should work independently (no shared state)
3. **Use descriptive names:** `test_episode_alert_shows_heart_rate` not `test_alert`
4. **Avoid flaky tests:** Don't rely on timing or random data
5. **Mock external dependencies:** Network calls, file system, timers

## Future Improvements

For post-hackathon development:

* **E2E tests:** Playwright or Cypress for full user flows
* **Performance tests:** Load testing for backend with Locust
* **Visual regression:** Percy or Chromatic for UI component screenshots
* **Snapshot tests:** React component snapshot testing with Jest
