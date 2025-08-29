import m from 'mithril'
import './styles/metronome.css'

interface MetronomeState {
  isPlaying: boolean
  tempo: number
  beatType: number // What note value the tempo represents (1=whole, 2=half, 4=quarter, 8=eighth, 16=sixteenth)
  muteChance: number
  volume: number
  rhythmPattern: number[] // Array of note durations (1=whole, 2=half, 4=quarter, 8=eighth, 16=sixteenth, decimals for dotted)
  emphasizeFirstBeat: boolean
  nextNoteDotted: boolean
  currentStep: number
  currentStepStartTime: number
  timeoutId: number | null
  audioContext: AudioContext | null
  savedPatterns: { name: string; pattern: number[] }[]
}

// LocalStorage helper functions
const STORAGE_KEY = 'metronome-saved-patterns'

const loadSavedPatternsFromStorage = (): {
  name: string
  pattern: number[]
}[] => {
  // Default built-in patterns
  const defaultPatterns = [
    { name: '4/4', pattern: [4, 4, 4, 4] },
    { name: '3/4', pattern: [4, 4, 4] },
    { name: '6/8', pattern: [8, 8, 8, 8, 8, 8] },
    { name: '3-2 Clave', pattern: [8.5, 8.5, 4, 8, 4] },
    {
      name: 'Bolaro',
      pattern: [4.5, 8, 8, 8, 4.5, 8, 8, 8, 4.5, 8, 8, 8, 8, 8, 8, 8, 8, 8],
    },
  ]

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const patterns = JSON.parse(stored)
      // Validate the data structure
      if (Array.isArray(patterns)) {
        const validPatterns = patterns.filter(
          p =>
            p &&
            typeof p.name === 'string' &&
            Array.isArray(p.pattern) &&
            p.pattern.every((n: any) => typeof n === 'number')
        )
        return validPatterns
      }
    }
  } catch (error) {
    console.warn('Failed to load saved patterns from localStorage:', error)
  }

  // Return default patterns if no valid stored patterns found
  return defaultPatterns
}

const savePatternsToStorage = (
  patterns: { name: string; pattern: number[] }[]
) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(patterns))
  } catch (error) {
    console.warn('Failed to save patterns to localStorage:', error)
  }
}

