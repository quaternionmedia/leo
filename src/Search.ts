import m from 'mithril'

export const SearchResults = cell =>
  m(
    'div.setlist__songbox',
    cell.state.results.data.items.map(song => SongResult(song, cell))
  )

export const SongResult = (song, { update }) =>
  m(
    'button.setlist__songbox__song',
    {
      id: song.title,
      onclick: () => {
        update({ song })
      },
    },
    [SongTitle(song), SongComposer(song)]
  )

export const SongTitle = song => m('div.title', song.title)

export const SongComposer = song =>
  m('div.composer', song.composer)

export const SearchInput = ({ state, update }) =>
  m(
    'div.setlist__header__search',
    m('input.setlist__header__search__input', {
      type: 'text',
      placeholder: 'Search',
      value: state.search_options.query,
      oninput: e => {
        update({ search_options: { query: e.currentTarget.value } })
      },
      onbeforeupdate: (vnode, old) => {
        console.log('before update', vnode, old)
        if (state.search_options.query !== '') return false
      },
      oncreate: vnode => {
        vnode.dom.focus()
      },
    }),
    ClearQuery({ update })
  )

export const ClearQuery = ({ update }) =>
  m(
    'button.setlist__header__search__clear',
    {
      onclick: () => {
        update({ search_options: { query: '' } })
        document
          .getElementsByClassName('setlist__header__search__input')[0]
          .focus()
      },
    },
    '✗'
  )
