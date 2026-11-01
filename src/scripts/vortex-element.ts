import type { VortexEngine } from '../graphics/vortex/engine';
import type { CameraView } from '../graphics/vortex/config';

class VortexScene extends HTMLElement {
  private engine?: VortexEngine;
  private observer?: IntersectionObserver;
  private motion = matchMedia('(prefers-reduced-motion: reduce)');
  private visible = false;
  private loading = false;
  private paused = false;
  private lifecycle = 0;

  connectedCallback() {
    this.addEventListener('click', this.handleClick);
    this.addEventListener('input', this.handleInput);
    this.motion.addEventListener('change', this.handleMotion);
    this.observer = new IntersectionObserver(entries => {
      this.visible = entries[0].isIntersecting;
      this.engine?.setVisible(this.visible);
      if (this.visible) void this.start();
    });
    this.observer.observe(this);
    this.handleMotion();
  }
  disconnectedCallback() {
    this.lifecycle++;
    this.engine?.dispose(); this.engine = undefined;
    this.observer?.disconnect();
    this.motion.removeEventListener('change', this.handleMotion);
    this.removeEventListener('click', this.handleClick);
    this.removeEventListener('input', this.handleInput);
  }
  private message(text: string) { const status = this.querySelector('[data-status]'); if (status) status.textContent = text; }
  private enableControls(enabled: boolean) { this.querySelectorAll<HTMLButtonElement | HTMLInputElement>('button, input').forEach(control => { control.disabled = !enabled; }); }
  private handleMotion = () => {
    if (this.motion.matches) {
      this.engine?.dispose(); this.engine = undefined;
      this.dataset.state = 'static';
      this.enableControls(false);
      this.message('Movimiento reducido · Composición estática');
    } else if (this.visible) { void this.start(); }
  };
  private fail = () => {
    this.engine?.dispose(); this.engine = undefined;
    this.dataset.state = 'fallback'; this.enableControls(false);
    this.message('Vista estática · La animación no está disponible');
  };
  private async start() {
    if (this.engine || this.loading || this.motion.matches || this.dataset.state === 'fallback') return;
    this.loading = true;
    const lifecycle = this.lifecycle;
    try {
      const { createVortex } = await import('../graphics/vortex/engine');
      if (!this.isConnected || this.motion.matches || lifecycle !== this.lifecycle) return;
      const host = this.querySelector<HTMLElement>('.canvas-host');
      if (!host) return;
      this.engine = createVortex(host, this.dataset.mode === 'lab' ? 'lab' : 'hero', this.fail);
      this.engine.setVisible(this.visible);
      this.engine.setPaused(this.paused);
      this.dataset.state = 'ready';
      this.enableControls(true);
      const density = this.querySelector<HTMLInputElement>('[data-param="density"]');
      if (density) { density.value = String(this.engine.config.particleCount); this.updateOutput('density', density.value); }
      this.message('Animación disponible');
    } catch { this.fail(); }
    finally { this.loading = false; }
  }
  private handleClick = (event: Event) => {
    const target = event.target instanceof Element ? event.target.closest<HTMLButtonElement>('button') : null;
    if (!target || !this.engine) return;
    if (target.hasAttribute('data-pause')) {
      this.paused = !this.paused;
      this.engine.setPaused(this.paused);
      target.setAttribute('aria-pressed', String(this.paused));
      target.setAttribute('aria-label', this.paused ? 'Reanudar animación' : 'Pausar animación');
      target.textContent = this.paused ? 'Reanudar ▷' : 'Pausar Ⅱ';
    }
    const view = target.dataset.view;
    if (view === 'perspective' || view === 'top' || view === 'core') {
      this.engine.setView(view as CameraView);
      this.querySelectorAll<HTMLButtonElement>('[data-view]').forEach(button => button.setAttribute('aria-pressed', String(button === target)));
    }
  };
  private updateOutput(key: string, value: string) {
    const output = this.querySelector<HTMLOutputElement>(`[data-output="${key}"]`);
    if (output) output.value = key === 'density' ? Number(value).toLocaleString('es') : value;
  }
  private handleInput = (event: Event) => {
    const input = event.target;
    if (!(input instanceof HTMLInputElement) || !this.engine) return;
    const key = input.dataset.param, value = Number(input.value);
    if (!Number.isFinite(value)) return;
    if (key === 'density') this.engine.setDensity(value);
    else if (key === 'viscosity' || key === 'vorticity' || key === 'timeScale' || key === 'luminance') this.engine.setParameter(key, value);
    if (key) this.updateOutput(key, input.value);
  };
}

if (!customElements.get('vortex-scene')) customElements.define('vortex-scene', VortexScene);
