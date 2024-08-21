import m from 'mithril'
import Fuse from 'fuse.js'
import ireal from './static/jazz.ireal'
import { meiosisSetup } from 'meiosis-setup'
import { Playlist, iRealRenderer } from 'ireal-renderer'

import { Controls } from './Control'
import { SetlistNav } from './Setlist'
import { DebugNavContent, Tracer } from './components/debug/Debug'
import { State } from './State'
import { Nav } from './components/navigation/nav'
import './styles/test.css'

export const Measure = () => m(`div.Measure`, MeasureBox())

export const MeasureBox = () =>
  m(
    `div.Measure__Measure_Box`,
    CommentBox('Top'),
    ChordBox(),
    CommentBox('Bottom')
  )

export const CommentBox = (side: string) =>
  m(
    `div.Measure__Measure_Box__Comment_${side}_Box` +
      `.Measure__Measure_Box__Comment_Box`,
    Comment(side, '1'),
    Comment(side, '2'),
    Comment(side, '3'),
    Comment(side, '4'),
    Comment(side, '5'),
    Comment(side, '6'),
    Comment(side, '7'),
    Comment(side, '8'),
    Comment(side, '9'),
    Comment(side, '10'),
    Comment(side, '11'),
    Comment(side, '12'),
    Comment(side, '13'),
    Comment(side, '14')
  )

export const ChordBox = () =>
  m(
    `div.Measure__Measure_Box__Chord_Box`,
    Section('L'),
    Repeat('L'),
    Repeat('R'),
    Section('R'),
    CenterPerc(),
    Bar('L'),
    Chord('1'),
    Chord('2'),
    Chord('3'),
    Chord('4'),
    Bar('R'),
    BarPerc()
  )

export const Section = (side: string) =>
  m(`div.Measure__Measure_Box__Chord_Box__Section_${side}`, 'S')

export const Repeat = (side: string) =>
  m(`div.Measure__Measure_Box__Chord_Box__Repeat_${side}`, 'R')

export const Bar = (side: string) =>
  m(`div.Measure__Measure_Box__Chord_Box__${side}Bar`, 'B')

export const Chord = (num: string) =>
  m(
    `div.Measure__Measure_Box__Chord_Box__Chord .Chord_${num}`,
    AboveChord(num),
    Note(num),
    Flat(num),
    Sub(num),
    SubMod(num),
    BelowChord(num)
  )

export const AboveChord = (num: string) =>
  m(
    `div.Measure__Measure_Box__Chord_Box__Chord_${num}__Above_Chord` +
      `.Measure__Measure_Box__Chord_Box__Chord__Above_Chord`,
    'A'
  )

export const Note = (num: string) =>
  m(
    `div.Measure__Measure_Box__Chord_Box__Chord_${num}__Note` +
      `.Measure__Measure_Box__Chord_Box__Chord__Note`,
    'N'
  )

export const Flat = (num: string) =>
  m(
    `div.Measure__Measure_Box__Chord_Box__Chord_${num}__Flat` +
      `.Measure__Measure_Box__Chord_Box__Chord__Flat`,
    'F'
  )

export const Sub = (num: string) =>
  m(
    `div.Measure__Measure_Box__Chord_Box__Chord_${num}__Sub` +
      `.Measure__Measure_Box__Chord_Box__Chord__Sub`,
    'S'
  )

export const SubMod = (num: string) =>
  m(
    `div.Measure__Measure_Box__Chord_Box__Chord_${num}__Sub_Mod` +
      `.Measure__Measure_Box__Chord_Box__Chord__Sub_Mod`,
    'S'
  )

export const BelowChord = (num: string) =>
  m(
    `div.Measure__Measure_Box__Chord_Box__Chord_${num}__Below_Chord` +
      `.Measure__Measure_Box__Chord_Box__Chord__Below_Chord`,
    'B'
  )

export const CenterPerc = () =>
  m(`div.Measure__Measure_Box__Chord_Box__Center_Perc`, 'C')

export const BarPerc = () =>
  m(`div.Measure__Measure_Box__Chord_Box__Bar_Perc`, 'B')

export const Comment = (side: string, num: string) =>
  m(
    `div.Measure__Measure_Box__Comment_${side}_Box__Comment_${num}` +
      `.Measure__Measure_Box__Comment_${side}_Box__Comment .Comment`,
    'c'
  )

// ########################################################

export const playlist = new Playlist(ireal)
let renderer = new iRealRenderer()

const fuse = new Fuse(playlist.songs, {
  keys: ['title', 'composer'],
  threshold: 0.3,
})

const initial: State = {
  song: playlist.songs[0],
  key: playlist.songs[0].key,
  setlistActive: false,
  debugActive: false,
  renderer: renderer,
  darkMode: true,
  transpose: 0,
  fuse: fuse,
  query: '',
  results: playlist.songs,
}

export const Leo = {
  initial,
  view: (cell: any) => [
    m('div.ui', [
      Nav(cell, 'setlistActive', 'left', SetlistNav(cell)),
      Nav(cell, 'debugActive', 'right', DebugNavContent(cell)),
      Controls(cell),
    ]),
    m('div.Row', [Measure(), Measure(), Measure(), Measure()]),
    m('div.Row', [Measure(), Measure(), Measure(), Measure()]),
  ],
}

// Initialize Meiosis
const cells = meiosisSetup<State>({ app: Leo })

m.mount(document.getElementById('app'), {
  view: () => Leo.view(cells()),
})

cells.map(state => {
  // Persist state to local storage
  m.redraw()
  // Run on initial load
  adjustForURLBar()
})

function adjustForURLBar() {
  // Set a CSS variable on the root element with the current viewport
  document.documentElement.style.setProperty(
    '--vh',
    `${window.innerHeight * 0.01}px`
  )
  document.documentElement.style.setProperty(
    '--vw',
    `${window.innerWidth * 0.01}px`
  )
}

// Consider running on resize or orientation change
// events to adjust when the URL bar is shown/hidden
window.addEventListener('resize', adjustForURLBar)

declare global {
  interface Window {
    cells: any
  }
}
window.cells = cells

// Debug
Tracer(cells)
