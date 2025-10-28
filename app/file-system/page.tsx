'use client'

import { useState } from 'react'
import Link from 'next/link'
import ThemeToggle from '../components/ThemeToggle'
import Icon from '../components/Icon'
import { AllocationMethod, DiskBlock, FileEntry, DiskMetrics } from './types'
import { allocateContiguous, deleteContiguous, accessContiguous } from './algorithms/contiguous'
import { allocateLinked, deleteLinked, accessLinked, calculateSeekTimeLinked } from './algorithms/linked'
import { allocateIndexed, deleteIndexed, accessIndexed } from './algorithms/indexed'
import { exampleFiles, fileColors } from './examples'
import DiskVisualizer from './components/DiskVisualizer'
import FileList from './components/FileList'
import MetricsDisplay from './components/MetricsDisplay'
import ActivityLog from './components/ActivityLog'
import './file-system.css'

interface LogEntry {
  timestamp: string
  action: string
  message: string
  success: boolean
}

export default function FileSystemManagement() {
  const [method, setMethod] = useState<AllocationMethod>('contiguous')
  const [diskSize, setDiskSize] = useState(50)
  const [disk, setDisk] = useState<DiskBlock[]>([])
  const [files, setFiles] = useState<FileEntry[]>([])
  const [highlightedBlocks, setHighlightedBlocks] = useState<number[]>([])
  const [log, setLog] = useState<LogEntry[]>([])
  
  // File input
  const [fileName, setFileName] = useState('')
  const [fileSize, setFileSize] = useState(4)

  const initializeDisk = (size: number) => {
    const newDisk: DiskBlock[] = Array(size).fill(null).map((_, i) => ({
      blockNumber: i,
      allocated: false,
      fileId: null,
      fileName: null,
      isIndexBlock: false,
    }))
    setDisk(newDisk)
    setFiles([])
    setLog([])
    setHighlightedBlocks([])
  }

  const addLog = (action: string, message: string, success: boolean) => {
    const timestamp = new Date().toLocaleTimeString()
    setLog(prev => [...prev, { timestamp, action, message, success }])
  }

  const allocateFile = () => {
    if (!fileName.trim()) {
      alert('Please enter a file name')
      return
    }

    if (fileSize < 1 || fileSize > diskSize) {
      alert(`File size must be between 1 and ${diskSize}`)
      return
    }

    const color = fileColors[files.length % fileColors.length]
    let result

    const diskCopy = [...disk]

    switch (method) {
      case 'contiguous':
        result = allocateContiguous(fileName, fileSize, diskCopy, color)
        break
      case 'linked':
        result = allocateLinked(fileName, fileSize, diskCopy, color)
        break
      case 'indexed':
        result = allocateIndexed(fileName, fileSize, diskCopy, color)
        break
    }

    if (result.success && result.file) {
      setDisk(diskCopy)
      setFiles(prev => [...prev, result.file!])
      setHighlightedBlocks(result.blocksAllocated || [])
      addLog('ALLOCATE', `${fileName}: ${result.message}`, true)
      setFileName('')
      
      setTimeout(() => setHighlightedBlocks([]), 2000)
    } else {
      addLog('ALLOCATE FAILED', `${fileName}: ${result.message}`, false)
      alert(result.message)
    }
  }

  const deleteFile = (fileId: string) => {
    const file = files.find(f => f.id === fileId)
    if (!file) return

    const diskCopy = [...disk]
    let blocksFreed: number[] = []

    switch (method) {
      case 'contiguous':
        blocksFreed = deleteContiguous(fileId, diskCopy)
        break
      case 'linked':
        blocksFreed = deleteLinked(fileId, diskCopy)
        break
      case 'indexed':
        blocksFreed = deleteIndexed(fileId, diskCopy)
        break
    }

    setDisk(diskCopy)
    setFiles(prev => prev.filter(f => f.id !== fileId))
    setHighlightedBlocks(blocksFreed)
    addLog('DELETE', `Deleted ${file.name}, freed ${blocksFreed.length} blocks`, true)

    setTimeout(() => setHighlightedBlocks([]), 2000)
  }

  const accessFile = (file: FileEntry) => {
    // Simulate accessing the middle block of the file
    const blockOffset = Math.floor(file.size / 2)
    let blocksAccessed: number[] = []

    switch (method) {
      case 'contiguous':
        blocksAccessed = accessContiguous(file, blockOffset)
        break
      case 'linked':
        blocksAccessed = accessLinked(file, blockOffset)
        break
      case 'indexed':
        blocksAccessed = accessIndexed(file, blockOffset)
        break
    }

    setHighlightedBlocks(blocksAccessed)
    addLog('ACCESS', `Accessed ${file.name}, touched ${blocksAccessed.length} blocks`, true)

    setTimeout(() => setHighlightedBlocks([]), 2000)
  }

  const loadExampleFiles = () => {
    exampleFiles.forEach((example, index) => {
      setTimeout(() => {
        const color = fileColors[index % fileColors.length]
        const diskCopy = [...disk]
        let result

        switch (method) {
          case 'contiguous':
            result = allocateContiguous(example.name, example.size, diskCopy, color)
            break
          case 'linked':
            result = allocateLinked(example.name, example.size, diskCopy, color)
            break
          case 'indexed':
            result = allocateIndexed(example.name, example.size, diskCopy, color)
            break
        }

        if (result.success && result.file) {
          setDisk(diskCopy)
          setFiles(prev => [...prev, result.file!])
          addLog('ALLOCATE', `${example.name}: ${result.message}`, true)
        }
      }, index * 200)
    })
  }

  const calculateMetrics = (): DiskMetrics => {
    const usedBlocks = disk.filter(b => b.allocated).length
    const freeBlocks = diskSize - usedBlocks
    const utilization = (usedBlocks / diskSize) * 100

    // Calculate external fragmentation (for contiguous)
    let largestFreeSpace = 0
    let currentFreeSpace = 0
    let totalFreeSpace = 0
    let freeRegions = 0

    disk.forEach(block => {
      if (!block.allocated) {
        currentFreeSpace++
        totalFreeSpace++
      } else {
        if (currentFreeSpace > 0) {
          freeRegions++
          largestFreeSpace = Math.max(largestFreeSpace, currentFreeSpace)
        }
        currentFreeSpace = 0
      }
    })

    if (currentFreeSpace > 0) {
      freeRegions++
      largestFreeSpace = Math.max(largestFreeSpace, currentFreeSpace)
    }

    const externalFragmentation = freeBlocks > 0
      ? ((freeBlocks - largestFreeSpace) / freeBlocks) * 100
      : 0

    // Calculate average seek time
    let totalSeekDistance = 0
    files.forEach(file => {
      if (file.blocks && file.blocks.length > 1) {
        for (let i = 0; i < file.blocks.length - 1; i++) {
          totalSeekDistance += Math.abs(file.blocks[i + 1] - file.blocks[i])
        }
      }
    })

    const averageSeekTime = files.length > 0 ? totalSeekDistance / files.length : 0

    return {
      totalBlocks: diskSize,
      usedBlocks,
      freeBlocks,
      utilization,
      externalFragmentation,
      internalFragmentation: 0, // Simplified
      numberOfFiles: files.length,
      largestFreeSpace,
      averageSeekTime,
    }
  }

  const handleMethodChange = (newMethod: AllocationMethod) => {
    if (files.length > 0) {
      if (!confirm('Changing allocation method will reset the disk. Continue?')) {
        return
      }
    }
    setMethod(newMethod)
    initializeDisk(diskSize)
  }

  const handleDiskSizeChange = (newSize: number) => {
    if (files.length > 0) {
      if (!confirm('Changing disk size will reset the disk. Continue?')) {
        return
      }
    }
    setDiskSize(newSize)
    initializeDisk(newSize)
  }

  // Initialize disk on mount
  if (disk.length === 0) {
    initializeDisk(diskSize)
  }

  const metrics = calculateMetrics()

  return (
    <>
      <ThemeToggle />
      <div className="fs-container">
        <div className="fs-header">
          <Link href="/" className="back-link">← Back</Link>
          <h1>File System Management</h1>
          <p>Visualize Contiguous, Linked, and Indexed file allocation methods</p>
        </div>

        {/* Control Panel */}
        <div className="control-panel">
          <div className="control-row">
            <div className="control-group">
              <label>Allocation Method:</label>
              <select
                value={method}
                onChange={(e) => handleMethodChange(e.target.value as AllocationMethod)}
                className="method-select"
              >
                <option value="contiguous">Contiguous Allocation</option>
                <option value="linked">Linked Allocation</option>
                <option value="indexed">Indexed Allocation</option>
              </select>
            </div>

            <div className="control-group">
              <label>Disk Size (blocks):</label>
              <input
                type="number"
                min="20"
                max="100"
                value={diskSize}
                onChange={(e) => handleDiskSizeChange(parseInt(e.target.value) || 50)}
                className="size-input"
              />
            </div>
          </div>

          <div className="method-description">
            {method === 'contiguous' && (
              <p><Icon name="box" size={18} /> <strong>Contiguous:</strong> Files stored in consecutive blocks. Fast access but causes external fragmentation.</p>
            )}
            {method === 'linked' && (
              <p><Icon name="link" size={18} /> <strong>Linked:</strong> Files stored as linked list of blocks. No fragmentation but slow random access.</p>
            )}
            {method === 'indexed' && (
              <p><Icon name="index" size={18} /> <strong>Indexed:</strong> Uses index block to point to data blocks. Fast random access with overhead.</p>
            )}
          </div>
        </div>

        {/* File Allocation Form */}
        <div className="allocation-form">
          <h3>Allocate New File</h3>
          <div className="form-row">
            <input
              type="text"
              placeholder="File name (e.g., document.pdf)"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              className="file-name-input"
            />
            <input
              type="number"
              min="1"
              max={diskSize}
              value={fileSize}
              onChange={(e) => setFileSize(parseInt(e.target.value) || 1)}
              className="file-size-input"
              placeholder="Size"
            />
            <span className="size-label">blocks</span>
            <button onClick={allocateFile} className="btn-allocate">
              Allocate File
            </button>
            <button onClick={loadExampleFiles} className="btn-example">
              Load Examples
            </button>
            <button onClick={() => initializeDisk(diskSize)} className="btn-reset">
              Reset Disk
            </button>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="content-grid">
          <div className="left-panel">
            <DiskVisualizer 
              disk={disk} 
              files={files} 
              highlightedBlocks={highlightedBlocks}
            />
            <ActivityLog log={log} />
          </div>

          <div className="right-panel">
            <FileList 
              files={files} 
              method={method}
              onDelete={deleteFile}
              onAccess={accessFile}
            />
            <MetricsDisplay metrics={metrics} method={method} />
          </div>
        </div>
      </div>
    </>
  )
}
