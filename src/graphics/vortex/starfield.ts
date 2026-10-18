import * as THREE from 'three';
import { starVertex, starFragment } from './shaders';

export function createStarfield(pixelRatio: number) {
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
  const starMaterial = new THREE.ShaderMaterial({ vertexShader: starVertex, fragmentShader: starFragment, uniforms: { uPixelRatio: { value: pixelRatio } }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
  const stars = new THREE.Points(starGeometry, starMaterial);
  return stars;
}
