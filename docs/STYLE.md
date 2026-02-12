# Coding Standards & Style Guide

This document defines the coding principles, language-specific guidelines, and collaboration practices for Pulsera.

## General Principles

* **Professionalism:** Code and documentation should be clear, objective, and maintainable. Avoid slang, memes, or overly casual language in production code.
* **Intent over Implementation:** Comments should explain *why* a decision was made, not *what* the code is doing (unless the implementation is inherently complex). Code should be self-documenting through clear naming.
* **Consistency:** Follow established patterns within each codebase. If a pattern exists, use it. If introducing a new pattern, document it.
* **Testability:** Write code that is easy to test. Prefer pure functions, dependency injection, and separation of concerns.

## Language Guidelines

### TypeScript (Web & Mobile)

#### Naming Conventions
* **Variables & Functions:** `camelCase` (e.g., `episodeId`, `calculateHeartRate`)
* **Components:** `PascalCase` (e.g., `EpisodeCard`, `NotificationOverlay`)
* **Constants:** `UPPER_SNAKE_CASE` (e.g., `MAX_HEART_RATE`, `API_BASE_URL`)
* **Private members:** Prefix with `_` (e.g., `_internalState`)

#### Type Safety
* **Strict mode:** Enabled in all `tsconfig.json` files (`"strict": true`)
* **No `any`:** Use `unknown` if type is truly unknown, then narrow with type guards
* **Prefer interfaces over types:** Use `interface` for object shapes, `type` for unions/intersections
* **Explicit return types:** Always specify return types for functions (aids refactoring)

```typescript
// Good
interface Episode {
  id: string;
  heartRate: number;
  status: 'active' | 'resolved';
}

function calculateDuration(start: Date, end: Date): number {
  return end.getTime() - start.getTime();
}

// Bad
function calculateDuration(start: any, end: any) {
  return end.getTime() - start.getTime();
}
```

#### Async/Await
* **Prefer async/await** over raw promises for readability
* **Always handle errors:** Use try/catch or `.catch()` for async operations
* **No floating promises:** Either await or explicitly handle promises

```typescript
// Good
async function fetchEpisode(id: string): Promise<Episode> {
  try {
    const response = await fetch(`/episodes/${id}`);
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch episode:', error);
    throw error;
  }
}

// Bad
function fetchEpisode(id: string) {
  fetch(`/episodes/${id}`).then(r => r.json()); // Floating promise
}
```

#### React Patterns
* **Functional components:** Always use function components (no class components)
* **Hooks:** Follow React hooks rules (use `eslint-plugin-react-hooks`)
* **Props destructuring:** Destructure props in function signature for clarity

```typescript
// Good
interface Props {
  episode: Episode;
  onClose: () => void;
}

export function EpisodeCard({ episode, onClose }: Props) {
  // component body
}

// Avoid
export function EpisodeCard(props: Props) {
  // component body using props.episode, props.onClose
}
```

### Python (Backend)

#### Naming Conventions
* **Variables & Functions:** `snake_case` (e.g., `episode_id`, `calculate_heart_rate`)
* **Classes:** `PascalCase` (e.g., `EpisodeService`, `HealthMonitor`)
* **Constants:** `UPPER_SNAKE_CASE` (e.g., `MAX_HEART_RATE`, `DEFAULT_THRESHOLD`)
* **Private members:** Prefix with `_` (e.g., `_internal_cache`)

#### Type Hints
* **Always use type hints:** Parameters, return values, and class attributes
* **Use modern syntax:** `list[str]` instead of `List[str]` (Python 3.11+)
* **Pydantic models:** Use for request/response validation

```python
# Good
from pydantic import BaseModel

class EpisodeCreate(BaseModel):
    user_id: str
    heart_rate: int
    timestamp: datetime

async def create_episode(episode: EpisodeCreate) -> Episode:
    # implementation
    pass

# Bad
async def create_episode(episode):
    pass
```

#### Async/Await
* **Use async/await** for all I/O operations (database, HTTP, file system)
* **Prefer async frameworks:** FastAPI, SQLAlchemy asyncio, httpx

