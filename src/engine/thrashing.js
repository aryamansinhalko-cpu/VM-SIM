import { localityRefs } from './refstring.js';
import { simulate } from './paging.js';

/**
 * Model the thrashing curve:
 * As the number of concurrent processes (n) increases, frames per process
 * shrink. Once frames/proc < wsSize, fault rates explode and CPU utilization crashes.
 *
 * CPU utilization formula:
 *   d = fraction of time each process is computing (not waiting on disk)
 *     = refs / (refs + faults * faultCost)
 *   cpuUtil = 1 - (1 - d)^n
 *     CPU is idle only when ALL n processes are waiting
 *
 * @param {object} opts
 * @returns {Array<{n, framesEach, faultRate, cpuUtil, thrashing}>}
 */
export function thrashingCurve({
  totalFrames = 60,
  wsSize = 10,
  maxProcs = 16,
  refsPerProc = 2000,
  faultCost = 100,
  pageCount = 200,
  phaseLen = 500,
  seed = 1,
} = {}) {
  const points = [];

  for (let n = 1; n <= maxProcs; n++) {
    const framesEach = Math.floor(totalFrames / n);
    if (framesEach < 1) break;

    let dSum = 0;
    let faultSum = 0;
    let refSum = 0;

    for (let p = 0; p < n; p++) {
      const refs = localityRefs(refsPerProc, pageCount, wsSize, phaseLen, seed + p);
      const r = simulate(refs, framesEach, 'LRU');
      // d: fraction of time this process is doing useful computation
      dSum += refs.length / (refs.length + r.faults * faultCost);
      faultSum += r.faults;
      refSum += refs.length;
    }

    const d = dSum / n; // average compute fraction across all processes
    points.push({
      n,
      framesEach,
      faultRate: faultSum / refSum,
      cpuUtil: 1 - Math.pow(1 - d, n),
      thrashing: framesEach < wsSize, // true when below working-set threshold
    });
  }

  return points;
}

/**
 * Working-set rule: maximum safe process count so that every running process
 * can keep its entire working set resident in memory.
 * @param {number} totalFrames
 * @param {number} wsSize
 * @returns {number}
 */
export const safeProcessCount = (totalFrames, wsSize) =>
  Math.floor(totalFrames / wsSize);
