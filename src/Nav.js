import m from "mithril"
import Hammer from "hammerjs";
var Viewer = require("./Viewer");

var opts = {

}

var Nav = {
  mc: null,
  init: function(element) {
    console.log('creating mc ');
    Nav.mc = new Hammer(element, opts);
    Nav.mc.get('swipe').set({threshold:2, velocity:0.1});

    Nav.mc.on("swipeleft", function(ev) {
      Viewer.nextPage();
    });
    Nav.mc.on("swiperight", function(ev) {
      Viewer.prevPage();
    });
  }
}

module.exports = {
  view: function(vnode) {
    return m('canvas#nav', {style: {width:"100%", height: "100%", position: "absolute"}})
  },
  oncreate: function(vnode) {
    Nav.init(vnode.dom);
  }
}
