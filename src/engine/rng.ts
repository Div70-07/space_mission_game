// Owner: A. Random number generation utilities.
export function createRng(seed: number) {
  let s = seed
  return function next(): number {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  }
}
