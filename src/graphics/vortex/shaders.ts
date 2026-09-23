export const particleVertex = /* glsl */ `
  uniform float uPixelRatio;
  void main() {
    vec4 point = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = clamp(24.0 / max(1.0, -point.z), 0.7, 2.0) * uPixelRatio;
    gl_Position = projectionMatrix * point;
  }
`;
export const particleFragment = /* glsl */ `
  uniform float uLuminance;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    float alpha = (1.0 - smoothstep(0.05, 0.5, d)) * uLuminance;
    gl_FragColor = vec4(vec3(0.74), alpha);
  }
`;
export const backdropVertex = /* glsl */ `
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`;
export const backdropFragment = /* glsl */ `
  varying vec2 vUv;
  void main() {
    float bands = sin(vUv.x * 24.0 + sin(vUv.y * 8.0) * 3.0);
    float soft = smoothstep(0.05, 1.0, bands) * 0.12;
    float fade = 1.0 - smoothstep(0.08, 0.55, length(vUv - 0.5));
    gl_FragColor = vec4(vec3(0.006 + soft * fade), 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;
