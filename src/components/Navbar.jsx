/**
 * Navbar — Premium sticky navigation bar with glassmorphism, glowing micro-accents,
 * clear active indicators, and responsive drawer.
 */
import { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  Cpu, Menu, X, GitCompare, FlaskConical, History,
  Home, BookOpen, Layers, ArrowRight, Play
} from 'lucide-react';

const NAV_ITEMS = [
  { to: '/',          label: 'Home',          icon: <Home size={14} /> },
  { to: '/simulator', label: 'Simulator',     icon: <Cpu size={14} /> },
  { to: '/compare',   label: 'Showdown',      icon: <GitCompare size={14} /> },
  { to: '/thrashing', label: 'Thrashing Lab', icon: <FlaskConical size={14} /> },
  { to: '/algorithms',label: 'Algorithms',   icon: <Layers size={14} /> },
  { to: '/history',   label: 'Sessions',      icon: <History size={14} /> },
  { to: '/about',     label: 'OS Theory',     icon: <BookOpen size={14} /> },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);


  return (
    <header className={`navbar-header ${scrolled ? 'is-scrolled' : ''}`}>
      <div className="navbar-container">
        {/* Brand */}
        <Link to="/" className="navbar-brand">
          <div className="brand-icon-wrapper">
            <Cpu size={18} className="brand-icon-svg" />
          </div>
          <div className="brand-text">
            <span className="brand-main">VM</span>
            <span className="brand-highlight">Sim</span>
          </div>
          <span className="brand-badge">2.0</span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="navbar-nav">
          <ul className="nav-list">
            {NAV_ITEMS.map(({ to, label, icon }) => (
              <li key={to} className="nav-item">
                <NavLink
                  to={to}
                  end={to === '/'}
                  className={({ isActive }) => `nav-link-btn ${isActive ? 'is-active' : ''}`}
                >
                  <span className="nav-icon">{icon}</span>
                  <span className="nav-label">{label}</span>
                  <span className="nav-active-pip" />
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Action Button & Mobile Toggle */}
        <div className="navbar-actions">
          <Link to="/simulator" className="nav-cta-btn">
            <span>Launch Simulator</span>
            <ArrowRight size={14} className="cta-arrow" />
          </Link>

          <button
            className="hamburger-btn"
            onClick={() => setOpen((prev) => !prev)}
            aria-label={open ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={open}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {open && (
        <div className="mobile-nav-backdrop" onClick={() => setOpen(false)}>
          <div className="mobile-nav-menu" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-nav-header">
              <span className="mobile-nav-title">Navigation</span>
              <span className="mobile-nav-badge">v2.0 Beta</span>
            </div>
            <ul className="mobile-nav-list">
              {NAV_ITEMS.map(({ to, label, icon }) => (
                <li key={to}>
                  <NavLink
                    to={to}
                    end={to === '/'}
                    className={({ isActive }) => `mobile-nav-link ${isActive ? 'is-active' : ''}`}
                    onClick={() => setOpen(false)}
                  >
                    <span className="mobile-nav-icon">{icon}</span>
                    <span className="mobile-nav-text">{label}</span>
                    <span className="mobile-nav-chevron">→</span>
                  </NavLink>
                </li>
              ))}
            </ul>
            <div className="mobile-nav-footer">
              <Link to="/simulator" className="mobile-cta-btn" onClick={() => setOpen(false)}>
                <Play size={14} /> Launch Simulator
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
