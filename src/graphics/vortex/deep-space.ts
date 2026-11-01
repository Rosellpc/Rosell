import * as THREE from 'three';

/** Subtle procedural sky; an artistic backdrop, not an astronomical simulation. */
export function createDeepSpace() {
  const geometry = new THREE.SphereGeometry(98, 32, 20);
  const material = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    vertexShader: `
      varying vec3 vDirection;
      void main() {
        vDirection = normalize(position);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      varying vec3 vDirection;
      float hash(vec3 p) { return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453); }
      float noise(vec3 p) {
        vec3 i = floor(p), f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        return mix(mix(mix(hash(i), hash(i+vec3(1,0,0)), f.x),
                       mix(hash(i+vec3(0,1,0)), hash(i+vec3(1,1,0)), f.x), f.y),
                   mix(mix(hash(i+vec3(0,0,1)), hash(i+vec3(1,0,1)), f.x),
                       mix(hash(i+vec3(0,1,1)), hash(i+vec3(1,1,1)), f.x), f.y), f.z);
      }
      float cloud(vec3 p) {
        float total = 0.0, weight = 0.5;
        for (int i = 0; i < 4; i++) { total += noise(p) * weight; p = p * 2.03 + 7.1; weight *= 0.5; }
        return total;
      }
      void main() {
        vec3 d = normalize(vDirection);
        float lane = d.y + d.x * 0.46 + 0.16;
        float band = exp(-lane * lane * 20.0);
        float wisps = cloud(d * 10.0 + 3.0);
        float dust = smoothstep(0.42, 0.66, cloud(d * 19.0));
        float glow = band * smoothstep(0.24, 0.78, wisps) * (1.0 - dust * 0.8);
        vec3 color = mix(vec3(0.10, 0.14, 0.21), vec3(0.24, 0.20, 0.18), cloud(d * 4.0));
        gl_FragColor = vec4(vec3(0.003, 0.005, 0.009) + color * glow * 0.42, 1.0);
      }
    `,
  });
  return new THREE.Mesh(geometry, material);
}
