import m from 'mithril'
import { KEYS_FLAT, KEYS_SHARP } from './State'
import { Directions } from './State'
import { metronomeService } from './MetronomeService'
import './styles/control.css'


export function mod(n, m) {
  return ((n % m) + m) % m
}

export const transposeService = {
  onchange: state => state.transpose,
  run: ({ state, update }) => {
    let key = state.key
    if (!key) return
    if (state.transpose == 0) update({ key })
    let minor = key.endsWith('-') ? '-' : ''
    key = key.replace('-', '')
    let index = KEYS_FLAT.indexOf(key) || KEYS_SHARP.indexOf(key)
    let t = mod(index + state.transpose, 12)
    update({
      key:
        state.transposeDirection == Directions.UP
          ? KEYS_SHARP[t] + minor
          : KEYS_FLAT[t] + minor,
    })
  },
}

export const TransposeUp = ({ getState, update }) =>
  m(
    'button.control__transpose-up.control__transpose',
    {
      onclick: () => {
        update({
          transpose: getState().transpose + 1,
          transposeDirection: Directions.UP,
        })
      },
    },
    '▲'
  )

export const TransposeDown = ({ getState, update }) =>
  m(
    'button.control__transpose-down.control__transpose',
    {
      onclick: () => {
        update({
          transpose: getState().transpose - 1,
          transposeDirection: Directions.DOWN,
        })
      },
    },
    '▼'
  )

export const TransposeReset = ({ state: { transpose }, update }) =>
  m(
    'button.control__reset.control__transpose',
    { onclick: () => update({ transpose: 0 }) },
    `🔁`
  )

export const NextSong = ({ state, update, getState }) => {
  const songs = window.songs || []
  return m(
    'button.setlist__header__random',
    {
      disabled: songs.length === 0,
      onclick: () => {
        let state = getState()
        // Check if there are any songs
        if (songs.length === 0) {
          return
        }
        
        // Find current song index
        let currentIndex = 0
        if (state.song) {
          currentIndex = songs.findIndex(
            s => s.title === state.song.title && s.playlist === state.song.playlist
          )
          if (currentIndex === -1) currentIndex = 0
        }
        
        update({
          song: songs[mod(currentIndex + 1, songs.length)],
          index: mod(currentIndex + 1, songs.length)
        })
      },
    },
    '>'
  )
}

export const PrevSong = ({ state, getState, update }) => {
  const songs = window.songs || []
  return m(
    'button.setlist__header__random',
    {
      disabled: songs.length === 0,
      onclick: () => {
        let state = getState()
        // Check if there are any songs
        if (songs.length === 0) {
          return
        }
        
        // Find current song index
        let currentIndex = 0
        if (state.song) {
          currentIndex = songs.findIndex(
            s => s.title === state.song.title && s.playlist === state.song.playlist
          )
          if (currentIndex === -1) currentIndex = 0
        }
        
        update({
          song: songs[mod(currentIndex - 1, songs.length)],
          index: mod(currentIndex - 1, songs.length)
        })
      },
    },
    '<'
  )
}
export const MetronomeToggle = ({ state, update }) => {
  const patternNotes = metronomeService.getPatternRepresentationWithHighlight()
  
  return m(
    'button.metronome-toggle',
    {
      class: state.metronomeActive ? 'active' : '',
      onclick: (e) => {
        e.preventDefault()
        e.stopPropagation()
        update({ metronomeOpen: !state.metronomeOpen })
      },
      title: state.metronomeActive ? 'Metronome is playing (click to open)' : 'Open metronome',
      type: 'button'
    },
    patternNotes.map((note, index) => 
      m('span.pattern-note', {
        key: index,
        class: note.isActive ? 'active' : ''
      }, note.symbol)
    )
  )
}

export const MetronomePlayPause = ({ state, update }) =>
  m(
    'button.metronome-play-pause',
    {
      class: state.metronomeActive ? 'active' : '',
      onclick: (e) => {
        e.preventDefault()
        e.stopPropagation()
        // Toggle play/pause
        metronomeService.toggle()
      },
      title: state.metronomeActive 
        ? 'Pause metronome' 
        : 'Start metronome',
      type: 'button'
    },
    state.metronomeActive ? '⏸' : '▶'
  )

export const RandomSong = ({ state, update, getState }) => {
  const songs = window.songs || []
  
  return m(
    'button.control__random',
    {
      disabled: songs.length === 0,
      onclick: () => {
        // Check if there are any songs
        if (songs.length === 0) {
          return
        }
        const randomIndex = Math.floor(Math.random() * songs.length)
        const randomSong = songs[randomIndex]
        
        // Update song and navigate to it
        update({ song: randomSong })
        // Also update the URL to match the new song
        m.route.set(`/${randomSong.playlist}/${randomSong.title}`)
      },
      title: 'Random song',
    },
    '🎲'
  )
}

export const SetlistEditorLink = ({ state, update }) =>
  m(
    'button.control__setlist-editor',
    {
      class: state.currentPage === 'setlist-editor' ? 'active' : '',
      onclick: () => {
        // Navigate to setlist editor
        m.route.set('/setlists')
      },
      title: 'Setlist Manager',
    },
    '📝'
  )

export const Controls = cell =>
  m('.control', {}, [
    m('.nav-controls', [
      SetlistEditorLink(cell),
    ]),
    m('.main-controls', [
      RandomSong(cell),
      PrevSong(cell),
      TransposeUp(cell),
      TransposeReset(cell),
      TransposeDown(cell),
      NextSong(cell),
    ]),
    m('.metronome-controls', [
      MetronomePlayPause(cell),
      MetronomeToggle(cell),
    ])
  ])
