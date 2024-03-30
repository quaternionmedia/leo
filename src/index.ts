import m from 'mithril'
// var Viewer = require('./Viewer')
// import { Nav } from './Nav'
// import Annotation from './Annotation'
import { Controls, transposeService } from './Control'
import { SetlistMenu } from './Setlist'
import { State } from './State'
import { iRealPage } from './ireal'
import meiosisTracer from 'meiosis-tracer'
import { meiosisSetup } from 'meiosis-setup'
import ireal from './static/jazz.ireal'
import { Playlist, iRealRenderer } from 'ireal-renderer'
import Fuse from 'fuse.js'

import './styles.css'


export const playlist = new Playlist(ireal)
let renderer= new iRealRenderer()

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
  menuActive: true,
  renderer,
  transpose: 0,
  fuse,
  query: '',
  search_results: playlist.songs, 
}

export const searchService = {
  onchange: state => state.query,
  run: ({state, update}) => {
    if (state.query === '') {
      return update({search_results: playlist.songs})
    }
    update({search_results: state.fuse.search(state.query).map(s=>s.item)})
  }
}


export const Leo = {
  initial,
  services: [searchService, transposeService],
  view: cell => [
    SetlistMenu(cell),
    Controls(cell),
    iRealPage(cell),
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
  width: '100%',
  streams: [{stream:cells, hide:true, label: 'Leo'}]})

window.cells = cells

// actions.loadiReal('/ireal')

console.log('sup!')
