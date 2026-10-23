/**
 * WorkingSetPanel — Δ-window working set tracker with historical sparkline.
 * Demonstrates Peter Denning's working-set model of program behavior.
 */
import { useMemo } from 'react';
import { Layers } from 'lucide-react';

function wsAt(refs, t, delta) {
  return [...new Set(refs.slice(Math.max(0, t - delta + 1), t + 1))];
}

export default function WorkingSetPanel({ refs, stepIdx, delta }) {
  const ws = useMemo(() => {
    return refs && stepIdx >= 0 ? wsAt(refs, stepIdx, delta) : [];
  }, [refs, stepIdx, delta]);

  const history = useMemo(() => {
    if (!refs) return [];
    return refs.map((_, t) => wsAt(refs, t, delta).length);
  }, [refs, delta]);

  const maxWs = Math.max(...history, 1);

  return (
    <div className="card">
      <div className="card-title">
        <Layers size={16} />
        <span>Working Set Model (W(t, Δ))</span>
      </div>

      <div className="ws-meta-row">
        <span>Window Parameter: Δ = <strong style={{ color: 'var(--primary-light)', fontFamily: 'var(--font-mono)' }}>{delta}</strong></span>
        <span>|W(t, Δ)| Active Size: <strong style={{ color: 'var(--hit-light)', fontFamily: 'var(--font-mono)' }}>{ws.length}</strong></span>
      </div>

      {ws.length > 0 ? (
        <div className="ws-chips">
          {ws.map((pg) => (
            <span key={pg} className="ws-chip" title={`Page ${pg} in active working set`}>
              P{pg}
            </span>
          ))}
        </div>
      ) : (
        <p style={{ fontSize: '0.82rem', color: 'var(--text-3)', margin: '0.4rem 0 0.85rem' }}>
          Step through the simulation to compute active working-set membership.
        </p>
      )}

      {history.length > 0 && (
        <div style={{ marginTop: '0.85rem' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, marginBottom: '0.4rem' }}>
            Working Set Size Trajectory Over Time
          </div>
          <div className="ws-sparkline">
            {history.map((sz, i) => (
              <div
                key={i}
                className={`ws-bar ${i === stepIdx ? 'ws-active' : ''}`}
                style={{ height: `${Math.max(6, (sz / maxWs) * 48)}px` }}
                title={`Clock Step ${i}: |WS| = ${sz}`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
