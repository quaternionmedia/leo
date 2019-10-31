import m from "mithril"
var State = require("./Globals").state

export var Setlist = {
  setlist: [],
  loadSetlist: function(vnode) {
    console.log('setlist init!')
    // Setlist.v = vnode
    m.request({method: 'GET', url: '/setlist'}).then((s) => {
      console.log('got setlist!', s)
      // State.setlist(s)
      Setlist.setlist = s
    })

  },

}

module.exports = {
  oninit: Setlist.loadSetlist,
  view: (vnode) => {
    return Setlist.setlist.map((s) => {
        return m('a.song', {id: s, href:`pdf/${s}`}, s)
      })

  }
}
