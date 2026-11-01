import * as THREE from 'three';
import { starVertex, starFragment } from './shaders';

export function createStarfield(pixelRatio: number, deepSpace = false) {
  const compact = matchMedia('(max-width: 640px)').matches;
  const starCount = deepSpace ? (compact ? 1700 : 4800) : (compact ? 900 : 2200);
  const starPositions = new Float32Array(starCount * 3);
  const starSizes = new Float32Array(starCount);
  const starBrightness = new Float32Array(starCount);
  const starColors = new Float32Array(starCount * 3);
  const palette = [new THREE.Color('#b8d0ff'), new THREE.Color('#e3eaff'), new THREE.Color('#fff7e7'), new THREE.Color('#f3c6a0')];
  for (let i = 0; i < starCount; i++) {
    const angle = Math.random() * Math.PI * 2;
    let vertical = Math.random() * 2 - 1;
    if (deepSpace && i % 3 === 0) vertical = Math.max(-0.95, Math.min(0.95, -Math.cos(angle) * 0.3 + (Math.random() - 0.5) * 0.32));
    const radius = 45 + Math.random() * 45;
    const spread = Math.sqrt(1 - vertical * vertical);
    starPositions.set([Math.cos(angle) * spread * radius, vertical * radius, Math.sin(angle) * spread * radius], i * 3);
    starSizes[i] = .65 + Math.pow(Math.random(), 3) * 1.2;
    starBrightness[i] = deepSpace ? .14 + Math.pow(Math.random(), 3) * .78 : .2 + Math.pow(Math.random(), 2) * .55;
    if (deepSpace) starSizes[i] = .5 + Math.pow(Math.random(), 5) * 2.3;
    const color = deepSpace ? palette[Math.random() < 0.7 ? 1 : Math.floor(Math.random() * palette.length)] : new THREE.Color(0.90, 0.92, 0.96);
    starColors.set([color.r, color.g, color.b], i * 3);
  }
  const starGeometry = new THREE.BufferGeometry();
  starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
  starGeometry.setAttribute('aColor', new THREE.BufferAttribute(starColors, 3));
  starGeometry.setAttribute('aSize', new THREE.BufferAttribute(starSizes, 1));
  starGeometry.setAttribute('aBrightness', new THREE.BufferAttribute(starBrightness, 1));
  const starMaterial = new THREE.ShaderMaterial({ vertexShader: starVertex, fragmentShader: starFragment, uniforms: { uPixelRatio: { value: pixelRatio } }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
  const stars = new THREE.Points(starGeometry, starMaterial);
  return stars;
}
