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

export const RandomSong = ({ state, update }) =>
  m(
    '.random',
    {
      onclick: () => {
        const randomIndex = Math.floor(
          Math.random() * state.search_results.length
        )
        update({
          song: state.search_results[randomIndex],
          transpose: 0,
          menuActive: false,
        })
      },
    },
    '🎲'
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

export const SetlistMenu = cell =>
  m(`#setlist.sidenav${cell.state.menuActive ? '.menuActive' : ''}`, {}, [
    m('.menu-header', {}, [Search(cell), ClearQuery(cell), RandomSong(cell)]),
    Songlist(cell),
  ])
