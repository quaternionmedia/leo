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
          value: state.search(),
          oninput: e => {
            state.search(e.currentTarget.value)
          },
          onbeforeupdate: (vnode, old) => {
            console.log('before update', vnode, old)
            return false
          },
          oncreate: vnode => {
            vnode.dom.focus()
          },
        }),
        actions.songs().map(song => {
          return m(
            '.setlist-song',
            {
              id: song,
              onclick: () => {
                state.search('')
                state.menuActive(false)
                state.index(state.songbook().indexOf(song))
              },
            },
            song
          )
        }),
      ]
    )
  },
})