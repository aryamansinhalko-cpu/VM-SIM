/**
 * Algorithm Showdown — all 5 policies running simultaneously,
 * synchronized step-by-step on the same reference string.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { parseRefs, randomRefs, localityRefs } from '../engine/refstring.js';
import { simulate, POLICIES } from '../engine/paging.js';
import { GitCompare, Play, Pause, SkipForward, SkipBack, RotateCcw, ChevronsRight, Shuffle, Layers, AlertTriangle, Trophy, AlertCircle } from 'lucide-react';

const DEFAULT = '7 0 1 2 0 3 0 4 2 3 0 3 2 1 2 0 1 7 0 1';
const ALGO_COLORS = { FIFO:'#6366f1', LRU:'#10b981', OPT:'#f59e0b', CLOCK:'#a78bfa', NRU:'#f472b6' };

function MiniTimeline({ run, refs, stepIdx }) {
  if (!run) return null;
  return (
    <div style={{overflowX:'auto'}}>
      <table className="timeline" style={{fontSize:'.7rem'}}>
        <thead>
          <tr>
            <th className="row-label" style={{fontSize:'.65rem'}}>Ref</th>
            {refs.map((r,i) => (
              <th key={i} className={i===stepIdx?'tl-now':i<stepIdx?'':'tl-future-head'}>{r}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({length:run.frameCount},(_,f)=>(
            <tr key={f}>
              <th className="row-label" style={{fontSize:'.65rem'}}>F{f}</th>
              {run.steps.map((s,i)=>{
                let cls='';
                const isActive = i===stepIdx;
                if (i>stepIdx) cls='tl-future';
                else if (s.slot===f&&!s.hit) cls=s.evicted!==null?'tl-fault tl-victim':'tl-fault';
                else if (s.hit&&s.slot===f) cls='tl-hit';
                return (
                  <td key={i} className={cls}
                    style={isActive&&i<=stepIdx?{outline:'2px solid var(--active)',outlineOffset:'-2px'}:undefined}>
                    {i<=stepIdx?(s.frames[f]??''):''}
                  </td>
                );
              })}
            </tr>
          ))}
          <tr>
            <th className="row-label" style={{fontSize:'.65rem'}}>H/F</th>
            {run.steps.map((s,i)=>(
              <td key={i}
                className={i>stepIdx?'tl-future':s.hit?'tl-hit':'tl-fault'}
                style={i===stepIdx?{outline:'2px solid var(--active)',outlineOffset:'-2px'}:undefined}>
                {i<=stepIdx?(s.hit?'H':'F'):''}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default function Compare() {
  const [text,    setText]    = useState(DEFAULT);
  const [frames,  setFrames]  = useState(3);
  const [stepIdx, setStepIdx] = useState(-1);
  const [playing, setPlaying] = useState(false);
  const [speed,   setSpeed]   = useState(500);

  const refs = useMemo(() => parseRefs(text), [text]);
  const results = useMemo(
    () => refs ? Object.fromEntries(POLICIES.map(p=>[p, simulate(refs,frames,p)])) : null,
    [refs,frames]
  );
  const maxStep = results ? results['FIFO'].steps.length-1 : -1;

  useEffect(()=>{
    if (!playing||!results) return;
    if (stepIdx>=maxStep){setPlaying(false);return;}
    const id=setTimeout(()=>setStepIdx(i=>i+1),speed);
    return ()=>clearTimeout(id);
  },[playing,stepIdx,results,speed,maxStep]);

  const reset = useCallback(()=>{setStepIdx(-1);setPlaying(false);},[]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(reset,[text,frames]);

  useEffect(()=>{
    const h=e=>{
      if(e.target.tagName==='INPUT') return;
      if(e.key==='ArrowLeft')  setStepIdx(i=>Math.max(-1,i-1));
      else if(e.key==='ArrowRight') setStepIdx(i=>Math.min(maxStep,i+1));
      else if(e.key===' '){e.preventDefault();setPlaying(p=>!p);}
    };
    window.addEventListener('keydown',h);
    return ()=>window.removeEventListener('keydown',h);
  },[maxStep]);

  const onRandom   = ()=>setText(randomRefs(20,8,Date.now()%10000).join(' '));
  const onLocality = ()=>setText(localityRefs(30,12,4,10,Date.now()%10000).join(' '));
  const onBelady   = ()=>{setText('1 2 3 4 1 2 5 1 2 3 4 5');setFrames(3);};

  const bestFaults = results ? Math.min(...POLICIES.map(p=>results[p].faults)) : Infinity;

  return (
    <div className="page-wrapper">
      <div className="section-header" style={{paddingTop:'1.25rem'}}>
        <div style={{display:'flex',alignItems:'center',gap:'.5rem',marginBottom:'.35rem'}}>
          <GitCompare size={20} style={{color:'var(--primary)'}}/>
          <h1 style={{fontSize:'1.75rem',fontWeight:800,letterSpacing:'-.03em'}}>Algorithm Showdown</h1>
        </div>
        <p style={{color:'var(--text-2)',fontSize:'.9rem'}}>
          All 5 replacement policies running simultaneously on the same input — synchronized step by step.
        </p>
      </div>

      {/* Shared controls */}
      <div className="card" style={{marginBottom:'1rem'}}>
        <div className="grid-2" style={{gap:'1.25rem',alignItems:'end'}}>
          <div>
            <label className="field-label">Reference String</label>
            <input type="text" value={text} onChange={e=>setText(e.target.value)}
              placeholder="e.g. 7 0 1 2 0 3 0 4" spellCheck={false} style={{marginTop:'.3rem'}}/>
            <div className="row" style={{marginTop:'.5rem',gap:'.35rem'}}>
              <button className="btn-ghost" style={{fontSize:'.75rem'}} onClick={onRandom}><Shuffle size={11}/> Random</button>
              <button className="btn-ghost" style={{fontSize:'.75rem'}} onClick={onLocality}><Layers size={11}/> Locality</button>
              <button className="btn-ghost" style={{fontSize:'.75rem'}} onClick={onBelady}><AlertTriangle size={11}/> Belady</button>
            </div>
          </div>
          <div>
            <label className="field-label">Frames: <span className="speed-value">{frames}</span></label>
            <input type="range" min={1} max={10} value={frames} onChange={e=>setFrames(+e.target.value)}/>
            <div className="range-labels"><span>1</span><span>10</span></div>
          </div>
        </div>

        {/* Playback */}
        <div style={{height:'1px',background:'var(--border)',margin:'1rem 0'}}/>
        <div className="row">
          <button onClick={()=>setStepIdx(i=>Math.max(-1,i-1))} disabled={stepIdx<0}><SkipBack size={13}/> Back</button>
          <button className={`btn-play${playing?' is-pausing':''}`}
            onClick={()=>setPlaying(p=>!p)} disabled={stepIdx>=maxStep}>
            {playing?<><Pause size={13}/> Pause</>:<><Play size={13}/> Play</>}
          </button>
          <button onClick={()=>setStepIdx(i=>Math.min(maxStep,i+1))} disabled={stepIdx>=maxStep}>Step <SkipForward size={13}/></button>
          <button onClick={()=>setStepIdx(maxStep)} disabled={stepIdx>=maxStep}><ChevronsRight size={13}/> Run All</button>
          <button onClick={reset}><RotateCcw size={13}/> Reset</button>
          <span style={{marginLeft:'auto',fontSize:'.78rem',color:'var(--text-3)',fontFamily:'monospace'}}>
            Step {Math.max(0,stepIdx+1)} / {maxStep+1}
          </span>
          <div style={{display:'flex',alignItems:'center',gap:'.5rem'}}>
            <span style={{fontSize:'.72rem',color:'var(--text-3)'}}>Speed</span>
            <input type="range" min={100} max={1500} step={100} value={speed}
              onChange={e=>setSpeed(+e.target.value)} style={{width:90}}/>
          </div>
        </div>
      </div>

      {!refs && (
        <div className="error-box"><AlertCircle size={16} style={{flexShrink:0}}/>Invalid reference string.</div>
      )}

      {/* Leaderboard */}
      {results && (
        <div className="card" style={{marginBottom:'1rem'}}>
          <div className="card-title"><Trophy size={15}/> Live Leaderboard</div>
          <div style={{display:'flex',gap:'.5rem',flexWrap:'wrap'}}>
            {[...POLICIES].sort((a,b)=>results[a].faults-results[b].faults).map((p,rank)=>{
              const r=results[p];
              const isBest=r.faults===bestFaults;
              const step=stepIdx>=0?r.steps[stepIdx]:null;
              const faultsSoFar=step?step.faults:0;
              return (
                <div key={p} style={{
                  flex:'1',minWidth:120,
                  background:isBest?'rgba(16,185,129,.08)':'var(--surface-2)',
                  border:`1px solid ${isBest?'rgba(16,185,129,.25)':'var(--border)'}`,
                  borderRadius:'var(--r)',padding:'.7rem .9rem',
                  transition:'all .2s'
                }}>
                  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'.3rem'}}>
                    <span style={{
                      fontFamily:'monospace',fontWeight:800,fontSize:'.8rem',
                      color:ALGO_COLORS[p]
                    }}>{p}</span>
                    <span className={`rank-chip rank-${Math.min(rank+1,3)}`}>#{rank+1}</span>
                  </div>
                  <div style={{fontFamily:'monospace',fontSize:'1.3rem',fontWeight:900,
                    color:isBest?'var(--hit)':'var(--text-1)',letterSpacing:'-.03em'}}>
                    {faultsSoFar}
                  </div>
                  <div style={{fontSize:'.68rem',color:'var(--text-3)',marginTop:'.1rem'}}>
                    faults / {Math.max(0,stepIdx+1)} refs
                  </div>
                  <div style={{marginTop:'.4rem',height:3,background:'var(--surface-4)',borderRadius:99,overflow:'hidden'}}>
                    <div style={{
                      height:'100%',borderRadius:99,
                      background:ALGO_COLORS[p],
                      width:`${stepIdx>=0?(faultsSoFar/(stepIdx+1)*100).toFixed(0):0}%`,
                      transition:'width .3s'
                    }}/>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* All 5 timelines */}
      {results && (
        <div className="compare-grid">
          {POLICIES.map(p=>{
            const r=results[p];
            const isBest=r.faults===bestFaults;
            const step=stepIdx>=0?r.steps[stepIdx]:null;
            const faultsSoFar=step?step.faults:0;
            return (
              <div className="algo-mini-card" key={p} style={{
                borderColor:isBest?'rgba(16,185,129,.3)':undefined,
              }}>
                <div className="algo-mini-header">
                  <div style={{display:'flex',alignItems:'center',gap:'.5rem'}}>
                    <span style={{
                      display:'inline-block',width:8,height:8,borderRadius:99,
                      background:ALGO_COLORS[p],
                      boxShadow:`0 0 6px ${ALGO_COLORS[p]}`
                    }}/>
                    <span className="algo-mini-name" style={{color:ALGO_COLORS[p]}}>{p}</span>
                    {isBest&&<span className="badge">Best</span>}
                  </div>
                  <span className={`algo-mini-faults${isBest?' best':''}`}>
                    {faultsSoFar} fault{faultsSoFar!==1?'s':''}
                  </span>
                </div>
                <div className="algo-mini-body">
                  <MiniTimeline run={r} refs={refs} stepIdx={stepIdx}/>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
