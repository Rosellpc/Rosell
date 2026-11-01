import { expect, test } from '@playwright/test';

test('hero sin audio y enlaces de cristal funcionales', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator('space-audio, black-hole-button')).toHaveCount(0);
  await expect(page.locator('[data-video-toggle]')).toBeHidden();
  await expect(page.locator('.hero-copy .actions .liquid-glass-link, #contacto .liquid-glass-link')).toHaveCount(2);
  await expect(page.locator('.hero-copy').getByRole('link', {name:'Ver proyectos',exact:true})).toHaveAttribute('href','#proyectos');
  await page.locator('.hero-copy').getByRole('link', {name:'Ver proyectos',exact:true}).click();
  await expect(page).toHaveURL(/#proyectos$/);
  await page.goto('/');
  await page.locator('.site-header').getByRole('link', {name:'Hablemos'}).click();
  await expect(page).toHaveURL(/#contacto$/);
  const email = page.locator('#contacto').getByRole('link', {name:'Escríbeme',exact:true});
  await expect(email).toHaveAttribute('href',/^https:\/\/mail\.google\.com\//);
  await expect(email).toHaveAttribute('target','_blank');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
});
