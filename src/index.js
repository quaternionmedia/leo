import m from "mithril";
var Viewer = require("./Viewer");

var Leo = {
  view: function(vnode) {
    return [
      m(Viewer),
      m('button#prev', {
        onclick: function() {
          console.log('turning page', Viewer);
          Viewer.prevPage();
      }}, 'prev'),
      m('button#next', {
        onclick: function() {
          console.log('turning page', Viewer);
          Viewer.nextPage();
      }}, 'next'),
    ]
  }
}


console.log('sup!')

m.route(document.body, "/", { "/": Leo } );
