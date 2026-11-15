import { expect, test, type Page } from '@playwright/test';

async function openMobileMenu(page: Page) {
  if ((await page.evaluate(()=>innerWidth)) <= 760) await page.getByRole('button',{name:'Abrir menú'}).click();
}

test('portada con tres pantallas y navegación unificada a la izquierda', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  const panels = page.locator('main > .screen-panel');
  await expect(panels).toHaveCount(3);
  const metrics = await panels.evaluateAll(elements => elements.map(el => ({height: el.getBoundingClientRect().height, id: el.id})));
  expect(metrics.map(item => item.id)).toEqual(['inicio', 'proyectos', 'contacto']);
  const height = await page.evaluate(() => innerHeight);
  metrics.forEach(item => { if(item.id === 'proyectos') expect(item.height).toBeGreaterThanOrEqual(height - 2); else expect(item.height).toBeGreaterThanOrEqual(height - 2); });
  await expect(page.locator('footer')).toHaveCount(1);
  await expect(page.locator('.site-sidebar footer')).toHaveCount(1);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
  expect(errors).toEqual([]);
});

test('rueda y teclado avanzan una pantalla; enlaces reflejan la sección', async ({ page, isMobile }) => {
  test.skip(isMobile, 'Los gestos táctiles se comprueban por separado.');
  await page.goto('/');
  await expect(page.locator('.details-trigger')).toBeVisible();
  await page.mouse.move((await page.evaluate(() => innerWidth)) - 8, 300);
  await page.mouse.wheel(0, 100);
  await expect.poll(() => page.locator('#proyectos').evaluate(el => Math.abs(el.getBoundingClientRect().top))).toBeLessThan(2);
  await expect(page.locator('[data-screen="proyectos"]')).toHaveAttribute('aria-current', 'location');
  // End the first wheel gesture before starting the next.
  await page.waitForTimeout(800);
  await page.mouse.wheel(0, 100);
  await expect.poll(() => page.locator('#contacto').evaluate(el => Math.abs(el.getBoundingClientRect().top))).toBeLessThan(2);
  await page.getByRole('link', {name: 'Inicio', exact: true}).click();
  await expect.poll(() => page.evaluate(() => Math.abs(scrollY))).toBeLessThan(2);
  await page.locator('body').click({position: {x: (await page.evaluate(() => innerWidth)) - 5, y: 300}});
  await page.keyboard.press('PageDown');
  await expect.poll(() => page.locator('#proyectos').evaluate(el => Math.abs(el.getBoundingClientRect().top))).toBeLessThan(2);
});

test('gesto vertical táctil cambia de sección sin interceptar touch', async ({ page, isMobile }) => {
  test.skip(!isMobile);
  await page.goto('/');
  await expect(page.locator('.details-trigger')).toBeVisible();
  const client = await page.context().newCDPSession(page);
  const start = (await page.evaluate(() => innerHeight)) - 60;
  await client.send('Input.dispatchTouchEvent', {type: 'touchStart', touchPoints: [{x: 150, y: start}]});
  for (let y = start - 50; y >= 100; y -= 50) {
    await client.send('Input.dispatchTouchEvent', {type: 'touchMove', touchPoints: [{x: 150, y}]});
    await page.waitForTimeout(25);
  }
  await client.send('Input.dispatchTouchEvent', {type: 'touchEnd', touchPoints: []});
  await expect.poll(() => page.locator('#proyectos').evaluate(el => Math.abs(el.getBoundingClientRect().top))).toBeLessThan(2);
});

test('todos los proyectos son accesibles por teclado y con flechas laterales', async ({ page }) => {
  await page.goto('/#proyectos');
  const carousel = page.locator('project-showcase');
  const track = carousel.locator('.project-track');
  await track.focus();
  await expect(carousel.locator('[data-slide]')).toHaveCount(7);
  await expect(carousel.locator('button')).toHaveCount(2);
  for(let index=0;index<7;index++) {
    await expect(carousel.locator('.showcase-card:not([inert])')).toHaveAttribute('data-slide',String(index));
    await expect(carousel.locator('.showcase-card:not([inert]) .showcase-links a').first()).toBeVisible();
    if(index<6)await page.keyboard.press('ArrowRight');
  }
  await page.keyboard.press('Home');
  await expect(carousel.locator('.showcase-card:not([inert])')).toHaveAttribute('data-slide','0');
  await page.keyboard.press('ArrowRight');
  await expect(carousel.locator('.showcase-card:not([inert])')).toHaveAttribute('data-slide','1');
  await page.setViewportSize({width:820,height:1180});
  await expect(carousel.locator('.showcase-card:not([inert]) h3')).toHaveText('Rosell GPT');
});

