export const particleVertex = /* glsl */ `
  uniform float uPixelRatio;
  varying float vTint;
  void main() {
    vTint = clamp(position.y * 0.045 + position.x * 0.025 + 0.5, 0.0, 1.0);
    vec4 point = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = clamp(24.0 / max(1.0, -point.z), 0.7, 2.0) * uPixelRatio;
    gl_Position = projectionMatrix * point;
  }
`;
export const particleFragment = /* glsl */ `
  uniform float uLuminance;
  varying float vTint;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    float alpha = (1.0 - smoothstep(0.05, 0.5, d)) * uLuminance;
    vec3 tint = mix(vec3(0.20, 0.80, 0.95), vec3(0.68, 0.40, 1.0), vTint);
    gl_FragColor = vec4(tint, alpha);
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
    vec3 tint = mix(vec3(0.06, 0.55, 0.75), vec3(0.48, 0.16, 0.80), vUv.x);
    gl_FragColor = vec4(vec3(0.006) + tint * (soft * 2.0 + 0.06) * fade, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;
