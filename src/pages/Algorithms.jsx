/**
 * Algorithms — In-depth architectural analysis of all 5 replacement policies.
 * Includes complete theoretical derivations, pseudocode, interactive traces, and trade-offs.
 */
import { useState } from 'react';
import { simulate } from '../engine/paging.js';
import {
  ChevronDown, ChevronUp, Layers, CheckCircle2,
  XCircle, AlertTriangle, Code, Play
} from 'lucide-react';
import { Link } from 'react-router-dom';

const EXAMPLE_REFS   = [7, 0, 1, 2, 0, 3, 0, 4, 2, 3, 0, 3];
const EXAMPLE_FRAMES = 3;

const ALGORITHMS = [
  {
    id: 'FIFO',
    name: 'FIFO',
    full: 'First-In, First-Out',
    color: '#863bff',
    badge: 'Elementary Policy',
    tagline: 'Evicts the page that has been resident in physical memory the longest.',
    description: `FIFO is the most straightforward page replacement policy. It maintains a strict queue of frames ordered by their arrival timestamp. When a page fault occurs and all frame slots are occupied, the oldest resident at the front of the queue is chosen as the victim.`,
    pseudocode: `function FIFO(refs, frameCount):
  queue = []        // FIFO queue tracking arrival order
  faults = 0

  for page in refs:
    if page in queue:
      record HIT
    else:
      faults += 1
      if len(queue) < frameCount:
        queue.append(page)
      else:
        victim = queue.pop(0)   // evict oldest resident
        queue.append(page)
      record FAULT

  return faults`,
    pros: [
      'Extremely simple O(1) queue implementation',
      'Minimal hardware complexity or register overhead',
      'Fair residency: every page receives an identical time window before eviction',
    ],
    cons: [
      "Vulnerable to Belady's Anomaly: allocating more frames can increase faults",
      'Disregards temporal frequency: heavily accessed hot pages get evicted prematurely',
      'Poor real-world hit ratios on clustered memory access traces',
    ],
    anomaly: "Belady's Anomaly: On sequence 1 2 3 4 1 2 5 1 2 3 4 5, 3 frames yields 9 faults, while 4 frames increases faults to 10.",
  },
  {
    id: 'LRU',
    name: 'LRU',
    full: 'Least Recently Used',
    color: '#10b981',
    badge: 'Locality Benchmark',
    tagline: 'Evicts the page that has not been referenced for the longest duration.',
    description: `LRU exploits the principle of temporal locality: if a memory page was referenced recently, it is statistically probable to be accessed again in subsequent instructions. LRU serves as the gold standard for software cache replacement.`,
    pseudocode: `function LRU(refs, frameCount):
  lastUsed = {}     // page -> last accessed timestamp
  faults = 0

  for t, page in enumerate(refs):
    if page in lastUsed:
      lastUsed[page] = t   // refresh temporal access mark
      record HIT
    else:
      faults += 1
      if len(lastUsed) < frameCount:
        lastUsed[page] = t
      else:
        victim = min(lastUsed, key=lastUsed.get)  // least recent
        del lastUsed[victim]
        lastUsed[page] = t
      record FAULT

  return faults`,
    pros: [
      'Excellent hit ratios on workloads exhibiting temporal locality',
      'Immune to Belady\'s Anomaly (belongs to the Stack Algorithm class)',
      'Basis of virtually all modern production kernel page replacement heuristics',
    ],
    cons: [
      'High hardware overhead to maintain precise timestamps or double-linked stack',
      'Pure LRU is too expensive for modern high-frequency virtual memory hardware',
      'Kernel engines use approximations (Clock, 2Q, or active/inactive lists)',
    ],
    anomaly: null,
  },
  {
    id: 'OPT',
    name: 'OPT',
    full: "Belady's Optimal Algorithm (MIN)",
    color: '#ffb800',
    badge: 'Theoretical Limit',
    tagline: 'Evicts the page whose next memory reference lies farthest in the future.',
    description: `Discovered by Laszlo Belady in 1966, OPT achieves the mathematical minimum number of page faults on any fixed reference sequence. It acts as the theoretical benchmark against which all practical algorithms are measured.`,
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
        // Identify frame resident with farthest future reference
        victim = max(frames, key=lambda p: next_use(refs, p, after=t))
        frames.remove(victim)
        frames.append(page)
      record FAULT

  return faults`,
    pros: [
      'Mathematically proven lower bound for page faults',
      'Immune to Belady\'s Anomaly (Stack Algorithm)',
      'Provides objective standard for calculating algorithmic efficiency',
    ],
    cons: [
      'Requires future knowledge of memory instructions — impossible in general-purpose OS kernels',
      'Usable only for offline trace analysis and compiler simulations',
    ],
    anomaly: null,
  },
  {
    id: 'CLOCK',
    name: 'CLOCK',
    full: 'Clock (Second-Chance Heuristic)',
    color: '#c084fc',
    badge: 'Production Kernel Standard',
    tagline: 'Circular frame buffer where pages with a set reference bit receive a second chance.',
    description: `The Clock algorithm provides an elegant O(1) approximation of LRU. It maintains a circular list of physical frames and a single hardware reference bit per frame. An advancing clock hand checks the bit: if 1, it clears it to 0 and advances; if 0, the frame is immediately selected as the victim.`,
    pseudocode: `function CLOCK(refs, frameCount):
  frames = [null] * frameCount
  refBit = {}
  hand = 0
  faults = 0

  for page in refs:
    if page in frames:
      refBit[page] = 1    // hardware sets reference bit on access
      record HIT
    else:
      faults += 1
      while refBit[frames[hand]] == 1:
        refBit[frames[hand]] = 0   // second chance granted
        hand = (hand + 1) % frameCount

      evict frames[hand]
      frames[hand] = page
      refBit[page] = 0
      hand = (hand + 1) % frameCount
      record FAULT

  return faults`,
    pros: [
      'Extremely lightweight: requires only 1 reference bit per page frame',
      'Constant-time O(1) amortized victim selection',
      'Approximates LRU hit rates without expensive timestamping hardware',
    ],
    cons: [
      'Degenerates to standard FIFO if all reference bits are persistently 0',
      'Clock sweep overhead increases if memory pressure is severe',
    ],
    anomaly: null,
  },
  {
    id: 'NRU',
    name: 'NRU',
    full: 'Not Recently Used (R/M Classification)',
    color: '#47bfff',
    badge: 'Hardware-Bit Class Policy',
    tagline: 'Classifies resident pages into 4 priority categories using Referenced and Modified bits.',
    description: `NRU classifies pages into 4 classes based on hardware bits: Reference (R) and Modified/Dirty (M). Class 0 (0,0) represents an unreferenced, clean page (the cheapest victim), while Class 3 (1,1) is active and dirty (most expensive to evict because it requires disk writeback).`,
    pseudocode: `Page Classes:
  Class 0: R=0, M=0  (Unreferenced, Clean)    <- Preferred victim
  Class 1: R=0, M=1  (Unreferenced, Dirty)
  Class 2: R=1, M=0  (Referenced, Clean)
  Class 3: R=1, M=1  (Referenced, Dirty)      <- Evicted last

function NRU(refs, frameCount):
  // When fault occurs:
  // 1. Scan frames and find lowest non-empty class
  // 2. Pick victim from lowest class (FIFO or random)
  // 3. Periodically, OS clock interrupt clears all R bits`,
    pros: [
      'Intrinsically accounts for disk I/O costs by preferring clean pages',
      'Very simple to implement with standard MMU hardware status bits',
      'Robust performance across diverse application profiles',
    ],
    cons: [
      'Coarse classification: all pages in Class 0 are treated equally',
      'Requires periodic OS timer interrupt to clear Reference bits',
    ],
    anomaly: null,
  },
];

