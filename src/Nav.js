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
    console.log('setting z to ', z, Nav.v)
    Nav.v.dom.style.zIndex = z;
  },
  init: function(vnode) {
    Nav.v = vnode;
    console.log('creating mc ');
    Nav.mc = new Hammer(vnode.dom, opts);
    Nav.mc.get('swipe').set({threshold:2, velocity:0.1});

    Nav.mc.on("swipeleft", function(ev) {
      Viewer.nextPage();
    });
    Nav.mc.on("swiperight", function(ev) {
      Viewer.prevPage();
    });
    Nav.mc.on("doubletap", function(ev) {
      console.log('doubletap!', ev);
      Nav.annMode = !Nav.annMode;
      Nav.annMode ? Annotation.activate() : Annotation.deactivate();
      Nav.annMode ? Nav.setZ(0) : Nav.setZ(1);
    });
  }
}

module.exports = {
  view: function(vnode) {
    return m('canvas#nav', {style: {width:"100%", height: "100%", position: "absolute"}})
  },
  oncreate: function(vnode) {
    Nav.init(vnode);
  }
}
