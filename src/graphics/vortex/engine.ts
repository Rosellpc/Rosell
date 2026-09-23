import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { createConfig, type VortexMode, type CameraView } from './config';
import { ParticleField } from './particles';
import { particleVertex, particleFragment, backdropVertex, backdropFragment } from './shaders';

export function createVortex(host: HTMLElement, mode: VortexMode, onError: () => void) {
  const config = createConfig(mode, matchMedia('(max-width: 640px)').matches);
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  renderer.setClearColor(0x111111, 0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  host.append(renderer.domElement);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, 1, .1, 100);
  camera.position.set(0, 10, 29);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enabled = mode === 'lab';
  controls.enableDamping = true;
  controls.enableZoom = false;
  controls.enablePan = false;
  controls.target.set(0, 0, 0);
  controls.update();

  const pmrem = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const environment = pmrem.fromScene(room, .04);
  scene.environment = environment.texture;
  room.dispose();
  pmrem.dispose();
  // Transmisión física: el material refracta el fondo opaco según IOR y espesor.
  const glassGeometry = new THREE.TorusKnotGeometry(5, 1.05, 200, 24, 2, 3);
  const glassMaterial = new THREE.MeshPhysicalMaterial({ color: 0xffffff, metalness: 0, roughness: .08, transmission: 1, thickness: 2, ior: 1.45, clearcoat: 1, clearcoatRoughness: .06, envMapIntensity: .65 });
  const glass = new THREE.Mesh(glassGeometry, glassMaterial);
  glass.rotation.set(.2, .15, -.35);
  scene.add(glass);
  const backdropGeometry = new THREE.PlaneGeometry(75, 65);
  const backdropMaterial = new THREE.ShaderMaterial({ vertexShader: backdropVertex, fragmentShader: backdropFragment });
  const backdrop = new THREE.Mesh(backdropGeometry, backdropMaterial);
  backdrop.position.z = -15;
  scene.add(backdrop);

  let field: ParticleField;
  const particleMaterial = new THREE.ShaderMaterial({ vertexShader: particleVertex, fragmentShader: particleFragment, uniforms: { uPixelRatio: { value: renderer.getPixelRatio() }, uLuminance: { value: config.luminance } }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
  const particles = new THREE.Points(new THREE.BufferGeometry(), particleMaterial);
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
    pointer = intersection ?? undefined;
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
    particles.geometry.attributes.position.needsUpdate = true;
    glass.rotation.y += dt * .08;
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
      particles.geometry.dispose(); particleMaterial.dispose(); glassGeometry.dispose(); glassMaterial.dispose();
      backdropGeometry.dispose(); backdropMaterial.dispose(); environment.dispose();
      scene.clear(); renderer.dispose(); renderer.domElement.remove();
    },
  };
}
export type VortexEngine = ReturnType<typeof createVortex>;
