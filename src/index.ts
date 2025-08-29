import m from 'mithril'
import { iRealPage, ExtendiRealClass } from './ireal'
import Metronome from './Metronome'

import { meiosisSetup } from 'meiosis-setup'
import { MeiosisCell, MeiosisViewComponent } from 'meiosis-setup/types'
import { Playlist, iRealRenderer } from 'ireal-renderer'
import '@csstools/normalize.css'
import './styles/root/root.css'
import './styles/root/accessibility.css'

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

export const Leo: MeiosisViewComponent<State> = {
  initial,
  services: [searchService, transposeService, songService],
  view: cell => [
    m('div.ui', [
      Nav(cell, 'setlistActive', 'left', SetlistMenu(cell)),
      Nav(cell, 'debugActive', 'right', DebugNavContent(cell)),
      Controls(cell),
    ]),
    cell.state.currentPage === 'metronome' ? m(Metronome) : iRealPage(cell),
  ],
}

// Initialize Meiosis
const cells = meiosisSetup<State>({ app: Leo })

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
  '/metronome': {
    oninit: () => {
      cells().update({ currentPage: 'metronome' })
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
