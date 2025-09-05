import m from 'mithril'
import { reverseComposerName } from './ireal'
import { Song } from './State'
import './styles/search.css'

// Get songs from global window object (same as SetlistEditor)
const getSongs = (): any[] => {
  return (window as any).songs || []
}

// Shared search state using closure
const createSearchComponents = (() => {
  let searchQuery = ''

  const SearchResults = (cell: any) => {
    const { state, update } = cell
    const songs = getSongs()

    // Simple filtering function
    const getFilteredSongs = () => {
      if (searchQuery.trim()) {
        return songs
          .filter(
            (song: any) =>
              song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
              song.composer.toLowerCase().includes(searchQuery.toLowerCase()) ||
              song.style.toLowerCase().includes(searchQuery.toLowerCase()) ||
              song.playlist.toLowerCase().includes(searchQuery.toLowerCase())
          )
          .slice(0, 100) // Limit for performance
      } else {
        return songs.slice(0, 100)
      }
    }

    const filteredSongs = getFilteredSongs()

    return m('.setlist__songbox', [
      m('.results-count', `${filteredSongs.length} results`),
      filteredSongs.map((song: Song) => SongResult(song, { update })),
    ])
  }

  const SearchInput = ({ state, update }) => {
    return m(
      '.setlist__header__search',
      m('input.setlist__header__search__input', {
        type: 'text',
        placeholder: 'Search songs...',
        value: searchQuery,
        oninput: e => {
          searchQuery = e.currentTarget.value
          m.redraw()
        },
        oncreate: vnode => {
          vnode.dom.focus()
        },
      }),
      ClearQuery({
        onClear: () => {
          searchQuery = ''
        },
      })
    )
  }

  return { SearchResults, SearchInput }
})()

export const SearchResults = createSearchComponents.SearchResults
export const SearchInput = createSearchComponents.SearchInput

export const SongResult = (song: Song, { update }) =>
  m(
    'button.setlist__songbox__song',
    {
      id: song.title,
      onclick: () => {
        update({ song })
      },
    },
    [SongTitle(song), SongComposer(song), SongStyle(song)]
  )

export const SongTitle = (song: Song) => m('.title', song.title)

export const SongComposer = (song: Song) =>
  m('.composer', reverseComposerName(song.composer))

export const SongStyle = (song: Song) => m('.style', song.style)

export const ClearQuery = ({ onClear }) =>
  m(
    'button.setlist__header__search__clear',
    {
      onclick: () => {
        if (onClear) onClear()
        const input = document.getElementsByClassName(
          'setlist__header__search__input'
        )[0] as HTMLInputElement
        if (input) input.focus()
        m.redraw()
      },
    },
    '✗'
  )
