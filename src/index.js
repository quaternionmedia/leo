import m from "mithril";
var Viewer = require("./Viewer");
var Nav = require("./Nav");
var Annotation = require("./Annotation");

var Leo = {
  view: function(vnode) {
    return [
      m('#navdiv', m(Nav)),
      m('#anndiv', m(Annotation)),
      m(Viewer),
      m('button#prev', {
        onclick: function() {
          Viewer.prevPage();
      }}, 'prev'),
      m('button#next', {
        onclick: function() {
          Viewer.nextPage();
      }}, 'next'),
    ]
  }
}


console.log('sup!')

m.route(document.body, "/", { "/": Leo } );
