/**
 * Thrashing Lab — dedicated deep-dive thrashing explorer.
 */
import { useMemo, useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, Title, Tooltip, Legend, Filler,
} from 'chart.js';
import { thrashingCurve, safeProcessCount } from '../engine/thrashing.js';
import { FlaskConical, ShieldCheck, AlertOctagon, Activity, Cpu, Zap } from 'lucide-react';

ChartJS.register(CategoryScale,LinearScale,PointElement,LineElement,Title,Tooltip,Legend,Filler);

const chartOptions = (pts) => ({
  responsive: true,
  interaction:{ mode:'index', intersect:false },
  plugins:{
    legend:{
      position:'top',
      labels:{ color:'#a0a0b8', font:{family:'Inter,sans-serif',size:12}, boxWidth:12, padding:16 }
    },
    tooltip:{
      backgroundColor:'#111118', borderColor:'rgba(255,255,255,.08)', borderWidth:1,
      titleColor:'#f0f0f8', bodyColor:'#a0a0b8', padding:10,
      callbacks:{
        afterLabel:(ctx)=>{
          const pt=pts[ctx.dataIndex];
          return `Frames/proc: ${pt.framesEach}${pt.thrashing?'  ⚠ THRASHING':''}`;
        }
      }
    }
  },
  scales:{
    x:{
      grid:{color:'rgba(255,255,255,.04)'},
      ticks:{color:'#606078',font:{size:11}},
      title:{display:true,text:'# Concurrent Processes',color:'#606078',font:{size:12,weight:'bold'}}
    },
    y:{
      min:0,max:100,
      grid:{color:'rgba(255,255,255,.04)'},
      ticks:{color:'#606078',font:{size:11}},
      title:{display:true,text:'Percentage (%)',color:'#606078',font:{size:12,weight:'bold'}}
    }
  }
});

function makeData(pts) {
  return {
    labels: pts.map(p=>`${p.n}`),
    datasets:[
      {
        label:'CPU Utilization (%)',
        data: pts.map(p=>+(p.cpuUtil*100).toFixed(1)),
        borderColor:'#6366f1',
        backgroundColor:(ctx)=>{
          const {ctx:c,chartArea}=ctx.chart;
          if(!chartArea) return 'rgba(99,102,241,.08)';
          const g=c.createLinearGradient(0,chartArea.top,0,chartArea.bottom);
          g.addColorStop(0,'rgba(99,102,241,.2)');
          g.addColorStop(1,'rgba(99,102,241,.01)');
          return g;
        },
        fill:true, tension:.4, borderWidth:2,
        pointRadius: pts.map(p=>p.thrashing?7:4),
        pointBackgroundColor: pts.map(p=>p.thrashing?'#f43f5e':'#6366f1'),
        pointBorderColor:     pts.map(p=>p.thrashing?'rgba(244,63,94,.4)':'rgba(99,102,241,.4)'),
        pointBorderWidth:2,
      },
      {
        label:'Fault Rate (%)',
        data: pts.map(p=>+(p.faultRate*100).toFixed(1)),
        borderColor:'#f43f5e',
        backgroundColor:(ctx)=>{
          const {ctx:c,chartArea}=ctx.chart;
          if(!chartArea) return 'rgba(244,63,94,.06)';
          const g=c.createLinearGradient(0,chartArea.top,0,chartArea.bottom);
          g.addColorStop(0,'rgba(244,63,94,.15)');
          g.addColorStop(1,'rgba(244,63,94,.01)');
          return g;
        },
        fill:true, tension:.4, borderWidth:2,
        pointRadius:3, pointBackgroundColor:'#f43f5e',
      }
    ]
  };
}

