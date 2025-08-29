import m from 'mithril'
import './styles/metronome.css'

interface MetronomeState {
  isPlaying: boolean
  tempo: number
  muteChance: number
  volume: number
  rhythmPattern: number[] // Array of note durations (1=whole, 2=half, 4=quarter, 8=eighth, 16=sixteenth)
  emphasizeFirstBeat: boolean
  currentStep: number
  currentStepStartTime: number
  timeoutId: number | null
  audioContext: AudioContext | null
}

const Metronome: m.Component<{}, MetronomeState> = {
  oninit(vnode) {
    vnode.state.isPlaying = false
    vnode.state.tempo = 120
    vnode.state.muteChance = 0
    vnode.state.volume = 50
    vnode.state.rhythmPattern = [4, 4, 4, 4] // Default: four quarter notes
    vnode.state.emphasizeFirstBeat = true
    vnode.state.currentStep = 0
    vnode.state.currentStepStartTime = 0
    vnode.state.timeoutId = null
    vnode.state.audioContext = null
  },

  onremove(vnode) {
    if (vnode.state.timeoutId) {
      clearTimeout(vnode.state.timeoutId)
    }
    if (vnode.state.audioContext) {
      vnode.state.audioContext.close()
    }
  },

  view(vnode) {
    const state = vnode.state

    // Calculate duration of a note in milliseconds based on tempo
    const getNoteDuration = (noteValue: number) => {
      // Quarter note duration at current tempo
      const quarterNoteDuration = 60000 / state.tempo
      // Calculate duration relative to quarter note
      return quarterNoteDuration * (4 / noteValue)
    }

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

    const scheduleNextBeat = () => {
      if (!state.isPlaying) return

      // Handle empty pattern case
      if (state.rhythmPattern.length === 0) {
        // Stop the metronome if pattern is empty
        state.isPlaying = false
        return
      }

      const currentNote = state.rhythmPattern[state.currentStep]
      const noteDuration = getNoteDuration(currentNote)

      const shouldMute = Math.random() * 100 < state.muteChance
      if (!shouldMute) {
        const isDownbeat = state.currentStep === 0
        playClick(isDownbeat)
      }

      // Move to next step
      state.currentStep = (state.currentStep + 1) % state.rhythmPattern.length

      // Schedule next beat
      state.timeoutId = setTimeout(scheduleNextBeat, noteDuration)
    }

    const toggleMetronome = () => {
      if (state.isPlaying) {
        if (state.timeoutId) {
          clearTimeout(state.timeoutId)
          state.timeoutId = null
        }
        state.isPlaying = false
      } else {
        // Don't start if pattern is empty
        if (state.rhythmPattern.length === 0) {
          return
        }
        state.currentStep = 0 // Reset to first step when starting
        state.isPlaying = true
        scheduleNextBeat() // Start the rhythm
      }
    }

    const updateTempo = (e: Event) => {
      const target = e.target as HTMLInputElement
      state.tempo = parseInt(target.value)

      if (state.isPlaying) {
        // Restart rhythm with new tempo
        if (state.timeoutId) {
          clearTimeout(state.timeoutId)
        }
        scheduleNextBeat()
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

    const addNoteToPattern = (noteValue: number) => {
      state.rhythmPattern = [...state.rhythmPattern, noteValue]
    }

    const removeLastNote = () => {
      if (state.rhythmPattern.length > 0) {
        state.rhythmPattern = state.rhythmPattern.slice(0, -1)
        // Adjust current step if it's beyond the new pattern length
        if (state.currentStep >= state.rhythmPattern.length) {
          state.currentStep = 0
        }
        // Stop metronome if pattern becomes empty
        if (state.rhythmPattern.length === 0 && state.isPlaying) {
          state.isPlaying = false
          if (state.timeoutId) {
            clearTimeout(state.timeoutId)
            state.timeoutId = null
          }
        }
      }
    }

    const clearPattern = () => {
      state.rhythmPattern = [] // Reset to empty pattern
      state.currentStep = 0
      // Stop metronome when clearing pattern
      if (state.isPlaying) {
        state.isPlaying = false
        if (state.timeoutId) {
          clearTimeout(state.timeoutId)
          state.timeoutId = null
        }
      }
    }

    const setPresetPattern = (pattern: number[]) => {
      state.rhythmPattern = [...pattern]
      state.currentStep = 0
    }

    const getNoteSymbol = (noteValue: number) => {
      const symbols: { [key: number]: string } = {
        1: '𝅝', // whole note
        2: '𝅗𝅥', // half note
        4: '♩', // quarter note
        8: '♪', // eighth note
        16: '𝅘𝅥𝅯', // sixteenth note
      }
      return symbols[noteValue] || '♩'
    }

    const getNoteName = (noteValue: number) => {
      const names: { [key: number]: string } = {
        1: 'Whole',
        2: 'Half',
        4: 'Quarter',
        8: 'Eighth',
        16: 'Sixteenth',
      }
      return names[noteValue] || 'Quarter'
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

        m('div.rhythm-control', [
          m('label', 'Rhythm Pattern'),

          // Current pattern display
          m('div.rhythm-display', [
            state.rhythmPattern.length === 0
              ? m(
                  'div.empty-pattern',
                  'Pattern is empty. Add notes to create a rhythm.'
                )
              : m(
                  'div.pattern-notes',
                  state.rhythmPattern.map((note: number, index: number) =>
                    m(
                      'span.note',
                      {
                        class:
                          index === state.currentStep && state.isPlaying
                            ? 'active'
                            : '',
                        key: index,
                      },
                      [
                        m('span.note-symbol', getNoteSymbol(note)),
                        m('span.note-name', getNoteName(note)),
                      ]
                    )
                  )
                ),
          ]),

          // Note buttons
          m('div.note-buttons', [
            m('h4', 'Add Notes:'),
            m('div.note-grid', [
              m('button.note-btn', { onclick: () => addNoteToPattern(1) }, [
                '𝅝',
                m('br'),
                'Whole',
              ]),
              m('button.note-btn', { onclick: () => addNoteToPattern(2) }, [
                '𝅗𝅥',
                m('br'),
                'Half',
              ]),
              m('button.note-btn', { onclick: () => addNoteToPattern(4) }, [
                '♩',
                m('br'),
                'Quarter',
              ]),
              m('button.note-btn', { onclick: () => addNoteToPattern(8) }, [
                '♪',
                m('br'),
                'Eighth',
              ]),
              m('button.note-btn', { onclick: () => addNoteToPattern(16) }, [
                '𝅘𝅥𝅯',
                m('br'),
                '16th',
              ]),
            ]),
          ]),

          // Pattern controls
          m('div.pattern-controls', [
            m('button.control-btn', { onclick: removeLastNote }, 'Remove Last'),
            m('button.control-btn', { onclick: clearPattern }, 'Clear'),
          ]),

          // Preset patterns
          m('div.preset-patterns', [
            m('h4', 'Presets:'),
            m(
              'button.preset-btn',
              { onclick: () => setPresetPattern([4, 4, 4, 4]) },
              '4/4 Basic'
            ),
            m(
              'button.preset-btn',
              { onclick: () => setPresetPattern([4, 4, 4]) },
              '3/4 Waltz'
            ),
            m(
              'button.preset-btn',
              { onclick: () => setPresetPattern([8, 8, 4, 8, 8, 4]) },
              '6/8 Feel'
            ),
            m(
              'button.preset-btn',
              { onclick: () => setPresetPattern([4, 8, 8, 4]) },
              'Syncopated'
            ),
          ]),

          // Emphasize first beat toggle
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
      ]),
    ])
  },
}

export default Metronome
