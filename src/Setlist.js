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
      SetlistEditorLink(cell),
    ),
    SearchResults(cell),
  ])

export const SetlistEditorLink = ({ state, update }) =>
  m(
    'button.setlist__header__editor',
    {
      class: state.currentPage === 'setlist-editor' ? 'active' : '',
      onclick: () => {
        // Navigate to setlist editor
        m.route.set('/setlists')
      },
    },
    '📝 Setlists'
  )

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
          // Pick a random song from global songs array
          const songs = window.songs || []
          if (songs.length > 0) {
            const randomIndex = Math.floor(Math.random() * songs.length)
            const song = songs[randomIndex]
            window.m.route.set(`/${song.playlist}/${song.title}`)
          }
        }
      },
    },
    '🎼 Songs'
  )

export const RandomSong = ({ state, update }) => {
  const songs = window.songs || []
  return m(
    'button.setlist__header__random',
    {
      disabled: songs.length === 0,
      onclick: () => {
        // Check if there are any songs
        if (songs.length === 0) {
          return
        }
        const randomIndex = Math.floor(Math.random() * songs.length)
        update({
          song: songs[randomIndex],
        })
      },
    },
    '🎲'
  )
}

/* change song */
document.addEventListener('keydown', e => {
  if (e.key === '`') {
    document.getElementsByClassName('setlist__header__random')[0].click()
  }
})

//export const Menu = attrs => m('.menu', attrs, [m(''), m(''), m('')])
