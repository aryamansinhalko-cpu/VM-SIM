/**
 * PageTable — Virtual-to-Physical page table mapping with valid/invalid bits.
 * Includes detailed commentary on active hit/fault events and eviction operations.
 */
import { AlertTriangle, CheckCircle2, Info, Table2 } from 'lucide-react';

export default function PageTable({ run, refs, stepIdx }) {
  const pages  = [...new Set(refs)].sort((a, b) => a - b);
  const step   = stepIdx >= 0 ? run.steps[stepIdx] : null;
  const frames = step ? step.frames : Array(run.frameCount).fill(null);

  return (
    <div className="card">
      <div className="card-title">
        <Table2 size={16} />
        <span>Virtual Address Translation (Page Table)</span>
      </div>

      <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Virtual Page</th>
              <th>Valid Bit</th>
              <th>Frame #</th>
              <th>State</th>
            </tr>
          </thead>
          <tbody>
            {pages.map((pg) => {
              const fi      = frames.indexOf(pg);
              const inMem   = fi !== -1;
              const isCur   = step && step.page === pg;
              const isEvict = step && step.evicted === pg;

              return (
                <tr key={pg} className={isCur ? 'pt-active' : isEvict ? 'pt-evicted' : ''}>
                  <td style={{ fontWeight: isCur ? 800 : 500, textAlign: 'left' }}>
                    Page {pg}
                  </td>
                  <td>
                    <span className={`valid-pill ${inMem ? 'valid-in' : 'valid-out'}`}>
                      {inMem ? '● 1 (Resident)' : '○ 0 (Disk)'}
                    </span>
                  </td>
                  <td>{inMem ? `Frame ${fi}` : '—'}</td>
                  <td style={{ textAlign: 'left' }}>
                    {isCur && !step.hit && (
                      <span style={{ color: 'var(--fault-light)', fontWeight: 700, fontSize: '0.78rem' }}>
                        ⚡ Page Fault
                      </span>
                    )}
                    {isCur && step.hit && (
                      <span style={{ color: 'var(--hit-light)', fontWeight: 700, fontSize: '0.78rem' }}>
                        ✓ Cache Hit
                      </span>
                    )}
                    {isEvict && (
                      <span style={{ color: 'var(--active-step)', fontWeight: 700, fontSize: '0.78rem' }}>
                        ↑ Evicted Victim
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ── Event Analysis Callout Box ── */}
      {step && !step.hit && (
        <div className="event-box ev-fault">
          <AlertTriangle size={16} className="event-box-ico" style={{ color: 'var(--fault-light)' }} />
          <div>
            <strong>Hardware Page Fault:</strong> Page <code style={{ background: 'rgba(244,63,94,.18)', padding: '0 4px', borderRadius: 3 }}>{step.page}</code> is not in physical RAM.
            {step.evicted !== null ? (
              <span> Evicted victim page <strong>{step.evicted}</strong> from Frame {step.slot} and swapped in page <strong>{step.page}</strong> from backing store.</span>
            ) : (
              <span> Allocated to free Frame {step.slot} without replacement.</span>
            )}
          </div>
        </div>
      )}

      {step && step.hit && (
        <div className="event-box ev-hit">
          <CheckCircle2 size={16} className="event-box-ico" style={{ color: 'var(--hit-light)' }} />
          <div>
            <strong>TLB / Memory Hit:</strong> Page <code style={{ background: 'rgba(16,185,129,.18)', padding: '0 4px', borderRadius: 3 }}>{step.page}</code> is already mapped to Frame {step.slot}. Zero disk latency incurred.
          </div>
        </div>
      )}

      {!step && (
        <div className="event-box ev-idle">
          <Info size={16} className="event-box-ico" style={{ color: 'var(--text-3)' }} />
          <div>
            Simulation paused at initial state. Press <strong>Play</strong> or click <strong>Step</strong> to observe memory translation in action.
          </div>
        </div>
      )}
    </div>
  );
}
