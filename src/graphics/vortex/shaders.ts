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
    vec3 tint = mix(vec3(0.20, 0.80, 0.95), vec3(0.68, 0.40, 1.0), vTint);
    gl_FragColor = vec4(tint, alpha);
  }
`;
