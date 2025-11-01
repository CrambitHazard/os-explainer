import { DiskBlock, FileEntry, AllocationResult } from '../types'

export function allocateIndexed(
  fileName: string,
  size: number,
  disk: DiskBlock[],
  color: string
): AllocationResult {
  // Need size + 1 blocks (1 for index block)
  const totalNeeded = size + 1
  const freeBlocks: number[] = []
  
  for (let i = 0; i < disk.length; i++) {
    if (!disk[i].allocated) {
      freeBlocks.push(i)
      if (freeBlocks.length === totalNeeded) break
    }
  }

  if (freeBlocks.length < totalNeeded) {
    return {
      success: false,
      message: `Not enough free blocks. Need ${totalNeeded} (${size} data + 1 index), found ${freeBlocks.length}.`,
    }
  }

  // First block is the index block
  const indexBlock = freeBlocks[0]
  const dataBlocks = freeBlocks.slice(1)
  const fileId = `file-${Date.now()}-${Math.random()}`

  // Allocate index block
  disk[indexBlock].allocated = true
  disk[indexBlock].fileId = fileId
  disk[indexBlock].fileName = `${fileName} [INDEX]`
  disk[indexBlock].isIndexBlock = true
  disk[indexBlock].pointsTo = dataBlocks

  // Allocate data blocks
  dataBlocks.forEach(blockNum => {
    disk[blockNum].allocated = true
    disk[blockNum].fileId = fileId
    disk[blockNum].fileName = fileName
  })

  const file: FileEntry = {
    id: fileId,
    name: fileName,
    size,
    color,
    indexBlock,
    blocks: dataBlocks,
  }

  return {
    success: true,
    file,
    message: `Allocated index block ${indexBlock} pointing to ${size} data blocks`,
    blocksAllocated: freeBlocks,
  }
}

export function deleteIndexed(fileId: string, disk: DiskBlock[]): number[] {
  const blocksFreed: number[] = []
  
  disk.forEach(block => {
    if (block.fileId === fileId) {
      block.allocated = false
      block.fileId = null
      block.fileName = null
      block.isIndexBlock = false
      block.pointsTo = undefined
      blocksFreed.push(block.blockNumber)
    }
  })

  return blocksFreed
}

export function accessIndexed(file: FileEntry, blockOffset: number): number[] {
  // Direct access via index block
  if (!file.indexBlock || !file.blocks) return []
  
  const blocksAccessed: number[] = [file.indexBlock] // Always access index first
  
  if (blockOffset < file.blocks.length) {
    blocksAccessed.push(file.blocks[blockOffset])
  }

  return blocksAccessed
}

export function calculateSeekTimeIndexed(indexBlock: number, targetBlock: number): number {
  // Two seeks: to index block, then to data block
  // Assume we're at block 0 initially
  return Math.abs(indexBlock) + Math.abs(targetBlock - indexBlock)
}

