import m from 'mithril'
import { reverseComposerName } from './ireal'
import { Song } from 'ireal-renderer-tiny'
import './styles/search.css'

export const SearchResults = cell =>
  m('.setlist__songbox', [
    SearchOptions(cell),
    cell.state.results.data.items.map((song: Song) => SongResult(song, cell)),
  ])

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

export const SearchInput = ({ state, update }) =>
  m(
    '.setlist__header__search',
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

export const SearchOptions = ({ state, update }) =>
  m('.setlist__header__options', [
    PerPage({ state, update }),
    ResultsCount({ state }),
    SearchFacets({ state, update }),
    Aggregation('playlist', { state, update }),
    Aggregation('style', { state, update }),
    Aggregation('composer', { state, update }),
    Aggregation('key', { state, update }),
  ])

export const SearchFacets = ({ state, update }) =>
  m(
    '.facet-header',
    Object.keys(state.search_options.filters).map(key =>
      m(
        'button.facet',
        {
          onclick: () => {
            let filters = { ...state.search_options.filters, [key]: undefined }
            console.log('clearing facet filters', filters)
            update({ search_options: { filters } })
          },
        },
        [key, ' X']
      )
    )
  )

export const PerPage = ({ state, update }) =>
  m(
    '.per_page',
    m(
      'select',
      {
        value: state.search_options.per_page,
        onchange: e => {
          update({ search_options: { per_page: e.currentTarget.value } })
        },
      },
      [
        m('option', { value: 5 }, '5'),
        m('option', { value: 10 }, '10'),
        m('option', { value: 20 }, '20'),
        m('option', { value: 50 }, '50'),
        m('option', { value: 100 }, '100'),
        m('option', { value: -1 }, 'All'),
      ]
    )
  )

export const ResultsCount = ({ state }) =>
  m('.results-count', state.results.pagination.total + ' results')

export const Aggregation = (name: string, { state, update }) => {
  let agg = state.results.data.aggregations[name]
  return m('.aggregation', [
    m('h4', name),
    agg.buckets.map(bucket => [
      m(
        '.bucket',
        {
          onclick: () => {
            let filters = state.search_options.filters
            if (filters[name]?.includes(bucket.key)) {
              filters[name] = filters[name].filter(f => f !== bucket.key)
            } else {
              filters[name] = [...(filters[name] || []), bucket.key]
            }
            update({ search_options: { filters } })
          },
        },
        [
          m('input[type=checkbox]', {
            checked: state.search_options.filters[name]?.includes(bucket.key),
          }),
          m('label', bucket.key),
          m('span.bucket-count', bucket.doc_count),
        ]
      ),
    ]),
  ])
}
