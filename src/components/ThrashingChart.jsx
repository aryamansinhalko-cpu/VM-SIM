/**
 * ThrashingChart — CPU utilization vs. degree of multiprogramming.
 * Dark-themed Chart.js line chart with gradient fills, glowing points, and styled data table.
 */
import { useMemo, useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement,
  Title, Tooltip, Legend, Filler,
} from 'chart.js';
import { thrashingCurve, safeProcessCount } from '../engine/thrashing.js';
import { Activity, ShieldCheck, AlertOctagon, Info } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

export default function ThrashingChart() {
  const [total, setTotal] = useState(60);
  const [ws,    setWs]    = useState(10);
  const [cost,  setCost]  = useState(100);

  const pts  = useMemo(() => thrashingCurve({ totalFrames: total, wsSize: ws, faultCost: cost }), [total, ws, cost]);
  const safe = safeProcessCount(total, ws);

  const data = {
    labels: pts.map((p) => `${p.n}`),
    datasets: [
      {
        label: 'CPU Utilization (%)',
        data: pts.map((p) => +(p.cpuUtil * 100).toFixed(1)),
        borderColor: '#3b82f6',
        backgroundColor: (ctx) => {
          const chart = ctx.chart;
          const { ctx: c, chartArea } = chart;
          if (!chartArea) return 'rgba(59,130,246,0.08)';
          const gradient = c.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
          gradient.addColorStop(0, 'rgba(59,130,246,0.18)');
          gradient.addColorStop(1, 'rgba(59,130,246,0.01)');
          return gradient;
        },
        fill: true,
        tension: 0.4,
        borderWidth: 2,
        pointRadius: pts.map((p) => (p.thrashing ? 6 : 4)),
        pointBackgroundColor: pts.map((p) => (p.thrashing ? '#f43f5e' : '#3b82f6')),
        pointBorderColor:     pts.map((p) => (p.thrashing ? 'rgba(244,63,94,0.4)' : 'rgba(59,130,246,0.4)')),
        pointBorderWidth: 2,
      },
      {
        label: 'Fault Rate (%)',
        data: pts.map((p) => +(p.faultRate * 100).toFixed(1)),
        borderColor: '#f43f5e',
        backgroundColor: (ctx) => {
          const chart = ctx.chart;
          const { ctx: c, chartArea } = chart;
          if (!chartArea) return 'rgba(244,63,94,0.06)';
          const gradient = c.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
          gradient.addColorStop(0, 'rgba(244,63,94,0.14)');
          gradient.addColorStop(1, 'rgba(244,63,94,0.01)');
          return gradient;
        },
        fill: true,
        tension: 0.4,
        borderWidth: 2,
        pointRadius: 3,
        pointBackgroundColor: '#f43f5e',
      },
    ],
  };

  const options = {
    responsive: true,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#a1a1aa',
          font: { family: 'Inter, sans-serif', size: 12 },
          boxWidth: 12,
          padding: 16,
        },
      },
      tooltip: {
        backgroundColor: '#18181b',
        borderColor: 'rgba(255,255,255,0.08)',
        borderWidth: 1,
        titleColor: '#fafafa',
        bodyColor: '#a1a1aa',
        padding: 10,
        callbacks: {
          afterLabel: (ctx) => {
            const pt = pts[ctx.dataIndex];
            return `Frames/proc: ${pt.framesEach}${pt.thrashing ? '  ⚠ THRASHING' : ''}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(255,255,255,0.04)' },
        ticks: { color: '#71717a', font: { size: 11 } },
        title: {
          display: true,
          text: 'Degree of Multiprogramming (# processes)',
          color: '#71717a',
          font: { size: 12, weight: 'bold', family: 'Inter, sans-serif' },
          padding: { top: 8 },
        },
      },
      y: {
        min: 0, max: 100,
        grid: { color: 'rgba(255,255,255,0.04)' },
        ticks: { color: '#71717a', font: { size: 11 } },
        title: {
          display: true,
          text: 'Percentage (%)',
          color: '#71717a',
          font: { size: 12, weight: 'bold', family: 'Inter, sans-serif' },
          padding: { bottom: 8 },
        },
      },
    },
  };

  return (
    <section className="card">
      <h3><Activity size={16} className="card-icon" /> Thrashing Demonstration</h3>
      <p className="hint" style={{ marginBottom: '1rem' }}>
        As more processes compete for frames, CPU utilization rises — then
        <strong style={{ color: 'var(--fault)' }}> crashes</strong> once each process gets fewer frames than its working set.
        <span style={{ color: 'var(--fault)' }}> Red dots</span> on the utilization line indicate thrashing onset.
      </p>

      {/* Sliders */}
      <div className="thrash-controls">
        <label>
          Physical frames: <strong>{total}</strong>
          <input type="range" min="20" max="120" value={total} onChange={(e) => setTotal(+e.target.value)} />
        </label>
        <label>
          Working set per process: <strong>{ws} pages</strong>
          <input type="range" min="2" max="30" value={ws} onChange={(e) => setWs(+e.target.value)} />
        </label>
        <label>
          Disk fault cost: <strong>{cost}×</strong>
          <input type="range" min="10" max="500" step="10" value={cost} onChange={(e) => setCost(+e.target.value)} />
        </label>
      </div>

      {/* Safe-limit banner */}
      <div className="safe-banner">
        <ShieldCheck size={15} style={{ color: 'var(--primary)', flexShrink: 0 }} />
        Working-set safe limit: <strong>&nbsp;{safe} processes</strong>
        &nbsp;— past this point, each process gets fewer than {ws} frames and thrashing begins.
      </div>

      {/* Chart */}
      <Line data={data} options={options} />

      {/* Data table */}
      <div className="thrash-table-wrapper">
        <h4>Data Table</h4>
        <table>
          <thead>
            <tr>
              <th># Procs</th>
              <th>Frames/proc</th>
              <th>CPU Util %</th>
              <th>Fault Rate %</th>
              <th>State</th>
            </tr>
          </thead>
          <tbody>
            {pts.map((p) => (
              <tr key={p.n} className={p.thrashing ? 'thrashing-row' : ''}>
                <td style={{ fontFamily: 'monospace' }}>{p.n}</td>
                <td style={{ fontFamily: 'monospace' }}>{p.framesEach}</td>
                <td style={{ fontFamily: 'monospace', color: p.thrashing ? 'var(--fault)' : 'var(--hit)' }}>
                  {(p.cpuUtil * 100).toFixed(1)}
                </td>
                <td style={{ fontFamily: 'monospace' }}>{(p.faultRate * 100).toFixed(1)}</td>
                <td>
                  {p.thrashing ? (
                    <span className="state-badge state-thrashing">
                      <AlertOctagon size={10} /> Thrashing
                    </span>
                  ) : (
                    <span className="state-badge state-safe">
                      <ShieldCheck size={10} /> Safe
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Explainer */}
      <details className="explainer">
        <summary>How does this model work?</summary>
        <p>
          Each of the <em>n</em> processes gets <code>⌊totalFrames / n⌋</code> frames.
          The working set size is <strong>{ws}</strong> pages. When frames/proc drops below the working set,
          the process faults on nearly every reference. The CPU spends all its time waiting for disk I/O
          rather than executing instructions.
        </p>
        <p>
          <strong>Fix:</strong> Working-set model — admit only as many processes as physical memory can support.
          Suspend excess processes until the running set fits in memory.
        </p>
      </details>
    </section>
  );
}
