import m from 'mithril'
import { State, SetlistState, Song } from './State'
import { MeiosisCell } from 'meiosis-setup/types'
import './styles/setlist-editor.css'

// Make handleSetlistHashNavigation accessible globally
declare global {
  interface Window {
    handleSetlistHashNavigation?: (hash: string) => void
  }
}

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

// Service for managing custom songs in localStorage
export const songService = {
  // Load custom songs from localStorage
  loadCustomSongs: (): Song[] => {
    const stored = localStorage.getItem('songs')
    return stored ? JSON.parse(stored) : []
  },

  // Save custom songs to localStorage
  saveCustomSongs: (songs: Song[]) => {
    localStorage.setItem('songs', JSON.stringify(songs))
  },

  // Create a new song
  createSong: (songData: Omit<Song, 'playlist'>): Song => {
    return {
      ...songData,
      playlist: 'Custom Songs', // All user-created songs go into "Custom Songs" playlist
    }
  },

  // Add a new song to the custom songs collection
  addCustomSong: (songData: Omit<Song, 'playlist'>): Song => {
    const newSong = songService.createSong(songData)
    const customSongs = songService.loadCustomSongs()
    const updatedSongs = [...customSongs, newSong]
    songService.saveCustomSongs(updatedSongs)

    // Also update the global songs array
    const globalSongs = (window as any).songs || []
    globalSongs.push(newSong)

    return newSong
  },
}

// Initialize setlists from localStorage
export const initializeSetlists = (cell: MeiosisCell<State>) => {
  const setlists = setlistService.loadSetlists()
  console.log(
    'initializeSetlists: Loaded setlists from localStorage:',
    setlists
  )
  console.log('initializeSetlists: Number of setlists:', setlists.length)

  // Also ensure custom songs are loaded into the global songs array
  const customSongs = songService.loadCustomSongs()
  const globalSongs = (window as any).songs || []

  // Add custom songs to global array if they're not already there
  customSongs.forEach(customSong => {
    const exists = globalSongs.find(
      (song: any) =>
        song.title === customSong.title &&
        song.composer === customSong.composer &&
        song.playlist === customSong.playlist
    )
    if (!exists) {
      globalSongs.push(customSong)
    }
  })

  cell.update({ setlists })
  console.log(
    'initializeSetlists: Updated state with setlists. Current state:',
    cell.state.setlists
  )
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

  // Don't update hash on every render - this causes loops
  // Hash updates should only happen from user actions

  return m('div.setlist-editor', [
    BreadcrumbNavigation(cell),
    SetlistEditorHeader(cell),
    state.setlistEditorMode === 'create'
      ? CreateSetlistForm(cell)
      : state.setlistEditorMode === 'create-song'
      ? CreateSongForm(cell)
      : state.setlistEditorMode === 'edit-song'
      ? EditSongForm(cell)
      : state.currentSetlist
      ? EditSetlistForm(cell)
      : SetlistsList(cell),
  ])
}

// Breadcrumb navigation component
const BreadcrumbNavigation = (cell: MeiosisCell<State>) => {
  const { state, update } = cell

  const breadcrumbs = generateBreadcrumbs(state)

  return m('nav.breadcrumb-nav', [
    m('ol.breadcrumb', [
      breadcrumbs.map((crumb, index) =>
        m(
          'li.breadcrumb-item',
          {
            key: `${crumb.label}-${index}`,
            class: index === breadcrumbs.length - 1 ? 'active' : '',
          },
          [
            index === breadcrumbs.length - 1
              ? m('span', crumb.label)
              : m(
                  'a',
                  {
                    href: '#',
                    onclick: (e: Event) => {
                      e.preventDefault()
                      crumb.action()
                    },
                  },
                  crumb.label
                ),
            index < breadcrumbs.length - 1 ? m('span.separator', ' / ') : null,
          ]
        )
      ),
    ]),
  ])
}

