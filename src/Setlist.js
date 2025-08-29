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
    m('div.setlist__header', 
      SearchInput(cell), 
      RandomSong(cell),
      SongsLink(cell),
      MetronomeLink(cell)
    ),
    SearchResults(cell),
  ])

export const SongsLink = ({ state, update }) =>
  m(
    'button.setlist__header__songs',
    {
      class: state.currentPage === 'song' ? 'active' : '',
      onclick: () => {
        // Navigate back to songs - pick a random song if none selected
        if (state.song) {
          window.m.route.set(`/${state.song.playlist}/${state.song.title}`)
        } else {
          // Pick a random song
          let items = state.results.data.items
          if (items.length > 0) {
            const randomIndex = Math.floor(Math.random() * items.length)
            const song = items[randomIndex]
            window.m.route.set(`/${song.playlist}/${song.title}`)
          }
        }
      },
    },
    '🎼 Songs'
  )

export const MetronomeLink = ({ state, update }) =>
  m(
    'button.setlist__header__metronome',
    {
      class: state.currentPage === 'metronome' ? 'active' : '',
      onclick: () => {
        // Navigate to metronome page
        window.m.route.set('/metronome')
      },
    },
    '🎵 Metronome'
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
