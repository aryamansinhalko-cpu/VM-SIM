/**
 * Home page — professional landing for the VM Simulator.
 */
import { Link } from 'react-router-dom';
import { Cpu, Play, GitCompare, FlaskConical, History, ArrowRight, Zap, ShieldCheck, BookOpen, BarChart2 } from 'lucide-react';

// Static mini-preview data (always visible in hero)
const PREVIEW_REFS   = [7,0,1,2,0,3,0,4,2,3,0,3];
const PREVIEW_FRAMES = 3;
// Pre-computed for display (LRU result snapshot)
const PREVIEW_STEPS = [
  { ref:7, frames:['7','-','-'], hf:'F' },
  { ref:0, frames:['7','0','-'], hf:'F' },
  { ref:1, frames:['7','0','1'], hf:'F' },
  { ref:2, frames:['2','0','1'], hf:'F' },
  { ref:0, frames:['2','0','1'], hf:'H', now:true },
  { ref:3, frames:['2','0','3'], hf:'F' },
  { ref:0, frames:['2','0','3'], hf:'H' },
  { ref:4, frames:['2','4','3'], hf:'F' },
];

const FEATURES = [
  { icon:<Cpu size={20}/>,        color:'#6366f1', title:'5 Algorithms',          desc:'FIFO, LRU, OPT, Clock (Second-Chance), NRU — all simulated step by step with full state visibility.' },
  { icon:<Play size={20}/>,       color:'#10b981', title:'Interactive Playback',   desc:'Play, pause, rewind, or jump to any step. Use keyboard shortcuts for lightning-fast navigation.' },
  { icon:<GitCompare size={20}/>, color:'#f59e0b', title:'Algorithm Showdown',     desc:'Run all 5 algorithms simultaneously on the same input — see fault counts and rankings update live.' },
  { icon:<FlaskConical size={20}/>,color:'#f43f5e',title:'Thrashing Lab',          desc:'Visualize how CPU utilization collapses past the working-set threshold with interactive controls.' },
  { icon:<BarChart2 size={20}/>,  color:'#a78bfa', title:'Session History',        desc:'Save named runs, reload them later, compare across policies and frame counts, export as PDF or CSV.' },
  { icon:<BookOpen size={20}/>,   color:'#38bdf8', title:'Working Set Model',      desc:'Track the Δ-window working set at every step and understand why thrashing happens.' },
];

const STEPS = [
  { n:'01', title:'Enter a Reference String', desc:"Type page numbers, use the visual click-to-build palette, or pick a preset (Random, Locality, Belady's Anomaly)." },
  { n:'02', title:'Set Frames & Algorithm',   desc:'Choose how many physical frames are available and which replacement policy to visualize.' },
  { n:'03', title:'Step Through & Explore',   desc:'Hit Play or step one reference at a time. The Frame Timeline, Page Table, and Working Set all update live.' },
  { n:'04', title:'Compare & Export',         desc:'Open Algorithm Showdown to see all 5 policies side-by-side, then export a PDF or CSV report.' },
];

export default function Home() {
  return (
    <div className="home-wrapper">

      {/* ── Hero ── */}
      <section className="hero">
        <div className="hero-tag"><Zap size={11}/> Interactive Visualizer · v2.0</div>
        <h1 className="hero-title">
          Understand<br/>
          <span className="grad">Virtual Memory</span><br/>
          Like an OS Engineer
        </h1>
        <p className="hero-sub">
          A professional-grade simulator for demand paging and thrashing.
          Step through page faults, compare five algorithms in real time, and watch thrashing emerge.
        </p>
        <div className="hero-cta">
          <Link to="/simulator" className="link-btn link-btn-primary">
            Open Simulator <ArrowRight size={15}/>
          </Link>
          <Link to="/compare" className="link-btn link-btn-ghost">
            Algorithm Showdown
          </Link>
        </div>

        {/* Stats */}
        <div className="hero-stats" style={{marginBottom:'2.5rem'}}>
          {[['5','Algorithms'],['21','Tests Passing'],['∞','Reference Strings'],['4','Pages']].map(([v,l])=>(
            <div className="hero-stat" key={l}>
              <span className="hero-stat-val">{v}</span>
              <span className="hero-stat-lbl">{l}</span>
            </div>
          ))}
        </div>

        {/* Live preview card */}
        <div className="hero-preview">
          <div className="hero-preview-bar">
            <span className="hero-dot hero-dot-r"/><span className="hero-dot hero-dot-y"/><span className="hero-dot hero-dot-g"/>
            <span className="hero-preview-title">vm-sim · LRU · 3 frames</span>
          </div>
          <div className="hero-preview-body">
            <div className="mini-timeline">
              {PREVIEW_STEPS.map((s,i)=>(
                <div className="mini-col" key={i}>
                  <div className={`mini-ref${s.now?' now':''}`}>{s.ref}</div>
                  {s.frames.map((f,fi)=>(
                    <div
                      key={fi}
                      className={`mini-frame${s.hf==='F'&&f!=='-'&&i<=4&&fi===0?' fault':s.hf==='H'?' hit':''} ${s.now?' active':''}`}
                    >{f==='-'?'':f}</div>
                  ))}
                  <div className={`mini-result${s.hf==='F'?' f':' h'}`}>{s.hf}</div>
                </div>
              ))}
            </div>
            <div className="mini-stats">
              <span className="mini-stat f">Faults: <strong>6</strong></span>
              <span className="mini-stat h">Hits: <strong>2</strong></span>
              <span className="mini-stat">Rate: <strong style={{color:'var(--primary)'}}>75%</strong></span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="features-section">
        <div className="section-eyebrow">What's Inside</div>
        <h2 className="section-title">Everything you need to master paging</h2>
        <p className="section-desc">From basic FIFO to optimal replacement — every concept is interactive and visual.</p>
        <div className="features-grid">
          {FEATURES.map(f=>(
            <div className="feature-card" key={f.title}>
              <div className="feat-icon" style={{color:f.color,background:`${f.color}18`}}>{f.icon}</div>
              <div className="feat-title">{f.title}</div>
              <div className="feat-desc">{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="how-section">
        <div className="section-eyebrow">Quick Start</div>
        <h2 className="section-title">Up and running in 60 seconds</h2>
        <div className="steps-grid">
          {STEPS.map(s=>(
            <div className="step-row" key={s.n}>
              <div className="step-num">{s.n}</div>
              <div>
                <div className="step-title">{s.title}</div>
                <div className="step-desc">{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA Band ── */}
      <div className="cta-band">
        <h2>Ready to visualize virtual memory?</h2>
        <p>Simulate any reference string with any algorithm in seconds — no setup required.</p>
        <div style={{display:'flex',gap:'.85rem',justifyContent:'center',flexWrap:'wrap'}}>
          <Link to="/simulator"  className="link-btn link-btn-primary"><Play size={14}/> Start Simulator</Link>
          <Link to="/thrashing"  className="link-btn link-btn-ghost"><FlaskConical size={14}/> Thrashing Lab</Link>
          <Link to="/compare"    className="link-btn link-btn-ghost"><GitCompare size={14}/> Showdown</Link>
        </div>
      </div>

    </div>
  );
}
