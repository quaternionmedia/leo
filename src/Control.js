import m from 'mithril'
import { KEYS_FLAT, KEYS_SHARP } from './State'
import { Directions } from './State'
import './styles/control.css'

function AnnControl(state, actions) {
  return {
    view: function (vnode) {
      return m('span.AnnotationControl', [
        m('input.strokeColor', {
          type: 'color',
          value: state.strokeColor(),
          oninput: function (e) {
            state.strokeColor(e.currentTarget.value)
          },
        }),
        m('input.strokeWidth', {
          type: 'range',
          min: 1,
          max: 50,
          value: state.strokeWidth(),
          oninput: function (e) {
            state.strokeWidth(e.currentTarget.value)
          },
        }),
        m('text.strokeWidthText', state.strokeWidth()),
        m('input.opactiy', {
          type: 'range',
          min: 1,
          max: 100,
          value: state.opacity(),
          oninput: function (e) {
            state.opacity(e.currentTarget.value)
          },
        }),
        m('text.opacityText', state.opacity()),
        m('button.clearPage', { onclick: Annotation.clearPage }, 'clear'),
        m('button.clearAll', { onclick: Annotation.initAnnotations }, 'reset'),
      ])
    },
  }
}

export function mod(n, m) {
  return ((n % m) + m) % m
}

export const transposeService = {
  onchange: state => state.transpose,
  run: ({ state, update }) => {
    let key = state.key
    if (!key) return
    if (state.transpose == 0) update({ key })
    let minor = key.endsWith('-') ? '-' : ''
    key = key.replace('-', '')
    let index = KEYS_FLAT.indexOf(key) || KEYS_SHARP.indexOf(key)
    let t = mod(index + state.transpose, 12)
    update({
      key:
        state.transposeDirection == Directions.UP
          ? KEYS_SHARP[t] + minor
          : KEYS_FLAT[t] + minor,
    })
  },
}

export const TransposeUp = ({ getState, update }) =>
  m(
    'button.control__transpose-up.control__transpose',
    {
      onclick: () => {
        update({
          transpose: getState().transpose + 1,
          transposeDirection: Directions.UP,
        })
      },
    },
    '▲'
  )

export const TransposeDown = ({ getState, update }) =>
  m(
    'button.control__transpose-down.control__transpose',
    {
      onclick: () => {
        update({
          transpose: getState().transpose - 1,
          transposeDirection: Directions.DOWN,
        })
      },
    },
    '▼'
  )

export const TransposeReset = ({ state: { transpose }, update }) =>
  m(
    'button.control__reset.control__transpose',
    { onclick: () => update({ transpose: 0 }) },
    `🔁`
  )

export const NextSong = ({ state, update, getState }) =>
  m(
    'button.setlist__header__random',
    {
      disabled: state.results.data.items.length === 0,
      onclick: () => {
        let state = getState()
        let items = state.results.data.items
        // Check if there are any search results
        if (items.length === 0) {
          return
        }
        update({
          song: items[mod(state.index + 1, items.length)],
        })
      },
    },
    '>'
  )

export const PrevSong = ({ state, getState, update }) =>
  m(
    'button.setlist__header__random',
    {
      disabled: state.results.length === 0,
      onclick: () => {
        let state = getState()
        let items = state.results.data.items
        // Check if there are any search results
        if (items.length === 0) {
          return
        }
        update({
          song: items[mod(state.index - 1, items.length)],
        })
      },
    },
    '<'
  )
export const MetronomeToggle = ({ state, update }) =>
  m(
    'button.metronome-toggle',
    {
      class: state.metronomeActive ? 'active' : '',
      onclick: (e) => {
        e.preventDefault()
        e.stopPropagation()
        update({ metronomeOpen: !state.metronomeOpen })
      },
      title: state.metronomeActive ? 'Metronome is playing (click to open)' : 'Open metronome',
      type: 'button'
    },
    state.metronomeActive ? '♪♪' : '♪'
  )

export const Controls = cell =>
  m('.control', {}, [
    PrevSong(cell),
    TransposeUp(cell),
    TransposeReset(cell),
    TransposeDown(cell),
    NextSong(cell),
    MetronomeToggle(cell),
    // m(
    //   'button.mode',
    //   {
    //     onclick: function () {
    //       state.annMode(!state.annMode())
    //     },
    //   },
    //   state.annMode() ? 'annotate' : 'perform'
    // ),
    // state.annMode() ? m(AnnControl) : null,
  ])
