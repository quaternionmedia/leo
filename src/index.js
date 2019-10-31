import m from "mithril";
var Viewer = require("./Viewer");
var Nav = require("./Nav");
// var Annotation = require("./Annotation");
import Annotation from "./Annotation";
// var Annotation = require("./Annotation");
var Control = require("./Control");
import Setlist from "./Setlist"

var Leo = {
  view: function(vnode) {
    return [
      m(Setlist),
      m('#control', m(Control)),
      m('#anndiv', m(Annotation)),
      m('#navdiv', m(Nav)),
      m(Viewer),
    ]
  }
}


console.log('sup!')

m.route(document.body, "/", { "/": Leo } );
