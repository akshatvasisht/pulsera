# Pulsera Backend Server

The Pulsera backend is a FastAPI-based async Python server that handles episode management, ML inference with PulseNet, community aggregation, and real-time WebSocket telemetry.

## Features

- **Episode Lifecycle Management**: Create, update, and query health episodes
- **PulseNet ML Inference**: PyTorch anomaly detection model for individual and community-wide events
- **Real-Time Telemetry**: WebSocket ingestion of vitals data from Watch and Mobile apps
- **Community Safety Zones**: Geographic aggregation of episodes for zone-wide risk assessment
- **LLM Analysis**: Gemini API integration for health insights and recommendations
- **Auto-Generated API Docs**: FastAPI's built-in OpenAPI/Swagger documentation

## Tech Stack

- **Framework**: FastAPI 0.115+
- **Server**: Uvicorn with async workers
- **Database**: SQLModel + SQLAlchemy (async) + SQLite (dev) or PostgreSQL (prod)
- **ML**: PyTorch 2.5+ for PulseNet model
- **LLM**: Google Generative AI (Gemini)
- **Testing**: pytest + httpx + pytest-asyncio

## Project Structure

```
src/server/
├── main.py                 # FastAPI app entry point
├── config.py               # Settings (Pydantic BaseSettings)
├── models/                 # SQLModel database models
│   ├── episode.py
│   ├── user.py
│   ├── group.py
│   └── alert.py
├── routes/                 # API route handlers
│   ├── episodes.py
│   ├── auth.py
│   ├── groups.py
│   ├── alerts.py
  └── health_data.py
├── services/               # Business logic layer
│   ├── episode_service.py
│   ├── pulsenet_service.py # ML inference
│   └── community_service.py
└── database.py             # AsyncSession setup

tests/                      # Pytest test suite
├── conftest.py             # Test fixtures
├── test_episode_routes.py
├── test_episode_service.py
└── ...

checkpoints/                # PyTorch model weights (.pt files)
pyproject.toml              # Project config + dependencies
```

## Development

### Prerequisites

- Python 3.11+
- pip or uv (recommended for faster installs)

### Setup

```bash
cd apps/server
pip install -e ".[dev]"    # Installs with dev dependencies
```

This installs:

- Runtime: `fastapi`, `uvicorn`, `sqlmodel`, `sqlalchemy[asyncio]`, `torch`, `google-generativeai`
- Dev tools: `pytest`, `httpx`, `ruff`, `black`, `pyright`

### Environment Variables

Create `.env` file in `apps/server/`:

```ini
# Database
DATABASE_URL=sqlite+aiosqlite:///./pulsera.db

# CORS Origins (comma-separated)
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:19006

# External API Keys
ELEVENLABS_API_KEY=your_elevenlabs_api_key
GEMINI_API_KEY=your_google_gemini_api_key
SMARTSPECTRA_API_KEY=your_smartspectra_api_key

# Model Checkpoints
PULSENET_CHECKPOINT_PATH=checkpoints/pulsenet_v1.pt

# Feature Flags
ENABLE_COMMUNITY_DETECTION=true
DEBUG_MODE=true
```

See `.env.example` for a complete template.

### Running the Server

```bash
# Development (auto-reload on code changes)
uvicorn src.server.main:app --reload --port 8000

# Or via npm root script
cd ../..
npm run dev:server
```

