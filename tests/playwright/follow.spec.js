// Follow mode against a hub: `?follow=<hub>`, and `leo serve --follow <hub>`.
//
// The hub is a fake started here, answering `GET /family/members/leo` with
// whatever the test last set, as ShowRunner's family plugin answers it. The
// page is the real app. What is asserted is what a reader would see: the
// chart changing to the song the hub's cue names, in the same document.

const fs = require('fs');
const http = require('http');
const net = require('net');
const os = require('os');
const path = require('path');
const { spawn, spawnSync } = require('child_process');
const { test, expect } = require('@playwright/test');

const ROOT = path.join(__dirname, '..', '..');
const AUTUMN_LEAVES = '#!/song/Autumn%20Leaves?playlist=Jazz%201460';

// `LEO_FOLLOW_PORTS=lo-hi` keeps the hub, and the dev server the serve test
// starts, inside a range, for a machine where several sessions share the
// port space. Otherwise the operating system picks.
function candidates() {
  const span = process.env.LEO_FOLLOW_PORTS;
  if (!span) return [0];
  const [lo, hi] = span.split('-').map(Number);
  return Array.from({ length: hi - lo + 1 }, (_, i) => lo + i);
}

function listen(server, port) {
  return new Promise((resolve) => {
    const failed = () => resolve(null);
    server.once('error', failed);
    server.listen(port, '127.0.0.1', () => {
      server.off('error', failed);
      resolve(server.address().port);
    });
  });
}

async function freePort(taken = []) {
  for (const candidate of candidates()) {
    if (taken.includes(candidate)) continue;
    const probe = net.createServer();
    const port = await listen(probe, candidate);
    if (port) {
      await new Promise((resolve) => probe.close(resolve));
      return port;
    }
  }
  throw new Error(`no free port in LEO_FOLLOW_PORTS=${process.env.LEO_FOLLOW_PORTS}`);
}

