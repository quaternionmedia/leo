import m from 'mithril'
import { KEYS_FLAT, KEYS_SHARP } from './State'
import { Directions } from './State'

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
    let index = KEYS_FLAT.indexOf(key) || KEYS_SHARP.indexOf(key)
    update({
      key:
        state.transposeDirection == Directions.UP
          ? KEYS_SHARP[mod(index + state.transpose, 12)]
          : KEYS_FLAT[mod(index + state.transpose, 12)],
    })
  },
}

export const TransposeUp = ({ getState, update }) =>
  m(
    '#transpose-up.transpose',
    {
      onclick: () => {
        update({
          transpose: getState().transpose + 1,
          transposeDirection: Directions.UP,
        })
      },
    },
    '⬆️'
  )

export const TransposeDown = ({ getState, update }) =>
  m(
    '#transpose-up.transpose',
    {
      onclick: () => {
        update({
          transpose: getState().transpose - 1,
          transposeDirection: Directions.DOWN,
        })
      },
    },
    '⬇️'
  )

export const TransposeIndicator = ({ state: { transpose } }) =>
  m('', transpose > 0 ? `+${transpose}` : transpose == 0 ? null : transpose)

export const ResetTranspose = ({ state: { transpose }, update }) =>
  m('.right', { onclick: () => update({ transpose: 0 }) }, '↩️')

export const Controls = cell =>
  m('.control', {}, [
    TransposeUp(cell),
    TransposeDown(cell),
    TransposeIndicator(cell),
    ResetTranspose(cell),
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
