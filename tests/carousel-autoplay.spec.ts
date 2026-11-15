import {test, expect} from '@playwright/test';

test('solo título, tarjeta y contacto; espaciado y ampliación responsivos', async ({page}) => {
  await page.goto('/#proyectos');
  await expect(page.locator('#projects-title')).toHaveText('Proyectos');
  await expect(page.locator('#proyectos button')).toHaveCount(2);
  await expect(page.locator('#proyectos .section-heading')).toHaveText('Proyectos');
  for (const width of [1440, 820, 390, 320]) {
    await page.setViewportSize({width, height: 900});
    await expect(page.locator('#proyectos .screen-next')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
    const preview = page.locator('.showcase-card:not([inert]) .shot-0 img');
    expect(await preview.evaluate(el=>el.getBoundingClientRect().height)).toBeGreaterThanOrEqual(220);
    expect(await page.locator('.showcase-links').first().evaluate(el=>parseFloat(getComputedStyle(el).marginTop))).toBeGreaterThanOrEqual(28);
    if(width===1440) {
      await expect.poll(()=>page.locator('.showcase-copy').first().evaluate(el=>parseFloat(getComputedStyle(el).paddingTop))).toBe(54);
      expect(await page.locator('#proyectos').evaluate(el=>parseFloat(getComputedStyle(el).paddingTop))).toBeCloseTo(43.2,1);
    }
  }
});

test('autoplay lateral, pausa por foco y retorno del último al primero', async ({page}) => {
  await page.clock.install();
  const errors:string[]=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto('/#proyectos');
  const root=page.locator('project-showcase');
  const track=root.locator('.project-track');
  const active=root.locator('.showcase-card:not([inert])');
  const leave=async()=>{
    await expect.poll(()=>track.evaluate(el=>el.getAnimations().length)).toBe(0);
    await page.clock.runFor(100);
    await page.locator('.site-sidebar .brand').focus();
    await page.mouse.move(5,5);
    await expect(root).toHaveAttribute('data-autoplay','playing');
  };
  // Record actual keyframes without changing playback behavior.
  await track.evaluate(el=>{
    const original=el.animate.bind(el);
    (window as any).carouselFrames=[];
    el.animate=((frames:any,options:any)=>{(window as any).carouselFrames.push({frames,options});return original(frames,options);}) as typeof el.animate;
  });
  await leave();
  await page.clock.fastForward(9000);
  await expect(active).toHaveAttribute('data-slide','1');
  const frames=await page.evaluate(()=>(window as any).carouselFrames);
  expect(frames[0].frames[1].transform).toBe('translateX(-36px)');
  expect(frames[1].frames[0].transform).toBe('translateX(36px)');
  expect(frames[0].options.duration+frames[1].options.duration).toBe(460);
  await track.focus();
  await expect(root).toHaveAttribute('data-autoplay','paused');
  await page.clock.fastForward(20000);
  await expect(active).toHaveAttribute('data-slide','1');
  await page.keyboard.press('End');
  await expect(active).toHaveAttribute('data-slide','6');
  await leave();
  await page.clock.fastForward(9000);
  await expect(active).toHaveAttribute('data-slide','0');
  expect(errors).toEqual([]);
});

test('sin autoplay fuera de pantalla o con movimiento reducido; teclado conserva acceso', async({page})=>{
  await page.clock.install();
  await page.goto('/');
  const root=page.locator('project-showcase');
  await expect(root).toHaveAttribute('data-autoplay','paused');
  await page.clock.fastForward(20000);
  await expect(root.locator('.showcase-card:not([inert])')).toHaveAttribute('data-slide','0');
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.locator('[data-screen=proyectos]').click();
  await page.clock.fastForward(20000);
  await expect(root).toHaveAttribute('data-autoplay','paused');
  await root.locator('.project-track').focus();
  await page.keyboard.press('ArrowRight');
  await expect(root.locator('.showcase-card:not([inert])')).toHaveAttribute('data-slide','1');
});

test('flechas laterales recorren los proyectos y vuelven a empezar', async ({page}) => {
  await page.goto('/#proyectos');
  const root=page.locator('project-showcase');
  const active=root.locator('.showcase-card:not([inert])');
  const previous=page.getByRole('button',{name:'Proyecto anterior'});
  const next=page.getByRole('button',{name:'Proyecto siguiente'});
  await previous.click();
  await expect(active).toHaveAttribute('data-slide','6');
  await next.click();
  await expect(active).toHaveAttribute('data-slide','0');
  await next.focus();
  await page.keyboard.press('Enter');
  await expect(active).toHaveAttribute('data-slide','1');
  await expect(root).toHaveAttribute('data-autoplay','paused');
  for(const button of [previous,next]) {
    const bounds=await button.boundingBox();
    expect(bounds!.width).toBeGreaterThanOrEqual(44);
    expect(bounds!.height).toBeGreaterThanOrEqual(44);
    expect(bounds!.x).toBeGreaterThanOrEqual(0);
    expect(bounds!.x+bounds!.width).toBeLessThanOrEqual(await page.evaluate(()=>innerWidth));
  }
});
