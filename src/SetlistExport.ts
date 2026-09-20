import { SetlistState, Song } from './State'

// Generate iRealb URL from setlist
export const generateIRealbURL = (setlist: SetlistState): string => {
  if (setlist.songs.length === 0) {
    return ''
  }

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

  return `irealb://${songs}===${encodeURIComponent(setlist.name)}`
}

// Export functionality
export const exportSetlist = async (setlist: SetlistState): Promise<void> => {
  if (setlist.songs.length === 0) {
    alert('This setlist is empty. Cannot export an empty setlist.')
    return
  }

  try {
    const irealUrl = generateIRealbURL(setlist)

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

// Open setlist in iReal Pro app
export const openSetlistInIReal = (setlist: SetlistState): void => {
  if (setlist.songs.length === 0) {
    alert('This setlist is empty. Cannot open an empty setlist.')
    return
  }

  try {
    const irealUrl = generateIRealbURL(setlist)

    // Create a temporary link and click it to trigger the iReal Pro app
    const link = document.createElement('a')
    link.href = irealUrl
    link.style.display = 'none'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  } catch (error) {
    console.error('Failed to open in iReal Pro:', error)
    alert('Failed to open setlist in iReal Pro. Please try again.')
  }
}
