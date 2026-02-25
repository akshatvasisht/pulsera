# Testing Guidelines

This document outlines the testing strategy, tools, and procedures for Pulsera.

## Strategy

Pulsera uses a **pragmatic testing approach** prioritizing:

1.  **Unit tests** for business logic (episode detection, HRV calculation, PulseNet inference)
2.  **Integration tests** for API endpoints and database operations
3.  **Manual verification** for platform-specific features (HealthKit, camera integration, 3D rendering)

### Test Types

- **Unit Tests:** Test individual functions or modules in isolation. They are fast, deterministic, and verify core logic.
- **Integration Tests:** Verify that multiple components (e.g., database, external services) work together correctly.
- **End-to-End (E2E) Tests:** Validate the entire system pipeline from the user's perspective, typically simulating real usage flows.

We prioritize **fast iteration** over 100% coverage for the hackathon MVP, but aim for good coverage of critical paths (episode lifecycle, alert routing).

## Testing Frameworks

| App         | Framework                           | Description                                  |
| ----------- | ----------------------------------- | -------------------------------------------- |
| **Web**     | Vitest + React Testing Library      | Fast unit tests for Next.js components       |
| **Mobile**  | Jest + React Native Testing Library | Component and integration tests for Expo app |
| **Backend** | pytest + httpx                      | Async API tests and service layer validation |
| **Watch**   | Manual testing                      | SwiftUI + HealthKit best tested on device    |

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

## Manual Tests

This section covers scenarios that cannot be automated: hardware-dependent behavior, visual verification, network-dependent flows.

### Watch App (HealthKit Integration)

- **Purpose:** Verify HealthKit data streaming and episode trigger logic.
- **Usage:** Build on physical watch, start Indoor Walk workout, and observe HR updates.
- **What It Tests:** HealthKit permission handling, HKAnchoredObjectQuery reliability, and threshold detection.
- **Expected Output:** HR updates every ~5s; episode starts when HR > threshold.

### Mobile App (Camera Check-In)

- **Purpose:** Validate SmartSpectra SDK integration for contactless vitals.
- **Usage:** Open "Quick Check-In" on physical iOS device and position face in guide.
- **What It Tests:** Camera permission hooks, SDK initialization, and ML analysis callback.
- **Expected Output:** Pulse, breathing rate, and mood displayed after 15s.

### Web Dashboard (3D Visualization)

- **Purpose:** Ensure 3D terrain heatmaps render correctly.
- **Usage:** Navigate to `/dashboard` and interact with the map.
- **What It Tests:** Three.js scene initialization, terrain mesh loading, and API data overlay.
- **Expected Output:** Smoothly interactive 3D map with accurate geographic heat markers.

## Writing New Tests

- **Pattern:** Follow the Arrange / Act / Assert pattern.
  ```typescript
  // Arrange
  const input = setupData()
  // Act
  const result = processData(input)
  // Assert
  expect(result).toEqual(expectedOutput)
  ```
- **Isolation:** Tests must not share mutable state. Each test should set up and tear down its own environment (e.g., in-memory DB).
- **Mocking Requirements:** No live hardware or external APIs should be used in automated runs. Depend on mocks for ElevenLabs, Gemini, and HealthKit.

## Mocking Standards

External APIs should be mocked using [Library].

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
  fetchEpisodes: vi.fn(() => Promise.resolve(mockEpisodes)),
}))
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

| Component             | Target      | Rationale                                     |
| --------------------- | ----------- | --------------------------------------------- |
| **Backend services**  | 80%+        | Critical business logic                       |
| **API endpoints**     | 70%+        | Main integration points                       |
| **Web components**    | 50%+        | Focus on interactive components               |
| **Mobile components** | 50%+        | Focus on core flows (episode alert, check-in) |
| **Watch app**         | Manual only | HealthKit best tested on device               |

## CI/CD Integration

_Note: CI/CD workflows were removed from the plan as the app won't be deployed. However, if you choose to add GitHub Actions in the future, tests should run on every push/PR._

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

pytest --pdb tests/test_episodes.py

```

## Troubleshooting Tests

### Environment & Dependency Issues
**Issue:** `ImportError: cannot import name 'module'` after install.
**Fix:** Verify your PYTHONPATH is set correctly and the test environment is activated.

### Runtime Errors
**Issue:** `MagicMock object has no attribute 'expected_call'` during API mock.
**Fix:** Check the method name on the mocked object matches the actual implementation.

### Network & Config Issues
**Issue:** Test suite passes individually but fails when run together.
**Fix:** Ensure global state is reset in teardown methods and avoid shared fixtures unless explicitly read-only.
```

## Best Practices

1. **Test behavior, not implementation:** Focus on what the user sees/experiences
2. **Keep tests isolated:** Each test should work independently (no shared state)
3. **Use descriptive names:** `test_episode_alert_shows_heart_rate` not `test_alert`
4. **Avoid flaky tests:** Don't rely on timing or random data
5. **Mock external dependencies:** Network calls, file system, timers

## Future Improvements

For post-hackathon development:

- **E2E tests:** Playwright or Cypress for full user flows
- **Performance tests:** Load testing for backend with Locust
- **Visual regression:** Percy or Chromatic for UI component screenshots
- **Snapshot tests:** React component snapshot testing with Jest
