import m from 'mithril'
// var Viewer = require('./Viewer')
// import { Nav } from './Nav'
// import Annotation from './Annotation'
import { Controls } from './Control'
import { Setlist } from './Setlist'
import { State } from './State'
import { IReal } from './ireal'
import { Title } from './Title'
import meiosisTracer from 'meiosis-tracer'
import { meiosisSetup } from 'meiosis-setup'
import ireal from './static/jazz.ireal'
import { Playlist, iRealRenderer } from 'ireal-renderer'

import './styles.css'


let playlist =new Playlist(ireal)
let songbook =playlist.songs.map(s => s.title)
let renderer= new iRealRenderer(playlist)


const initial: State = {
  setlist: songbook,
  // setlist: ['asdf'],
  song: playlist.songs[0],
  menuActive: true,
  playlist,
  renderer,
  transpose: 0,
}


export const Leo = {
  initial,
  services: [],
  view: cell => [
    Setlist(cell),
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
