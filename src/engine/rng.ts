// src/engine/rng.ts

export type RNG = () => number;

/**
 * Seeded 32-bit Mulberry32 PRNG.
 * Converts any number or string seed into reproducible random floats [0, 1).
 */
export function createRNG(seedInput: string | number = 42): RNG {
  let seed = 0;
  if (typeof seedInput === 'string') {
    for (let i = 0; i < seedInput.length; i++) {
      seed = (Math.imul(31, seed) + seedInput.charCodeAt(i)) | 0;
    }
  } else {
    seed = seedInput | 0;
  }

  let s = (seed === 0 ? 1337 : seed) >>> 0;

  return function next(): number {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function randomRange(min: number, max: number, rng: RNG): number {
  return min + rng() * (max - min);
}

export function randomChoice<T>(items: T[], rng: RNG): T {
  const index = Math.floor(rng() * items.length);
  return items[index];
}