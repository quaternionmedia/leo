import m from "mithril";
var Viewer = require("./Viewer");

var Leo = {
  view: function(vnode) {
    return m(Viewer)
  }
}


console.log('sup!')

m.route(document.body, "/", { "/": Leo } );
