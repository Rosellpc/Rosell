import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { createConfig, type VortexMode, type CameraView } from './config';
import { ParticleField } from './particles';
import { particleVertex, particleFragment, starVertex, starFragment } from './shaders';

export function createVortex(host: HTMLElement, mode: VortexMode, onError: () => void) {
  const config = createConfig(mode, matchMedia('(max-width: 640px)').matches);
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  renderer.setClearColor(0x111111, 0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  host.append(renderer.domElement);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, 1, .1, 200);
  camera.position.set(0, 10, 29);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enabled = mode === 'lab';
  controls.enableDamping = true;
  controls.enableZoom = false;
  controls.enablePan = false;
  controls.target.set(0, 0, 0);
  controls.update();

  const starCount = matchMedia('(max-width: 640px)').matches ? 900 : 2200;
  const starPositions = new Float32Array(starCount * 3);
  const starSizes = new Float32Array(starCount);
  const starBrightness = new Float32Array(starCount);
  for (let i = 0; i < starCount; i++) {
    const angle = Math.random() * Math.PI * 2;
    const vertical = Math.random() * 2 - 1;
    const radius = 45 + Math.random() * 45;
    const spread = Math.sqrt(1 - vertical * vertical);
    starPositions.set([Math.cos(angle) * spread * radius, vertical * radius, Math.sin(angle) * spread * radius], i * 3);
    starSizes[i] = .65 + Math.pow(Math.random(), 3) * 1.2;
    starBrightness[i] = .2 + Math.pow(Math.random(), 2) * .55;
  }
  const starGeometry = new THREE.BufferGeometry();
  starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
  starGeometry.setAttribute('aSize', new THREE.BufferAttribute(starSizes, 1));
  starGeometry.setAttribute('aBrightness', new THREE.BufferAttribute(starBrightness, 1));
  const starMaterial = new THREE.ShaderMaterial({ vertexShader: starVertex, fragmentShader: starFragment, uniforms: { uPixelRatio: { value: renderer.getPixelRatio() } }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
  const stars = new THREE.Points(starGeometry, starMaterial);
  scene.add(stars);

  let field: ParticleField;
  const particleMaterial = new THREE.ShaderMaterial({ vertexShader: particleVertex, fragmentShader: particleFragment, uniforms: { uPixelRatio: { value: renderer.getPixelRatio() }, uLuminance: { value: config.luminance } }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
  const particles = new THREE.Points(new THREE.BufferGeometry(), particleMaterial);
  if (mode === 'hero') {
    particles.position.x = matchMedia('(max-width: 640px)').matches ? 0 : 10;
    particles.rotation.z = -.25;
    particles.scale.setScalar(1.25);
  }
  particles.frustumCulled = false;
  scene.add(particles);
  function setDensity(count: number) {
    config.particleCount = Math.max(1000, Math.min(20000, Math.round(count)));
    field = new ParticleField(config.particleCount);
    particles.geometry.dispose();
    particles.geometry = new THREE.BufferGeometry();
    particles.geometry.setAttribute('position', new THREE.BufferAttribute(field.positions, 3).setUsage(THREE.DynamicDrawUsage));
  }
  setDensity(config.particleCount);

  let frame = 0, last = 0, visible = false, paused = false, disposed = false;
  let pointer: THREE.Vector3 | undefined;
  const raycaster = new THREE.Raycaster();
  const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  function pointerMove(event: PointerEvent) {
    if (event.pointerType !== 'mouse') return;
    const rect = host.getBoundingClientRect();
    const cursor = new THREE.Vector2((event.clientX - rect.left) / rect.width * 2 - 1, -(event.clientY - rect.top) / rect.height * 2 + 1);
    raycaster.setFromCamera(cursor, camera);
    const intersection = raycaster.ray.intersectPlane(plane, new THREE.Vector3());
    pointer = intersection ? particles.worldToLocal(intersection) : undefined;
  }
  function pointerLeave() { pointer = undefined; }
  host.addEventListener('pointermove', pointerMove);
  host.addEventListener('pointerleave', pointerLeave);
  function draw() { if (!disposed) renderer.render(scene, camera); }
  function animate(now: number) {
    frame = 0;
    if (disposed || !visible || paused || document.hidden) return;
    const dt = Math.min((now - (last || now)) / 1000, .05) * config.timeScale;
    last = now;
    field.update(dt, config, pointer);
    stars.rotation.y += dt * .008;
    particles.geometry.attributes.position.needsUpdate = true;
    controls.update();
    draw();
    frame = requestAnimationFrame(animate);
  }
  function sync() {
    cancelAnimationFrame(frame); frame = 0; last = 0;
    if (!disposed && visible && !paused && !document.hidden) frame = requestAnimationFrame(animate);
  }
  function resize() {
    const { width, height } = host.getBoundingClientRect();
    if (!width || !height) return;
    camera.aspect = width / height; camera.updateProjectionMatrix();
    renderer.setSize(width, height);
    draw();
  }
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(host);
  controls.addEventListener('change', draw);
  document.addEventListener('visibilitychange', sync);
  function contextLost(event: Event) { event.preventDefault(); onError(); }
  renderer.domElement.addEventListener('webglcontextlost', contextLost);
  resize();
  return {
    config,
    setVisible(value: boolean) { visible = value; sync(); },
    setPaused(value: boolean) { paused = value; sync(); },
    setDensity(count: number) { setDensity(count); draw(); },
    setParameter(key: 'viscosity' | 'vorticity' | 'timeScale' | 'luminance', value: number) { config[key] = value; particleMaterial.uniforms.uLuminance.value = config.luminance; draw(); },
    setView(view: CameraView) {
      const views = { perspective: [0, 10, 29], top: [0, 32, .1], core: [0, 3, 19] } as const;
      const position = views[view];
      camera.position.set(position[0], position[1], position[2]); controls.target.set(0, 0, 0); controls.update(); draw();
    },
    dispose() {
      if (disposed) return;
      disposed = true; cancelAnimationFrame(frame); resizeObserver.disconnect();
      document.removeEventListener('visibilitychange', sync);
      host.removeEventListener('pointermove', pointerMove); host.removeEventListener('pointerleave', pointerLeave);
      renderer.domElement.removeEventListener('webglcontextlost', contextLost);
      controls.removeEventListener('change', draw); controls.dispose();
      particles.geometry.dispose(); particleMaterial.dispose();
      starGeometry.dispose(); starMaterial.dispose();
      scene.clear(); renderer.dispose(); renderer.domElement.remove();
    },
  };
}
export type VortexEngine = ReturnType<typeof createVortex>;
