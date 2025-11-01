import { FileEntry } from './types'

export const exampleFiles = [
  { name: 'system.dll', size: 4 },
  { name: 'app.exe', size: 6 },
  { name: 'data.txt', size: 2 },
  { name: 'image.png', size: 8 },
  { name: 'video.mp4', size: 12 },
  { name: 'config.ini', size: 1 },
  { name: 'document.pdf', size: 5 },
  { name: 'library.so', size: 3 },
]

export const scenarios = {
  sequential: {
    name: 'Sequential Allocation',
    description: 'Files allocated one after another, demonstrates contiguous allocation',
    files: [
      { name: 'file1.txt', size: 4 },
      { name: 'file2.doc', size: 3 },
      { name: 'file3.pdf', size: 5 },
    ],
    optimalMethod: 'contiguous',
  },
  
  fragmented: {
    name: 'Fragmented Scenario',
    description: 'Multiple allocations and deletions causing fragmentation',
    files: [
      { name: 'app1.exe', size: 6 },
      { name: 'app2.exe', size: 4 },
      { name: 'data.bin', size: 8 },
      { name: 'temp.tmp', size: 2 },
    ],
    deleteSequence: ['app2.exe', 'temp.tmp'],
    optimalMethod: 'linked',
  },
  
  large: {
    name: 'Large File Allocation',
    description: 'Allocating large files, best for indexed allocation',
    files: [
      { name: 'database.db', size: 15 },
      { name: 'video.mkv', size: 20 },
    ],
    optimalMethod: 'indexed',
  },
  
  mixed: {
    name: 'Mixed Workload',
    description: 'Variety of file sizes and operations',
    files: [
      { name: 'small1.txt', size: 1 },
      { name: 'medium.doc', size: 5 },
      { name: 'small2.log', size: 2 },
      { name: 'large.zip', size: 12 },
      { name: 'tiny.ini', size: 1 },
    ],
    optimalMethod: 'indexed',
  },
}

export const fileColors = [
  '#00ff41', '#00d4ff', '#ff00ff', '#ffaa00', 
  '#ff6b6b', '#51cf66', '#ffd43b', '#a78bfa',
  '#06b6d4', '#ec4899', '#10b981', '#f59e0b',
]

