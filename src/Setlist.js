import m from 'mithril'

export const MenuToggle = ({ state: { menuActive }, update }) =>
  m(
    '.menu',
    {
      onclick: () => {
        update({
          menuActive: !menuActive,
        })
      },
    },
    m(''),
    m(''),
    m('')
  )

export const Search = ({ state, update }) =>
  m('input.search', {
    type: 'text',
    placeholder: 'Search',
    value: state.query,
    oninput: e => {
      update({ query: e.currentTarget.value })
    },
    onbeforeupdate: (vnode, old) => {
      console.log('before update', vnode, old)
      if (!state.query === '') return false
    },
    oncreate: vnode => {
      vnode.dom.focus()
    },
  })

export const ClearQuery = ({ update }) =>
  m(
    '.clear',
    {
      onclick: () => {
        update({ query: '' })
      },
    },
    'X'
  )

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

export const Menu = attrs => m('.menu', attrs, [m(''), m(''), m('')])

export const SetlistMenu = ({ state, update }) =>
  m(`#setlist.sidenav${state.menuActive ? '.menuActive' : ''}`, {}, [
    m('.menu-header', {}, [Search({ state, update }), ClearQuery({ update })]),
    Songlist({ state, update }),
  ])
