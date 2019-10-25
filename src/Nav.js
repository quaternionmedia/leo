import m from "mithril"
import Hammer from "hammerjs";
var Viewer = require("./Viewer");
var Annotation = require("./Annotation");

var opts = {

}
var Nav = {
  v: null,
  mc: null,
  annMode: false,
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
  view: function(vnode) {
    return m('canvas#nav', {style: {width:"100%", height: "100%", position: "absolute"}})
  },
  oncreate: function(vnode) {
    Nav.init(vnode);
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
      this.annMode = !this.annMode;
      this.annMode ? Annotation.activate() : Annotation.deactivate();
      this.annMode ? Nav.setZ(0) : Nav.setZ(1);
    });
  },
  toggle: function() {
    this.annMode = !this.annMode;
    this.annMode ? Nav.setZ(0) : Nav.setZ(1);
  }
}
