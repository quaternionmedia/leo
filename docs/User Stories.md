# User Stories

User stories organized by persona and workflow stage.

## Current User Stories (Implemented)

### Solo Practitioner

> As a musician practicing alone, I want quick access to charts with a metronome so I can practice efficiently.

**Typical Flow:**
- Open Leo (works offline)
- Search for song by title or composer
- View chord chart in original key
- Transpose to comfortable practice key
- Toggle dark mode for lighting preference
- Open metronome with custom pattern
- Metronome runs in background while viewing chart

**Value:** Single app for both charts and practice tools, no internet required.

---

### Jam Session Participant

> As a jam session musician, I need instant access to any standard in any key so I can keep up with spontaneous song calls.

**Typical Flow:**
- Song called: search and select in under 5 seconds
- Transpose if needed with one-tap controls
- View readable chart on phone or tablet
- Quickly switch between songs as set progresses

**Value:** Fast lookup and transposition keeps the music flowing without interruption.

---

### Music Student

> As a student, I want to study chord progressions and practice with varied metronome patterns.

**Typical Flow:**
- Search assigned song
- Study chord progression structure
- Filter by composer to find similar tunes
- Use metronome at slow tempo
- Enable random mute to practice internal time
- Gradually increase tempo over practice sessions
- Save custom patterns for different styles

**Value:** Complete learning tool combining charts, exploration, and practice aids.

---

### Cover Band Musician

> As a band member, I need to find songs in multiple styles and transpose them to comfortable keys.

**Typical Flow:**
- Search library for song in any style
- Filter by genre (jazz, bossa, pop, etc.)
- Transpose to singer's key
- Explore similar songs by style or composer
- Access same library across multiple rehearsals

**Value:** Comprehensive song library with instant transposition eliminates physical charts.

---

## Future User Stories (Planned)

### Band Leader (Conductor)

> As a band director, I want to control what musicians see and synchronize page turns across the ensemble.

**Before Rehearsal:**
- Create setlist with specific arrangements
- Add annotations to charts
- Set page offsets per instrument section
- Distribute setlist to all members (scheduled or immediate)
- Link reference recordings

**During Rehearsal:**
- Enter Conductor Mode with all members as followers
- Run preflight checklist (connections, downloads)
- Broadcast page turn events to all members simultaneously
- Send "Come Together" to sync everyone to specific page
- Use annotation pointer to highlight sections
- Works offline (airplane mode) after initial setup
- Auto-fallback to local control if connection drops

**After Rehearsal:**
- Add annotations based on session
- Push updates to all members
- Review statistics (page turns, timing)
- Accept text feedback from band members

**Value:** Focus on conducting music instead of managing logistics. Seamless coordination without verbal cues.

---

### Band Member (Follower)

> As a band member, I want automatic page turns so I can focus entirely on playing.

**Typical Flow:**
- Receive setlist notification
- Auto-download charts for offline use
- Connect to conductor in Follower Mode
- Charts and page turns happen automatically
- See conductor's annotations in real-time
- Keep personal annotations in separate layer
- Auto-fallback to manual control if disconnected
- Receive updated annotations after rehearsal

**Value:** Zero distraction from music. No missed page turns or manual navigation.

---

### Music Teacher

> As an instructor, I want to display and annotate charts in real-time while teaching harmonic concepts.

**Typical Flow:**
- Project Leo on classroom screen
- Open and transpose song to concert pitch
- Draw annotations live (circles, arrows, text)
- Students see annotations in real-time on their devices (follower mode)
- Save annotated chart
- Distribute to students for home review
- Review student-submitted annotations

**Value:** Visual demonstration of abstract concepts with immediate sharing for later study.

---

### Multi-Band Professional

> As a musician in multiple groups, I need organized setlists for each project without mixing arrangements.

**Typical Flow:**
- Maintain separate setlists per band/gig type
- Switch between setlists instantly
- Each setlist has specific transpositions and annotations
- Order songs by set arrangement
- Add per-song notes and cues
- Export setlists with statistics
- Share setlists with other band members

**Value:** Professional organization across multiple contexts with instant switching.

---

## Workflow Stages

### Before (Prep)
- Setlist creation and curation
- Annotations and arrangement notes
- Recording linkage
- Distribution to members (with optional delay)
- Band management and permissions
- Multi-device setup with page offsets

### During (Live)
- Conductor broadcasts page turn events
- Followers auto-respond to events
- Offline/airplane mode support
- Preflight verification
- Real-time annotation sharing
- Temporary pointers for attention
- Metronome and tuner access
- MIDI trigger support
- Multi-screen with offsets
- Fallback to manual on connection loss

### After (Review)
- Annotation updates
- Statistics and analytics
- Text feedback collection
- Setlist archival
- Recording review

---

## Personas Summary

**Current (Implemented):**
- Solo Practitioner - Charts + metronome for practice
- Jam Session Participant - Fast lookup and transposition
- Music Student - Learning and exploration tools
- Cover Band Musician - Multi-style repertoire access

**Future (Planned):**
- Band Leader (Conductor) - Ensemble coordination and control
- Band Member (Follower) - Automated following and sync
- Music Teacher - Live annotation and sharing
- Multi-Band Professional - Organized multi-context workflow

---

See [Requirements](Requirements.md) for detailed specifications and [Technical.md](Technical.md) for architecture.
