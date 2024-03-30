export interface State {
  pdf: any
  setlist: String[]
  songbook: String[]
  playlist: String[]
  song: String
  index: number

  key: String
  style: String
  title: String
  bpm: number
  transpose: number

  annMode: boolean
  pdfUrl: URL
  pdfPages: number // number of pages in the pdf
  pdfPage: number // current page
  pdfLoading: boolean
  menuActive: boolean
  strokeColor: String
  strokeWidth: number
  opacity: number

  query: String
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
