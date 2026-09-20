# Requirements

This document outlines the product requirements for Leo, organized by development priority and user role.

## Current Implementation ✅

These features are **fully implemented** in Leo today:

### Core Music Viewing
- ✅ Load and view iReal Pro chord chart formats
- ✅ Professional chord chart display with proper musical notation
- ✅ Support for multiple song books (jazz, pop, gypsy jazz, dixieland)
- ✅ Real-time transposition to any key
- ✅ Dark and light display modes
- ✅ Responsive layout (desktop, tablet, mobile)

### Search & Organization
- ✅ Full-text search across song titles and composers
- ✅ Faceted filtering by composer, style, key, and playlist
- ✅ Pre-loaded library with thousands of standards
- ✅ Fast, client-side search (no server required)

### Practice Tools
- ✅ Professional metronome (20-300 BPM)
- ✅ Customizable rhythmic patterns
- ✅ Built-in patterns (4/4, 3/4, 6/8, clave, bolero, etc.)
- ✅ Pattern builder with note and rest values
- ✅ Random mute feature for practice
- ✅ Visual notation display
- ✅ Active beat highlighting
- ✅ Background operation (metronome continues when popup closed)
- ✅ Saved patterns with localStorage persistence
- ✅ Visual sync offset adjustment

### Technical
- ✅ Works offline after initial load
- ✅ Static site deployment (GitHub Pages)
- ✅ Fast load times with Vite
- ✅ Comprehensive test coverage (Playwright + pytest)
- ✅ Unified CLI for development
- ✅ Modern TypeScript/Mithril.js architecture

## Planned Features 🚧

These features are **planned** for future development:

### Collaboration (Conductor/Follower Mode)

#### Network Architecture
- [ ] Event broker integration (Crossbar.io or similar)
- [ ] Real-time WebSocket communication
- [ ] Offline mode with automatic reconnection
- [ ] Cloud-hosted authentication service
- [ ] Band management API

#### Conductor Role
Must have:
- [ ] Broadcast page turn events to followers
- [ ] Distribute and assign setlists to band members
- [ ] Manage follower permissions and roles
- [ ] Send "Come Together" sync command
- [ ] Send "Jump to Page" navigation command
- [ ] Push annotations to followers

Should have:
- [ ] Set page offset (for multi-screen setups)
- [ ] Annotation palette for quick markup
- [ ] Host local network for offline collaboration

Would like:
- [ ] Broadcast pointer/cursor to highlight sections
- [ ] Trigger MIDI events from page turns
- [ ] Statistical analysis of page turn timing
- [ ] AI-learned page turning (integration with Project Joe)

#### Follower Role
Must have:
- [ ] Subscribe to conductor events
- [ ] Receive automatic page turns
- [ ] Fall back to local control if disconnected
- [ ] Local download of shared setlists
- [ ] Receive annotations from conductor

Should have:
- [ ] Pull annotations from conductor on demand
- [ ] Multiple conductor support (sync with 'n' conductors)
- [ ] View conductor status (connected/disconnected)

Would like:
- [ ] Request control temporarily
- [ ] Send feedback to conductor

### Annotation System

#### Drawing & Markup
Must have:
- [ ] Handwriting/drawing on sheet music
- [ ] Touch and mouse support
- [ ] Undo/redo functionality
- [ ] Save annotations per song
- [ ] Clear all annotations

Should have:
- [ ] Annotation palette (quick symbols and marks)
- [ ] Color selection
- [ ] Line width options
- [ ] Eraser tool
- [ ] Text comments

Would like:
- [ ] Shape tools (circles, arrows, etc.)
- [ ] Annotation layers
- [ ] Version history
- [ ] Annotation templates

#### Collaboration
Must have:
- [ ] Push annotations to followers
- [ ] Pull annotations from conductor
- [ ] Merge annotations from multiple sources

Should have:
- [ ] Annotation permissions (who can edit)
- [ ] Annotation timestamps
- [ ] Filter by author

Would like:
- [ ] Annotation suggestions
- [ ] Collaborative editing
- [ ] Annotation chat/discussion

### Setlist Management

#### Basic Features
Must have:
- [ ] Create custom setlists
- [ ] Add/remove songs from setlists
- [ ] Reorder songs (drag & drop)
- [ ] Save multiple setlists
- [ ] Switch between setlists

Should have:
- [ ] Setlist metadata (date, venue, notes)
- [ ] Duplicate setlists
- [ ] Archive old setlists
- [ ] Search within setlist

Would like:
- [ ] Setlist templates
- [ ] Import/export setlists
- [ ] Share setlists via URL
- [ ] Suggest songs based on style/tempo

#### Distribution (Conductor)
Must have:
- [ ] Assign setlist to followers
- [ ] Delayed distribution (schedule for later)
- [ ] Track which followers have received setlist

Should have:
- [ ] Update distributed setlists
- [ ] Notify followers of changes
- [ ] Preflight checklist (verify all assets available)

