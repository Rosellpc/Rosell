import * as THREE from 'three';
import { createStarfield } from './starfield';

export function createContactStars(host: HTMLElement, onError: () => void) {
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  renderer.setClearColor(0x020304, 0);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, 1, .1, 200);
  camera.position.set(0, 10, 29);
  camera.lookAt(0, 0, 0);
  const stars = createStarfield(renderer.getPixelRatio());
  scene.add(stars);
  host.append(renderer.domElement);
  let frame = 0, last = 0, disposed = false;
  const tick = (now: number) => {
    const dt = last ? Math.min((now - last) / 1000, .05) : 0;
    last = now;
    stars.rotation.y += dt * .4 * .008;
    renderer.render(scene, camera);
    frame = requestAnimationFrame(tick);
  };
  const resize = () => {
    const { width, height } = host.getBoundingClientRect();
    if (!width || !height || disposed) return;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
    renderer.render(scene, camera);
  };
  const observer = new ResizeObserver(resize);
  observer.observe(host);
  const contextLost = (event: Event) => { event.preventDefault(); onError(); };
  renderer.domElement.addEventListener('webglcontextlost', contextLost);
  resize();
  return {
    setActive(active: boolean) {
      cancelAnimationFrame(frame);
      last = 0;
      if (active && !disposed) frame = requestAnimationFrame(tick);
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      renderer.domElement.removeEventListener('webglcontextlost', contextLost);
      stars.geometry.dispose(); stars.material.dispose();
      scene.clear(); renderer.dispose(); renderer.domElement.remove();
    },
  };
}
