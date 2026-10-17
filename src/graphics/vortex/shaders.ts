export const particleVertex = /* glsl */ `
  uniform float uPixelRatio;
  varying float vTint;
  void main() {
    vTint = clamp(position.y * 0.045 + position.x * 0.025 + 0.5, 0.0, 1.0);
    vec4 point = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = clamp(42.0 / max(1.0, -point.z), 0.9, 3.0) * uPixelRatio;
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
    vec3 tint = mix(vec3(0.72, 0.78, 0.86), vec3(1.0, 0.98, 0.94), vTint);
    gl_FragColor = vec4(tint, alpha);
  }
`;

export const starVertex = /* glsl */ `
  uniform float uPixelRatio;
  attribute float aSize;
  attribute float aBrightness;
  varying float vBrightness;
  void main() {
    vBrightness = aBrightness;
    gl_PointSize = aSize * uPixelRatio;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
export const starFragment = /* glsl */ `
  varying float vBrightness;
  void main() {
    float radius = length(gl_PointCoord - 0.5);
    float alpha = (1.0 - smoothstep(0.12, 0.5, radius)) * vBrightness;
    gl_FragColor = vec4(vec3(0.90, 0.92, 0.96), alpha);
  }
`;
