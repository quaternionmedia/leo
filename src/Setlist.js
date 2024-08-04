import m from 'mithril'
import './styles/setlist.css'
import { SearchResults, SearchInput } from './Search'

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

export const SetlistMenu = cell =>
  m(`div.setlist`, [
    m('div.setlist__header', SearchInput(cell), RandomSong(cell)),
    SearchResults(cell),
  ])

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
        })
      },
    },
    '🎲'
  )

/* change song */
document.addEventListener('keydown', e => {
  if (e.key === '`') {
    document.getElementsByClassName('setlist__header__random')[0].click()
  }
})

//export const Menu = attrs => m('.menu', attrs, [m(''), m(''), m('')])
