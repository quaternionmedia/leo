import m from 'mithril'
// var Viewer = require('./Viewer')
// import { Nav } from './Nav'
// import Annotation from './Annotation'
import { Controls } from './Control'
import { SetlistMenu } from './Setlist'
import { State } from './State'
import { IReal } from './ireal'
import { Title } from './Title'
import meiosisTracer from 'meiosis-tracer'
import { meiosisSetup } from 'meiosis-setup'
import ireal from './static/jazz.ireal'
import { Playlist, iRealRenderer } from 'ireal-renderer'
import Fuse from 'fuse.js'

import './styles.css'


export const playlist = new Playlist(ireal)
playlist.songs = playlist.songs.slice(0, 500)
let setlist = playlist.songs.map(s => s.title)
let renderer= new iRealRenderer()

const fuse = new Fuse(playlist.songs, {
  keys: ['title', 'composer'],
  threshold: 0.3,
  // includeScore: true,
})

const initial: State = {
  setlist,
  // setlist: ['asdf'],
  song: playlist.songs[0],
  menuActive: true,
  renderer,
  transpose: 0,
  fuse,
  query: '',
}


export const Leo = {
  initial,
  services: [],
  view: cell => [
    SetlistMenu(cell),
    Controls(cell),
    m('#page', [Title(cell), m(IReal(cell))]),
    // Nav(cell),
    // m(
    //   '#main.page',
    //   {
    //     style: {
    //       marginLeft: cell.state.menuActive ? '250px' : '0',
    //     },
    //   }
    //   // [m('#anndiv', Annotation(cell)), m(Viewer)]
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
})

// Debug

meiosisTracer({
  selector: '#tracer',
  rows: 25,
  streams: [cells],
})

window.cells = cells

// actions.loadiReal('/ireal')

console.log('sup!')
