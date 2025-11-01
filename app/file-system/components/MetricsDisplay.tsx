'use client'

import { DiskMetrics, AllocationMethod } from '../types'

interface Props {
  metrics: DiskMetrics
  method: AllocationMethod
}

export default function MetricsDisplay({ metrics, method }: Props) {
  const getMethodAnalysis = (): string[] => {
    const analysis: string[] = []

    switch (method) {
      case 'contiguous':
        analysis.push('✓ Fast sequential access - excellent performance')
        analysis.push('✓ Simple to implement and manage')
        if (metrics.externalFragmentation > 20) {
          analysis.push('✗ High external fragmentation - compaction needed')
        }
        analysis.push('✗ Difficult to grow files dynamically')
        analysis.push('⚠ Best for files with known, fixed sizes')
        break

      case 'linked':
        analysis.push('✓ No external fragmentation')
        analysis.push('✓ Easy to grow files dynamically')
        analysis.push('✗ Slow random access - must traverse list')
        analysis.push('✗ Extra space for pointers')
        if (metrics.averageSeekTime > 50) {
          analysis.push('⚠ High seek time due to scattered blocks')
        }
        analysis.push('⚠ Best for sequential access patterns')
        break

      case 'indexed':
        analysis.push('✓ Fast random access via index block')
        analysis.push('✓ No external fragmentation')
        analysis.push('✓ Easy to grow files (update index)')
        analysis.push('✗ Overhead of index block for each file')
        if (metrics.numberOfFiles > 0) {
          const indexOverhead = (metrics.numberOfFiles / metrics.totalBlocks) * 100
          analysis.push(`⚠ Index overhead: ${indexOverhead.toFixed(1)}% of disk`)
        }
        analysis.push('⚠ Best for large files with random access')
        break
    }

    return analysis
  }

  return (
    <div className="metrics-display">
      <h3>File System Metrics</h3>

      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-value">{metrics.utilization.toFixed(1)}%</div>
          <div className="metric-label">Disk Utilization</div>
        </div>

        <div className="metric-card">
          <div className="metric-value">{metrics.usedBlocks}/{metrics.totalBlocks}</div>
          <div className="metric-label">Blocks Used</div>
        </div>

        <div className="metric-card">
          <div className="metric-value">{metrics.freeBlocks}</div>
          <div className="metric-label">Free Blocks</div>
        </div>

        <div className="metric-card">
          <div className="metric-value">{metrics.numberOfFiles}</div>
          <div className="metric-label">Total Files</div>
        </div>

        <div className="metric-card fragmentation">
          <div className="metric-value">{metrics.externalFragmentation.toFixed(1)}%</div>
          <div className="metric-label">External Fragmentation</div>
        </div>

        <div className="metric-card">
          <div className="metric-value">{metrics.largestFreeSpace}</div>
          <div className="metric-label">Largest Free Space</div>
        </div>

        <div className="metric-card">
          <div className="metric-value">{metrics.averageSeekTime.toFixed(1)}</div>
          <div className="metric-label">Avg Seek Distance</div>
        </div>

        <div className="metric-card">
          <div className="metric-value">{metrics.internalFragmentation.toFixed(1)}%</div>
          <div className="metric-label">Internal Fragmentation</div>
        </div>
      </div>

      {metrics.externalFragmentation > 30 && method === 'contiguous' && (
        <div className="fragmentation-warning">
          <strong>⚠ HIGH FRAGMENTATION DETECTED!</strong>
          <p>External fragmentation is at {metrics.externalFragmentation.toFixed(1)}%. Large files may not be allocatable even with sufficient total free space.</p>
          <p><strong>Solution:</strong> Run disk compaction or consider using linked/indexed allocation.</p>
        </div>
      )}

      <div className="method-analysis">
        <h4>{method.charAt(0).toUpperCase() + method.slice(1)} Allocation Analysis</h4>
        <ul>
          {getMethodAnalysis().map((point, index) => (
            <li 
              key={index}
              className={
                point.startsWith('✓') ? 'good' : 
                point.startsWith('✗') ? 'bad' : 
                'neutral'
              }
            >
              {point}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

