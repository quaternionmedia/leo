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
  // Timing correction properties
  startTime: number // When the metronome started (performance.now())
  nextBeatTime: number // When the next beat should occur
  lookAhead: number // How far ahead to schedule audio events (ms)
  scheduleAheadTime: number // How far ahead to schedule (seconds for Web Audio)
  // Timing monitoring properties
  expectedBeatCount: number // How many beats should have occurred
  actualBeatCount: number // How many beats were actually scheduled
  lastScheduledTime: number // Last time a beat was scheduled
  maxTimingError: number // Maximum timing error detected
  timingErrorCount: number // Number of timing errors detected
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
    { name: '3-2 Clave', pattern: [4.5, 4.5, 4, -4, 4, 4, -4] },
    { name: '2-3 Clave', pattern: [-4, 4, 4, -4, 4.5, 4.5, 4] },
    {
      name: 'Bolero',
      pattern: [4.5, 8, 8, 8, 4.5, 8, 8, 8, 4.5, 8, 8, 8, 8, 8, 8, 8, 8, 8],
    },
  ]

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const patterns = JSON.parse(stored)
      // Validate the data structure
      if (Array.isArray(patterns) && patterns.length) {
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

interface MetronomeProps {
  onStateChange?: (isPlaying: boolean) => void
  isPersistent?: boolean // Flag to prevent cleanup on unmount
  useService?: boolean // Flag to use the service instead of component state
}

const Metronome: m.Component<MetronomeProps, MetronomeState> = {
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

    // Initialize timing correction properties
    vnode.state.startTime = 0
    vnode.state.nextBeatTime = 0
    vnode.state.lookAhead = 25.0 // 25ms lookahead
    vnode.state.scheduleAheadTime = 0.1 // 100ms ahead in Web Audio time

    // Initialize timing monitoring properties
    vnode.state.expectedBeatCount = 0
    vnode.state.actualBeatCount = 0
    vnode.state.lastScheduledTime = 0
    vnode.state.maxTimingError = 0
    vnode.state.timingErrorCount = 0

    // Load saved patterns from localStorage
    vnode.state.savedPatterns = loadSavedPatternsFromStorage()
  },

  onremove(vnode) {
    // Only cleanup if this is not a persistent instance
    if (!vnode.attrs.isPersistent) {
      if (vnode.state.timeoutId) {
        clearTimeout(vnode.state.timeoutId)
      }
      if (vnode.state.audioContext) {
        vnode.state.audioContext.close()
      }
    }
  },

  view(vnode) {
    const state = vnode.state

    // Calculate duration of a note in milliseconds based on tempo
    const getNoteDuration = (noteValue: number) => {
      // Beat type duration at current tempo
      const beatTypeDuration = 60000 / state.tempo

      // Handle rests (negative values) - use absolute value for duration calculation
      const absoluteValue = Math.abs(noteValue)

      // Check if it's a dotted note (has decimal part)
      const isDotted = absoluteValue % 1 !== 0
      const baseValue = isDotted ? Math.floor(absoluteValue) : absoluteValue

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

    const playClick = (isDownbeat = false, when = 0) => {
      try {
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

        // Use the provided time or current time if not specified
        const startTime = when || state.audioContext.currentTime

        // Validate audio parameters
        if (frequency <= 0 || volumeGain < 0) {
          console.error(
            `Metronome: Invalid audio parameters - frequency: ${frequency}, gain: ${volumeGain}`
          )
          return
        }

        oscillator.frequency.setValueAtTime(frequency, startTime)
        gainNode.gain.setValueAtTime(volumeGain, startTime)
        gainNode.gain.exponentialRampToValueAtTime(
          volumeGain * 0.1,
          startTime + 0.1
        )

        oscillator.start(startTime)
        oscillator.stop(startTime + 0.1)
      } catch (error) {
        console.error('Metronome: Error in playClick:', error)
        state.timingErrorCount++
      }
    }

    // High-resolution timing system with drift correction
    const scheduler = () => {
      if (!state.audioContext) {
        console.error('Metronome: AudioContext not initialized in scheduler')
        return
      }

      const currentTime = state.audioContext.currentTime
      const schedulingLatency = performance.now() - state.lastScheduledTime

      // Log if scheduler is running too late (indicates system performance issues)
      if (
        state.lastScheduledTime > 0 &&
        schedulingLatency > state.lookAhead * 2
      ) {
        console.warn(
          `Metronome: Scheduler running late by ${(
            schedulingLatency - state.lookAhead
          ).toFixed(2)}ms`
        )
        state.timingErrorCount++
      }

      let beatsScheduled = 0
      const scheduleStartTime = currentTime

      // Look ahead and schedule beats that need to be scheduled in the next interval
      while (state.nextBeatTime < currentTime + state.scheduleAheadTime) {
        // Check for timing errors
        const timingError =
          Math.abs(state.nextBeatTime - scheduleStartTime) * 1000 // Convert to ms
        if (timingError > 10) {
          // More than 10ms error
          console.warn(
            `Metronome: Timing error detected: ${timingError.toFixed(
              2
            )}ms drift`
          )
          state.timingErrorCount++

          if (timingError > state.maxTimingError) {
            state.maxTimingError = timingError
            console.warn(
              `Metronome: New maximum timing error: ${timingError.toFixed(2)}ms`
            )
          }
        }

        // Check if we're scheduling too far in the past (audio might drop)
        if (state.nextBeatTime < currentTime - 0.01) {
          // 10ms in the past
          console.error(
            `Metronome: Attempting to schedule beat ${
              (state.nextBeatTime - currentTime) * 1000
            }ms in the past - audio may drop`
          )
          state.timingErrorCount++
        }

        scheduleNote(state.nextBeatTime)
        nextNote()
        beatsScheduled++
        state.actualBeatCount++

        // Prevent infinite loops if something goes wrong
        if (beatsScheduled > 10) {
          console.error(
            'Metronome: Too many beats scheduled in one cycle, breaking to prevent lockup'
          )
          break
        }
      }

      // Log scheduling statistics periodically
      if (state.actualBeatCount % 100 === 0 && state.actualBeatCount > 0) {
        const expectedBeats = Math.floor(
          (currentTime - state.startTime) /
            (((60 / state.tempo) * 4) / state.beatType)
        )
        const beatDrift = state.actualBeatCount - expectedBeats
        console.log(
          `Metronome: Beat ${
            state.actualBeatCount
          } - Drift: ${beatDrift} beats, Max error: ${state.maxTimingError.toFixed(
            2
          )}ms, Errors: ${state.timingErrorCount}`
        )
      }

      state.lastScheduledTime = performance.now()

      // Continue scheduling if metronome is playing
      if (state.isPlaying) {
        state.timeoutId = setTimeout(scheduler, state.lookAhead)
      }
    }

    const scheduleNote = (time: number) => {
      try {
        // Validate scheduling time
        if (!state.audioContext) {
          console.error('Metronome: AudioContext not available for scheduling')
          return
        }

        const currentTime = state.audioContext.currentTime
        const scheduleDelay = time - currentTime

        // Log warnings for scheduling anomalies
        if (scheduleDelay < -0.01) {
          console.warn(
            `Metronome: Scheduling beat ${(scheduleDelay * 1000).toFixed(
              2
            )}ms in the past`
          )
        } else if (scheduleDelay > state.scheduleAheadTime + 0.05) {
          console.warn(
            `Metronome: Scheduling beat too far ahead: ${(
              scheduleDelay * 1000
            ).toFixed(2)}ms`
          )
        }

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

        // Don't play click for rests (negative values) or if muted
        const isRest = currentNote < 0
        const shouldMute = Math.random() * 100 < state.muteChance
        if (!isRest && !shouldMute) {
          try {
            playClick(isDownbeat, time)
          } catch (error) {
            console.error('Metronome: Error playing click:', error)
            state.timingErrorCount++
          }
        }

        // Move to next step (only if pattern exists)
        if (state.rhythmPattern.length > 0) {
          state.currentStep =
            (state.currentStep + 1) % state.rhythmPattern.length
          // Trigger a re-render to update the note highlighting
          // Use requestAnimationFrame to avoid blocking audio scheduling
          requestAnimationFrame(() => m.redraw())
        }
        // For empty pattern, currentStep stays at 0
      } catch (error) {
        console.error('Metronome: Critical error in scheduleNote:', error)
        state.timingErrorCount++
      }
    }

    const nextNote = () => {
      // Handle empty pattern case - default to quarter note
      let currentNote: number

      if (state.rhythmPattern.length === 0) {
        currentNote = 4
      } else {
        const prevStep =
          state.currentStep === 0
            ? state.rhythmPattern.length - 1
            : state.currentStep - 1
        currentNote = state.rhythmPattern[prevStep]
      }

      const noteDuration = getNoteDuration(currentNote)
      // Convert milliseconds to seconds for Web Audio API timing
      state.nextBeatTime += noteDuration / 1000
    }

    const toggleMetronome = () => {
      if (state.isPlaying) {
        if (state.timeoutId) {
          clearTimeout(state.timeoutId)
          state.timeoutId = null
        }
        state.isPlaying = false

        // Log final timing statistics
        console.log(
          `Metronome stopped. Final stats - Total beats: ${
            state.actualBeatCount
          }, Max error: ${state.maxTimingError.toFixed(2)}ms, Total errors: ${
            state.timingErrorCount
          }`
        )

        // Notify parent component of state change
        if (vnode.attrs.onStateChange) {
          vnode.attrs.onStateChange(false)
        }

        // Trigger redraw when stopping to update UI state
        m.redraw()
      } else {
        state.currentStep = 0 // Reset to first step when starting
        state.isPlaying = true

        // Initialize audio context if needed
        if (!state.audioContext) {
          try {
            state.audioContext = new AudioContext()
            console.log('Metronome: AudioContext initialized successfully')
          } catch (error) {
            console.error(
              'Metronome: Failed to initialize AudioContext:',
              error
            )
            state.isPlaying = false

            // Notify parent component of state change
            if (vnode.attrs.onStateChange) {
              vnode.attrs.onStateChange(false)
            }
            return
          }
        }

        // Reset timing statistics
        state.actualBeatCount = 0
        state.expectedBeatCount = 0
        state.maxTimingError = 0
        state.timingErrorCount = 0
        state.lastScheduledTime = performance.now()
        state.startTime = state.audioContext.currentTime

        // Initialize timing
        state.nextBeatTime = state.audioContext.currentTime

        console.log('Metronome started with timing monitoring enabled')

        // Notify parent component of state change
        if (vnode.attrs.onStateChange) {
          vnode.attrs.onStateChange(true)
        }

        // Trigger redraw when starting to show initial highlighted note
        m.redraw()

        // Start the scheduler
        try {
          scheduler()
        } catch (error) {
          console.error('Metronome: Error starting scheduler:', error)
          state.isPlaying = false

          // Notify parent component of state change
          if (vnode.attrs.onStateChange) {
            vnode.attrs.onStateChange(false)
          }
        }
      }
    }

    const updateTempo = (e: Event) => {
      try {
        const target = e.target as HTMLInputElement
        const newTempo = parseInt(target.value)

        if (isNaN(newTempo) || newTempo < 30 || newTempo > 300) {
          console.warn(`Metronome: Invalid tempo value: ${target.value}`)
          return
        }

        const oldTempo = state.tempo
        state.tempo = newTempo

        console.log(
          `Metronome: Tempo changed from ${oldTempo} to ${newTempo} BPM`
        )

        if (state.isPlaying) {
          // Restart rhythm with new tempo
          if (state.timeoutId) {
            clearTimeout(state.timeoutId)
          }
          // Reset timing and restart scheduler
          if (state.audioContext) {
            state.nextBeatTime = state.audioContext.currentTime
            console.log('Metronome: Restarting scheduler due to tempo change')
          }
          scheduler()
        }
      } catch (error) {
        console.error('Metronome: Error updating tempo:', error)
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
      try {
        const oldBeatType = state.beatType
        state.beatType = beatType

        console.log(
          `Metronome: Beat type changed from ${oldBeatType} to ${beatType}`
        )

        if (state.isPlaying) {
          // Restart rhythm with new beat type
          if (state.timeoutId) {
            clearTimeout(state.timeoutId)
          }
          // Reset timing and restart scheduler
          if (state.audioContext) {
            state.nextBeatTime = state.audioContext.currentTime
            console.log(
              'Metronome: Restarting scheduler due to beat type change'
            )
          }
          scheduler()
        }
      } catch (error) {
        console.error('Metronome: Error updating beat type:', error)
      }
    }

    const addNoteToPattern = (noteValue: number) => {
      // Apply dot if nextNoteDotted is true (dotted note = 1.5x duration)
      // For dotted notes, we store the note value with a decimal flag
      const finalNoteValue = state.nextNoteDotted ? noteValue + 0.5 : noteValue
      state.rhythmPattern = [...state.rhythmPattern, finalNoteValue]
      // Note: nextNoteDotted stays active for multiple note inputs
    }

    const addRestToPattern = (noteValue: number) => {
      // Apply dot if nextNoteDotted is true (dotted rest = 1.5x duration)
      // For rests, we use negative values (e.g., -4 for quarter rest)
      const finalNoteValue = state.nextNoteDotted
        ? -(noteValue + 0.5)
        : -noteValue
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
      // Handle rests (negative values)
      const isRest = noteValue < 0
      const absoluteValue = Math.abs(noteValue)

      // Check if it's a dotted note (has decimal part)
      const isDotted = absoluteValue % 1 !== 0
      const baseValue = isDotted ? Math.floor(absoluteValue) : absoluteValue

      const symbols: { [key: number]: string } = {
        1: isRest ? '𝄻' : '𝅝', // whole rest or whole note
        2: isRest ? '𝄼' : '𝅗𝅥', // half rest or half note
        4: isRest ? '𝄽' : '♩', // quarter rest or quarter note
        8: isRest ? '𝄾' : '♪', // eighth rest or eighth note
        16: isRest ? '�' : '�𝅘𝅥𝅯', // sixteenth rest or sixteenth note
      }
      const baseSymbol = symbols[baseValue] || (isRest ? '𝄽' : '♩')
      return isDotted ? baseSymbol + '·' : baseSymbol
    }

    const getNoteName = (noteValue: number) => {
      // Handle rests (negative values)
      const isRest = noteValue < 0
      const absoluteValue = Math.abs(noteValue)

      // Check if it's a dotted note (has decimal part)
      const isDotted = absoluteValue % 1 !== 0
      const baseValue = isDotted ? Math.floor(absoluteValue) : absoluteValue

      const names: { [key: number]: string } = {
        1: 'Whole',
        2: 'Half',
        4: 'Quarter',
        8: 'Eighth',
        16: 'Sixteenth',
      }
      const baseName = names[baseValue] || 'Quarter'
      const noteType = isRest ? ' Rest' : ''
      return isDotted ? 'Dotted ' + baseName + noteType : baseName + noteType
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
                class: state.emphasizeFirstBeat ? 'active' : '',
                onclick: toggleEmphasizeFirstBeat,
                title: 'Toggle emphasize first beat',
              },
              '1⃣️'
            ),
            m(
              'button.action-icon',
              {
                onclick: saveCurrentPattern,
                title: 'Save current pattern',
              },
              '💾'
            ),

            m(
              'button.action-icon',
              {
                onclick: clearPattern,
                title: 'Clear current pattern',
              },
              '🗑️'
            ),
          ]),

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

              m('div.note-rest-container', [
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
                  m(
                    'button.note-btn',
                    { onclick: () => addNoteToPattern(16) },
                    ['𝅘𝅥𝅯', m('br'), '16th']
                  ),
                ]),
                m('div.rest-grid', [
                  m('button.rest-btn', { onclick: () => addRestToPattern(1) }, [
                    '𝄻',
                    m('br'),
                    'Whole Rest',
                  ]),
                  m('button.rest-btn', { onclick: () => addRestToPattern(2) }, [
                    '𝄼',
                    m('br'),
                    'Half Rest',
                  ]),
                  m('button.rest-btn', { onclick: () => addRestToPattern(4) }, [
                    '𝄽',
                    m('br'),
                    'Quarter Rest',
                  ]),
                  m('button.rest-btn', { onclick: () => addRestToPattern(8) }, [
                    '𝄾',
                    m('br'),
                    'Eighth Rest',
                  ]),
                  m(
                    'button.rest-btn',
                    { onclick: () => addRestToPattern(16) },
                    ['𝄿', m('br'), '16th Rest']
                  ),
                ]),
              ]),
            ]),
          ]),

          // Pattern controls
          m('div.pattern-controls', []),

          // Saved patterns section
          m('div.preset-patterns', [
            m('div.patterns-header', [m('h4', 'Saved Patterns:')]),
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
