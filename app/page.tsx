import Link from 'next/link'
import ThemeToggle from './components/ThemeToggle'

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
  {
    id: 6,
    title: 'Virtual Memory Simulation',
    description: 'Explore demand paging and page replacement techniques',
    slug: 'virtual-memory',
  },
  {
    id: 7,
    title: 'File System Management',
    description: 'Visualize Contiguous, Linked, and Indexed file allocation',
    slug: 'file-system',
  },
  {
    id: 8,
    title: 'Disk Scheduling',
    description: 'Simulate FCFS, SSTF, SCAN, C-SCAN, and LOOK algorithms',
    slug: 'disk-scheduling',
  },
  {
    id: 9,
    title: 'I/O & Device Scheduling',
    description: 'Learn device queue simulation and interrupt handling',
    slug: 'io-scheduling',
  },
  {
    id: 10,
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
    </div>
    </>
  )
}

