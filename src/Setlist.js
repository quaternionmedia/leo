import m from 'mithril'
import './styles/setlist.css'
import { SearchResults, SearchInput, PlaylistFilter } from './Search'

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

const SetlistMenu = cell => {
  const { state, update } = cell

  return m(
    'main.setlist',
    m('.setlist__controls', [
      // Call search components as functions, not Mithril components
      SearchInput({ state, update }),
      PlaylistFilter({ state, update }),
      m('.setlist__controls-row', [
        SongsLink({ state, update }),
      ]),
    ]),
    SearchResults(cell)
  )
}

export { SetlistMenu }

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
          window.m.route.set(`/song/${encodeURIComponent(state.song.title)}?playlist=${encodeURIComponent(state.song.playlist)}`)
        } else {
          // Pick a random song from global songs array
          const songs = window.songs || []
          if (songs.length > 0) {
            const randomIndex = Math.floor(Math.random() * songs.length)
            const song = songs[randomIndex]
            window.m.route.set(`/song/${encodeURIComponent(song.title)}?playlist=${encodeURIComponent(song.playlist)}`)
          }
        }
      },
    },
    '🎼 Songs'
  )



/* change song */
document.addEventListener('keydown', e => {
  if (e.key === '`') {
    document.getElementsByClassName('setlist__header__random')[0].click()
  }
})

//export const Menu = attrs => m('.menu', attrs, [m(''), m(''), m('')])
