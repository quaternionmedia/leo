import { UserSetlist, SetlistSong } from './State'

const STORAGE_KEY = 'leo_user_setlists'

/**
 * SetlistService handles all CRUD operations for user-created setlists
 * and persists them to localStorage
 */
export const SetlistService = {
  /**
   * Generate a unique ID for a new setlist
   */
  generateId(): string {
    return `setlist_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
  },

  /**
   * Load all setlists from localStorage
   */
  loadSetlists(): UserSetlist[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        return JSON.parse(stored)
      }
    } catch (e) {
      console.error('Failed to load setlists from localStorage:', e)
    }
    return []
  },

  /**
   * Save all setlists to localStorage
   */
  saveSetlists(setlists: UserSetlist[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(setlists))
    } catch (e) {
      console.error('Failed to save setlists to localStorage:', e)
    }
  },

  /**
   * Create a new setlist
   */
  createSetlist(name: string, setlists: UserSetlist[]): UserSetlist[] {
    const newSetlist: UserSetlist = {
      id: this.generateId(),
      name: name || 'New Setlist',
      songs: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    const updated = [...setlists, newSetlist]
    this.saveSetlists(updated)
    return updated
  },

  /**
   * Delete a setlist by ID
   */
  deleteSetlist(setlistId: string, setlists: UserSetlist[]): UserSetlist[] {
    const updated = setlists.filter(s => s.id !== setlistId)
    this.saveSetlists(updated)
    return updated
  },

  /**
   * Rename a setlist
   */
  renameSetlist(
    setlistId: string,
    newName: string,
    setlists: UserSetlist[]
  ): UserSetlist[] {
    const updated = setlists.map(s =>
      s.id === setlistId ? { ...s, name: newName, updatedAt: Date.now() } : s
    )
    this.saveSetlists(updated)
    return updated
  },

  /**
   * Add a song to a setlist
   */
  addSongToSetlist(
    setlistId: string,
    song: SetlistSong,
    setlists: UserSetlist[]
  ): UserSetlist[] {
    const updated = setlists.map(s => {
      if (s.id !== setlistId) return s
      // Check if song already exists in setlist
      const exists = s.songs.some(
        existing =>
          existing.title === song.title && existing.playlist === song.playlist
      )
      if (exists) return s
      return {
        ...s,
        songs: [...s.songs, song],
        updatedAt: Date.now(),
      }
    })
    this.saveSetlists(updated)
    return updated
  },

  /**
   * Remove a song from a setlist by index
   */
  removeSongFromSetlist(
    setlistId: string,
    songIndex: number,
    setlists: UserSetlist[]
  ): UserSetlist[] {
    const updated = setlists.map(s => {
      if (s.id !== setlistId) return s
      return {
        ...s,
        songs: s.songs.filter((_, i) => i !== songIndex),
        updatedAt: Date.now(),
      }
    })
    this.saveSetlists(updated)
    return updated
  },

  /**
   * Reorder songs within a setlist (move from one index to another)
   */
  reorderSongs(
    setlistId: string,
    fromIndex: number,
    toIndex: number,
    setlists: UserSetlist[]
  ): UserSetlist[] {
    const updated = setlists.map(s => {
      if (s.id !== setlistId) return s
      const songs = [...s.songs]
      const [removed] = songs.splice(fromIndex, 1)
      songs.splice(toIndex, 0, removed)
      return {
        ...s,
        songs,
        updatedAt: Date.now(),
      }
    })
    this.saveSetlists(updated)
    return updated
  },

  /**
   * Get a specific setlist by ID
   */
  getSetlist(setlistId: string, setlists: UserSetlist[]): UserSetlist | undefined {
    return setlists.find(s => s.id === setlistId)
  },

  /**
   * Duplicate a setlist
   */
  duplicateSetlist(setlistId: string, setlists: UserSetlist[]): UserSetlist[] {
    const original = this.getSetlist(setlistId, setlists)
    if (!original) return setlists

    const duplicate: UserSetlist = {
      id: this.generateId(),
      name: `${original.name} (copy)`,
      songs: [...original.songs],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    const updated = [...setlists, duplicate]
    this.saveSetlists(updated)
    return updated
  },

  /**
   * Export a setlist as JSON string (for sharing)
   */
  exportSetlist(setlist: UserSetlist): string {
    return JSON.stringify(setlist, null, 2)
  },

  /**
   * Import a setlist from JSON string
   */
  importSetlist(jsonStr: string, setlists: UserSetlist[]): UserSetlist[] {
    try {
      const imported = JSON.parse(jsonStr) as UserSetlist
      // Assign a new ID to avoid conflicts
      imported.id = this.generateId()
      imported.createdAt = Date.now()
      imported.updatedAt = Date.now()
      const updated = [...setlists, imported]
      this.saveSetlists(updated)
      return updated
    } catch (e) {
      console.error('Failed to import setlist:', e)
      return setlists
    }
  },

  /**
   * Move song up in setlist (toward index 0)
   */
  moveSongUp(
    setlistId: string,
    songIndex: number,
    setlists: UserSetlist[]
  ): UserSetlist[] {
    if (songIndex <= 0) return setlists
    return this.reorderSongs(setlistId, songIndex, songIndex - 1, setlists)
  },

  /**
   * Move song down in setlist (toward end)
   */
  moveSongDown(
    setlistId: string,
    songIndex: number,
    setlists: UserSetlist[]
  ): UserSetlist[] {
    const setlist = this.getSetlist(setlistId, setlists)
    if (!setlist || songIndex >= setlist.songs.length - 1) return setlists
    return this.reorderSongs(setlistId, songIndex, songIndex + 1, setlists)
  },
}

export default SetlistService
