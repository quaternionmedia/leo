// Persistent metronome service that survives component mounting/unmounting
class MetronomeService {
  private isPlaying = false
  private tempo = 120
  private beatType = 4 // What note value the tempo represents (1=whole, 2=half, 4=quarter, 8=eighth, 16=sixteenth)
  private volume = 50
  private muteChance = 0 // Percentage chance (0-100) to randomly mute beats
  private pattern = [1] // Default quarter note pattern
  private currentNote = 0
  private emphasizeFirstBeat = true
  private timeoutId: number | null = null
  private audioContext: AudioContext | null = null
  private gainNode: GainNode | null = null
  private nextNoteTime = 0
  private lookAhead = 25.0
  private scheduleAheadTime = 0.1
  private savedPatterns: any[] = []
  private stateChangeCallback: ((isPlaying: boolean) => void) | null = null

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
    console.log(
      'MetronomeService: Initialized with patterns:',
      this.savedPatterns.length
    )
    console.log(
      'MetronomeService: Pattern names:',
      this.savedPatterns.map(p => p.name)
    )
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
    } else {
      // Empty pattern: play simple quarter note beats
      const shouldMute =
        this.muteChance > 0 && Math.random() * 100 < this.muteChance

      if (!shouldMute) {
        // For empty pattern, just emphasize the very first beat, then all equal
        const isEmphasized = this.emphasizeFirstBeat && this.currentNote === 0
        this.playClick(this.nextNoteTime, isEmphasized)
      }
    }

    // Calculate next note time
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

  setPattern(pattern: number[]) {
    this.pattern = pattern // Allow empty patterns
    this.currentNote = 0
  }

  setEmphasizeFirstBeat(emphasize: boolean) {
    this.emphasizeFirstBeat = emphasize
  }

  addNoteToPattern(noteValue: number) {
    this.pattern.push(noteValue)
  }

  removeNoteFromPattern(index: number) {
    if (this.pattern.length > 1) {
      this.pattern.splice(index, 1)
    }
  }

  clearPattern() {
    this.pattern = [] // Empty pattern
    this.currentNote = 0
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

  getCurrentNote() {
    if (this.pattern.length === 0) {
      return 0 // For empty patterns, always return 0
    }
    return this.currentNote % this.pattern.length
  }
}

// Create a singleton instance
export const metronomeService = new MetronomeService()
