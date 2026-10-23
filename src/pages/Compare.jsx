/**
 * Algorithm Showdown — Synchronized multi-policy execution benchmarking.
 * All 5 page replacement algorithms execute concurrently on identical inputs.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { parseRefs, randomRefs, localityRefs } from '../engine/refstring.js';
import { simulate, POLICIES } from '../engine/paging.js';
import {
  GitCompare, Play, Pause, SkipForward, SkipBack, RotateCcw,
  ChevronsRight, Shuffle, Layers, AlertTriangle, Trophy, AlertCircle
} from 'lucide-react';

const DEFAULT_STRING = '7 0 1 2 0 3 0 4 2 3 0 3 2 1 2 0 1 7 0 1';
const ALGO_COLORS = {
  FIFO:  '#863bff',
  LRU:   '#10b981',
  OPT:   '#ffb800',
  CLOCK: '#c084fc',
  NRU:   '#47bfff',
};

function MiniTimeline({ run, refs, stepIdx }) {
  if (!run) return null;
  return (
    <div style={{ overflowX: 'auto', paddingBottom: '0.25rem' }}>
      <table className="timeline" style={{ fontSize: '0.72rem' }}>
        <thead>
          <tr>
            <th className="row-label" style={{ fontSize: '0.68rem', padding: '0.25rem 0.5rem' }}>Ref</th>
            {refs.map((r, i) => (
              <th key={i} className={i === stepIdx ? 'tl-now' : i < stepIdx ? '' : 'tl-future-head'}>
                {r}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: run.frameCount }, (_, f) => (
            <tr key={f}>
              <th className="row-label" style={{ fontSize: '0.68rem', padding: '0.25rem 0.5rem' }}>F{f}</th>
              {run.steps.map((s, i) => {
                let cls = '';
                const isActive = i === stepIdx;
                if (i > stepIdx) {
                  cls = 'tl-future';
                } else if (s.slot === f && !s.hit) {
                  cls = s.evicted !== null ? 'tl-fault tl-victim' : 'tl-fault';
                } else if (s.hit && s.slot === f) {
                  cls = 'tl-hit';
                }

                return (
                  <td
                    key={i}
                    className={cls}
                    style={isActive && i <= stepIdx ? { outline: '2px solid var(--active-step)', outlineOffset: '-2px' } : undefined}
                  >
                    {i <= stepIdx ? (s.frames[f] ?? '') : ''}
                  </td>
                );
              })}
            </tr>
          ))}
          <tr>
            <th className="row-label" style={{ fontSize: '0.68rem', padding: '0.25rem 0.5rem' }}>H/F</th>
            {run.steps.map((s, i) => (
              <td
                key={i}
                className={i > stepIdx ? 'tl-future' : s.hit ? 'tl-hit' : 'tl-fault'}
                style={i === stepIdx ? { outline: '2px solid var(--active-step)', outlineOffset: '-2px', fontWeight: 800 } : undefined}
              >
                {i <= stepIdx ? (s.hit ? 'H' : 'F') : ''}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default function Compare() {
  const [text,    setText]    = useState(DEFAULT_STRING);
  const [frames,  setFrames]  = useState(3);
  const [stepIdx, setStepIdx] = useState(-1);
  const [playing, setPlaying] = useState(false);
  const [speed,   setSpeed]   = useState(500);

  const refs = useMemo(() => parseRefs(text), [text]);
  const results = useMemo(
    () => refs ? Object.fromEntries(POLICIES.map(p => [p, simulate(refs, frames, p)])) : null,
    [refs, frames]
  );
  const maxStep = results ? results['FIFO'].steps.length - 1 : -1;

  useEffect(() => {
    if (!playing || !results) return;
    if (stepIdx >= maxStep) { setPlaying(false); return; }
    const id = setTimeout(() => setStepIdx(i => i + 1), speed);
    return () => clearTimeout(id);
  }, [playing, stepIdx, results, speed, maxStep]);

  const reset = useCallback(() => { setStepIdx(-1); setPlaying(false); }, []);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(reset, [text, frames]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setStepIdx(i => Math.max(-1, i - 1));
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        setStepIdx(i => Math.min(maxStep, i + 1));
      } else if (e.key === ' ') {
        e.preventDefault();
        setPlaying(p => !p);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [maxStep]);

  const onRandom   = () => setText(randomRefs(20, 8, Date.now() % 10000).join(' '));
  const onLocality = () => setText(localityRefs(30, 12, 4, 10, Date.now() % 10000).join(' '));
  const onBelady   = () => { setText('1 2 3 4 1 2 5 1 2 3 4 5'); setFrames(3); };

  const bestFaults = results ? Math.min(...POLICIES.map(p => results[p].faults)) : Infinity;

  return (
    <div className="page-wrapper">
      {/* ── Page Header ── */}
      <div className="section-header" style={{ paddingTop: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
          <GitCompare size={22} style={{ color: 'var(--primary-light)' }} />
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, letterSpacing: '-0.03em' }}>
            Algorithm Showdown
          </h1>
        </div>
        <p style={{ color: 'var(--text-2)', fontSize: '0.92rem' }}>
          Execute all 5 page replacement policies simultaneously on identical memory access sequences, synchronized clock step by clock step.
        </p>
      </div>

      {/* ── Global Parameters & Synchronized Controls ── */}
      <div className="card" style={{ marginBottom: '1.25rem' }}>
        <div className="grid-2" style={{ gap: '1.5rem', alignItems: 'end' }}>
          <div>
            <label className="field-label">Reference Sequence</label>
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="e.g. 7 0 1 2 0 3 0 4"
              spellCheck={false}
            />
            <div className="row" style={{ marginTop: '0.6rem', gap: '0.35rem' }}>
              <button onClick={onRandom} style={{ fontSize: '0.74rem' }}><Shuffle size={11} /> Random</button>
              <button onClick={onLocality} style={{ fontSize: '0.74rem' }}><Layers size={11} /> Locality</button>
              <button onClick={onBelady} style={{ fontSize: '0.74rem' }}><AlertTriangle size={11} /> Belady</button>
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="field-label" style={{ margin: 0 }}>Physical Frames</label>
              <span className="speed-value" style={{ background: 'var(--surface-3)', padding: '0.1rem 0.5rem', borderRadius: 4 }}>
                {frames} Slots
              </span>
            </div>
            <input
              type="range"
              min={1}
              max={10}
              value={frames}
              onChange={(e) => setFrames(+e.target.value)}
            />
            <div className="range-labels">
              <span>1 Frame</span>
              <span>10 Frames</span>
            </div>
          </div>
        </div>

        {/* Playback Dock */}
        <div style={{ height: 1, background: 'var(--border-subtle)', margin: '1.25rem 0' }} />

        <div className="row-between">
          <div className="row">
            <button onClick={() => setStepIdx(i => Math.max(-1, i - 1))} disabled={stepIdx < 0} title="Step Back (←)">
              <SkipBack size={13} /> Back
            </button>
            <button
              className={`btn-play ${playing ? 'is-pausing' : ''}`}
              onClick={() => setPlaying(p => !p)}
              disabled={stepIdx >= maxStep}
            >
              {playing ? <><Pause size={13} /> Pause</> : <><Play size={13} /> Play</>}
            </button>
            <button onClick={() => setStepIdx(i => Math.min(maxStep, i + 1))} disabled={stepIdx >= maxStep} title="Step Forward (→)">
              Step <SkipForward size={13} />
            </button>
            <button onClick={() => setStepIdx(maxStep)} disabled={stepIdx >= maxStep} title="Run to Completion">
              <ChevronsRight size={13} /> All
            </button>
            <button onClick={reset} title="Reset">
              <RotateCcw size={13} />
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>
              Clock: {Math.max(0, stepIdx + 1)} / {maxStep + 1}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-3)' }}>Speed</span>
              <input
                type="range"
                min={100}
                max={1500}
                step={100}
                value={speed}
                onChange={(e) => setSpeed(+e.target.value)}
                style={{ width: 85 }}
              />
            </div>
          </div>
        </div>
      </div>

      {!refs && (
        <div className="error-box">
          <AlertCircle size={18} style={{ flexShrink: 0 }} />
          <span>Invalid reference sequence provided. Please check page numbers.</span>
        </div>
      )}

      {/* ── Live Leaderboard ── */}
      {results && (
        <div className="card" style={{ marginBottom: '1.25rem' }}>
          <div className="card-title">
            <Trophy size={16} />
            <span>Synchronized Real-Time Leaderboard</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.85rem' }}>
            {[...POLICIES].sort((a, b) => results[a].faults - results[b].faults).map((p, rank) => {
              const r = results[p];
              const isBest = r.faults === bestFaults;
              const step = stepIdx >= 0 ? r.steps[stepIdx] : null;
              const faultsSoFar = step ? step.faults : 0;
              const pct = stepIdx >= 0 ? Math.round((faultsSoFar / (stepIdx + 1)) * 100) : 0;

              return (
                <div
                  key={p}
                  style={{
                    background: isBest ? 'rgba(16, 185, 129, 0.08)' : 'var(--surface-1)',
                    border: `1px solid ${isBest ? 'var(--hit-border)' : 'var(--border-subtle)'}`,
                    borderRadius: 'var(--r-md)',
                    padding: '0.9rem 1.1rem',
                    transition: 'all var(--transition-fast)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '0.9rem', color: ALGO_COLORS[p] }}>
                      {p}
                    </span>
                    <span className={`rank-chip rank-${Math.min(rank + 1, 3)}`}>
                      #{rank + 1}
                    </span>
                  </div>

                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.5rem', fontWeight: 900, color: isBest ? 'var(--hit-light)' : 'var(--text-1)' }}>
                    {faultsSoFar}
                    <span style={{ fontSize: '0.7rem', fontWeight: 500, color: 'var(--text-3)', marginLeft: 4 }}>faults</span>
                  </div>

                  <div style={{ fontSize: '0.72rem', color: 'var(--text-3)', marginTop: '0.2rem' }}>
                    Rate: <strong style={{ color: 'var(--text-2)' }}>{pct}%</strong>
                  </div>

                  <div className="progress-track" style={{ marginTop: '0.5rem' }}>
                    <div
                      className="progress-fill"
                      style={{
                        background: ALGO_COLORS[p],
                        width: `${pct}%`,
                        transition: 'width 0.3s'
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── 5 Synchronized Timelines ── */}
      {results && (
        <div className="compare-grid">
          {POLICIES.map((p) => {
            const r = results[p];
            const isBest = r.faults === bestFaults;
            const step = stepIdx >= 0 ? r.steps[stepIdx] : null;
            const faultsSoFar = step ? step.faults : 0;

            return (
              <div
                key={p}
                className="algo-mini-card"
                style={{
                  borderColor: isBest ? 'var(--hit-border)' : undefined,
                  boxShadow: isBest ? '0 0 20px rgba(16, 185, 129, 0.15)' : undefined
                }}
              >
                <div className="algo-mini-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                    <span
                      style={{
                        display: 'inline-block',
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        background: ALGO_COLORS[p],
                        boxShadow: `0 0 8px ${ALGO_COLORS[p]}`
                      }}
                    />
                    <span className="algo-mini-name" style={{ color: ALGO_COLORS[p] }}>
                      {p}
                    </span>
                    {isBest && <span className="badge">Best</span>}
                  </div>
                  <span className={`algo-mini-faults ${isBest ? 'best' : ''}`}>
                    {faultsSoFar} fault{faultsSoFar !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="algo-mini-body">
                  <MiniTimeline run={r} refs={refs} stepIdx={stepIdx} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
