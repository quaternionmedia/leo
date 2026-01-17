import m from 'mithril'
import { SetlistService } from './SetlistService'
import { UserSetlist, SetlistSong, SetlistViewMode } from './State'
import { songs } from './books'
import './styles/setlist-builder.css'

/**
 * Find the full song object from the songs array
 */
const findSong = (title: string, playlist: string) =>
  songs.find(s => s.title === title && s.playlist === playlist)

/**
 * Navigate to a song and update state
 */
const navigateToSong = (setlistSong: SetlistSong, update: any) => {
  const fullSong = findSong(setlistSong.title, setlistSong.playlist)
  if (fullSong) {
    update({ song: fullSong })
    m.route.set(`/${setlistSong.playlist}/${setlistSong.title}`)
  }
}

/**
 * SetlistBuilder - Main component for managing user setlists
 */
export const SetlistBuilder = cell =>
  m('div.setlist-builder', [
    SetlistHeader(cell),
    cell.state.activeSetlistId
      ? SetlistDetail(cell)
      : SetlistList(cell),
  ])

/**
 * Header with title and mode controls
 */
const SetlistHeader = ({ state, update }) =>
  m('div.setlist-builder__header', [
    state.activeSetlistId
      ? m(
          'button.setlist-builder__back',
          {
            onclick: () => update({ activeSetlistId: undefined, setlistViewMode: 'browse' }),
          },
          '← My Setlists'
        )
      : m('h3.setlist-builder__title', '📋 My Setlists'),
    !state.activeSetlistId &&
      m(
        'button.setlist-builder__create',
        {
          onclick: () => {
            const name = prompt('Enter setlist name:', 'New Setlist')
            if (name) {
              const updated = SetlistService.createSetlist(name, state.userSetlists)
              update({ userSetlists: updated })
            }
          },
        },
        '+ New'
      ),
  ])

/**
 * List view showing all user setlists
 */
const SetlistList = ({ state, update }) =>
  m('div.setlist-builder__list', [
    state.userSetlists.length === 0
      ? m('div.setlist-builder__empty', [
          m('p', 'No setlists yet!'),
          m('p.hint', 'Create a setlist to organize songs for your gig or practice session.'),
        ])
      : state.userSetlists.map(setlist => SetlistCard(setlist, { state, update })),
  ])

/**
 * Card for each setlist in the list view
 */
const SetlistCard = (setlist: UserSetlist, { state, update }) =>
  m(
    'div.setlist-builder__card',
    {
      onclick: () => update({ activeSetlistId: setlist.id, setlistViewMode: 'browse' }),
    },
    [
      m('div.setlist-builder__card-info', [
        m('span.setlist-builder__card-name', setlist.name),
        m('span.setlist-builder__card-count', `${setlist.songs.length} songs`),
      ]),
      m('div.setlist-builder__card-actions', { onclick: e => e.stopPropagation() }, [
        m(
          'button.setlist-builder__card-action',
          {
            title: 'Play setlist',
            onclick: e => {
              e.stopPropagation()
              if (setlist.songs.length > 0) {
                update({
                  activeSetlistId: setlist.id,
                  setlistViewMode: 'play',
                  setlistPlayIndex: 0,
                })
                // Navigate to first song
                navigateToSong(setlist.songs[0], update)
              }
            },
          },
          '▶'
        ),
        m(
          'button.setlist-builder__card-action',
          {
            title: 'Duplicate',
            onclick: e => {
              e.stopPropagation()
              const updated = SetlistService.duplicateSetlist(setlist.id, state.userSetlists)
              update({ userSetlists: updated })
            },
          },
          '📋'
        ),
        m(
          'button.setlist-builder__card-action.delete',
          {
            title: 'Delete',
            onclick: e => {
              e.stopPropagation()
              if (confirm(`Delete "${setlist.name}"?`)) {
                const updated = SetlistService.deleteSetlist(setlist.id, state.userSetlists)
                update({ userSetlists: updated })
              }
            },
          },
          '🗑'
        ),
      ]),
    ]
  )

/**
 * Detail view for a single setlist
 */
const SetlistDetail = ({ state, update }) => {
  const setlist = SetlistService.getSetlist(state.activeSetlistId, state.userSetlists)
  if (!setlist) return null

  return m('div.setlist-builder__detail', [
    SetlistDetailHeader(setlist, { state, update }),
    SetlistModeControls(setlist, { state, update }),
    state.setlistViewMode === 'play'
      ? SetlistPlayView(setlist, { state, update })
      : SetlistEditView(setlist, { state, update }),
  ])
}

/**
 * Header for setlist detail view with name editing
 */
const SetlistDetailHeader = (setlist: UserSetlist, { state, update }) =>
  m('div.setlist-builder__detail-header', [
    m(
      'h3.setlist-builder__detail-name',
      {
        onclick: () => {
          const newName = prompt('Rename setlist:', setlist.name)
          if (newName && newName !== setlist.name) {
            const updated = SetlistService.renameSetlist(
              setlist.id,
              newName,
              state.userSetlists
            )
            update({ userSetlists: updated })
          }
        },
        title: 'Click to rename',
      },
      [setlist.name, m('span.edit-hint', ' ✏️')]
    ),
    m('span.setlist-builder__detail-count', `${setlist.songs.length} songs`),
  ])

