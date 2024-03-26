import m from 'mithril'
import { iRealRenderer } from 'ireal-renderer'
import './ireal.css'
import 'ireal-renderer/css/ireal-renderer.css'
import 'ireal-renderer/src/ireal-renderer.js'

export const IReal = (state, actions) => ({
    oncreate: vnode => {
        console.log("IReal oncreate");
        if (state.playlist()) {
            let song = state.playlist().songs[state.index()]
            // const song = state.playlist().songs[state.index()];
            console.log('song', song)
            const renderer = new iRealRenderer(state.playlist());

            renderer.parse(song)
            if (state.transpose() !== 0) {
                renderer.transpose(song, {transpose: state.transpose()})
            } else {
                state.key(song.key)
            }
            
            renderer.render(song, vnode.dom);
            console.log('rendered', song, vnode.dom, renderer)

            state.song(song)
            state.title(song.title)
            state.bpm(song.bpm)
            state.style(song.style)
        }
    },
    oninit: vnode => {
        console.log("IReal oninit");
        
    },
    view: vnode => {
        console.log("IReal view");
        return m('.song')
        
    }, 
    
})