function TraceTable({ algoId }) {
  const result = simulate(EXAMPLE_REFS, EXAMPLE_FRAMES, algoId);
  return (
    <div style={{ overflowX: 'auto', marginTop: '0.85rem' }}>
      <table className="timeline" style={{ fontSize: '0.74rem' }}>
        <thead>
          <tr>
            <th className="row-label">Ref →</th>
            {EXAMPLE_REFS.map((r, i) => (
              <th key={i} style={{ minWidth: '2.2rem' }}>{r}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: EXAMPLE_FRAMES }, (_, f) => (
            <tr key={f}>
              <th className="row-label">F{f}</th>
              {result.steps.map((s, i) => {
                const isVictim = s.slot === f && s.evicted !== null && !s.hit;
                const isAlloc = s.slot === f && !s.hit;
                const isHit = s.hit && s.slot === f;
                return (
                  <td
                    key={i}
                    className={isVictim ? 'tl-fault tl-victim' : isAlloc ? 'tl-fault' : isHit ? 'tl-hit' : ''}
                  >
                    {s.frames[f] ?? '—'}
                  </td>
                );
              })}
            </tr>
          ))}
          <tr>
            <th className="row-label">H/F</th>
            {result.steps.map((s, i) => (
              <td key={i} className={s.hit ? 'tl-hit' : 'tl-fault'}>
                {s.hit ? 'H' : 'F'}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
      <div style={{ display: 'flex', gap: '1rem', fontSize: '0.76rem', color: 'var(--text-3)', marginTop: '0.65rem', fontFamily: 'var(--font-mono)' }}>
        <span>Faults: <strong style={{ color: 'var(--fault-light)' }}>{result.faults}</strong></span>
        <span>Hits: <strong style={{ color: 'var(--hit-light)' }}>{result.hits}</strong></span>
        <span>Fault Rate: <strong style={{ color: 'var(--primary-light)' }}>{(result.faultRate * 100).toFixed(1)}%</strong></span>
      </div>
    </div>
  );
}

function AlgoAccordionCard({ algo }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="card" style={{ marginBottom: '1.25rem', padding: '1.5rem' }}>
      <div
        onClick={() => setOpen(!open)}
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: 'pointer',
          userSelect: 'none'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontWeight: 800,
              fontSize: '0.95rem',
              color: algo.color,
              background: `${algo.color}18`,
              border: `1px solid ${algo.color}35`,
              borderRadius: 'var(--r-full)',
              padding: '0.25rem 0.85rem'
            }}
          >
            {algo.name}
          </span>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>
              {algo.full}
            </h3>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-3)', marginTop: '0.15rem' }}>
              {algo.tagline}
            </p>
          </div>
        </div>

        <div className="row" style={{ gap: '0.75rem' }}>
          <span className="badge" style={{ background: 'var(--surface-3)', color: 'var(--text-2)', border: '1px solid var(--border-subtle)' }}>
            {algo.badge}
          </span>
          <button style={{ padding: '0.35rem', borderRadius: '50%' }}>
            {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {open && (
        <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-subtle)' }}>
          <p style={{ fontSize: '0.92rem', color: 'var(--text-2)', lineHeight: 1.7, marginBottom: '1.25rem' }}>
            {algo.description}
          </p>

          {algo.anomaly && (
            <div className="error-box" style={{ marginBottom: '1.25rem' }}>
              <AlertTriangle size={16} style={{ flexShrink: 0 }} />
              <div>{algo.anomaly}</div>
            </div>
          )}

          <div className="grid-2" style={{ gap: '1.5rem' }}>
            {/* Pseudocode column */}
            <div>
              <div className="field-label" style={{ marginBottom: '0.5rem' }}>
                <Code size={13} />
                <span>Formal Algorithm Logic</span>
              </div>
              <pre
                style={{
                  background: 'var(--surface-inset)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--r-sm)',
                  padding: '1rem',
                  fontSize: '0.8rem',
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--primary-light)',
                  lineHeight: 1.55,
                  overflowX: 'auto'
                }}
              >
                {algo.pseudocode}
              </pre>
            </div>

            {/* Pros / Cons column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <div className="field-label" style={{ color: 'var(--hit-light)' }}>
                  <span>Key Advantages</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                  {algo.pros.map((p, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.84rem', color: 'var(--text-2)' }}>
                      <CheckCircle2 size={14} style={{ color: 'var(--hit-light)', marginTop: 2, flexShrink: 0 }} />
                      <span>{p}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="field-label" style={{ color: 'var(--fault-light)' }}>
                  <span>Limitations & Vulnerabilities</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                  {algo.cons.map((c, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.84rem', color: 'var(--text-2)' }}>
                      <XCircle size={14} style={{ color: 'var(--fault-light)', marginTop: 2, flexShrink: 0 }} />
                      <span>{c}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Example Trace Table */}
          <div style={{ marginTop: '1.75rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-subtle)' }}>
            <div className="field-label" style={{ marginBottom: '0.4rem' }}>
              <Layers size={13} />
              <span>Standard Verification Trace (3 Frames)</span>
            </div>
            <TraceTable algoId={algo.id} />
          </div>
        </div>
      )}
    </div>
  );
}

export default function Algorithms() {
  return (
    <div className="page-wrapper">
      <div className="section-header" style={{ paddingTop: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
              <Layers size={22} style={{ color: 'var(--primary-light)' }} />
              <h1 style={{ fontSize: '1.85rem', fontWeight: 800, letterSpacing: '-0.03em' }}>
                Page Replacement Architectural Guide
              </h1>
            </div>
            <p style={{ color: 'var(--text-2)', fontSize: '0.92rem' }}>
              Comprehensive reference covering eviction mechanics, stack algorithm proofs, kernel heuristics, and Belady's Anomaly.
            </p>
          </div>

          <Link to="/simulator" className="link-btn link-btn-primary">
            <Play size={14} />
            <span>Launch Simulator</span>
          </Link>
        </div>
      </div>

      <div style={{ marginTop: '1.5rem' }}>
        {ALGORITHMS.map((algo) => (
          <AlgoAccordionCard key={algo.id} algo={algo} />
        ))}
      </div>
    </div>
  );
}
