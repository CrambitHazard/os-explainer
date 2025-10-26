'use client'

import { DiskBlock, FileEntry } from '../types'

interface Props {
  disk: DiskBlock[]
  files: FileEntry[]
  highlightedBlocks?: number[]
}

export default function DiskVisualizer({ disk, files, highlightedBlocks = [] }: Props) {
  const getBlockColor = (block: DiskBlock): string => {
    if (!block.allocated) return 'transparent'
    
    const file = files.find(f => f.id === block.fileId)
    return file?.color || '#666'
  }

  const getBlockLabel = (block: DiskBlock): string => {
    if (!block.allocated) return ''
    if (block.isIndexBlock) return 'IDX'
    return block.blockNumber.toString()
  }

  return (
    <div className="disk-visualizer">
      <h3>Disk Blocks</h3>
      <div className="disk-grid">
        {disk.map(block => (
          <div
            key={block.blockNumber}
            className={`disk-block ${!block.allocated ? 'free' : 'allocated'} ${highlightedBlocks.includes(block.blockNumber) ? 'highlighted' : ''}`}
            style={{
              backgroundColor: block.allocated ? getBlockColor(block) : undefined,
              borderColor: block.allocated ? getBlockColor(block) : undefined,
            }}
            title={
              block.allocated
                ? `Block ${block.blockNumber}\nFile: ${block.fileName}${block.nextBlock !== undefined && block.nextBlock !== null ? `\n→ Next: ${block.nextBlock}` : ''}${block.pointsTo ? `\n→ Points to: ${block.pointsTo.join(', ')}` : ''}`
                : `Block ${block.blockNumber}\nFree`
            }
          >
            <div className="block-number">{block.blockNumber}</div>
            {block.allocated && (
              <div className="block-label">{getBlockLabel(block)}</div>
            )}
            {block.nextBlock !== undefined && block.nextBlock !== null && (
              <div className="next-arrow">→</div>
            )}
            {block.isIndexBlock && block.pointsTo && (
              <div className="index-indicator">
                <span className="index-count">{block.pointsTo.length}</span>
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="disk-legend">
        <div className="legend-item">
          <div className="legend-box free"></div>
          <span>Free Block</span>
        </div>
        <div className="legend-item">
          <div className="legend-box allocated"></div>
          <span>Allocated Block</span>
        </div>
        <div className="legend-item">
          <div className="legend-box index"></div>
          <span>Index Block</span>
        </div>
      </div>
    </div>
  )
}

