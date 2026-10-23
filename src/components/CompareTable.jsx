/**
 * CompareTable — Side-by-side performance comparison of simulated policies.
 * Visualizes fault counts, hit rates, rankings, and CSV export.
 */
import { Trophy, Download, BarChart2 } from 'lucide-react';

export default function CompareTable({ results }) {
  const policies   = Object.values(results);
  const bestFaults = Math.min(...policies.map(r => r.faults));
  const maxFaults  = Math.max(...policies.map(r => r.faults));

  const sorted = [...policies].sort((a, b) => a.faults - b.faults);
  const rankOf = (p) => sorted.findIndex(r => r.policy === p) + 1;

  const barColor = (r) => {
    if (r.faults === bestFaults) return 'var(--hit)';
    if (r.faults === maxFaults)  return 'var(--fault)';
    return 'var(--primary)';
  };

  const download = () => {
    const header = 'Policy,Frames,Faults,Hits,Fault Rate (%),Hit Rate (%)';
    const rows   = policies.map(r =>
      `${r.policy},${r.frameCount},${r.faults},${r.hits},${(r.faultRate * 100).toFixed(2)},${((1 - r.faultRate) * 100).toFixed(2)}`
    );
    const blob   = new Blob([[header, ...rows].join('\n')], { type: 'text/csv' });
    const url    = URL.createObjectURL(blob);
    const a      = document.createElement('a');
    a.href       = url;
    a.download   = 'page-replacement-comparison.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="card">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div className="card-title" style={{ margin: 0 }}>
          <BarChart2 size={16} />
          <span>Multi-Policy Comparative Benchmarking</span>
        </div>
        <button onClick={download} className="btn-success" style={{ fontSize: '0.76rem', padding: '0.4rem 0.8rem' }}>
          <Download size={12} /> Export Comparison CSV
        </button>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ textAlign: 'left' }}>Policy</th>
              <th>Frames</th>
              <th>Faults</th>
              <th>Hits</th>
              <th style={{ minWidth: 150 }}>Fault Rate</th>
              <th>Rank</th>
            </tr>
          </thead>
          <tbody>
            {policies.map((r) => {
              const isBest = r.faults === bestFaults;
              const rank   = rankOf(r.policy);
              const barPct = maxFaults > 0 ? Math.round((r.faults / maxFaults) * 100) : 0;

              return (
                <tr key={r.policy} className={isBest ? 'best-row' : ''}>
                  <td style={{ textAlign: 'left', fontWeight: 700 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      {isBest && <Trophy size={13} style={{ color: 'var(--active-step)' }} />}
                      <span>{r.policy}</span>
                      {isBest && <span className="badge">Optimal</span>}
                    </div>
                  </td>
                  <td>{r.frameCount}</td>
                  <td style={{ color: isBest ? 'var(--hit-light)' : 'var(--text-1)', fontWeight: isBest ? 800 : 500 }}>
                    {r.faults}
                  </td>
                  <td>{r.hits}</td>
                  <td>
                    <div className="compare-bar-wrap">
                      <div className="compare-bar">
                        <div
                          className="compare-bar-fill"
                          style={{
                            width: `${barPct}%`,
                            background: barColor(r),
                          }}
                        />
                      </div>
                      <span style={{ fontSize: '0.78rem' }}>
                        {(r.faultRate * 100).toFixed(1)}%
                      </span>
                    </div>
                  </td>
                  <td>
                    <span className={`rank-chip rank-${Math.min(rank, 3)}`}>
                      #{rank}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
