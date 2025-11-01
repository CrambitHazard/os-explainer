'use client'

import { MemoryState } from '../types'

interface Props {
  memoryState: MemoryState
}

export default function MemoryVisualizer({ memoryState }: Props) {
  return (
    <div className="memory-visualizer">
      <h3>Memory Layout</h3>
      
      <div className="memory-container">
        <div className="memory-blocks">
          {memoryState.blocks.map((block, index) => {
            const heightPercent = (block.size / memoryState.totalMemory) * 100

            return (
              <div
                key={index}
                className={`memory-block ${block.isFree ? 'free' : 'allocated'}`}
                style={{
                  height: `${heightPercent}%`,
                  backgroundColor: block.segment?.color || '#6b7280',
                }}
              >
                <div className="block-info">
                  {block.isFree ? (
                    <>
                      <span className="block-label">FREE</span>
                      <span className="block-size">{block.size} KB</span>
                    </>
                  ) : (
                    <>
                      <span className="block-label">{block.segment?.name}</span>
                      <span className="block-size">{block.size} KB</span>
                    </>
                  )}
                </div>
                <div className="block-address">
                  {block.start} - {block.start + block.size - 1}
                </div>
              </div>
            )
          })}
        </div>

        <div className="memory-scale">
          <div className="scale-label">0 KB</div>
          <div className="scale-line"></div>
          <div className="scale-label">{memoryState.totalMemory} KB</div>
        </div>
      </div>

      <div className="memory-stats">
        <div className="stat-item used">
          <div className="stat-label">Used Memory</div>
          <div className="stat-value">{memoryState.usedSpace} KB</div>
          <div className="stat-bar">
            <div 
              className="stat-fill used"
              style={{ width: `${(memoryState.usedSpace / memoryState.totalMemory) * 100}%` }}
            />
          </div>
        </div>

        <div className="stat-item free">
          <div className="stat-label">Free Memory</div>
          <div className="stat-value">{memoryState.freeSpace} KB</div>
          <div className="stat-bar">
            <div 
              className="stat-fill free"
              style={{ width: `${(memoryState.freeSpace / memoryState.totalMemory) * 100}%` }}
            />
          </div>
        </div>

        <div className="stat-item fragmentation">
          <div className="stat-label">Fragmentation</div>
          <div className="stat-value">{memoryState.fragmentation.toFixed(2)}%</div>
          <div className="stat-bar">
            <div 
              className="stat-fill fragmentation"
              style={{ width: `${memoryState.fragmentation}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

