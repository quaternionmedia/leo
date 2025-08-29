import m from 'mithril'
import './styles/metronome.css'

interface MetronomeState {
  isPlaying: boolean
  tempo: number
  muteChance: number
  volume: number
  beatsPerMeasure: number
  beatNote: number
  emphasizeFirstBeat: boolean
  currentBeat: number
  intervalId: number | null
  audioContext: AudioContext | null
}

const Metronome: m.Component<{}, MetronomeState> = {
  oninit(vnode) {
    vnode.state.isPlaying = false
    vnode.state.tempo = 120
    vnode.state.muteChance = 0
    vnode.state.volume = 50
    vnode.state.beatsPerMeasure = 4
    vnode.state.beatNote = 4
    vnode.state.emphasizeFirstBeat = true
    vnode.state.currentBeat = 0
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

    const playClick = (isDownbeat = false) => {
      if (!state.audioContext) {
        state.audioContext = new AudioContext()
      }

      const oscillator = state.audioContext.createOscillator()
      const gainNode = state.audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(state.audioContext.destination)

      // Convert volume percentage (0-100) to gain value (0-1)
      const baseVolume = (state.volume / 100) * 0.3 // Max 0.3 to avoid distortion

      // Different frequencies and volumes for downbeat vs regular beat
      const frequency = isDownbeat && state.emphasizeFirstBeat ? 1000 : 800
      const volumeGain =
        isDownbeat && state.emphasizeFirstBeat ? baseVolume * 1.3 : baseVolume

      oscillator.frequency.setValueAtTime(
        frequency,
        state.audioContext.currentTime
      )
      gainNode.gain.setValueAtTime(volumeGain, state.audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(
        volumeGain * 0.1,
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
        state.currentBeat = 0 // Reset beat counter when starting
        const interval = 60000 / state.tempo
        state.intervalId = setInterval(() => {
          const shouldMute = Math.random() * 100 < state.muteChance
          if (!shouldMute) {
            const isDownbeat = state.currentBeat === 0
            playClick(isDownbeat)
          }
          // Increment beat counter and wrap around based on time signature
          state.currentBeat = (state.currentBeat + 1) % state.beatsPerMeasure
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
            const isDownbeat = state.currentBeat === 0
            playClick(isDownbeat)
          }
          // Increment beat counter and wrap around based on time signature
          state.currentBeat = (state.currentBeat + 1) % state.beatsPerMeasure
        }, interval)
      }
    }

    const updateMuteChance = (e: Event) => {
      const target = e.target as HTMLInputElement
      state.muteChance = parseInt(target.value)
    }

    const updateVolume = (e: Event) => {
      const target = e.target as HTMLInputElement
      state.volume = parseInt(target.value)
    }

    const updateBeatsPerMeasure = (e: Event) => {
      const target = e.target as HTMLInputElement
      state.beatsPerMeasure = parseInt(target.value)
      // Reset beat counter to avoid being out of bounds
      state.currentBeat = state.currentBeat % state.beatsPerMeasure
    }

    const updateBeatNote = (e: Event) => {
      const target = e.target as HTMLInputElement
      const sliderValue = parseInt(target.value)
      // Map slider values to note values: 1->1, 2->2, 3->4, 4->8
      const noteValues = [1, 2, 4, 8]
      state.beatNote = noteValues[sliderValue - 1]
    }

    const toggleEmphasizeFirstBeat = () => {
      state.emphasizeFirstBeat = !state.emphasizeFirstBeat
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
            min: 30,
            max: 200,
            value: state.tempo,
            oninput: updateTempo,
          }),
        ]),

        m('div.mute-control', [
          m('label', `Random Mute: ${state.muteChance}%`),
          m('input[type=range]', {
            min: 0,
            max: 100,
            value: state.muteChance,
            oninput: updateMuteChance,
          }),
        ]),

        m('div.volume-control', [
          m('label', `Volume: ${state.volume}%`),
          m('input[type=range]', {
            min: 0,
            max: 100,
            value: state.volume,
            oninput: updateVolume,
          }),
        ]),

        m('div.time-signature-control', [
          m(
            'label',
            `Time Signature: ${state.beatsPerMeasure}/${state.beatNote}`
          ),
          m('div.time-signature-sliders', [
            m('div.beats-per-measure', [
              m(
                'label.sub-label',
                `Beats per measure: ${state.beatsPerMeasure}`
              ),
              m('input[type=range]', {
                min: 1,
                max: 12,
                value: state.beatsPerMeasure,
                oninput: updateBeatsPerMeasure,
              }),
            ]),
            m('div.beat-note', [
              m('label.sub-label', `Beat note: ${state.beatNote}`),
              m('input[type=range]', {
                min: 1,
                max: 4,
                step: 1,
                value:
                  state.beatNote === 1
                    ? 1
                    : state.beatNote === 2
                    ? 2
                    : state.beatNote === 4
                    ? 3
                    : 4,
                oninput: updateBeatNote,
              }),
            ]),
          ]),
        ]),

        m('div.emphasis-control', [
          m('label', [
            m('input[type=checkbox]', {
              checked: state.emphasizeFirstBeat,
              onchange: toggleEmphasizeFirstBeat,
            }),
            ' Emphasize first beat',
          ]),
        ]),
      ]),
    ])
  },
}

export default Metronome
