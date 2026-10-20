/**
 * About page — OS theory: demand paging, page faults, thrashing, working set.
 */
import { BookOpen, Cpu, AlertTriangle, Layers, GitBranch } from 'lucide-react';

const SECTIONS = [
  {
    icon: <Cpu size={20} />,
    color: '#3b82f6',
    title: 'Virtual Memory & Demand Paging',
    content: [
      {
        subtitle: 'What is Virtual Memory?',
        text: `Virtual memory is an abstraction that gives each process the illusion of having a large, 
        contiguous address space, even if physical RAM is limited. The OS maps virtual page numbers to 
        physical frame numbers using a page table stored in memory (and cached in the TLB — Translation 
        Lookaside Buffer).`,
      },
      {
        subtitle: 'Demand Paging',
        text: `With demand paging, pages are only loaded into physical memory when they are actually 
        referenced ("on demand"). When a process starts, its page table entries are marked invalid. 
        The first access to any page triggers a page fault, causing the OS to:
        
        1. Trap into kernel mode
        2. Find a free frame (or evict an existing page)
        3. Read the page from disk into the frame
        4. Update the page table and resume the faulting instruction
        
        This allows programs much larger than physical memory to run, and avoids loading 
        code/data that is never actually used.`,
      },
      {
        subtitle: 'The Page Fault Lifecycle',
        text: `A page fault is expensive — disk access takes ~10ms vs ~100ns for RAM (100,000× slower). 
        Minimizing page faults is therefore critical to performance. The choice of page replacement 
        algorithm directly controls how many faults occur.`,
      },
    ],
  },
  {
    icon: <AlertTriangle size={20} />,
    color: '#f43f5e',
    title: 'Thrashing',
    content: [
      {
        subtitle: 'What is Thrashing?',
        text: `Thrashing occurs when a process (or the system) spends more time servicing page faults 
        than executing useful instructions. This happens when a process has fewer physical frames 
        than its active working set requires — it faults on nearly every memory reference.`,
      },
      {
        subtitle: 'The Thrashing Cycle',
        text: `As the OS admits more processes to improve CPU utilization:
        
        1. Each process gets fewer frames
        2. Fault rates rise for all processes
        3. Processes spend most time waiting for disk I/O
        4. CPU utilization collapses — the OS queues up even more processes
        5. Downward spiral: the system appears "hung"
        
        The CPU utilization curve rises, peaks, then sharply drops — this cliff is the thrashing threshold.`,
      },
      {
        subtitle: 'Prevention: The Working-Set Model',
        text: `The working-set model (Peter Denning, 1968) defines the working set WS(t,Δ) as the 
        set of pages referenced in the last Δ references at time t. The OS should admit a new 
        process only if: sum of all working set sizes ≤ total physical frames. 
        If not, suspend a process until enough memory is free.`,
      },
      {
        subtitle: "Belady's Anomaly",
        text: `Counterintuitively, the FIFO algorithm can suffer MORE page faults with MORE frames. 
        This is Belady's Anomaly (1969). Classic example: reference string [1,2,3,4,1,2,5,1,2,3,4,5]
        gives 9 faults with 3 frames but 10 faults with 4 frames under FIFO. 
        LRU, OPT, and Clock do NOT exhibit Belady's Anomaly — they belong to the "stack algorithms" family.`,
      },
    ],
  },
  {
    icon: <Layers size={20} />,
    color: '#a78bfa',
    title: 'Working Set Model',
    content: [
      {
        subtitle: 'Formal Definition',
        text: `WS(t, Δ) = { p : p was referenced at least once in the interval (t−Δ, t] }
        
        Where:
        • t = current virtual time (reference count)
        • Δ = window size (the "locality window")
        • p = page number
        
        A smaller Δ captures short-term locality; a larger Δ approximates the full program's needs.`,
      },
      {
        subtitle: 'Locality of Reference',
        text: `Programs do not access memory uniformly. They exhibit:
        
        • Temporal locality: recently accessed locations are likely to be accessed again soon.
        • Spatial locality: locations near recently accessed ones are likely to be accessed soon.
        
        These properties make LRU and Clock effective in practice — they keep the "hot" pages in memory.`,
      },
    ],
  },
  {
    icon: <GitBranch size={20} />,
    color: '#f59e0b',
    title: 'Algorithm Comparison',
    content: [
      {
        subtitle: 'Stack Property',
        text: `An algorithm has the stack property if the set of pages in memory with n frames is 
        always a subset of the pages in memory with n+1 frames. LRU, OPT, and Clock have this property — 
        they cannot exhibit Belady's Anomaly. FIFO does NOT.`,
      },
      {
        subtitle: 'Real-World Usage',
        text: `• Linux: uses an enhanced Clock algorithm called "Active/Inactive list LRU" with two lists 
          (active pages and recently-evicted candidates).
        • Windows: uses a working-set trimmer — the OS periodically reduces each process's resident 
          pages when memory is under pressure.
        • Database systems: often manage their own buffer pools with LRU-K or ARC policies.`,
      },
      {
        subtitle: 'Fault Rate vs. Frames',
        text: `For all stack algorithms, increasing frame count monotonically decreases fault rate. 
        The relation is hyperbolic — diminishing returns. The "knee" of the curve (where adding 
        frames stops helping significantly) corresponds roughly to the working set size.`,
      },
    ],
  },
];

export default function About() {
  return (
    <div className="page-content">
      <div className="page-hero-small">
        <h1>OS Theory & Concepts</h1>
        <p>The computer science behind demand paging, page replacement, and thrashing.</p>
      </div>

      <div className="about-sections">
        {SECTIONS.map((sec) => (
          <section key={sec.title} className="about-section">
            <div className="about-section-header">
              <span className="about-section-icon" style={{ color: sec.color, background: `${sec.color}18` }}>
                {sec.icon}
              </span>
              <h2 className="about-section-title">{sec.title}</h2>
            </div>
            <div className="about-section-body">
              {sec.content.map((block) => (
                <div key={block.subtitle} className="about-block">
                  <h3 className="about-block-title">{block.subtitle}</h3>
                  {block.text.split('\n\n').map((para, i) => (
                    <p key={i} className="about-block-text">{para.trim()}</p>
                  ))}
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* References */}
      <section className="about-section">
        <div className="about-section-header">
          <span className="about-section-icon" style={{ color: '#71717a', background: 'var(--surface-3)' }}>
            <BookOpen size={20} />
          </span>
          <h2 className="about-section-title">Further Reading</h2>
        </div>
        <ul className="about-refs">
          <li>Silberschatz, Galvin & Gagne — <em>Operating System Concepts</em> (10th ed.), Ch. 10</li>
          <li>Tanenbaum — <em>Modern Operating Systems</em> (4th ed.), Ch. 3</li>
          <li>Denning, P.J. (1968) — "The working set model for program behavior" — <em>CACM</em></li>
          <li>Belady, L.A. (1969) — "A study of replacement algorithms for virtual storage computers" — <em>IBM Systems Journal</em></li>
        </ul>
      </section>
    </div>
  );
}
