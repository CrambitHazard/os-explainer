# OS Concepts Interactive Simulator

A clean and simple web application to explore and learn Operating Systems concepts through interactive simulations.

## Features

- 🎯 **10 OS Concept Modules**: CPU Scheduling, Process Synchronization, Deadlock, Memory Management, Virtual Memory, File System, Disk Scheduling, I/O Scheduling, and System Calls
- ✨ **Smooth Animations**: Beautiful card hover effects and page transitions
- 🎨 **Clean Design**: Minimalist interface with gradient backgrounds and modern typography
- 📱 **Responsive**: Works seamlessly on desktop and mobile devices

## Getting Started

### Prerequisites

- Node.js 18+ installed on your system

### Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
os-explainer/
├── app/
│   ├── cpu-scheduling/          # CPU Scheduling module
│   ├── process-synchronization/ # Process Synchronization module
│   ├── deadlock/                # Deadlock Detection & Avoidance
│   ├── memory-paging/           # Memory Management (Paging)
│   ├── memory-segmentation/     # Memory Management (Segmentation)
│   ├── virtual-memory/          # Virtual Memory Simulation
│   ├── file-system/             # File System Management
│   ├── disk-scheduling/         # Disk Scheduling
│   ├── io-scheduling/           # I/O & Device Scheduling
│   ├── system-calls/            # System Calls & OS Services
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Home page with module cards
│   └── globals.css              # Global styles
├── package.json
└── README.md
```

## Technology Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Pure CSS with animations
- **Deployment**: Ready for Vercel/Netlify

## Modules

1. **CPU Scheduling** - FCFS, SJF, SRTF, Priority, Round Robin
2. **Process Synchronization** - Peterson's algorithm, Semaphores, Monitors
3. **Deadlock Detection & Avoidance** - Resource allocation graphs, Banker's Algorithm
4. **Memory Management (Paging)** - FIFO, LRU, Optimal replacement
5. **Memory Management (Segmentation)** - Dynamic partitioning strategies
6. **Virtual Memory Simulation** - Demand paging, page replacement
7. **File System Management** - Contiguous, Linked, Indexed allocation
8. **Disk Scheduling** - FCFS, SSTF, SCAN, C-SCAN, LOOK
9. **I/O & Device Scheduling** - Device queue simulation
10. **System Calls & OS Services** - fork(), exec(), wait(), open(), read(), write()

## Building for Production

```bash
npm run build
npm start
```

## License

This project is for educational purposes.
