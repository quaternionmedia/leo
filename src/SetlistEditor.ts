import m from 'mithril'
import { State, SetlistState, Song } from './State'
import { MeiosisCell } from 'meiosis-setup/types'
import './styles/setlist-editor.css'

// Get songs from global window object (since it's exposed there in index.ts)
const getSongs = (): any[] => {
  return (window as any).songs || []
}

// Service for managing setlists in localStorage
export const setlistService = {
  // Load setlists from localStorage
  loadSetlists: (): SetlistState[] => {
    const stored = localStorage.getItem('setlists')
    return stored ? JSON.parse(stored) : []
  },

  // Save setlists to localStorage
  saveSetlists: (setlists: SetlistState[]) => {
    localStorage.setItem('setlists', JSON.stringify(setlists))
  },

  // Create a new setlist
  createSetlist: (name: string): SetlistState => {
    const now = new Date().toISOString()
    return {
      id: `setlist_${Date.now()}`,
      name,
      songs: [],
      createdAt: now,
      updatedAt: now,
    }
  },

  // Update an existing setlist
  updateSetlist: (
    setlists: SetlistState[],
    updatedSetlist: SetlistState
  ): SetlistState[] => {
    return setlists.map(setlist =>
      setlist.id === updatedSetlist.id
        ? { ...updatedSetlist, updatedAt: new Date().toISOString() }
        : setlist
    )
  },

  // Delete a setlist
  deleteSetlist: (
    setlists: SetlistState[],
    setlistId: string
  ): SetlistState[] => {
    return setlists.filter(setlist => setlist.id !== setlistId)
  },
}

// Initialize setlists from localStorage
export const initializeSetlists = (cell: MeiosisCell<State>) => {
  const setlists = setlistService.loadSetlists()
  cell.update({ setlists })
}

// SetlistEditor main component
export const SetlistEditor = (cell: MeiosisCell<State>) => {
  const { state, update } = cell

  console.log(
    'SetlistEditor render - mode:',
    state.setlistEditorMode,
    'currentSetlist:',
    state.currentSetlist
  )

  return m('div.setlist-editor', [
    SetlistEditorHeader(cell),
    state.setlistEditorMode === 'create'
      ? CreateSetlistForm(cell)
      : state.currentSetlist
      ? EditSetlistForm(cell)
      : SetlistsList(cell),
  ])
}

// Header with navigation and actions
const SetlistEditorHeader = (cell: MeiosisCell<State>) => {
  const { state, update } = cell

  return m('div.setlist-editor__header', [
    m('h1', 'Setlist Manager'),
    m('div.setlist-editor__actions', [
      // Back to songs button
      m(
        'button.btn.btn--secondary',
        {
          onclick: () => {
            // Navigate back to songs
            if (state.song) {
              m.route.set(`/${state.song.playlist}/${state.song.title}`)
            } else {
              // Pick a random song
              const songs = getSongs()
              const randomSong = songs[Math.floor(Math.random() * songs.length)]
              update({ song: randomSong })
              m.route.set(`/${randomSong.playlist}/${randomSong.title}`)
            }
          },
        },
        'Back to Songs'
      ),

      // Create new setlist button
      state.setlistEditorMode !== 'create'
        ? m(
            'button.btn.btn--primary',
            {
              onclick: () =>
                update({
                  setlistEditorMode: 'create',
                  currentSetlist: undefined,
                }),
            },
            'Create New Setlist'
          )
        : null,
    ]),
  ])
}

