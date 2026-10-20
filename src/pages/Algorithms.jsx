/**
 * Algorithms page — detailed cards for each page replacement algorithm.
 * Includes: explanation, pseudocode, example trace, pros/cons.
 */
import { useState } from 'react';
import { simulate } from '../engine/paging.js';
import { ChevronDown, ChevronUp } from 'lucide-react';

const EXAMPLE_REFS   = [7, 0, 1, 2, 0, 3, 0, 4, 2, 3, 0, 3];
const EXAMPLE_FRAMES = 3;

const ALGORITHMS = [
  {
    id: 'FIFO',
    name: 'FIFO',
    full: 'First-In, First-Out',
    color: '#3b82f6',
    tagline: 'Evict the page that has been in memory the longest.',
    description: `FIFO is the simplest page replacement algorithm. It maintains a queue of pages in memory, 
    ordered by arrival time. When a page fault occurs and all frames are full, the page at the front of the 
    queue (the oldest resident) is evicted and the new page is added to the back.`,
    pseudocode: `function FIFO(refs, frameCount):
  frames  = []          // ordered list (front = oldest)
  faults  = 0
  
  for each page in refs:
    if page in frames:
      record HIT
    else:
      faults += 1
      if len(frames) < frameCount:
        frames.append(page)
      else:
        evict frames[0]   // evict oldest
        frames.pop(0)
        frames.append(page)
      record FAULT
  
  return faults`,
    pros: [
      'Extremely simple to implement',
      'Low overhead — just a queue',
      'Fair: every page gets equal residency time',
    ],
    cons: [
      "Belady's Anomaly: more frames can cause MORE faults",
      'Ignores usage frequency — evicts heavily-used pages',
      'Poor real-world performance',
    ],
    anomaly: "Belady's Anomaly: with 3 frames → 9 faults on classic string; with 4 frames → 10 faults (worse!)",
  },
  {
    id: 'LRU',
    name: 'LRU',
    full: 'Least Recently Used',
    color: '#10b981',
    tagline: 'Evict the page that has not been used for the longest time.',
    description: `LRU exploits temporal locality: if a page was used recently, it's likely to be used again soon. 
    When a fault occurs, it evicts the page whose most recent use was the farthest in the past. 
    LRU approximates the optimal algorithm and is widely used in practice (often via hardware reference bits or stacks).`,
    pseudocode: `function LRU(refs, frameCount):
  frames   = {}          // page → last used time
  faults   = 0
  
  for t, page in enumerate(refs):
    if page in frames:
      frames[page] = t   // update last-used time
      record HIT
    else:
      faults += 1
      if len(frames) < frameCount:
        frames[page] = t
      else:
        victim = min(frames, key=frames.get)
        del frames[victim]
        frames[page] = t
      record FAULT
  
  return faults`,
    pros: [
      'Good approximation of OPT in practice',
      'Exploits temporal locality effectively',
      'No Belady\'s Anomaly',
      'Widely used: Linux, Windows use LRU approximations',
    ],
    cons: [
      'Hardware support needed for exact implementation (expensive)',
      'Software LRU requires a timestamp per page',
      'More overhead than FIFO',
    ],
    anomaly: null,
  },
  {
    id: 'OPT',
    name: 'OPT',
    full: 'Optimal (Belady\'s Algorithm)',
    color: '#f59e0b',
    tagline: 'Evict the page that will not be used for the longest time in the future.',
    description: `OPT (also called Belady's MIN algorithm) is the theoretically optimal page replacement policy. 
    It looks ahead into the future reference string and evicts the page whose next use is farthest away 
    (or never used again). It cannot be implemented in real systems because future references are unknown — 
    but it serves as the lower bound for comparison.`,
    pseudocode: `function OPT(refs, frameCount):
  frames = []
  faults = 0
  
  for t, page in enumerate(refs):
    if page in frames:
      record HIT
    else:
      faults += 1
      if len(frames) < frameCount:
        frames.append(page)
      else:
        // Find page with farthest next use
        victim = page in frames with
                 max(next occurrence after t,
                     or Infinity if never used)
        frames.remove(victim)
        frames.append(page)
      record FAULT
  
  return faults`,
    pros: [
      'Provably optimal: fewest possible page faults',
      'Perfect theoretical baseline for comparison',
      'No Belady\'s Anomaly',
    ],
    cons: [
      'Requires knowledge of future references — impossible in real systems',
      'Only useful as a benchmark',
    ],
    anomaly: null,
  },
  {
    id: 'CLOCK',
    name: 'Clock',
    full: 'Clock (Second-Chance)',
    color: '#a78bfa',
    tagline: 'FIFO with a second chance — pages with a set reference bit get one more cycle.',
    description: `The Clock algorithm is a practical approximation of LRU that uses a circular buffer of frames 
    and a hardware reference bit per page. When a fault occurs, the clock hand sweeps: if the current 
    page's reference bit is 1 it's cleared (second chance) and the hand advances; if it's 0 the page is 
    evicted. Pages that are actively used keep their reference bits set and survive multiple sweeps.`,
    pseudocode: `function CLOCK(refs, frameCount):
  frames     = [null] * frameCount
  refBit     = {}      // page → bool
  hand       = 0       // clock hand position
  faults     = 0
  
  for page in refs:
    if page in frames:
      refBit[page] = True   // mark as recently used
      record HIT
    else:
      faults += 1
      // Find victim with clock sweep
      while refBit[frames[hand]]:
        refBit[frames[hand]] = False   // second chance
        hand = (hand + 1) % frameCount
      
      evict frames[hand]
      frames[hand] = page
      refBit[page] = False
      hand = (hand + 1) % frameCount
      record FAULT
  
  return faults`,
    pros: [
      'Efficient hardware implementation (single reference bit)',
      'Better than FIFO, close to LRU in performance',
      'Used in real OS kernels (Linux uses an enhanced version)',
      'Low overhead compared to true LRU',
    ],
    cons: [
      'Less accurate than true LRU',
      'Clock hand position can cause uneven eviction patterns',
    ],
    anomaly: null,
  },
  {
    id: 'NRU',
    name: 'NRU',
    full: 'Not Recently Used',
    color: '#f472b6',
    tagline: 'Classify pages by (referenced, modified) bits and evict the lowest class.',
    description: `NRU classifies pages into 4 classes based on two hardware bits:
    the Reference bit (R) — set on any access — and the Modified bit (M) — set on a write.
    Class 0 (R=0,M=0) is the best victim; Class 3 (R=1,M=1) is worst (recently used and dirty).
    Periodically, the OS clears all R bits. This is very cheap to implement and gives reasonable results.`,
    pseudocode: `Classes (priority for eviction, lowest first):
  Class 0: R=0, M=0  — not referenced, not modified  ← evict first
  Class 1: R=0, M=1  — not referenced, modified
  Class 2: R=1, M=0  — referenced, not modified
  Class 3: R=1, M=1  — referenced, modified           ← evict last

function NRU(refs, frameCount):
  frames    = []
  refBit    = {}
  modBit    = {}    // set randomly on load (simulates writes)
  faults    = 0
  
  for page in refs:
    if page in frames:
      refBit[page] = True
      record HIT
    else:
      faults += 1
      if len(frames) < frameCount:
        frames.append(page)
      else:
        // Find lowest-class page, break ties by FIFO
        victim = min(frames, key=lambda p:
                   (refBit[p]*2 + modBit[p], loadedAt[p]))
        frames.remove(victim)
        frames.append(page)
      refBit[page] = False
      modBit[page] = random()   // simulated write probability
      record FAULT
  
  return faults`,
    pros: [
      'Very simple to implement in hardware',
      'Only 2 bits per page required',
      'Good enough performance for many workloads',
      'Handles dirty-page cost implicitly (prefer clean evictions)',
    ],
    cons: [
      'Coarser than LRU — many pages may be in the same class',
      'Requires periodic R-bit clearing by the OS',
      'Random tie-breaking within a class',
    ],
    anomaly: null,
  },
];

