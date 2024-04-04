import m from 'mithril' 
import "./styles/sidenav.css";

export const MenuToggle = ({ state: { menuActive }, update }) =>
  m(`#sideNavToggle${menuActive ? '.open' : ''}`,
    {
      onclick: () => {
        update({
          menuActive: !menuActive,
        });
      },
    },
    m('.bar.b1'),
    m('.bar.b2'),
    m('.bar.b3')
  )

export const Search = ({ state, update }) =>
  m('input#search', 
    {
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
    }
  )

export const ClearQuery = ({ update }) =>
  m('#clear',
    {
      onclick: () => {
        update({ query: '' })
      },
    },
    'x'
  )

export const RandomSong = ({ state, update }) =>
  m('#random',
    {
      onclick: () => {
        const randomIndex = Math.floor(
          Math.random() * state.search_results.length
        )
        update({
          song: state.search_results[randomIndex],
          menuActive: false,
        })
      },
    },
    '🎲'
  )

export const Setlist = ({ state, update }) =>
  m('#setlist',
    state.search_results.map(item =>
      m('.song',
        {
          id: item.title,
          onclick: () => {
            update({
              menuActive: false,
              song: item,
            })
          },
        },
        item.title
      )
    )
  )

//export const Menu = attrs => m('.menu', attrs, [m(''), m(''), m('')])

export const SideNav = cell =>
  m(`#sideNav`, 
    m('#header', 
      Search(cell), 
      ClearQuery(cell), 
      RandomSong(cell)
    ),
    Setlist(cell),
  )
