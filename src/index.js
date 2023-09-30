import m from 'mithril'
// var Viewer = require('./Viewer')
var Nav = require('./Nav')
// import Annotation from './Annotation'
// var Control = require('./Control')
import {Setlist} from './Setlist'
import { State } from './State'
import { Actions } from './Actions'
import './styles.css'
import { IReal } from './ireal'
import { Playlist } from 'ireal-renderer'

const state = State()
const actions = {}
Object.assign(actions, Actions(state, actions))

m.request('/ireal').then(data => {
  // console.log('got ireal', data)
  state.songbook(data)
  state.playlist(new Playlist(data))
  console.log('playlist', state.playlist())
})

export const Leo = {
  oninit: vnode => {
    console.log('Leo init!')
    // actions.loadSetlist()
  },
  view: vnode => {
    return [
      // m(Setlist(state, actions)),
      m(
        '#main.page',
        // {style: {
        //   marginLeft: State.menuActive() ? "250px" : "0"
        // }},
        [
          // m('#control', m(Control)),
          // m('#anndiv', m(Annotation)),
          // m('#navdiv', m(Nav)),
          // m(Viewer),
          m('#page', m(IReal(state, actions))),
        ]
      ),
    ]
  },
}

console.log('sup!')

m.route(document.body, '/', { '/': Leo })
