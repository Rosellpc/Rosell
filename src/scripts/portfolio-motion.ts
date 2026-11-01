// Content is visible by default, including when JavaScript is unavailable.
const motion = matchMedia('(prefers-reduced-motion: reduce)');
const targets = new Map<HTMLElement, number>();
const seen = new WeakSet<HTMLElement>();
const active = new Map<HTMLElement, Animation>();

function register(selector: string, stagger = 0, groupSize = 1) {
  document.querySelectorAll<HTMLElement>(selector).forEach((element, index) => {
    targets.set(element, (index % groupSize) * stagger);
  });
}

register('.presentation-intro > *', 65, 5);
register('.presentation-portrait-area');
register('.presentation-story-heading, .presentation-story-copy', 90, 2);
register('#proyectos .section-heading, #stack .section-heading');
register('.project-card');
register('.project-grid-item', 70, 3);
register('.stack-column', 80, 3);
register('.contact-panel > .eyebrow, .contact-panel > h2, .contact-panel > p:not(.eyebrow), .contact-panel > a, .contact-links', 65, 5);

function reveal(element: HTMLElement) {
  seen.add(element);
  observer?.unobserve(element);
  element.dataset.motion = 'visible';
  active.get(element)?.cancel();
  active.delete(element);
}

const observer = 'IntersectionObserver' in window && 'animate' in Element.prototype
  ? new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      const element = entry.target as HTMLElement;
      observer?.unobserve(element);
      seen.add(element);
      if (motion.matches || element.contains(document.activeElement)) {
        reveal(element);
        continue;
      }
      element.dataset.motion = 'entering';
      // Independent translate leaves the cards' hover transforms intact.
      const animation = element.animate([
        { opacity: 0, translate: '0 20px' },
        { opacity: 1, translate: '0 0' },
      ], {
        duration: 650,
        delay: targets.get(element) ?? 0,
        easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
        fill: 'backwards',
      });
      active.set(element, animation);
      animation.onfinish = () => reveal(element);
    }
  }, { threshold: 0, rootMargin: '0px 0px -24px 0px' })
  : undefined;

function syncMotion() {
  if (motion.matches || !observer) {
    observer?.disconnect();
    targets.forEach((_, element) => reveal(element));
    return;
  }
  targets.forEach((_, element) => {
    if (seen.has(element)) return;
    // Preserve restored scroll positions and direct section links.
    if (element.getBoundingClientRect().bottom <= 0) reveal(element);
    else observer.observe(element);
  });
}

document.addEventListener('focusin', event => {
  if (!(event.target instanceof Node)) return;
  const focused = event.target;
  targets.forEach((_, element) => {
    if (element.contains(focused)) reveal(element);
  });
});

document.addEventListener('visibilitychange', () => {
  if (document.hidden) active.forEach((_, element) => reveal(element));
});

motion.addEventListener('change', syncMotion);
syncMotion();
