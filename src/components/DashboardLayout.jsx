/**
 * DashboardLayout — Dedicated Analytical Application Workbench Shell.
 * Provides a persistent left sidebar, sticky telemetry topbar with screen title,
 * and responsive mobile navigation.
 */
import { useState } from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import AppSidebar from './AppSidebar.jsx';
import { Menu, Play, GitCompare, ExternalLink } from 'lucide-react';

const ROUTE_META = {
  '/simulator': {
    title: 'Interactive Simulator',
    sub: 'Demand Paging & Page Replacement Workbench',
    quickLink: { to: '/compare', label: 'Open Showdown', icon: <GitCompare size={13} /> },
  },
  '/compare': {
    title: 'Algorithm Showdown',
    sub: 'Simultaneous Multi-Policy Benchmarks',
    quickLink: { to: '/simulator', label: 'Open Simulator', icon: <Play size={13} /> },
  },
  '/thrashing': {
    title: 'Thrashing Analysis',
    sub: 'Working Set Model & Degree of Multiprogramming Diagnostics',
    quickLink: { to: '/simulator', label: 'Test Workload', icon: <Play size={13} /> },
  },
  '/algorithms': {
    title: 'Algorithm Documentation',
    sub: 'FIFO, LRU, OPT, Clock & NRU Structural Analysis',
    quickLink: { to: '/simulator', label: 'Try in Simulator', icon: <Play size={13} /> },
  },
  '/history': {
    title: 'Simulation History',
    sub: 'Saved Run Logs, Export Records & State Restorations',
    quickLink: { to: '/simulator', label: 'New Simulation', icon: <Play size={13} /> },
  },
  '/about': {
    title: 'Operating Systems Theory',
    sub: 'Virtual-to-Physical Address Translation, Hardware Traps & Frames',
    quickLink: { to: '/simulator', label: 'Launch Simulator', icon: <Play size={13} /> },
  },
};

const CURRENT_YEAR = new Date().getFullYear();

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const meta = ROUTE_META[location.pathname] || {
    title: 'Workbench',
    sub: 'Virtual Memory Analysis Platform',
    quickLink: { to: '/simulator', label: 'Simulator', icon: <Play size={13} /> },
  };

  return (
    <div className="app-dashboard-shell">
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(2, 1, 8, 0.75)',
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
            zIndex: 540,
          }}
        />
      )}

      {/* Left Application Sidebar */}
      <AppSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Dashboard Deck */}
      <div className="app-dashboard-body">
        {/* Topbar */}
        <header className="app-dashboard-topbar">
          <div className="dashboard-topbar-left">
            <button
              className="sidebar-toggle-btn"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar navigation"
            >
              <Menu size={18} />
            </button>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '2px' }}>
                <span style={{ fontSize: '0.68rem', fontFamily: 'var(--font-mono)', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  VMSim Deck
                </span>
                <span style={{ color: 'var(--border-light)', fontSize: '0.65rem' }}>/</span>
                <span style={{ fontSize: '0.68rem', fontFamily: 'var(--font-mono)', color: 'var(--primary-light)' }}>
                  {meta.title}
                </span>
              </div>
              <h1 className="dashboard-page-title" style={{ margin: 0, lineHeight: 1.2 }}>
                {meta.title}
              </h1>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            {/* Status Indicator */}
            <div
              style={{
                display: 'none',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.35rem 0.75rem',
                borderRadius: 'var(--r-full)',
                background: 'rgba(0, 245, 160, 0.08)',
                border: '1px solid rgba(0, 245, 160, 0.25)',
                color: 'var(--hit-light)',
                fontSize: '0.72rem',
                fontFamily: 'var(--font-mono)',
              }}
              className="topbar-status-desktop"
            >
              <span className="status-indicator-live" />
              <span>100% Deterministic</span>
            </div>

            {/* Quick Action Button */}
            {meta.quickLink && (
              <Link
                to={meta.quickLink.to}
                className="link-btn link-btn-ghost"
                style={{
                  padding: '0.4rem 0.85rem',
                  fontSize: '0.78rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  borderRadius: 'var(--r-sm)',
                }}
              >
                {meta.quickLink.icon}
                <span>{meta.quickLink.label}</span>
              </Link>
            )}

            <Link
              to="/"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                color: 'var(--text-3)',
                fontSize: '0.74rem',
                textDecoration: 'none',
                padding: '0.4rem 0.6rem',
                borderRadius: 'var(--r-sm)',
                transition: 'color var(--transition-fast)'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#fff'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-3)'; }}
              title="Return to marketing landing"
            >
              <ExternalLink size={13} />
              <span className="topbar-home-label">Site</span>
            </Link>
          </div>
        </header>

        {/* Dynamic Route Content */}
        <main style={{ flex: 1, minHeight: 'calc(100vh - 64px - 48px)' }}>
          <Outlet />
        </main>

        {/* Dashboard Bottom Telemetry Bar */}
        <footer
          style={{
            height: '48px',
            borderTop: '1px solid var(--border-subtle)',
            background: 'rgba(5, 2, 12, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 1.75rem',
            fontSize: '0.72rem',
            color: 'var(--text-3)',
            fontFamily: 'var(--font-mono)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span>© {CURRENT_YEAR} VMSim</span>
            <span style={{ color: 'var(--border-subtle)' }}>•</span>
            <span>Operating Systems Educational Platform</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ color: 'var(--hit-light)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--hit)' }}></span>
              Deterministic Engine
            </span>
            <span>React 19 + Vitest</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
