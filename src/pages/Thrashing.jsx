/**
 * Thrashing Lab — Analytical deep-dive into memory saturation,
 * working-set deficits, and multiprogramming CPU collapse.
 */
import { useMemo, useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, Title, Tooltip, Legend, Filler,
} from 'chart.js';
import { thrashingCurve, safeProcessCount } from '../engine/thrashing.js';
import {
  FlaskConical, ShieldCheck, AlertOctagon, Activity,
  Zap, Sliders
} from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const chartOptions = (pts) => ({
  responsive: true,
  maintainAspectRatio: false,
  interaction: { mode: 'index', intersect: false },
  plugins: {
    legend: {
      position: 'top',
      align: 'end',
      labels: {
        color: '#94a3b8',
        font: { family: 'Inter, sans-serif', size: 12, weight: '500' },
        boxWidth: 10,
        boxHeight: 10,
        padding: 18,
      },
    },
    tooltip: {
      backgroundColor: '#11121c',
      borderColor: 'rgba(255, 255, 255, 0.12)',
      borderWidth: 1,
      titleColor: '#f8fafc',
      bodyColor: '#94a3b8',
      padding: 12,
      cornerRadius: 8,
      callbacks: {
        afterLabel: (ctx) => {
          const pt = pts[ctx.dataIndex];
          return `Allocation: ${pt.framesEach} frames/proc ${pt.thrashing ? ' ⚠️ THRASHING CRITICAL' : ' ✓ SAFE'}`;
        },
      },
    },
  },
  scales: {
    x: {
      grid: { color: 'rgba(255, 255, 255, 0.04)' },
      ticks: { color: '#64748b', font: { family: 'JetBrains Mono, monospace', size: 11 } },
      title: {
        display: true,
        text: 'Degree of Multiprogramming (Concurrent Processes)',
        color: '#64748b',
        font: { family: 'Inter, sans-serif', size: 12, weight: '600' },
        padding: { top: 10 },
      },
    },
    y: {
      min: 0,
      max: 100,
      grid: { color: 'rgba(255, 255, 255, 0.04)' },
      ticks: {
        color: '#64748b',
        font: { family: 'JetBrains Mono, monospace', size: 11 },
        callback: (v) => `${v}%`,
      },
      title: {
        display: true,
        text: 'Percentage Capacity (%)',
        color: '#64748b',
        font: { family: 'Inter, sans-serif', size: 12, weight: '600' },
        padding: { bottom: 10 },
      },
    },
  },
});

function makeData(pts) {
  return {
    labels: pts.map((p) => `P${p.n}`),
    datasets: [
      {
        label: 'CPU Utilization (%)',
        data: pts.map((p) => +(p.cpuUtil * 100).toFixed(1)),
        borderColor: '#863bff',
        backgroundColor: (ctx) => {
          const { ctx: c, chartArea } = ctx.chart;
          if (!chartArea) return 'rgba(134, 59, 255, 0.08)';
          const g = c.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
          g.addColorStop(0, 'rgba(134, 59, 255, 0.35)');
          g.addColorStop(1, 'rgba(134, 59, 255, 0.01)');
          return g;
        },
        fill: true,
        tension: 0.35,
        borderWidth: 2.5,
        pointRadius: pts.map((p) => (p.thrashing ? 6 : 4)),
        pointBackgroundColor: pts.map((p) => (p.thrashing ? '#f43f5e' : '#863bff')),
        pointBorderColor: pts.map((p) => (p.thrashing ? 'rgba(244, 63, 94, 0.4)' : 'rgba(134, 59, 255, 0.4)')),
        pointBorderWidth: 2,
      },
      {
        label: 'Page Fault Rate (%)',
        data: pts.map((p) => +(p.faultRate * 100).toFixed(1)),
        borderColor: '#f43f5e',
        backgroundColor: (ctx) => {
          const { ctx: c, chartArea } = ctx.chart;
          if (!chartArea) return 'rgba(244, 63, 94, 0.06)';
          const g = c.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
          g.addColorStop(0, 'rgba(244, 63, 94, 0.22)');
          g.addColorStop(1, 'rgba(244, 63, 94, 0.01)');
          return g;
        },
        fill: true,
        tension: 0.35,
        borderWidth: 2,
        pointRadius: 3,
        pointBackgroundColor: '#f43f5e',
      },
    ],
  };
}

