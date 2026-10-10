// The behaviour walkthrough/03-in-the-browser.md shows, asserted against the
// real app. The screenshots are taken from the render these assertions ran
// against: recorded, never compared. A test that diffs images fails on a font
// and gets switched off; the regression protection is the assertions.

const fs = require('fs');
const path = require('path');
const { test, expect } = require('@playwright/test');

// `leo check` points the shutter elsewhere, so a check of a server somebody else
// started writes no picture into the checkout.
const MEDIA = process.env.LEO_WALKTHROUGH_SHOTS
  || path.join(__dirname, '..', '..', 'walkthrough', 'media');

async function shoot(page, name) {
  fs.mkdirSync(MEDIA, { recursive: true });
  const file = path.join(MEDIA, `03-in-the-browser-${name}.png`);
  await page.evaluate(() => document.fonts.ready);
  // Park the pointer on empty space, so no hover state lands in the picture.
  await page.mouse.move(1000, 700);
  await page.screenshot({ path: file, animations: 'disabled' });
  // The one thing a recorder asserts: that it wrote what it said it wrote.
  expect(fs.statSync(file).size).toBeGreaterThan(0);
}

// A fixed song, so the picture is the same on every run; the bare address
// opens on a random one.
const AUTUMN_LEAVES = '/#!/song/Autumn%20Leaves?playlist=Jazz%201460';

// A chord's text without the barline drawn in front of it, which is a glyph
// in the chart font rather than a character a reader would recognise.
async function firstChords(page) {
  return page.locator('irr-chord').evaluateAll((chords) =>
    chords.slice(0, 4).map((chord) =>
      [...chord.childNodes]
        .filter((node) => node.nodeName !== 'IRR-LBAR')
        .map((node) => node.textContent)
        .join('')
    )
  );
}

async function openMenu(page) {
  await page.locator('.nav_left__toggle').click();
  await expect(page.locator('.nav_left__content')).toBeVisible();
}

function row(page, title) {
  return page
    .locator('.search-song-item')
    .filter({ has: page.locator('.song-title', { hasText: new RegExp(`^${title}$`) }) })
    .first();
}

test('a chart renders from the Jazz 1460 book, and transposes', async ({ page }) => {
  await page.goto(AUTUMN_LEAVES, { waitUntil: 'networkidle' });

  await expect(page.locator('.page__header__title')).toHaveText('Autumn Leaves');
  await expect(page.locator('.page__header__style')).toHaveText('Medium Swing');
  await expect(page.locator('.page__header__key')).toHaveText('G-');
  await expect(page.locator('.page__header__composer')).toHaveText('Joseph Kosma');
  expect(await firstChords(page)).toEqual(['C-7', 'F7', 'B♭△7', 'E♭△7']);
  await shoot(page, 'chart');

  await page.locator('.control__transpose-up').click();
  await expect(page.locator('.page__header__key')).toHaveText('G#- (1)');
  expect(await firstChords(page)).toEqual(['D♭-7', 'G♭7', 'B△7', 'E△7']);
});

test('a setlist built from search becomes a filter', async ({ page }) => {
  await page.goto(AUTUMN_LEAVES, { waitUntil: 'networkidle' });
  await openMenu(page);
  const search = page.locator('.setlist__header__search__input');

  // The first song added makes the setlist, and asks for its name.
  page.once('dialog', (dialog) => dialog.accept('Friday Gig'));
  await search.fill('Autumn Leaves');
  await row(page, 'Autumn Leaves').locator('.add-to-setlist').click();
  for (const title of ['Blue Bossa', 'Take The A Train']) {
    await search.fill(title);
    await row(page, title).locator('.add-to-setlist').click();
  }

  await page.locator('.setlist__header__search__clear').click();
  await expect(page.locator('.results-count')).toHaveText('100 results');

  await page.locator('.playlist-filter-toggle').click();
  const setlist = page.locator('label.playlist-checkbox', { hasText: 'Friday Gig' });
  await expect(setlist).toContainText('(3)');
  await setlist.locator('input[type=radio]').check();
  await page.locator('.playlist-filter-toggle').click();

  await expect(page.locator('.playlist-filter-toggle')).toContainText('Filters (1 active)');
  await expect(page.locator('.results-count')).toHaveText('3 results');
  await expect(page.locator('.search-song-item .song-title')).toHaveText([
    'Autumn Leaves',
    'Blue Bossa',
    'Take The A Train',
  ]);
  await shoot(page, 'setlist-filter');
});