/**
 * Mode toggle between browse/edit and play modes
 */
const SetlistModeControls = (setlist: UserSetlist, { state, update }) =>
  m('div.setlist-builder__modes', [
    m(
      'button.setlist-builder__mode',
      {
        class: state.setlistViewMode === 'browse' ? 'active' : '',
        onclick: () => update({ setlistViewMode: 'browse' }),
      },
      '📝 Edit'
    ),
    m(
      'button.setlist-builder__mode',
      {
        class: state.setlistViewMode === 'play' ? 'active' : '',
        disabled: setlist.songs.length === 0,
        onclick: () => {
          update({ setlistViewMode: 'play', setlistPlayIndex: 0 })
          if (setlist.songs.length > 0) {
            navigateToSong(setlist.songs[0], update)
          }
        },
      },
      '▶ Play'
    ),
  ])

/**
 * Edit view - shows songs with reorder and delete controls
 */
const SetlistEditView = (setlist: UserSetlist, { state, update }) =>
  m('div.setlist-builder__songs', [
    setlist.songs.length === 0
      ? m('div.setlist-builder__songs-empty', [
          m('p', 'No songs yet!'),
          m('p.hint', 'Search for songs and click "+" to add them here.'),
        ])
      : setlist.songs.map((song, index) =>
          SetlistSongItem(song, index, setlist, { state, update })
        ),
  ])

/**
 * Individual song item in edit view
 */
const SetlistSongItem = (
  song: SetlistSong,
  index: number,
  setlist: UserSetlist,
  { state, update }
) =>
  m(
    'div.setlist-builder__song',
    {
      class: state.draggedSongIndex === index ? 'dragging' : '',
      draggable: true,
      ondragstart: e => {
        e.dataTransfer.effectAllowed = 'move'
        update({ draggedSongIndex: index })
      },
      ondragover: e => {
        e.preventDefault()
        e.dataTransfer.dropEffect = 'move'
      },
      ondrop: e => {
        e.preventDefault()
        if (state.draggedSongIndex !== undefined && state.draggedSongIndex !== index) {
          const updated = SetlistService.reorderSongs(
            setlist.id,
            state.draggedSongIndex,
            index,
            state.userSetlists
          )
          update({ userSetlists: updated, draggedSongIndex: undefined })
        }
      },
      ondragend: () => update({ draggedSongIndex: undefined }),
    },
    [
      m('span.setlist-builder__song-num', index + 1),
      m(
        'div.setlist-builder__song-info',
        {
          onclick: () => {
            navigateToSong(song, update)
            update({ setlistActive: false })
          },
        },
        [
          m('span.setlist-builder__song-title', song.title),
          song.composer && m('span.setlist-builder__song-composer', song.composer),
        ]
      ),
      m('div.setlist-builder__song-actions', [
        m(
          'button.setlist-builder__song-action',
          {
            title: 'Move up',
            disabled: index === 0,
            onclick: () => {
              const updated = SetlistService.moveSongUp(
                setlist.id,
                index,
                state.userSetlists
              )
              update({ userSetlists: updated })
            },
          },
          '↑'
        ),
        m(
          'button.setlist-builder__song-action',
          {
            title: 'Move down',
            disabled: index === setlist.songs.length - 1,
            onclick: () => {
              const updated = SetlistService.moveSongDown(
                setlist.id,
                index,
                state.userSetlists
              )
              update({ userSetlists: updated })
            },
          },
          '↓'
        ),
        m(
          'button.setlist-builder__song-action.delete',
          {
            title: 'Remove',
            onclick: () => {
              const updated = SetlistService.removeSongFromSetlist(
                setlist.id,
                index,
                state.userSetlists
              )
              update({ userSetlists: updated })
            },
          },
          '✕'
        ),
      ]),
    ]
  )

/**
 * Play view - shows current position and nav controls
 */
