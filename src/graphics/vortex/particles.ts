import type { VortexConfig } from './config';

/** Campo procedural derivado del prototipo original; no resuelve Navier–Stokes. */
export class ParticleField {
  positions: Float32Array;
  velocities: Float32Array;
  constructor(readonly count: number) {
    this.positions = new Float32Array(count * 3);
    this.velocities = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) this.reset(i, true);
  }
  reset(i: number, initial = false) {
    const radius = initial ? 2 + Math.random() * 10 : 11 + Math.random() * 3;
    const angle = radius * .7 + (i % 3) * Math.PI * 2 / 3;
    const offset = i * 3;
    this.positions[offset] = Math.cos(angle) * radius + (Math.random() - .5) * 2;
    this.positions[offset + 1] = (Math.random() - .5) * (radius * .4 + 1);
    this.positions[offset + 2] = Math.sin(angle) * radius + (Math.random() - .5) * 2;
    this.velocities.fill(0, offset, offset + 3);
  }
  update(dt: number, config: VortexConfig, pointer?: { x: number; z: number }) {
    const smoothing = 1 - Math.exp(-8 * dt);
    for (let i = 0; i < this.count; i++) {
      const idx = i * 3;
      const x = this.positions[idx], y = this.positions[idx + 1], z = this.positions[idx + 2];
      const r = Math.hypot(x, z) + .001;
      const swirl = config.vorticity / (r + config.viscosity * 2.5);
      const inflow = .85 / (r * .45 + .25);
      let vx = -z * swirl - x / r * inflow;
      let vz = x * swirl - z / r * inflow;
      let vy = -y / (r + 1) * 1.5;
      if (r < 1.4) { vy += (y >= 0 ? 1 : -1) * (1 - r / 1.4) * 15; vx -= x * 2.8; vz -= z * 2.8; }
      if (pointer) {
        const dx = x - pointer.x, dz = z - pointer.z;
        const distance = Math.hypot(dx, dz);
        if (distance > .001 && distance < 4) { const force = (1 - distance / 4) * 4; vx += dx / distance * force; vz += dz / distance * force; }
      }
      this.velocities[idx] += (vx - this.velocities[idx]) * smoothing;
      this.velocities[idx + 1] += (vy - this.velocities[idx + 1]) * smoothing;
      this.velocities[idx + 2] += (vz - this.velocities[idx + 2]) * smoothing;
      for (let axis = 0; axis < 3; axis++) this.positions[idx + axis] += this.velocities[idx + axis] * dt;
      if (Math.abs(y) > 22 || Math.hypot(x, y, z) > 25) this.reset(i);
    }
  }
}
