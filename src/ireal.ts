import m from 'mithril'
import 'ireal-renderer/css/ireal-renderer.css'
import 'ireal-renderer/src/ireal-renderer.js'
import './styles/page.css'
import './styles/ireal.css'

export const reverseComposerName = (composer: string) => {
  if (composer.includes(',')) {
    // if composer has a comma, it's probably multiple composers
    return composer
  }
  if (/\d{4}/g.exec(composer)) {
    // if composer has 4 digits in parentheses, it's probably a year
    return composer
  }
  let composer_name = composer.split(' ')
  let lastName: string = composer_name.shift()
  composer_name.push(lastName)
  return composer_name.join(' ')
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
      transpose: state.transpose, // number of half tones to transpose
    }
    state.renderer.parse(song)
    state.renderer.transpose(song, options)
    state.renderer.render(song, vnode.dom)
    console.log('rendered', song, vnode.dom, state.renderer)
  },
  view: () => m('.page__sheet'),
})

export const iRealPage = cell =>
  m(
    '.page',
    {
      class: [
        cell.state.darkMode ? `.page--dark` : '',
        cell.state.debug.darkMode ? 'page--debug-bkgclr' : '',
        cell.state.debug.color ? 'page--debug-color' : '',
      ].join(' '),
    },
    [m('.page__header', [Title(cell), Subtitle(cell)]), m(IReal(cell))]
  )

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
