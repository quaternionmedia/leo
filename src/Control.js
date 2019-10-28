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
        State.annMode(!State.annMode());
      }
    }, State.annMode() ? 'annotate' : 'perform'),
    State.annMode() ? m('input#strokeColor', {type: 'color', oninput: function(e) {
      State.strokeColor(e.currentTarget.value)
    }}) : null,
    State.annMode() ? m('input#strokeWidth', {type: 'range', min: 1, max: 20, value: State.strokeWidth(), oninput: function(e) {
      State.strokeWidth(e.currentTarget.value)
    }}, ) : null,
    State.annMode() ? m('p#strokeWidthText', State.strokeWidth()): null,
    State.annMode() ? m('input#opactiy', {type: 'range', min: 1, max: 100, value: State.opacity(), oninput: function(e) {
      State.opacity(e.currentTarget.value)
    }}) : null,
    State.annMode() ? m('p#opacityText', State.opacity()) : null,
    ]
  }
}
