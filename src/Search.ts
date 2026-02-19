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
  let selectedSetlistId: string | null = null // Track selected setlist

  const loadSetlists = (): any[] => {
    const stored = localStorage.getItem('setlists')
    return stored ? JSON.parse(stored) : []
  }

  const getSetlistSongs = (): any[] => {
    if (!selectedSetlistId) return []
    const setlist = loadSetlists().find((s: any) => s.id === selectedSetlistId)
    return setlist ? setlist.songs : []
  }

  const SearchResults = (cell: any) => {
    const { state, update } = cell
    const songs = getSongs()

    // Simple filtering function
    const getFilteredSongs = () => {
      let filtered: any[]

      if (selectedSetlistId) {
        filtered = getSetlistSongs()
      } else {
        filtered = songs
        // Filter by selected playlists
        if (selectedPlaylists.size > 0) {
          filtered = filtered.filter((song: any) =>
            selectedPlaylists.has(song.playlist)
          )
        }
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
    const setlists = loadSetlists()
    // Get unique playlists
    const playlists = [
      ...new Set(songs.map((song: any) => song.playlist)),
    ].sort()

    const togglePlaylistCheckbox = (playlist: string, checked: boolean) => {
      if (checked) {
        selectedPlaylists.add(playlist)
      } else {
        selectedPlaylists.delete(playlist)
      }
      selectedSetlistId = null // clear setlist selection when using playlist filter
      m.redraw()
    }

    const toggleSetlist = (id: string) => {
      selectedSetlistId = selectedSetlistId === id ? null : id
      if (selectedSetlistId) selectedPlaylists.clear() // clear playlist filter when using setlist
      m.redraw()
    }

    const activeLabel = selectedSetlistId
      ? (setlists.find((s: any) => s.id === selectedSetlistId)?.name ?? 'Setlist')
      : selectedPlaylists.size > 0
      ? `${selectedPlaylists.size}/${playlists.length} playlists`
      : 'Filter by Playlist'

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
          m('span', activeLabel),
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
                      selectedSetlistId = null
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
                    onchange: e => togglePlaylistCheckbox(playlist, e.target.checked),
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
            setlists.length > 0
              ? [
                  m('div.playlist-section-divider'),
                  m('div.playlist-section-label', 'Setlists'),
                  m(
                    'div.playlist-checkboxes',
                    setlists.map((setlist: any) =>
                      m(
                        'label.playlist-checkbox',
                        {
                          class: selectedSetlistId === setlist.id ? 'active-setlist-filter' : '',
                        },
                        [
                          m('input[type=radio]', {
                            name: 'setlist-filter',
                            checked: selectedSetlistId === setlist.id,
                            onchange: () => toggleSetlist(setlist.id),
                          }),
                          m('span', setlist.name),
                          m('span.song-count', ` (${setlist.songs.length})`),
                        ]
                      )
                    )
                  ),
                ]
              : null,
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

  // Helper function to get filtered songs based on current playlist/setlist selection
  const getFilteredSongs = () => {
    if (selectedSetlistId) {
      return getSetlistSongs()
    }

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
