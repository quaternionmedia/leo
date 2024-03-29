import m from 'mithril'

export const Title = state => ({
  oncreate: vnode => {
    console.log('Title oncreate')
  },
  oninit: vnode => {
    console.log('Title oninit')
  },
  view: vnode => {
    console.log('Title view')
    return state.playlist()
      ? m('h3.title', state.playlist().songs[state.index()].title)
      : null
  },
})
