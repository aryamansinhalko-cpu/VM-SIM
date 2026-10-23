/**
 * RefStringBuilder — Interactive click-to-build palette for reference sequences.
 */
import { Trash2, Undo2, PlusCircle } from 'lucide-react';

const PAGES = Array.from({ length: 16 }, (_, i) => i);

export default function RefStringBuilder({ refs, onRefsChange }) {
  return (
    <div className="card">
      <div className="card-title">
        <PlusCircle size={16} />
        <span>Visual String Builder</span>
      </div>

      <div className="rsb-display">
        {refs.length === 0 ? (
          <span style={{ color: 'var(--text-3)', fontSize: '0.8rem', fontStyle: 'italic' }}>
            Click page buttons below to append to sequence…
          </span>
        ) : (
          refs.map((pg, i) => (
            <span key={i} className="rsb-chip">
              {pg}
            </span>
          ))
        )}
      </div>

      <div className="row" style={{ marginBottom: '0.85rem', gap: '0.4rem' }}>
        <button
          onClick={() => onRefsChange(refs.slice(0, -1))}
          disabled={refs.length === 0}
          style={{ fontSize: '0.76rem', padding: '0.35rem 0.65rem' }}
        >
          <Undo2 size={12} /> Undo
        </button>
        <button
          onClick={() => onRefsChange([])}
          disabled={refs.length === 0}
          className="btn-danger"
          style={{ fontSize: '0.76rem', padding: '0.35rem 0.65rem' }}
        >
          <Trash2 size={12} /> Clear
        </button>
        <span style={{ marginLeft: 'auto', fontSize: '0.74rem', color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>
          {refs.length} References
        </span>
      </div>

      <div className="rsb-palette">
        {PAGES.map((pg) => (
          <button
            key={pg}
            type="button"
            className="rsb-btn"
            onClick={() => onRefsChange([...refs, pg])}
            title={`Append Page ${pg}`}
          >
            {pg}
          </button>
        ))}
      </div>
    </div>
  );
}
