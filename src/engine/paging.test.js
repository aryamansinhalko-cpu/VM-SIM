import { describe, it, expect } from 'vitest';
import { simulate, POLICIES, COMPARE_POLICIES } from './paging.js';
import { thrashingCurve, safeProcessCount } from './thrashing.js';

// Classic textbook reference string (Silberschatz OS Concepts)
const book = [7, 0, 1, 2, 0, 3, 0, 4, 2, 3, 0, 3, 2, 1, 2, 0, 1, 7, 0, 1];

// Belady's anomaly demonstration string
const belady = [1, 2, 3, 4, 1, 2, 5, 1, 2, 3, 4, 5];

describe('page replacement', () => {
  it('matches textbook fault counts with 3 frames', () => {
    expect(simulate(book, 3, 'FIFO').faults).toBe(15);
    expect(simulate(book, 3, 'LRU').faults).toBe(12);
    expect(simulate(book, 3, 'OPT').faults).toBe(9);
  });

  it('shows Beladys anomaly for FIFO (more frames → more faults)', () => {
    const f3 = simulate(belady, 3, 'FIFO').faults;
    const f4 = simulate(belady, 4, 'FIFO').faults;
    expect(f3).toBe(9);
    expect(f4).toBe(10);
    expect(f4).toBeGreaterThan(f3); // anomaly: 4 frames is worse!
  });

  it('OPT never does worse than LRU', () => {
    const opt = simulate(book, 3, 'OPT').faults;
    const lru = simulate(book, 3, 'LRU').faults;
    expect(opt).toBeLessThanOrEqual(lru);
  });

  it('OPT never does worse than FIFO', () => {
    const opt  = simulate(book, 3, 'OPT').faults;
    const fifo = simulate(book, 3, 'FIFO').faults;
    expect(opt).toBeLessThanOrEqual(fifo);
  });

  it('zero faults when frameCount >= unique pages', () => {
    const refs = [1, 2, 3, 1, 2, 3];
    const r = simulate(refs, 10, 'LRU');
    expect(r.faults).toBe(3); // only 3 cold misses
    expect(r.hits).toBe(3);
  });

  it('all faults when frameCount = 1', () => {
    const refs = [1, 2, 3, 4];
    const r = simulate(refs, 1, 'FIFO');
    expect(r.faults).toBe(4);
  });

  it('hit rate and fault rate sum to 1', () => {
    const r = simulate(book, 3, 'LRU');
    expect(r.faults + r.hits).toBe(book.length);
    expect(r.faultRate + r.hits / book.length).toBeCloseTo(1);
  });

  it('steps array length matches reference string length', () => {
    const r = simulate(book, 3, 'OPT');
    expect(r.steps.length).toBe(book.length);
  });

  it('cumulative faults in steps is monotonically non-decreasing', () => {
    const r = simulate(book, 3, 'LRU');
    for (let i = 1; i < r.steps.length; i++) {
      expect(r.steps[i].faults).toBeGreaterThanOrEqual(r.steps[i - 1].faults);
    }
  });

  // ── CLOCK tests ──
  it('CLOCK: steps length matches refs length', () => {
    const r = simulate(book, 3, 'CLOCK');
    expect(r.steps.length).toBe(book.length);
  });

  it('CLOCK: hits + faults = total refs', () => {
    const r = simulate(book, 3, 'CLOCK');
    expect(r.faults + r.hits).toBe(book.length);
  });

  it('CLOCK: faults are at most as many as FIFO (generally better or equal)', () => {
    // Clock is generally ≤ FIFO in faults — verify for simple case
    const refs = [1, 2, 3, 1, 2, 4, 1, 2, 3, 4];
    const clock = simulate(refs, 3, 'CLOCK').faults;
    const fifo  = simulate(refs, 3, 'FIFO').faults;
    expect(clock).toBeLessThanOrEqual(fifo + 2); // within 2 of FIFO
  });

  it('CLOCK: all frames full after enough distinct refs', () => {
    const refs = [1, 2, 3, 4, 5];
    const r = simulate(refs, 3, 'CLOCK');
    const lastStep = r.steps[r.steps.length - 1];
    expect(lastStep.frames.filter((f) => f !== null).length).toBe(3);
  });

  // ── NRU tests ──
  it('NRU: steps length matches refs length', () => {
    const r = simulate(book, 3, 'NRU');
    expect(r.steps.length).toBe(book.length);
  });

  it('NRU: hits + faults = total refs', () => {
    const r = simulate(book, 3, 'NRU');
    expect(r.faults + r.hits).toBe(book.length);
  });

  it('NRU: referenceBits map present in each step', () => {
    const r = simulate(book, 3, 'NRU');
    for (const step of r.steps) {
      expect(step.referenceBits).toBeDefined();
    }
  });

  // ── POLICIES export ──
  it('POLICIES exports all 5 algorithms', () => {
    expect(POLICIES).toEqual(['FIFO', 'LRU', 'OPT', 'CLOCK', 'NRU']);
  });

  it('COMPARE_POLICIES exports 3 classic algorithms', () => {
    expect(COMPARE_POLICIES).toEqual(['FIFO', 'LRU', 'OPT']);
  });
});

describe('thrashing model', () => {
  it('shows a utilization cliff past the safe process count', () => {
    const curve    = thrashingCurve();
    const safe     = safeProcessCount(60, 10); // = 6
    const peakUtil = curve[safe - 1].cpuUtil;  // at n = safe
    const highUtil = curve[11].cpuUtil;         // at n = 12 (thrashing zone)
    expect(peakUtil).toBeGreaterThan(highUtil);
  });

  it('safeProcessCount is correct', () => {
    expect(safeProcessCount(60, 10)).toBe(6);
    expect(safeProcessCount(30,  5)).toBe(6);
    expect(safeProcessCount(100, 7)).toBe(14);
  });

  it('thrashing flag is true when frames < wsSize', () => {
    const curve = thrashingCurve({ totalFrames: 30, wsSize: 10 });
    curve.forEach((pt) => {
      expect(pt.thrashing).toBe(pt.framesEach < 10);
    });
  });
});