const SetlistPlayView = (setlist: UserSetlist, { state, update }) => {
  const currentIndex = state.setlistPlayIndex || 0
  const currentSong = setlist.songs[currentIndex]
  const hasPrev = currentIndex > 0
  const hasNext = currentIndex < setlist.songs.length - 1

  return m('div.setlist-builder__play', [
    m('div.setlist-builder__play-nav', [
      m(
        'button.setlist-builder__play-btn',
        {
          disabled: !hasPrev,
          onclick: () => {
            if (hasPrev) {
              const newIndex = currentIndex - 1
              update({ setlistPlayIndex: newIndex })
              navigateToSong(setlist.songs[newIndex], update)
            }
          },
        },
        '⟨ Prev'
      ),
      m('div.setlist-builder__play-position', [
        m('span.current', currentIndex + 1),
        m('span.separator', ' / '),
        m('span.total', setlist.songs.length),
      ]),
      m(
        'button.setlist-builder__play-btn',
        {
          disabled: !hasNext,
          onclick: () => {
            if (hasNext) {
              const newIndex = currentIndex + 1
              update({ setlistPlayIndex: newIndex })
              navigateToSong(setlist.songs[newIndex], update)
            }
          },
        },
        'Next ⟩'
      ),
    ]),
    currentSong &&
      m('div.setlist-builder__play-current', [
        m('span.now-playing', 'Now Playing:'),
        m('span.song-title', currentSong.title),
      ]),
    m('div.setlist-builder__play-list', [
      setlist.songs.map((song, index) =>
        m(
          'div.setlist-builder__play-item',
          {
            class: index === currentIndex ? 'active' : '',
            onclick: () => {
              update({ setlistPlayIndex: index })
              navigateToSong(song, update)
            },
          },
          [
            m('span.num', index + 1),
            m('span.title', song.title),
            index === currentIndex && m('span.indicator', '▶'),
          ]
        )
      ),
    ]),
  ])
}

/**
 * Add to Setlist button for search results
 */
export const AddToSetlistButton = (song: any, { state, update }) => {
  const hasSetlists = state.userSetlists.length > 0

  return m(
    'button.add-to-setlist',
    {
      title: hasSetlists ? 'Add to setlist' : 'Create a setlist first',
      onclick: e => {
        e.stopPropagation()
        if (!hasSetlists) {
          const name = prompt('Create a new setlist:', 'New Setlist')
          if (name) {
            let updated = SetlistService.createSetlist(name, state.userSetlists)
            // Add song to the newly created setlist
            const newSetlistId = updated[updated.length - 1].id
            updated = SetlistService.addSongToSetlist(
              newSetlistId,
              {
                title: song.title,
                playlist: song.playlist,
                composer: song.composer,
                key: song.key,
                style: song.style,
              },
              updated
            )
            update({ userSetlists: updated })
          }
        } else if (state.userSetlists.length === 1) {
          // Only one setlist, add directly
          const updated = SetlistService.addSongToSetlist(
            state.userSetlists[0].id,
            {
              title: song.title,
              playlist: song.playlist,
              composer: song.composer,
              key: song.key,
              style: song.style,
            },
            state.userSetlists
          )
          update({ userSetlists: updated })
        } else {
          // Multiple setlists - show picker
          showSetlistPicker(song, { state, update })
        }
      },
    },
    '+'
  )
}

/**
 * Show a simple setlist picker (could be enhanced to a dropdown)
 */
const showSetlistPicker = (song: any, { state, update }) => {
  const setlistNames = state.userSetlists.map(s => s.name).join('\n')
  const choice = prompt(
    `Add "${song.title}" to which setlist?\n\nYour setlists:\n${setlistNames}\n\nEnter setlist name:`,
    state.userSetlists[0]?.name || ''
  )
  if (choice) {
    const setlist = state.userSetlists.find(
      s => s.name.toLowerCase() === choice.toLowerCase()
    )
    if (setlist) {
      const updated = SetlistService.addSongToSetlist(
        setlist.id,
        {
          title: song.title,
          playlist: song.playlist,
          composer: song.composer,
          key: song.key,
          style: song.style,
        },
        state.userSetlists
      )
      update({ userSetlists: updated })
    } else {
      alert(`Setlist "${choice}" not found.`)
    }
  }
}

/**
 * Setlist navigation controls for the main control bar
 */
export const SetlistNavControls = ({ state, update }) => {
  if (state.setlistViewMode !== 'play' || !state.activeSetlistId) return null

  const setlist = SetlistService.getSetlist(state.activeSetlistId, state.userSetlists)
  if (!setlist || setlist.songs.length === 0) return null

  const currentIndex = state.setlistPlayIndex || 0
  const hasPrev = currentIndex > 0
  const hasNext = currentIndex < setlist.songs.length - 1

  return m('div.setlist-nav-controls', [
    m(
      'button.setlist-nav-btn.prev',
      {
        disabled: !hasPrev,
        title: 'Previous song',
        onclick: () => {
          if (hasPrev) {
            const newIndex = currentIndex - 1
            update({ setlistPlayIndex: newIndex })
            navigateToSong(setlist.songs[newIndex], update)
          }
        },
      },
      '⟨'
    ),
    m('span.setlist-nav-position', `${currentIndex + 1}/${setlist.songs.length}`),
    m(
      'button.setlist-nav-btn.next',
      {
        disabled: !hasNext,
        title: 'Next song',
        onclick: () => {
          if (hasNext) {
            const newIndex = currentIndex + 1
            update({ setlistPlayIndex: newIndex })
            navigateToSong(setlist.songs[newIndex], update)
          }
        },
      },
      '⟩'
    ),
    m(
      'button.setlist-nav-btn.exit',
      {
        title: 'Exit setlist mode',
        onclick: () => {
          update({ setlistViewMode: 'browse', activeSetlistId: undefined })
        },
      },
      '✕'
    ),
  ])
}

export default SetlistBuilder
