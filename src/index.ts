import m from 'mithril'
import Fuse from 'fuse.js'
import { iRealPage, ExtendiRealClass } from './ireal'
import ireal from './static/jazz.ireal'
import { meiosisSetup } from 'meiosis-setup'
import { Playlist, iRealRenderer } from 'ireal-renderer'

// var Viewer = require('./Viewer')
// import { Nav } from './Nav'
// import Annotation from './Annotation'
import { Controls, transposeService } from './Control'
import { SetlistNav } from './Setlist'
import { DebugNavContent, Tracer } from './components/debug/Debug'
import { State } from './State'
import { Nav } from './components/navigation/nav'
import './styles/screens.css'

export const playlist = new Playlist(ireal)
let renderer = new iRealRenderer()

const fuse = new Fuse(playlist.songs, {
  keys: ['title', 'composer'],
  threshold: 0.3,
  // includeScore: true,
})

const initial: State = {
  // playlist,
  // setlist,
  song: playlist.songs[0],
  key: playlist.songs[0].key,
  setlistActive: false,
  debugActive: false,
  renderer: renderer,
  darkMode: true,
  transpose: 0,
  fuse: fuse,
  query: '',
  search_results: playlist.songs,
}

export const searchService = {
  onchange: state => state.query,
  run: ({ state, update }) => {
    if (state.query === '') {
      return update({ search_results: playlist.songs })
    }
    update({
      search_results: state.fuse.search(state.query).map(s => s.item),
    })
  },
}

export const songService = {
  onchange: state => state.song,
  run: ({ state, update }) => {
    let song = state.song
    update({ key: song.key, transpose: 0 })
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
