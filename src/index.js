import m from "mithril";
var Viewer = require("./Viewer");
var Nav = require("./Nav");
import Annotation from "./Annotation";
var Control = require("./Control");
import Setlist from "./Setlist"
var State = require("./Globals").state

var Leo = {
  view: function(vnode) {
    return [
      m(Setlist),
      m('#main',
      // {style: {
      //   marginLeft: State.menuActive() ? "250px" : "0"
      // }},
      [
        m('#control', m(Control)),
        m('#anndiv', m(Annotation)),
        m('#navdiv', m(Nav)),
        m(Viewer),
      ]),
    ]
  }
}


console.log('sup!')

m.route(document.body, "/", { "/": Leo } );
