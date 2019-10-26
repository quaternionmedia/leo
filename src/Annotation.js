import m from "mithril";
import paper from "paper";
var State = require('./Globals').state
var Nav = require("./Nav");

export function Annotation(vnode) {
  // var v = null;
  var path = null;
    window.onload = function() {
      paper.setup(vnode.dom);
      var tool = new paper.Tool();
      console.log('paper loaded onto ', vnode);

      tool.onMouseDown = function(event) {
        path = new paper.Path();
        path.add(event.point);
        path.strokeColor = 'black';
      };
      tool.onMouseDrag = function(event) {
        path.add(event.point);
      };
  };
  return {
    view: function(vnode) {
      return m('canvas#annotation', {style: {width:"100%", height: "100%", position: "absolute", zIndex: State.annMode() ? 1 : 0}})
    },
  };
}
