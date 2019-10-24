import m from "mithril";
import paper from "paper";
// import * as paper from 'paper'
// import { PaperScope, Path, Point } from 'paper';

var Annotation = {
  init: function(element) {
    paper.setup(element);
    console.log('paper loaded onto ', element);

  }
}

module.exports = {
  view: function(vnode) {
    return m('canvas#annotation')
  },
  oncreate: function(vnode) {
    Annotation.init(vnode.dom);
  }
}
