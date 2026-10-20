/**
 * Simulator page — dashboard-style layout with sidebar controls.
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
import { AlertCircle, Camera, FileText, Download } from 'lucide-react';

const DEFAULT_STRING = '7 0 1 2 0 3 0 4 2 3 0 3 2 1 2 0 1 7 0 1';

export default function Simulator() {
  const [text,    setText]    = useState(DEFAULT_STRING);
  const [frames,  setFrames]  = useState(3);
  const [policy,  setPolicy]  = useState('LRU');
  const [stepIdx, setStepIdx] = useState(-1);
  const [playing, setPlaying] = useState(false);
  const [speed,   setSpeed]   = useState(600);
  const [delta,   setDelta]   = useState(4);
  const mainRef = useRef(null);

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

  useEffect(() => {
    const h = e => {
      if (e.target.tagName === 'INPUT') return;
      if      (e.key === 'ArrowLeft')  setStepIdx(i => Math.max(-1, i-1));
      else if (e.key === 'ArrowRight') setStepIdx(i => Math.min(maxStep, i+1));
      else if (e.key === ' ')          { e.preventDefault(); setPlaying(p => !p); }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [maxStep]);

  const onRandom   = () => setText(randomRefs(20, 8, Date.now()%10000).join(' '));
  const onLocality = () => setText(localityRefs(30,12,4,10,Date.now()%10000).join(' '));
  const onBelady   = () => { setText('1 2 3 4 1 2 5 1 2 3 4 5'); setPolicy('FIFO'); setFrames(3); };

  const refsArr = useMemo(() => refs || [], [refs]);

  const doExportPNG = () => mainRef.current && exportPNG(mainRef.current, 'vm-sim');
  const doExportPDF = () => run && refs && exportPDF(run, refs);
  const doExportCSV = () => {
    if (!run || !refs) return;
    const csv  = exportCSV(run, refs);
    const blob = new Blob([csv], { type:'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href=url; a.download=`vm-sim-${run.policy}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="page-wrapper" ref={mainRef}>
      {/* Toolbar */}
      <div className="sim-toolbar">
        <div>
          <h1 className="sim-title">Simulator</h1>
          <p style={{fontSize:'.82rem',color:'var(--text-3)',marginTop:'.15rem'}}>
            Step through demand paging · <kbd style={{background:'var(--surface-3)',border:'1px solid var(--surface-4)',borderRadius:4,padding:'1px 5px',fontSize:'.75em',fontFamily:'monospace'}}>←</kbd>{' '}
            <kbd style={{background:'var(--surface-3)',border:'1px solid var(--surface-4)',borderRadius:4,padding:'1px 5px',fontSize:'.75em',fontFamily:'monospace'}}>→</kbd>{' '}
            <kbd style={{background:'var(--surface-3)',border:'1px solid var(--surface-4)',borderRadius:4,padding:'1px 5px',fontSize:'.75em',fontFamily:'monospace'}}>Space</kbd>
          </p>
        </div>
        <div className="row">
          <button onClick={doExportPNG} disabled={!run} title="Screenshot"><Camera size={13}/> PNG</button>
          <button onClick={doExportPDF} disabled={!run} title="PDF Report"><FileText size={13}/> PDF</button>
          <button onClick={doExportCSV} disabled={!run} title="CSV Export"><Download size={13}/> CSV</button>
        </div>
      </div>

      {/* Dashboard grid */}
      <div className="sim-layout">

        {/* ── Sidebar ── */}
        <aside className="sim-sidebar">
          <Controls
            text={text} setText={setText}
            frames={frames} setFrames={setFrames}
            policy={policy} setPolicy={setPolicy}
            speed={speed} setSpeed={setSpeed}
            playing={playing} setPlaying={setPlaying}
            stepIdx={stepIdx} setStepIdx={setStepIdx}
            reset={reset} maxStep={maxStep}
            onRandom={onRandom} onLocality={onLocality} onBelady={onBelady}
            allPolicies={POLICIES}
          />

          <RefStringBuilder refs={refsArr} onRefsChange={arr => setText(arr.join(' '))} />

          {/* Delta slider */}
          {run && (
            <div className="card">
              <div className="card-title">Working Set Window</div>
              <label className="field-label">Δ = <span className="speed-value">{delta}</span></label>
              <input type="range" min={1} max={Math.max(1, (refs||[]).length)}
                value={delta} onChange={e => setDelta(+e.target.value)} />
              <div className="range-labels"><span>1</span><span>{(refs||[]).length}</span></div>
            </div>
          )}
        </aside>

        {/* ── Main panel ── */}
        <div className="sim-main">
          {!refs && (
            <div className="error-box">
              <AlertCircle size={16} style={{flexShrink:0}}/>
              Invalid reference string — use non-negative integers separated by spaces or commas.
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
