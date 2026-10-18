export const cometVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const cometHeadFragment = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vec2 p = (vUv - vec2(0.5, 0.46)) * vec2(1.0, 1.25);
    float r = length(p);
    float core = exp(-r * r * 210.0);
    float coma = exp(-r * r * 24.0) * 0.32;
    float edge = 1.0 - smoothstep(0.28, 0.48, r);
    gl_FragColor = vec4(vec3(1.0), (core + coma) * edge);
  }
`;

export const cometTailFragment = /* glsl */ `
  varying vec2 vUv;
  void main() {
    float t = vUv.y;
    float center = 0.5 + sin(t * 2.6) * t * 0.12;
    float width = mix(0.055, 0.36, t);
    float x = (vUv.x - center) / width;
    float plume = exp(-x * x * 3.5);
    float spine = exp(-x * x * 42.0) * 0.35;
    float filaments = 0.8 + 0.2 * sin(vUv.x * 70.0 + t * 8.0);
    float fade = pow(1.0 - t, 1.7) * smoothstep(0.0, 0.035, t);
    float edge = smoothstep(0.0, 0.08, vUv.x) * (1.0 - smoothstep(0.92, 1.0, vUv.x));
    gl_FragColor = vec4(vec3(0.94, 0.96, 1.0), (plume * 0.45 * filaments + spine) * fade * edge);
  }
`;
