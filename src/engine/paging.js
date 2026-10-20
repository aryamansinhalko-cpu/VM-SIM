/**
 * Page replacement simulation engine.
 * Supports FIFO, LRU, Optimal (OPT), Clock (Second-Chance), and NRU policies.
 * Pure functions: no React, no side effects — easy to test.
 */

/**
 * Choose the victim slot index using the given policy.
 * @param {'FIFO'|'LRU'|'OPT'|'CLOCK'|'NRU'} policy
 * @param {Array<number|null>} slots - current frame contents
 * @param {{ refs: number[], t: number, loadedAt: Map, lastUsed: Map, clockHand: number, referenceBit: Map, modifiedBit: Map }} ctx
 * @returns {{ victimIdx: number, newClockHand: number }}
 */
function victimSlot(policy, slots, ctx) {
  if (policy === 'FIFO') {
    // Evict the page loaded longest ago (smallest loadedAt time)
    let best = 0;
    for (let i = 1; i < slots.length; i++) {
      if (ctx.loadedAt.get(slots[i]) < ctx.loadedAt.get(slots[best])) best = i;
    }
    return { victimIdx: best, newClockHand: ctx.clockHand };
  }

  if (policy === 'LRU') {
    // Evict the page used least recently (smallest lastUsed time)
    let best = 0;
    for (let i = 1; i < slots.length; i++) {
      if (ctx.lastUsed.get(slots[i]) < ctx.lastUsed.get(slots[best])) best = i;
    }
    return { victimIdx: best, newClockHand: ctx.clockHand };
  }

  if (policy === 'OPT') {
    // Evict the page whose *next* use is farthest in the future
    const score = (page) => {
      const next = ctx.refs.indexOf(page, ctx.t + 1);
      return next === -1 ? Infinity : next;
    };
    let best = 0;
    for (let i = 1; i < slots.length; i++) {
      if (score(slots[i]) > score(slots[best])) best = i;
    }
    return { victimIdx: best, newClockHand: ctx.clockHand };
  }

  if (policy === 'CLOCK') {
    // Second-chance (Clock) algorithm:
    // Circular sweep; if reference bit = 1, give second chance (clear to 0); if 0, evict.
    let hand = ctx.clockHand;
    while (true) {
      const page = slots[hand];
      if (ctx.referenceBit.get(page)) {
        ctx.referenceBit.set(page, false); // second chance — clear and move on
        hand = (hand + 1) % slots.length;
      } else {
        const victimIdx = hand;
        return { victimIdx, newClockHand: (hand + 1) % slots.length };
      }
    }
  }

  if (policy === 'NRU') {
    // Not Recently Used: classify pages into 4 classes by (referenced, modified) bits.
    // Class 0 (00) is best victim; class 3 (11) is worst.
    // Evict lowest-class page; within same class pick FIFO order (loadedAt).
    const classOf = (page) => {
      const r = ctx.referenceBit.get(page) ? 1 : 0;
      const m = ctx.modifiedBit.get(page)  ? 1 : 0;
      return r * 2 + m; // 0=!r!m, 1=!rm, 2=r!m, 3=rm
    };
    let best = 0;
    for (let i = 1; i < slots.length; i++) {
      const ci = classOf(slots[i]);
      const cb = classOf(slots[best]);
      if (ci < cb || (ci === cb && ctx.loadedAt.get(slots[i]) < ctx.loadedAt.get(slots[best]))) {
        best = i;
      }
    }
    return { victimIdx: best, newClockHand: ctx.clockHand };
  }

  throw new Error(`Unknown policy: ${policy}`);
}

/**
 * Simulate page replacement for one process.
 * @param {number[]} refs - reference string
 * @param {number} frameCount - physical frames available
 * @param {'FIFO'|'LRU'|'OPT'|'CLOCK'|'NRU'} policy
 * @returns {{
 *   policy: string, frameCount: number,
 *   steps: Array<{t,page,hit,slot,evicted,frames,faults,referenceBits?,modifiedBits?}>,
 *   faults: number, hits: number, faultRate: number
 * }}
 */
export function simulate(refs, frameCount, policy) {
  const slots        = Array(frameCount).fill(null);
  const loadedAt     = new Map(); // page → time it was loaded
  const lastUsed     = new Map(); // page → last reference time
  const referenceBit = new Map(); // page → boolean (CLOCK / NRU)
  const modifiedBit  = new Map(); // page → boolean (NRU only — we randomly assign on load)
  const steps        = [];
  let faults         = 0;
  let clockHand      = 0;

  refs.forEach((page, t) => {
    let slot = slots.indexOf(page);
    const hit = slot !== -1;
    let evicted = null;

    if (!hit) {
      faults++;
      slot = slots.indexOf(null); // find free frame first

      if (slot === -1) {
        // All frames full — pick victim
        const ctx = { refs, t, loadedAt, lastUsed, clockHand, referenceBit, modifiedBit };
        const result = victimSlot(policy, slots, ctx);
        slot         = result.victimIdx;
        clockHand    = result.newClockHand;
        evicted      = slots[slot];
        loadedAt.delete(evicted);
        referenceBit.delete(evicted);
        modifiedBit.delete(evicted);
      }

      slots[slot] = page;
      loadedAt.set(page, t);
      referenceBit.set(page, false);
      // NRU: randomly decide if a newly loaded page is "modified" (written)
      modifiedBit.set(page, Math.random() < 0.4);
    } else {
      // Hit: set reference bit
      referenceBit.set(page, true);
    }

    lastUsed.set(page, t);

    steps.push({
      t,
      page,
      hit,
      slot,
      evicted,
      frames: [...slots],           // immutable snapshot
      faults,                       // cumulative
      referenceBits: new Map(referenceBit),
      modifiedBits:  new Map(modifiedBit),
    });
  });

  return {
    policy,
    frameCount,
    steps,
    faults,
    hits: refs.length - faults,
    faultRate: refs.length ? faults / refs.length : 0,
  };
}

/** All supported replacement policies */
export const POLICIES = ['FIFO', 'LRU', 'OPT', 'CLOCK', 'NRU'];

/** Policies shown in the main simulator (subset of all) */
export const COMPARE_POLICIES = ['FIFO', 'LRU', 'OPT'];
