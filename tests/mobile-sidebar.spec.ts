import {test, expect} from '@playwright/test';

test.beforeEach(async ({page}) => {
  await page.setViewportSize({width:390,height:844});
  await page.goto('/');
  await expect(page.locator('html')).toHaveClass(/sidebar-ready/);
});

test('menú oculto libera el ancho y se cierra al navegar', async ({page}) => {
  const toggle=page.getByRole('button',{name:'Abrir menú'});
  await expect(page.locator('#site-sidebar')).toBeHidden();
  expect(await page.locator('main').evaluate(el=>el.getBoundingClientRect().x)).toBe(0);
  await toggle.click();
  const drawer=page.getByRole('dialog');
  await expect(drawer).toBeVisible();
  await expect(page.locator('main')).toHaveAttribute('inert','');
  await drawer.getByRole('link',{name:'Proyectos',exact:true}).click();
  await expect(toggle).toHaveAttribute('aria-expanded','false');
  await expect(page.locator('#site-sidebar')).toBeHidden();
  await expect(page.locator('main')).not.toHaveAttribute('inert','');
  await expect(page).toHaveURL(/#proyectos$/);
  await expect.poll(()=>page.locator('#proyectos').evaluate(el=>Math.abs(el.getBoundingClientRect().top))).toBeLessThan(2);
});

test('foco contenido en menú, Escape y cierre tocando fuera', async ({page}) => {
  const toggle=page.getByRole('button',{name:'Abrir menú'});
  await toggle.click();
  await expect(page.getByRole('button',{name:'Cerrar menú'})).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(page.getByRole('link',{name:'Volver arriba',exact:true})).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button',{name:'Cerrar menú'})).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(toggle).toBeFocused();
  await toggle.click();
  await page.locator('.sidebar-backdrop').click({position:{x:375,y:200}});
  await expect(toggle).toHaveAttribute('aria-expanded','false');
  await expect(toggle).toBeFocused();
});

test('deslizamiento a izquierda cierra el menú', async ({page}) => {
  await page.getByRole('button',{name:'Abrir menú'}).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect.poll(()=>page.locator('#site-sidebar').evaluate(el=>Math.abs(el.getBoundingClientRect().x))).toBeLessThan(1);
  const client=await page.context().newCDPSession(page);
  await client.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:230,y:320}]});
  for(const x of [200,170,140,110]) {
    await client.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x,y:320}]});
  }
  await client.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  await expect(page.getByRole('button',{name:'Abrir menú'})).toHaveAttribute('aria-expanded','false');
});

test('redimensionar restablece escritorio y mantiene acceso en pantallas pequeñas', async ({page}) => {
  await page.getByRole('button',{name:'Abrir menú'}).click();
  await page.setViewportSize({width:1440,height:900});
  await expect(page.locator('#site-sidebar')).toBeVisible();
  await expect(page.locator('#site-sidebar')).not.toHaveAttribute('inert','');
  await expect(page.locator('main')).not.toHaveAttribute('inert','');
  await expect(page.getByRole('button',{name:'Abrir menú'})).toBeHidden();
  for(const width of [320,390,760]) {
    await page.setViewportSize({width,height:568});
    await page.getByRole('button',{name:'Abrir menú'}).click();
    await page.getByRole('link',{name:'Volver arriba',exact:true}).scrollIntoViewIfNeeded();
    await expect(page.getByRole('link',{name:'Volver arriba',exact:true})).toBeInViewport();
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
    await page.keyboard.press('Escape');
  }
});

test('movimiento reducido y rutas internas', async ({page}) => {
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('/proyectos/restaurantos/');
  await page.getByRole('button',{name:'Abrir menú'}).click();
  expect(await page.locator('#site-sidebar').evaluate(el=>getComputedStyle(el).transitionDuration)).toBe('0s');
  await page.getByRole('button',{name:'Cerrar menú'}).click();
  await expect(page.locator('#site-sidebar')).toBeHidden();
});

test('sin JavaScript la navegación sigue accesible', async ({browser}) => {
  const context=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}});
  const page=await context.newPage();
  await page.goto('http://127.0.0.1:4321/');
  await expect(page.locator('#site-sidebar')).toBeVisible();
  await expect(page.getByRole('button',{name:'Abrir menú'})).toBeHidden();
  await page.getByRole('link',{name:'Proyectos',exact:true}).click();
  await expect(page).toHaveURL(/#proyectos$/);
  await context.close();
});
