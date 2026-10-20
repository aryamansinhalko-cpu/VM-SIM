/**
 * SimHistory — save, name, load, and compare simulation runs.
 * Persists to localStorage under key 'vm-sim-history'.
 */
import { useState, useEffect } from 'react';
import { Save, Trash2, RotateCcw, History } from 'lucide-react';

const STORAGE_KEY = 'vm-sim-history';
const MAX_ENTRIES = 10;

function loadHistory() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
  catch { return []; }
}

function saveHistory(entries) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export default function SimHistory({ run, refs, onLoad }) {
  const [entries, setEntries] = useState(loadHistory);
  const [name,    setName]    = useState('');

  useEffect(() => { saveHistory(entries); }, [entries]);

  const save = () => {
    if (!run) return;
    const entry = {
      id:        Date.now(),
      name:      name.trim() || `Run ${new Date().toLocaleTimeString()}`,
      policy:    run.policy,
      frames:    run.frameCount,
      faults:    run.faults,
      hits:      run.hits,
      faultRate: run.faultRate,
      refs:      refs,
      savedAt:   new Date().toISOString(),
    };
    setEntries((prev) => [entry, ...prev].slice(0, MAX_ENTRIES));
    setName('');
  };

  const remove = (id) => setEntries((prev) => prev.filter((e) => e.id !== id));

  const clearAll = () => setEntries([]);

  const bestFaults = entries.length
    ? Math.min(...entries.map((e) => e.faults))
    : null;

  return (
    <section className="card">
      <h3><History size={16} className="card-icon" /> Simulation History</h3>

      {/* Save current run */}
      <div className="row" style={{ marginBottom: '1rem', gap: '0.5rem' }}>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name this run (optional)"
          style={{ flex: 1, margin: 0 }}
          onKeyDown={(e) => e.key === 'Enter' && save()}
        />
        <button
          onClick={save}
          disabled={!run}
          style={{ background: 'var(--primary-dim)', borderColor: 'rgba(59,130,246,0.3)', color: 'var(--primary)', fontWeight: 600 }}
          title="Save current run"
        >
          <Save size={13} /> Save
        </button>
      </div>

      {entries.length === 0 ? (
        <p style={{ color: 'var(--text-3)', fontSize: '0.83rem', margin: 0 }}>
          No saved runs yet. Run a simulation and click Save.
        </p>
      ) : (
        <>
          <table>
            <thead>
              <tr>
                <th style={{ textAlign: 'left' }}>Name</th>
                <th>Policy</th>
                <th>Frames</th>
                <th>Faults</th>
                <th>Fault %</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e) => (
                <tr key={e.id} className={e.faults === bestFaults ? 'best' : ''}>
                  <td style={{ textAlign: 'left', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {e.name}
                    {e.faults === bestFaults && <span className="badge">Best</span>}
                  </td>
                  <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{e.policy}</td>
                  <td style={{ fontFamily: 'monospace' }}>{e.frames}</td>
                  <td style={{ fontFamily: 'monospace', color: e.faults === bestFaults ? 'var(--hit)' : 'var(--fault)' }}>{e.faults}</td>
                  <td style={{ fontFamily: 'monospace' }}>{(e.faultRate * 100).toFixed(1)}%</td>
                  <td>
                    <div className="row" style={{ gap: '0.25rem', justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => onLoad(e)}
                        title="Load this run"
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                      >
                        <RotateCcw size={11} /> Load
                      </button>
                      <button
                        onClick={() => remove(e.id)}
                        title="Delete"
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', color: 'var(--fault)' }}
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ marginTop: '0.75rem', textAlign: 'right' }}>
            <button onClick={clearAll} style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>
              <Trash2 size={11} /> Clear all history
            </button>
          </div>
        </>
      )}
    </section>
  );
}
