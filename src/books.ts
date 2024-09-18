// load the iReal Pro files from the static folder

import jazz from './static/jazz.ireal?raw'
import jazz2 from './static/contemporary_jazz.ireal?raw'
import pop from './static/pop.ireal?raw'
import gypsy from './static/gypsy_jazz.ireal?raw'
import dixyland1 from './static/dixyland1.ireal?raw'
import dixyland2 from './static/dixyland2.ireal?raw'
import dixyland3 from './static/dixyland3.ireal?raw'
import dixyland4 from './static/dixyland_trad.ireal?raw'

import { Playlist } from 'ireal-renderer'

const books = [
  jazz,
  pop,
  jazz2,
  gypsy,
  dixyland1,
  dixyland2,
  dixyland3,
  dixyland4,
]

export const songs = []

for (let book of books) {
  // console.log('book', book)
  let playlist = new Playlist(book)
  songs.push(
    ...playlist.songs.map(song => ({ playlist: playlist.name, ...song }))
  )
}

// Load additional songs from local storage
let localSongs = localStorage.getItem('songs')
if (localSongs) {
  songs.push(...JSON.parse(localSongs))
}