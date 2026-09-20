import m from 'mithril'
import './styles/setlist.css'
import { SearchResults, SearchInput, FilterDrawer } from './Search'
import { SetlistBuilder } from './SetlistBuilder'

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

// Tab state for switching between search and setlist builder
let activeTab = 'search' // 'search' | 'setlists'

export const SetlistMenu = cell => {
  const { state, update } = cell

  // Two tabs over one menu: the search, with the filter drawer over playlist,
  // setlist, style, key and composer, and the builder for the user's own
  // setlists. The drawer's setlist filter reads the builder's setlists, so a
  // setlist made in one tab is a filter in the other.
  return m('main.setlist', [
    SetlistTabs(cell),
    activeTab === 'search'
      ? [
          m('.setlist__controls', [
            // Call search components as functions, not Mithril components
            SearchInput({ state, update }),
            FilterDrawer({ state, update }),
            m('.setlist__controls-row', [SongsLink({ state, update })]),
          ]),
          SearchResults(cell),
        ]
      : SetlistBuilder(cell),
  ])
}

export const SetlistTabs = cell =>
  m('div.setlist__tabs', [
    m('button.setlist__tab', {
      class: activeTab === 'search' ? 'active' : '',
      onclick: () => { activeTab = 'search' },
    }, '🔍 Search'),
    m('button.setlist__tab', {
      class: activeTab === 'setlists' ? 'active' : '',
      onclick: () => { activeTab = 'setlists' },
    }, '📋 Setlists'),
  ])

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
