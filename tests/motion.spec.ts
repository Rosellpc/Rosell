import { expect, test } from '@playwright/test';

test('las tarjetas aparecen una vez y mantienen sus enlaces utilizables', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  const tile = page.locator('.project-grid-item').first();
  await tile.evaluate(element => element.scrollIntoView({ behavior: 'instant', block: 'center' }));
  await expect(tile).toHaveAttribute('data-motion', 'entering');
  await expect(tile).toHaveAttribute('data-motion', 'visible');
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await tile.evaluate(element => element.scrollIntoView({ behavior: 'instant', block: 'center' }));
  expect(await tile.evaluate(element => element.getAnimations().length)).toBe(0);
  await tile.getByRole('link').focus();
  await expect(tile.getByRole('link')).toBeFocused();
  await expect(tile).toHaveCSS('opacity', '1');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('movimiento reducido cancela las entradas y deja el contenido visible', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  const title = page.locator('#hero-title');
  await expect(title).toHaveAttribute('data-motion', 'entering');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(title).toHaveAttribute('data-motion', 'visible');
  expect(await title.evaluate(element => element.getAnimations().length)).toBe(0);
  await expect(title).toHaveCSS('opacity', '1');
  await page.goto('/#proyectos');
  await expect(page.locator('#projects-title')).toBeVisible();
  expect(await page.locator('.project-grid-item').first().evaluate(element => element.getAnimations().length)).toBe(0);
  await page.locator('.hero-copy').getByRole('link', { name: 'Ver proyectos', exact: true }).focus();
  await expect(page.locator('.hero-copy').getByRole('link', { name: 'Ver proyectos', exact: true })).toBeFocused();
});
