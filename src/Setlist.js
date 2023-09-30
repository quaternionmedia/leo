import m from 'mithril'

export const Setlist = (state, actions) => ({
  
  oninit: actions.loadSetlist,
  view: vnode => {
    return m(
      '.sidenav#setlist',
      {
        style: {
          zIndex: state.menuActive() ? 2 : -1,
          width: state.menuActive() ? '250px' : '0',
          // display: State.menuActive() ? "table" : "none",
        },
      },
      [
        m(
          'a#closeMenu',
          {
            onclick: () => {
              state.menuActive(false)
            },
          },
          'X'
        ),
        state.setlist.map(s => {
          return m(
            'a.song',
            {
              id: s,
              onclick: () => {
                actions.loadSong(s)
                state.menuActive(false)
              },
            },
            s
          )
        }),
      ]
    )
  },
})