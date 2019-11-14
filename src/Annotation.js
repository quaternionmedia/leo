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
      // paper.project.view.onResize = Annotation.resizeCanvas
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
  },
  initAnnotations: function(p) {
    console.log('initing annotations');
    paper.project.clear();
    for (var i = 0; i < State.pdfPages(); i++) {
      var layer = new paper.Layer();
      paper.project.insertLayer(i, layer);
    }
  },
  resizeCanvas: (ev) => {
    console.log('resizing', window.innerWidth, window.innerHeight)
    console.log(ev)
    var canvas = document.getElementById('pdf-canvas')
    paper.view.scale((window.width - canvas.width)/window.width, 1)
    // paper.view.viewSize.width = window.innerWidth
    // paper.view.viewSize.height = window.innerHeight
    // paper.view.viewSize = new paper.Size(ev.delta.width, ev.delta.height)
    // paper.view.update()
  },
}
module.exports = {
  view: function(vnode) {
    return m('canvas#annotation', {style: {position: "absolute", zIndex: State.annMode() ? 1 : 0}, width:"100%", height: "100%"})
  },
  oncreate: Annotation.init,
  initAnnotations: Annotation.initAnnotations,
  saveAnnotations: () => {
    var proj = paper.project.exportJSON()
    console.log('saving ', proj)
    m.request({method: "POST", url: `annotations/${State.pdfUrl()}`, headers: {"Content-Type": 'application/json'}, body: proj})
  },
  getAnnotations: (url) => {
    return new Promise((resolve, reject) => {
      m.request(`annotations/${State.pdfUrl()}`).then((res) => {
        resolve(res)
      })
    })
  },
  loadAnnotations: (ann) => {
    if (ann){
        paper.project.clear()
        paper.project.importJSON(ann)
      } else {
        Annotation.initAnnotations(State.pdfPages())
      }
        console.log('loaded annotations', ann)
  },
  showAnnotations: function(p) {
    paper.project.layers[p - 1].visible = true;
  },
  hideAnnotations: function(p) {
    paper.project.layers[p - 1].visible = false;
  },
  clearPage: () => {
    paper.project.layers[State.pdfPage() - 1].remove()
    paper.project.layers[State.pdfPage() - 1] = new paper.Layer()
    paper.project.layers[State.pdfPage() - 1].visible = true
    paper.view.update()
  },

}