function TraceTable({ algoId }) {
  const result = simulate(EXAMPLE_REFS, EXAMPLE_FRAMES, algoId);
  return (
    <div style={{ overflowX: 'auto', marginTop: '0.75rem' }}>
      <table style={{ borderCollapse: 'separate', borderSpacing: '2px', fontSize: '0.78rem', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', padding: '0.3rem 0.6rem', color: 'var(--text-3)', fontSize: '0.7rem', textTransform: 'uppercase' }}>Ref →</th>
            {EXAMPLE_REFS.map((r, i) => (
              <th key={i} style={{ padding: '0.3rem 0.5rem', background: 'var(--surface-3)', borderRadius: 4, color: 'var(--text-2)', minWidth: '2rem', textAlign: 'center' }}>{r}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: EXAMPLE_FRAMES }, (_, f) => (
            <tr key={f}>
              <th style={{ textAlign: 'left', padding: '0.25rem 0.6rem', color: 'var(--text-3)', fontSize: '0.7rem' }}>F{f}</th>
              {result.steps.map((s, i) => (
                <td key={i} style={{
                  padding: '0.25rem 0.5rem', textAlign: 'center', borderRadius: 4,
                  background: s.slot === f && !s.hit ? 'var(--fault-dim)' :
                              s.hit && s.slot === f ? 'var(--hit-dim)' : 'var(--surface-2)',
                  color: s.slot === f && !s.hit ? 'var(--fault)' :
                         s.hit && s.slot === f ? 'var(--hit)' : 'var(--text-2)',
                  border: s.slot === f && s.evicted !== null && !s.hit ? '1.5px solid var(--fault)' : '1px solid var(--border)',
                  fontWeight: (s.slot === f) ? 600 : 400,
                }}>
                  {s.frames[f] ?? ''}
                </td>
              ))}
            </tr>
          ))}
          <tr>
            <th style={{ textAlign: 'left', padding: '0.25rem 0.6rem', color: 'var(--text-3)', fontSize: '0.7rem' }}>H/F</th>
            {result.steps.map((s, i) => (
              <td key={i} style={{
                padding: '0.25rem 0.5rem', textAlign: 'center', borderRadius: 4, fontWeight: 700,
                background: s.hit ? 'var(--hit-dim)' : 'var(--fault-dim)',
                color: s.hit ? 'var(--hit)' : 'var(--fault)',
                border: `1px solid ${s.hit ? 'rgba(16,185,129,0.2)' : 'rgba(244,63,94,0.2)'}`,
              }}>
                {s.hit ? 'H' : 'F'}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
      <p style={{ fontSize: '0.73rem', color: 'var(--text-3)', marginTop: '0.5rem' }}>
        {EXAMPLE_FRAMES} frames · {result.faults} faults · {result.hits} hits ·{' '}
        {(result.faultRate * 100).toFixed(0)}% fault rate
      </p>
    </div>
  );
}

function AlgoCard({ algo }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="algo-card">
      <div className="algo-card-header" onClick={() => setExpanded((v) => !v)}>
        <div className="algo-card-title-row">
          <span className="algo-badge" style={{ background: `${algo.color}18`, color: algo.color, border: `1px solid ${algo.color}30` }}>
            {algo.name}
          </span>
          <div>
            <h3 className="algo-name">{algo.full}</h3>
            <p className="algo-tagline">{algo.tagline}</p>
          </div>
        </div>
        <button className="algo-expand-btn">
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {expanded && (
        <div className="algo-card-body">
          <p className="algo-description">{algo.description}</p>

          {algo.anomaly && (
            <div style={{ background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.25)', borderRadius: 8, padding: '0.7rem 1rem', marginBottom: '1rem', fontSize: '0.82rem', color: '#fca5a5' }}>
              ⚠ {algo.anomaly}
            </div>
          )}

          <div className="algo-two-col">
            {/* Pseudocode */}
            <div>
              <h4 className="algo-section-label">Pseudocode</h4>
              <pre className="algo-code">{algo.pseudocode}</pre>
            </div>

            {/* Pros / Cons */}
            <div>
              <h4 className="algo-section-label">Pros</h4>
              <ul className="algo-list algo-pros">
                {algo.pros.map((p, i) => <li key={i}>{p}</li>)}
              </ul>
              <h4 className="algo-section-label" style={{ marginTop: '0.75rem' }}>Cons</h4>
              <ul className="algo-list algo-cons">
                {algo.cons.map((c, i) => <li key={i}>{c}</li>)}
              </ul>
            </div>
          </div>

          {/* Example trace */}
          <h4 className="algo-section-label" style={{ marginTop: '1rem' }}>
            Example Trace — refs: [{EXAMPLE_REFS.join(', ')}] — {EXAMPLE_FRAMES} frames
          </h4>
          <TraceTable algoId={algo.id} />
        </div>
      )}
    </div>
  );
}

export default function Algorithms() {
  return (
    <div className="page-content">
      <div className="page-hero-small">
        <h1>Algorithms</h1>
        <p>Deep dives into all five page replacement policies — click any card to expand.</p>
      </div>
      <div className="algo-list-outer">
        {ALGORITHMS.map((a) => (
          <AlgoCard key={a.id} algo={a} />
        ))}
      </div>
    </div>
  );
}
