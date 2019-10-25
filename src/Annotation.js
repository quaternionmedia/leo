import m from "mithril";
import paper from "paper";
// import * as paper from 'paper'
// import { PaperScope, Path, Point } from 'paper';
var State = require('./Globals').state
var Nav = require("./Nav");
// var annMode = false;

export function Annotation(vnode) {
  var v = null;
  var path = null;

    Annotation.v = vnode;
    paper.setup(vnode.dom);
    console.log('paper loaded onto ', vnode.dom);

    paper.onMouseDown = function(event) {
      console.log('mouse down', event)
      // If we produced a path before, deselect it:
      if (path) {
        path.selected = false;
      }

      // Create a new path and set its stroke color to black:
      path = new paper.Path({
        segments: [event.point],
        strokeColor: 'black',
        // Select the path, so we can see its segment points:
        fullySelected: true
      });
      paper.view.draw();
    }

    // While the user drags the mouse, points are added to the path
    // at the position of the mouse:
    paper.onMouseDrag = function(event) {
      path.add(event.point);

      // Update the content of the text item to show how many
      // segments it has:
      textItem.content = 'Segment count: ' + path.segments.length;
      paper.view.draw();
    }

    // When the mouse is released, we simplify the path:
    paper.onMouseUp = function(event) {
      var segmentCount = path.segments.length;

      // When the mouse is released, simplify it:
      path.simplify(10);

      // Select the path, so we can see its segments:
      path.fullySelected = true;

      var newSegmentCount = path.segments.length;
      var difference = segmentCount - newSegmentCount;
      var percentage = 100 - Math.round(newSegmentCount / segmentCount * 100);
      textItem.content = difference + ' of the ' + segmentCount + ' segments were removed. Saving ' + percentage + '%';
      paper.view.draw();
    }

  return {
    view: function(vnode) {
      return m('canvas#annotation', {style: {width:"100%", height: "100%", position: "absolute", zIndex: State.annMode() ? 1 : 0}})
      //zIndex: Nav.annMode ? 1 : 0
    },
  };
}
//
// module.exports = {
//   // view: function(vnode) {
//   //   return m('canvas#annotation', {style: {width:"100%", height: "100%", position: "absolute"}})
//   //   //zIndex: Nav.annMode ? 1 : 0
//   // },
//   oncreate: function(vnode) {
//     Annotation.init(vnode.dom);
//     // vnode.dom.style.zIndex = Nav.annMode ? 1 : 0;
//   },
//   deactivate: function() {
//     Annotation.setZ(0);
//   },
//   activate: function() {
//     Annotation.setZ(1);
//   },
//   // toggle: function() {
//   // Annotation.v.style.zIndex ? this.activate() : this.deactivate();
//   // Nav.annMode ?
//   // }
// }
