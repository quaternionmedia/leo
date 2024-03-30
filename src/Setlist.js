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
    value: state.query,
    oninput: e => {
      update({ query: e.currentTarget.value })
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
    state.search_results.map(item =>
      m(
        '.setlist-song',
        {
          id: item.title,
          onclick: () => {
            update({
              menuActive: false,
              song: item,
              transpose: 0,
            })
          },
        },
        item.title
      )
    )
  )

export const SetlistMenu = ({ state, update }) =>
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
