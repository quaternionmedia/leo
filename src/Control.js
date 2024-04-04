import m from 'mithril'
import { KEYS_FLAT, KEYS_SHARP } from './State'
import { Directions } from './State'
import "./styles/style.css";

function AnnControl(state, actions) {
  return {
    view: function (vnode) {
      return m('span#AnnotationControl', [
        m('input#strokeColor', {
          type: 'color',
          value: state.strokeColor(),
          oninput: function (e) {
            state.strokeColor(e.currentTarget.value)
          },
        }),
        m('input#strokeWidth', {
          type: 'range',
          min: 1,
          max: 50,
          value: state.strokeWidth(),
          oninput: function (e) {
            state.strokeWidth(e.currentTarget.value)
          },
        }),
        m('text#strokeWidthText', state.strokeWidth()),
        m('input#opactiy', {
          type: 'range',
          min: 1,
          max: 100,
          value: state.opacity(),
          oninput: function (e) {
            state.opacity(e.currentTarget.value)
          },
        }),
        m('text#opacityText', state.opacity()),
        m('button#clearPage', { onclick: Annotation.clearPage }, 'clear'),
        m('button#clearAll', { onclick: Annotation.initAnnotations }, 'reset'),
      ])
    },
  }
}

function mod(n, m) {
  return ((n % m) + m) % m
}

export const transposeService = {
  onchange: state => state.transpose,
  run: ({ state, update }) => {
    let key = state.song.key
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
  m('button#transpose-up.transpose',
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
  m('button#transpose-down.transpose',
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

export const TransposeIndicator = ({ state: { transpose } }) =>
  m('#indicator', 
    transpose > 0 ? `+${transpose}` : transpose == 0 ? null : transpose
  )

export const TransposeReset = ({ state: { transpose }, update }) =>
  m('button#reset.transpose', 
    { onclick: () => update({ transpose: 0 }) }, 
    `◀`
  )

export const Controls = cell =>
  m('#control', {}, [
    TransposeUp(cell),
    TransposeDown(cell),
    TransposeIndicator(cell),
    TransposeReset(cell),
    // m(
    //   'button#mode',
    //   {
    //     onclick: function () {
    //       state.annMode(!state.annMode())
    //     },
    //   },
    //   state.annMode() ? 'annotate' : 'perform'
    // ),
    // state.annMode() ? m(AnnControl) : null,
  ])
