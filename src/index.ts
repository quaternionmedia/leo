import m from 'mithril'
import { iRealPage, ExtendiRealClass } from './ireal'

import { meiosisSetup } from 'meiosis-setup'
import { Playlist, iRealRenderer } from 'ireal-renderer'
import '@csstools/normalize.css'
import './styles/root/root.css'
import './styles/root/accessibility.css'

// var Viewer = require('./Viewer')
// import { Nav } from './Nav'
// import Annotation from './Annotation'
import { Controls, transposeService } from './Control'
import { SetlistNav } from './Setlist'
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
    },
    style: {
      title: 'Style',
    },
    key: {
      title: 'Key',
    },
    playlist: {
      title: 'Playlist',
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
  song: songs[0],
  key: songs[0].key,
  index: 0,
  setlistActive: false,
  debug: {
    menu: false,
    darkMode: false,
    tracer: false,
    color: false,
  },
  renderer,
  darkMode: true,
  transpose: 0,
  query: '',
  results: search.search(),
  search,
}

export const searchService = {
  onchange: state => state.query,
  run: ({ state, update }) => {
    update({
      results: state.search.search({ query: state.query, per_page: 999 }),
    })
  },
}

export const songService = {
  onchange: state => state.song,
  run: ({ state, update }) => {
    let song = state.song
    let titles = state.results.data.items.map(s => s.title)
    let index = titles.indexOf(song.title)
    update({ key: song?.key, transpose: 0, setlistActive: false, index })
  },
}

export const Leo = {
  initial,
  services: [searchService, transposeService, songService],
  onload: state => {
    // Extend iReal classes
    ExtendiRealClass()
  },
  view: cell => [
    m('div.ui', [
      Nav(cell, 'setlistActive', 'left', SetlistNav(cell)),
      Nav(cell, 'debugActive', 'right', DebugNavContent(cell)),
      Controls(cell),
    ]),
    iRealPage(cell),
    // Nav(cell),
    // m(
    //   '.main.page',
    //   {
    //     style: {
    //       marginLeft: cell.state.menuActive ? '250px' : '0',
    //     },
    //   }
    //   // [m('.anndiv', Annotation(cell)), m(Viewer)]
    // ),
  ],
}

// Initialize Meiosis
const cells = meiosisSetup<State>({ app: Leo })

m.mount(document.getElementById('app'), {
  view: () => Leo.view(cells()),
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
