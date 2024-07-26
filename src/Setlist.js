import m from 'mithril'
import './styles/setlist.css'

// setlist
// setlist--open

// setlist__toggle
// setlist__toggle--open
// setlist__toggle__bar
// setlist__toggle__bar__1
// setlist__toggle__bar__2
// setlist__toggle__bar__3

// setlist__header
// setlist__header__random

// setlist__header__search
// setlist__header__search__clear

// setlist__songbox
// setlist__songbox__song

export const SetlistNav = cell =>
  m(
    `div.setlist`,
    m('div.setlist__header', SearchInput(cell), RandomSong(cell)),
    SetlistBox(cell)
  )

export const SearchInput = ({ state, update }) =>
  m(
    'div.setlist__header__search',
    m('input.setlist__header__search__input', {
      type: 'text',
      placeholder: 'Search',
      value: state.search_options.query,
      oninput: e => {
        update({ search_options: { query: e.currentTarget.value } })
      },
      onbeforeupdate: (vnode, old) => {
        console.log('before update', vnode, old)
        if (!state.search_options.query === '') return false
      },
      oncreate: vnode => {
        vnode.dom.focus()
      },
    }),
    ClearQuery({ update })
  )

export const ClearQuery = ({ update }) =>
  m(
    'button.setlist__header__search__clear',
    {
      onclick: () => {
        update({ search_options: { query: '' } })
        document
          .getElementsByClassName('setlist__header__search__input')[0]
          .focus()
      },
    },
    '✗'
  )

export const RandomSong = ({ state, update }) =>
  m(
    'button.setlist__header__random',
    {
      disabled: state.results.data.items.length === 0,
      onclick: () => {
        // Check if there are any search results
        let items = state.results.data.items
        if (items.length === 0) {
          return
        }
        const randomIndex = Math.floor(Math.random() * items.length)
        update({
          song: items[randomIndex],
          menuActive: false,
        })
      },
    },
    '🎲'
  )

export const SetlistBox = ({ state, update }) =>
  m(
    'div.setlist__songbox',
    state.results.data.items.map(item => SongTitle(item, { update }))
  )

export const SongTitle = (song, { update }) =>
  m(
    'button.setlist__songbox__song',
    {
      id: song.title,
      onclick: () => {
        update({ song })
      },
    },
    song.title
  )

/* change song */
document.addEventListener('keydown', e => {
  if (e.key === '`') {
    document.getElementsByClassName('setlist__header__random')[0].click()
  }
})

//export const Menu = attrs => m('.menu', attrs, [m(''), m(''), m('')])
