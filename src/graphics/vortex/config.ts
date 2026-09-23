export type VortexMode = 'hero' | 'lab';
export type CameraView = 'perspective' | 'top' | 'core';
export interface VortexConfig {
  particleCount: number;
  viscosity: number;
  vorticity: number;
  timeScale: number;
  luminance: number;
}
export function createConfig(mode: VortexMode, compact: boolean): VortexConfig {
  return { particleCount: compact ? 2000 : mode === 'hero' ? 5000 : 10000, viscosity: .12, vorticity: 2.5, timeScale: .4, luminance: .7 };
}
