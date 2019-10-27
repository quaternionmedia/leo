import m from "mithril";
import paper from "paper";
var State = require('./Globals').state

var hitOptions = {
  segments: true,
  stroke: true,
  fill: true,
  tolerance: 5
};

export function Annotation(vnode) {
  // var v = null;
  var path, segment, hit;
  window.onload = function() {
    paper.setup(vnode.dom);
    var tool = new paper.Tool();
    console.log('paper loaded onto ', vnode);

    tool.onMouseDown = function(event) {
      segment = path = hit = null;
      var hitResult = paper.project.hitTest(event.point, hitOptions);

      if (hitResult) {
        if (event.modifiers.shift) {
          if (hitResult.type == 'segment') {
            hitResult.segment.remove();
          };
          return;
        }

        path = hitResult.item;
        if (hitResult.type == 'segment') {
          segment = hitResult.segment;
        } else if (hitResult.type == 'stroke') {
          var location = hitResult.location;
          segment = path.insert(location.index + 1, event.point);
          path.smooth();
        }
      }
      if (path) {
        path.selected = false;
      }
      path = new paper.Path({
        segments: [event.point],
        strokeColor: State.strokeColor(),
        strokeWidth: State.strokeWidth(),
        fullySelected: true
      });
    };
    tool.onMouseDrag = function(event) {
      if (segment) {
        segment.point += event.delta;
        path.smooth();
      }
      if (path) {
        path.add(event.point);
      }
    };
    tool.onMouseUp = function(event) {
      if (path){
        path.simplify(10);
        path.fullySelected = true;
      }
    };
    function onMouseMove(event) {
      paper.project.activeLayer.selected = false;
      if (event.item) event.item.selected = true;
    }
  }
  return {
    view: function(vnode) {
      return m('canvas#annotation', {style: {width:"100%", height: "100%", position: "absolute", zIndex: State.annMode() ? 1 : 0}})
    },
  };
}
