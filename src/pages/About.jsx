/**
 * About — Operating Systems Architecture & Virtual Memory Foundations.
 * Covers demand paging traps, the working-set model, thrashing dynamics,
 * stack algorithms, and production kernel implementations.
 */
import { BookOpen, Cpu, AlertTriangle, Layers, GitBranch, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const SECTIONS = [
  {
    icon: <Cpu size={20} />,
    color: '#863bff',
    title: 'Virtual Memory & Demand Paging',
    content: [
      {
        subtitle: 'What is Virtual Memory?',
        text: `Virtual memory is a foundational OS abstraction that provides each process with the illusion of a vast, contiguous address space, regardless of physical RAM fragmentation or size limits. The hardware Memory Management Unit (MMU) translates virtual page numbers to physical frame numbers using page tables stored in RAM and cached within the Translation Lookaside Buffer (TLB).`,
      },
      {
        subtitle: 'The Demand Paging Mechanism',
        text: `Under pure demand paging, pages are loaded into physical RAM only when referenced by an instruction. Initial page table entries are marked invalid with a Valid-Bit of 0. When an instruction references an unmapped virtual address:
        
1. The MMU raises a hardware page-fault interrupt trap to the kernel.
2. The OS preserves process register state and consults internal memory descriptors.
3. The kernel finds an unoccupied frame or executes a replacement policy to evict a resident victim page.
4. The requested page is read from secondary storage (disk or SSD swap partition).
5. The page table entry is updated to point to the frame, the valid bit is set to 1, and the faulting instruction is restarted.`,
      },
      {
        subtitle: 'The Page Fault Penalty',
        text: `Serving a page fault requires disk I/O, which operates on the order of 100,000× to 1,000,000× slower than direct semiconductor RAM access. Minimizing page faults through intelligent replacement algorithms is therefore paramount to computer system performance.`,
      },
    ],
  },
  {
    icon: <AlertTriangle size={20} />,
    color: '#f43f5e',
    title: 'Thrashing & Multiprogramming Dynamics',
    content: [
      {
        subtitle: 'What Causes Thrashing?',
        text: `Thrashing occurs when an operating system spends more execution cycles servicing page faults than executing user instructions. This catastrophe transpires when total active memory demand across all concurrent processes exceeds physical RAM capacity.`,
      },
      {
        subtitle: 'The Downward Thrashing Spiral',
        text: `In naive operating systems:
        
1. Processes fault frequently because they have fewer frames than their working set.
2. Processes enter the disk I/O wait queue, causing CPU utilization to decline.
3. The OS CPU scheduler detects low processor load and erroneously admits additional processes to increase concurrency.
4. The newly admitted processes demand even more frames, starving existing processes further.
5. CPU utilization plummets near zero, and the system appears completely frozen.`,
      },
      {
        subtitle: "Belady's Anomaly",
        text: `Discovered by Laszlo Belady in 1969, this counterintuitive anomaly demonstrates that under FIFO replacement, allocating MORE physical frames can result in MORE page faults on certain reference strings. Stack algorithms like LRU and OPT are mathematically proven to be immune to Belady's Anomaly.`,
      },
    ],
  },
  {
    icon: <Layers size={20} />,
    color: '#c084fc',
    title: 'The Working-Set Model (Peter Denning)',
    content: [
      {
        subtitle: 'Mathematical Definition',
        text: `The working set W(t, Δ) represents the set of distinct pages referenced by a process within the past Δ virtual time units:
        
W(t, Δ) = { p ∈ Pages : p was referenced during [t − Δ, t] }

Where:
• t = current virtual memory clock cycle
• Δ = working-set window parameter

If Δ is chosen too small, it fails to encompass the active locality; if Δ is chosen too large, it overlaps multiple distinct phases of program execution.`,
      },
      {
        subtitle: 'Locality of Reference',
        text: `Programs exhibit two primary dimensions of memory locality:
        
• Temporal Locality: If a page is accessed, it is likely to be accessed again in the near future (e.g., loops, stack variables).
• Spatial Locality: If a page is accessed, nearby memory locations are likely to be accessed soon (e.g., sequential array iterations, sequential code execution).`,
      },
    ],
  },
  {
    icon: <GitBranch size={20} />,
    color: '#47bfff',
    title: 'Stack Algorithms & Real-World Implementations',
    content: [
      {
        subtitle: 'The Stack Inclusion Property',
        text: `An algorithm satisfies the Stack Property if the set of pages resident in an n-frame allocation is always a strict subset of the pages resident in an (n + 1)-frame allocation for identical reference sequences. LRU, OPT, and Clock adhere to this property; FIFO does not.`,
      },
      {
        subtitle: 'Production Operating System Kernels',
        text: `• Linux Kernel: Uses an active and inactive dual-list Clock replacement heuristic (kswapd daemon), distinguishing inactive pages as eviction candidates before dirty writeback.
• Windows NT / 11: Employs a working-set trimmer daemon that periodically trims resident frames from inactive processes to feed the standby page pool.
• Database Engines: Engines like PostgreSQL and SQLite maintain custom buffer pool algorithms (such as 2Q or Adaptive Replacement Cache - ARC) to optimize for query plan locality.`,
      },
    ],
  },
];

export default function About() {
  return (
    <div className="page-wrapper">
      {/* ── Page Header ── */}
      <div className="section-header" style={{ paddingTop: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
              <BookOpen size={22} style={{ color: 'var(--primary-light)' }} />
              <h1 style={{ fontSize: '1.85rem', fontWeight: 800, letterSpacing: '-0.03em' }}>
                Virtual Memory Theory & Architecture
              </h1>
            </div>
            <p style={{ color: 'var(--text-2)', fontSize: '0.92rem' }}>
              The computer science principles governing demand paging, page fault lifecycles, memory pressure, and kernel cache management.
            </p>
          </div>

          <Link to="/simulator" className="link-btn link-btn-primary">
            <span>Explore in Simulator</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* ── Theory Cards ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1.5rem' }}>
        {SECTIONS.map((sec) => (
          <div key={sec.title} className="card" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 'var(--r-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: `${sec.color}18`,
                  color: sec.color,
                  border: `1px solid ${sec.color}35`,
                }}
              >
                {sec.icon}
              </div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>
                {sec.title}
              </h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {sec.content.map((block) => (
                <div
                  key={block.subtitle}
                  style={{
                    background: 'var(--surface-1)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--r-md)',
                    padding: '1.25rem 1.5rem',
                  }}
                >
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff', marginBottom: '0.6rem' }}>
                    {block.subtitle}
                  </h3>
                  {block.text.split('\n\n').map((para, i) => (
                    <p
                      key={i}
                      style={{
                        fontSize: '0.9rem',
                        color: 'var(--text-2)',
                        lineHeight: 1.7,
                        marginBottom: i < block.text.split('\n\n').length - 1 ? '0.75rem' : 0,
                        whiteSpace: 'pre-line',
                      }}
                    >
                      {para.trim()}
                    </p>
                  ))}
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Academic References */}
        <div className="card" style={{ padding: '1.75rem 2rem' }}>
          <div className="card-title">
            <BookOpen size={16} />
            <span>Foundational Academic Citations & Literature</span>
          </div>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.86rem', color: 'var(--text-2)' }}>
            <li>
              • Silberschatz, Galvin & Gagne — <em style={{ color: '#fff' }}>Operating System Concepts</em> (10th ed.), Chapter 10: Virtual Memory.
            </li>
            <li>
              • Tanenbaum & Bos — <em style={{ color: '#fff' }}>Modern Operating Systems</em> (4th ed.), Chapter 3: Memory Management.
            </li>
            <li>
              • Denning, Peter J. (1968) — <em style={{ color: '#fff' }}>"The Working Set Model for Program Behavior"</em>, Communications of the ACM (CACM).
            </li>
            <li>
              • Belady, Laszlo A. (1969) — <em style={{ color: '#fff' }}>"An Anomaly in Space-Time Characteristics of Certain Programs Running in a Paging Machine"</em>, CACM.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
