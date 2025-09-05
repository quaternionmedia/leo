import m from 'mithril'
import { iRealPage, ExtendiRealClass } from './ireal'
import MetronomeView from './MetronomeView'
import { metronomeService } from './MetronomeService'

import { meiosisSetup } from 'meiosis-setup'
import { MeiosisCell, MeiosisViewComponent } from 'meiosis-setup/types'
import { render, list, iRealRenderer } from 'ireal-renderer'
import '@csstools/normalize.css'
import './styles/root/root.css'
import './styles/root/accessibility.css'
import './styles/metronome-popup.css'

// var Viewer = require('./Viewer')
// import { Nav } from './Nav'
// import Annotation from './Annotation'
import { Controls, transposeService } from './Control'
import { SetlistMenu } from './Setlist'
import { SetlistEditor, initializeSetlists } from './SetlistEditor'
import { DebugNavContent, Tracer } from './components/debug/Debug'
import { State } from './State'
import { Nav } from './components/navigation/nav'
import './styles/screens.css'
import { songs } from './books'

let renderer = new iRealRenderer()

// Initialize metronome service with state callback
const initializeMetronomeService = (cells: any) => {
  metronomeService.setStateChangeCallback((isPlaying: boolean) => {
    cells().update({ metronomeActive: isPlaying })
  })

  // Add pattern change callback to update UI when pattern changes
  metronomeService.setPatternChangeCallback(() => {
    // Force redraw to update the pattern representation in the button
    m.redraw()
  })

  // Add note change callback for rhythm highlighting during playback
  metronomeService.setNoteChangeCallback(() => {
    m.redraw()
  })
}

const initial: State = {
  song: null,
  key: null,
  index: 0,
  setlistActive: false,
  currentPage: 'song', // 'song' | 'metronome' | 'setlist-editor'
  metronomeOpen: false, // New state for popup
  metronomeActive: false, // New state for metronome running in background

  // Setlist management state
  setlists: [],
  currentSetlist: undefined,
  setlistEditorMode: 'create',

  debug: {
    menu: false,
    darkMode: false,
    tracer: false,
    color: false,
  },
  renderer,
  darkMode: true,
  transpose: 0,
}

export const hashService = {
  onchange: state => state.metronomeOpen,
  run: ({ state, update }) => {
    // Only update hash for metronome when not on setlist editor page
    if (state.currentPage === 'setlist-editor') {
      return
    }

    // Update URL hash based on metronome state
    if (state.metronomeOpen) {
      if (window.location.hash !== '#metronome') {
        window.location.hash = '#metronome'
      }
    } else {
      if (window.location.hash === '#metronome') {
        window.location.hash = ''
      }
    }
  },
}

export const Leo: MeiosisViewComponent<State> = {
  initial,
  services: [transposeService, hashService],
  view: cell => {
    console.log('Leo.view called with currentPage:', cell.state.currentPage)

    // Handle setlist editor page
    if (cell.state.currentPage === 'setlist-editor') {
      console.log('Rendering SetlistEditor component')
      return m('div.app-container', [
        m('div.ui', [
          Nav(cell, 'debugActive', 'right', DebugNavContent(cell)),
          Controls(cell),
        ]),
        SetlistEditor(cell),
      ])
    }

    console.log('Rendering default view (song page)')
    return [
      m('div.ui', [
        Nav(cell, 'setlistActive', 'left', SetlistMenu(cell)),
        Nav(cell, 'debugActive', 'right', DebugNavContent(cell)),
        Controls(cell),
      ]),
      // Always show the main iReal page
      iRealPage(cell),
      // Show metronome as popup overlay when metronomeOpen is true
      cell.state.metronomeOpen
        ? [
            m(
              'div.metronome-overlay',
              {
                onclick: e => {
                  // Close popup when clicking overlay background (keeps metronome playing)
                  if (e.target.classList.contains('metronome-overlay')) {
                    cell.update({ metronomeOpen: false })
                  }
                },
              },
              [
                m('div.metronome-popup', [
                  m('div.metronome-header', [
                    m('div.metronome-title', [
                      m('h2', 'Metronome'),
                      cell.state.metronomeActive
                        ? m('span.status-indicator', 'Playing in background')
                        : null,
                    ]),
                    m(
                      'button.close-btn',
                      {
                        onclick: () => {
                          // Just close the popup, don't stop the metronome
                          cell.update({ metronomeOpen: false })
                        },
                        title: 'Close metronome (keeps playing in background)',
                      },
                      '×'
                    ),
                  ]),
                  m('div.metronome-content', [
                    // Use the MetronomeView that connects to the persistent service
                    m(MetronomeView, {
                      onStateChange: (isPlaying: boolean) => {
                        cell.update({ metronomeActive: isPlaying })
                      },
                    }),
                  ]),
                ]),
              ]
            ),
          ]
        : null,
    ]
  },
}

// Initialize Meiosis
const cells = meiosisSetup<State>({ app: Leo })

