import m from 'mithril'
// var Viewer = require('./Viewer')
import { Nav } from './Nav'
// import Annotation from './Annotation'
import {Controls} from './Control'
import {Setlist} from './Setlist'
import { State } from './State'
import { Actions } from './Actions'
import './styles.css'
import { IReal } from './ireal'
import { Playlist } from 'ireal-renderer'
import { Title } from './Title'


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
      m(Setlist(state, actions)),
      m(Controls(state, actions)),
      m('#page', [m(Title(state)), m(IReal(state, actions))]),
      m(Nav(state, actions)),
      // m(
        // '#main.page',
        // {style: {
        //   marginLeft: State.menuActive() ? "250px" : "0"
        // }},
        // [
          // m('#anndiv', m(Annotation)),
          // m(Viewer),
          
        // ]
      // ),
    ]
  },
}

console.log('sup!')

m.route(document.body, '/', { '/': Leo })