// Generate breadcrumb items based on current state
const generateBreadcrumbs = (state: State) => {
  const breadcrumbs: Array<{ label: string; action: () => void }> = []

  // Always start with "Setlist Manager"
  breadcrumbs.push({
    label: 'Setlist Manager',
    action: () => {
      window.cells().update({
        setlistEditorMode: 'edit',
        currentSetlist: undefined,
        editingSong: undefined,
        setlistEditorPath: ['Setlist Manager'],
      })
      updateHash('setlists')
    },
  })

  if (state.currentSetlist) {
    breadcrumbs.push({
      label: state.currentSetlist.name,
      action: () => {
        window.cells().update({
          setlistEditorMode: 'edit',
          editingSong: undefined,
          setlistEditorPath: ['Setlist Manager', state.currentSetlist!.name],
        })
        updateHash(`setlists/${state.currentSetlist!.id}`)
      },
    })
  }

  if (state.setlistEditorMode === 'create') {
    breadcrumbs.push({
      label: 'Create New Setlist',
      action: () => {}, // No action for current page
    })
  } else if (state.setlistEditorMode === 'create-song') {
    breadcrumbs.push({
      label: 'Create New Song',
      action: () => {}, // No action for current page
    })
  } else if (state.setlistEditorMode === 'edit-song' && state.editingSong) {
    breadcrumbs.push({
      label: `Edit: ${state.editingSong.title}`,
      action: () => {}, // No action for current page
    })
  }

  return breadcrumbs
}

// Update URL hash helper function
const updateHash = (path: string) => {
  window.location.hash = `#${path}`
} // Header with navigation and actions
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
              update({ currentPage: 'song' })
              m.route.set(`/${state.song.playlist}/${state.song.title}`)
            } else {
              // Pick a random song
              const songs = getSongs()
              const randomSong = songs[Math.floor(Math.random() * songs.length)]
              update({ song: randomSong, currentPage: 'song' })
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
              onclick: () => {
                update({
                  setlistEditorMode: 'create',
                  currentSetlist: undefined,
                  setlistEditorPath: ['Setlist Manager', 'Create New Setlist'],
                })
                updateHash('setlists/create')
              },
            },
            'Create New Setlist'
          )
        : null,

      // Create new song button
      state.setlistEditorMode !== 'create' &&
      state.setlistEditorMode !== 'create-song'
        ? m(
            'button.btn.btn--secondary',
            {
              onclick: () => {
                const basePath = state.currentSetlist
                  ? [
                      'Setlist Manager',
                      state.currentSetlist.name,
                      'Create New Song',
                    ]
                  : ['Setlist Manager', 'Create New Song']
                update({
                  setlistEditorMode: 'create-song',
                  setlistEditorPath: basePath,
                })
                updateHash(
                  state.currentSetlist
                    ? `setlists/${state.currentSetlist.id}/create-song`
                    : 'setlists/create-song'
                )
              },
            },
            'Create New Song'
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
                setlistEditorPath: ['Setlist Manager', newSetlist.name],
              })
              setlistName = '' // Clear the form after successful creation
              updateHash(`setlists/${newSetlist.id}`)
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
                  update({
                    setlistEditorMode: 'edit',
                    setlistEditorPath: ['Setlist Manager'],
                  })
                  updateHash('setlists')
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

