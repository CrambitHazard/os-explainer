import { DiskBlock, FileEntry, AllocationResult } from '../types'

export function allocateContiguous(
  fileName: string,
  size: number,
  disk: DiskBlock[],
  color: string
): AllocationResult {
  // Find contiguous free space
  let startBlock = -1
  let currentSequence = 0

  for (let i = 0; i < disk.length; i++) {
    if (!disk[i].allocated) {
      if (currentSequence === 0) {
        startBlock = i
      }
      currentSequence++
      
      if (currentSequence === size) {
        // Found enough space
        const blocksAllocated: number[] = []
        const fileId = `file-${Date.now()}-${Math.random()}`
        
        for (let j = startBlock; j < startBlock + size; j++) {
          disk[j].allocated = true
          disk[j].fileId = fileId
          disk[j].fileName = fileName
          blocksAllocated.push(j)
        }

        const file: FileEntry = {
          id: fileId,
          name: fileName,
          size,
          color,
          startBlock,
          blocks: blocksAllocated,
        }

        return {
          success: true,
          file,
          message: `Allocated ${size} contiguous blocks starting at block ${startBlock}`,
          blocksAllocated,
        }
      }
    } else {
      currentSequence = 0
      startBlock = -1
    }
  }

  return {
    success: false,
    message: `No contiguous space of ${size} blocks available. External fragmentation detected.`,
  }
}

export function deleteContiguous(fileId: string, disk: DiskBlock[]): number[] {
  const blocksFreed: number[] = []
  
  disk.forEach(block => {
    if (block.fileId === fileId) {
      block.allocated = false
      block.fileId = null
      block.fileName = null
      blocksFreed.push(block.blockNumber)
    }
  })

  return blocksFreed
}

export function accessContiguous(file: FileEntry, blockOffset: number): number[] {
  // Sequential access - read from start to offset
  if (!file.startBlock) return []
  
  const blocksAccessed: number[] = []
  for (let i = file.startBlock; i <= file.startBlock + blockOffset && i < file.startBlock + file.size; i++) {
    blocksAccessed.push(i)
  }
  
  return blocksAccessed
}

export function calculateSeekTime(currentBlock: number, targetBlock: number): number {
  // Simplified seek time calculation (proportional to distance)
  return Math.abs(targetBlock - currentBlock)
}

