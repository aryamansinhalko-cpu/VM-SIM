/**
 * Simulator — Professional Interactive Virtual Memory Workbench.
 * Integrates simulation controls, memory bus timeline, page table translation,
 * working set models, live multi-algorithm comparison, and reporting.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { parseRefs, randomRefs, localityRefs } from '../engine/refstring.js';
import { simulate, POLICIES, COMPARE_POLICIES } from '../engine/paging.js';
import Controls         from '../components/Controls.jsx';
import FrameTimeline    from '../components/FrameTimeline.jsx';
import PageTable        from '../components/PageTable.jsx';
import StatsBar         from '../components/StatsBar.jsx';
import CompareTable     from '../components/CompareTable.jsx';
import WorkingSetPanel  from '../components/WorkingSetPanel.jsx';
import RefStringBuilder from '../components/RefStringBuilder.jsx';
import { exportPNG, exportPDF, exportCSV } from '../utils/export.js';
import { AlertCircle, Camera, FileText, Download, Sliders } from 'lucide-react';

const DEFAULT_STRING = '7 0 1 2 0 3 0 4 2 3 0 3 2 1 2 0 1 7 0 1';

export default function Simulator() {
  const [text,    setText]    = useState(DEFAULT_STRING);
  const [frames,  setFrames]  = useState(3);
  const [policy,  setPolicy]  = useState('LRU');
  const [stepIdx, setStepIdx] = useState(-1);
  const [playing, setPlaying] = useState(false);
  const [speed,   setSpeed]   = useState(500);
  const [delta,   setDelta]   = useState(4);
  const mainRef = useRef(null);

  // Check if a session was passed from History page
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem('vm-sim-load');
      if (saved) {
        const item = JSON.parse(saved);
        if (item.refs && Array.isArray(item.refs)) {
          setText(item.refs.join(' '));
        }
        if (item.frames) setFrames(item.frames);
        if (item.policy) setPolicy(item.policy);
        sessionStorage.removeItem('vm-sim-load');
      }
    } catch {
      // Ignore parse error
    }
  }, []);

  const refs = useMemo(() => parseRefs(text), [text]);

  const policiesToRun = useMemo(() => {
    const s = new Set([...COMPARE_POLICIES, policy]);
    return [...s];
  }, [policy]);

  const results = useMemo(
    () => refs ? Object.fromEntries(policiesToRun.map(p => [p, simulate(refs, frames, p)])) : null,
    [refs, frames, policiesToRun]
  );

  const run     = results?.[policy];
  const maxStep = run ? run.steps.length - 1 : -1;

  useEffect(() => {
    if (!playing || !run) return;
    if (stepIdx >= maxStep) { setPlaying(false); return; }
    const id = setTimeout(() => setStepIdx(i => i + 1), speed);
    return () => clearTimeout(id);
  }, [playing, stepIdx, run, speed, maxStep]);

  const reset = useCallback(() => { setStepIdx(-1); setPlaying(false); }, []);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(reset, [text, frames, policy]);

  // Keyboard navigation shortcuts
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
  const onBelady   = () => { setText('1 2 3 4 1 2 5 1 2 3 4 5'); setPolicy('FIFO'); setFrames(3); };

  const refsArr = useMemo(() => refs || [], [refs]);

  const doExportPNG = () => mainRef.current && exportPNG(mainRef.current, `vm-sim-${policy}-workbench`);
  const doExportPDF = () => run && refs && exportPDF(run, refs);
  const doExportCSV = () => {
    if (!run || !refs) return;
    const csv  = exportCSV(run, refs);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `vm-sim-${run.policy}-trace.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="page-wrapper" ref={mainRef}>
      {/* ── Toolbar ── */}
      <div className="sim-toolbar">
        <div>
          <h1 className="sim-title">Simulation Workbench</h1>
          <div className="sim-sub-desc">
            <span>Step through demand paging</span>
            <span>·</span>
            <span>Shortcuts:</span>
            <kbd className="key-kbd">← Back</kbd>
            <kbd className="key-kbd">→ Step</kbd>
            <kbd className="key-kbd">Space Play/Pause</kbd>
          </div>
        </div>

        <div className="row">
          <button onClick={doExportPNG} disabled={!run} title="Capture PNG screenshot of workbench">
            <Camera size={13} /> Screenshot
          </button>
          <button onClick={doExportPDF} disabled={!run} title="Export printable PDF report">
            <FileText size={13} /> PDF Report
          </button>
          <button onClick={doExportCSV} disabled={!run} className="btn-success" title="Download raw CSV simulation trace">
            <Download size={13} /> Export CSV
          </button>
        </div>
      </div>

      {/* ── Dashboard Layout ── */}
      <div className="sim-layout">
        {/* Left Column: Command Deck */}
        <aside className="sim-sidebar">
          <Controls
            text={text}
            setText={setText}
            frames={frames}
            setFrames={setFrames}
            policy={policy}
            setPolicy={setPolicy}
            speed={speed}
            setSpeed={setSpeed}
            playing={playing}
            setPlaying={setPlaying}
            stepIdx={stepIdx}
            setStepIdx={setStepIdx}
            reset={reset}
            maxStep={maxStep}
            onRandom={onRandom}
            onLocality={onLocality}
            onBelady={onBelady}
            allPolicies={POLICIES}
            run={run}
            refs={refs}
          />

          <RefStringBuilder refs={refsArr} onRefsChange={(arr) => setText(arr.join(' '))} />

          {/* Working set window configuration */}
          {run && (
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="field-label" style={{ margin: 0 }}>
                  <Sliders size={13} />
                  <span>Working Set Window (Δ)</span>
                </label>
                <span className="speed-value" style={{ background: 'var(--surface-3)', padding: '0.1rem 0.5rem', borderRadius: '4px' }}>
                  Δ = {delta}
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={Math.max(1, (refs || []).length)}
                value={delta}
                onChange={(e) => setDelta(+e.target.value)}
                aria-label="Working Set Window Slider"
              />
              <div className="range-labels">
                <span>1 Step</span>
                <span>{(refs || []).length} Steps</span>
              </div>
            </div>
          )}
        </aside>

        {/* Right Column: Execution Stage */}
        <div className="sim-main">
          {!refs && (
            <div className="error-box">
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <div>
                <strong>Invalid Reference Sequence:</strong> Please provide non-negative integers separated by spaces or commas (e.g. <code>7 0 1 2 0 3 0 4</code>).
              </div>
            </div>
          )}

          {run && (
            <>
              <StatsBar run={run} stepIdx={stepIdx} />

              <FrameTimeline run={run} refs={refs} stepIdx={stepIdx} />

              <div className="grid-2">
                <PageTable run={run} refs={refs} stepIdx={stepIdx} />
                <WorkingSetPanel refs={refs} stepIdx={stepIdx} delta={delta} />
              </div>

              <CompareTable results={results} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
