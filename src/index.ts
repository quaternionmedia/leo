import m from 'mithril'
import { iRealPage, ExtendiRealClass } from './ireal'
import Metronome from './Metronome'

import { meiosisSetup } from 'meiosis-setup'
import { MeiosisCell, MeiosisViewComponent } from 'meiosis-setup/types'
import { Playlist, iRealRenderer } from 'ireal-renderer'
import '@csstools/normalize.css'
import './styles/root/root.css'
import './styles/root/accessibility.css'
import './styles/metronome-popup.css'

// var Viewer = require('./Viewer')
// import { Nav } from './Nav'
// import Annotation from './Annotation'
import { Controls, transposeService } from './Control'
import { SetlistMenu } from './Setlist'
import { DebugNavContent, Tracer } from './components/debug/Debug'
import { State } from './State'
import { Nav } from './components/navigation/nav'
import './styles/screens.css'
import itemsjs from 'itemsjs'
import { songs } from './books'

let renderer = new iRealRenderer()

const search = itemsjs(songs, {
  aggregations: {
    composer: {
      title: 'Composer',
      conjunction: false,
    },
    style: {
      title: 'Style',
      conjunction: false,
    },
    key: {
      title: 'Key',
      conjunction: false,
    },
    playlist: {
      title: 'Playlist',
      conjunction: false,
    },
  },
  sorting: {
    title_asc: {
      field: 'title',
      order: 'asc',
    },
  },
  searchableFields: ['title', 'composer'],
})

const initial: State = {
  song: null,
  key: null,
  index: 0,
  setlistActive: false,
  currentPage: 'song', // 'song' | 'metronome'
  metronomeOpen: false, // New state for popup
  debug: {
    menu: false,
    darkMode: false,
    tracer: false,
    color: false,
  },
  renderer,
  darkMode: true,
  transpose: 0,
  search_options: {
    query: '',
    per_page: -1,
    page: 1,
    sort: 'title_asc',
    filters: {},
  },
  results: search.search(),
  search,
}

export const searchService = {
  onchange: state => state.search_options,
  run: ({ state, update }) => {
    update({
      results: state.search.search(state.search_options),
    })
  },
}

export const songService = {
  onchange: state => state.song,
  run: ({ state, update }) => {
    console.log('song service', state.song, m.route.get())
    let song = state.song
    if (!song) {
      return
    }
    let titles = state.results.data.items.map(s => s.title)
    let index = titles.indexOf(song.title)
    m.route.set(`/:playlist/:title`, {
      playlist: song.playlist,
      title: song.title,
    })

    update({ key: song?.key, transpose: 0, setlistActive: false, index })
  },
}

export const hashService = {
  onchange: state => state.metronomeOpen,
  run: ({ state, update }) => {
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
  services: [searchService, transposeService, songService, hashService],
  view: cell => [
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
                // Close popup when clicking overlay background
                if (e.target.classList.contains('metronome-overlay')) {
                  cell.update({ metronomeOpen: false })
                }
              },
            },
            [
              m('div.metronome-popup', [
                m('div.metronome-header', [
                  m('h2', 'Metronome'),
                  m(
                    'button.close-btn',
                    {
                      onclick: () => cell.update({ metronomeOpen: false }),
                      title: 'Close metronome',
                    },
                    '×'
                  ),
                ]),
                m('div.metronome-content', [m(Metronome)]),
              ]),
            ]
          ),
        ]
      : null,
  ],
}

// Initialize Meiosis
const cells = meiosisSetup<State>({ app: Leo })

// Handle hash changes for metronome popup
const handleHashChange = () => {
  const isMetronomeHash = window.location.hash === '#metronome'
  const currentState = cells().state.metronomeOpen

  if (isMetronomeHash && !currentState) {
    cells().update({ metronomeOpen: true })
  } else if (!isMetronomeHash && currentState) {
    cells().update({ metronomeOpen: false })
  }
}

// Listen for hash changes
window.addEventListener('hashchange', handleHashChange)
// Check initial hash state
handleHashChange()

m.route(document.getElementById('app'), '/:playlist/:title', {
  '/:playlist/:title': {
    oninit: vnode => {
      console.log('init route', vnode)
      let title = vnode.attrs.title
      let playlist = vnode.attrs.playlist
      let song = songs.find(s => s.title === title && s.playlist === playlist)
      console.log('url song', song)
      if (!song) {
        console.log('no song found. Picking random song')
        song = songs[Math.floor(Math.random() * songs.length)]
      }
      cells().update({ song, currentPage: 'song' })
    },
    view: () => Leo.view(cells()),
  },
})

cells.map(state => {
  //   console.log('cells', state)

  //   Persist state to local storage
  //   localStorage.setItem('meiosis', JSON.stringify(state))
  m.redraw()

  // Run on initial load
  adjustForURLBar()
})

declare global {
  interface Window {
    cells: any
  }
}
window.cells = cells
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
