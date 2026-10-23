/**
 * My Sessions — Persistent simulation history archive.
 * Supports loading historical runs back into the active simulator,
 * CSV export, performance bar comparisons, and session purging.
 */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Save, Trash2, RotateCcw, History as HistoryIcon,
  Download, Trophy, Inbox
} from 'lucide-react';
import { exportCSV } from '../utils/export.js';

const STORAGE_KEY = 'vm-sim-history';
const MAX_SESSIONS = 20;

function load() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function save(entries) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

const ALGO_COLORS = {
  FIFO:  '#863bff',
  LRU:   '#10b981',
  OPT:   '#ffb800',
  CLOCK: '#c084fc',
  NRU:   '#47bfff',
};

export default function SessionHistory() {
  const [entries, setEntries] = useState(load);
  const navigate = useNavigate();

  useEffect(() => {
    save(entries);
  }, [entries]);

  const remove = (id) => setEntries(e => e.filter(x => x.id !== id));
  const clearAll = () => {
    if (confirm('Are you sure you want to delete all saved simulation sessions?')) {
      setEntries([]);
    }
  };

  const doLoad = (entry) => {
    sessionStorage.setItem('vm-sim-load', JSON.stringify(entry));
    navigate('/simulator');
  };

  const doCSV = (entry) => {
    const csv  = exportCSV(
      {
        policy: entry.policy,
        frameCount: entry.frames,
        faults: entry.faults,
        hits: entry.hits,
        faultRate: entry.faultRate,
        steps: entry.steps || [],
      },
      entry.refs
    );
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `vm-sim-${entry.policy}-${entry.name.replace(/\s+/g, '-').toLowerCase()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const bestFaults = entries.length ? Math.min(...entries.map(e => e.faults)) : Infinity;
  const sortedEntries = [...entries].sort((a, b) => b.id - a.id);

  return (
    <div className="page-wrapper">
      {/* ── Page Header ── */}
      <div className="section-header" style={{ paddingTop: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <HistoryIcon size={22} style={{ color: 'var(--primary-light)' }} />
            <h1 style={{ fontSize: '1.85rem', fontWeight: 800, letterSpacing: '-0.03em' }}>
              My Simulation Sessions
            </h1>
          </div>
          <div className="row">
            <span style={{ fontSize: '0.8rem', color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>
              {entries.length} / {MAX_SESSIONS} archived
            </span>
            {entries.length > 0 && (
              <button className="btn-danger" onClick={clearAll} style={{ fontSize: '0.78rem' }}>
                <Trash2 size={12} /> Clear All
              </button>
            )}
          </div>
        </div>
        <p style={{ color: 'var(--text-2)', fontSize: '0.92rem', marginTop: '0.3rem' }}>
          Review previously saved simulation runs, reload them into the interactive workbench, or export them for reporting.
        </p>
      </div>

      {/* ── Empty State ── */}
      {entries.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '5rem 2rem' }}>
          <Inbox size={54} style={{ color: 'var(--text-3)', margin: '0 auto 1.25rem', display: 'block', opacity: 0.35 }} />
          <h3 style={{ fontWeight: 800, fontSize: '1.25rem', marginBottom: '0.5rem', color: '#fff' }}>
            No Saved Sessions Found
          </h3>
          <p style={{ color: 'var(--text-3)', fontSize: '0.9rem', maxWidth: '440px', margin: '0 auto 1.75rem', lineHeight: 1.6 }}>
            Run a simulation on the workbench, then click the "Save to My Sessions" button to snapshot your configuration and results.
          </p>
          <button className="btn-primary" onClick={() => navigate('/simulator')}>
            <RotateCcw size={14} /> Open Simulator Workbench
          </button>
        </div>
      ) : (
        <>
          {/* Summary Metric Cards */}
          <div className="grid-3" style={{ marginBottom: '1.25rem' }}>
            <div className="stat-card primary-card">
              <div className="stat-label">
                <Save size={12} />
                <span>Archived Runs</span>
              </div>
              <div className="stat-value">{entries.length}</div>
            </div>

            <div className="stat-card hit-card">
              <div className="stat-label">
                <Trophy size={12} />
                <span>Lowest Fault Record</span>
              </div>
              <div className="stat-value">{bestFaults}</div>
            </div>

            <div className="stat-card">
              <div className="stat-label">
                <span>Unique Policies Tested</span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '0.35rem' }}>
                {[...new Set(entries.map(e => e.policy))].map((p) => (
                  <span
                    key={p}
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 700,
                      fontSize: '0.78rem',
                      color: ALGO_COLORS[p] || 'var(--text-2)',
                      background: `${ALGO_COLORS[p] || '#6366f1'}15`,
                      border: `1px solid ${ALGO_COLORS[p] || 'var(--border-subtle)'}40`,
                      borderRadius: 'var(--r-full)',
                      padding: '0.12rem 0.55rem',
                    }}
                  >
                    {p}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Sessions Ledger Table */}
          <div className="card">
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left' }}>Session Run Name</th>
                    <th>Policy</th>
                    <th>Frames</th>
                    <th>Ref String Len</th>
                    <th>Faults</th>
                    <th>Hits</th>
                    <th>Fault Rate</th>
                    <th>Timestamp</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedEntries.map((e) => {
                    const isBest = e.faults === bestFaults;
                    return (
                      <tr key={e.id} className={isBest ? 'best-row' : ''}>
                        <td style={{ textAlign: 'left', fontWeight: 600, color: '#fff' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            {isBest && <Trophy size={13} style={{ color: 'var(--active-step)' }} />}
                            <span>{e.name}</span>
                            {isBest && <span className="badge">Best</span>}
                          </div>
                        </td>
                        <td>
                          <span
                            style={{
                              fontFamily: 'var(--font-mono)',
                              fontWeight: 800,
                              fontSize: '0.8rem',
                              color: ALGO_COLORS[e.policy] || 'var(--text-1)',
                            }}
                          >
                            {e.policy}
                          </span>
                        </td>
                        <td>{e.frames}</td>
                        <td>{e.refs?.length || '—'}</td>
                        <td style={{ color: isBest ? 'var(--hit-light)' : 'var(--fault-light)', fontWeight: 700 }}>
                          {e.faults}
                        </td>
                        <td style={{ color: 'var(--hit-light)' }}>{e.hits}</td>
                        <td style={{ color: e.faultRate > 0.5 ? 'var(--fault-light)' : 'var(--hit-light)' }}>
                          {(e.faultRate * 100).toFixed(1)}%
                        </td>
                        <td style={{ color: 'var(--text-3)', fontSize: '0.76rem', fontFamily: 'var(--font-mono)' }}>
                          {new Date(e.savedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}{' '}
                          {new Date(e.savedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td>
                          <div className="row" style={{ gap: '0.3rem', justifyContent: 'center' }}>
                            <button
                              onClick={() => doLoad(e)}
                              title="Load into Simulator"
                              style={{ padding: '0.28rem 0.6rem', fontSize: '0.74rem' }}
                            >
                              <RotateCcw size={11} /> Load
                            </button>
                            <button
                              onClick={() => doCSV(e)}
                              title="Export CSV"
                              style={{ padding: '0.28rem 0.5rem', fontSize: '0.74rem' }}
                            >
                              <Download size={11} />
                            </button>
                            <button
                              onClick={() => remove(e.id)}
                              title="Delete Session"
                              className="btn-danger"
                              style={{ padding: '0.28rem 0.5rem', fontSize: '0.74rem' }}
                            >
                              <Trash2 size={11} />
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

          {/* Fault Rate Relative Comparison */}
          <div className="card" style={{ marginTop: '1.25rem' }}>
            <div className="card-title">
              <span>Fault Rate Relative Comparison</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {sortedEntries.map((e) => {
                const maxRate = Math.max(...entries.map(x => x.faultRate), 0.01);
                const pct     = ((e.faultRate / maxRate) * 100).toFixed(0);
                return (
                  <div key={e.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span
                      style={{
                        fontSize: '0.78rem',
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 800,
                        color: ALGO_COLORS[e.policy] || 'var(--text-2)',
                        width: 48,
                        flexShrink: 0,
                      }}
                    >
                      {e.policy}
                    </span>
                    <span
                      style={{
                        fontSize: '0.76rem',
                        color: 'var(--text-2)',
                        width: 140,
                        flexShrink: 0,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {e.name}
                    </span>
                    <div style={{ flex: 1, height: 7, background: 'var(--surface-3)', borderRadius: 'var(--r-full)', overflow: 'hidden' }}>
                      <div
                        style={{
                          height: '100%',
                          borderRadius: 'var(--r-full)',
                          background: ALGO_COLORS[e.policy] || 'var(--primary)',
                          width: `${pct}%`,
                          transition: 'width 0.4s ease',
                        }}
                      />
                    </div>
                    <span
                      style={{
                        fontSize: '0.76rem',
                        fontFamily: 'var(--font-mono)',
                        color: 'var(--text-1)',
                        width: 48,
                        textAlign: 'right',
                        fontWeight: 600,
                      }}
                    >
                      {(e.faultRate * 100).toFixed(1)}%
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
