/**
 * WorkingSetPanel — Δ-window working set tracker with sparkline.
 */
import { useMemo } from 'react';
import { Layers } from 'lucide-react';

function wsAt(refs, t, delta) {
  return [...new Set(refs.slice(Math.max(0, t-delta+1), t+1))];
}

export default function WorkingSetPanel({ refs, stepIdx, delta }) {
  const ws = useMemo(()=>refs&&stepIdx>=0?wsAt(refs,stepIdx,delta):[], [refs,stepIdx,delta]);

  const history = useMemo(()=>{
    if (!refs) return [];
    return refs.map((_,t)=>wsAt(refs,t,delta).length);
  },[refs,delta]);

  const maxWs = Math.max(...history,1);

  return (
    <div className="card">
      <div className="card-title"><Layers size={15}/> Working Set</div>
      <div className="ws-meta-row">
        <span>Δ = <strong style={{color:'var(--primary)',fontFamily:'monospace'}}>{delta}</strong></span>
        <span>|WS| at step {Math.max(0,stepIdx)} = <strong style={{color:'var(--hit)',fontFamily:'monospace'}}>{ws.length}</strong></span>
      </div>
      {ws.length>0
        ? <div className="ws-chips">{ws.map(pg=><span key={pg} className="ws-chip">{pg}</span>)}</div>
        : <p style={{fontSize:'.8rem',color:'var(--text-3)',margin:'.3rem 0 .7rem'}}>Step through to see the working set.</p>
      }
      {history.length>0&&(
        <>
          <div style={{fontSize:'.7rem',color:'var(--text-3)',marginBottom:'.3rem'}}>WS size over time</div>
          <div className="ws-sparkline">
            {history.map((sz,i)=>(
              <div key={i}
                className={`ws-bar${i===stepIdx?' ws-active':''}`}
                style={{height:`${Math.max(4,sz/maxWs*44)}px`}}
                title={`Step ${i}: |WS|=${sz}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