Would like:
- [ ] Conditional distribution (by role)
- [ ] Setlist versions with rollback

### Recording Integration

Must have:
- [ ] Link audio recordings to songs
- [ ] Playback recordings

Should have:
- [ ] Multiple recordings per song (versions)
- [ ] Playback controls (play/pause, seek)
- [ ] Side-by-side recording comparison

Would like:
- [ ] Synchronized playback with sheet music
- [ ] Recording notes/timestamps
- [ ] Upload recordings to cloud

### Additional Tools

#### Tuner
Must have:
- [ ] Chromatic tuner
- [ ] Visual pitch display
- [ ] Reference tone generator

Should have:
- [ ] Instrument-specific tunings
- [ ] Calibration adjustment (A=440Hz, etc.)

#### File Conversion
Must have:
- [ ] Convert between iReal and other formats

Should have:
- [ ] PDF import (with OCR?)
- [ ] MusicXML support

#### Multi-Screen Support
Should have:
- [ ] Display on multiple screens simultaneously
- [ ] Configurable page offset per screen
- [ ] Synchronized page turns across screens

## Technical Requirements

### Performance
- Must: Fast initial load (< 3 seconds)
- Must: Smooth 60fps rendering
- Must: Responsive input (<100ms)
- Should: Offline-first architecture
- Should: Progressive Web App (PWA) support

### Browser Support
- Must: Modern Chrome, Firefox, Safari, Edge
- Must: iOS Safari, Chrome Mobile
- Should: Tablet optimization
- Would like: Electron desktop app

### Accessibility
- Must: Keyboard navigation
- Must: Screen reader support (for UI, not charts)
- Should: High contrast mode
- Should: Adjustable font sizes

### Security & Privacy
- Must: HTTPS for all connections
- Must: Secure authentication
- Must: No telemetry without consent
- Should: End-to-end encryption for annotations
- Should: Local-first data storage

### Deployment
- Must: Static hosting option (GitHub Pages, etc.)
- Must: Docker support for full stack
- Should: One-click cloud deployment
- Would like: Mobile app stores (iOS/Android)

## Non-Functional Requirements

### Reliability
- Must: Graceful degradation when offline
- Must: Data persistence (localStorage)
- Should: Auto-save every 30 seconds
- Should: Data backup/export

### Usability
- Must: Intuitive UI for musicians
- Must: Minimal clicks to common actions
- Should: Keyboard shortcuts for power users
- Should: Onboarding tutorial

### Maintainability
- Must: Comprehensive test coverage
- Must: Clear documentation
- Should: Modular architecture
- Should: Contribution guidelines

## User Personas

### Solo Practitioner
- Needs quick access to standards
- Uses metronome for practice
- Transposes often
- Works alone

### Jam Session Participant
- Needs fast song lookup
- Transposes on the fly
- Informal, no set structure
- May or may not use conductor mode

### Band Leader (Conductor)
- Manages setlists for whole band
- Controls page turns during rehearsal/performance
- Distributes arrangements and annotations
- Needs reliability and control

### Band Member (Follower)
- Receives setlists from conductor
- Follows page turns automatically
- Focuses on playing, not navigating
- Needs unobtrusive UI

### Music Teacher
- Shows charts to students
- Needs large, clear display
- May annotate during lessons
- Shares arrangements with students

## Success Metrics

### Adoption
- Number of users
- Monthly active users
- User retention rate

### Engagement
- Average session duration
- Songs viewed per session
- Metronome usage rate
- Search queries per session

### Performance
- Page load time
- Search response time
- Metronome timing accuracy
- Crash rate

### Collaboration (when implemented)
- Conductor/follower adoption rate
- Average band size
- Annotation sharing rate
- Network reliability metrics

---

See [User Stories](User%20Stories.md) for detailed use case narratives and [Technical.md](Technical.md) for architecture details.

## Original Requirements (Archived)

The original requirements below are preserved for reference:

### General
- Must:
  - work in a networked fashion where, if connection is broken, files are stored locally.
  - load and view **'sheet music'** from various formats.
  - create and save **Annotations** with **handwriting**.
  - **Set List** ('sheet music', annotations, recordings, MIDI, etc)
- Should:
  - work on all devices.

### Follower
- must:
  - [everything from 'General']
  - consume events from **Conductor**

### as a Conductor :
- must have:
  - [everything from a Follower and General]
  - **Manage**, **Distribute**, assign a **Set List** to subscribed **Followers**
  - broadcast events (**Page Turn**, **Come Together**, **Jump to Page**, **Anno Push**, etc.)
- should be able to:
  - Manage **Followers** (Band Members) by assigning **Band Roles**.
  - set a **Page Offset** to follow itself.
  - **Pallet** annotate from a menu.
  - Host a network for Followers to connect.
- would like to:
  - broadcast a **Pointer** to temporally draw attention to specific parts.
  - **trigger MIDI** from either a digital or physical touch point.
  - present a statistical analysis for 'Notes'

### Tools / Utilities
- Tuner
- Metronome
- File type converter