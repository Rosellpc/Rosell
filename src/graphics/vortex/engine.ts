import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { createConfig, type VortexMode, type CameraView } from './config';
import { ParticleField } from './particles';
import { createStarfield } from './starfield';
import { particleVertex, particleFragment } from './shaders';

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

  const stars = createStarfield(renderer.getPixelRatio());
  scene.add(stars);

  let field: ParticleField;
  const particleMaterial = new THREE.ShaderMaterial({ vertexShader: particleVertex, fragmentShader: particleFragment, uniforms: { uPixelRatio: { value: renderer.getPixelRatio() }, uPointScale: { value: mode === 'hero' ? .85 : 1 }, uLuminance: { value: config.luminance } }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
  const particles = new THREE.Points(new THREE.BufferGeometry(), particleMaterial);
  if (mode === 'hero') {
    particles.position.x = matchMedia('(max-width: 640px)').matches ? 0 : 10;
    particles.position.addScaledVector(new THREE.Vector3().subVectors(particles.position, camera.position), .45);
    particles.rotation.z = -.25;
    particles.scale.setScalar(1.25);
  }
  particles.frustumCulled = false;
  scene.add(particles);
  function setDensity(count: number) {
    config.particleCount = Math.max(1000, Math.min(20000, Math.round(count)));
    field = new ParticleField(config.particleCount, mode === 'hero');
    particles.geometry.dispose();
    particles.geometry = new THREE.BufferGeometry();
    particles.geometry.setAttribute('position', new THREE.BufferAttribute(field.positions, 3).setUsage(THREE.DynamicDrawUsage));
  }
  setDensity(config.particleCount);

  // Four distant white streaks, behind the hero's vortex.
  const heroAsteroids = mode === 'hero' ? Array.from({ length: 4 }, (_, i) => {
    const depth = 100 + i * 10;
    const size = [.22, .38, .28, .45][i];
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0], 3));
    const material = new THREE.PointsMaterial({ color: 0xffffff, size, transparent: true, opacity: .75, depthWrite: false, blending: THREE.AdditiveBlending });
    const head = new THREE.Points(geometry, material);
    const tailGeometry = new THREE.BufferGeometry();
    tailGeometry.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0, 0, 7 + i * 2, 0], 3));
    tailGeometry.setAttribute('color', new THREE.Float32BufferAttribute([.6, .6, .6, 0, 0, 0], 3));
    const tailMaterial = new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: .4, depthWrite: false, blending: THREE.AdditiveBlending });
    const tail = new THREE.Line(tailGeometry, tailMaterial);
    const group = new THREE.Group();
    group.add(head, tail);
    group.position.z = -depth;
    camera.add(group);
    return { group, depth, phase: [0.18, .65, .4, .88][i], speed: .055 + i * .008, geometry, material, tailGeometry, tailMaterial };
  }) : [];
  if (heroAsteroids.length) scene.add(camera);
  function positionAsteroids() {
    heroAsteroids.forEach((asteroid, i) => {
      const halfHeight = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * asteroid.depth;
      asteroid.group.position.x = [-.82, -.32, .38, .82][i] * halfHeight * camera.aspect;
      asteroid.group.position.y = (1.25 - asteroid.phase * 2.5) * halfHeight;
    });
  }

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
    heroAsteroids.forEach(asteroid => { asteroid.phase = (asteroid.phase + dt * asteroid.speed) % 1; });
    positionAsteroids();
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
    positionAsteroids();
    if (mode === 'hero') {
      // Project the jet axis to the actual canvas edge, including its tilt.
      particles.updateMatrixWorld(true);
      camera.updateMatrixWorld(true);
      let near = 0, far = 100;
      const endpoint = new THREE.Vector3();
      for (let i = 0; i < 24; i++) {
        const distance = (near + far) / 2;
        endpoint.set(0, -distance, 0).applyMatrix4(particles.matrixWorld).project(camera);
        if (endpoint.y < -1) far = distance; else near = distance;
      }
      field.lowerBoundary = -far;
    }
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
      stars.geometry.dispose(); stars.material.dispose();
      heroAsteroids.forEach(asteroid => {
        asteroid.geometry.dispose(); asteroid.material.dispose();
        asteroid.tailGeometry.dispose(); asteroid.tailMaterial.dispose();
        camera.remove(asteroid.group);
      });
      scene.clear(); renderer.dispose(); renderer.domElement.remove();
    },
  };
}
export type VortexEngine = ReturnType<typeof createVortex>;