const Metronome: m.Component<{}, MetronomeState> = {
  oninit(vnode) {
    vnode.state.isPlaying = false
    vnode.state.tempo = 120
    vnode.state.beatType = 4 // Default to quarter note = 120 BPM
    vnode.state.muteChance = 0
    vnode.state.volume = 50
    vnode.state.rhythmPattern = [4, 4, 4, 4] // Default: four quarter notes
    vnode.state.emphasizeFirstBeat = true
    vnode.state.nextNoteDotted = false
    vnode.state.currentStep = 0
    vnode.state.currentStepStartTime = 0
    vnode.state.timeoutId = null
    vnode.state.audioContext = null

    // Load saved patterns from localStorage
    vnode.state.savedPatterns = loadSavedPatternsFromStorage()
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
      // Beat type duration at current tempo
      const beatTypeDuration = 60000 / state.tempo

      // Check if it's a dotted note (has decimal part)
      const isDotted = noteValue % 1 !== 0
      const baseValue = isDotted ? Math.floor(noteValue) : noteValue

      // Handle dotted beat types (3, 6, 12 represent dotted notes)
      let effectiveBeatType = state.beatType
      if (state.beatType === 3) {
        // Dotted half = 1.5 * half, so equivalent to 2/1.5 = 1.33... but we use direct calculation
        effectiveBeatType = 2
        const baseDuration = beatTypeDuration * (effectiveBeatType / baseValue)
        const dottedBeatDuration = baseDuration * 1.5
        return isDotted ? dottedBeatDuration * 1.5 : dottedBeatDuration
      } else if (state.beatType === 6) {
        // Dotted quarter = 1.5 * quarter
        effectiveBeatType = 4
        const baseDuration = beatTypeDuration * (effectiveBeatType / baseValue)
        const dottedBeatDuration = baseDuration * 1.5
        return isDotted ? dottedBeatDuration * 1.5 : dottedBeatDuration
      } else if (state.beatType === 12) {
        // Dotted eighth = 1.5 * eighth
        effectiveBeatType = 8
        const baseDuration = beatTypeDuration * (effectiveBeatType / baseValue)
        const dottedBeatDuration = baseDuration * 1.5
        return isDotted ? dottedBeatDuration * 1.5 : dottedBeatDuration
      }

      // Calculate base duration relative to the beat type (regular notes)
      let duration = beatTypeDuration * (effectiveBeatType / baseValue)

      // Apply dotted multiplier (1.5x duration) for dotted notes in pattern
      if (isDotted) {
        duration *= 1.5
      }

      return duration
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

    const setBeatType = (beatType: number) => {
      state.beatType = beatType

      if (state.isPlaying) {
        // Restart rhythm with new beat type
        if (state.timeoutId) {
          clearTimeout(state.timeoutId)
        }
        scheduleNextBeat()
      }
    }

    const addNoteToPattern = (noteValue: number) => {
      // Apply dot if nextNoteDotted is true (dotted note = 1.5x duration)
      // For dotted notes, we store the note value with a decimal flag
      const finalNoteValue = state.nextNoteDotted ? noteValue + 0.5 : noteValue
      state.rhythmPattern = [...state.rhythmPattern, finalNoteValue]
      // Note: nextNoteDotted stays active for multiple note inputs
    }

    const toggleDot = () => {
      state.nextNoteDotted = !state.nextNoteDotted
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

    const saveCurrentPattern = () => {
      if (state.rhythmPattern.length === 0) {
        alert('Cannot save empty pattern')
        return
      }

      const name = prompt('Enter a name for this rhythm pattern:')
      if (name && name.trim()) {
        const newPattern = {
          name: name.trim(),
          pattern: [...state.rhythmPattern],
        }
        state.savedPatterns = [...state.savedPatterns, newPattern]
        savePatternsToStorage(state.savedPatterns)
      }
    }

    const removeSavedPattern = (indexToRemove: number) => {
      state.savedPatterns = state.savedPatterns.filter(
        (_, index) => index !== indexToRemove
      )
      savePatternsToStorage(state.savedPatterns)
    }

    const getNoteSymbol = (noteValue: number) => {
      // Check if it's a dotted note (has decimal part)
      const isDotted = noteValue % 1 !== 0
      const baseValue = isDotted ? Math.floor(noteValue) : noteValue

      const symbols: { [key: number]: string } = {
        1: '𝅝', // whole note
        2: '𝅗𝅥', // half note
        4: '♩', // quarter note
        8: '♪', // eighth note
        16: '𝅘𝅥𝅯', // sixteenth note
      }
      const baseSymbol = symbols[baseValue] || '♩'
      return isDotted ? baseSymbol + '·' : baseSymbol
    }

    const getNoteName = (noteValue: number) => {
      // Check if it's a dotted note (has decimal part)
      const isDotted = noteValue % 1 !== 0
      const baseValue = isDotted ? Math.floor(noteValue) : noteValue

      const names: { [key: number]: string } = {
        1: 'Whole',
        2: 'Half',
        4: 'Quarter',
        8: 'Eighth',
        16: 'Sixteenth',
      }
      const baseName = names[baseValue] || 'Quarter'
      return isDotted ? 'Dotted ' + baseName : baseName
    }

    const getBeatTypeSymbol = (beatType: number) => {
      const symbols: { [key: number]: string } = {
        1: '𝅝', // whole note
        2: '𝅗𝅥', // half note
        3: '𝅗𝅥·', // dotted half note (equivalent to 2/3 of 2 = 1.33... but using 3 for simplicity)
        4: '♩', // quarter note
        6: '♩·', // dotted quarter note (equivalent to 2/3 of 4 = 2.67... but using 6 for simplicity)
        8: '♪', // eighth note
        12: '♪·', // dotted eighth note (equivalent to 2/3 of 8 = 5.33... but using 12 for simplicity)
        16: '𝅘𝅥𝅯', // sixteenth note
      }
      return symbols[beatType] || '♩'
    }

    const getBeatTypeName = (beatType: number) => {
      const names: { [key: number]: string } = {
        1: 'Whole',
        2: 'Half',
        3: 'Dotted Half',
        4: 'Quarter',
        6: 'Dotted Quarter',
        8: 'Eighth',
        12: 'Dotted Eighth',
        16: 'Sixteenth',
      }
      return names[beatType] || 'Quarter'
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
          m(
            'label',
            `Tempo: ${getBeatTypeSymbol(state.beatType)} = ${state.tempo} BPM`
          ),
          m('input[type=range]', {
            min: 30,
            max: 200,
            value: state.tempo,
            oninput: updateTempo,
          }),
          m('div.beat-type-buttons', [
            m(
              'button.beat-type-btn',
              {
                class: state.beatType === 2 ? 'active' : '',
                onclick: () => setBeatType(2),
                title: 'Half note gets the beat',
              },
              ['𝅗𝅥', m('br'), 'Half']
            ),
            m(
              'button.beat-type-btn',
              {
                class: state.beatType === 3 ? 'active' : '',
                onclick: () => setBeatType(3),
                title: 'Dotted half note gets the beat',
              },
              ['𝅗𝅥·', m('br'), 'Dotted Half']
            ),
            m(
              'button.beat-type-btn',
              {
                class: state.beatType === 4 ? 'active' : '',
                onclick: () => setBeatType(4),
                title: 'Quarter note gets the beat',
              },
              ['♩', m('br'), 'Quarter']
            ),
            m(
              'button.beat-type-btn',
              {
                class: state.beatType === 6 ? 'active' : '',
                onclick: () => setBeatType(6),
                title: 'Dotted quarter note gets the beat',
              },
              ['♩·', m('br'), 'Dotted Quarter']
            ),
            m(
              'button.beat-type-btn',
              {
                class: state.beatType === 8 ? 'active' : '',
                onclick: () => setBeatType(8),
                title: 'Eighth note gets the beat',
              },
              ['♪', m('br'), 'Eighth']
            ),
            m(
              'button.beat-type-btn',
              {
                class: state.beatType === 12 ? 'active' : '',
                onclick: () => setBeatType(12),
                title: 'Dotted eighth note gets the beat',
              },
              ['♪·', m('br'), 'Dotted Eighth']
            ),
            m(
              'button.beat-type-btn',
              {
                class: state.beatType === 16 ? 'active' : '',
                onclick: () => setBeatType(16),
                title: 'Sixteenth note gets the beat',
              },
              ['𝅘𝅥𝅯', m('br'), '16th']
            ),
          ]),
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
              ? m('div.empty-pattern', 'Add notes to create a rhythm.')
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
          m('div.pattern-actions', [
            m(
              'button.action-icon',
              {
                onclick: clearPattern,
                title: 'Clear current pattern',
              },
              '🗑️'
            ),
            m(
              'button.action-icon',
              {
                onclick: saveCurrentPattern,
                title: 'Save current pattern',
              },
              '💾'
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

            // Dot toggle
            m('div.dot-control', [
              m(
                'button.dot-btn',
                {
                  class: state.nextNoteDotted ? 'active' : '',
                  onclick: toggleDot,
                  title: 'Toggle dot for next note (makes it 1.5x longer)',
                },
                [
                  '·',
                  m('br'),
                  'Dot',
                  state.nextNoteDotted ? m('span.status', ' (ON)') : '',
                ]
              ),

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
          ]),

          // Pattern controls
          m('div.pattern-controls', []),

          // Saved patterns section
          m('div.preset-patterns', [
            m('div.patterns-header', [
              m('h4', 'Rhythm Patterns:'),
              m('div.pattern-actions', [
                m(
                  'button.action-icon',
                  {
                    class: state.emphasizeFirstBeat ? 'active' : '',
                    onclick: toggleEmphasizeFirstBeat,
                    title: 'Toggle emphasize first beat',
                  },
                  '🔊'
                ),
                m(
                  'button.action-icon',
                  {
                    onclick: clearPattern,
                    title: 'Clear current pattern',
                  },
                  '🗑️'
                ),
                m(
                  'button.action-icon',
                  {
                    onclick: saveCurrentPattern,
                    title: 'Save current pattern',
                  },
                  '💾'
                ),
              ]),
            ]),
            state.savedPatterns.map((savedPattern, index) =>
              m('div.saved-pattern', { key: index }, [
                m(
                  'button.preset-btn',
                  {
                    onclick: () => setPresetPattern(savedPattern.pattern),
                  },
                  savedPattern.name
                ),
                m(
                  'button.delete-btn',
                  {
                    onclick: () => removeSavedPattern(index),
                    title: 'Delete this saved pattern',
                  },
                  '×'
                ),
              ])
            ),
          ]),
        ]),
      ]),
    ])
  },
}

export default Metronome