```python
# Good
async def get_episode(episode_id: str) -> Episode | None:
    async with get_session() as session:
        result = await session.get(Episode, episode_id)
        return result

# Bad (blocking I/O in async context)
def get_episode(episode_id: str):
    session = Session()
    return session.query(Episode).filter_by(id=episode_id).first()
```

#### Docstrings
* **Use Google-style docstrings** for all public functions and classes
* **Single-line docstrings** for simple functions

```python
def calculate_hrv(rr_intervals: list[float]) -> float:
    """Calculate heart rate variability from RR intervals.
    
    Args:
        rr_intervals: List of RR intervals in milliseconds.
        
    Returns:
        HRV value in milliseconds.
    """
    pass
```

### Swift (Watch App)

#### Naming Conventions
* **Variables & Functions:** `camelCase` (e.g., `heartRate`, `startEpisode()`)
* **Types:** `PascalCase` (e.g., `EpisodeViewModel`, `HealthService`)
* **Constants:** `camelCase` (Swift convention, e.g., `maxHeartRate`)

#### SwiftUI Patterns
* **Use `@Observable`** for view models (SwiftUI modern approach)
* **Prefer `@State` and `@Binding`** over `@StateObject` when possible
* **Extract subviews:** Keep view bodies small and readable

```swift
// Good
@Observable
class EpisodeViewModel {
    var currentEpisode: Episode?
    var isActive: Bool = false
    
    func startEpisode() {
        // implementation
    }
}

// Bad
class EpisodeViewModel: ObservableObject {
    @Published var currentEpisode: Episode?
    // ObservableObject is older pattern
}
```

## Git Workflow

### Branching Strategy
* **Main branch:** Always stable, production-ready code
* **Feature branches:** Named `feature/description` (e.g., `feature/episode-calming`)
* **Bug fixes:** Named `fix/description` (e.g., `fix/websocket-reconnect`)
* **Hotfixes:** Named `hotfix/description` for urgent production fixes

### Commit Messages
* **Use imperative mood:** "Add feature" not "Added feature" or "Adds feature"
* **Capitalize first letter:** "Fix bug" not "fix bug"
* **No period at end:** "Add test" not "Add test."
* **Reference issues:** Include issue number if applicable (e.g., "Fix #123: ...")

```
Good commit messages:
- Add episode calming flow to watch app
- Fix WebSocket reconnection logic
- Update API endpoint for episode resolution
- Refactor health service for better testability

Bad commit messages:
- fixed stuff
- WIP
- asdfasdf
- Updated files
```

### Pull Requests
* **Small, focused PRs:** Aim for < 400 lines changed per PR
* **Descriptive titles:** Explain *what* and *why*, not *how*
* **Link issues:** Reference related issues in PR description
* **Self-review:** Review your own changes before requesting review from others

## Code Review Guidelines

* **Be respectful:** Critique code, not people. Assume good intent.
* **Ask questions:** "Could we simplify this?" vs "This is too complex"
* **Suggest alternatives:** Provide constructive feedback with examples
* **Approve only if you'd ship it:** Don't rubberstamp reviews

## Formatting & Linting

All codebases have automated formatting and linting configured. **Run these before committing:**

```bash
# Root level (formats all)
npm run format        # Prettier for JS/TS
npm run lint:all      # ESLint for web + mobile

# Backend
cd apps/server
make format           # Black + Ruff format
make lint             # Ruff lint
make check-types      # Pyright type checking
```

**Pre-commit hooks will automatically run these on staged files.**

## Imports Organization

### TypeScript
```typescript
// 1. External dependencies
import React from 'react';
import { View, Text } from 'react-native';

// 2. Internal absolute imports
import { Episode } from '@/types';
import { useEpisode } from '@/hooks';

// 3. Relative imports
import { EpisodeCard } from './EpisodeCard';
```

### Python
```python
# 1. Standard library
import os
from datetime import datetime

# 2. Third-party
from fastapi import FastAPI, Depends
from sqlmodel import Session

# 3. Local
from server.models import Episode
from server.services import EpisodeService
```

## Performance Considerations

* **Lazy loading:** Load heavy resources only when needed (e.g., 3D models, large images)
* **Memoization:** Use `useMemo`, `useCallback` (React) to avoid unnecessary re-renders
* **Database indexes:** Add indexes on frequently queried fields
* **Avoid premature optimization:** Optimize only when profiling shows bottlenecks
