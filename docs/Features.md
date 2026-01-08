# Features

Leo is a comprehensive sheet music viewer and practice tool designed for musicians. Here's what Leo can do:

## 🎼 Sheet Music Viewing

### iReal Pro Integration

- **Load Multiple Song Books**: Pre-loaded with thousands of jazz standards, contemporary jazz, pop, gypsy jazz, and dixieland tunes
- **Professional Chord Chart Display**: Clean, readable chord charts with proper musical notation
- **Dynamic Rendering**: Charts render responsively for any screen size
- **Musical Notation**: Full support for:
  - Chord symbols with extensions (maj7, ♯11, ♭9, etc.)
  - Slash chords (C/G, etc.)
  - Section markers (A, B, Coda, etc.)
  - Measure numbers
  - Repeats and endings
  - Bar lines and spacing

### Transposition

- **Real-time Transposition**: Instantly transpose any song to any key
- **Smart Key Display**: Shows both original key and transposition offset
- **Maintains Chart Structure**: All formatting preserved during transposition

### Display Modes

- **Dark Mode**: Easy-on-the-eyes dark theme for low-light environments
- **Light Mode**: Traditional light theme for bright conditions
- **Responsive Layout**: Optimized for desktop, tablet, and mobile devices

## 🔍 Search & Organization

### Powerful Search

- **Full-Text Search**: Search across all song titles and composers
- **Real-time Results**: Instant filtering as you type
- **Smart Matching**: Fuzzy search finds songs even with typos

### Faceted Filtering

Filter the entire song library by:
- **Composer**: See all songs by a specific composer
- **Style**: Jazz, Bebop, Swing, Latin, Blues, Rock, Pop, etc.
- **Key**: Find songs in specific keys
- **Playlist**: Browse by source book

### Song Library

Pre-loaded collections include:
- **Jazz Standards**: Classic Real Book tunes
- **Contemporary Jazz**: Modern jazz compositions
- **Pop Songs**: Popular music arrangements
- **Gypsy Jazz**: Django Reinhardt style
- **Dixieland**: Traditional jazz collections

## 🎵 Metronome

### Professional Metronome with Advanced Features

#### Basic Controls
- **Tempo Range**: 20-300 BPM
- **Play/Pause**: Start and stop from anywhere in the UI
- **Visual Feedback**: Clear indication when metronome is active
- **Background Operation**: Keep metronome running while viewing songs

#### Rhythmic Patterns

Built-in patterns include:
- **Time Signatures**: 4/4, 3/4, 6/8, and more
- **Latin Rhythms**: 3-2 Clave, 2-3 Clave, Bolero
- **Custom Patterns**: Create your own rhythmic patterns

#### Pattern Builder

- **Note Values**: Support for whole notes down to 32nd notes
  - 𝅝 (whole), 𝅗𝅥 (half), ♩ (quarter), ♪ (eighth), 𝅘𝅥𝅯 (sixteenth), 𝅘𝅥𝅯𝅭 (32nd)
  - Including dotted variations (♩., ♪., etc.)
- **Rest Values**: Full range of rests matching note values
  - 𝄻 (whole), 𝄼 (half), 𝄽 (quarter), 𝄾 (eighth), 𝄿 (sixteenth)
- **Pattern Editor**: Visual editor to build custom rhythmic patterns
- **Real-time Preview**: See pattern notation as you build

#### Beat Types

Configure metronome click based on different note values:
- Whole note subdivision
- Half note subdivision
- **Quarter note** (default)
- Eighth note subdivision
- Sixteenth note subdivision

#### Practice Features

- **Random Mute**: Randomly mute beats (0-50% chance) to practice timing
- **Emphasize First Beat**: Distinct click on downbeat (togglable)
- **Visual Sync Offset**: Adjust visual timing to match audio perception (-100ms to +100ms)
- **Active Note Highlighting**: See which beat is currently playing

#### Pattern Management

- **Save Patterns**: Store custom patterns with names
- **Load Patterns**: Quick access to saved patterns
- **Delete Patterns**: Remove patterns you no longer need
- **Persistent Storage**: Patterns saved across sessions

#### Audio Quality

