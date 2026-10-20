/**
 * StatsBar — live metric cards.
 */
import { AlertCircle, CheckCircle2, TrendingUp, Hash, Cpu, Activity } from 'lucide-react';

export default function StatsBar({ run, stepIdx }) {
  const step      = stepIdx >= 0 ? run.steps[stepIdx] : null;
  const faults    = step ? step.faults : 0;
  const done      = stepIdx + 1;
  const hits      = done - faults;
  const faultRate = done > 0 ? ((faults / done) * 100).toFixed(1) : '0.0';
  const progress  = run.steps.length > 0 ? Math.round((done / run.steps.length) * 100) : 0;

  return (
    <div className="card">
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label"><Activity size={11}/> Progress</div>
          <div className="stat-value" style={{fontSize:'1.2rem'}}>
            {done}<span style={{color:'var(--text-3)',fontWeight:400,fontSize:'.75em'}}> / {run.steps.length}</span>
          </div>
          <div className="progress-track"><div className="progress-fill" style={{width:`${progress}%`}}/></div>
        </div>

        <div className="stat-card primary-card">
          <div className="stat-label"><Cpu size={11}/> Policy</div>
          <div className="stat-value"><span className="policy-chip">{run.policy}</span></div>
        </div>

        <div className="stat-card">
          <div className="stat-label"><Hash size={11}/> Frames</div>
          <div className="stat-value">{run.frameCount}</div>
        </div>

        <div className="stat-card fault-card">
          <div className="stat-label"><AlertCircle size={11}/> Faults</div>
          <div className="stat-value">{faults}</div>
        </div>

        <div className="stat-card hit-card">
          <div className="stat-label"><CheckCircle2 size={11}/> Hits</div>
          <div className="stat-value">{hits}</div>
        </div>

        <div className="stat-card">
          <div className="stat-label"><TrendingUp size={11}/> Fault Rate</div>
          <div className="stat-value" style={{fontSize:'1.3rem',color:faults>hits?'var(--fault)':'var(--hit)'}}>
            {faultRate}%
          </div>
        </div>
      </div>
    </div>
  );
}
