// Persistent metronome service that survives component mounting/unmounting
class MetronomeService {
  private isPlaying = false
  private tempo = 120
  private volume = 50
  private pattern = [1] // Default quarter note pattern
  private currentNote = 0
  private emphasizeFirstBeat = false
  private timeoutId: number | null = null
  private audioContext: AudioContext | null = null
  private gainNode: GainNode | null = null
  private nextNoteTime = 0
  private lookAhead = 25.0
  private scheduleAheadTime = 0.1
  private savedPatterns: any[] = []
  private stateChangeCallback: ((isPlaying: boolean) => void) | null = null

  constructor() {
    this.loadSavedPatterns()
  }

  private loadSavedPatterns() {
    try {
      this.savedPatterns = JSON.parse(
        localStorage.getItem('metronome-saved-patterns') || '[]'
      )
    } catch (e) {
      this.savedPatterns = []
    }
  }

  private savePatternsToStorage() {
    localStorage.setItem(
      'metronome-saved-patterns',
      JSON.stringify(this.savedPatterns)
    )
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
        const isEmphasized =
          this.emphasizeFirstBeat &&
          this.currentNote % this.pattern.length === 0
        this.playClick(this.nextNoteTime, isEmphasized)
      }
    }

    // Calculate next note time
    const noteValue =
      this.pattern.length > 0
        ? Math.abs(this.pattern[this.currentNote % this.pattern.length])
        : 1
    const noteDuration = (60 / this.tempo) * (4 / noteValue)
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
  getVolume() {
    return this.volume
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

  setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(100, volume))
    if (this.gainNode) {
      this.gainNode.gain.value = this.volume / 100
    }
  }

  setPattern(pattern: number[]) {
    this.pattern = pattern.length > 0 ? pattern : [1]
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
    this.pattern = [1] // Reset to single quarter note
    this.currentNote = 0
  }

  savePattern(name: string) {
    const newPattern = {
      name,
      pattern: [...this.pattern],
      tempo: this.tempo,
      emphasizeFirstBeat: this.emphasizeFirstBeat,
    }
    this.savedPatterns.push(newPattern)
    this.savePatternsToStorage()
  }

  loadPattern(index: number) {
    if (index >= 0 && index < this.savedPatterns.length) {
      const savedPattern = this.savedPatterns[index]
      this.pattern = [...savedPattern.pattern]
      this.tempo = savedPattern.tempo
      this.emphasizeFirstBeat = savedPattern.emphasizeFirstBeat || false
      this.currentNote = 0
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
    return this.currentNote % this.pattern.length
  }
}

// Create a singleton instance
export const metronomeService = new MetronomeService()
