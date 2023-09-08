import m from 'mithril'
var State = require('./Globals').state
var Viewer = require('./Viewer')

export var Setlist = {
  setlist: [],
  loadSetlist: function (vnode) {
    console.log('setlist init!')

    m.request('/setlist').then(s => {
      Setlist.setlist = s
      State.setIndex(0)
      Viewer.loadSong(s[State.setIndex()])
    })
  },
}

module.exports = {
  oninit: Setlist.loadSetlist,
  view: vnode => {
    return m(
      '.sidenav#setlist',
      {
        style: {
          zIndex: State.menuActive() ? 2 : -1,
          width: State.menuActive() ? '250px' : '0',
          // display: State.menuActive() ? "table" : "none",
        },
      },
      [
        m(
          'a#closeMenu',
          {
            onclick: () => {
              State.menuActive(false)
            },
          },
          'X'
        ),
        Setlist.setlist.map(s => {
          return m(
            'a.song',
            {
              id: s,
              onclick: () => {
                Viewer.loadSong(s)
                State.menuActive(false)
              },
            },
            s
          )
        }),
      ]
    )
  },
}