// Form for creating a new setlist
const CreateSetlistForm = (() => {
  let setlistName = ''

  return (cell: MeiosisCell<State>) => {
    const { state, update } = cell

    return m('div.setlist-form', [
      m('h2', 'Create New Setlist'),
      m(
        'form',
        {
          onsubmit: (e: Event) => {
            e.preventDefault()
            console.log('Form submitted with name:', setlistName)
            if (setlistName.trim()) {
              const newSetlist = setlistService.createSetlist(
                setlistName.trim()
              )
              const updatedSetlists = [...state.setlists, newSetlist]
              setlistService.saveSetlists(updatedSetlists)
              console.log('Created setlist:', newSetlist)
              console.log('Updated setlists:', updatedSetlists)
              update({
                setlists: updatedSetlists,
                currentSetlist: newSetlist,
                setlistEditorMode: 'edit',
              })
              setlistName = '' // Clear the form after successful creation
            }
          },
        },
        [
          m('div.form-group', [
            m('label', 'Setlist Name'),
            m('input[type=text]', {
              placeholder: 'Enter setlist name...',
              value: setlistName,
              oninput: (e: any) => {
                setlistName = e.target.value
                console.log('Input changed:', setlistName)
              },
              required: true,
            }),
          ]),
          m('div.form-actions', [
            m('button[type=submit].btn.btn--primary', 'Create Setlist'),
            m(
              'button[type=button].btn.btn--secondary',
              {
                onclick: () => {
                  setlistName = '' // Clear the form when canceling
                  update({ setlistEditorMode: 'edit' })
                },
              },
              'Cancel'
            ),
          ]),
        ]
      ),
    ])
  }
})()

// List of existing setlists
const SetlistsList = (cell: MeiosisCell<State>) => {
  const { state, update } = cell

  return m('div.setlists-list', [
    m('h2', 'Your Setlists'),
    state.setlists.length === 0
      ? m('div.empty-state', [
          m('p', 'No setlists created yet.'),
          m(
            'button.btn.btn--primary',
            {
              onclick: () => update({ setlistEditorMode: 'create' }),
            },
            'Create Your First Setlist'
          ),
        ])
      : [
          m(
            'div.setlists-grid',
            state.setlists.map((setlist: SetlistState) =>
              SetlistCard(setlist, cell)
            )
          ),
        ],
  ])
}

// Individual setlist card
const SetlistCard = (setlist: SetlistState, cell: MeiosisCell<State>) => {
  const { update } = cell

  return m('div.setlist-card', [
    m('div.setlist-card__header', [
      m('h3.setlist-card__title', setlist.name),
      m('div.setlist-card__meta', [
        m('span.song-count', `${setlist.songs.length} songs`),
        m(
          'span.created-date',
          new Date(setlist.createdAt).toLocaleDateString()
        ),
      ]),
    ]),
    m(
      'div.setlist-card__songs',
      setlist.songs
        .slice(0, 3)
        .map((song: Song) =>
          m('div.setlist-card__song', `${song.title} - ${song.composer}`)
        ),
      setlist.songs.length > 3
        ? m('div.setlist-card__more', `+${setlist.songs.length - 3} more`)
        : null
    ),
    m('div.setlist-card__actions', [
      m(
        'button.btn.btn--primary',
        {
          onclick: () =>
            update({
              currentSetlist: setlist,
              setlistEditorMode: 'edit',
            }),
        },
        'Edit'
      ),
      m(
        'button.btn.btn--danger',
        {
          onclick: () => {
            if (confirm(`Delete setlist "${setlist.name}"?`)) {
              const updatedSetlists = setlistService.deleteSetlist(
                cell.state.setlists,
                setlist.id
              )
              setlistService.saveSetlists(updatedSetlists)
              update({ setlists: updatedSetlists })
            }
          },
        },
        'Delete'
      ),
    ]),
  ])
}