// Form for creating a new song
const CreateSongForm = (() => {
  let songTitle = ''
  let songComposer = ''
  let songStyle = ''
  let songKey = 'C'
  let songTempo = ''
  let songText = ''

  const resetForm = () => {
    songTitle = ''
    songComposer = ''
    songStyle = ''
    songKey = 'C'
    songTempo = ''
    songText = ''
  }

  return (cell: MeiosisCell<State>) => {
    const { state, update } = cell

    const handleSubmit = (e: Event) => {
      e.preventDefault()
      console.log('Creating song:', {
        songTitle,
        songComposer,
        songStyle,
        songKey,
        songTempo,
        songText,
      })

      if (songTitle.trim() && songComposer.trim()) {
        const songData: any = {
          title: songTitle.trim(),
          composer: songComposer.trim(),
          style: songStyle.trim() || 'Original',
          key: songKey,
        }

        // Add tempo if provided
        if (songTempo.trim()) {
          const tempoNumber = parseInt(songTempo.trim(), 10)
          if (!isNaN(tempoNumber) && tempoNumber > 0) {
            songData.tempo = tempoNumber
          }
        }

        // Add song text if provided
        if (songText.trim()) {
          songData.music = songText.trim()
          songData.songText = songText.trim()
        }

        const newSong = songService.addCustomSong(songData)

        console.log('Created new song:', newSong)

        // If we're editing a setlist, add the new song to it
        if (state.currentSetlist) {
          const updatedSetlist = {
            ...state.currentSetlist,
            songs: [...state.currentSetlist.songs, newSong],
          }
          const updatedSetlists = setlistService.updateSetlist(
            state.setlists,
            updatedSetlist
          )
          setlistService.saveSetlists(updatedSetlists)

          update({
            setlists: updatedSetlists,
            currentSetlist: updatedSetlist,
            setlistEditorMode: 'edit',
            setlistEditorPath: ['Setlist Manager', updatedSetlist.name],
          })
          updateHash(`setlists/${updatedSetlist.id}`)
        } else {
          // Go back to setlists view
          update({
            setlistEditorMode: 'edit',
            setlistEditorPath: ['Setlist Manager'],
          })
          updateHash('setlists')
        }

        resetForm()
      }
    }

    return m('div.setlist-form', [
      m('h2', 'Create New Song'),
      m('form', { onsubmit: handleSubmit }, [
        // Basic song information
        m('div.form-section', [
          m('h3', 'Basic Information'),

          m('div.form-group', [
            m('label', 'Song Title *'),
            m('input[type=text]', {
              placeholder: 'Enter song title...',
              value: songTitle,
              oninput: (e: any) => {
                songTitle = e.target.value
              },
              required: true,
            }),
          ]),

          m('div.form-group', [
            m('label', 'Composer *'),
            m('input[type=text]', {
              placeholder: 'Enter composer name...',
              value: songComposer,
              oninput: (e: any) => {
                songComposer = e.target.value
              },
              required: true,
            }),
          ]),

          m('div.form-row', [
            m('div.form-group.form-group--half', [
              m('label', 'Style/Genre'),
              m('input[type=text]', {
                placeholder: 'e.g. Jazz, Pop, Rock...',
                value: songStyle,
                oninput: (e: any) => {
                  songStyle = e.target.value
                },
              }),
            ]),

            m('div.form-group.form-group--half', [
              m('label', 'Key'),
              m(
                'select',
                {
                  value: songKey,
                  onchange: (e: any) => {
                    songKey = e.target.value
                  },
                },
                [
                  'C',
                  'C#',
                  'Db',
                  'D',
                  'D#',
                  'Eb',
                  'E',
                  'F',
                  'F#',
                  'Gb',
                  'G',
                  'G#',
                  'Ab',
                  'A',
                  'A#',
                  'Bb',
                  'B',
                ].map(key => m('option', { value: key }, key))
              ),
            ]),
          ]),

          m('div.form-group', [
            m('label', 'Tempo (BPM)'),
            m('input[type=number]', {
              placeholder: 'e.g. 120',
              value: songTempo,
              min: '1',
              max: '300',
              oninput: (e: any) => {
                songTempo = e.target.value
              },
            }),
            m('small.form-help', 'Beats per minute (optional)'),
          ]),
        ]),

        // Song content section
        m('div.form-section', [
          m('h3', 'Song Content'),

          // Preview and textarea in a two-column layout
          m('div.edit-form-columns', [
            // Music data input column
            m('div.edit-form-column', [
              m('div.form-group', [
                m('label', 'Song Text / Music Data'),
                m('textarea.music-textarea', {
                  placeholder:
                    'Enter iRealb music data, chord progressions, lyrics, or any other song content...',
                  value: songText,
                  rows: 12,
                  oninput: (e: any) => {
                    songText = e.target.value
                    // Force redraw to update preview
                    m.redraw()
                  },
                }),
                m(
                  'small.form-help',
                  'iRealb music format, chord progressions, lyrics, notes, etc. (optional)'
                ),
              ]),
            ]),

            // Preview column
            m('div.edit-form-column', [
              m('div.form-group', [
                m('label', 'Live Preview'),
                m('div.song-preview', {
                  oncreate: (vnode: any) => {
                    if (!songText || !state.renderer) {
                      vnode.dom.innerHTML =
                        '<div class="preview-empty">Enter music data to see preview</div>'
                      return
                    }

                    try {
                      // Create a temporary song object for preview
                      const tempSong = {
                        title: songTitle || 'Untitled',
                        composer: songComposer || 'Unknown',
                        style: songStyle || 'Original',
                        key: songKey,
                        music: songText,
                        bpm: songTempo ? parseInt(songTempo) : 0,
                        playlist: 'Custom Songs',
                      }

                      // Parse and render the song
                      state.renderer.parse(tempSong)
                      state.renderer.render(tempSong, vnode.dom)
                    } catch (error) {
                      console.warn('Preview render error:', error)
                      vnode.dom.innerHTML =
                        '<div class="preview-error">Invalid music data format</div>'
                    }
                  },
                  onupdate: (vnode: any) => {
                    if (!songText || !state.renderer) {
                      vnode.dom.innerHTML =
                        '<div class="preview-empty">Enter music data to see preview</div>'
                      return
                    }

                    try {
                      // Create a temporary song object for preview
                      const tempSong = {
                        title: songTitle || 'Untitled',
                        composer: songComposer || 'Unknown',
                        style: songStyle || 'Original',
                        key: songKey,
                        music: songText,
                        bpm: songTempo ? parseInt(songTempo) : 0,
                        playlist: 'Custom Songs',
                      }

                      // Clear previous render and render new
                      vnode.dom.innerHTML = ''
                      state.renderer.parse(tempSong)
                      state.renderer.render(tempSong, vnode.dom)
                    } catch (error) {
                      console.warn('Preview render error:', error)
                      vnode.dom.innerHTML =
                        '<div class="preview-error">Invalid music data format</div>'
                    }
                  },
                }),
                m(
                  'small.form-help',
                  'Preview updates as you type in the music data'
                ),
              ]),
            ]),
          ]),
        ]),

        m('div.form-actions', [
          m('button[type=submit].btn.btn--primary', 'Create Song'),
          m(
            'button[type=button].btn.btn--secondary',
            {
              onclick: () => {
                resetForm()
                if (state.currentSetlist) {
                  update({
                    setlistEditorMode: 'edit',
                    setlistEditorPath: [
                      'Setlist Manager',
                      state.currentSetlist.name,
                    ],
                  })
                  updateHash(`setlists/${state.currentSetlist.id}`)
                } else {
                  update({
                    setlistEditorMode: 'edit',
                    setlistEditorPath: ['Setlist Manager'],
                  })
                  updateHash('setlists')
                }
              },
            },
            'Cancel'
          ),
        ]),
      ]),
    ])
  }
})()

