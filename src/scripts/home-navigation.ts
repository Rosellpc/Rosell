// Keep anchors, keyboard and touch on the document's native scroll container.
const links = Array.from(document.querySelectorAll<HTMLAnchorElement>('.nav-links a[data-screen]'));
const panels = Array.from(document.querySelectorAll<HTMLElement>('main > .screen-panel'));
const visibility = new Map<Element, number>();
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => visibility.set(entry.target, entry.intersectionRatio));
  const active = panels.reduce<HTMLElement | undefined>((best, panel) =>
    (visibility.get(panel) ?? 0) > (best ? visibility.get(best) ?? 0 : 0) ? panel : best, undefined);
  if (!active) return;
  links.forEach(link => {
    if (link.dataset.screen === active.id) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
}, {threshold: [0, .1, .25, .5, .75, 1]});
panels.forEach(panel => observer.observe(panel));

// Small wheel gestures should also advance a screen. Let tall content, dialogs,
// zoom gestures and horizontal swipes keep their native behavior.
let wheelDistance = 0;
let previousWheel = 0;
let locked = false;
let started = 0;
let unlockTimer: ReturnType<typeof setTimeout>;
const unlockAfterGesture = () => {
  clearTimeout(unlockTimer);
  unlockTimer = setTimeout(() => { locked = false; }, Math.max(180, 750 - (performance.now() - started)));
};
window.addEventListener('wheel', event => {
  if (event.ctrlKey || event.metaKey || event.shiftKey || Math.abs(event.deltaX) >= Math.abs(event.deltaY) || !event.deltaY) return;
  const target = event.target instanceof Element ? event.target : undefined;
  if (document.documentElement.classList.contains('sidebar-open') || document.querySelector('dialog[open]') || target?.closest('.site-sidebar, select, textarea, input, [contenteditable="true"]')) return;
  if (locked) { event.preventDefault(); unlockAfterGesture(); return; }
  const direction = Math.sign(event.deltaY);
  const current = panels.findIndex(panel => {
    const rect = panel.getBoundingClientRect();
    return rect.top <= innerHeight / 2 && rect.bottom > innerHeight / 2;
  });
  if (current < 0) return;
  const rect = panels[current].getBoundingClientRect();
  if (rect.height > innerHeight + 4 && (direction > 0 ? rect.bottom > innerHeight + 4 : rect.top < -4)) return;
  const next = panels[current + direction];
  if (!next) return;
  event.preventDefault();
  const now = performance.now();
  if (now - previousWheel > 180 || Math.sign(wheelDistance) !== direction) wheelDistance = 0;
  previousWheel = now;
  wheelDistance += event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? innerHeight : 1);
  if (Math.abs(wheelDistance) < 30) return;
  wheelDistance = 0;
  locked = true;
  started = now;
  next.scrollIntoView({block: 'start', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'});
  unlockAfterGesture();
}, {passive: false});

export {};
