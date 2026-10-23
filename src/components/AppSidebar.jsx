/**
 * AppSidebar — Compact analytical navigation sidebar for the VMSim workbench.
 * Features categorized navigation, deterministic engine telemetry indicator,
 * and responsive mobile drawer capabilities.
 */
import { NavLink, Link } from 'react-router-dom';
import {
  Cpu, Home, GitCompare, FlaskConical, History,
  Layers, BookOpen, X, ArrowUpRight
} from 'lucide-react';

const SECTIONS = [
  {
    title: 'Simulation Deck',
    items: [
      { to: '/',           label: 'Overview / Home',      icon: <Home size={16} />,        end: true },
      { to: '/simulator',  label: 'Interactive Simulator', icon: <Cpu size={16} /> },
      { to: '/compare',    label: 'Algorithm Showdown',   icon: <GitCompare size={16} /> },
      { to: '/thrashing',  label: 'Thrashing Analysis',   icon: <FlaskConical size={16} /> },
    ],
  },
  {
    title: 'Knowledge & Data',
    items: [
      { to: '/history',    label: 'Simulation History',   icon: <History size={16} /> },
      { to: '/algorithms', label: 'Documentation / Theory', icon: <Layers size={16} /> },
      { to: '/about',      label: 'OS Architecture',      icon: <BookOpen size={16} /> },
    ],
  },
];

export default function AppSidebar({ isOpen, onClose }) {
  return (
    <aside className={`app-sidebar ${isOpen ? 'is-open' : ''}`}>
      {/* Brand Header */}
      <div className="sidebar-header">
        <Link to="/" className="sidebar-brand" onClick={onClose}>
          <div className="sidebar-logo-icon">
            <Cpu size={18} />
          </div>
          <span className="sidebar-brand-name">
            VM<em>Sim</em>
          </span>
        </Link>

        {isOpen && (
          <button
            className="sidebar-close-btn"
            onClick={onClose}
            aria-label="Close sidebar"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-3)',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Navigation Sections */}
      <div className="sidebar-nav-section">
        {SECTIONS.map((sec) => (
          <div key={sec.title} style={{ marginBottom: '1.25rem' }}>
            <div className="sidebar-section-title">{sec.title}</div>
            <ul className="sidebar-nav-list">
              {sec.items.map((item) => (
                <li key={item.to} className="sidebar-nav-item">
                  <NavLink
                    to={item.to}
                    end={item.end}
                    onClick={onClose}
                    className={({ isActive }) => (isActive ? 'is-active' : '')}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                    <span className="sidebar-active-pip" />
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div style={{ padding: '0 0.65rem', marginTop: '0.5rem' }}>
          <Link
            to="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.5rem 0.75rem',
              borderRadius: 'var(--r-sm)',
              background: 'var(--surface-1)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-3)',
              fontSize: '0.75rem',
              textDecoration: 'none',
              transition: 'all var(--transition-fast)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#fff';
              e.currentTarget.style.borderColor = 'var(--border-light)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--text-3)';
              e.currentTarget.style.borderColor = 'var(--border-subtle)';
            }}
          >
            <span>Marketing Landing</span>
            <ArrowUpRight size={13} />
          </Link>
        </div>
      </div>

      {/* Sidebar Footer / Telemetry */}
      <div className="sidebar-footer">
        <div className="sidebar-status-box">
          <span className="status-indicator-live" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span style={{ fontWeight: 600, color: 'var(--text-1)' }}>Client Engine Live</span>
            <span style={{ fontSize: '0.66rem', color: 'var(--text-3)' }}>100% Deterministic · 21 Tests</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
