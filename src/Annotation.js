import m from "mithril";
import paper from "paper";
// import * as paper from 'paper'
// import { PaperScope, Path, Point } from 'paper';

var Annotation = {
  v: null,
  init: function(vnode) {
    Annotation.v = vnode;
    paper.setup(vnode.dom);
    console.log('paper loaded onto ', vnode.dom);

  },
  setZ: function(z) {
    console.log(z)
    Annotation.v.style.zIndex = z;
  }


}

module.exports = {
  view: function(vnode) {
    return m('canvas#annotation', {style: {width:"100%", height: "100%", position: "absolute"}})
  },
  oncreate: function(vnode) {
    Annotation.init(vnode.dom);
  },
  deactivate: function() {
    Annotation.setZ(0);
  },
  activate: function() {
    Annotation.setZ(1);
  }
}
