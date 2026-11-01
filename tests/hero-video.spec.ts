import { expect, test } from '@playwright/test';

test('hero-space se reproduce en silencio y permite pausar y reanudar', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  const scene = page.locator('hero-video');
  const video = scene.locator('video');
  await scene.scrollIntoViewIfNeeded();
  await expect(scene).toHaveAttribute('data-state', 'playing');
  await expect(video).toHaveAttribute('src', '/media/hero-space.mp4');
  expect(await video.evaluate(element => (element as HTMLVideoElement).muted)).toBe(true);
  await expect.poll(() => video.evaluate(element => (element as HTMLVideoElement).currentTime)).toBeGreaterThan(0);
  await scene.getByRole('button', { name: 'Pausar animación del Hero' }).click();
  await expect(scene).toHaveAttribute('data-state', 'paused');
  expect(await video.evaluate(element => (element as HTMLVideoElement).paused)).toBe(true);
  await scene.getByRole('button', { name: 'Reanudar animación del Hero' }).click();
  await expect(scene).toHaveAttribute('data-state', 'playing');
  await page.locator('#contacto').scrollIntoViewIfNeeded();
  await expect(scene).toHaveAttribute('data-state', 'idle');
  expect(await video.evaluate(element => (element as HTMLVideoElement).paused)).toBe(true);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

for (const preference of ['reduced-motion', 'save-data']) {
  test(`hero-space muestra su imagen sin descargar video con ${preference}`, async ({ page }) => {
    const requests: string[] = [];
    page.on('request', request => { if (request.url().endsWith('.mp4')) requests.push(request.url()); });
    if (preference === 'reduced-motion') await page.emulateMedia({ reducedMotion: 'reduce' });
    else await page.addInitScript(() => {
      Object.defineProperty(navigator, 'connection', { configurable: true, value: Object.assign(new EventTarget(), { saveData: true }) });
    });
    await page.goto('/');
    const scene = page.locator('hero-video');
    await scene.scrollIntoViewIfNeeded();
    await expect(scene).toHaveAttribute('data-state', 'static');
    await expect(scene.locator('video')).not.toHaveAttribute('src');
    await scene.locator('img').evaluate(image => (image as HTMLImageElement).decode());
    await expect(scene.locator('[data-video-toggle]')).toBeHidden();
    expect(requests).toEqual([]);
  });
}

test('el Hero conserva su contenido si falla el video', async ({ page }) => {
  await page.route('**/media/hero-space.mp4', route => route.abort());
  await page.goto('/');
  const scene = page.locator('hero-video');
  await scene.scrollIntoViewIfNeeded();
  await expect(scene).toHaveAttribute('data-state', 'fallback');
  await expect(scene.locator('.hero-video-poster')).toHaveCSS('opacity', '0.75');
  await expect(scene.locator('[data-video-toggle]')).toBeHidden();
  await page.locator('.hero-copy').getByRole('link', { name: 'Ver proyectos', exact: true }).click();
  await expect(page).toHaveURL(/#proyectos$/);
});
