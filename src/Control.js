import m from 'mithril'
// var State = require('./Globals').state
// var Nav = require('./Nav')
// var Viewer = require('./Viewer')
// var Annotation = require('./Annotation')
// import Setlist from './Setlist'

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

export const TransposeUp = ({ getState, update }) =>
  m(
    'button#transpose-up.transpose',
    {
      onclick: () => {
        update({ transpose: getState().transpose + 1 })
      },
    },
    '⬆️'
  )

export const TransposeDown = ({ getState, update }) =>
  m(
    'button#transpose-up.transpose',
    {
      onclick: () => {
        update({ transpose: getState().transpose - 1 })
      },
    },
    '⬇️'
  )

export const Controls = cell => [
  TransposeUp(cell),
  TransposeDown(cell),
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
]
