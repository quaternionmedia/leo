# Architecture

Leo is a modern web application for viewing and managing sheet music, with a focus on jazz standards and iReal Pro chord charts. This document describes the technical architecture and design decisions.

## Overview

Leo consists of three main components:

1. **Frontend** - Single-page application built with Mithril.js and TypeScript
2. **Backend** - FastAPI REST API (Python) for setlist and annotation management
3. **Build System** - Unified CLI powered by uv and npm for development workflows

## Frontend Architecture

### Technology Stack

- **Framework**: [Mithril.js](https://mithril.js.org/) - Lightweight, pragmatic JavaScript framework
- **Language**: TypeScript for type safety
- **Build Tool**: Vite for fast development and optimized production builds
- **State Management**: [Meiosis](https://meiosis.js.org/) pattern for reactive state
- **Rendering**: [ireal-renderer](https://github.com/daumling/ireal-renderer) for chord chart visualization

### Application Structure

```
src/
├── index.ts              # Entry point, routing, app initialization
├── State.ts              # Central state type definitions
├── ireal.ts              # iReal Pro chart rendering components
├── books.ts              # Song library loader (multiple .ireal files)
├── Setlist.js            # Setlist sidebar UI
├── Search.ts             # Search and filter components
├── Control.js            # Transport controls, transposition
├── MetronomeView.ts      # Metronome UI component
├── MetronomeService.ts   # Persistent metronome service (singleton)
├── Nav.js                # Navigation sidebar toggle
├── components/           # Reusable UI components
│   ├── navigation/       # Nav sidebar components
│   └── debug/            # Debug panel and tracer
└── styles/               # CSS modules
    ├── root/             # Global CSS variables
    ├── ireal.css         # Chart styling
    ├── metronome.css     # Metronome styling
    ├── setlist.css       # Setlist styling
    └── ...
```

### Key Components

#### State Management (Meiosis Pattern)

Leo uses the Meiosis pattern for predictable state updates:

```typescript
interface State {
  song: Song | null              // Currently displayed song
  key: string | null              // Current key signature
  transpose: number               // Transposition offset
  darkMode: boolean               // Dark/light theme
  metronomeOpen: boolean          // Metronome popup visible
  metronomeActive: boolean        // Metronome playing in background
  setlistActive: boolean          // Setlist sidebar open
  search_options: SearchOptions   // Current search/filter state
  results: SearchResults          // Filtered song list
  // ... debug options, renderer, etc.
}
```

State updates flow through services that respond to specific state changes:

- **searchService** - Updates search results when search_options change
- **transposeService** - Re-renders chart when transpose value changes
- **songService** - Updates URL route when song changes
- **hashService** - Syncs metronome popup state with URL hash

#### Song Library & Search

Songs are loaded from multiple iReal Pro `.ireal` files in `src/static/`:
- Jazz standards
- Contemporary jazz
- Pop songs
- Gypsy jazz
- Dixieland collections

Search is powered by [itemsjs](https://github.com/itemsapi/itemsjs) with faceted filtering by:
- Composer
- Style
- Key
- Playlist (source book)

Full-text search covers title and composer fields.

#### iReal Pro Integration

The `ireal-renderer` library parses and displays chord charts using Web Components:

```
irr-chords          # Container for all chords
  irr-cell          # Individual measure/beat
    irr-chord       # Chord symbol with optional sub-elements:
      irr-chord     # "Over" chord (e.g., C/G)
      irr-over      # Slash chord notation
      sub           # Chord modifiers (7, maj7, etc.)
      sup           # Accidentals (♯, ♭)
    irr-measure     # Measure numbers
    irr-section     # Section markers (A, B, Coda)
    irr-rbar/lbar   # Bar lines
```

Custom CSS in `src/styles/ireal.css` styles these web components for optimal readability.

#### Metronome Service

The metronome is implemented as a persistent singleton service (`MetronomeService`) that:

- Runs independently of UI component lifecycle
- Uses Web Audio API for precise timing
- Supports customizable rhythmic patterns (3/4, 4/4, 6/8, clave patterns, etc.)
- Includes visual sync offset to compensate for audio latency
- Saves patterns to localStorage
- Provides callbacks for UI updates (play state, current note)

**Key Features:**
- BPM range: 20-300
- Beat types: whole note, half, quarter, eighth, sixteenth
- Pattern builder with note and rest values
- Random mute for practice
- Emphasize first beat
- Visual notation display (♩, ♪, 𝅗𝅥, 𝄽, etc.)
- Active note highlighting during playback

The metronome appears as a popup overlay that can be closed while keeping the metronome playing in the background.

### Routing

Client-side routing uses Mithril's router:

```
/:playlist/:title   # View a specific song
#metronome          # Open metronome popup (hash-based)
```

## Backend Architecture (Optional)

The backend API is **optional** - the frontend can run standalone. When enabled, it provides:

### Technology Stack

- **Framework**: FastAPI (Python 3.10+)
- **Database**: MongoDB (for setlist and annotation persistence)
- **Parser**: pyRealParser for iReal Pro format parsing

### API Endpoints

```
GET  /setlist              # Get current setlist
GET  /songs?s=<query>      # Search songs by text
GET  /song/{title}         # Get song source (PDF or iReal URL)
GET  /ireal                # Get default iReal book
GET  /ireal/{title}        # Get iReal URL for specific song
GET  /annotations/{song}   # Get saved annotations
POST /annotations/{song}   # Save annotations
```

Static file serving:
- `/pdf/*` - PDF sheet music files
- `/*` - Frontend SPA (catch-all for client routing)

### Database Schema

**Songs Collection:**
```python
{
  'book': str,              # Source book name
  'title': str,             # Song title
  'composer': str,          # Composer name
  'key': str,               # Original key
  'style': str,             # Musical style
  'bpm': int,               # Tempo
  'time_signature': [int],  # e.g., [4, 4]
  'chord_string': str,      # iReal chord notation
  'tune_string': str,       # Full iReal URL string
  # ... additional metadata
}
```

**Annotations Collection:**
```python
{
  'song': str,              # Song title
  'annotations': list       # Saved markup/notes
}
```

Text indexes on `title`, `composer`, and `style` enable fast search.

## Build System & CLI

### unified CLI (`leo`)

Leo provides a unified CLI built with Click that wraps both Python (uv) and Node (npm) tooling:

```bash
# Development
leo quickstart              # Install deps & start dev server
leo serve-frontend          # Run Vite dev server
leo serve                   # Run FastAPI backend

# Testing
leo test                    # Run pytest
leo playwright-test         # Run Playwright E2E tests
leo playwright-setup        # Install Playwright browsers

# Building
leo build                   # Build frontend for production
leo package                 # Build Python wheel/sdist

# Utilities
leo npm -- <args>           # Run npm commands
leo npx -- <args>           # Run npx commands
leo run -- <cmd>            # Run arbitrary commands in uv env
leo sync                    # Install Python dependencies
```

All commands automatically ensure dependencies are installed when needed.

### Package Management

- **Python**: [uv](https://github.com/astral-sh/uv) - Fast Python package manager
- **Node**: npm for frontend dependencies

Dependencies are declared in:
- `pyproject.toml` - Python packages
- `package.json` - Node packages

### Testing

**Python Tests** (`tests/`):
- Framework: pytest
- Coverage: CLI integration, command validation
- Run: `leo test`

**Frontend Tests** (`tests/playwright/`):
- Framework: Playwright
- Coverage: Core rendering, metronome, accessibility, layout
- Run: `leo playwright-test`

## Deployment

### Static Deployment (GitHub Pages)

The frontend can be deployed as a static site:

```bash
leo build
# Upload dist/ to hosting
```

Demo: https://quaternionmedia.github.io/leo/

### Full Stack Deployment

For backends with API and MongoDB:

1. Deploy FastAPI app (uvicorn/gunicorn)
2. Provision MongoDB instance
3. Import song library: `leo init-db --db-url mongodb://...`
4. Build and serve frontend: `leo build && leo serve`

Docker support available via `docker-compose.yml` and `Dockerfile`.

## Future Architecture (Planned)

The initial vision includes collaborative features for band leaders and followers:

### Cloud Services (Planned)
- Authentication service
- Real-time event broker (Crossbar.io)
- Band management API

### Roles (Planned)

**Conductor:**
- Broadcast page turn events
- Manage setlists for band members
- Push annotations to followers
- Set page offsets

**Follower:**
- Subscribe to conductor events
- Receive automatic page turns
- Fall back to local control if disconnected

**Events:**
- `Page_Turn` - Navigate to specific page
- `Come_Together` - Sync all followers to same position
- `Jump_To_Page` - Direct navigation
- `Anno_Push` - Distribute annotations

See [Requirements.md](Requirements.md) and [User Stories.md](User%20Stories.md) for detailed future feature planning.

## Development Philosophy

- **Progressive Enhancement**: Core features work without backend
- **Fast Feedback**: Hot reload, instant builds with Vite
- **Type Safety**: TypeScript for reduced runtime errors
- **Unified Tooling**: Single CLI for all tasks
- **Separation of Concerns**: Service layer separate from UI components
