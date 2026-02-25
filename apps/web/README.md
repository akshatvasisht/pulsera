# Pulsera Web Dashboard

The Pulsera web dashboard is a Next.js 16 application that visualizes community safety data with interactive 3D terrain maps and real-time episode analytics.

## Features

- **3D Terrain Visualization**: Geographic anomaly heatmaps rendered with Three.js and React Three Fiber
- **Real-Time Episode Feed**: Live updates of health episodes across the community
- **Interactive Mapping**: MapLibre GL integration for vector tile-based geographic views
- **Community Analytics**: Zone-wide safety metrics and trend analysis
- **Dark Theme**: Premium, ember-inspired design system (#942626 crimson on charcoal)

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **React**: 19.2+
- **3D Graphics**: Three.js + React Three Fiber + Drei
- **Mapping**: MapLibre GL + React Map GL
- **Styling**: Tailwind CSS v4 + Motion (Framer Motion)
- **UI Components**: shadcn/ui + Radix UI primitives
- **Icons**: Lucide React

## Project Structure

```
src/
├── app/
│   ├── page.tsx           # Landing page (warm ember aesthetic)
│   ├── dashboard/         # Main dashboard with 3D terrain
│   └── layout.tsx         # Root layout with fonts
├── components/
│   ├── Dither.tsx         # Animated dither wave background
│   ├── Navbar.tsx         # Navigation component
│   └── PulseraWordmark.tsx # Logo component
└── lib/
    └── utils.ts           # Utility functions (cn, etc.)
```

## Development

### Prerequisites

- Node.js 18+ (LTS recommended)
- npm or pnpm

### Setup

```bash
cd apps/web
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Available Scripts

- `npm run dev` - Start development server on port 3000
- `npm run build` - Build production bundle
- `npm run start` - Serve production build
- `npm run lint` - Run ESLint
- `npm test` - Run Vitest tests
- `npm run test:watch` - Run tests in watch mode
- `npm run coverage` - Generate test coverage report

## Configuration

### Environment Variables (optional)

Create `.env.local` for environment-specific config:

```ini
# Backend API URL (if not using relative paths)
NEXT_PUBLIC_API_URL=http://localhost:8000

# Map tiles provider (optional custom tiles)
NEXT_PUBLIC_MAP_TILES_URL=https://tiles.example.com/{z}/{x}/{y}.pbf
```

### Next.js Config

Security headers are pre-configured in `next.config.ts`:

- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `X-XSS-Protection: 1; mode=block`
- `Permissions-Policy` for camera/microphone/geolocation

## Key Pages

### Landing Page (`/`)

Premium landing experience with:

- Animated crimson dither wave background
- Frosted glass content panels
- Warm ember color palette
- Call-to-action to dashboard

### Dashboard (`/dashboard`)

Interactive community safety dashboard:

- 3D terrain with episode heatmap overlay
- Real-time episode feed (sidebar)
- Geographic zone filtering
- Community-wide safety metrics

## 3D Visualization

The dashboard uses Three.js for high-performance 3D rendering:

```typescript
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';

<Canvas>
  <OrbitControls />
  <TerrainMesh data={episodeData} />
  <HeatmapOverlay zones={zones} />
</Canvas>
```

Performance optimizations:

- Lazy loading of 3D components (`next/dynamic` with `ssr: false`)
- Instanced rendering for episode markers
- Level-of-detail (LOD) for terrain mesh

## Styling

### Design Tokens

Core colors:

- `#942626` - Primary crimson
- `#1A0A08` - Charcoal background
- `#FFF1E6` - Ivory text

Fonts:

- **Headlines**: Garet (variable font)
- **Body/UI**: DM Sans (Google Fonts)

### Tailwind CSS

Using Tailwind v4 with custom configuration in `tailwind.config.js`. All components use utility classes.

## Testing

Tests are located alongside components:

```bash
npm test                  # Run all tests
npm run test:watch        # Watch mode
```

Example test (`page.test.tsx`):

```typescript
import { render, screen } from '@testing-library/react';
import Home from './page';

test('renders main heading', () => {
  render(<Home />);
  expect(screen.getByText(/Your family circle/i)).toBeInTheDocument();
});
```

## Deployment

### Vercel (Recommended)

Optimized for Vercel deployment:

```bash
npm run build     # Verify build works
# Then deploy via Vercel CLI or GitHub integration
```

### Self-Hosted

```bash
npm run build
npm run start     # Starts production server on port 3000
```

For production, use a process manager (PM2) or containerize with Docker.

## Troubleshooting

### Build Errors

**Issue**: `Module not found: Can't resolve '@/...'`

**Fix**: Ensure `tsconfig.json` has correct path aliases:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

**Issue**: Three.js errors on build

**Fix**: Ensure 3D components are client-only:

```typescript
const Dither = dynamic(() => import('@/components/Dither'), { ssr: false })
```

### Performance

**Issue**: Slow 3D rendering on low-end devices

**Fix**:

1. Reduce terrain mesh complexity
2. Lower heatmap resolution
3. Disable post-processing effects
4. Use WebGL fallback detection

## Further Reading

- [Next.js App Router Docs](https://nextjs.org/docs/app)
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber)
- [MapLibre GL](https://maplibre.org/maplibre-gl-js/docs/)
- [Tailwind CSS v4](https://tailwindcss.com/docs)