// The hub's side of follow mode, and nothing else. `cors: false` answers
// without Access-Control-Allow-Origin, which a hub on another origin must send.
async function startHub({ cors = true } = {}) {
  const hub = { answer: { cue: null, action: null }, asked: 0 };
  const server = http.createServer((request, response) => {
    if (request.method === 'GET' && request.url === '/family/members/leo') {
      hub.asked += 1;
      const headers = { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' };
      if (cors) headers['Access-Control-Allow-Origin'] = '*';
      response.writeHead(200, headers);
      response.end(JSON.stringify(hub.answer));
      return;
    }
    response.writeHead(404);
    response.end();
  });
  for (const candidate of candidates()) {
    const port = await listen(server, candidate);
    if (port) {
      hub.port = port;
      hub.url = `http://127.0.0.1:${port}`;
      hub.close = () => {
        server.closeAllConnections();
        return new Promise((resolve) => server.close(resolve));
      };
      return hub;
    }
  }
  throw new Error(`no free port for the hub in LEO_FOLLOW_PORTS=${process.env.LEO_FOLLOW_PORTS}`);
}

let number = 0;
function cue(name) {
  number += 1;
  return { number: String(number), name, fired_at: new Date().toISOString() };
}

const title = (page) => page.locator('.page__header__title');
const badge = (page) => page.locator('.follow-status');

// The first chords of the chart, as text: the sheet itself, not its header.
function chords(page) {
  return page.locator('irr-chord').evaluateAll((all) =>
    all.slice(0, 8).map((chord) => chord.textContent)
  );
}

// A mark on the document: a reload makes a new one, without it.
const mark = (page) => page.evaluate(() => { window.sameDocument = 'yes'; });
const marked = (page) => page.evaluate(() => window.sameDocument);

let hub;
test.afterEach(async () => {
  if (hub) await hub.close();
  hub = undefined;
});

test('the chart follows the hub, cue by cue, without a reload', async ({ page }) => {
  hub = await startHub();
  await page.goto(`/?follow=${encodeURIComponent(hub.url)}${AUTUMN_LEAVES}`);

  // No cue yet: the page is the song its own link asked for, and says it waits.
  await expect(badge(page)).toHaveAttribute('data-status', 'waiting');
  await expect(badge(page)).toContainText(`Following ${hub.url}`);
  await expect(title(page)).toHaveText('Autumn Leaves');
  const autumn = await chords(page);
  expect(autumn.length).toBeGreaterThan(0);
  await mark(page);

  const second = cue('Second tune');
  hub.answer = { cue: second, action: { song: 'Blue Bossa' } };
  await expect(title(page)).toHaveText('Blue Bossa');
  await expect(badge(page)).toHaveAttribute('data-status', 'following');
  await expect(badge(page)).toContainText(`cue ${second.number}, Second tune: Blue Bossa`);
  expect(await chords(page)).not.toEqual(autumn);
  // The address is the song's own deep link, and still follows the hub.
  const address = new URL(page.url());
  expect(address.hash).toBe('#!/song/Blue%20Bossa?playlist=Jazz%201460');
  expect(address.searchParams.get('follow')).toBe(hub.url);

  hub.answer = { cue: cue('Third tune'), action: { song: 'Take The A Train' } };
  await expect(title(page)).toHaveText('Take The A Train');
  expect(await marked(page)).toBe('yes');
});

test('a reader may leave the song, until the next cue', async ({ page }) => {
  hub = await startHub();
  hub.answer = { cue: cue('First tune'), action: { song: 'Blue Bossa' } };
  await page.goto(`/?follow=${encodeURIComponent(hub.url)}${AUTUMN_LEAVES}`);
  await expect(title(page)).toHaveText('Blue Bossa');
  await mark(page);

  // The reader picks another song from the menu.
  await page.locator('.nav_left__toggle').click();
  await page.locator('.setlist__header__search__input').fill('Autumn Leaves');
  await page.locator('.search-song-item .song-title', { hasText: /^Autumn Leaves$/ }).first().click();
  await expect(title(page)).toHaveText('Autumn Leaves');

  // The same answer, asked again, is not a new cue: the reader stays put.
  const asked = hub.asked;
  await expect.poll(() => hub.asked, { timeout: 10000 }).toBeGreaterThan(asked + 1);
  await expect(title(page)).toHaveText('Autumn Leaves');

  // A cue fired again is new, by its time, even naming the same song.
  hub.answer = { cue: cue('First tune, again'), action: { song: 'Blue Bossa' } };
  await expect(title(page)).toHaveText('Blue Bossa');
  expect(await marked(page)).toBe('yes');
});

test('a song in none of the books leaves the chart, and says so', async ({ page }) => {
  hub = await startHub();
  await page.goto(`/?follow=${encodeURIComponent(hub.url)}${AUTUMN_LEAVES}`);
  await expect(badge(page)).toHaveAttribute('data-status', 'waiting');

  hub.answer = { cue: cue('Mystery'), action: { song: 'No Such Tune' } };
  await expect(badge(page)).toHaveAttribute('data-status', 'unknown-song');
  await expect(badge(page)).toContainText('“No Such Tune”, which is in none of the books');
  await expect(title(page)).toHaveText('Autumn Leaves');
});

test('a hub that does not allow this origin cannot be read, and the badge says so', async ({ page }) => {
  hub = await startHub({ cors: false });
  hub.answer = { cue: cue('Unread'), action: { song: 'Blue Bossa' } };
  await page.goto(`/?follow=${encodeURIComponent(hub.url)}${AUTUMN_LEAVES}`);

  await expect(badge(page)).toHaveAttribute('data-status', 'unreachable');
  // The request reached the hub; the browser withheld the answer.
  expect(hub.asked).toBeGreaterThan(0);
  await expect(title(page)).toHaveText('Autumn Leaves');
});

test('`leo serve --follow` makes every page it serves follow the hub', async ({ page }) => {
  test.setTimeout(120000);
  hub = await startHub();
  hub.answer = { cue: cue('Served'), action: { song: 'Blue Bossa' } };
  const port = await freePort([hub.port]);
  const state = fs.mkdtempSync(path.join(os.tmpdir(), 'leo-follow-'));
  const serve = spawn(
    'uv',
    ['run', '--no-sync', 'leo', 'serve', '--host', '127.0.0.1', '--port', String(port),
     '--state', state, '--follow', hub.url],
    { cwd: ROOT, stdio: 'ignore', detached: process.platform !== 'win32' }
  );
  try {
    const page_url = `http://127.0.0.1:${port}/`;
    await expect.poll(async () => {
      try {
        return (await fetch(page_url)).status;
      } catch {
        return 0;
      }
    }, { timeout: 90000 }).toBe(200);

    // No ?follow= on this address: the server said it.
    await page.goto(`${page_url}${AUTUMN_LEAVES}`);
    await expect(title(page)).toHaveText('Blue Bossa');
    await expect(badge(page)).toHaveAttribute('data-status', 'following');
    await expect(badge(page)).toContainText(`Following ${hub.url}`);
  } finally {
    if (process.platform === 'win32') {
      spawnSync('taskkill', ['/F', '/T', '/PID', String(serve.pid)]);
    } else {
      try { process.kill(-serve.pid); } catch { /* already gone */ }
    }
    fs.rmSync(state, { recursive: true, force: true });
  }
});
