import m from 'mithril'
import { reverseComposerName } from './ireal'
import { Song } from './State'
import './styles/search.css'
import './styles/setlist-editor.css' // Import for available-song-item styles

// Get songs from global window object (same as SetlistEditor)
const getSongs = (): any[] => {
  return (window as any).songs || []
}

// Shared search state using closure
const createSearchComponents = (() => {
  let searchQuery = ''
  let selectedPlaylists = new Set() // Track selected playlists
  let playlistFilterOpen = false // Track if playlist filter is open

  const SearchResults = (cell: any) => {
    const { state, update } = cell
    const songs = getSongs()

    // Simple filtering function
    const getFilteredSongs = () => {
      let filtered = songs

      // Filter by selected playlists
      if (selectedPlaylists.size > 0) {
        filtered = filtered.filter((song: any) =>
          selectedPlaylists.has(song.playlist)
        )
      }

      // Filter by search query
      if (searchQuery.trim()) {
        filtered = filtered.filter(
          (song: any) =>
            song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            song.composer.toLowerCase().includes(searchQuery.toLowerCase()) ||
            song.style.toLowerCase().includes(searchQuery.toLowerCase()) ||
            song.playlist.toLowerCase().includes(searchQuery.toLowerCase())
        )
      }

      return filtered.slice(0, 100) // Limit for performance
    }

    const filteredSongs = getFilteredSongs()

    return m('.setlist__songbox', [
      m('.results-count', `${filteredSongs.length} results`),
      filteredSongs.map((song: Song) => SearchSongItem(song, { update })),
    ])
  }

  const PlaylistFilter = ({ state, update }) => {
    const songs = getSongs()
    // Get unique playlists
    const playlists = [
      ...new Set(songs.map((song: any) => song.playlist)),
    ].sort()

    return m('div.playlist-filter', [
      m(
        'button.playlist-filter-toggle',
        {
          onclick: () => {
            playlistFilterOpen = !playlistFilterOpen
            m.redraw()
          },
          class: playlistFilterOpen ? 'open' : '',
        },
        [
          m('span', 'Filter by Playlist'),
          m('span.toggle-icon', playlistFilterOpen ? '▼' : '▶'),
        ]
      ),
      playlistFilterOpen
        ? m('div.playlist-options', [
            m(
              'div.playlist-controls',
              m(
                'button.btn.btn--small',
                {
                  onclick: () => {
                    if (selectedPlaylists.size === playlists.length) {
                      selectedPlaylists.clear()
                    } else {
                      selectedPlaylists = new Set(playlists)
                    }
                    m.redraw()
                  },
                },
                selectedPlaylists.size === playlists.length
                  ? 'Deselect All'
                  : 'Select All'
              )
            ),
            m(
              'div.playlist-checkboxes',
              playlists.map(playlist =>
                m('label.playlist-checkbox', [
                  m('input[type=checkbox]', {
                    checked: selectedPlaylists.has(playlist),
                    onchange: e => {
                      if (e.target.checked) {
                        selectedPlaylists.add(playlist)
                      } else {
                        selectedPlaylists.delete(playlist)
                      }
                      m.redraw()
                    },
                  }),
                  m('span', playlist),
                  m(
                    'span.song-count',
                    ` (${
                      songs.filter((s: any) => s.playlist === playlist).length
                    })`
                  ),
                ])
              )
            ),
          ])
        : null,
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

  // Helper function to get filtered songs based on current playlist selection
  const getFilteredSongs = () => {
    const songs = getSongs()
    let filtered = songs

    // Filter by selected playlists
    if (selectedPlaylists.size > 0) {
      filtered = filtered.filter((song: any) =>
        selectedPlaylists.has(song.playlist)
      )
    }

    // Note: We don't include search query filtering here because
    // navigation buttons should work with all songs in selected playlists,
    // not just those matching the current search

    return filtered
  }

  // Helper function to get selected playlists
  const getSelectedPlaylists = () => {
    return Array.from(selectedPlaylists)
  }

  return {
    SearchResults,
    SearchInput,
    PlaylistFilter,
    getFilteredSongs,
    getSelectedPlaylists,
  }
})()

export const SearchResults = createSearchComponents.SearchResults
export const SearchInput = createSearchComponents.SearchInput
export const PlaylistFilter = createSearchComponents.PlaylistFilter
export const getFilteredSongs = createSearchComponents.getFilteredSongs
export const getSelectedPlaylists = createSearchComponents.getSelectedPlaylists

export const SearchSongItem = (song: Song, { update }) => {
  const tempo = song.bpm || song.tempo
  const tempoText = tempo ? ` • ${tempo} BPM` : ''
  const timeText = song.time ? ` • ${song.time}` : ''
  const musicText = song.music || song.songText ? ' • Has music data' : ''

  return m('div.available-song-item.search-song-item', [
    m(
      'div.song-info',
      {
        onclick: () => {
          update({ song })
          // Navigate to the song using the new route format
          m.route.set(
            `/song/${encodeURIComponent(
              song.title
            )}?playlist=${encodeURIComponent(song.playlist)}`
          )
        },
        style: 'cursor: pointer;',
      },
      [
        m('div.song-title', song.title),
        m(
          'div.song-meta',
          `${song.composer} • ${song.style} • ${song.key}${tempoText}${timeText}${musicText}`
        ),
      ]
    ),
  ])
}

export const SongResult = (song: Song, { update }: { update: any }) =>
  SearchSongItem(song, { update })

export const SongTitle = (song: Song) => m('.title', song.title)

export const SongComposer = (song: Song) =>
  m('.composer', reverseComposerName(song.composer))

export const SongStyle = (song: Song) => m('.style', song.style)

export const ClearQuery = ({ onClear }: { onClear: () => void }) =>
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
