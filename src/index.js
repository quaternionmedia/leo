import m from "mithril";
var Viewer = require("./Viewer");
var Nav = require("./Nav");
var Annotation = require("./Annotation");

var Leo = {
  view: function(vnode) {
    return [
      m('button#prev', {
        onclick: function() {
          Viewer.prevPage();
      }}, 'prev'),
      m('button#next', {
        onclick: function() {
          Viewer.nextPage();
      }}, 'next'),
      m('button#mode', {
        onclick: function() {
          Nav.toggle();
          Annotation.toggle();
        }
      }, 'annotation mode'),
      m('#anndiv', m(Annotation)),
      m('#navdiv', m(Nav)),
      m(Viewer),
    ]
  }
}


console.log('sup!')

m.route(document.body, "/", { "/": Leo } );
