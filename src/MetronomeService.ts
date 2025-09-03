// Persistent metronome service that survives component mounting/unmounting
class MetronomeService {
  private isPlaying = false
  private tempo = 120
  private beatType = 4 // What note value the tempo represents (1=whole, 2=half, 4=quarter, 8=eighth, 16=sixteenth)
  private volume = 50
  private muteChance = 0 // Percentage chance (0-100) to randomly mute beats
  private syncOffset = 0 // Milliseconds to offset UI timing (positive = UI earlier, negative = UI later)
  private pattern: number[] = [] // Default empty pattern
  private currentNote = 0
  private currentlyPlayingNote = 0 // Track which note is currently being heard
  private emphasizeFirstBeat = true
  private timeoutId: number | null = null
  private audioContext: AudioContext | null = null
  private gainNode: GainNode | null = null
  private nextNoteTime = 0
  private lookAhead = 50.0
  private scheduleAheadTime = 0.1
  private savedPatterns: any[] = []
  private stateChangeCallback: ((isPlaying: boolean) => void) | null = null
  private noteChangeCallback: (() => void) | null = null
  private patternChangeCallback: (() => void) | null = null

  // Default built-in patterns
  private defaultPatterns = [
    { name: '4/4', pattern: [1, 1, 1, 1] },
    { name: '3/4', pattern: [1, 1, 1] },
    { name: '6/8', pattern: [0.5, 0.5, 0.5, 0.5, 0.5, 0.5] },
    { name: '3-2 Clave', pattern: [0.75, 0.75, 0.5, -0.5, 0.5, 0.5, -0.5] },
    { name: '2-3 Clave', pattern: [-1, 1, 1, -1, 1.5, 1.5, 1] },
    {
      name: 'Bolero',
      pattern: [
        1.5, 0.5, 0.5, 0.5, 1.5, 0.5, 0.5, 0.5, 1.5, 0.5, 0.5, 0.5, 0.5, 0.5,
        0.5, 0.5, 0.5, 0.5,
      ],
    },
  ]

  constructor() {
    this.loadSavedPatterns()
    this.loadSyncOffset()
    console.log(
      'MetronomeService: Initialized with patterns:',
      this.savedPatterns.length
    )
    console.log(
      'MetronomeService: Pattern names:',
      this.savedPatterns.map(p => p.name)
    )
    console.log('MetronomeService: Loaded sync offset:', this.syncOffset + 'ms')
  }

  private loadSavedPatterns() {
    console.log('MetronomeService: Loading saved patterns from localStorage...')
    try {
      const stored = localStorage.getItem('metronome-saved-patterns')
      console.log(
        'MetronomeService: Stored patterns from localStorage:',
        stored
      )

      if (stored) {
        const patterns = JSON.parse(stored)
        // Validate the data structure
        if (Array.isArray(patterns)) {
          // If we have an empty array, populate with defaults and save
          if (patterns.length === 0) {
            console.log(
              'MetronomeService: Empty patterns array found, populating with defaults'
            )
            this.savedPatterns = [...this.defaultPatterns]
            this.savePatternsToStorage()
            return
          }

          // If we have patterns, validate them
          const validPatterns = patterns.filter(
            p =>
              p &&
              typeof p.name === 'string' &&
              Array.isArray(p.pattern) &&
              p.pattern.every((n: any) => typeof n === 'number')
          )
          console.log(
            'MetronomeService: Valid saved patterns found:',
            validPatterns.length
          )
          this.savedPatterns = validPatterns
          console.log(
            'MetronomeService: Total patterns loaded:',
            this.savedPatterns.length
          )
          return
        }
      }
    } catch (e) {
      console.warn(
        'MetronomeService: Failed to load saved patterns from localStorage:',
        e
      )
    }

    // No valid stored patterns found - save defaults to localStorage for first time
    console.log(
      'MetronomeService: No saved patterns found, initializing with defaults:',
      this.defaultPatterns.length
    )
    this.savedPatterns = [...this.defaultPatterns]
    this.savePatternsToStorage()
  }

  private savePatternsToStorage() {
    try {
      // Save all patterns (including defaults when initializing, or user patterns afterward)
      console.log(
        'MetronomeService: Saving patterns to localStorage:',
        this.savedPatterns.length
      )
      localStorage.setItem(
        'metronome-saved-patterns',
        JSON.stringify(this.savedPatterns)
      )
    } catch (e) {
      console.warn(
        'MetronomeService: Failed to save patterns to localStorage:',
        e
      )
    }
  }

