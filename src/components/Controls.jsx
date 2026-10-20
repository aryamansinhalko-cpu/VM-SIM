/**
 * Controls — sidebar command panel with all 5 policies and a save-to-history button.
 */
import { Play, Pause, SkipBack, SkipForward, RotateCcw, ChevronsRight, Shuffle, Layers, AlertTriangle, Sliders, Cpu, Save } from 'lucide-react';

const DEFAULT_POLICIES = ['FIFO','LRU','OPT'];
const STORAGE_KEY = 'vm-sim-history';
const MAX = 20;

function saveRun(run, refs, name) {
  if (!run || !refs) return;
  try {
    const prev = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const entry = {
      id:        Date.now(),
      name:      name || `Run ${new Date().toLocaleTimeString()}`,
      policy:    run.policy,
      frames:    run.frameCount,
      faults:    run.faults,
      hits:      run.hits,
      faultRate: run.faultRate,
      refs,
      savedAt:   new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify([entry, ...prev].slice(0, MAX)));
    return true;
  } catch { return false; }
}

export default function Controls({ allPolicies, run, refs, ...p }) {
  const policies = allPolicies || DEFAULT_POLICIES;

  const handleSave = () => {
    const name = prompt('Name this run (leave blank for auto-name):');
    if (name === null) return; // cancelled
    const ok = saveRun(run, refs, name);
    if (ok) alert('✓ Run saved to My Sessions!');
  };

  return (
    <div className="controls-panel">
      {/* Reference string */}
      <div>
        <label className="field-label"><Cpu size={12}/> Reference String</label>
        <input
          type="text" value={p.text} onChange={e=>p.setText(e.target.value)}
          placeholder="e.g. 7 0 1 2 0 3 0 4 2 3" spellCheck={false}
          style={{marginTop:'.3rem'}}
        />
        <div className="row" style={{marginTop:'.5rem',gap:'.3rem'}}>
          <button onClick={p.onRandom}   style={{fontSize:'.73rem'}}><Shuffle       size={11}/> Random</button>
          <button onClick={p.onLocality} style={{fontSize:'.73rem'}}><Layers        size={11}/> Locality</button>
          <button onClick={p.onBelady}   style={{fontSize:'.73rem'}}><AlertTriangle size={11}/> Belady</button>
        </div>
      </div>

      <div className="controls-sep"/>

      {/* Frames */}
      <div>
        <label className="field-label"><Sliders size={12}/> Frames &nbsp;<span className="speed-value">{p.frames}</span></label>
        <input type="range" min={1} max={10} value={p.frames} onChange={e=>p.setFrames(+e.target.value)}/>
        <div className="range-labels"><span>1</span><span>10</span></div>
      </div>

      {/* Policy */}
      <div>
        <label className="field-label" style={{marginBottom:'.5rem'}}>Policy</label>
        <div className="policy-pills">
          {policies.map(x=>(
            <button key={x} className={`policy-pill${p.policy===x?' active':''}`} onClick={()=>p.setPolicy(x)}>{x}</button>
          ))}
        </div>
      </div>

      <div className="controls-sep"/>

      {/* Playback */}
      <div className="controls-actions">
        <button onClick={()=>p.setStepIdx(Math.max(-1,p.stepIdx-1))} disabled={p.stepIdx<0} title="← Back">
          <SkipBack size={13}/> Back
        </button>
        <button className={`btn-play${p.playing?' is-pausing':''}`}
          onClick={()=>p.setPlaying(!p.playing)} disabled={p.stepIdx>=p.maxStep}>
          {p.playing?<><Pause size={13}/> Pause</>:<><Play size={13}/> Play</>}
        </button>
        <button onClick={()=>p.setStepIdx(Math.min(p.maxStep,p.stepIdx+1))} disabled={p.stepIdx>=p.maxStep}>
          Step <SkipForward size={13}/>
        </button>
        <button onClick={()=>p.setStepIdx(p.maxStep)} disabled={p.stepIdx>=p.maxStep} title="Jump to end">
          <ChevronsRight size={13}/> All
        </button>
        <button onClick={p.reset} title="Reset"><RotateCcw size={13}/></button>
      </div>

      {/* Speed */}
      <div>
        <label className="field-label"><Play size={12}/> Speed &nbsp;<span className="speed-value">{p.speed} ms</span></label>
        <input type="range" min={100} max={1500} step={100} value={p.speed} onChange={e=>p.setSpeed(+e.target.value)}/>
        <div className="range-labels"><span>Fast</span><span>Slow</span></div>
      </div>

      {/* Save */}
      {run && (
        <>
          <div className="controls-sep"/>
          <button onClick={handleSave} className="btn-success" style={{width:'100%',justifyContent:'center'}}>
            <Save size={13}/> Save to My Sessions
          </button>
        </>
      )}
    </div>
  );
}
