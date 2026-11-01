import { expect, test } from '@playwright/test';

test('presentación simplificada y certificados desde el pie de página', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const presentation = page.locator('#sobre-mi');
  await expect(presentation).toHaveCount(1);
  await expect(page.locator('.hero-space #sobre-mi')).toHaveCount(1);
  await expect(page.locator('.about-grid')).toHaveCount(0);
  await expect(presentation).toContainText('Construir con intención.');
  await presentation.locator('.presentation-portrait').evaluate(image => (image as HTMLImageElement).decode());
  await expect(presentation.getByRole('heading', {name:'Mi forma de trabajar'})).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
  await page.locator('.site-footer').getByRole('link', {name:'certificados',exact:true}).click();
  await expect(page).toHaveURL(/\/certificados\/$/);
  await page.getByRole('link', {name:'Volver a sobre mí'}).click();
  await expect(page).toHaveURL(/\/#sobre-mi$/);
  await expect(page.locator('#sobre-mi')).toBeVisible();
});
