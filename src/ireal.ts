import m from 'mithril'
import 'ireal-renderer/css/ireal-renderer.css'
import 'ireal-renderer/src/ireal-renderer.js'
import './ireal.css'

export const Title = ({ state }) => m('h3.title', state.song.title)

export const Style = ({ state }) => m('.style', state.song.style)

const reverseComposerName = composer => {
  composer = composer.split(' ')
  let lastName = composer.shift()
  composer.push(lastName)
  return composer.join(' ')
}

export const Composer = ({ state }) =>
  m('.composer', {}, reverseComposerName(state.song.composer))

export const Key = ({ state }) => m('h3.key', state.key)

export const Bpm = ({ state }) => state.song.bpm != 0 ? m('h5#bpm.bpm', 'q='+state.song.bpm): null

export const Subtitle = ({ state }) =>
  m('.subtitle', [
    Style({ state }),
    Bpm({ state }),
    Key({ state }),
    Composer({ state }),
  ])

export const IReal = ({ state, update }) => ({
  oncreate: vnode => {
    console.log('IReal oncreate')

    let song = state.song
    state.renderer.parse(song)
    state.renderer.transpose(song, { transpose: state.transpose })
    state.renderer.render(song, vnode.dom)
    // console.log('rendered', song, vnode.dom, state.renderer)
  },
  view: () => m('.song'),
})

export const iRealPage = cell =>
  m('#page.ireal', [Title(cell), Subtitle(cell), m(IReal(cell))])
