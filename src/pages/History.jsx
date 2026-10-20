/**
 * My Sessions — full-page session history with saved runs, comparison table, and export hub.
 */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, Trash2, RotateCcw, History, Download, FileText, Trophy, Inbox } from 'lucide-react';
import { exportPDF, exportCSV } from '../utils/export.js';

const STORAGE_KEY = 'vm-sim-history';
const MAX = 20;

function load() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; } catch { return []; }
}
function save(entries) { localStorage.setItem(STORAGE_KEY, JSON.stringify(entries)); }

const ALGO_COLORS = { FIFO:'#6366f1', LRU:'#10b981', OPT:'#f59e0b', CLOCK:'#a78bfa', NRU:'#f472b6' };

export default function SessionHistory() {
  const [entries, setEntries] = useState(load);
  const navigate = useNavigate();

  useEffect(()=>{ save(entries); },[entries]);

  const remove  = id => setEntries(e=>e.filter(x=>x.id!==id));
  const clearAll= ()=>{ if(confirm('Clear all saved sessions?')) setEntries([]); };

  const doLoad  = entry => {
    // Store in sessionStorage for the Simulator page to pick up
    sessionStorage.setItem('vm-sim-load', JSON.stringify(entry));
    navigate('/simulator');
  };

  const doCSV = entry => {
    const csv  = exportCSV({ policy:entry.policy, frameCount:entry.frames, faults:entry.faults, hits:entry.hits, faultRate:entry.faultRate, steps:entry.steps||[] }, entry.refs);
    const blob = new Blob([csv],{type:'text/csv'});
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href=url; a.download=`vm-sim-${entry.policy}-${entry.name.replace(/\s+/g,'-')}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const bestFaults = entries.length ? Math.min(...entries.map(e=>e.faults)) : Infinity;

  const sortedEntries = [...entries].sort((a,b)=>b.id-a.id);

  return (
    <div className="page-wrapper">
      <div className="section-header" style={{paddingTop:'1.25rem'}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:'.5rem'}}>
          <div style={{display:'flex',alignItems:'center',gap:'.5rem'}}>
            <History size={20} style={{color:'var(--primary)'}}/>
            <h1 style={{fontSize:'1.75rem',fontWeight:800,letterSpacing:'-.03em'}}>My Sessions</h1>
          </div>
          <div className="row">
            <span style={{fontSize:'.8rem',color:'var(--text-3)'}}>{entries.length} / {MAX} saved</span>
            {entries.length > 0 && (
              <button className="btn-danger" onClick={clearAll}><Trash2 size={13}/> Clear All</button>
            )}
          </div>
        </div>
        <p style={{color:'var(--text-2)',fontSize:'.9rem',marginTop:'.3rem'}}>
          Save simulation runs from the Simulator page, then compare, reload, or export them here.
        </p>
      </div>

      {/* How to save — shown when empty */}
      {entries.length === 0 ? (
        <div className="card" style={{textAlign:'center',padding:'4rem 2rem'}}>
          <Inbox size={48} style={{color:'var(--text-3)',margin:'0 auto .85rem',display:'block',opacity:.35}}/>
          <h3 style={{fontWeight:700,marginBottom:'.4rem',color:'var(--text-1)'}}>No saved sessions yet</h3>
          <p style={{color:'var(--text-3)',fontSize:'.85rem',marginBottom:'1.25rem'}}>
            Run a simulation, then use the Save button in the simulator sidebar to store a snapshot here.
          </p>
          <button className="btn-primary" onClick={()=>navigate('/simulator')}>
            <RotateCcw size={13}/> Go to Simulator
          </button>
        </div>
      ) : (
        <>
          {/* Summary cards */}
          <div className="grid-3" style={{marginBottom:'1rem'}}>
            <div className="stat-card primary-card">
              <div className="stat-label"><Save size={11}/> Total Runs</div>
              <div className="stat-value">{entries.length}</div>
            </div>
            <div className="stat-card hit-card">
              <div className="stat-label"><Trophy size={11}/> Best Fault Count</div>
              <div className="stat-value">{bestFaults}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Algorithms Used</div>
              <div style={{display:'flex',flexWrap:'wrap',gap:'.3rem',marginTop:'.3rem'}}>
                {[...new Set(entries.map(e=>e.policy))].map(p=>(
                  <span key={p} style={{
                    fontFamily:'monospace',fontWeight:700,fontSize:'.78rem',
                    color:ALGO_COLORS[p]||'var(--text-2)',
                    background:`${ALGO_COLORS[p]||'#fff'}15`,
                    border:`1px solid ${ALGO_COLORS[p]||'var(--border)'}30`,
                    borderRadius:99,padding:'.1rem .5rem'
                  }}>{p}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Main table */}
          <div className="card">
            <div style={{overflowX:'auto'}}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{textAlign:'left'}}>Name</th>
                    <th>Policy</th>
                    <th>Frames</th>
                    <th>Refs</th>
                    <th>Faults</th>
                    <th>Hits</th>
                    <th>Fault %</th>
                    <th>Saved</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedEntries.map(e=>{
                    const isBest = e.faults === bestFaults;
                    return (
                      <tr key={e.id} className={isBest?'best-row':''}>
                        <td style={{textAlign:'left',maxWidth:160,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',fontWeight:600}}>
                          {isBest&&<Trophy size={11} style={{color:'var(--active)',marginRight:4,verticalAlign:'middle'}}/>}
                          {e.name}
                          {isBest&&<span className="badge">Best</span>}
                        </td>
                        <td>
                          <span style={{
                            fontFamily:'monospace',fontWeight:800,fontSize:'.78rem',
                            color:ALGO_COLORS[e.policy]||'var(--text-1)'
                          }}>{e.policy}</span>
                        </td>
                        <td>{e.frames}</td>
                        <td>{e.refs?.length||'—'}</td>
                        <td style={{color:isBest?'var(--hit)':'var(--fault)',fontWeight:700}}>{e.faults}</td>
                        <td style={{color:'var(--hit)'}}>{e.hits}</td>
                        <td style={{color:e.faultRate>.5?'var(--fault)':'var(--hit)'}}>
                          {(e.faultRate*100).toFixed(1)}%
                        </td>
                        <td style={{color:'var(--text-3)',fontSize:'.75rem'}}>
                          {new Date(e.savedAt).toLocaleString('en-IN',{dateStyle:'short',timeStyle:'short'})}
                        </td>
                        <td>
                          <div className="row" style={{gap:'.25rem',justifyContent:'center'}}>
                            <button onClick={()=>doLoad(e)} title="Load in Simulator"
                              style={{padding:'.25rem .5rem',fontSize:'.72rem'}}>
                              <RotateCcw size={10}/> Load
                            </button>
                            <button onClick={()=>doCSV(e)} title="Export CSV"
                              style={{padding:'.25rem .5rem',fontSize:'.72rem'}}>
                              <Download size={10}/>
                            </button>
                            <button onClick={()=>remove(e.id)} title="Delete" className="btn-danger"
                              style={{padding:'.25rem .5rem',fontSize:'.72rem'}}>
                              <Trash2 size={10}/>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Fault rate comparison chart */}
          <div className="card" style={{marginTop:'.85rem'}}>
            <div className="card-title">Fault Rate Comparison</div>
            <div style={{display:'flex',flexDirection:'column',gap:'.5rem'}}>
              {sortedEntries.map(e=>{
                const maxRate = Math.max(...entries.map(x=>x.faultRate), .01);
                const pct     = (e.faultRate/maxRate*100).toFixed(0);
                return (
                  <div key={e.id} style={{display:'flex',alignItems:'center',gap:.75+'rem'}}>
                    <span style={{
                      fontSize:'.72rem',fontFamily:'monospace',fontWeight:700,
                      color:ALGO_COLORS[e.policy]||'var(--text-2)',
                      width:40,flexShrink:0
                    }}>{e.policy}</span>
                    <span style={{fontSize:'.7rem',color:'var(--text-3)',width:90,flexShrink:0,
                      overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{e.name}</span>
                    <div style={{flex:1,height:6,background:'var(--surface-4)',borderRadius:99,overflow:'hidden'}}>
                      <div style={{
                        height:'100%',borderRadius:99,
                        background:ALGO_COLORS[e.policy]||'var(--primary)',
                        width:`${pct}%`,transition:'width .4s'
                      }}/>
                    </div>
                    <span style={{fontSize:'.72rem',fontFamily:'monospace',color:'var(--text-2)',width:40,textAlign:'right'}}>
                      {(e.faultRate*100).toFixed(1)}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