export default function Thrashing() {
  const [total, setTotal] = useState(60);
  const [ws,    setWs]    = useState(10);
  const [cost,  setCost]  = useState(100);

  const pts  = useMemo(() => thrashingCurve({ totalFrames: total, wsSize: ws, faultCost: cost }), [total, ws, cost]);
  const safe = safeProcessCount(total, ws);
  const data = useMemo(() => makeData(pts), [pts]);

  const peakUtil = pts.length ? Math.max(...pts.map((p) => p.cpuUtil * 100)).toFixed(1) : '—';
  const thrashCount = pts.filter((p) => p.thrashing).length;
  const thrashStart = pts.find((p) => p.thrashing);

  return (
    <div className="page-wrapper">
      {/* ── Page Header ── */}
      <div className="section-header" style={{ paddingTop: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
          <FlaskConical size={22} style={{ color: 'var(--primary-light)' }} />
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, letterSpacing: '-0.03em' }}>
            Thrashing & Multiprogramming Lab
          </h1>
        </div>
        <p style={{ color: 'var(--text-2)', fontSize: '0.92rem' }}>
          Explore the mathematical relationship between physical frame capacity, working-set requirements, and the sudden collapse of CPU utilization.
        </p>
      </div>

      {/* ── Telemetry Hero Metrics ── */}
      <div className="thrash-hero-stats">
        <div className="thrash-stat">
          <div className="thrash-stat-lbl">
            <ShieldCheck size={12} style={{ color: 'var(--hit-light)' }} />
            <span>Safe Capacity</span>
          </div>
          <div className="thrash-stat-val" style={{ color: 'var(--hit-light)' }}>
            ≤ {safe} procs
          </div>
        </div>

        <div className="thrash-stat">
          <div className="thrash-stat-lbl">
            <Activity size={12} style={{ color: 'var(--primary-light)' }} />
            <span>Peak Utilization</span>
          </div>
          <div className="thrash-stat-val" style={{ color: 'var(--primary-light)' }}>
            {peakUtil}%
          </div>
        </div>

        <div className="thrash-stat">
          <div className="thrash-stat-lbl">
            <AlertOctagon size={12} style={{ color: 'var(--fault-light)' }} />
            <span>Thrashing Zones</span>
          </div>
          <div className="thrash-stat-val" style={{ color: 'var(--fault-light)' }}>
            {thrashCount} Steps
          </div>
        </div>

        <div className="thrash-stat">
          <div className="thrash-stat-lbl">
            <Zap size={12} style={{ color: 'var(--active-step)' }} />
            <span>Thrashing Threshold</span>
          </div>
          <div className="thrash-stat-val" style={{ color: 'var(--active-step)' }}>
            {thrashStart ? `${thrashStart.n} Processes` : 'None'}
          </div>
        </div>
      </div>

      {/* ── Controls + Chart Layout ── */}
      <div className="thrash-layout">
        {/* Controls Card */}
        <div className="card">
          <div className="card-title">
            <Sliders size={16} />
            <span>Kernel Parameters</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="field-label" style={{ margin: 0 }}>Total Physical Frames</label>
                <span className="speed-value" style={{ background: 'var(--surface-3)', padding: '0.1rem 0.5rem', borderRadius: 4 }}>
                  {total} Frames
                </span>
              </div>
              <input
                type="range"
                min={20}
                max={120}
                value={total}
                onChange={(e) => setTotal(+e.target.value)}
              />
              <div className="range-labels">
                <span>20 Frames</span>
                <span>120 Frames</span>
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="field-label" style={{ margin: 0 }}>Working Set Size Per Proc (WS)</label>
                <span className="speed-value" style={{ background: 'var(--surface-3)', padding: '0.1rem 0.5rem', borderRadius: 4 }}>
                  {ws} Pages
                </span>
              </div>
              <input
                type="range"
                min={2}
                max={30}
                value={ws}
                onChange={(e) => setWs(+e.target.value)}
              />
              <div className="range-labels">
                <span>2 Pages</span>
                <span>30 Pages</span>
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="field-label" style={{ margin: 0 }}>Disk Page-Fault Latency Penalty</label>
                <span className="speed-value" style={{ background: 'var(--surface-3)', padding: '0.1rem 0.5rem', borderRadius: 4 }}>
                  {cost}× Cycle Cost
                </span>
              </div>
              <input
                type="range"
                min={10}
                max={500}
                step={10}
                value={cost}
                onChange={(e) => setCost(+e.target.value)}
              />
              <div className="range-labels">
                <span>10× (SSD Cache)</span>
                <span>500× (Mechanical Disk)</span>
              </div>
            </div>
          </div>

          <div style={{ height: 1, background: 'var(--border-subtle)', margin: '1.25rem 0' }} />

          {/* Theoretical explanation */}
          <div style={{ fontSize: '0.84rem', color: 'var(--text-2)', lineHeight: 1.65 }}>
            <p style={{ marginBottom: '0.65rem' }}>
              Each process receives <code style={{ background: 'var(--surface-3)', padding: '1px 6px', borderRadius: 4, color: 'var(--primary-light)', fontFamily: 'var(--font-mono)' }}>⌊{total} / n⌋</code> frames.
            </p>
            <p style={{ marginBottom: '0.65rem' }}>
              When allocated frames drop below the process's working set (<strong style={{ color: '#fff' }}>{ws} pages</strong>), page fault frequency explodes and disk queuing dominates execution time.
            </p>
            <p>
              <strong style={{ color: 'var(--hit-light)' }}>Kernel Mitigation:</strong> The working-set scheduling policy suspends lower-priority processes when ∑WS &gt; RAM, preventing the thrashing spiral.
            </p>
          </div>

          <div className="safe-banner" style={{ marginTop: '1.25rem' }}>
            <ShieldCheck size={16} style={{ flexShrink: 0, color: 'var(--hit-light)' }} />
            <div>
              Safe operation limit: <strong>≤ {safe} processes</strong>. Beyond this threshold, thrashing causes catastrophic CPU starvation.
            </div>
          </div>
        </div>

        {/* Chart Visualization Card */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="card-title">
            <Activity size={16} />
            <span>CPU Utilization & Page Fault Dynamics</span>
          </div>

          <p style={{ fontSize: '0.8rem', color: 'var(--text-3)', marginBottom: '1rem' }}>
            Observe the steep utilization cliff. Points colored in <span style={{ color: 'var(--fault-light)', fontWeight: 700 }}>red</span> indicate process counts where memory thrashing occurs.
          </p>

          <div style={{ height: 340, width: '100%', position: 'relative' }}>
            <Line data={data} options={chartOptions(pts)} />
          </div>
        </div>
      </div>

      {/* ── Granular Data Table ── */}
      <div className="card" style={{ marginTop: '1.25rem' }}>
        <div className="card-title">
          <span>Multiprogramming Degree Step Ledger</span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ textAlign: 'left' }}># Concurrent Procs</th>
                <th>Frames Allocated / Proc</th>
                <th>CPU Utilization</th>
                <th>Page Fault Rate</th>
                <th>System State</th>
              </tr>
            </thead>
            <tbody>
              {pts.map((p) => (
                <tr key={p.n} className={p.thrashing ? 'thrashing-row' : ''}>
                  <td style={{ textAlign: 'left', fontWeight: 700 }}>
                    {p.n} Processes
                  </td>
                  <td>{p.framesEach} frames</td>
                  <td style={{ color: p.thrashing ? 'var(--fault-light)' : 'var(--hit-light)', fontWeight: 700 }}>
                    {(p.cpuUtil * 100).toFixed(1)}%
                  </td>
                  <td>{(p.faultRate * 100).toFixed(1)}%</td>
                  <td>
                    {p.thrashing ? (
                      <span className="state-badge state-thrashing">
                        <AlertOctagon size={11} /> Thrashing
                      </span>
                    ) : (
                      <span className="state-badge state-safe">
                        <ShieldCheck size={11} /> Safe Operation
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
