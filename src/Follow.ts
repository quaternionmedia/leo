// Follow mode: leo shows the song a hub asks for, and changes song in place.
//
// leo has no server of its own, so the hub cannot push to it. A page opened
// with `?follow=<hub base url>` -- or served by `leo serve --follow <hub>`,
// which hands the dev server VITE_LEO_FOLLOW -- asks the hub
// `GET <hub>/family/members/leo` every FOLLOW_EVERY_MS. The hub answers
// `{"cue": {...}, "action": {"song": "<title>"}}`, or nulls before any cue
// has asked leo for anything. A new answer is shown the way the song's own
// deep link would show it, by the same state update, and the address is
// rewritten to that deep link without a reload.
//
// The page reads the hub from another origin, so the hub must answer that
// route with an Access-Control-Allow-Origin header the page's origin passes.
// Without one the browser withholds the answer and the badge says so.

import m from 'mithril'
import { songs } from './books'
import { Song } from './State'

export const FOLLOW_EVERY_MS = 1000

export type FollowStatus =
  | 'waiting' // the hub answers, and no cue has asked leo for anything yet
  | 'following' // the chart is the song the hub's last cue asked for
  | 'unreachable' // no readable answer: down, refused, or no CORS header
  | 'not-understood' // the hub's action for leo names no song
  | 'unknown-song' // the song named is in none of the books

export interface FollowState {
  hub: string
  status: FollowStatus
  cue: { number?: string; name?: string } | null
  song?: string
  detail?: string
}

/** The hub this page follows, or null when it follows none.
 *
 * `?follow=` on the page's own address wins; otherwise the hub the dev
 * server was started with. Either must be an http(s) URL, and its trailing
 * slashes are dropped so the route can be appended to it.
 */
export function followTarget(
  search: string = window.location.search,
  served: string | undefined = import.meta.env.VITE_LEO_FOLLOW
): string | null {
  const asked = new URLSearchParams(search).get('follow') || served || ''
  if (!asked) return null
  try {
    const url = new URL(asked)
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null
  } catch {
    return null
  }
  return asked.replace(/\/+$/, '')
}

/** What a song's deep link sets: the song, in its own key, untransposed. */
export const showing = (song: Song) => ({
  song,
  currentPage: 'song' as const,
  key: song?.key || null,
  transpose: 0,
  setlistActive: false,
  index: 0,
})

/** The song a title names: the first in book order, or in `playlist` if given. */
export const findSong = (title: string, playlist?: string): Song | undefined =>
  (songs as Song[]).find(
    s => s.title === title && (!playlist || s.playlist === playlist)
  )

export const deepLink = (song: Song) =>
  `/song/${encodeURIComponent(song.title)}?playlist=${encodeURIComponent(
    song.playlist
  )}`

/** What one answer from the hub asks of leo, and the song it names if any. */
function read(hub: string, cue: any, action: any): [FollowState, Song?] {
  if (!action) return [{ hub, status: 'waiting', cue }]
  if (typeof action.song !== 'string' || !action.song) {
    return [{ hub, status: 'not-understood', cue, detail: JSON.stringify(action) }]
  }
  const playlist = typeof action.playlist === 'string' ? action.playlist : undefined
  const song = findSong(action.song, playlist)
  if (!song) return [{ hub, status: 'unknown-song', cue, song: action.song }]
  return [{ hub, status: 'following', cue, song: song.title }, song]
}

/** Poll the hub for as long as the page is open. Returns a stop function. */
export function follow(cells: any, hub: string, every = FOLLOW_EVERY_MS) {
  let applied: string | null = null // the last answer acted on, as JSON
  let outcome: FollowState = { hub, status: 'waiting', cue: null }
  let shown = '' // the badge as last written, as JSON

  const report = (follow: FollowState) => {
    // Only a change is written: every update redraws, and a redraw re-renders
    // the chart.
    const next = JSON.stringify(follow)
    if (next === shown) return
    shown = next
    cells().update({ follow })
  }

  const poll = async () => {
    let answer: any
    try {
      const response = await fetch(`${hub}/family/members/leo`, { cache: 'no-store' })
      if (!response.ok) throw new Error(`the hub answered ${response.status}`)
      answer = await response.json()
    } catch (error) {
      const detail = error instanceof Error ? error.message : String(error)
      report({ ...outcome, status: 'unreachable', detail })
      return
    }
    const cue = answer?.cue ?? null
    const action = answer?.action ?? null
    const seen = JSON.stringify([cue, action])
    if (seen === applied) {
      report(outcome) // the badge recovers once the hub is readable again
      return
    }
    // A new answer: a new cue, or the same cue fired again at a new time.
    applied = seen
    const [next, song] = read(hub, cue, action)
    outcome = next
    if (!song) {
      report(outcome)
      return
    }
    // Shown whatever the reader has moved to since the last cue.
    shown = JSON.stringify(outcome)
    cells().update({ ...showing(song), follow: outcome })
    m.route.set(deepLink(song), null, { replace: true })
  }

  report(outcome)
  poll()
  const timer = window.setInterval(poll, every)
  return () => window.clearInterval(timer)
}

/** The badge: which hub, and what its last answer did. */
export const FollowBadge = (cell: any) => {
  const follow: FollowState | undefined = cell.state.follow
  if (!follow) return null
  const cue = follow.cue
    ? `cue ${follow.cue.number ?? '?'}${follow.cue.name ? `, ${follow.cue.name}` : ''}`
    : 'the last cue'
  const says = {
    waiting: 'waiting for a cue',
    following: `${cue}: ${follow.song}`,
    unreachable: `cannot read the hub (${follow.detail || 'no answer'})`,
    'not-understood': `${cue} asks leo for no song`,
    'unknown-song': `${cue} asks for “${follow.song}”, which is in none of the books`,
  }[follow.status]
  return m('div.follow-status', { 'data-status': follow.status, title: follow.hub }, [
    m('span.follow-status__hub', `Following ${follow.hub}`),
    m('span.follow-status__says', says),
  ])
}
