import { Song } from 'ireal-renderer-tiny'

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

type SearchOptions = {
  query: string
  per_page: number
  page: number
  sort: string
  filters: Object
  // filter: function
  // filters_query: Object
  // is_all_filtered_items: boolean
}

export interface State {
  pdf?: any
  setlist?: String[]
  songbook?: String[]
  playlist?: String[]
  song: Song
  index?: number
  renderer: any
  darkMode?: boolean
  debug?: DebugOptions

  key: String
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

  fuse: any
  search_options: SearchOptions
  results: any[]
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
