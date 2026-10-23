/**
 * Export utilities: PNG screenshot and PDF report.
 * Uses html2canvas for DOM capture and jsPDF for PDF generation.
 */
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

/**
 * Capture an element as a PNG and trigger download.
 * @param {HTMLElement} element
 * @param {string} filename
 */
export async function exportPNG(element, filename = 'vm-sim-snapshot') {
  const canvas = await html2canvas(element, {
    backgroundColor: '#09090b',
    scale: 2,
    useCORS: true,
    logging: false,
  });
  const link = document.createElement('a');
  link.download = `${filename}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
}

/**
 * Generate a PDF report of a simulation run.
 * @param {{
 *   policy: string, frameCount: number,
 *   faults: number, hits: number, faultRate: number,
 *   steps: Array
 * }} run
 * @param {number[]} refs
 */
export function exportPDF(run, refs) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const W = 210; // A4 width mm

  // ── Header ──
  doc.setFillColor(9, 9, 11);
  doc.rect(0, 0, W, 30, 'F');
  doc.setTextColor(250, 250, 250);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Virtual Memory Simulator', W / 2, 13, { align: 'center' });
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(161, 161, 170);
  doc.text(`Simulation Report  ·  Generated ${new Date().toLocaleString()}`, W / 2, 21, { align: 'center' });

  // ── Summary ──
  doc.setTextColor(30, 30, 30);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('Simulation Summary', 14, 40);

  const summary = [
    ['Policy',     run.policy],
    ['Frames',     String(run.frameCount)],
    ['Total Refs', String(refs.length)],
    ['Faults',     String(run.faults)],
    ['Hits',       String(run.hits)],
    ['Fault Rate', `${(run.faultRate * 100).toFixed(1)}%`],
  ];

  let y = 46;
  doc.setFontSize(10);
  summary.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 100, 100);
    doc.text(label + ':', 14, y);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(30, 30, 30);
    doc.text(value, 60, y);
    y += 7;
  });

  // ── Reference String ──
  y += 5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(30, 30, 30);
  doc.text('Reference String', 14, y);
  y += 6;
  doc.setFont('courier', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(60, 60, 60);
  const refLine = refs.join('  ');
  const wrapped = doc.splitTextToSize(refLine, W - 28);
  doc.text(wrapped, 14, y);
  y += wrapped.length * 5 + 6;

  // ── Step-by-step table ──
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(30, 30, 30);
  doc.text('Step-by-Step Trace', 14, y);
  y += 6;

  const colW = [12, 14, 12, 14, 80];
  const headers = ['Step', 'Page', 'H/F', 'Evicted', 'Frames'];
  doc.setFontSize(8);

  // Header row
  doc.setFillColor(39, 39, 42);
  doc.rect(14, y - 4, W - 28, 6, 'F');
  doc.setTextColor(250, 250, 250);
  let x = 14;
  headers.forEach((h, i) => { doc.text(h, x + 1, y); x += colW[i]; });
  y += 4;

  // Data rows
  doc.setFont('courier', 'normal');
  run.steps.forEach((s, i) => {
    if (y > 270) { doc.addPage(); y = 20; }
    const bg = i % 2 === 0 ? [248, 248, 248] : [255, 255, 255];
    doc.setFillColor(...bg);
    doc.rect(14, y - 3, W - 28, 5, 'F');

    if (!s.hit) doc.setTextColor(180, 40, 40);
    else        doc.setTextColor(20, 140, 80);

    x = 14;
    const row = [
      String(i + 1),
      String(s.page),
      s.hit ? 'H' : 'F',
      s.evicted !== null ? String(s.evicted) : '-',
      s.frames.map((f) => (f !== null ? f : '_')).join('  '),
    ];
    row.forEach((v, ci) => { doc.text(v, x + 1, y); x += colW[ci]; });
    y += 5;
    doc.setTextColor(30, 30, 30);
  });

  doc.save(`vm-sim-${run.policy}-${run.frameCount}frames.pdf`);
}

/**
 * Generate a CSV string for a simulation run.
 * @param {object} run
 * @param {number[]} refs
 * @returns {string}
 */
export function exportCSV(run, _refs) {
  const header = 'Step,Page,Hit,Evicted,Frames,Cumulative Faults';
  const rows = run.steps.map((s, i) =>
    [
      i + 1,
      s.page,
      s.hit ? 'H' : 'F',
      s.evicted !== null ? s.evicted : '',
      `"${s.frames.map((f) => (f !== null ? f : '_')).join(' ')}"`,
      s.faults,
    ].join(',')
  );
  return [header, ...rows].join('\n');
}