  private initAudio() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)()
      this.gainNode = this.audioContext.createGain()
      this.gainNode.connect(this.audioContext.destination)
      this.gainNode.gain.value = this.volume / 100
    }
  }

  private playClick(time: number, isEmphasized: boolean) {
    if (!this.audioContext || !this.gainNode) return

    const oscillator = this.audioContext.createOscillator()
    const noteGain = this.audioContext.createGain()

    oscillator.connect(noteGain)
    noteGain.connect(this.gainNode)

    oscillator.frequency.value = isEmphasized ? 1000 : 800
    oscillator.type = 'square'

    noteGain.gain.setValueAtTime(0.1, time)
    noteGain.gain.exponentialRampToValueAtTime(0.01, time + 0.1)

    oscillator.start(time)
    oscillator.stop(time + 0.1)
  }

  private scheduleNote() {
    if (!this.audioContext) return

    const currentTime = this.audioContext.currentTime
    const timingError = this.nextNoteTime - currentTime

    // Log timing errors
    if (Math.abs(timingError) > 0.005) {
      console.warn(
        `Metronome timing error: ${(timingError * 1000).toFixed(2)}ms`
      )
    }

    if (this.pattern.length > 0) {
      const currentNoteValue =
        this.pattern[this.currentNote % this.pattern.length]
      const isRest = currentNoteValue < 0

      if (!isRest) {
        // Check for random muting
        const shouldMute =
          this.muteChance > 0 && Math.random() * 100 < this.muteChance

        if (!shouldMute) {
          const isEmphasized =
            this.emphasizeFirstBeat &&
            this.currentNote % this.pattern.length === 0
          this.playClick(this.nextNoteTime, isEmphasized)
        }
      }

      // Schedule UI update to happen when THIS audio plays (with sync offset)
      if (this.noteChangeCallback) {
        const delay =
          (this.nextNoteTime - this.audioContext.currentTime) * 1000 -
          this.syncOffset
        const beatToHighlight = this.currentNote % this.pattern.length
        setTimeout(() => {
          this.currentlyPlayingNote = beatToHighlight
          if (this.noteChangeCallback) {
            this.noteChangeCallback()
          }
        }, Math.max(0, delay))
      }
    } else {
      // Empty pattern: play simple quarter note beats
      const shouldMute =
        this.muteChance > 0 && Math.random() * 100 < this.muteChance

      if (!shouldMute) {
        // For empty pattern, just emphasize the very first beat, then all equal
        const isEmphasized = this.emphasizeFirstBeat && this.currentNote === 0
        this.playClick(this.nextNoteTime, isEmphasized)
      }

      // Schedule UI update for empty pattern (with sync offset)
      if (this.noteChangeCallback) {
        const delay =
          (this.nextNoteTime - this.audioContext.currentTime) * 1000 -
          this.syncOffset
        setTimeout(() => {
          this.currentlyPlayingNote = 0 // Empty pattern always shows beat 0
          if (this.noteChangeCallback) {
            this.noteChangeCallback()
          }
        }, Math.max(0, delay))
      }
    } // Calculate next note time
    const noteValue =
      this.pattern.length > 0
        ? Math.abs(this.pattern[this.currentNote % this.pattern.length])
        : 1

    // Beat type determines what note value the tempo represents
    // beatType: 1=whole, 2=half, 4=quarter, 8=eighth, 16=sixteenth
    // Convert the tempo to quarter note equivalent, then apply pattern note value
    const quarterNoteTempo = this.tempo * (this.beatType / 4)
    const noteDuration = (60 / quarterNoteTempo) * noteValue
    this.nextNoteTime += noteDuration
    this.currentNote++
  }

  private scheduler = () => {
    if (!this.isPlaying || !this.audioContext) return

    while (
      this.nextNoteTime <
      this.audioContext.currentTime + this.scheduleAheadTime
    ) {
      this.scheduleNote()
    }

    this.timeoutId = window.setTimeout(this.scheduler, this.lookAhead)
  }

  // Public methods
  start() {
    if (this.isPlaying) return

    this.initAudio()
    if (this.audioContext?.state === 'suspended') {
      this.audioContext.resume()
    }

    this.isPlaying = true
    this.currentNote = 0
    this.currentlyPlayingNote = 0
    this.nextNoteTime = this.audioContext!.currentTime
    this.scheduler()

    if (this.stateChangeCallback) {
      this.stateChangeCallback(true)
    }
  }

  stop() {
    if (!this.isPlaying) return

    this.isPlaying = false
    if (this.timeoutId) {
      clearTimeout(this.timeoutId)
      this.timeoutId = null
    }

    if (this.stateChangeCallback) {
      this.stateChangeCallback(false)
    }
  }

  toggle() {
    if (this.isPlaying) {
      this.stop()
    } else {
      this.start()
    }
  }

  // Getters and setters
  getIsPlaying() {
    return this.isPlaying
  }
  getTempo() {
    return this.tempo
  }
  getBeatType() {
    return this.beatType
  }
  getVolume() {
    return this.volume
  }
  getMuteChance() {
    return this.muteChance
  }
  getSyncOffset() {
    return this.syncOffset
  }
  getPattern() {
    return this.pattern
  }
  getEmphasizeFirstBeat() {
    return this.emphasizeFirstBeat
  }
  getSavedPatterns() {
    return this.savedPatterns
  }

  setTempo(tempo: number) {
    this.tempo = Math.max(20, Math.min(300, tempo))
  }

  setBeatType(beatType: number) {
    this.beatType = beatType
  }

  setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(100, volume))
    if (this.gainNode) {
      this.gainNode.gain.value = this.volume / 100
    }
  }

  setMuteChance(muteChance: number) {
    this.muteChance = Math.max(0, Math.min(100, muteChance))
  }

  setSyncOffset(offset: number) {
    this.syncOffset = Math.max(-1000, Math.min(1000, offset))
    this.saveSyncOffset()
    console.log('MetronomeService: Sync offset set to', this.syncOffset + 'ms')
  }

  private saveSyncOffset() {
    try {
      localStorage.setItem('metronome-sync-offset', this.syncOffset.toString())
    } catch (error) {
      console.error('MetronomeService: Failed to save sync offset:', error)
    }
  }

  private loadSyncOffset() {
    try {
      const saved = localStorage.getItem('metronome-sync-offset')
      if (saved !== null) {
        const offset = parseFloat(saved)
        if (!isNaN(offset)) {
          this.syncOffset = Math.max(-1000, Math.min(1000, offset))
          console.log(
            'MetronomeService: Loaded sync offset from localStorage:',
            this.syncOffset + 'ms'
          )
        }
      }
    } catch (error) {
      console.error('MetronomeService: Failed to load sync offset:', error)
    }
  }

  setPattern(pattern: number[]) {
    this.pattern = pattern // Allow empty patterns
    this.currentNote = 0
    if (this.patternChangeCallback) {
      this.patternChangeCallback()
    }
  }

  setEmphasizeFirstBeat(emphasize: boolean) {
    this.emphasizeFirstBeat = emphasize
  }

  addNoteToPattern(noteValue: number) {
    this.pattern.push(noteValue)
    if (this.patternChangeCallback) {
      this.patternChangeCallback()
    }
  }

  removeNoteFromPattern(index: number) {
    if (this.pattern.length > 1) {
      this.pattern.splice(index, 1)
    }
    if (this.patternChangeCallback) {
      this.patternChangeCallback()
    }
  }

  clearPattern() {
    this.pattern = [] // Empty pattern
    this.currentNote = 0
    if (this.patternChangeCallback) {
      this.patternChangeCallback()
    }
  }

  savePattern(name: string) {
    const newPattern = {
      name,
      pattern: [...this.pattern],
      tempo: this.tempo,
      beatType: this.beatType,
      emphasizeFirstBeat: this.emphasizeFirstBeat,
    }

    // Simply append the new pattern to the existing patterns
    this.savedPatterns.push(newPattern)
    console.log('MetronomeService: Added new pattern:', name)

    this.savePatternsToStorage()
  }

  loadPattern(index: number) {
    if (index >= 0 && index < this.savedPatterns.length) {
      const savedPattern = this.savedPatterns[index]
      const wasPlaying = this.isPlaying

      // Stop the metronome to reset timing
      if (wasPlaying) {
        this.stop()
      }

      this.pattern = [...savedPattern.pattern]
      this.tempo = savedPattern.tempo || this.tempo
      this.beatType = savedPattern.beatType || 4 // Default to quarter note if not saved
      this.emphasizeFirstBeat =
        savedPattern.emphasizeFirstBeat !== undefined
          ? savedPattern.emphasizeFirstBeat
          : this.emphasizeFirstBeat
      this.currentNote = 0

      if (this.patternChangeCallback) {
        this.patternChangeCallback()
      }

      console.log('MetronomeService: Loaded pattern:', savedPattern.name, {
        pattern: this.pattern,
        tempo: this.tempo,
        beatType: this.beatType,
        emphasizeFirstBeat: this.emphasizeFirstBeat,
      })

      // Restart if it was playing
      if (wasPlaying) {
        this.start()
      }
    }
  }

  deletePattern(index: number) {
    if (index >= 0 && index < this.savedPatterns.length) {
      this.savedPatterns.splice(index, 1)
      this.savePatternsToStorage()
    }
  }

  setStateChangeCallback(callback: (isPlaying: boolean) => void) {
    this.stateChangeCallback = callback
  }

  setNoteChangeCallback(callback: () => void) {
    this.noteChangeCallback = callback
  }

  setPatternChangeCallback(callback: () => void) {
    this.patternChangeCallback = callback
  }

  getCurrentNote() {
    if (this.pattern.length === 0) {
      return 0 // For empty patterns, always return 0
    }
    return this.currentlyPlayingNote
  }

  // Get a visual representation of the current pattern for the UI
  getPatternRepresentation() {
    // Note symbols
    const noteSymbols: { [key: number]: string } = {
      0.125: '𝅘𝅥𝅯𝅭', // 32nd note
      0.25: '𝅘𝅥𝅯', // 16th note
      0.375: '𝅘𝅥𝅯.', // Dotted 16th note
      0.5: '♪', // 8th note
      0.75: '♪.', // Dotted 8th note
      1: '♩', // Quarter note
      1.5: '♩.', // Dotted quarter note
      2: '𝅗𝅥', // Half note
      3: '𝅗𝅥.', // Dotted half note
      4: '𝅝', // Whole note
      6: '𝅝.', // Dotted whole note
    }

    // Rest symbols
    const restSymbols: { [key: string]: string } = {
      '-0.125': '𝄿', // 32nd rest
      '-0.25': '𝄾', // 16th rest
      '-0.375': '𝄾.', // Dotted 16th rest
      '-0.5': '𝄾', // 8th rest
      '-0.75': '𝄾.', // Dotted 8th rest
      '-1': '𝄽', // Quarter rest
      '-1.5': '𝄽.', // Dotted quarter rest
      '-2': '𝄼', // Half rest
      '-3': '𝄼.', // Dotted half rest
      '-4': '𝄻', // Whole rest
      '-6': '𝄻.', // Dotted whole rest
    }

    const getSymbol = (value: number) => {
      if (value < 0) {
        return restSymbols[value.toString()] || '𝄼'
      } else {
        return noteSymbols[value] || '♩'
      }
    }

    if (this.pattern.length === 0) {
      return '♩' // Default quarter note for empty pattern
    }

    // For patterns with multiple notes, show up to 16 symbols
    if (this.pattern.length <= 16) {
      return this.pattern.map(getSymbol).join('')
    } else {
      // For longer patterns, show first sixteen notes + "..."
      return this.pattern.slice(0, 16).map(getSymbol).join('') + '…'
    }
  }

  // Get pattern representation with highlighting information for UI
  getPatternRepresentationWithHighlight() {
    // Note symbols
    const noteSymbols: { [key: number]: string } = {
      0.125: '𝅘𝅥𝅯𝅭', // 32nd note
      0.25: '𝅘𝅥𝅯', // 16th note
      0.375: '𝅘𝅥𝅯.', // Dotted 16th note
      0.5: '♪', // 8th note
      0.75: '♪.', // Dotted 8th note
      1: '♩', // Quarter note
      1.5: '♩.', // Dotted quarter note
      2: '𝅗𝅥', // Half note
      3: '𝅗𝅥.', // Dotted half note
      4: '𝅝', // Whole note
      6: '𝅝.', // Dotted whole note
    }

    // Rest symbols
    const restSymbols: { [key: string]: string } = {
      '-0.125': '𝄿', // 32nd rest
      '-0.25': '𝄾', // 16th rest
      '-0.375': '𝄾.', // Dotted 16th rest
      '-0.5': '𝄾', // 8th rest
      '-0.75': '𝄾.', // Dotted 8th rest
      '-1': '𝄽', // Quarter rest
      '-1.5': '𝄽.', // Dotted quarter rest
      '-2': '𝄼', // Half rest
      '-3': '𝄼.', // Dotted half rest
      '-4': '𝄻', // Whole rest
      '-6': '𝄻.', // Dotted whole rest
    }

    const getSymbol = (value: number) => {
      if (value < 0) {
        return restSymbols[value.toString()] || '𝄼'
      } else {
        return noteSymbols[value] || '♩'
      }
    }

    if (this.pattern.length === 0) {
      return [{ symbol: '♩', isActive: this.isPlaying }]
    }

    const currentNote = this.currentlyPlayingNote
    const maxNotes = this.pattern.length <= 16 ? this.pattern.length : 16

    const notes = this.pattern.slice(0, maxNotes).map((value, index) => ({
      symbol: getSymbol(value),
      isActive: this.isPlaying && index === currentNote,
    }))

    if (this.pattern.length > 16) {
      notes.push({ symbol: '…', isActive: false })
    }

    return notes
  }
}

// Create a singleton instance
export const metronomeService = new MetronomeService()
