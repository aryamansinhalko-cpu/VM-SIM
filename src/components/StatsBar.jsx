/**
 * StatsBar — Real-time telemetry metric cards.
 * Displays progress, active policy, frame count, faults, hits, and fault rate.
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
    <div className="card" style={{ padding: '1.1rem 1.4rem' }}>
      <div className="stats-grid">
        {/* Progress */}
        <div className="stat-card">
          <div className="stat-label">
            <Activity size={12} />
            <span>Clock Step</span>
          </div>
          <div className="stat-value" style={{ fontSize: '1.35rem' }}>
            {done}
            <span style={{ color: 'var(--text-3)', fontWeight: 400, fontSize: '0.65em', marginLeft: 3 }}>
              / {run.steps.length}
            </span>
          </div>
          <div className="progress-track" title={`${progress}% complete`}>
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* Policy */}
        <div className="stat-card primary-card">
          <div className="stat-label">
            <Cpu size={12} />
            <span>Active Policy</span>
          </div>
          <div className="stat-value">
            <span className="policy-chip">{run.policy}</span>
          </div>
        </div>

        {/* Frame Capacity */}
        <div className="stat-card">
          <div className="stat-label">
            <Hash size={12} />
            <span>Frames</span>
          </div>
          <div className="stat-value">{run.frameCount}</div>
        </div>

        {/* Faults */}
        <div className="stat-card fault-card">
          <div className="stat-label">
            <AlertCircle size={12} />
            <span>Page Faults</span>
          </div>
          <div className="stat-value">{faults}</div>
        </div>

        {/* Hits */}
        <div className="stat-card hit-card">
          <div className="stat-label">
            <CheckCircle2 size={12} />
            <span>Page Hits</span>
          </div>
          <div className="stat-value">{hits}</div>
        </div>

        {/* Fault Rate vs Hit Rate */}
        <div className="stat-card">
          <div className="stat-label">
            <TrendingUp size={12} />
            <span>Fault Rate</span>
          </div>
          <div
            className="stat-value"
            style={{
              fontSize: '1.4rem',
              color: faults > hits ? 'var(--fault-light)' : 'var(--hit-light)'
            }}
          >
            {faultRate}%
          </div>
        </div>
      </div>
    </div>
  );
}
