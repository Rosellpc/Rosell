const sidebar = document.querySelector<HTMLElement>('#site-sidebar')!;
const toggle = document.querySelector<HTMLButtonElement>('[data-sidebar-toggle]')!;
const closeButton = sidebar.querySelector<HTMLButtonElement>('[data-sidebar-close]')!;
const backdrop = document.querySelector<HTMLElement>('[data-sidebar-backdrop]')!;
const main = document.querySelector<HTMLElement>('body > main')!;
const skipLink = document.querySelector<HTMLElement>('.skip-link');
const mobile = matchMedia('(max-width: 760px)');
let open = false;
let touchStart: {x: number; y: number} | undefined;

function setOpen(value: boolean, restoreFocus = true) {
  open = value && mobile.matches;
  document.documentElement.classList.toggle('sidebar-open', open);
  toggle.setAttribute('aria-expanded', String(open));
  sidebar.inert = mobile.matches && !open;
  main.inert = open;
  if (skipLink) skipLink.inert = open;
  if (open) {
    sidebar.setAttribute('role', 'dialog');
    sidebar.setAttribute('aria-modal', 'true');
    requestAnimationFrame(() => { if (open) closeButton.focus({preventScroll: true}); });
  } else {
    sidebar.removeAttribute('role');
    sidebar.removeAttribute('aria-modal');
    if (restoreFocus && mobile.matches) toggle.focus({preventScroll: true});
  }
}

toggle.addEventListener('click', () => setOpen(!open));
closeButton.addEventListener('click', () => setOpen(false));
backdrop.addEventListener('click', () => setOpen(false));
sidebar.addEventListener('click', event => {
  if (open && (event.target as Element).closest('a')) setOpen(false);
});
document.addEventListener('keydown', event => {
  if (!open) return;
  if (event.key === 'Escape') { event.preventDefault(); setOpen(false); }
  if (event.key !== 'Tab') return;
  const links = Array.from(sidebar.querySelectorAll<HTMLElement>('a[href], button:not([disabled])'));
  const first = links[0];
  const last = links[links.length - 1];
  if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
  else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
});
sidebar.addEventListener('touchstart', event => {
  touchStart = open && event.touches.length === 1 ? {x: event.touches[0].clientX, y: event.touches[0].clientY} : undefined;
}, {passive: true});
sidebar.addEventListener('touchend', event => {
  if (!touchStart || !open) return;
  const end = event.changedTouches[0];
  const dx = end.clientX - touchStart.x;
  const dy = end.clientY - touchStart.y;
  if (dx < -60 && Math.abs(dx) > Math.abs(dy) * 1.5) setOpen(false);
  touchStart = undefined;
}, {passive: true});
sidebar.addEventListener('touchcancel', () => { touchStart = undefined; }, {passive: true});
mobile.addEventListener('change', () => {
  const focusedInside = sidebar.contains(document.activeElement);
  setOpen(false, focusedInside);
  if (!mobile.matches && (document.activeElement === toggle || document.activeElement === closeButton)) sidebar.querySelector<HTMLElement>('a')?.focus({preventScroll: true});
});
document.documentElement.classList.add('sidebar-ready');
setOpen(false, false);

export {};
