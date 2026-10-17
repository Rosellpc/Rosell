import { expect, test } from '@playwright/test';

test('presentación laboral y acceso a los nuevos casos de estudio', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator('.hero-description')).toContainText('React, TypeScript y Python');
  for (const [title, slug] of [['Focus', 'focus'], ['Memely News', 'memely-news']]) {
    await page.getByRole('link', { name: `Leer caso de estudio de ${title}`, exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`/proyectos/${slug}/$`));
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(title);
    await expect(page.getByRole('heading', { name: 'Mi aporte', exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Resultado y evidencia', exact: true })).toBeVisible();
    const destination = title === 'Focus'
      ? page.getByRole('link', { name: 'Ver descargas' })
      : page.getByRole('link', { name: 'Abrir demo' });
    await expect(destination).toHaveAttribute('href', title === 'Focus'
      ? 'https://github.com/Rosellpc/Focus/releases'
      : 'https://memely-news.vercel.app/');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
    await page.getByRole('link', { name: 'Volver a proyectos' }).click();
  }
});

test('navegación, contenido y dimensiones adaptables', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Software que fluye.');
  await expect(page.locator('vortex-scene')).toHaveAttribute('data-state', 'static');
  await expect(page.locator('canvas')).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
  await page.locator('.project-card').filter({ has: page.getByRole('heading', { name: 'RestaurantOS' }) }).getByRole('link', { name: 'Explorar proyecto' }).click();
  await expect(page).toHaveURL(/\/proyectos\/restaurantos\//);
  await expect(page.getByRole('heading', { name: 'Decisiones técnicas' })).toBeVisible();
  await page.getByRole('link', { name: 'Laboratorio', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Geometría del flujo.' })).toBeVisible();
  await expect(page.locator('[data-pause]')).toBeDisabled();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
  expect(errors).toEqual([]);
});

test('escena WebGL, pausa, cámaras y parámetros', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  await page.goto('/lab/vortex/');
  await expect(page.locator('vortex-scene')).toHaveAttribute('data-state', 'ready', { timeout: 30000 });
  await expect(page.locator('canvas')).toHaveCount(1);
  await page.getByRole('button', { name: 'Pausar animación' }).click();
  await expect(page.getByRole('button', { name: 'Reanudar animación' })).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: 'Superior', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Superior', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await page.locator('summary').click();
  await page.locator('[data-param="density"]').fill('3000');
  await expect(page.locator('[data-output="density"]')).toHaveText('3000');
  await page.locator('[data-param="viscosity"]').fill('0.25');
  await expect(page.locator('[data-output="viscosity"]')).toHaveText('0.25');
  await page.getByRole('button', { name: 'Reanudar animación' }).click();
  await expect(page.getByRole('button', { name: 'Pausar animación' })).toHaveAttribute('aria-pressed', 'false');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('canvas')).toHaveCount(0);
  await expect(page.locator('vortex-scene')).toHaveAttribute('data-state', 'static');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await expect(page.locator('vortex-scene')).toHaveAttribute('data-state', 'ready');
  await expect(page.locator('canvas')).toHaveCount(1);
  expect(errors).toEqual([]);
});

test('contenido accesible sin JavaScript', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto(baseURL!);
  await expect(page.getByRole('heading', { name: 'De la idea al sistema.' })).toBeVisible();
  await page.locator('.project-card').filter({ has: page.getByRole('heading', { name: 'RestaurantOS' }) }).getByRole('link', { name: 'Explorar proyecto' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('RestaurantOS');
  await context.close();
});

test('alternativa si WebGL no está disponible', async ({ page }) => {
  await page.addInitScript(() => {
    const getContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (...args: Parameters<typeof getContext>) {
      if (String(args[0]).startsWith('webgl')) return null;
      return getContext.apply(this, args);
    } as typeof getContext;
  });
  await page.goto('/lab/vortex/');
  await expect(page.locator('vortex-scene')).toHaveAttribute('data-state', 'fallback');
  await expect(page.getByRole('status')).toContainText('Vista estática');
  await expect(page.locator('[data-pause]')).toBeDisabled();
});
