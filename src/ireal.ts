import m from 'mithril'
import './ireal.css'
import 'ireal-renderer/css/ireal-renderer.css'
import 'ireal-renderer/src/ireal-renderer.js'

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

export const Key = ({ state }) => m('h3.key', state.song.key)

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
    if (state.transpose !== 0) {
      state.renderer.transpose(song, { transpose: state.transpose })
    } else {
      // update({song:{key:song.key}})
    }

    state.renderer.render(song, vnode.dom)
    console.log('rendered', song, vnode.dom, state.renderer)
  },
  view: vnode => {
    console.log('IReal view')
    return m('.song')
  },
})

export const iRealPage = cell =>
  m('#page.ireal', [Title(cell), Subtitle(cell), m(IReal(cell))])
