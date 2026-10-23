/**
 * Controls — Command Deck for simulation configuration and playback.
 * Supports reference presets, frame sizing, policy switching, and session saving.
 */
import { useState } from 'react';
import {
  Play, Pause, SkipBack, SkipForward, RotateCcw,
  ChevronsRight, Shuffle, Layers, AlertTriangle,
  Sliders, Cpu, Save, Gauge, Check
} from 'lucide-react';

const DEFAULT_POLICIES = ['FIFO', 'LRU', 'OPT', 'CLOCK', 'NRU'];
const STORAGE_KEY = 'vm-sim-history';
const MAX_SESSIONS = 20;

function saveRun(run, refs, name) {
  if (!run || !refs) return false;
  try {
    const prev = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const entry = {
      id:        Date.now(),
      name:      name.trim() || `Run ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`,
      policy:    run.policy,
      frames:    run.frameCount,
      faults:    run.faults,
      hits:      run.hits,
      faultRate: run.faultRate,
      refs:      refs,
      savedAt:   new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify([entry, ...prev].slice(0, MAX_SESSIONS)));
    return true;
  } catch {
    return false;
  }
}

export default function Controls({
  allPolicies = DEFAULT_POLICIES,
  run,
  refs,
  text,
  setText,
  frames,
  setFrames,
  policy,
  setPolicy,
  speed,
  setSpeed,
  playing,
  setPlaying,
  stepIdx,
  setStepIdx,
  reset,
  maxStep,
  onRandom,
  onLocality,
  onBelady
}) {
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = () => {
    const name = prompt('Name this session run (leave blank for timestamp):');
    if (name === null) return; // cancelled
    const ok = saveRun(run, refs, name);
    if (ok) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    }
  };

  return (
    <div className="controls-panel">
      {/* ── Reference String Configuration ── */}
      <div>
        <label className="field-label" htmlFor="ref-input">
          <Cpu size={13} />
          <span>Reference String</span>
        </label>
        <input
          id="ref-input"
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="e.g. 7 0 1 2 0 3 0 4 2 3"
          spellCheck={false}
          autoComplete="off"
        />
        <div className="row" style={{ marginTop: '0.6rem', gap: '0.35rem' }}>
          <button onClick={onRandom} style={{ fontSize: '0.74rem', padding: '0.35rem 0.65rem' }} title="Generate random sequence">
            <Shuffle size={12} /> Random
          </button>
          <button onClick={onLocality} style={{ fontSize: '0.74rem', padding: '0.35rem 0.65rem' }} title="Generate sequence with localized clusters">
            <Layers size={12} /> Locality
          </button>
          <button onClick={onBelady} style={{ fontSize: '0.74rem', padding: '0.35rem 0.65rem' }} title="Load Belady's Anomaly test string">
            <AlertTriangle size={12} /> Belady
          </button>
        </div>
      </div>

      <div className="controls-sep" />

      {/* ── Frame Allocation ── */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <label className="field-label" style={{ margin: 0 }}>
            <Sliders size={13} />
            <span>Physical Frames</span>
          </label>
          <span className="speed-value" style={{ background: 'var(--surface-3)', padding: '0.1rem 0.5rem', borderRadius: '4px' }}>
            {frames} Slots
          </span>
        </div>
        <input
          type="range"
          min={1}
          max={10}
          value={frames}
          onChange={(e) => setFrames(+e.target.value)}
          aria-label="Physical Frames Slider"
        />
        <div className="range-labels">
          <span>1 Frame</span>
          <span>10 Frames</span>
        </div>
      </div>

      {/* ── Policy Selector ── */}
      <div>
        <label className="field-label" style={{ marginBottom: '0.55rem' }}>
          <span>Replacement Policy</span>
        </label>
        <div className="policy-pills">
          {allPolicies.map((p) => (
            <button
              key={p}
              type="button"
              className={`policy-pill ${policy === p ? 'active' : ''}`}
              onClick={() => setPolicy(p)}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="controls-sep" />

      {/* ── Playback Controls Deck ── */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.55rem' }}>
          <label className="field-label" style={{ margin: 0 }}>
            <Play size={13} />
            <span>Playback Deck</span>
          </label>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>
            Step {Math.max(0, stepIdx + 1)} / {maxStep + 1}
          </span>
        </div>

        <div className="controls-actions">
          <button
            onClick={() => setStepIdx((i) => Math.max(-1, i - 1))}
            disabled={stepIdx < 0}
            title="Step Back (←)"
            aria-label="Step Back"
          >
            <SkipBack size={13} />
          </button>

          <button
            className={`btn-play ${playing ? 'is-pausing' : ''}`}
            onClick={() => setPlaying(!playing)}
            disabled={stepIdx >= maxStep}
            style={{ flex: 1 }}
            aria-label={playing ? 'Pause Simulation' : 'Play Simulation'}
          >
            {playing ? (
              <><Pause size={13} /> Pause</>
            ) : (
              <><Play size={13} /> Play</>
            )}
          </button>

          <button
            onClick={() => setStepIdx((i) => Math.min(maxStep, i + 1))}
            disabled={stepIdx >= maxStep}
            title="Next Step (→)"
            aria-label="Next Step"
          >
            <SkipForward size={13} />
          </button>

          <button
            onClick={() => setStepIdx(maxStep)}
            disabled={stepIdx >= maxStep}
            title="Jump to End"
            aria-label="Run to Completion"
          >
            <ChevronsRight size={13} />
          </button>

          <button onClick={reset} title="Reset Simulation" aria-label="Reset Simulation">
            <RotateCcw size={13} />
          </button>
        </div>
      </div>

      {/* ── Simulation Speed ── */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <label className="field-label" style={{ margin: 0 }}>
            <Gauge size={13} />
            <span>Clock Interval</span>
          </label>
          <span className="speed-value">{speed} ms</span>
        </div>
        <input
          type="range"
          min={100}
          max={1500}
          step={100}
          value={speed}
          onChange={(e) => setSpeed(+e.target.value)}
          aria-label="Clock Interval Slider"
        />
        <div className="range-labels">
          <span>Fast (100ms)</span>
          <span>Slow (1.5s)</span>
        </div>
      </div>

      {/* ── Save to History Action ── */}
      {run && (
        <>
          <div className="controls-sep" />
          <button
            onClick={handleSave}
            className={saveSuccess ? 'btn-success' : 'btn-ghost'}
            style={{ width: '100%', justifyContent: 'center', padding: '0.6rem' }}
          >
            {saveSuccess ? (
              <><Check size={14} /> Saved to Sessions</>
            ) : (
              <><Save size={14} /> Save to My Sessions</>
            )}
          </button>
        </>
      )}
    </div>
  );
}