test('enfoque y herramientas conservados en diálogo accesible', async ({ page }) => {
  await page.goto('/');
  const trigger = page.getByRole('button', {name: 'Mi enfoque y herramientas'});
  await trigger.click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText('Construir con intención.');
  for (const group of ['Frontend', 'Backend', 'Datos e infraestructura']) await expect(dialog.getByRole('heading', {name: group, exact: true})).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
  await expect(trigger).toBeFocused();
});

test('pantallas bajas, movimiento reducido y rutas internas conservan acceso al contenido', async ({ page }) => {
  await page.emulateMedia({reducedMotion: 'reduce'});
  for (const viewport of [{width: 320, height: 568}, {width: 844, height: 390}, {width: 768, height: 1024}]) {
    await page.setViewportSize(viewport);
    await page.goto('/#proyectos');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
    await openMobileMenu(page);
    await page.locator('[data-screen=contacto]').click();
    await expect.poll(() => page.locator('#contacto').evaluate(el => Math.abs(el.getBoundingClientRect().top))).toBeLessThan(2);
    await expect(page.locator('#contacto .contact-socials a')).toHaveCount(3);
  }
  await page.goto('/#sobre-mi');
  await expect(page.locator('#sobre-mi')).toBeVisible();
  await page.goto('/proyectos/restaurantos/');
  await expect(page.locator('html')).not.toHaveClass(/homepage/);
  expect(await page.locator('html').evaluate(el => getComputedStyle(el).scrollSnapType)).toBe('none');
  await expect(page.locator('footer')).toHaveCount(1);
});

test('sin JavaScript siguen disponibles enlaces y galería', async ({ browser }) => {
  const context = await browser.newContext({javaScriptEnabled: false, viewport: {width: 1440, height: 1000}});
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:4321/');
  await expect(page.locator('main > .screen-panel')).toHaveCount(3);
  await expect(page.locator('noscript summary')).toBeVisible();
  await expect(page.locator('.project-controls')).toBeHidden();
  await expect(page.locator('.showcase-card')).toHaveCount(7);
  await expect(page.locator('.showcase-card[inert]')).toHaveCount(0);
  await context.close();
});

test('barra lateral fija sin solapamientos y enlaces accesibles', async ({ page }) => {
  await page.goto('/');
  const rail = page.locator('.site-sidebar');
  await openMobileMenu(page);
  await expect(rail.getByRole('navigation', {name: 'Navegación principal'})).toHaveCount(1);
  await expect(rail.locator('.footer-socials a')).toHaveCount(3);
  for (const viewport of [{width: 1440, height: 900}, {width: 768, height: 1024}, {width: 390, height: 664}, {width: 320, height: 568}, {width: 844, height: 390}]) {
    await page.setViewportSize(viewport);
    if (viewport.width <= 760 && !(await page.locator('html').evaluate(el=>el.classList.contains('sidebar-open')))) await openMobileMenu(page);
    const sidebarBox = await rail.boundingBox();
    const mainBox = await page.locator('main').boundingBox();
    if (viewport.width > 760) expect(sidebarBox!.x + sidebarBox!.width).toBeLessThanOrEqual(mainBox!.x);
    else expect(mainBox!.x).toBe(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
    for (const name of ['Inicio', 'Proyectos', 'Contacto', 'GitHub', 'Email', 'LinkedIn', 'Laboratorio', 'Volver arriba']) {
      const link = rail.getByRole('link', {name, exact: true});
      await link.scrollIntoViewIfNeeded();
      const box = await link.boundingBox();
      expect(box!.y).toBeGreaterThanOrEqual(0);
      expect(box!.y + box!.height).toBeLessThanOrEqual(viewport.height);
    }
  }
  await page.setViewportSize({width: 1440, height: 900});
  await rail.getByRole('link', {name: 'Contacto', exact: true}).click();
  await expect(rail.getByRole('link', {name: 'Contacto', exact: true})).toHaveAttribute('aria-current', 'location');
  await rail.getByRole('link', {name: 'Volver arriba', exact: true}).click();
  await expect.poll(() => page.evaluate(() => Math.abs(scrollY))).toBeLessThan(2);
  await page.goto('/proyectos/restaurantos/');
  await expect(rail).toBeVisible();
  await expect(page.locator('footer')).toHaveCount(1);
});
