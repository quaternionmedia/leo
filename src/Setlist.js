import m from "mithril"
var State = require("./Globals").state
var Viewer = require("./Viewer")

export var Setlist = {
  setlist: [],
  loadSetlist: function(vnode) {
    console.log('setlist init!')

    m.request({method: 'GET', url: '/setlist'}).then((s) => {
      Setlist.setlist = s
      State.setIndex(0)
      Viewer.loadPdf(s[State.setIndex()])
    })
  },
}

module.exports = {
  oninit: Setlist.loadSetlist,
  view: (vnode) => {
    return m('.sidenav#setlist', {style: {
      width: State.menuActive() ? "250px" : "0"
    }}, Setlist.setlist.map((s) => {
      return m('a.song', {id: s, onclick: () => {
        Viewer.loadPdf(s)
        State.menuActive(false)
      }}, s)
    }))
}
}
