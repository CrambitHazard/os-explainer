import { DiskBlock, FileEntry, AllocationResult } from '../types'

export function allocateLinked(
  fileName: string,
  size: number,
  disk: DiskBlock[],
  color: string
): AllocationResult {
  // Find any free blocks
  const freeBlocks: number[] = []
  
  for (let i = 0; i < disk.length; i++) {
    if (!disk[i].allocated) {
      freeBlocks.push(i)
      if (freeBlocks.length === size) break
    }
  }

  if (freeBlocks.length < size) {
    return {
      success: false,
      message: `Not enough free blocks. Need ${size}, found ${freeBlocks.length}.`,
    }
  }

  // Allocate blocks and create links
  const fileId = `file-${Date.now()}-${Math.random()}`
  const nextPointers = new Map<number, number>()
  
  freeBlocks.forEach((blockNum, index) => {
    disk[blockNum].allocated = true
    disk[blockNum].fileId = fileId
    disk[blockNum].fileName = fileName
    
    if (index < freeBlocks.length - 1) {
      disk[blockNum].nextBlock = freeBlocks[index + 1]
      nextPointers.set(blockNum, freeBlocks[index + 1])
    } else {
      disk[blockNum].nextBlock = null // End of file
    }
  })

  const file: FileEntry = {
    id: fileId,
    name: fileName,
    size,
    color,
    startBlock: freeBlocks[0],
    blocks: freeBlocks,
    nextPointers,
  }

  return {
    success: true,
    file,
    message: `Allocated ${size} linked blocks starting at block ${freeBlocks[0]}`,
    blocksAllocated: freeBlocks,
  }
}

export function deleteLinked(fileId: string, disk: DiskBlock[]): number[] {
  const blocksFreed: number[] = []
  
  disk.forEach(block => {
    if (block.fileId === fileId) {
      block.allocated = false
      block.fileId = null
      block.fileName = null
      block.nextBlock = undefined
      blocksFreed.push(block.blockNumber)
    }
  })

  return blocksFreed
}

export function accessLinked(file: FileEntry, blockOffset: number): number[] {
  // Must traverse the linked list
  if (!file.blocks || !file.nextPointers) return []
  
  const blocksAccessed: number[] = []
  let currentBlock = file.startBlock!
  let count = 0

  while (count <= blockOffset && currentBlock !== null && currentBlock !== undefined) {
    blocksAccessed.push(currentBlock)
    const next = file.nextPointers.get(currentBlock)
    currentBlock = next !== undefined ? next : -1
    count++
  }

  return blocksAccessed
}

export function calculateSeekTimeLinked(blocks: number[]): number {
  // Sum of distances between consecutive blocks
  let totalSeek = 0
  for (let i = 0; i < blocks.length - 1; i++) {
    totalSeek += Math.abs(blocks[i + 1] - blocks[i])
  }
  return totalSeek
}

