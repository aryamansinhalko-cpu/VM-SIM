/**
 * App — router with 5 pages + persistent Navbar + footer.
 */
import { createBrowserRouter, RouterProvider, Outlet, Link } from 'react-router-dom';
import Navbar      from './components/Navbar.jsx';
import Home        from './pages/Home.jsx';
import Simulator   from './pages/Simulator.jsx';
import Compare     from './pages/Compare.jsx';
import Thrashing   from './pages/Thrashing.jsx';
import History     from './pages/History.jsx';
import { Cpu }     from 'lucide-react';

function Layout() {
  return (
    <>
      <Navbar />
      <main style={{ minHeight: 'calc(100vh - 58px)' }}>
        <Outlet />
      </main>
      <footer className="app-footer">
        <p>
          <Cpu size={12} style={{ display:'inline', verticalAlign:'middle', marginRight:4 }} />
          <strong>VMSim</strong> · Built with React + Vite · Chart.js · Vitest
          &nbsp;·&nbsp; OS Concepts: Demand Paging, Page Replacement, Thrashing
        </p>
      </footer>
    </>
  );
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true,         element: <Home /> },
      { path: 'simulator',  element: <Simulator /> },
      { path: 'compare',    element: <Compare /> },
      { path: 'thrashing',  element: <Thrashing /> },
      { path: 'history',    element: <History /> },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
