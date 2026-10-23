/**
 * FrameTimeline — High-fidelity memory bus & frame timeline visualization.
 * Distinguishes occupied slots, free slots, hits, faults, active steps, and victim evictions.
 */
import { Grid3x3 } from 'lucide-react';

export default function FrameTimeline({ run, refs, stepIdx }) {
  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.85rem' }}>
        <div className="card-title" style={{ margin: 0 }}>
          <Grid3x3 size={16} />
          <span>Physical Frame Timeline</span>
        </div>

        <div className="legend">
          <span className="legend-item">
            <span className="legend-dot" style={{ background: 'var(--fault)' }} /> Page Fault (F)
          </span>
          <span className="legend-item">
            <span className="legend-dot" style={{ background: 'var(--hit)' }} /> Page Hit (H)
          </span>
          <span className="legend-item">
            <span className="legend-dot" style={{ background: 'var(--active-step)' }} /> Active Clock Step
          </span>
          <span className="legend-item">
            <span className="legend-dot" style={{ background: 'transparent', border: '2px solid var(--fault)' }} /> Evicted Victim
          </span>
        </div>
      </div>

      <div className="timeline-scroll">
        <table className="timeline">
          <thead>
            <tr>
              <th className="row-label">Ref →</th>
              {refs.map((r, i) => (
                <th
                  key={i}
                  className={i === stepIdx ? 'tl-now' : i < stepIdx ? '' : 'tl-future-head'}
                  title={`Step ${i}: Page ${r}`}
                >
                  {r}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: run.frameCount }, (_, f) => (
              <tr key={f}>
                <th className="row-label">Frame {f}</th>
                {run.steps.map((s, i) => {
                  let cls = '';
                  const isActive = i === stepIdx;
                  if (i > stepIdx) {
                    cls = 'tl-future';
                  } else if (s.slot === f && !s.hit) {
                    cls = s.evicted !== null ? 'tl-fault tl-victim' : 'tl-fault';
                  } else if (s.hit && s.slot === f) {
                    cls = 'tl-hit';
                  }

                  return (
                    <td
                      key={i}
                      className={cls}
                      style={isActive && i <= stepIdx ? { outline: '2px solid var(--active-step)', outlineOffset: '-2px' } : undefined}
                    >
                      {i <= stepIdx ? (s.frames[f] ?? '—') : ''}
                    </td>
                  );
                })}
              </tr>
            ))}
            <tr>
              <th className="row-label">Status</th>
              {run.steps.map((s, i) => (
                <td
                  key={i}
                  className={i > stepIdx ? 'tl-future' : s.hit ? 'tl-hit' : 'tl-fault'}
                  style={i === stepIdx ? { outline: '2px solid var(--active-step)', outlineOffset: '-2px', fontWeight: 800 } : undefined}
                >
                  {i <= stepIdx ? (s.hit ? 'H' : 'F') : ''}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