export default function ThrashingPage() {
  const [total, setTotal] = useState(60);
  const [ws,    setWs]    = useState(10);
  const [cost,  setCost]  = useState(100);

  const pts  = useMemo(()=>thrashingCurve({totalFrames:total,wsSize:ws,faultCost:cost}),[total,ws,cost]);
  const safe = safeProcessCount(total,ws);
  const data = useMemo(()=>makeData(pts),[pts]);

  const peakUtil = pts.length ? Math.max(...pts.map(p=>p.cpuUtil*100)).toFixed(1) : '—';
  const thrashCount = pts.filter(p=>p.thrashing).length;
  const thrashStart = pts.find(p=>p.thrashing);

  return (
    <div className="page-wrapper">
      <div className="section-header" style={{paddingTop:'1.25rem'}}>
        <div style={{display:'flex',alignItems:'center',gap:'.5rem',marginBottom:'.35rem'}}>
          <FlaskConical size={20} style={{color:'var(--primary)'}}/>
          <h1 style={{fontSize:'1.75rem',fontWeight:800,letterSpacing:'-.03em'}}>Thrashing Lab</h1>
        </div>
        <p style={{color:'var(--text-2)',fontSize:'.9rem'}}>
          Explore how CPU utilization collapses when processes compete for too few frames. Adjust sliders to see the effect in real time.
        </p>
      </div>

      {/* Hero stats */}
      <div className="thrash-hero-stats">
        <div className="thrash-stat">
          <div className="thrash-stat-lbl"><ShieldCheck size={11}/> Safe Limit</div>
          <div className="thrash-stat-val" style={{color:'var(--hit)'}}>{safe} procs</div>
        </div>
        <div className="thrash-stat">
          <div className="thrash-stat-lbl"><Activity size={11}/> Peak CPU Util</div>
          <div className="thrash-stat-val" style={{color:'var(--primary)'}}>{peakUtil}%</div>
        </div>
        <div className="thrash-stat">
          <div className="thrash-stat-lbl"><AlertOctagon size={11}/> Thrashing Zones</div>
          <div className="thrash-stat-val" style={{color:'var(--fault)'}}>{thrashCount}</div>
        </div>
        <div className="thrash-stat">
          <div className="thrash-stat-lbl"><Zap size={11}/> Thrashing Starts at</div>
          <div className="thrash-stat-val" style={{color:'var(--active)'}}>
            {thrashStart?`${thrashStart.n} procs`:'Never'}
          </div>
        </div>
      </div>

      {/* Controls + Chart layout */}
      <div className="thrash-layout">
        {/* Controls */}
        <div className="card">
          <div className="card-title"><Cpu size={15}/> Parameters</div>

          <div style={{display:'flex',flexDirection:'column',gap:'1.1rem'}}>
            <div>
              <label className="field-label">Physical frames: <span className="speed-value">{total}</span></label>
              <input type="range" min={20} max={120} value={total} onChange={e=>setTotal(+e.target.value)}/>
              <div className="range-labels"><span>20</span><span>120</span></div>
            </div>
            <div>
              <label className="field-label">Working set per process: <span className="speed-value">{ws} pages</span></label>
              <input type="range" min={2} max={30} value={ws} onChange={e=>setWs(+e.target.value)}/>
              <div className="range-labels"><span>2</span><span>30</span></div>
            </div>
            <div>
              <label className="field-label">Disk fault cost: <span className="speed-value">{cost}×</span></label>
              <input type="range" min={10} max={500} step={10} value={cost} onChange={e=>setCost(+e.target.value)}/>
              <div className="range-labels"><span>10×</span><span>500×</span></div>
            </div>
          </div>

          <div style={{height:'1px',background:'var(--border)',margin:'1.1rem 0'}}/>

          {/* Explanation */}
          <div style={{fontSize:'.8rem',color:'var(--text-2)',lineHeight:1.7}}>
            <p style={{marginBottom:'.5rem'}}>
              Each of the <em>n</em> processes gets <code style={{background:'var(--surface-3)',padding:'0 .3em',borderRadius:3,fontFamily:'monospace',color:'var(--primary)'}}>⌊{total}/n⌋</code> frames.
            </p>
            <p style={{marginBottom:'.5rem'}}>
              When <strong style={{color:'var(--text-1)'}}>frames/proc &lt; {ws}</strong> (working set size), fault rates explode and CPU utilization crashes.
            </p>
            <p>
              <strong style={{color:'var(--hit)'}}>Fix:</strong> Working-set model — admit only as many processes as memory can support.
              Suspend excess processes until memory is free.
            </p>
          </div>

          <div className="safe-banner" style={{marginTop:'1rem',marginBottom:0}}>
            <ShieldCheck size={14}/>
            Safe at <strong>&nbsp;≤ {safe} processes</strong> &nbsp;·&nbsp; beyond this, thrashing begins.
          </div>
        </div>

        {/* Chart */}
        <div className="card">
          <div className="card-title"><Activity size={15}/> CPU Utilization vs. Multiprogramming Degree</div>
          <p style={{fontSize:'.78rem',color:'var(--text-3)',marginBottom:'1rem'}}>
            <span style={{color:'var(--fault)'}}>Red dots</span> on the utilization line = thrashing.
            The curve rises then sharply collapses at the working-set threshold.
          </p>
          <Line data={data} options={chartOptions(pts)}/>
        </div>
      </div>

      {/* Data table */}
      <div className="card" style={{marginTop:'.85rem'}}>
        <div className="card-title">Detailed Data Table</div>
        <div style={{overflowX:'auto'}}>
          <table className="data-table">
            <thead>
              <tr>
                <th style={{textAlign:'left'}}># Procs</th>
                <th>Frames/proc</th>
                <th>CPU Util %</th>
                <th>Fault Rate %</th>
                <th>State</th>
              </tr>
            </thead>
            <tbody>
              {pts.map(p=>(
                <tr key={p.n} className={p.thrashing?'thrashing-row':''}>
                  <td style={{textAlign:'left',fontWeight:700}}>{p.n}</td>
                  <td>{p.framesEach}</td>
                  <td style={{color:p.thrashing?'var(--fault)':'var(--hit)'}}>{(p.cpuUtil*100).toFixed(1)}</td>
                  <td>{(p.faultRate*100).toFixed(1)}</td>
                  <td>
                    {p.thrashing
                      ? <span className="state-badge state-thrashing"><AlertOctagon size={10}/> Thrashing</span>
                      : <span className="state-badge state-safe"><ShieldCheck size={10}/> Safe</span>
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
