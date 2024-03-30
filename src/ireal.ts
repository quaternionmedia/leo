import m from 'mithril'
import './ireal.css'
import 'ireal-renderer/css/ireal-renderer.css'
import 'ireal-renderer/src/ireal-renderer.js'

export const IReal = ({state, update}) => ({
  oncreate: vnode => {
    console.log('IReal oncreate')
      
      let song = state.song
      state.renderer.parse(song)
      if (state.transpose !== 0) {
        state.renderer.transpose(song, { transpose: state.transpose })
      } else {
        // update({song:{key:song.key}})
      }

      state.renderer.render(song, vnode.dom)
      console.log('rendered', song, vnode.dom, state.renderer)

  },
  view: vnode => {
    console.log('IReal view')
    return m('.song')
  },
})