// Form for editing an existing song
const EditSongForm = (() => {
  let songTitle = ''
  let songComposer = ''
  let songStyle = ''
  let songKey = 'C'
  let songTempo = ''
  let songTimeSignature = ''
  let songRepeats = ''
  let songMusic = ''

  const initializeForm = (song: Song) => {
    songTitle = song.title || ''
    songComposer = song.composer || ''
    songStyle = song.style || ''
    songKey = song.key || 'C'
    songTempo = song.bpm
      ? song.bpm.toString()
      : song.tempo
      ? song.tempo.toString()
      : ''
    songTimeSignature = song.time || ''
    songRepeats = song.repeats ? song.repeats.toString() : ''
    songMusic = song.music || song.songText || ''
  }

  const resetForm = () => {
    songTitle = ''
    songComposer = ''
    songStyle = ''
    songKey = 'C'
    songTempo = ''
    songTimeSignature = ''
    songRepeats = ''
    songMusic = ''
  }

  return (cell: MeiosisCell<State>) => {
    const { state, update } = cell
    const editingSong = state.editingSong

    // Initialize form with song data if not already done
    if (editingSong && songTitle === '') {
      initializeForm(editingSong)
    }

    const handleSubmit = (e: Event) => {
      e.preventDefault()
      console.log('Updating song:', {
        songTitle,
        songComposer,
        songStyle,
        songKey,
        songTempo,
        songTimeSignature,
        songRepeats,
        songMusic,
      })

      if (songTitle.trim() && songComposer.trim() && editingSong) {
        const updatedSong: Song = {
          ...editingSong,
          title: songTitle.trim(),
          composer: songComposer.trim(),
          style: songStyle.trim() || editingSong.style,
          key: songKey,
          music: songMusic.trim() || editingSong.music,
        }

        // Add tempo if provided
        if (songTempo.trim()) {
          const tempoNumber = parseInt(songTempo.trim(), 10)
          if (!isNaN(tempoNumber) && tempoNumber > 0) {
            updatedSong.bpm = tempoNumber
            updatedSong.tempo = tempoNumber
          }
        }

        // Add time signature if provided
        if (songTimeSignature.trim()) {
          updatedSong.time = songTimeSignature.trim()
        }

        // Add repeats if provided
        if (songRepeats.trim()) {
          const repeatsNumber = parseInt(songRepeats.trim(), 10)
          if (!isNaN(repeatsNumber) && repeatsNumber > 0) {
            updatedSong.repeats = repeatsNumber
          }
        }

        // Update song in global songs array
        const globalSongs = (window as any).songs || []
        const songIndex = globalSongs.findIndex(
          (s: any) =>
            s.title === editingSong.title &&
            s.composer === editingSong.composer &&
            s.playlist === editingSong.playlist
        )

        if (songIndex !== -1) {
          globalSongs[songIndex] = updatedSong
        }

        // Update song in custom songs localStorage if it's a custom song
        if (editingSong.playlist === 'Custom Songs') {
          const customSongs = songService.loadCustomSongs()
          const customSongIndex = customSongs.findIndex(
            s =>
              s.title === editingSong.title &&
              s.composer === editingSong.composer
          )
          if (customSongIndex !== -1) {
            customSongs[customSongIndex] = updatedSong
            songService.saveCustomSongs(customSongs)
          }
        }

        // Update song in current setlist if it exists there
        if (state.currentSetlist) {
          const setlistSongIndex = state.currentSetlist.songs.findIndex(
            s =>
              s.title === editingSong.title &&
              s.composer === editingSong.composer &&
              s.playlist === editingSong.playlist
          )

          if (setlistSongIndex !== -1) {
            const updatedSetlist = {
              ...state.currentSetlist,
              songs: state.currentSetlist.songs.map((s, idx) =>
                idx === setlistSongIndex ? updatedSong : s
              ),
            }
            const updatedSetlists = setlistService.updateSetlist(
              state.setlists,
              updatedSetlist
            )
            setlistService.saveSetlists(updatedSetlists)

            update({
              setlists: updatedSetlists,
              currentSetlist: updatedSetlist,
              setlistEditorMode: 'edit',
              editingSong: undefined,
              setlistEditorPath: ['Setlist Manager', updatedSetlist.name],
            })
            updateHash(`setlists/${updatedSetlist.id}`)
          } else {
            update({
              setlistEditorMode: 'edit',
              editingSong: undefined,
              setlistEditorPath: [
                'Setlist Manager',
                state.currentSetlist!.name,
              ],
            })
            updateHash(`setlists/${state.currentSetlist!.id}`)
          }
        } else {
          update({
            setlistEditorMode: 'edit',
            editingSong: undefined,
            setlistEditorPath: ['Setlist Manager'],
          })
          updateHash('setlists')
        }

        resetForm()
        console.log('Song updated successfully:', updatedSong)
      }
    }

    if (!editingSong) {
      return m('div.setlist-form', [
        m('h2', 'No Song Selected'),
        m('p', 'Please select a song to edit.'),
        m(
          'button.btn.btn--secondary',
          {
            onclick: () => update({ setlistEditorMode: 'edit' }),
          },
          'Back'
        ),
      ])
    }

    return m('div.setlist-form', [
      m('h2', `Edit Song: ${editingSong.title}`),
      m(
        'p.edit-song-info',
        `Original: ${editingSong.composer} • ${editingSong.playlist}`
      ),

      m('form', { onsubmit: handleSubmit }, [
        // Basic song information
        m('div.form-section', [
          m('h3', 'Basic Information'),

          m('div.form-group', [
            m('label', 'Song Title *'),
            m('input[type=text]', {
              placeholder: 'Enter song title...',
              value: songTitle,
              oninput: (e: any) => {
                songTitle = e.target.value
              },
              required: true,
            }),
          ]),

          m('div.form-group', [
            m('label', 'Composer *'),
            m('input[type=text]', {
              placeholder: 'Enter composer name...',
              value: songComposer,
              oninput: (e: any) => {
                songComposer = e.target.value
              },
              required: true,
            }),
          ]),

          m('div.form-row', [
            m('div.form-group.form-group--half', [
              m('label', 'Style/Genre'),
              m('input[type=text]', {
                placeholder: 'e.g. Jazz, Pop, Rock...',
                value: songStyle,
                oninput: (e: any) => {
                  songStyle = e.target.value
                },
              }),
            ]),

            m('div.form-group.form-group--half', [
              m('label', 'Key'),
              m(
                'select',
                {
                  value: songKey,
                  onchange: (e: any) => {
                    songKey = e.target.value
                  },
                },
                [
                  'C',
                  'C#',
                  'Db',
                  'D',
                  'D#',
                  'Eb',
                  'E',
                  'F',
                  'F#',
                  'Gb',
                  'G',
                  'G#',
                  'Ab',
                  'A',
                  'A#',
                  'Bb',
                  'B',
                ].map(key => m('option', { value: key }, key))
              ),
            ]),
          ]),

          m('div.form-row', [
            m('div.form-group.form-group--half', [
              m('label', 'Tempo (BPM)'),
              m('input[type=number]', {
                placeholder: 'e.g. 120',
                value: songTempo,
                min: '1',
                max: '300',
                oninput: (e: any) => {
                  songTempo = e.target.value
                },
              }),
            ]),

            m('div.form-group.form-group--half', [
              m('label', 'Time Signature'),
              m('input[type=text]', {
                placeholder: 'e.g. 4/4, 3/4, 6/8',
                value: songTimeSignature,
                oninput: (e: any) => {
                  songTimeSignature = e.target.value
                },
              }),
            ]),
          ]),

          m('div.form-group', [
            m('label', 'Repeats'),
            m('input[type=number]', {
              placeholder: 'Number of repeats',
              value: songRepeats,
              min: '0',
              max: '10',
              oninput: (e: any) => {
                songRepeats = e.target.value
              },
            }),
            m('small.form-help', 'How many times to repeat the form'),
          ]),
        ]),

        // iRealb music data section
        m('div.form-section', [
          m('h3', 'Music Data (iRealb Format)'),

          // Preview and textarea in a two-column layout
          m('div.edit-form-columns', [
            // Music data input column
            m('div.edit-form-column', [
              m('div.form-group', [
                m('label', 'Chord Progression / Music Data'),
                m('textarea.music-textarea', {
                  placeholder:
                    'Enter iRealb music data, chord progressions, or song structure...',
                  value: songMusic,
                  rows: 12,
                  oninput: (e: any) => {
                    songMusic = e.target.value
                    // Force redraw to update preview
                    m.redraw()
                  },
                }),
                m(
                  'small.form-help',
                  'iRealb music format, chord progressions, or any musical notation'
                ),
              ]),
            ]),

            // Preview column
            m('div.edit-form-column', [
              m('div.form-group', [
                m('label', 'Live Preview'),
                m('div.song-preview', {
                  oncreate: (vnode: any) => {
                    if (!songMusic || !state.renderer) {
                      vnode.dom.innerHTML =
                        '<div class="preview-empty">Enter music data to see preview</div>'
                      return
                    }

                    try {
                      // Create a temporary song object for preview
                      const tempSong = {
                        title: songTitle || 'Untitled',
                        composer: songComposer || 'Unknown',
                        style: songStyle || editingSong.style || '',
                        key: songKey,
                        music: songMusic,
                        bpm: songTempo ? parseInt(songTempo) : 0,
                        time: songTimeSignature || '',
                        playlist: editingSong.playlist || 'Custom Songs',
                      }

                      // Parse and render the song
                      state.renderer.parse(tempSong)
                      state.renderer.render(tempSong, vnode.dom)
                    } catch (error) {
                      console.warn('Preview render error:', error)
                      vnode.dom.innerHTML =
                        '<div class="preview-error">Invalid music data format</div>'
                    }
                  },
                  onupdate: (vnode: any) => {
                    if (!songMusic || !state.renderer) {
                      vnode.dom.innerHTML =
                        '<div class="preview-empty">Enter music data to see preview</div>'
                      return
                    }

                    try {
                      // Create a temporary song object for preview
                      const tempSong = {
                        title: songTitle || 'Untitled',
                        composer: songComposer || 'Unknown',
                        style: songStyle || editingSong.style || '',
                        key: songKey,
                        music: songMusic,
                        bpm: songTempo ? parseInt(songTempo) : 0,
                        time: songTimeSignature || '',
                        playlist: editingSong.playlist || 'Custom Songs',
                      }

                      // Clear previous render and render new
                      vnode.dom.innerHTML = ''
                      state.renderer.parse(tempSong)
                      state.renderer.render(tempSong, vnode.dom)
                    } catch (error) {
                      console.warn('Preview render error:', error)
                      vnode.dom.innerHTML =
                        '<div class="preview-error">Invalid music data format</div>'
                    }
                  },
                }),
                m(
                  'small.form-help',
                  'Preview updates as you type in the music data'
                ),
              ]),
            ]),
          ]),
        ]),

        m('div.form-actions', [
          m('button[type=submit].btn.btn--primary', 'Update Song'),
          m(
            'button[type=button].btn.btn--secondary',
            {
              onclick: () => {
                resetForm()
                const basePath = state.currentSetlist
                  ? ['Setlist Manager', state.currentSetlist.name]
                  : ['Setlist Manager']
                update({
                  setlistEditorMode: 'edit',
                  editingSong: undefined,
                  setlistEditorPath: basePath,
                })
                const hashPath = state.currentSetlist
                  ? `setlists/${state.currentSetlist.id}`
                  : 'setlists'
                updateHash(hashPath)
              },
            },
            'Cancel'
          ),
        ]),
      ]),
    ])
  }
})()

