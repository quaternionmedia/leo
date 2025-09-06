export interface Song {
  title: string
  composer: string
  style: string
  key: string
  playlist: string
  tempo?: number // BPM (beats per minute)
  songText?: string // Lyrics, chord progressions, or any song text content
  // iRealb specific properties
  music?: string // The actual chord progression/music data in iRealb format
  bpm?: number // Tempo in iRealb format
  repeats?: number
  time?: string // Time signature
  // Add other properties as needed
}

export enum Directions {
  UP,
  DOWN,
}

export interface DebugOptions {
  menu?: boolean
  darkMode?: boolean
  color?: boolean
  tracer?: boolean
}

export interface SetlistState {
  name: string
  id: string
  songs: Song[]
  createdAt: string
  updatedAt: string
}

export interface State {
  pdf?: any
  setlist?: String[]
  songbook?: String[]
  playlist?: String[]
  song: Song | null
  index?: number
  renderer: any
  darkMode?: boolean
  debug?: DebugOptions
  currentPage?: 'song' | 'metronome' | 'setlist-editor'
  metronomeOpen?: boolean // New state for popup
  metronomeActive?: boolean // New state for metronome running in background

  // Setlist management state
  setlists: SetlistState[]
  currentSetlist?: SetlistState
  setlistEditorMode?: 'create' | 'edit' | 'create-song' | 'edit-song'
  editingSong?: Song
  setlistEditorPath?: string[] // Breadcrumb path for setlist editor navigation

  // Playlist filtering state
  selectedPlaylists?: string[] // Which playlists are currently enabled/selected
  playlistFilterOpen?: boolean // Whether the playlist filter dropdown is open

  key: String | null
  style?: String
  title?: String
  bpm?: number
  transpose: number
  transposeDirection?: Directions

  annMode?: boolean
  pdfUrl?: URL
  pdfPages?: number // number of pages in the pdf
  pdfPage?: number // current page
  pdfLoading?: boolean
  setlistActive?: boolean
  strokeColor?: String
  strokeWidth?: number
  opacity?: number
}

export const KEYS_FLAT = [
  'C',
  'Db',
  'D',
  'Eb',
  'E',
  'F',
  'Gb',
  'G',
  'Ab',
  'A',
  'Bb',
  'B',
]
export const KEYS_SHARP = [
  'C',
  'C#',
  'D',
  'D#',
  'E',
  'F',
  'F#',
  'G',
  'G#',
  'A',
  'A#',
  'B',
]
