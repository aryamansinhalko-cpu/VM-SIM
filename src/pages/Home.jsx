/**
 * Home — World-class SaaS Landing Page for VMSim.
 * Designed with high-end typography, interactive product preview,
 * bento-grid capabilities, and OS architectural showcases.
 */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Cpu, Play, GitCompare, FlaskConical, History, ArrowRight,
  Zap, Layers, CheckCircle2, AlertTriangle, Activity, Terminal
} from 'lucide-react';

// Hero interactive preview dataset (LRU 3 frames)
const HERO_STEPS = [
  { ref: 7, frames: ['7', '—', '—'], hf: 'F', evicted: null },
  { ref: 0, frames: ['7', '0', '—'], hf: 'F', evicted: null },
  { ref: 1, frames: ['7', '0', '1'], hf: 'F', evicted: null },
  { ref: 2, frames: ['2', '0', '1'], hf: 'F', evicted: 7 },
  { ref: 0, frames: ['2', '0', '1'], hf: 'H', evicted: null },
  { ref: 3, frames: ['2', '0', '3'], hf: 'F', evicted: 1 },
  { ref: 0, frames: ['2', '0', '3'], hf: 'H', evicted: null },
  { ref: 4, frames: ['4', '0', '3'], hf: 'F', evicted: 2 },
  { ref: 2, frames: ['4', '2', '3'], hf: 'F', evicted: 0 },
  { ref: 3, frames: ['4', '2', '3'], hf: 'H', evicted: null },
];

