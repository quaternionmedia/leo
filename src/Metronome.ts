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

      // Handle empty pattern case - default to quarter note
      let currentNote: number
      let isDownbeat: boolean

      if (state.rhythmPattern.length === 0) {
        // Default to quarter note when pattern is empty
        currentNote = 4
        isDownbeat = true // Always treat as downbeat for single note
      } else {
        currentNote = state.rhythmPattern[state.currentStep]
        isDownbeat = state.currentStep === 0
      }

      const noteDuration = getNoteDuration(currentNote)

      const shouldMute = Math.random() * 100 < state.muteChance
      if (!shouldMute) {
        playClick(isDownbeat)
      }

      // Move to next step (only if pattern exists)
      if (state.rhythmPattern.length > 0) {
        state.currentStep = (state.currentStep + 1) % state.rhythmPattern.length
      }
      // For empty pattern, currentStep stays at 0

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
        state.currentStep = 0 // Reset to first step when starting
        state.isPlaying = true
        scheduleNextBeat() // Start the rhythm (handles empty pattern automatically)
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

    const removeNoteAtIndex = (indexToRemove: number) => {
      if (indexToRemove >= 0 && indexToRemove < state.rhythmPattern.length) {
        state.rhythmPattern = state.rhythmPattern.filter(
          (_: number, index: number) => index !== indexToRemove
        )

        // Adjust current step if necessary
        if (
          state.currentStep >= state.rhythmPattern.length &&
          state.rhythmPattern.length > 0
        ) {
          state.currentStep = 0
        } else if (state.currentStep > indexToRemove && state.currentStep > 0) {
          state.currentStep = state.currentStep - 1
        }
        // Note: Don't stop metronome - empty pattern will play as quarter notes
      }
    }

    const removeLastNote = () => {
      if (state.rhythmPattern.length > 0) {
        state.rhythmPattern = state.rhythmPattern.slice(0, -1)
        // Adjust current step if it's beyond the new pattern length
        if (state.currentStep >= state.rhythmPattern.length) {
          state.currentStep = 0
        }
        // Note: Don't stop metronome - empty pattern will play as quarter notes
      }
    }

    const clearPattern = () => {
      state.rhythmPattern = [] // Reset to empty pattern
      state.currentStep = 0
      // Note: Don't stop metronome - empty pattern will play as quarter notes
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
                  'Pattern is empty. Playing quarter notes. Add notes to create a custom rhythm.'
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
                        onclick: () => removeNoteAtIndex(index),
                        title: 'Click to remove this note',
                      },
                      [
                        m('span.note-symbol', getNoteSymbol(note)),
                        m('span.note-name', getNoteName(note)),
                        m('span.remove-indicator', '×'),
                      ]
                    )
                  )
                ),
          ]),

          // Help text
          state.rhythmPattern.length > 0
            ? m(
                'div.pattern-help',
                'Click any note to remove it from the pattern.'
              )
            : null,

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
