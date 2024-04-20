import m from 'mithril'
import Hammer from 'hammerjs'
// var State = require('./Globals').state
// var Viewer = require('./Viewer')
// import {Annotation} from "./Annotation";

var opts = {}

export const Nav = (state, actions) => ({
  view: function (vnode) {
    return m('canvas.nav', {
      style: {
        width: '100%',
        height: '100%',
        position: 'absolute',
        zIndex: state.annMode() ? 0 : 1,
      },
    })
  },
  oncreate: function (vnode) {
    this.mc = new Hammer(vnode.dom, opts)
    this.mc.get('swipe').set({ threshold: 2, velocity: 0.1 })

    this.mc.on('swipeleft', function (ev) {
      Viewer.nextPage()
    })
    this.mc.on('swiperight', function (ev) {
      Viewer.prevPage()
    })
    this.mc.on('doubletap', function (ev) {
      console.log('doubletap!', ev)
    })
    this.mc.on('press', function (ev) {
      console.log('pressed! ', ev)
      state.annMode(!state.annMode())
      m.redraw()
    })
    this.mc.on('pressup', function (ev) {
      console.log('pressed up! ', ev)
    })
  },
})
