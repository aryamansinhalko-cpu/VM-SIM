import { mulberry32 } from './rng.js';

/**
 * Parse a reference string from text input.
 * Accepts space or comma separated non-negative integers.
 * @param {string} text
 * @returns {number[]|null}
 */
export function parseRefs(text) {
  const parts = text.trim().split(/[\s,]+/).filter(Boolean);
  if (parts.length === 0) return null;
  const nums = parts.map(Number);
  if (nums.some((n) => !Number.isInteger(n) || n < 0)) return null;
  return nums;
}

/**
 * Generate a random reference string using a seeded PRNG.
 * @param {number} length - number of references
 * @param {number} pageCount - number of distinct pages
 * @param {number} seed
 * @returns {number[]}
 */
export function randomRefs(length, pageCount, seed = 1) {
  const rnd = mulberry32(seed);
  return Array.from({ length }, () => Math.floor(rnd() * pageCount));
}

/**
 * Locality model: every phaseLen references the process shifts to a new
 * working set of wsSize pages, and only touches pages inside it.
 * Models real-world temporal locality.
 * @param {number} length
 * @param {number} pageCount
 * @param {number} wsSize - working set size (pages actively used per phase)
 * @param {number} phaseLen - how many refs before changing working set
 * @param {number} seed
 * @returns {number[]}
 */
export function localityRefs(length, pageCount, wsSize, phaseLen = 200, seed = 1) {
  const rnd = mulberry32(seed);
  const refs = [];
  let ws = [];

  for (let i = 0; i < length; i++) {
    if (i % phaseLen === 0) {
      // Fisher-Yates shuffle of page pool, pick first wsSize as working set
      const pool = Array.from({ length: pageCount }, (_, k) => k);
      for (let k = pool.length - 1; k > 0; k--) {
        const j = Math.floor(rnd() * (k + 1));
        [pool[k], pool[j]] = [pool[j], pool[k]]; // shuffle
      }
      ws = pool.slice(0, wsSize);
    }
    refs.push(ws[Math.floor(rnd() * ws.length)]);
  }
  return refs;
}
