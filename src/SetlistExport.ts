import { SetlistState, Song } from './State'

// Export functionality
export const exportSetlist = async (setlist: SetlistState): Promise<void> => {
  if (setlist.songs.length === 0) {
    alert('This setlist is empty. Cannot export an empty setlist.')
    return
  }

  try {
    // Generate iRealb URL
    const songs = setlist.songs
      .map(song => {
        const title = encodeURIComponent(song.title || '')
        const composer = encodeURIComponent(song.composer || '')
        const style = encodeURIComponent(song.style || 'Medium Swing')
        const key = encodeURIComponent(song.key || 'C')
        const music = song.music || song.songText || '1r34LbKcu7'
        return `${title}=${composer}==${style}=${key}===${music}`
      })
      .join('=====')

    const irealUrl = `irealb://${songs}===${encodeURIComponent(setlist.name)}`

    // Copy to clipboard
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(irealUrl)
      alert('iRealb URL copied to clipboard!')
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = irealUrl
      textArea.style.position = 'fixed'
      textArea.style.left = '-999999px'
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      alert('iRealb URL copied to clipboard!')
    }
  } catch (error) {
    console.error('Export failed:', error)
    alert('Failed to export setlist. Please try again.')
  }
}