const CAPABILITIES = [
  {
    span: 'bento-col-8',
    glowColor: '#863bff',
    icon: <Cpu size={24} style={{ color: '#a855f7' }} />,
    iconBg: 'rgba(134, 59, 255, 0.15)',
    title: 'Interactive Page Replacement',
    badge: 'Step-by-Step Execution',
    desc: 'Simulate FIFO, LRU, Optimal, Clock (Second-Chance), and NRU policies with complete frame visibility. Observe hit rates, detect page faults, and inspect victim eviction choices at every memory clock cycle.',
    preview: (
      <div className="bento-interactive-preview">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-3)' }}>ALGORITHM BUS: LRU (3 FRAMES)</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--hit-light)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--hit)' }}></span> Deterministic State
          </span>
        </div>
        <div style={{ display: 'flex', gap: '0.45rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
          {HERO_STEPS.slice(0, 7).map((s, idx) => (
            <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
              <span style={{ fontSize: '0.68rem', fontFamily: 'var(--font-mono)', color: idx === 4 ? 'var(--active-step)' : 'var(--text-3)', fontWeight: idx === 4 ? 700 : 400 }}>
                {s.ref}
              </span>
              <div style={{
                width: 32, height: 26, borderRadius: 4,
                background: s.hf === 'H' ? 'var(--hit-dim)' : 'var(--surface-3)',
                border: `1px solid ${s.hf === 'H' ? 'var(--hit-border)' : 'var(--border-subtle)'}`,
                color: s.hf === 'H' ? 'var(--hit-light)' : 'var(--text-2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.72rem', fontFamily: 'var(--font-mono)', fontWeight: 700
              }}>
                {s.frames[0]}
              </div>
              <span style={{ fontSize: '0.65rem', fontFamily: 'var(--font-mono)', fontWeight: 800, color: s.hf === 'H' ? 'var(--hit-light)' : 'var(--fault-light)' }}>
                {s.hf}
              </span>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    span: 'bento-col-4',
    glowColor: '#f59e0b',
    icon: <GitCompare size={24} style={{ color: '#fbbf24' }} />,
    iconBg: 'rgba(245, 158, 11, 0.12)',
    title: 'Algorithm Showdown',
    badge: 'Synchronized Benchmarks',
    desc: 'Execute all 5 policies simultaneously on identical reference strings. Live leaderboards rank algorithms by minimum page faults in real time.',
    preview: (
      <div className="bento-interactive-preview">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {[
            { name: 'OPT', faults: 5, rank: '#1', color: '#10b981' },
            { name: 'LRU', faults: 6, rank: '#2', color: '#863bff' },
            { name: 'FIFO', faults: 8, rank: '#3', color: '#ffb800' },
          ].map(row => (
            <div key={row.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem', fontFamily: 'var(--font-mono)' }}>
              <span style={{ color: row.color, fontWeight: 700 }}>{row.name}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ color: 'var(--text-3)' }}>{row.faults} faults</span>
                <span className={`rank-chip rank-${row.rank.slice(1)}`} style={{ width: 20, height: 20, fontSize: '0.65rem' }}>{row.rank}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    span: 'bento-col-6',
    glowColor: '#f43f5e',
    icon: <FlaskConical size={24} style={{ color: '#fb7185' }} />,
    iconBg: 'rgba(244, 63, 94, 0.12)',
    title: 'Thrashing & Multiprogramming Lab',
    badge: 'System Performance Cliff',
    desc: 'Explore the tipping point where multiprogramming causes processes to spend more time servicing page faults than computing useful instructions. Manipulate memory frames, process counts, and disk I/O penalties.',
    preview: (
      <div className="bento-interactive-preview">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.75rem', color: 'var(--text-3)' }}>
          <span>CPU Utilization vs Concurrency</span>
          <span style={{ color: 'var(--fault-light)', fontWeight: 600 }}>Threshold: 6 Procs</span>
        </div>
        <div style={{ height: 42, display: 'flex', alignItems: 'flex-end', gap: 4 }}>
          {[20, 48, 72, 88, 94, 91, 35, 12, 6, 3].map((val, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                height: `${val}%`,
                borderRadius: '3px 3px 0 0',
                background: i < 6 ? 'linear-gradient(to top, #863bff, #47bfff)' : 'linear-gradient(to top, #f43f5e, #fb7185)',
                opacity: i === 5 ? 1 : 0.75
              }}
              title={`Procs: ${i + 1}, Util: ${val}%`}
            />
          ))}
        </div>
      </div>
    ),
  },
  {
    span: 'bento-col-6',
    glowColor: '#47bfff',
    icon: <History size={24} style={{ color: '#47bfff' }} />,
    iconBg: 'rgba(71, 191, 255, 0.14)',
    title: 'Session Persistence & Report Export',
    badge: 'Lab-Ready Reporting',
    desc: 'Save named simulation runs to local storage, reload configurations with a click, and generate professional PDF reports or raw CSV spreadsheets for operating systems coursework.',
    preview: (
      <div className="bento-interactive-preview">
        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
          <span className="meta-chip">PDF Generation</span>
          <span className="meta-chip">CSV Data Dump</span>
          <span className="meta-chip">Browser LocalStorage</span>
          <span className="meta-chip">PNG Canvas Capture</span>
        </div>
      </div>
    ),
  },
];

const ALGORITHM_SPOTLIGHTS = [
  {
    name: 'FIFO',
    full: 'First-In, First-Out',
    tagline: 'Queue-based replacement of the oldest resident page',
    badge: 'Classic Policy',
    color: '#863bff',
    description: 'Evicts the page that has been resident in memory the longest. While trivial to implement with a FIFO queue, it completely ignores frequency of access and is vulnerable to Belady\'s Anomaly.',
    tradeoff: 'Vulnerable to Belady\'s Anomaly — increasing physical frames can paradoxically increase page faults.',
  },
  {
    name: 'LRU',
    full: 'Least Recently Used',
    tagline: 'Leverages temporal locality to predict future references',
    badge: 'Textbook Standard',
    color: '#10b981',
    description: 'Replaces the page that has not been referenced for the longest period of time. Approximates optimal replacement by exploiting the principle of locality, serving as the benchmark for real systems.',
    tradeoff: 'High hardware overhead for exact tracking (counters or stack); real operating systems use approximations.',
  },
  {
    name: 'OPT',
    full: 'Belady\'s Optimal Algorithm',
    tagline: 'Theoretical minimum fault benchmark requiring clairvoyance',
    badge: 'Theoretical Benchmark',
    color: '#ffb800',
    description: 'Evicts the page whose next reference occurs farthest in the future. Proved by Laszlo Belady to achieve the lowest possible page fault count on any reference sequence.',
    tradeoff: 'Impossible to implement in real general-purpose OS kernels because it requires perfect foreknowledge of future memory access.',
  },
];

export default function Home() {
  const [activeStepIdx, setActiveStepIdx] = useState(4);
  const currentStep = HERO_STEPS[activeStepIdx];

  const cumulativeFaults = HERO_STEPS.slice(0, activeStepIdx + 1).filter(s => s.hf === 'F').length;
  const cumulativeHits = (activeStepIdx + 1) - cumulativeFaults;
  const faultRate = (((cumulativeFaults / (activeStepIdx + 1)) * 100) || 0).toFixed(1);

  return (
    <div className="home-wrapper">

      {/* ═══════════════════════════════════════════════
         HERO SECTION
         ═══════════════════════════════════════════════ */}
      <section className="hero">
        <div className="hero-tag">
          <span className="hero-tag-pip"></span>
          <span>Virtual Memory Architecture · Interactive OS Laboratory</span>
        </div>

        <h1 className="hero-title">
          See How Memory<br />
          <span className="title-accent">Really Works.</span>
        </h1>

        <p className="hero-sub">
          Explore page replacement, understand memory pressure, and visualize the relationship between page faults and system performance through interactive simulations.
        </p>

        <div className="hero-cta-group">
          <Link to="/simulator" className="link-btn link-btn-primary">
            <span>Launch Simulator</span>
            <ArrowRight size={16} />
          </Link>
          <Link to="/algorithms" className="link-btn link-btn-ghost">
            <span>Explore Algorithms</span>
          </Link>
        </div>

        {/* Telemetry Metrics Bar */}
        <div className="hero-metrics-bar">
          <div className="hero-metric-item">
            <div className="metric-val">5<span className="metric-val-unit">Policies</span></div>
            <div className="metric-label">FIFO · LRU · OPT · Clock · NRU</div>
          </div>
          <div className="metric-divider"></div>
          <div className="hero-metric-item">
            <div className="metric-val">100<span className="metric-val-unit">%</span></div>
            <div className="metric-label">Deterministic Engine</div>
          </div>
          <div className="metric-divider"></div>
          <div className="hero-metric-item">
            <div className="metric-val">21<span className="metric-val-unit">Passing</span></div>
            <div className="metric-label">Vitest Unit Verification</div>
          </div>
          <div className="metric-divider"></div>
          <div className="hero-metric-item">
            <div className="metric-val">0<span className="metric-val-unit">ms</span></div>
            <div className="metric-label">Server Latency · Local Client</div>
          </div>
        </div>

        {/* ── Product Preview Chassis (Interactive Scrubbable Mock) ── */}
        <div className="hero-preview-chassis">
          <div className="hero-chassis-topbar">
            <div className="chassis-dots">
              <span className="chassis-dot dot-red"></span>
              <span className="chassis-dot dot-yellow"></span>
              <span className="chassis-dot dot-green"></span>
            </div>
            <div className="chassis-tab-title">
              <Terminal size={12} style={{ color: 'var(--primary-light)' }} />
              <span>vmsim-workbench · LRU · 3 frames · Step {activeStepIdx + 1} of {HERO_STEPS.length}</span>
            </div>
            <div className="chassis-live-badge">
              <span className="chassis-live-dot"></span>
              <span>Interactive Telemetry</span>
            </div>
          </div>

          <div className="hero-chassis-content">
            <div className="hero-timeline-stage">
              {/* Scrub instructions */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-3)', fontWeight: 700 }}>
                  Page Reference Bus (Click Any Step To Inspect)
                </span>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-2)', fontFamily: 'var(--font-mono)' }}>
                  Current Page: <strong style={{ color: currentStep.hf === 'H' ? 'var(--hit-light)' : 'var(--fault-light)' }}>{currentStep.ref}</strong> ({currentStep.hf === 'H' ? 'HIT' : 'FAULT'})
                </span>
              </div>

              {/* Memory Reference Bus */}
              <div className="hero-mini-bus">
                {HERO_STEPS.map((s, idx) => {
                  const isCur = idx === activeStepIdx;
                  return (
                    <div
                      key={idx}
                      className="hero-bus-col"
                      onClick={() => setActiveStepIdx(idx)}
                      style={{ cursor: 'pointer' }}
                    >
                      <span className={`hero-bus-ref ${isCur ? 'is-current' : ''}`}>
                        {s.ref}
                      </span>
                      {[0, 1, 2].map(slot => {
                        const frameVal = s.frames[slot];
                        const isAllocated = frameVal !== '—';
                        return (
                          <div
                            key={slot}
                            className={`hero-bus-cell ${isCur ? 'is-active' : ''} ${s.hf === 'H' && isCur ? 'is-hit' : s.hf === 'F' && isCur ? 'is-fault' : ''}`}
                            style={{
                              opacity: idx <= activeStepIdx ? 1 : 0.35,
                              borderColor: isCur ? (s.hf === 'H' ? 'var(--hit-border)' : 'var(--fault-border)') : undefined
                            }}
                          >
                            {idx <= activeStepIdx ? (isAllocated ? frameVal : '') : ''}
                          </div>
                        );
                      })}
                      <span className={`hero-bus-result ${s.hf === 'H' ? 'h' : 'f'}`}>
                        {idx <= activeStepIdx ? s.hf : '—'}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* State bar & Telemetry */}
              <div className="hero-preview-meta">
                <div className="hero-meta-stats">
                  <span className="meta-chip chip-fault">
                    Page Faults: <strong>{cumulativeFaults}</strong>
                  </span>
                  <span className="meta-chip chip-hit">
                    Page Hits: <strong>{cumulativeHits}</strong>
                  </span>
                  <span className="meta-chip">
                    Fault Rate: <strong style={{ color: 'var(--primary-light)' }}>{faultRate}%</strong>
                  </span>
                </div>

                <Link to="/simulator" className="hero-preview-action">
                  <span>Open Full Interactive Workbench</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
         PRODUCT CAPABILITIES (BENTO GRID)
         ═══════════════════════════════════════════════ */}
      <section className="section-wrapper">
        <div className="section-eyebrow">
          <Zap size={14} />
          <span>Core Capabilities</span>
        </div>
        <h2 className="section-heading">Everything needed to master virtual memory</h2>
        <p className="section-subheading">
          Built for computer science students, systems engineers, and educators who demand precision, clarity, and intuitive visual feedback.
        </p>

        <div className="bento-grid">
          {CAPABILITIES.map((card, idx) => (
            <div key={idx} className={`bento-card ${card.span}`}>
              <div
                className="bento-card-bg-glow"
                style={{ background: card.glowColor }}
              />
              <div>
                <div className="bento-icon-box" style={{ background: card.iconBg }}>
                  {card.icon}
                </div>
                <div style={{ display: 'inline-block', fontSize: '0.72rem', fontWeight: 700, color: 'var(--primary-light)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.4rem' }}>
                  {card.badge}
                </div>
                <h3 className="bento-card-title">{card.title}</h3>
                <p className="bento-card-desc">{card.desc}</p>
              </div>
              {card.preview}
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
         HOW IT WORKS (3-STEP EXECUTION FLOW)
         ═══════════════════════════════════════════════ */}
      <section className="section-wrapper">
        <div className="section-eyebrow">
          <Activity size={14} />
          <span>Workflow</span>
        </div>
        <h2 className="section-heading">How the simulator works</h2>
        <p className="section-subheading">
          Three simple steps to transition from abstract operating system textbook formulas to visual, concrete comprehension.
        </p>

        <div className="how-it-works-grid">
          <div className="step-card">
            <span className="step-num-badge">01 — CONFIGURE</span>
            <h3 className="step-card-title">Define Memory State</h3>
            <p className="step-card-desc">
              Input custom page reference strings or select presets like Locality of Reference and Belady's Anomaly. Choose available physical frame slots and replacement policies.
            </p>
          </div>

          <div className="step-card">
            <span className="step-num-badge">02 — SIMULATE</span>
            <h3 className="step-card-title">Step Through Clock Cycles</h3>
            <p className="step-card-desc">
              Advance through memory accesses one instruction at a time or run playback at up to 10× speed. Watch page tables map virtual addresses to physical frame numbers.
            </p>
          </div>

          <div className="step-card">
            <span className="step-num-badge">03 — UNDERSTAND</span>
            <h3 className="step-card-title">Analyze & Compare</h3>
            <p className="step-card-desc">
              Inspect working set windows (Δ), compare fault counts side-by-side with optimal theoretical limits, and export complete analytical reports in PDF or CSV formats.
            </p>
          </div>
        </div>

        <div style={{ marginTop: '2.5rem', textAlign: 'center' }}>
          <Link to="/simulator" className="link-btn link-btn-primary">
            <span>Try the Simulator Now</span>
            <ArrowRight size={15} />
          </Link>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
         ALGORITHM SHOWCASE
         ═══════════════════════════════════════════════ */}
      <section className="section-wrapper">
        <div className="section-eyebrow">
          <Layers size={14} />
          <span>Replacement Policies</span>
        </div>
        <h2 className="section-heading">Supported Page Replacement Algorithms</h2>
        <p className="section-subheading">
          From elementary FIFO queues to optimal theoretical boundaries and production second-chance clock schemes.
        </p>

        <div className="algo-showcase-grid">
          {ALGORITHM_SPOTLIGHTS.map(algo => (
            <div key={algo.name} className="algo-card">
              <span className="algo-card-badge" style={{ background: `${algo.color}18`, color: algo.color, border: `1px solid ${algo.color}35` }}>
                {algo.badge}
              </span>
              <h3 className="algo-card-name">{algo.name}</h3>
              <div className="algo-card-full">{algo.full}</div>
              <p className="algo-card-desc">{algo.description}</p>
              <div className="algo-tradeoff-box">
                <strong>Key Trade-Off:</strong> {algo.tradeoff}
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-3)' }}>Also supports Clock (Second-Chance) and NRU (Not Recently Used).</span>
          <Link to="/algorithms" style={{ fontSize: '0.85rem', color: 'var(--primary-light)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <span>View Full Algorithm Pseudocode & Proofs</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
         THRASHING SHOWCASE SPOTLIGHT
         ═══════════════════════════════════════════════ */}
      <section className="section-wrapper">
        <div className="thrash-spotlight">
          <div>
            <div className="section-eyebrow" style={{ color: '#fb7185' }}>
              <AlertTriangle size={14} />
              <span>Memory Pressure Mechanics</span>
            </div>
            <h2 className="section-heading" style={{ fontSize: 'clamp(1.7rem, 2.8vw, 2.3rem)' }}>
              Why Systems Thrash Under Load
            </h2>
            <p style={{ fontSize: '0.92rem', color: 'var(--text-2)', lineHeight: 1.7, marginBottom: '1.5rem' }}>
              When the sum of all active processes' working sets exceeds total physical RAM capacity, page fault rates skyrocket. The operating system spends almost 100% of its time waiting for disk paging, causing CPU utilization to violently collapse.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.86rem', color: 'var(--text-1)' }}>
                <CheckCircle2 size={16} style={{ color: 'var(--hit-light)', flexShrink: 0 }} />
                <span>Working Set Model: Allocates frames based on active page locality (Δ)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.86rem', color: 'var(--text-1)' }}>
                <CheckCircle2 size={16} style={{ color: 'var(--hit-light)', flexShrink: 0 }} />
                <span>Multiprogramming Degree: Optimizes throughput before the utilization cliff</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.86rem', color: 'var(--text-1)' }}>
                <CheckCircle2 size={16} style={{ color: 'var(--hit-light)', flexShrink: 0 }} />
                <span>Interactive Sliders: Experiment with process count and page fault costs</span>
              </div>
            </div>

            <Link to="/thrashing" className="link-btn link-btn-primary">
              <span>Open Thrashing Lab</span>
              <ArrowRight size={15} />
            </Link>
          </div>

          <div className="thrash-spotlight-visual">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.76rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--text-2)' }}>
                CPU UTILIZATION VS MULTIPROGRAMMING
              </span>
              <span className="state-badge state-thrashing">Critical Zone</span>
            </div>

            {/* Visual utilization curve diagram */}
            <div style={{ position: 'relative', height: 180, display: 'flex', alignItems: 'flex-end', gap: 6, padding: '0 0.5rem 1.5rem' }}>
              {[15, 38, 62, 85, 96, 92, 45, 18, 9, 4].map((util, i) => {
                const isThrashing = i >= 6;
                return (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end', gap: 6 }}>
                    <span style={{ fontSize: '0.65rem', fontFamily: 'var(--font-mono)', color: isThrashing ? 'var(--fault-light)' : 'var(--text-3)' }}>
                      {util}%
                    </span>
                    <div
                      style={{
                        width: '100%',
                        height: `${util}%`,
                        borderRadius: '4px 4px 0 0',
                        background: isThrashing
                          ? 'linear-gradient(to top, rgba(244, 63, 94, 0.4), #f43f5e)'
                          : 'linear-gradient(to top, rgba(134, 59, 255, 0.4), #863bff)',
                        boxShadow: i === 4 ? '0 0 16px rgba(134, 59, 255, 0.6)' : undefined
                      }}
                    />
                    <span style={{ fontSize: '0.65rem', fontFamily: 'var(--font-mono)', color: 'var(--text-3)' }}>
                      P{i + 1}
                    </span>
                  </div>
                );
              })}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem' }}>
              <span style={{ color: 'var(--hit-light)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--hit)' }}></span> Safe Zone (P1–P5)
              </span>
              <span style={{ color: 'var(--fault-light)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--fault)' }}></span> Thrashing Cliff (P6+)
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
         CLOSING CTA
         ═══════════════════════════════════════════════ */}
      <section className="closing-cta-card">
        <h2 className="closing-cta-heading">From Operating Systems Theory to Visual Understanding.</h2>
        <p className="closing-cta-sub">
          Move beyond static textbook diagrams. Experience deterministic memory management, compare page replacement algorithms, and inspect victim evictions in real time.
        </p>
        <div className="closing-cta-btns">
          <Link to="/simulator" className="link-btn link-btn-primary">
            <Play size={15} />
            <span>Start Simulating</span>
          </Link>
          <Link to="/compare" className="link-btn link-btn-ghost">
            <GitCompare size={15} />
            <span>Compare All Algorithms</span>
          </Link>
        </div>
      </section>

    </div>
  );
}