// List of existing setlists
const SetlistsList = (cell: MeiosisCell<State>) => {
  const { state, update } = cell

  console.log('SetlistsList: Current state.setlists:', state.setlists)
  console.log(
    'SetlistsList: setlists length:',
    state.setlists?.length || 'undefined'
  )

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
          onclick: () => {
            update({
              currentSetlist: setlist,
              setlistEditorMode: 'edit',
              setlistEditorPath: ['Setlist Manager', setlist.name],
            })
            updateHash(`setlists/${setlist.id}`)
          },
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
const EditSetlistForm = (() => {
  let searchQuery = ''

  return (cell: MeiosisCell<State>) => {
    const { state, update } = cell
    const setlist = state.currentSetlist!

    let setlistName = setlist.name
    const songs = getSongs()

    // Filter songs based on current search query
    const getFilteredSongs = () => {
      if (searchQuery.trim()) {
        return songs
          .filter(
            (song: any) =>
              song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
              song.composer.toLowerCase().includes(searchQuery.toLowerCase())
          )
          .slice(0, 50)
      } else {
        return songs.slice(0, 50)
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

    const editSong = (song: Song) => {
      const basePath = state.currentSetlist
        ? ['Setlist Manager', state.currentSetlist.name, `Edit: ${song.title}`]
        : ['Setlist Manager', `Edit: ${song.title}`]
      update({
        setlistEditorMode: 'edit-song',
        editingSong: song,
        setlistEditorPath: basePath,
      })
      const hashPath = state.currentSetlist
        ? `setlists/${state.currentSetlist.id}/edit-song/${encodeURIComponent(
            song.title
          )}`
        : `setlists/edit-song/${encodeURIComponent(song.title)}`
      updateHash(hashPath)
    }

    const jumpToSong = (song: Song) => {
      update({ song, currentPage: 'song' })
      m.route.set(`/${song.playlist}/${song.title}`)
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
                  SetlistSongItem(
                    song,
                    index,
                    removeSongFromSetlist,
                    editSong,
                    jumpToSong
                  )
                )
              ),
        ]),

        // Song search and add
        m('div.song-search', [
          m('div.song-search-header', [
            m('h3', 'Add Songs'),
            m(
              'button.btn.btn--secondary.btn--small',
              {
                onclick: () => {
                  update({ setlistEditorMode: 'create-song' })
                },
              },
              '+ Create New Song'
            ),
          ]),
          m('div.search-input', [
            m('input[type=text]', {
              placeholder: 'Search songs...',
              oninput: (e: any) => {
                searchQuery = e.target.value
                m.redraw()
              },
            }),
          ]),
          m(
            'div.available-songs',
            getFilteredSongs().map((song: Song) =>
              AvailableSongItem(song, addSongToSetlist, setlist, editSong)
            )
          ),
        ]),
      ]),

      // Actions
      m('div.form-actions', [
        m(
          'button.btn.btn--secondary',
          {
            onclick: () => {
              update({
                setlistEditorMode: 'edit',
                currentSetlist: undefined,
                setlistEditorPath: ['Setlist Manager'],
              })
              updateHash('setlists')
            },
          },
          'Back to Setlists'
        ),
      ]),
    ])
  }
})()