// Initialize the metronome service with state callback
initializeMetronomeService(cells)

// Handle hash changes for metronome popup and setlist editor navigation
const handleHashChange = () => {
  const hash = window.location.hash.substring(1) // Remove the # symbol
  const isMetronomeHash = hash === 'metronome'
  const currentState = cells().state

  if (isMetronomeHash && !currentState.metronomeOpen) {
    cells().update({ metronomeOpen: true })
  } else if (!isMetronomeHash && currentState.metronomeOpen) {
    cells().update({ metronomeOpen: false })
  }

  // Handle setlist editor hash navigation - only if we're on the setlist page
  if (
    hash.startsWith('setlists') &&
    currentState.currentPage === 'setlist-editor'
  ) {
    handleSetlistHashNavigation(hash)
  }
}

// Handle setlist-specific hash navigation
const handleSetlistHashNavigation = (hash: string) => {
  const parts = hash.split('/')
  const currentState = cells().state

  // setlists
  if (parts.length === 1) {
    cells().update({
      setlistEditorMode: 'edit',
      currentSetlist: undefined,
      editingSong: undefined,
      setlistEditorPath: ['Setlist Manager'],
    })
  }
  // setlists/create
  else if (parts.length === 2 && parts[1] === 'create') {
    cells().update({
      setlistEditorMode: 'create',
      currentSetlist: undefined,
      editingSong: undefined,
      setlistEditorPath: ['Setlist Manager', 'Create New Setlist'],
    })
  }
  // setlists/create-song
  else if (parts.length === 2 && parts[1] === 'create-song') {
    cells().update({
      setlistEditorMode: 'create-song',
      currentSetlist: undefined,
      editingSong: undefined,
      setlistEditorPath: ['Setlist Manager', 'Create New Song'],
    })
  }
  // setlists/edit-song/{songTitle} (global song editing)
  else if (parts.length === 3 && parts[1] === 'edit-song') {
    const songTitle = decodeURIComponent(parts[2])
    const song = songs.find((s: any) => s.title === songTitle)

    if (song) {
      cells().update({
        setlistEditorMode: 'edit-song',
        currentSetlist: undefined,
        editingSong: song,
        setlistEditorPath: ['Setlist Manager', `Edit: ${(song as any).title}`],
      })
    }
  }
  // setlists/{setlistId}
  else if (parts.length === 2) {
    const setlistId = parts[1]
    const setlist = currentState.setlists.find(s => s.id === setlistId)
    if (setlist) {
      cells().update({
        setlistEditorMode: 'edit',
        currentSetlist: setlist,
        editingSong: undefined,
        setlistEditorPath: ['Setlist Manager', setlist.name],
      })
    }
  }
  // setlists/{setlistId}/create-song
  else if (parts.length === 3 && parts[2] === 'create-song') {
    const setlistId = parts[1]
    const setlist = currentState.setlists.find(s => s.id === setlistId)
    if (setlist) {
      cells().update({
        setlistEditorMode: 'create-song',
        currentSetlist: setlist,
        editingSong: undefined,
        setlistEditorPath: ['Setlist Manager', setlist.name, 'Create New Song'],
      })
    }
  }
  // setlists/{setlistId}/edit-song/{songTitle}
  else if (parts.length === 4 && parts[2] === 'edit-song') {
    const setlistId = parts[1]
    const songTitle = decodeURIComponent(parts[3])
    const setlist = currentState.setlists.find(s => s.id === setlistId)

    if (setlist) {
      // Find the song in the setlist or global songs
      const song =
        setlist.songs.find(s => s.title === songTitle) ||
        songs.find((s: any) => s.title === songTitle)

      if (song) {
        cells().update({
          setlistEditorMode: 'edit-song',
          currentSetlist: setlist,
          editingSong: song,
          setlistEditorPath: [
            'Setlist Manager',
            setlist.name,
            `Edit: ${song.title}`,
          ],
        })
      }
    }
  }
}

// Listen for hash changes
window.addEventListener('hashchange', handleHashChange)
// Check initial hash state
handleHashChange()

const appElement = document.getElementById('app')
console.log('App element:', appElement)

// Ensure songs are loaded before routing
console.log('Available songs:', songs.length)

// Pick a random song for the default route
const getRandomSong = () => {
  if (songs.length === 0) return null
  return songs[Math.floor(Math.random() * songs.length)] as any
}

const defaultSong = getRandomSong()
const defaultRoute = defaultSong
  ? `/song/${encodeURIComponent(
      defaultSong.title
    )}?playlist=${encodeURIComponent(defaultSong.playlist)}`
  : '/setlists'

console.log(
  'Random default song:',
  defaultSong?.title,
  'from playlist:',
  defaultSong?.playlist
)
console.log('Default route:', defaultRoute)
console.log(
  'URL will be:',
  window.location.origin + window.location.pathname + '#!' + defaultRoute
)

