class ProjectShowcase extends HTMLElement {
  private dispose?: () => void;

  connectedCallback() {
    const track = this.querySelector<HTMLElement>('.project-track')!;
    const slides = Array.from(this.querySelectorAll<HTMLElement>('[data-slide]'));
    const contents = Array.from(this.querySelectorAll<HTMLElement>('.showcase-content'));
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const desktop = matchMedia('(min-width: 1101px)');
    const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
    const events = new AbortController();
    let width = track.clientWidth;
    let current = 0;
    let visible = false;
    let hovered = false;
    let touching = false;
    let disposed = false;
    let frame = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let animation: Animation | undefined;
    let transition = 0;
    let moving = false;

    const canPlay = () => !disposed && visible && !document.hidden && !reduced.matches && !hovered && !touching && !this.contains(document.activeElement);
    const schedule = () => {
      clearTimeout(timer);
      const playing = canPlay();
      this.dataset.autoplay = playing ? 'playing' : 'paused';
      if (playing && !moving) timer = setTimeout(() => { void go((current + 1) % slides.length, true); }, 2000);
    };
    const update = () => {
      if (width !== track.clientWidth) return;
      current = Math.max(0, Math.min(slides.length - 1, Math.round(track.scrollLeft / width)));
      slides.forEach((slide, i) => { slide.inert = i !== current; });
    };
    const cancelTransition = () => {
      transition++;
      animation?.cancel();
      animation = undefined;
      moving = false;
    };
    const go = async (index: number, automatic = false) => {
      clearTimeout(timer);
      cancelTransition();
      const target = Math.max(0, Math.min(slides.length - 1, index));
      if (target === current) { schedule(); return; }
      const operation = transition;
      moving = true;
      if (!reduced.matches) {
        animation = track.animate([{opacity: 1, transform: 'translateX(0)'}, {opacity: 0, transform: 'translateX(-36px)'}], {duration: 1200, easing: 'cubic-bezier(.4, 0, .6, 1)', fill: 'forwards'});
        await animation.finished.catch(() => {});
        if (operation !== transition || disposed) return;
        // Never replace the slide beneath a link that has just received focus.
        if (automatic && !canPlay()) { cancelTransition(); schedule(); return; }
      }
      track.scrollTo({left: target * width, behavior: 'instant'});
      update();
      animation?.cancel();
      if (!reduced.matches) {
        animation = track.animate([{opacity: 0, transform: 'translateX(36px)'}, {opacity: 1, transform: 'translateX(0)'}], {duration: 1800, easing: 'cubic-bezier(.22, 1, .36, 1)'});
        await animation.finished.catch(() => {});
        if (operation !== transition || disposed) return;
      }
      animation = undefined;
      moving = false;
      schedule();
    };
    const sizeCards = () => {
      if (desktop.matches) {
        // Content stays at its natural size; the card gains 10% of breathing room.
        const naturalHeight = Math.max(...contents.map(content => content.getBoundingClientRect().height)) + 2;
        this.style.setProperty('--desktop-card-height', `${naturalHeight * 1.1}px`);
      } else this.style.removeProperty('--desktop-card-height');
    };
    const resize = new ResizeObserver(() => {
      if (width !== track.clientWidth) {
        cancelTransition();
        width = track.clientWidth;
        track.scrollTo({left: current * width, behavior: 'instant'});
        update();
        schedule();
      }
      sizeCards();
    });
    resize.observe(track);
    contents.forEach(content => resize.observe(content));
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting && entry.intersectionRatio >= .45; schedule(); }, {threshold: [0, .45]});
    observer.observe(this);

    this.addEventListener('pointerenter', () => { if (finePointer.matches) { hovered = true; schedule(); } }, {signal: events.signal});
    this.addEventListener('pointerleave', () => { hovered = false; schedule(); }, {signal: events.signal});
    this.addEventListener('focusin', schedule, {signal: events.signal});
    this.addEventListener('focusout', () => queueMicrotask(schedule), {signal: events.signal});
    track.addEventListener('pointerdown', () => { touching = true; cancelTransition(); schedule(); }, {signal: events.signal});
    const release = () => { touching = false; schedule(); };
    window.addEventListener('pointerup', release, {signal: events.signal});
    window.addEventListener('pointercancel', release, {signal: events.signal});
    track.addEventListener('keydown', event => {
      if (event.target !== track || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      void go(event.key === 'Home' ? 0 : event.key === 'End' ? slides.length - 1 : current + (event.key === 'ArrowRight' ? 1 : -1));
    }, {signal: events.signal});
    track.addEventListener('scroll', () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(() => { update(); if (!moving) schedule(); }); }, {passive: true, signal: events.signal});
    reduced.addEventListener('change', () => { cancelTransition(); update(); schedule(); }, {signal: events.signal});
    desktop.addEventListener('change', sizeCards, {signal: events.signal});
    document.addEventListener('visibilitychange', schedule, {signal: events.signal});

    this.querySelector('[data-previous]')?.addEventListener('click', () => { void go((current - 1 + slides.length) % slides.length); }, {signal: events.signal});
    this.querySelector('[data-next]')?.addEventListener('click', () => { void go((current + 1) % slides.length); }, {signal: events.signal});
    this.dataset.ready = '';
    update();
    sizeCards();
    schedule();
    this.dispose = () => {
      disposed = true;
      delete this.dataset.ready;
      events.abort();
      resize.disconnect();
      observer.disconnect();
      cancelAnimationFrame(frame);
      clearTimeout(timer);
      cancelTransition();
    };
  }
  disconnectedCallback() { this.dispose?.(); }
}
if (!customElements.get('project-showcase')) customElements.define('project-showcase', ProjectShowcase);
export {};