// Form for editing an existing setlist
const EditSetlistForm = (cell: MeiosisCell<State>) => {
  const { state, update } = cell
  const setlist = state.currentSetlist!

  let setlistName = setlist.name
  let searchQuery = ''
  const songs = getSongs()
  let filteredSongs = songs.slice(0, 50) // Limit to first 50 for performance

  // Filter songs based on search
  const updateFilteredSongs = (query: string) => {
    if (query.trim()) {
      filteredSongs = songs
        .filter(
          (song: any) =>
            song.title.toLowerCase().includes(query.toLowerCase()) ||
            song.composer.toLowerCase().includes(query.toLowerCase())
        )
        .slice(0, 50)
    } else {
      filteredSongs = songs.slice(0, 50)
    }
  }

  const addSongToSetlist = (song: Song) => {
    // Check if song is already in setlist
    if (
      !setlist.songs.find(
        s => s.title === song.title && s.playlist === song.playlist
      )
    ) {
      const updatedSetlist = {
        ...setlist,
        songs: [...setlist.songs, song],
      }
      const updatedSetlists = setlistService.updateSetlist(
        state.setlists,
        updatedSetlist
      )
      setlistService.saveSetlists(updatedSetlists)
      update({
        setlists: updatedSetlists,
        currentSetlist: updatedSetlist,
      })
    }
  }

  const removeSongFromSetlist = (songIndex: number) => {
    const updatedSetlist = {
      ...setlist,
      songs: setlist.songs.filter((_, index) => index !== songIndex),
    }
    const updatedSetlists = setlistService.updateSetlist(
      state.setlists,
      updatedSetlist
    )
    setlistService.saveSetlists(updatedSetlists)
    update({
      setlists: updatedSetlists,
      currentSetlist: updatedSetlist,
    })
  }

  const updateSetlistName = () => {
    if (setlistName.trim() && setlistName !== setlist.name) {
      const updatedSetlist = {
        ...setlist,
        name: setlistName.trim(),
      }
      const updatedSetlists = setlistService.updateSetlist(
        state.setlists,
        updatedSetlist
      )
      setlistService.saveSetlists(updatedSetlists)
      update({
        setlists: updatedSetlists,
        currentSetlist: updatedSetlist,
      })
    }
  }

  return m('div.setlist-form', [
    // Setlist name editor
    m('div.setlist-name-editor', [
      m('input[type=text].setlist-name-input', {
        value: setlistName,
        oninput: (e: any) => (setlistName = e.target.value),
        onblur: updateSetlistName,
        onkeypress: (e: any) => {
          if (e.key === 'Enter') {
            e.target.blur()
          }
        },
      }),
      m('div.setlist-meta', `${setlist.songs.length} songs`),
    ]),

    m('div.setlist-editor-content', [
      // Current setlist songs
      m('div.current-setlist', [
        m('h3', 'Songs in Setlist'),
        setlist.songs.length === 0
          ? m(
              'div.empty-setlist',
              'No songs added yet. Search and add songs from the right.'
            )
          : m(
              'div.setlist-songs',
              setlist.songs.map((song: Song, index: number) =>
                SetlistSongItem(song, index, removeSongFromSetlist)
              )
            ),
      ]),

      // Song search and add
      m('div.song-search', [
        m('h3', 'Add Songs'),
        m('div.search-input', [
          m('input[type=text]', {
            placeholder: 'Search songs...',
            oninput: (e: any) => {
              searchQuery = e.target.value
              updateFilteredSongs(searchQuery)
              m.redraw()
            },
          }),
        ]),
        m(
          'div.available-songs',
          filteredSongs.map((song: Song) =>
            AvailableSongItem(song, addSongToSetlist, setlist)
          )
        ),
      ]),
    ]),

    // Actions
    m('div.form-actions', [
      m(
        'button.btn.btn--secondary',
        {
          onclick: () =>
            update({
              setlistEditorMode: 'edit',
              currentSetlist: undefined,
            }),
        },
        'Back to Setlists'
      ),
    ]),
  ])
}

// Song item in the current setlist
const SetlistSongItem = (
  song: Song,
  index: number,
  onRemove: (index: number) => void
) => {
  return m('div.setlist-song-item', [
    m('div.song-info', [
      m('div.song-title', song.title),
      m('div.song-meta', `${song.composer} • ${song.style} • ${song.key}`),
    ]),
    m(
      'button.btn.btn--small.btn--danger',
      {
        onclick: () => onRemove(index),
        title: 'Remove from setlist',
      },
      '×'
    ),
  ])
}

// Available song item to add to setlist
const AvailableSongItem = (
  song: Song,
  onAdd: (song: Song) => void,
  currentSetlist: SetlistState
) => {
  const isInSetlist = currentSetlist.songs.find(
    s => s.title === song.title && s.playlist === song.playlist
  )

  return m(
    'div.available-song-item',
    {
      class: isInSetlist ? 'in-setlist' : '',
    },
    [
      m('div.song-info', [
        m('div.song-title', song.title),
        m('div.song-meta', `${song.composer} • ${song.style} • ${song.key}`),
      ]),
      isInSetlist
        ? m('span.in-setlist-indicator', '✓')
        : m(
            'button.btn.btn--small.btn--primary',
            {
              onclick: () => onAdd(song),
              title: 'Add to setlist',
            },
            '+'
          ),
    ]
  )
}
