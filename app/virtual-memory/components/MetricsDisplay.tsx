'use client'

import { VirtualMemoryMetrics } from '../types'
import { memoryConfig } from '../examples'

interface Props {
  metrics: VirtualMemoryMetrics
}

export default function MetricsDisplay({ metrics }: Props) {
  return (
    <div className="vm-metrics">
      <h3>Performance Metrics</h3>

      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-value">{metrics.totalReferences}</div>
          <div className="metric-label">Total References</div>
        </div>

        <div className="metric-card fault">
          <div className="metric-value">{metrics.pageFaults}</div>
          <div className="metric-label">Page Faults</div>
        </div>

        <div className="metric-card hit">
          <div className="metric-value">{metrics.pageHits}</div>
          <div className="metric-label">Page Hits</div>
        </div>

        <div className="metric-card">
          <div className="metric-value">{metrics.pageFaultRate.toFixed(1)}%</div>
          <div className="metric-label">Page Fault Rate</div>
        </div>

        <div className="metric-card tlb">
          <div className="metric-value">{metrics.tlbHits}</div>
          <div className="metric-label">TLB Hits</div>
        </div>

        <div className="metric-card">
          <div className="metric-value">{metrics.tlbHitRate.toFixed(1)}%</div>
          <div className="metric-label">TLB Hit Rate</div>
        </div>

        <div className="metric-card">
          <div className="metric-value">{metrics.effectiveAccessTime.toFixed(0)} ns</div>
          <div className="metric-label">Effective Access Time</div>
        </div>

        <div className="metric-card">
          <div className="metric-value">{metrics.averageWorkingSetSize.toFixed(1)}</div>
          <div className="metric-label">Avg Working Set</div>
        </div>

        <div className="metric-card">
          <div className="metric-value">{metrics.swapCount}</div>
          <div className="metric-label">Swap Operations</div>
        </div>
      </div>

      {metrics.thrashing && (
        <div className="thrashing-warning">
          <strong>⚠ THRASHING DETECTED!</strong>
          <p>Page fault rate is very high ({metrics.pageFaultRate.toFixed(1)}%). The system is spending more time swapping pages than executing instructions.</p>
          <p><strong>Solution:</strong> Increase the number of frames or reduce the working set size.</p>
        </div>
      )}

      <div className="timing-breakdown">
        <h4>Memory Access Time Breakdown</h4>
        <div className="timing-items">
          <div className="timing-item">
            <span>TLB Access:</span>
            <span>{memoryConfig.tlbAccessTime} ns</span>
          </div>
          <div className="timing-item">
            <span>Memory Access:</span>
            <span>{memoryConfig.memoryAccessTime} ns</span>
          </div>
          <div className="timing-item">
            <span>Page Fault Service:</span>
            <span>{memoryConfig.pageFaultTime} ns</span>
          </div>
          <div className="timing-item highlight">
            <span>Effective Access Time:</span>
            <span>{metrics.effectiveAccessTime.toFixed(0)} ns</span>
          </div>
        </div>
      </div>

      <div className="performance-analysis">
        <h4>Performance Analysis</h4>
        <ul>
          {metrics.tlbHitRate > 90 && (
            <li className="good">✓ Excellent TLB performance - good locality of reference</li>
          )}
          {metrics.tlbHitRate < 70 && (
            <li className="bad">✗ Poor TLB performance - consider increasing TLB size</li>
          )}
          {metrics.pageFaultRate < 5 && (
            <li className="good">✓ Low page fault rate - sufficient physical memory</li>
          )}
          {metrics.pageFaultRate > 20 && (
            <li className="bad">✗ High page fault rate - insufficient frames or poor algorithm</li>
          )}
          {metrics.averageWorkingSetSize <= 0 && (
            <li className="good">✓ Working set fits in available frames</li>
          )}
          {metrics.effectiveAccessTime < 200 && (
            <li className="good">✓ Fast effective access time</li>
          )}
          {metrics.effectiveAccessTime > 500 && (
            <li className="bad">✗ Slow effective access time due to frequent page faults</li>
          )}
        </ul>
      </div>
    </div>
  )
}

