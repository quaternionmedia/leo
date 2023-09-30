import m from 'mithril'

export const Setlist = (state, actions) => ({

  view: vnode => {
    return m(
      '#setlist.sidenav',
      {
        style: {
          zIndex: state.menuActive() ? 2 : -1,
          width: state.menuActive() ? '250px' : '0',
          
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
        m('input#search', {
          type: 'text',
          placeholder: 'Search',
          oninput: e => {
            state.search(e.currentTarget.value)
          },
        }),
        actions.songs().map((s, i) => {
          return m(
            '.setlist-song',
            {
              id: s,
              onclick: () => {
                // actions.loadSong(s.title)
                state.index(i)
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