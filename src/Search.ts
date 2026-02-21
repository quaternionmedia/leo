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
  let selectedStyles = new Set() // Track selected styles
  let styleFilterOpen = false
  let selectedKeys = new Set() // Track selected keys
  let keyFilterOpen = false
  let selectedComposers = new Set() // Track selected composers
  let composerFilterOpen = false

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

      // Filter by selected styles
      if (selectedStyles.size > 0) {
        filtered = filtered.filter((song: any) =>
          selectedStyles.has(song.style)
        )
      }

      // Filter by selected keys
      if (selectedKeys.size > 0) {
        filtered = filtered.filter((song: any) =>
          selectedKeys.has(song.key)
        )
      }

      // Filter by selected composers
      if (selectedComposers.size > 0) {
        filtered = filtered.filter((song: any) =>
          selectedComposers.has(song.composer)
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

  let filterDrawerOpen = false

  // Helper to render a subdrawer section with checkboxes
  const SubDrawer = (
    label: string,
    isOpen: boolean,
    toggle: () => void,
    selected: Set<unknown>,
    items: string[],
    toggleItem: (item: string, checked: boolean) => void,
    selectAll: () => void,
    songCount: (item: string) => number
  ) => {
    const badge = selected.size > 0 ? ` (${selected.size})` : ''
    return m('div.filter-subdrawer', [
      m(
        'button.filter-subdrawer-toggle',
        {
          onclick: (e: Event) => {
            e.stopPropagation()
            toggle()
          },
          class: isOpen ? 'open' : '',
        },
        [
          m('span', label + badge),
          m('span.toggle-icon', isOpen ? '▼' : '▶'),
        ]
      ),
      isOpen
        ? m('div.filter-subdrawer-content', [
            m(
              'div.playlist-controls',
              m(
                'button.btn.btn--small',
                { onclick: selectAll },
                selected.size === items.length ? 'Deselect All' : 'Select All'
              )
            ),
            m(
              'div.playlist-checkboxes',
              items.map(item =>
                m('label.playlist-checkbox', [
                  m('input[type=checkbox]', {
                    checked: selected.has(item),
                    onchange: e => toggleItem(item, e.target.checked),
                  }),
                  m('span', item),
                  m('span.song-count', ` (${songCount(item)})`),
                ])
              )
            ),
          ])
        : null,
    ])
  }

  const FilterDrawer = ({ state, update }) => {
    const songs = getSongs()
    const setlists = loadSetlists()

    const playlists = [...new Set(songs.map((song: any) => song.playlist))].sort()
    const styles = [...new Set(songs.map((song: any) => song.style).filter(Boolean))].sort()
    const keys = [...new Set(songs.map((song: any) => song.key).filter(Boolean))].sort()
    const composers = [...new Set(songs.map((song: any) => song.composer).filter(Boolean))].sort()

    const togglePlaylistCheckbox = (playlist: string, checked: boolean) => {
      if (checked) {
        selectedPlaylists.add(playlist)
      } else {
        selectedPlaylists.delete(playlist)
      }
      selectedSetlistId = null
      m.redraw()
    }

    const toggleSetlist = (id: string) => {
      selectedSetlistId = selectedSetlistId === id ? null : id
      if (selectedSetlistId) selectedPlaylists.clear()
      m.redraw()
    }

    const activeFilterCount =
      (selectedPlaylists.size > 0 ? 1 : 0) +
      (selectedSetlistId ? 1 : 0) +
      (selectedStyles.size > 0 ? 1 : 0) +
      (selectedKeys.size > 0 ? 1 : 0) +
      (selectedComposers.size > 0 ? 1 : 0)

    const mainLabel = activeFilterCount > 0
      ? `Filters (${activeFilterCount} active)`
      : 'Filters'

    return m('div.playlist-filter', [
      m(
        'button.playlist-filter-toggle',
        {
          onclick: () => {
            filterDrawerOpen = !filterDrawerOpen
            m.redraw()
          },
          class: filterDrawerOpen ? 'open' : '',
        },
        [
          m('span', mainLabel),
          m('span.toggle-icon', filterDrawerOpen ? '▼' : '▶'),
        ]
      ),
      filterDrawerOpen
        ? m('div.playlist-options', [
            // Playlist subdrawer
            SubDrawer(
              'Playlist',
              playlistFilterOpen,
              () => { playlistFilterOpen = !playlistFilterOpen; m.redraw() },
              selectedPlaylists,
              playlists,
              togglePlaylistCheckbox,
              () => {
                if (selectedPlaylists.size === playlists.length) {
                  selectedPlaylists.clear()
                } else {
                  selectedPlaylists = new Set(playlists)
                  selectedSetlistId = null
                }
                m.redraw()
              },
              item => songs.filter((s: any) => s.playlist === item).length
            ),
            // Setlists section (radio buttons, inside playlist area)
            setlists.length > 0
              ? m('div.filter-subdrawer', [
                  m('div.playlist-section-label', { style: 'padding: 6px 12px 2px' }, 'Setlists'),
                  m(
                    'div.playlist-checkboxes',
                    { style: 'padding: 0 12px 8px' },
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
                ])
              : null,
            m('div.playlist-section-divider'),
            // Style subdrawer
            SubDrawer(
              'Style',
              styleFilterOpen,
              () => { styleFilterOpen = !styleFilterOpen; m.redraw() },
              selectedStyles,
              styles,
              (style, checked) => {
                if (checked) selectedStyles.add(style); else selectedStyles.delete(style)
                m.redraw()
              },
              () => {
                if (selectedStyles.size === styles.length) selectedStyles.clear()
                else selectedStyles = new Set(styles)
                m.redraw()
              },
              item => songs.filter((s: any) => s.style === item).length
            ),
            m('div.playlist-section-divider'),
            // Key subdrawer
            SubDrawer(
              'Key',
              keyFilterOpen,
              () => { keyFilterOpen = !keyFilterOpen; m.redraw() },
              selectedKeys,
              keys,
              (key, checked) => {
                if (checked) selectedKeys.add(key); else selectedKeys.delete(key)
                m.redraw()
              },
              () => {
                if (selectedKeys.size === keys.length) selectedKeys.clear()
                else selectedKeys = new Set(keys)
                m.redraw()
              },
              item => songs.filter((s: any) => s.key === item).length
            ),
            m('div.playlist-section-divider'),
            // Composer subdrawer
            SubDrawer(
              'Composer',
              composerFilterOpen,
              () => { composerFilterOpen = !composerFilterOpen; m.redraw() },
              selectedComposers,
              composers,
              (composer, checked) => {
                if (checked) selectedComposers.add(composer); else selectedComposers.delete(composer)
                m.redraw()
              },
              () => {
                if (selectedComposers.size === composers.length) selectedComposers.clear()
                else selectedComposers = new Set(composers)
                m.redraw()
              },
              item => songs.filter((s: any) => s.composer === item).length
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

    // Filter by selected styles
    if (selectedStyles.size > 0) {
      filtered = filtered.filter((song: any) =>
        selectedStyles.has(song.style)
      )
    }

    // Filter by selected keys
    if (selectedKeys.size > 0) {
      filtered = filtered.filter((song: any) =>
        selectedKeys.has(song.key)
      )
    }

    // Filter by selected composers
    if (selectedComposers.size > 0) {
      filtered = filtered.filter((song: any) =>
        selectedComposers.has(song.composer)
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
    FilterDrawer,
    getFilteredSongs,
    getSelectedPlaylists,
  }
})()

export const SearchResults = createSearchComponents.SearchResults
export const SearchInput = createSearchComponents.SearchInput
export const FilterDrawer = createSearchComponents.FilterDrawer
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
