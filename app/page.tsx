import Link from 'next/link'
import ThemeToggle from './components/ThemeToggle'
import Icon from './components/Icon'

const modules = [
  {
    id: 1,
    title: 'CPU Scheduling',
    description: 'Explore FCFS, SJF, SRTF, Priority, and Round Robin scheduling algorithms',
    slug: 'cpu-scheduling',
  },
  {
    id: 2,
    title: 'Process Synchronization',
    description: 'Visualize Peterson\'s algorithm, Semaphores, and Monitors in action',
    slug: 'process-synchronization',
  },
  {
    id: 3,
    title: 'Deadlock Detection & Avoidance',
    description: 'Simulate resource allocation graphs and Banker\'s Algorithm',
    slug: 'deadlock',
  },
  {
    id: 4,
    title: 'Memory Management (Paging)',
    description: 'Learn FIFO, LRU, and Optimal page replacement algorithms',
    slug: 'memory-paging',
  },
  {
    id: 5,
    title: 'Memory Management (Segmentation)',
    description: 'Understand dynamic partitioning and allocation strategies',
    slug: 'memory-segmentation',
  },
  // {
  //   id: 6,
  //   title: 'Virtual Memory Simulation',
  //   description: 'Explore demand paging and page replacement techniques',
  //   slug: 'virtual-memory',
  // },
  // {
  //   id: 7,
  //   title: 'File System Management',
  //   description: 'Visualize Contiguous, Linked, and Indexed file allocation',
  //   slug: 'file-system',
  // },
  // {
  //   id: 8,
  //   title: 'Disk Scheduling',
  //   description: 'Simulate FCFS, SSTF, SCAN, C-SCAN, and LOOK algorithms',
  //   slug: 'disk-scheduling',
  // },
  // {
  //   id: 8,
  //   title: 'I/O & Device Scheduling',
  //   description: 'Learn device queue simulation and interrupt handling',
  //   slug: 'io-scheduling',
  // },
  {
    id: 6,
    title: 'System Calls & OS Services',
    description: 'Interactive demonstrations of fork(), exec(), wait(), and more',
    slug: 'system-calls',
  },
]

export default function Home() {
  return (
    <>
      <ThemeToggle />
      <div className="container">
        <div className="header">
          <h1>OS Concepts Interactive Simulator</h1>
          <p>Learn Operating Systems through hands-on simulations</p>
        </div>
      
      <div className="cards-grid">
        {modules.map((module) => (
          <Link href={`/${module.slug}`} key={module.id} className="card">
            <div className="card-number">{module.id}</div>
            <h2>{module.title}</h2>
            <p>{module.description}</p>
          </Link>
        ))}
      </div>

      {/* Full OS Simulator - Special Large Card */}
      <div className="full-os-card-container">
        <Link href="/full-os-simulator" className="card full-os-card">
          <div className="card-number">7</div>
          <div className="full-os-content">
            <div className="full-os-text">
              <h2><Icon name="ai-powered" size={32} /> AI-Powered Full OS Simulator</h2>
              <p>Experience a complete operating system simulator powered by AI. Describe your tasks in natural language, and watch as the AI decomposes them into subtasks and executes them on a simulated OS environment in real-time.</p>
              <div className="os-features">
                <span className="feature-badge">AI Task Decomposition</span>
                <span className="feature-badge">Real-time Execution</span>
                <span className="feature-badge">Natural Language Control</span>
              </div>
            </div>
            <div className="full-os-preview">
              <div className="preview-screen">
                <div className="preview-header">
                  <span className="preview-dot"></span>
                  <span className="preview-dot"></span>
                  <span className="preview-dot"></span>
                </div>
                <div className="preview-content">
                  <div className="preview-line">$ Simulated OS Terminal</div>
                  <div className="preview-line">$ AI-powered task execution</div>
                  <div className="preview-line blink">▊</div>
                </div>
              </div>
            </div>
          </div>
        </Link>
      </div>
    </div>
    </>
  )
}

