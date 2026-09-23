const hasReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let lenis = null;

if (!hasReducedMotion && typeof Lenis !== 'undefined') {
    lenis = new Lenis({
        duration: 1.15,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        direction: 'vertical',
        gestureDirection: 'vertical',
        smoothTouch: false
    });

    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);
}

document.querySelectorAll('.bento-card, .contact-section, .glass-footer').forEach((elemento) => {
    let ticking = false;

    elemento.addEventListener('mousemove', (event) => {
        if (hasReducedMotion || ticking) return;

        ticking = true;
        requestAnimationFrame(() => {
            const rect = elemento.getBoundingClientRect();
            elemento.style.setProperty('--mouse-x', `${event.clientX - rect.left}px`);
            elemento.style.setProperty('--mouse-y', `${event.clientY - rect.top}px`);
            ticking = false;
        });
    });
});

document.querySelector('.btn-top')?.addEventListener('click', () => {
    if (lenis) {
        lenis.scrollTo('#inicio', { duration: 1 });
        return;
    }

    document.querySelector('#inicio')?.scrollIntoView({ behavior: hasReducedMotion ? 'auto' : 'smooth' });
});
