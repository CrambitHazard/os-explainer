'use client'

import { Segment } from '../types'

interface Props {
  segments: Segment[]
  allocatedSegments: Segment[]
  onAllocate: (segment: Segment) => void
  onDeallocate: (segmentId: string) => void
}

export default function SegmentQueue({ segments, allocatedSegments, onAllocate, onDeallocate }: Props) {
  const pendingSegments = segments.filter(
    s => !allocatedSegments.find(a => a.id === s.id)
  )

  return (
    <div className="segment-queue">
      <div className="queue-section">
        <h4>Pending Segments</h4>
        {pendingSegments.length === 0 ? (
          <div className="empty-message">All segments allocated</div>
        ) : (
          <div className="segment-list">
            {pendingSegments.map(segment => (
              <div key={segment.id} className="segment-card pending">
                <div 
                  className="segment-indicator"
                  style={{ backgroundColor: segment.color }}
                />
                <div className="segment-info">
                  <div className="segment-name">{segment.name}</div>
                  <div className="segment-size">{segment.size} KB</div>
                </div>
                <button 
                  onClick={() => onAllocate(segment)}
                  className="btn-allocate"
                >
                  Allocate
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="queue-section">
        <h4>Allocated Segments</h4>
        {allocatedSegments.length === 0 ? (
          <div className="empty-message">No segments allocated</div>
        ) : (
          <div className="segment-list">
            {allocatedSegments.map(segment => (
              <div key={segment.id} className="segment-card allocated">
                <div 
                  className="segment-indicator"
                  style={{ backgroundColor: segment.color }}
                />
                <div className="segment-info">
                  <div className="segment-name">{segment.name}</div>
                  <div className="segment-size">{segment.size} KB</div>
                  {segment.allocatedAt !== undefined && (
                    <div className="segment-address">@ {segment.allocatedAt} KB</div>
                  )}
                </div>
                <button 
                  onClick={() => onDeallocate(segment.id)}
                  className="btn-deallocate"
                >
                  Free
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

