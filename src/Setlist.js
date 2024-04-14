import m from 'mithril' 
import "./styles/setlist.css";

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

export const SetlistNav = cell =>
  m(`div.setlist`, 
    m('div.setlist__header', 
      Search(cell),
      RandomSong(cell)
    ),
    SetlistBox(cell),
  )

export const Search = ({ state, update }) =>
  m('div.setlist__header__search',
    m('input.setlist__header__search__input', 
      {
        type: 'text',
        placeholder: 'Search',
        value: state.query,
        oninput: e => {
          update({ query: e.currentTarget.value })
        },
        onbeforeupdate: (vnode, old) => {
          console.log('before update', vnode, old)
          if (!state.query === '') return false
        },
        oncreate: vnode => {
          vnode.dom.focus()
        },
      }
    ),
    ClearQuery({ update })
  )

export const ClearQuery = ({ update }) =>
  m('button.setlist__header__search__clear',
    {
      onclick: () => {
        update({ query: '' });
        document.getElementsByClassName('setlist__header__search__input')[0].focus();
      },
    },
    '✗'
  )

export const RandomSong = ({ state, update }) =>
  m('button.setlist__header__random',
    {
      disabled: state.search_results.length === 0,
      onclick: () => {
        // Check if there are any search results
        if (state.search_results.length === 0) {
          return;
        }
        const randomIndex = Math.floor(
          Math.random() * state.search_results.length
        )
        update({
          song: state.search_results[randomIndex],
          menuActive: false,
        })
      },
    },
    '🎲'
  )

export const SetlistBox = ({ state, update }) =>
  m('div.setlist__songbox',
    state.search_results.map(item =>
      m('button.setlist__songbox__song',
        {
          id: item.title,
          onclick: () => {
            update({
              menuActive: false,
              song: item,
            })
          },
        },
        item.title
      )
    )
  )


/* change song */
document.addEventListener("keydown", (e) => {
  if (e.key === "`") {
    document.getElementsByClassName("setlist__header__random")[0].click();
  } 
});


//export const Menu = attrs => m('.menu', attrs, [m(''), m(''), m('')])