Server starts on [http://localhost:8000](http://localhost:8000).

API docs available at:

- **Swagger UI**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc**: [http://localhost:8000/redoc](http://localhost:8000/redoc)

### Available Make Commands

```bash
# Linting and formatting
make lint              # Run Ruff linter
make format            # Format with Black + RuffFormat
make check-types       # Type check with Pyright

# Testing
make test              # Run pytest with coverage
make test-verbose      # Verbose pytest output

# Combined
make check-all         # Lint + format + type check + test
```

## API Overview

Base URL: `http://localhost:8000`

### Key Endpoints

| Method | Endpoint                       | Description                |
| ------ | ------------------------------ | -------------------------- |
| `POST` | `/episodes/start`              | Create a new episode       |
| `PUT`  | `/episodes/{id}/resolve`       | Mark episode as resolved   |
| `GET`  | `/episodes/user/{user_id}`     | Get user's episode history |
| `POST` | `/groups`                      | Create a family group      |
| `POST` | `/groups/{id}/members`         | Add member to group        |
| `POST` | `/alerts`                      | Create an alert            |
| `POST` | `/health_data/ingest`          | Bulk ingest vitals data    |
| `GET`  | `/community/zones/{id}/status` | Get zone safety status     |

Full API documentation: [docs/API.md](../../docs/API.md)

## Database Models

Core models (defined with SQLModel):

- **User**: User account with profile
- **Group**: Family/caregiver groups
- **Episode**: Health anomaly event
- **Alert**: Escalation alerts to caregivers
- **HealthData**: Time-series vitals storage
- **Zone**: Geographic safety zones

### Migrations

Currently using SQLModel's `create_all()` for schema creation (hackathon simplicity). For production, use Alembic:

```bash
# Generate migration
alembic revision --autogenerate -m "Add new field"

# Apply migration
alembic upgrade head
```

## ML Inference (PulseNet)

PulseNet is a custom PyTorch model that detects anomalies in:

1. **Individual vitals**: Heart rate spikes, HRV drops
2. **Community patterns**: Correlated distress across geographic zones

### Model Loading

```python
from server.services.pulsenet_service import PulseNetService

service = PulseNetService(checkpoint_path="checkpoints/pulsenet_v1.pt")
result = await service.detect_anomaly(heart_rate=145, hrv=25, user_context={...})
```

### Checkpoint Management

Large model files (`.pt`) are in `checkpoints/`. For production:

- Use Git LFS: `git lfs track "*.pt"`
- Or host on S3/GCS and download on server start

## Testing

Run tests with pytest:

```bash
# All tests
make test

# Specific test file
pytest tests/test_episode_routes.py -v

# With coverage report
pytest --cov=src --cov-report=html
```

Tests use in-memory SQLite and mock external APIs (ElevenLabs, Gemini).

## Deployment

### Docker (Recommended)

```dockerfile
# Dockerfile (create in apps/server/)
FROM python:3.11-slim
WORKDIR /app
COPY pyproject.toml ./
RUN pip install .
COPY src ./src
COPY checkpoints ./checkpoints
CMD ["uvicorn", "src.server.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

Build and run:

```bash
docker build -t pulsera-server .
docker run -p 8000:8000 --env-file .env pulsera-server
```

### Cloud Platforms

- **Render**: Deploy with `uvicorn` command
- **Fly.io**: Use Docker deployment
- **Railway**: Connect GitHub and auto-deploy

### Production Checklist

- [ ] Migrate to PostgreSQL (update `DATABASE_URL`)
- [ ] Add Gunicorn for multi-worker deployment
- [ ] Set up Alembic for database migrations
- [ ] Move model checkpoints to object storage (S3/GCS)
- [ ] Configure Redis for session/cache (if needed)
- [ ] Enable HTTPS and update `ALLOWED_ORIGINS`
- [ ] Set up structured logging and monitoring

## Troubleshooting

### Import Errors

**Issue**: `ModuleNotFoundError: No module named 'server'`

**Fix**: Ensure installed in editable mode:

```bash
pip install -e ".[dev]"
```

### Database Lock Errors (SQLite)

**Issue**: `database is locked`

**Fix**: SQLite doesn't handle concurrent writes well. Either:

1. Use `timeout=30` in connection string
2. Migrate to PostgreSQL for production

### Model Checkpoint Missing

**Issue**: `FileNotFoundError: checkpoints/pulsenet_v1.pt`

**Fix**:

1. Ensure checkpoint file exists
2. Update `PULSENET_CHECKPOINT_PATH` in `.env`
3. Or disable ML features temporarily

### Slow Response Times

**Issue**: API requests are slow

**Investigate**:

1. Check if running with `--reload` (disable for benchmarking)
2. Profile with `py-spy` or `cProfile`
3. Add database indexes on frequently queried fields
4. Consider caching frequently accessed data

## Further Reading

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [SQLModel Docs](https://sqlmodel.tiangolo.com/)
- [Uvicorn Deployment](https://www.uvicorn.org/deployment/)
- [PyTorch Model Deployment](https://pytorch.org/serve/)
