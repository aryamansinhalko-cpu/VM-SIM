/**
 * FrameTimeline — IDE-style debugger grid with new CSS classes.
 */
import { Grid3x3 } from 'lucide-react';

export default function FrameTimeline({ run, refs, stepIdx }) {
  return (
    <div className="card">
      <div className="card-title"><Grid3x3 size={15}/> Frame Timeline</div>
      <div className="legend">
        <span className="legend-item"><span className="legend-dot" style={{background:'var(--fault)',opacity:.8}}/> Fault</span>
        <span className="legend-item"><span className="legend-dot" style={{background:'var(--hit)',opacity:.8}}/> Hit</span>
        <span className="legend-item"><span className="legend-dot" style={{background:'var(--active)',opacity:.8}}/> Active Step</span>
        <span className="legend-item"><span className="legend-dot" style={{background:'transparent',border:'2px solid var(--fault)'}}/> Victim</span>
      </div>

      <div className="timeline-scroll">
        <table className="timeline">
          <thead>
            <tr>
              <th className="row-label">Ref →</th>
              {refs.map((r,i)=>(
                <th key={i} className={i===stepIdx?'tl-now':i<stepIdx?'':'tl-future-head'}>{r}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({length:run.frameCount},(_,f)=>(
              <tr key={f}>
                <th className="row-label">F{f}</th>
                {run.steps.map((s,i)=>{
                  let cls='';
                  const isActive=i===stepIdx;
                  if (i>stepIdx) cls='tl-future';
                  else if (s.slot===f&&!s.hit) cls=s.evicted!==null?'tl-fault tl-victim':'tl-fault';
                  else if (s.hit&&s.slot===f)  cls='tl-hit';
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
              <th className="row-label">H/F</th>
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
    </div>
  );
}
