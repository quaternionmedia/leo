import m from 'mithril'

export const Setlist = (state, actions) => ({
  view: vnode => {
    return m(
      '#setlist.sidenav',
      {
        style: {
          zIndex: state.menuActive() ? 2 : -1,
          width: state.menuActive() ? '250px' : '0',
          display: state.menuActive() ? "table" : "none",
        },
      },
      [
        m(
          '#closeMenu.closebtn',
          {
            onclick: () => {
              state.menuActive(false)
            },
          },
          'X'
        ),
        state.playlist() ? state.playlist().songs.map((s, i) => {
          return m(
            '.setlist-song',
            {
              id: s.title,
              onclick: () => {
                // actions.loadSong(s.title)
                state.index(i)
                state.menuActive(false)
              },
            },
            s.title
          )
        }) : '',
      ]
    )
  },
})