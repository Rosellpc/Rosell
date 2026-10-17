import { expect, test } from '@playwright/test';

test('el fondo de contacto queda contenido y no tapa el hero', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const contact = page.locator('#contacto');
  const cosmos = contact.locator('contact-cosmos');
  const bounds = await page.evaluate(() => {
    const hero = document.querySelector('.hero-space')!.getBoundingClientRect();
    const contact = document.querySelector('#contacto')!.getBoundingClientRect();
    const scene = document.querySelector('contact-cosmos')!.getBoundingClientRect();
    return { heroBottom: hero.bottom, contactTop: contact.top, contactBottom: contact.bottom, sceneTop: scene.top, sceneBottom: scene.bottom };
  });
  expect(bounds.sceneTop).toBeGreaterThanOrEqual(bounds.contactTop - 1);
  expect(bounds.sceneBottom).toBeLessThanOrEqual(bounds.contactBottom + 1);
  expect(bounds.sceneTop).toBeGreaterThanOrEqual(bounds.heroBottom);
  const heroLink = page.locator('.hero-copy a[href="#proyectos"]');
  expect(await heroLink.evaluate(el => {
    const rect = el.getBoundingClientRect();
    return el.contains(document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2));
  })).toBeTruthy();
  await contact.scrollIntoViewIfNeeded();
  await expect(contact.getByRole('heading', { level: 2 })).toBeVisible();
  await expect(cosmos).toHaveAttribute('data-state', 'static');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await expect(cosmos).toHaveAttribute('data-state', 'running');
  await cosmos.getByRole('button', { name: 'Pausar animación de contacto' }).click();
  await expect(cosmos).toHaveAttribute('data-state', 'paused');
});
