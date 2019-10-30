import m from "mithril";
import paper from "paper";
var State = require('./Globals').state

var hitOptions = {
  segments: true,
  stroke: true,
  fill: true,
  tolerance: 5
};

var Annotation = {
  // var v = null;
  path: null,
  segment: null,
  init: function(vnode) {
    window.onload = function() {
      paper.setup(vnode.dom);
      var tool = new paper.Tool();
      console.log('paper loaded onto ', vnode);

      tool.onMouseDown = function(event) {
        Annotation.segment = null;
        Annotation.path = null;
        var hitResult = paper.project.hitTest(event.point, hitOptions);

        if (hitResult) {
          if (event.modifiers.shift) {
            if (hitResult.type == 'segment') {
              hitResult.segment.remove();
            };
            return;
          }

          Annotation.path = hitResult.item;
          if (hitResult.type == 'segment') {
            Annotation.segment = hitResult.segment;
          } else if (hitResult.type == 'stroke') {
            var location = hitResult.location;
            Annotation.segment = Annotation.path.insert(location.index + 1, event.point);
            Annotation.path.smooth();
          }
        }
        if (Annotation.path) {
          Annotation.path.selected = false;
        }
        Annotation.path = new paper.Path({
          segments: [event.point],
          strokeColor: State.strokeColor(),
          strokeWidth: State.strokeWidth(),
          opacity: State.opacity()/100,
          fullySelected: true
        });
      };
      tool.onMouseDrag = function(event) {
        if (Annotation.segment) {
          Annotation.segment.point += event.delta;
          Annotation.path.smooth();
        }
        if (Annotation.path) {
          Annotation.path.add(event.point);
        }
      };
      tool.onMouseUp = function(event) {
        if (Annotation.path){
          Annotation.path.simplify(10);
          Annotation.path.fullySelected = true;
          console.log('about to add child', State.pdfPage(), paper.project.layers)
          paper.project.layers[State.pdfPage() - 1].addChild(Annotation.path)
        }
      };
      function onMouseMove(event) {
        paper.project.activeLayer.selected = false;
        if (event.item) event.item.selected = true;
      }
    }
  }
}
module.exports = {
  view: function(vnode) {
    return m('canvas#annotation', {style: {width:"100%", height: "100%", position: "absolute", zIndex: State.annMode() ? 1 : 0}})
  },
  oncreate: Annotation.init,
  initAnnotations: function(p) {
    console.log('initing annotations');
    paper.project.clear();
    for (var i = 0; i < State.pdfPages(); i++) {
      var layer = new paper.Layer();
      paper.project.insertLayer(i, layer);
    }
  },
  showAnnotations: function(p) {
    paper.project.layers[p - 1].visible = true;
  },
  hideAnnotations: function(p) {
    paper.project.layers[p - 1].visible = false;
  },
}
