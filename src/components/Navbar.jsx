/**
 * Navbar — sticky, responsive, dark glassmorphism design.
 */
import { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Cpu, Menu, X, GitCompare, FlaskConical, History, Home } from 'lucide-react';

const NAV = [
  { to: '/',          label: 'Home',       icon: <Home      size={13}/> },
  { to: '/simulator', label: 'Simulator',  icon: <Cpu       size={13}/> },
  { to: '/compare',   label: 'Showdown',   icon: <GitCompare size={13}/> },
  { to: '/thrashing', label: 'Thrashing Lab', icon: <FlaskConical size={13}/> },
  { to: '/history',   label: 'My Sessions',icon: <History   size={13}/> },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand" onClick={() => setOpen(false)}>
          <Cpu size={18} className="brand-icon" />
          <span className="brand-name">VM<em>Sim</em></span>
        </Link>

        <ul className="navbar-links">
          {NAV.map(({ to, label, icon }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={to === '/'}
                className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
              >
                {icon}
                {label}
                <span className="nav-dot" />
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="navbar-right">
          <span className="nav-badge">v2.0</span>
          <button className="hamburger" onClick={() => setOpen(o => !o)} aria-label="menu">
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="mobile-drawer">
          {NAV.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) => `mobile-link${isActive ? ' active' : ''}`}
              onClick={() => setOpen(false)}
            >
              {icon} {label}
            </NavLink>
          ))}
        </div>
      )}
    </nav>
  );
}