// Song item in the current setlist
const SetlistSongItem = (
  song: Song,
  index: number,
  onRemove: (index: number) => void,
  onEdit: (song: Song) => void,
  onJumpToSong: (song: Song) => void
) => {
  const tempo = song.bpm || song.tempo
  const tempoText = tempo ? ` • ${tempo} BPM` : ''
  const timeText = song.time ? ` • ${song.time}` : ''
  const musicText = song.music || song.songText ? ' • Has music data' : ''

  return m('div.setlist-song-item', [
    m('div.song-info', [
      m('div.song-title', song.title),
      m(
        'div.song-meta',
        `${song.composer} • ${song.style} • ${song.key}${tempoText}${timeText}${musicText}`
      ),
    ]),
    m('div.song-actions', [
      m(
        'button.btn.btn--small.btn--primary',
        {
          onclick: () => onJumpToSong(song),
          title: 'Go to song',
        },
        '🎵'
      ),
      m(
        'button.btn.btn--small.btn--secondary',
        {
          onclick: () => onEdit(song),
          title: 'Edit song',
        },
        '✏️'
      ),
      m(
        'button.btn.btn--small.btn--danger',
        {
          onclick: () => onRemove(index),
          title: 'Remove from setlist',
        },
        '×'
      ),
    ]),
  ])
}

// Available song item to add to setlist
const AvailableSongItem = (
  song: Song,
  onAdd: (song: Song) => void,
  currentSetlist: SetlistState,
  onEdit: (song: Song) => void
) => {
  const isInSetlist = currentSetlist.songs.find(
    s => s.title === song.title && s.playlist === song.playlist
  )

  const tempo = song.bpm || song.tempo
  const tempoText = tempo ? ` • ${tempo} BPM` : ''
  const timeText = song.time ? ` • ${song.time}` : ''
  const musicText = song.music || song.songText ? ' • Has music data' : ''

  return m(
    'div.available-song-item',
    {
      class: isInSetlist ? 'in-setlist' : '',
    },
    [
      m('div.song-info', [
        m('div.song-title', song.title),
        m(
          'div.song-meta',
          `${song.composer} • ${song.style} • ${song.key}${tempoText}${timeText}${musicText}`
        ),
      ]),
      m('div.song-actions', [
        m(
          'button.btn.btn--small.btn--secondary',
          {
            onclick: () => onEdit(song),
            title: 'Edit song',
          },
          '✏️'
        ),
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
      ]),
    ]
  )
}
