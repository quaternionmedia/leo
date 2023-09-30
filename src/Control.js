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

export const Controls = (state, actions) => ({
  view: function (vnode) {
    return [
      m(
        'button#menu',
        {
          onclick: () => {
            state.menuActive(!state.menuActive())
          },
        },
        'menu'
      ),
      m(
        'button#prev',
        {
          onclick: function () {
            state.index(state.index() - 1)
          },
        },
        'prev'
      ),
      m(
        'button#next',
        {
          onclick: function () {
            state.index(state.index() + 1)
          },
        },
        'next'
      ),
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
  },
})