m.route(appElement, defaultRoute, {
  '/setlists': {
    oninit: () => {
      console.log('=== SETLISTS ROUTE MATCHED ===')
      console.log('init setlists route')
      // Initialize setlists from localStorage
      initializeSetlists(cells())
    },
    render: () => {
      console.log('Rendering setlists route')
      console.log('Current state before update:', cells().state.currentPage)

      // Initialize setlists from localStorage if not already done
      if (cells().state.setlists.length === 0) {
        console.log('Initializing setlists from localStorage')
        initializeSetlists(cells())
      }

      // Ensure we're in setlist editor mode
      if (cells().state.currentPage !== 'setlist-editor') {
        console.log('Setting currentPage to setlist-editor in render')
        cells().update({
          currentPage: 'setlist-editor',
          setlistEditorPath: ['Setlist Manager'],
          setlistEditorMode: 'create',
          currentSetlist: undefined,
        })
      }

      console.log('Current state after update:', cells().state.currentPage)
      return m('.app-container', Leo.view(cells()))
    },
  },
  '/song/:title': {
    oninit: (vnode: any) => {
      try {
        console.log('=== SONG ROUTE MATCHED ===')
        console.log('SONG ROUTE: oninit called!', vnode)
        console.log('SONG ROUTE: Current URL:', window.location.href)
        console.log('SONG ROUTE: vnode.attrs:', vnode.attrs)

        let title = decodeURIComponent(vnode.attrs.title || '')
        let playlist = decodeURIComponent(m.route.param('playlist') || '')
        console.log('SONG ROUTE: playlist:', playlist, 'title:', title)

        // Don't process if this is actually the setlists route
        if (playlist === 'setlists' || !title) {
          console.log(
            'SONG ROUTE: Skipping because playlist is setlists or no title'
          )
          return
        }

        let song = songs.find(
          (s: any) => s.title === title && s.playlist === playlist
        )
        console.log('url song', song)
        if (!song) {
          console.log('no song found. Picking random song')
          song = songs[Math.floor(Math.random() * songs.length)]
          // Update the URL to reflect the actual song we picked
          if (song) {
            m.route.set(
              `/song/${encodeURIComponent(
                (song as any).title
              )}?playlist=${encodeURIComponent((song as any).playlist)}`,
              null,
              { replace: true }
            )
          }
          return
        }

        // Update all song-related state at once
        console.log('SONG ROUTE: Setting song state:', (song as any)?.title)
        cells().update({
          song,
          currentPage: 'song',
          key: (song as any)?.key || null,
          transpose: 0,
          setlistActive: false,
          index: 0,
        })
        console.log(
          'SONG ROUTE: State after update:',
          cells().state.song?.title
        )
        console.log('SONG ROUTE: Full state after update:', cells().state)

        // Force a redraw to ensure components update
        m.redraw()
      } catch (error) {
        console.error('SONG ROUTE: Error in oninit:', error)
      }
    },
    render: (vnode: any) => {
      console.log('Rendering song route')

      // Extract song info from route
      let title = decodeURIComponent(vnode.attrs.title || '')
      let playlist = decodeURIComponent(m.route.param('playlist') || '')
      console.log('SONG RENDER: playlist:', playlist, 'title:', title)

      // Check if we need to set the song
      const currentSong = cells().state.song
      if (
        !currentSong ||
        currentSong.title !== title ||
        currentSong.playlist !== playlist
      ) {
        console.log('SONG RENDER: Need to set song state')

        let song = songs.find(
          (s: any) => s.title === title && s.playlist === playlist
        )

        if (song) {
          console.log('SONG RENDER: Setting song state:', title)
          cells().update({
            song,
            currentPage: 'song',
            key: (song as any)?.key || null,
            transpose: 0,
            setlistActive: false,
            index: 0,
          })
        } else {
          console.log(
            'SONG RENDER: Song not found:',
            title,
            'in playlist:',
            playlist
          )
        }
      }

      return m('.app-container', Leo.view(cells()))
    },
  },
})

// Subscribe to state changes - wrap in try-catch to debug
try {
  cells.map(state => {
    //   console.log('cells', state)

    //   Persist state to local storage
    //   localStorage.setItem('meiosis', JSON.stringify(state))
    m.redraw()

    // Run on initial load
    adjustForURLBar()
  })
} catch (error) {
  console.error('Error in cells.map:', error)
  console.error('cells object:', cells)
}

declare global {
  interface Window {
    cells: any
    songs: any
    m: any
  }
}
window.cells = cells
window.songs = songs
window.m = m

function adjustForURLBar() {
  // Set a CSS variable on the root element with the current viewport
  document.documentElement.style.setProperty(
    '--vh',
    `${window.innerHeight * 0.01}px`
  )
  document.documentElement.style.setProperty(
    '--vw',
    `${window.innerWidth * 0.01}px`
  )
}

// Consider running on resize or orientation change
// events to adjust when the URL bar is shown/hidden
window.addEventListener('resize', adjustForURLBar)

// Debug
Tracer(cells)

// actions.loadiReal('/ireal')
console.log('sup!')
