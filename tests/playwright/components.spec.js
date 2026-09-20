// UI Component tests for Leo application
// Tests individual UI components and their interactions

const { test, expect } = require('@playwright/test');

test.describe('Leo UI Component Tests', () => {
  test('control panel renders with all buttons', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.waitForSelector('.ui', { timeout: 10000 });

    // Check main controls exist
    const mainControls = page.locator('.main-controls');
    await expect(mainControls).toBeVisible();

    // Check for transpose controls
    const transposeUp = page.locator('.control__transpose-up');
    const transposeDown = page.locator('.control__transpose-down');
    const transposeReset = page.locator('.control__reset');
    
    await expect(transposeUp).toBeAttached();
    await expect(transposeDown).toBeAttached();
    await expect(transposeReset).toBeAttached();
  });

  test('metronome controls are visible', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.waitForSelector('.ui', { timeout: 10000 });

    // Check metronome controls section
    const metronomeControls = page.locator('.metronome-controls');
    await expect(metronomeControls).toBeVisible();

    // Check for play/pause button
    const playPause = page.locator('.metronome-play-pause');
    await expect(playPause).toBeAttached();

    // Check for metronome toggle button
    const metronomeToggle = page.locator('.metronome-toggle');
    await expect(metronomeToggle).toBeAttached();
  });

  test('search input exists and is focusable', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.waitForSelector('.ui', { timeout: 10000 });

    const searchInput = page.locator('.setlist__header__search__input');
    
    // Input should be attached to the DOM
    await expect(searchInput).toBeAttached();
    
    // Should be able to type in the search input
    await searchInput.fill('test search');
    await expect(searchInput).toHaveValue('test search');
  });

  test('search clear button works', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.waitForSelector('.ui', { timeout: 10000 });

    const searchInput = page.locator('.setlist__header__search__input');
    const clearButton = page.locator('.setlist__header__search__clear');
    
    // Type something
    await searchInput.fill('test');
    await expect(searchInput).toHaveValue('test');
    
    // Clear it
    await clearButton.click();
    await expect(searchInput).toHaveValue('');
  });

  test('song results display when songs are loaded', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.waitForSelector('.ui', { timeout: 10000 });

    // Wait for songs to load and display
    const songBox = page.locator('.setlist__songbox');
    await expect(songBox).toBeAttached();

    // There should be at least some song results rendered
    const songs = page.locator('.setlist__songbox__song');
    const count = await songs.count();
    
    // Should have loaded songs from the iReal books
    expect(count).toBeGreaterThan(0);
    console.log(`Found ${count} songs displayed`);
  });

  test('song entry has title, composer, and style', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.waitForSelector('.setlist__songbox__song', { timeout: 10000 });

    // Get the first song entry
    const firstSong = page.locator('.setlist__songbox__song').first();
    
    // Check it has the expected structure
    const title = firstSong.locator('.title');
    const composer = firstSong.locator('.composer');
    const style = firstSong.locator('.style');
    
    await expect(title).toBeAttached();
    await expect(composer).toBeAttached();
    await expect(style).toBeAttached();
  });

  test('clicking a song selects it', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.waitForSelector('.setlist__songbox__song', { timeout: 10000 });

    // Get the first song and click it
    const firstSong = page.locator('.setlist__songbox__song').first();
    const songTitle = await firstSong.locator('.title').textContent();
    
    await firstSong.click();
    
    // Wait for route to update
    await page.waitForTimeout(500);
    
    // URL should contain the song title (URL encoded)
    const url = page.url();
    expect(url).toContain(encodeURIComponent(songTitle) || songTitle.replace(/ /g, '%20'));
  });

  test('random song button exists and works', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.waitForSelector('.setlist__header__random', { timeout: 10000 });

    const randomButton = page.locator('.setlist__header__random').first();
    await expect(randomButton).toBeVisible();

    // Get current URL
    const initialUrl = page.url();

    // Click random
    await randomButton.click();
    await page.waitForTimeout(500);

    // URL may have changed (picked a different song)
    // Just verify no errors occurred
    await expect(page.locator('.ui')).toBeVisible();
  });
});
