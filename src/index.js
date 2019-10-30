import m from "mithril";
var Viewer = require("./Viewer");
var Nav = require("./Nav");
// var Annotation = require("./Annotation");
import Annotation from "./Annotation";
// var Annotation = require("./Annotation");
var Control = require("./Control");

var Leo = {
  view: function(vnode) {
    return [
      m('#control', m(Control)),
      m('#anndiv', m(Annotation)),
      m('#navdiv', m(Nav)),
      m(Viewer),
    ]
  }
}


console.log('sup!')

m.route(document.body, "/", { "/": Leo } );
