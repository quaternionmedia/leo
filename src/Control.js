import m from "mithril";
var State = require('./Globals').state
var Nav = require("./Nav");
var Viewer = require("./Viewer");
var Annotation = require("./Annotation");


module.exports = {
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
        // Annotation.toggle();
        // Nav.toggle();
        State.annMode(!State.annMode());
      }
    }, State.annMode() ? 'annotate' : 'perform')]
  }
}
