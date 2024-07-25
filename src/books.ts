// load the iReal Pro files from the static folder

import jazz from './static/jazz.ireal?raw'
import pop from './static/pop.ireal?raw'

import { Playlist } from 'ireal-renderer'

const books = [jazz, pop]

export const songs = []

for (let book of books) {
  // console.log('book', book)
  let playlist = new Playlist(book)
  songs.push(
    ...playlist.songs.map(song => ({ playlist: playlist.name, ...song }))
  )
}