- **Web Audio API**: High-precision timing and clean audio generation
- **Volume Control**: Adjust metronome volume (0-100%)
- **Distinct Tones**: Different frequencies for emphasized vs. regular beats

## 🎹 Navigation & UI

### Sidebar Navigation

- **Setlist Panel**: Left sidebar with search and song list
- **Debug Panel**: Right sidebar for development (can be hidden)
- **Toggle Controls**: Easy show/hide for maximum viewing area
- **Keyboard Shortcuts**: Quick access to common functions

### Transport Controls

- **Transposition Controls**: Up/down arrows to change key
- **Metronome Toggle**: Quick access metronome button
- **Visual Indicators**: Icons show current state (metronome active, etc.)

### Metronome Popup

- **Overlay Design**: Popup doesn't interfere with sheet music viewing
- **Background Operation**: Close popup while metronome continues playing
- **Status Indicators**: Clear indication when playing in background
- **URL Hash Support**: Direct link to metronome via `#metronome`

## 🎨 Customization

### Theme Support

- **Dark Mode**: High-contrast dark theme with carefully chosen colors
- **Light Mode**: Clean, traditional light theme
- **Persistent Preference**: Theme selection saved across sessions
- **CSS Variables**: Consistent color scheme throughout UI

### Display Options

- Debug mode with development tools
- Tracer for state changes (development)
- Customizable font sizes and spacing (via CSS)

## 📱 Cross-Platform

### Browser Support

- Modern Chrome, Firefox, Safari, Edge
- Mobile browsers (iOS Safari, Chrome Mobile)
- Progressive Web App capabilities

### Device Support

- **Desktop**: Full-featured experience with keyboard shortcuts
- **Tablet**: Touch-optimized controls and responsive layout
- **Mobile**: Vertical scrolling optimized for small screens

## 🔧 Developer Features

### CLI Integration

- `leo quickstart` - One command to get started
- `leo test` - Run full test suite
- `leo build` - Production build
- All dependencies managed automatically

### Testing

- **Playwright Tests**: E2E tests for all major features
  - Accessibility tests
  - Metronome functionality
  - Core rendering
  - Layout responsiveness
- **Python Tests**: Backend API and CLI tests
- **Test Coverage**: Core features well-tested

### Extensibility

- TypeScript for type safety
- Modular component architecture
- Service-based design (MetronomeService, searchService, etc.)
- Clear separation between UI and business logic

## 🚧 Planned Features

Future enhancements in development (see [Requirements](Requirements.md) and [User Stories](User%20Stories.md)):

### Collaboration Features

- **Conductor/Follower Mode**: Band leader controls page turns for all followers
- **Real-time Sync**: All band members see the same page simultaneously
- **Event Broadcasting**: Page turns, annotations, tempo changes
- **Band Management**: Assign roles and manage permissions

### Annotation System

- **Handwritten Notes**: Draw on sheet music with touch or mouse
- **Text Comments**: Add typed notes and reminders
- **Annotation Sync**: Share markup with band members
- **Persistent Storage**: Save annotations per song

### Additional Tools

- **Tuner**: Built-in chromatic tuner
- **File Type Converter**: Convert between formats
- **Recording Integration**: Link audio recordings to charts
- **MIDI Support**: Trigger events via MIDI

### Enhanced Setlist Features

- **Setlist Builder**: Create and manage multiple setlists
- **Drag & Drop**: Reorder songs easily
- **Bookmarks**: Quick access to frequently used songs
- **Practice Mode**: Track which songs need work

## 💡 Use Cases

Leo is designed for:

- **Jazz Musicians**: Quick access to thousands of standards
- **Practice Sessions**: Use metronome with custom patterns
- **Jam Sessions**: Fast search and transposition
- **Learning New Songs**: Study chord progressions
- **Live Performance**: Quick song lookup (solo or band)
- **Teaching**: Display charts for students
- **Composition**: Study song structures and progressions

## 🌟 What Makes Leo Different

- **Musician-Focused**: Built by musicians for musicians
- **Fast & Lightweight**: Instant load times, smooth performance
- **Works Offline**: No internet required after initial load
- **Open Source**: Free and community-driven
- **Modern Architecture**: Built with current web standards
- **Active Development**: Regular updates and improvements