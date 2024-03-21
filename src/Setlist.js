import m from 'mithril'

export const MenuIcon = m('i.fa.fa-bars', {})

export const MenuToggle = ({ state, update }) =>
  m(
    '#closeMenu.closebtn',
    {
      onclick: () => {
        update({
          menuActive: !state.menuActive,
        })
      },
    },
    'X'
  )

export const Search = ({ state, update }) =>
  m('input#search', {
    type: 'text',
    placeholder: 'Search',
    value: state.search,
    oninput: e => {
      update({ search: e.currentTarget.value })
    },
    onbeforeupdate: (vnode, old) => {
      console.log('before update', vnode, old)
      return false
    },
    oncreate: vnode => {
      vnode.dom.focus()
    },
  })

export const Songlist = ({ state, update }) =>
  m(
    '.setlist',
    {},
    state.setlist
      .filter(song => song.search(state.search) > -1)
      .map(song => {
        return m(
          '.setlist-song',
          {
            id: song,
            onclick: () => {
              update({
                search: '',
                menuActive: false,
                song: song,
              })
            },
          },
          song
        )
      })
  )

export const Setlist = ({ state, update }) =>
  m(
    `#setlist.sidenav${state.menuActive ? '.menuActive' : ''}`,
    {},
    [
      m('.menu-header', {}),
      Search({ state, update }),
      MenuToggle({ state, update }),
    ],
    Songlist({ state, update })
  )
