/**
 * App — router with dual experience architecture:
 * 1. MarketingLayout for `/` with high-impact hero, bento grid, and full footer.
 * 2. DashboardLayout for application routes with left analytical sidebar, sticky workbench topbar.
 */
import { createBrowserRouter, RouterProvider, Outlet, Link } from 'react-router-dom';
import Navbar          from './components/Navbar.jsx';
import DashboardLayout from './components/DashboardLayout.jsx';
import Home            from './pages/Home.jsx';
import Simulator       from './pages/Simulator.jsx';
import Compare         from './pages/Compare.jsx';
import Thrashing       from './pages/Thrashing.jsx';
import Algorithms      from './pages/Algorithms.jsx';
import History         from './pages/History.jsx';
import About           from './pages/About.jsx';
import { Cpu } from 'lucide-react';

const CURRENT_YEAR = new Date().getFullYear();

function MarketingLayout() {
  return (
    <div className="app-shell">
      <Navbar />
      <main className="app-main">
        <Outlet />
      </main>

      <footer className="site-footer">
        <div className="footer-container">
          <div className="footer-top">
            <div className="footer-brand-col">
              <Link to="/" className="footer-brand">
                <span className="brand-logo-glow">
                  <Cpu size={18} />
                </span>
                <span className="brand-name">VM<span className="brand-accent">Sim</span></span>
              </Link>
              <p className="footer-tagline">
                Interactive laboratory for virtual memory management, demand paging architectures, and page replacement policies.
              </p>
              <div className="footer-status-pill">
                <span className="status-dot-live"></span>
                <span>Deterministic Engine · 21 Vitest Tests Passing</span>
              </div>
            </div>

            <div className="footer-links-grid">
              <div className="footer-col">
                <h4 className="footer-col-title">Simulations</h4>
                <ul className="footer-links">
                  <li><Link to="/simulator">Interactive Simulator</Link></li>
                  <li><Link to="/compare">Algorithm Showdown</Link></li>
                  <li><Link to="/thrashing">Thrashing Lab</Link></li>
                  <li><Link to="/history">Saved Sessions</Link></li>
                </ul>
              </div>

              <div className="footer-col">
                <h4 className="footer-col-title">Algorithms</h4>
                <ul className="footer-links">
                  <li><Link to="/algorithms">FIFO & Belady&apos;s Anomaly</Link></li>
                  <li><Link to="/algorithms">LRU (Least Recently Used)</Link></li>
                  <li><Link to="/algorithms">OPT (Belady&apos;s Optimal)</Link></li>
                  <li><Link to="/algorithms">Clock (Second-Chance)</Link></li>
                  <li><Link to="/algorithms">NRU (Not Recently Used)</Link></li>
                </ul>
              </div>

              <div className="footer-col">
                <h4 className="footer-col-title">OS Concepts</h4>
                <ul className="footer-links">
                  <li><Link to="/about">Demand Paging & Traps</Link></li>
                  <li><Link to="/about">Working Set Model (Δ)</Link></li>
                  <li><Link to="/about">Thrashing & Multiprogramming</Link></li>
                  <li><Link to="/about">Virtual to Physical Mapping</Link></li>
                </ul>
              </div>
            </div>
          </div>

          <div className="footer-bottom">
            <div className="footer-copy">
              © {CURRENT_YEAR} VMSim. Educational Operating Systems Engineering Platform.
            </div>
            <div className="footer-meta">
              <span className="meta-badge">React 19</span>
              <span className="meta-badge">Vite 8</span>
              <span className="meta-badge">Chart.js</span>
              <span className="meta-badge">Client-Side Only</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <MarketingLayout />,
    children: [
      { index: true, element: <Home /> },
    ],
  },
  {
    path: '/',
    element: <DashboardLayout />,
    children: [
      { path: 'simulator',   element: <Simulator /> },
      { path: 'compare',     element: <Compare /> },
      { path: 'thrashing',   element: <Thrashing /> },
      { path: 'algorithms',  element: <Algorithms /> },
      { path: 'history',     element: <History /> },
      { path: 'about',       element: <About /> },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
