import m from 'mithril'
import 'ireal-renderer/css/ireal-renderer.css'
import 'ireal-renderer/src/ireal-renderer.js'
import './styles/page.css'
import './styles/ireal.css'

const reverseComposerName = composer => {
  composer = composer.split(' ')
  let lastName = composer.shift()
  composer.push(lastName)
  return composer.join(' ')
}

export const Title = ({ state }) => m('.page__header__title', state.song.title)

export const Style = ({ state }) => m('.page__header__style', state.song.style)

export const Composer = ({ state }) =>
  m('.page__header__composer', reverseComposerName(state.song.composer))

export const Key = ({ state }) => m('.page__header__key', state.key)

export const Bpm = ({ state }) =>
  state.song.bpm != 0
    ? m('h5.bpm .page__header__bpm', 'q=' + state.song.bpm)
    : null

export const Subtitle = ({ state }) =>
  m('.page__header__subtitle', [
    Style({ state }),
    Bpm({ state }),
    Key({ state }),
    Composer({ state }),
  ])

export const IReal = ({ state, update }) => ({
  oncreate: vnode => {
    console.log('IReal oncreate')
    let song = state.song
    var options = {
      transpose: 0, // number of half tones to transpose
    }
    state.renderer.parse(song)
    state.renderer.transpose(song, { transpose: state.transpose })
    state.renderer.render(song, vnode.dom, options)
    console.log('rendered', song, vnode.dom, state.renderer)
  },
  view: () => m('.page__sheet'),
})

export const iRealPage = cell =>
  m(`.page ${cell.state.darkMode ? `.page--dark` : ''}`, [
    m('.page__header', [Title(cell), Subtitle(cell)]),
    m(IReal(cell)),
  ])

import './styles/test.css'
export function ExtendiRealClass() {
  var irr_chord_list = document.getElementsByTagName('irr-chord')
  for (var i = 0; i < irr_chord_list.length; i++) {
    irr_chord_list[i].classList.add('Measure__Measure_Box__Chord_Box__Chord')
  }
  var irr_chord_list = document.getElementsByTagName('irr-cell')
  for (var i = 0; i < irr_chord_list.length; i++) {
    irr_chord_list[i].classList.add('Measure__Measure_Box__Chord_Box')
  }
}
