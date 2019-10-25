import m from "mithril"
import Hammer from "hammerjs";
var State = require('./Globals').state
var Viewer = require("./Viewer");
// var Annotation = require("./Annotation");
import {Annotation} from "./Annotation";

var opts = {

}
var Nav = {
  v: null,
  mc: null,
  setZ: function(z) {
    console.log('setting z to ', z, this.v)
    this.v.dom.style.zIndex = z;
  },
  init: function(vnode) {
    this.v = vnode;
    console.log('creating mc ');

  }
}

module.exports = {
  // annMode: false,b
  // toggle: function() {
  //   State.annMode(!State.annMode());
  // },
  view: function(vnode) {
    return m('canvas#nav', {style: {width:"100%", height: "100%", position: "absolute", zIndex: State.annMode() ? 0 : 1}})
  },
  oncreate: function(vnode) {
    Nav.init(vnode);
    vnode.dom.style.zIndex = State.annMode ? 0 : 1;

    this.mc = new Hammer(vnode.dom, opts);
    this.mc.get('swipe').set({threshold:2, velocity:0.1});

    this.mc.on("swipeleft", function(ev) {
      Viewer.nextPage();
    });
    this.mc.on("swiperight", function(ev) {
      Viewer.prevPage();
    });
    this.mc.on("doubletap", function(ev) {
      console.log('doubletap!', ev);
      State.annMode(!State.annMode());
      m.redraw();
      // State.annMode ? Annotation.activate() : Annotation.deactivate();
      // State.annMode() ? Nav.setZ(0) : Nav.setZ(1);
    });
  }
}
