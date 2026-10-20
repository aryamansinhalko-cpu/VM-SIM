# Virtual Memory Simulator

A web application that simulates **demand paging** and **thrashing** in operating systems.
It runs FIFO, LRU, and Optimal page replacement on a reference string, shows every step
(frames, page table, hit or fault), compares the three policies, and demonstrates thrashing
with a CPU utilization curve.

🔗 **Live Demo**: _(deploy to Vercel or GitHub Pages and add link here)_

---

## Requirements Checklist

- [x] **R1** — Simulate FIFO, LRU, and Optimal page replacement
- [x] **R2** — Compare the three policies side by side (faults, hits, fault rate)
- [x] **R3** — Accept a custom reference string AND generate random / locality-based ones
- [x] **R4** — Real-time visualization of frame allocation, page table and page faults
- [x] **R5** — Thrashing demo: performance cliff and CPU utilization drop when working set exceeds physical memory
- [x] **R6** — Controls: frame count, process working set size, step forward and back, play and pause, reset
- [x] **R7** — README and short report included (deploy for public link)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| UI Framework | React 19 + Vite 8 |
| Charts | Chart.js 4 + react-chartjs-2 |
| Testing | Vitest 5 |
| Styling | Plain CSS (semantic color coding) |
| Deployment | Vercel / GitHub Pages |

---

## Project Structure

```
vm-sim/
├── src/
│   ├── engine/
│   │   ├── rng.js           # Mulberry32 seeded PRNG
│   │   ├── refstring.js     # Parse, random, and locality ref generators
│   │   ├── paging.js        # FIFO, LRU, OPT simulator (pure functions)
│   │   ├── thrashing.js     # Multiprogramming / CPU utilization model
│   │   └── paging.test.js   # Unit tests (12 tests)
│   ├── components/
│   │   ├── Controls.jsx     # All simulation inputs & controls
│   │   ├── FrameTimeline.jsx# Classic textbook frame table
│   │   ├── PageTable.jsx    # Virtual to physical page mapping
│   │   ├── StatsBar.jsx     # Live fault/hit counters
│   │   ├── CompareTable.jsx # Side-by-side policy comparison + CSV export
│   │   └── ThrashingChart.jsx # CPU utilization cliff chart
│   ├── App.jsx              # Root component, state management
│   ├── main.jsx             # Entry point
│   └── index.css            # Global styles
├── package.json
└── README.md
```

---

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev
# -> http://localhost:5173

# Run tests
npm test

# Production build
npm run build
```

---

## Key Features

### Page Replacement Simulation
- **FIFO** - Evict the page loaded longest ago
- **LRU** - Evict the page not used for the longest time
- **OPT** - Evict the page whose next use is farthest in the future (theoretical optimal)

### Interactive Controls
- Type or paste a custom reference string
- Generate **random** or **locality-based** reference strings
- Load the **Belady's Anomaly** preset (FIFO with 3 to 4 frames gives more faults)
- Adjust frame count (1-10) via slider
- **Play/Pause** animation, step forward/back, jump to end
- **Keyboard shortcuts**: Left/Right arrow to step, Space to play/pause

### Visualizations
- **Frame Timeline** - textbook-style table with red (fault) / green (hit) cells; victim cells have a thick red border
- **Page Table** - live virtual to physical mapping with valid bits and event descriptions
- **Stats Bar** - live fault count, hit count, fault rate, and progress
- **Policy Comparison** - side-by-side table with best policy highlighted; CSV export
- **Thrashing Chart** - CPU utilization vs. degree of multiprogramming with interactive sliders

### Thrashing Demonstration
As the number of concurrent processes increases:
1. CPU utilization rises (more processes = CPU always has work)
2. Frames per process shrink below the working set size
3. **Fault rate explodes** - processes spend all time waiting on disk
4. **CPU utilization collapses** - the thrashing cliff

The working-set rule predicts the safe limit: floor(totalFrames / wsSize) processes.

---

## Concepts

| Term | Definition |
|------|-----------|
| **Demand Paging** | Load a page into memory only when it is first referenced |
| **Page Fault** | Accessing a page not currently in physical memory |
| **Page Replacement** | Choosing a victim page to evict when frames are full |
| **Working Set** | Set of pages a process actively uses in a recent time window |
| **Belady's Anomaly** | FIFO can produce more faults with more frames |
| **Thrashing** | System is so overloaded with page faults that CPU utilization collapses |

---

## Deployment

### Vercel (recommended)
```bash
npm install -g vercel
vercel
```

### GitHub Pages
```bash
# In vite.config.js, set base: '/repo-name/'
npm run build
# Push dist/ folder or use gh-pages package
```

---

## Short Report

### Observations

**Textbook string** `7 0 1 2 0 3 0 4 2 3 0 3 2 1 2 0 1 7 0 1` with 3 frames:
- FIFO: **15 faults** (75% fault rate)
- LRU: **12 faults** (60% fault rate)
- OPT: **9 faults** (45% fault rate)

OPT is always at most LRU which is always at most FIFO in fault count, confirming Optimal as the lower bound.

**Belady's Anomaly** with string `1 2 3 4 1 2 5 1 2 3 4 5`:
- FIFO 3 frames: **9 faults**
- FIFO 4 frames: **10 faults** -- more frames, more faults!
- LRU does not exhibit this anomaly (stack property)

**Thrashing** (default: 60 frames, WS=10, disk cost=100x):
- At 6 processes (6 x 10 = 60 frames), utilization peaks
- At 12 processes (5 frames each, below WS=10), the system thrashes
- CPU utilization drops sharply while fault rate approaches 100%

### Conclusion
Demand paging is essential for running programs larger than physical memory, but without
proper working-set management, adding more processes causes thrashing - a catastrophic
performance collapse. The working-set model provides a principled solution: admit only
as many processes as memory can support simultaneously.
