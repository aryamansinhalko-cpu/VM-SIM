/**
 * CompareTable — FIFO vs LRU vs OPT with bar charts.
 */
import { Trophy, Download, Info, BarChart2 } from 'lucide-react';
import { exportCSV } from '../utils/export.js';

export default function CompareTable({ results }) {
  const policies   = Object.values(results);
  const bestFaults = Math.min(...policies.map(r=>r.faults));
  const maxFaults  = Math.max(...policies.map(r=>r.faults));

  const sorted = [...policies].sort((a,b)=>a.faults-b.faults);
  const rankOf = p => sorted.findIndex(r=>r.policy===p)+1;

  const barColor = r => {
    if (r.faults===bestFaults) return 'var(--hit)';
    if (r.faults===maxFaults)  return 'var(--fault)';
    return 'var(--primary)';
  };

  const download = () => {
    const header = 'Policy,Frames,Faults,Hits,Fault Rate (%)';
    const rows   = policies.map(r=>`${r.policy},${r.frameCount},${r.faults},${r.hits},${(r.faultRate*100).toFixed(2)}`);
    const blob   = new Blob([[header,...rows].join('\n')],{type:'text/csv'});
    const url    = URL.createObjectURL(blob);
    const a      = document.createElement('a');
    a.href=url; a.download='page-replacement-comparison.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="card">
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'1rem'}}>
        <div className="card-title" style={{margin:0}}><BarChart2 size={15}/> Policy Comparison</div>
        <button onClick={download} className="btn-success" style={{fontSize:'.75rem'}}>
          <Download size={11}/> Export CSV
        </button>
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th style={{textAlign:'left'}}>Policy</th>
            <th>Frames</th>
            <th>Faults</th>
            <th>Hits</th>
            <th style={{minWidth:140}}>Fault Rate</th>
            <th>Rank</th>
          </tr>
        </thead>
        <tbody>
          {policies.map(r=>{
            const isBest = r.faults===bestFaults;
            const rank   = rankOf(r.policy);
            const barPct = maxFaults>0 ? Math.round(r.faults/maxFaults*100) : 0;
            return (
              <tr key={r.policy} className={isBest?'best-row':''}>
                <td style={{textAlign:'left',fontWeight:700}}>
                  {isBest&&<Trophy size={11} style={{color:'var(--active)',marginRight:4,verticalAlign:'middle'}}/>}
                  {r.policy}
                  {isBest&&<span className="badge">Best</span>}
                </td>
                <td>{r.frameCount}</td>
                <td style={{color:isBest?'var(--hit)':'var(--fault)',fontWeight:700}}>{r.faults}</td>
                <td style={{color:'var(--hit)'}}>{r.hits}</td>
                <td>
                  <div className="compare-bar-wrap">
                    <span style={{fontFamily:'monospace',fontSize:'.78rem',color:barColor(r),minWidth:'3.5rem',textAlign:'right'}}>
                      {(r.faultRate*100).toFixed(1)}%
                    </span>
                    <div className="compare-bar">
                      <div className="compare-bar-fill" style={{width:`${barPct}%`,background:barColor(r)}}/>
                    </div>
                  </div>
                </td>
                <td><span className={`rank-chip rank-${Math.min(rank,3)}`}>#{rank}</span></td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div style={{marginTop:'.75rem',fontSize:'.74rem',color:'var(--text-3)',display:'flex',gap:'.35rem',alignItems:'flex-start'}}>
        <Info size={11} style={{flexShrink:0,marginTop:1}}/>
        OPT is theoretically optimal — it requires future knowledge and cannot be implemented in real systems. Used as a lower bound.
      </div>
    </div>
  );
}
