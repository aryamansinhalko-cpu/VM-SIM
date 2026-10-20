/**
 * PageTable — virtual-to-physical mapping with modern data-table style.
 */
import { AlertTriangle, CheckCircle2, Info, Table2 } from 'lucide-react';

export default function PageTable({ run, refs, stepIdx }) {
  const pages  = [...new Set(refs)].sort((a,b)=>a-b);
  const step   = stepIdx>=0 ? run.steps[stepIdx] : null;
  const frames = step ? step.frames : Array(run.frameCount).fill(null);

  return (
    <div className="card">
      <div className="card-title"><Table2 size={15}/> Page Table</div>
      <table className="data-table">
        <thead>
          <tr>
            <th>Page</th>
            <th>Valid</th>
            <th>Frame #</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {pages.map(pg=>{
            const fi      = frames.indexOf(pg);
            const inMem   = fi !== -1;
            const isCur   = step && step.page===pg;
            const isEvict = step && step.evicted===pg;
            return (
              <tr key={pg} className={isCur?'pt-active':isEvict?'pt-evicted':''}>
                <td style={{fontWeight:isCur?700:400,textAlign:'left'}}>{pg}</td>
                <td><span className={`valid-pill ${inMem?'valid-in':'valid-out'}`}>{inMem?'● 1':'○ 0'}</span></td>
                <td>{inMem?fi:'—'}</td>
                <td style={{textAlign:'left'}}>
                  {isCur&&!step.hit&&<span style={{color:'var(--fault)',fontWeight:600,fontSize:'.77rem'}}>⚡ Fault</span>}
                  {isCur&&step.hit &&<span style={{color:'var(--hit)', fontWeight:600,fontSize:'.77rem'}}>✓ Hit</span>}
                  {isEvict         &&<span style={{color:'var(--active)',fontWeight:600,fontSize:'.77rem'}}>↑ Evicted</span>}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {step&&!step.hit&&(
        <div className="event-box ev-fault">
          <AlertTriangle size={15} className="event-box-ico" style={{color:'var(--fault)'}}/>
          <span>
            <strong>Page Fault</strong> — Page <code style={{background:'rgba(244,63,94,.15)',padding:'0 4px',borderRadius:3,fontFamily:'monospace'}}>{step.page}</code> not in memory.
            {step.evicted!==null
              ?` Evicted page ${step.evicted} from frame ${step.slot} → loaded page ${step.page}.`
              :` Loaded into free frame ${step.slot}.`}
          </span>
        </div>
      )}
      {step&&step.hit&&(
        <div className="event-box ev-hit">
          <CheckCircle2 size={15} className="event-box-ico" style={{color:'var(--hit)'}}/>
          <span><strong>Hit</strong> — Page <code style={{background:'rgba(16,185,129,.15)',padding:'0 4px',borderRadius:3,fontFamily:'monospace'}}>{step.page}</code> already in frame {step.slot}. No disk I/O needed.</span>
        </div>
      )}
      {!step&&(
        <div className="event-box ev-idle">
          <Info size={15} className="event-box-ico" style={{color:'var(--text-3)'}}/>
          <span>Press <strong>Play</strong> or step through the simulation to inspect the page table.</span>
        </div>
      )}
    </div>
  );
}
