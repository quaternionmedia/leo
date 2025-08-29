import m from 'mithril'
import './styles/metronome.css'

interface MetronomeState {
  isPlaying: boolean
  tempo: number
  muteChance: number
  intervalId: number | null
  audioContext: AudioContext | null
}

const Metronome: m.Component<{}, MetronomeState> = {
  oninit(vnode) {
    vnode.state.isPlaying = false
    vnode.state.tempo = 120
    vnode.state.muteChance = 0
    vnode.state.intervalId = null
    vnode.state.audioContext = null
  },

  onremove(vnode) {
    if (vnode.state.intervalId) {
      clearInterval(vnode.state.intervalId)
    }
    if (vnode.state.audioContext) {
      vnode.state.audioContext.close()
    }
  },

  view(vnode) {
    const state = vnode.state

    const playClick = () => {
      if (!state.audioContext) {
        state.audioContext = new AudioContext()
      }

      const oscillator = state.audioContext.createOscillator()
      const gainNode = state.audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(state.audioContext.destination)

      oscillator.frequency.setValueAtTime(800, state.audioContext.currentTime)
      gainNode.gain.setValueAtTime(0.1, state.audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        state.audioContext.currentTime + 0.1
      )

      oscillator.start()
      oscillator.stop(state.audioContext.currentTime + 0.1)
    }

    const toggleMetronome = () => {
      if (state.isPlaying) {
        if (state.intervalId) {
          clearInterval(state.intervalId)
          state.intervalId = null
        }
        state.isPlaying = false
      } else {
        const interval = 60000 / state.tempo
        state.intervalId = setInterval(() => {
          const shouldMute = Math.random() * 100 < state.muteChance
          if (!shouldMute) {
            playClick()
          }
        }, interval)
        state.isPlaying = true
      }
    }

    const updateTempo = (e: Event) => {
      const target = e.target as HTMLInputElement
      state.tempo = parseInt(target.value)

      if (state.isPlaying && state.intervalId) {
        clearInterval(state.intervalId)
        const interval = 60000 / state.tempo
        state.intervalId = setInterval(() => {
          const shouldMute = Math.random() * 100 < state.muteChance
          if (!shouldMute) {
            playClick()
          }
        }, interval)
      }
    }

    const updateMuteChance = (e: Event) => {
      const target = e.target as HTMLInputElement
      state.muteChance = parseInt(target.value)
    }

    return m('div.metronome', [
      m('h2', 'Metronome'),

      m('div.controls', [
        m(
          'button',
          {
            onclick: toggleMetronome,
          },
          state.isPlaying ? 'Stop' : 'Start'
        ),

        m('div.tempo-control', [
          m('label', `Tempo: ${state.tempo} BPM`),
          m('input[type=range]', {
            min: 60,
            max: 200,
            value: state.tempo,
            oninput: updateTempo,
          }),
        ]),

        m('div.mute-control', [
          m('label', `Random Mute: ${state.muteChance}%`),
          m('input[type=range]', {
            min: 0,
            max: 50,
            value: state.muteChance,
            oninput: updateMuteChance,
          }),
        ]),
      ]),
    ])
  },
}

export default Metronome
