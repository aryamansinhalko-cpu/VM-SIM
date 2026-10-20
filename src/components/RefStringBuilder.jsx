/**
 * RefStringBuilder — click-to-build visual palette.
 */
import { Trash2, Undo2, PlusCircle } from 'lucide-react';

const PAGES = Array.from({length:16},(_,i)=>i);

export default function RefStringBuilder({ refs, onRefsChange }) {
  return (
    <div className="card">
      <div className="card-title"><PlusCircle size={15}/> String Builder</div>
      <div className="rsb-display">
        {refs.length===0
          ? <span style={{color:'var(--text-3)',fontSize:'.78rem',fontStyle:'italic'}}>Click pages below to append…</span>
          : refs.map((pg,i)=><span key={i} className="rsb-chip">{pg}</span>)
        }
      </div>
      <div className="row" style={{marginBottom:'.7rem',gap:'.35rem'}}>
        <button onClick={()=>onRefsChange(refs.slice(0,-1))} disabled={refs.length===0}><Undo2 size={12}/> Undo</button>
        <button onClick={()=>onRefsChange([])} disabled={refs.length===0} className="btn-danger"><Trash2 size={12}/> Clear</button>
        <span style={{marginLeft:'auto',fontSize:'.72rem',color:'var(--text-3)'}}>{refs.length} refs</span>
      </div>
      <div className="rsb-palette">
        {PAGES.map(pg=>(
          <button key={pg} className="rsb-btn" onClick={()=>onRefsChange([...refs,pg])}>{pg}</button>
        ))}
      </div>
    </div>
  );
}
