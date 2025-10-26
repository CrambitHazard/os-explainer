import { MemoryBlock, Segment, AllocationResult, AllocationStrategy } from '../types'

export function firstFit(
  blocks: MemoryBlock[],
  segment: Segment
): AllocationResult {
  // Find first block that is free and large enough
  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i]
    if (block.isFree && block.size >= segment.size) {
      return {
        success: true,
        segment,
        allocatedBlock: {
          start: block.start,
          size: segment.size,
          segment,
          isFree: false,
        },
        message: `Allocated ${segment.name} (${segment.size} KB) at position ${block.start} using First-Fit`,
      }
    }
  }

  return {
    success: false,
    segment,
    message: `Failed to allocate ${segment.name} (${segment.size} KB) - No suitable block found`,
  }
}

export function bestFit(
  blocks: MemoryBlock[],
  segment: Segment
): AllocationResult {
  // Find smallest free block that is large enough
  let bestBlock: MemoryBlock | null = null
  let bestBlockIndex = -1
  let minWaste = Infinity

  blocks.forEach((block, index) => {
    if (block.isFree && block.size >= segment.size) {
      const waste = block.size - segment.size
      if (waste < minWaste) {
        minWaste = waste
        bestBlock = block
        bestBlockIndex = index
      }
    }
  })

  if (bestBlock) {
    return {
      success: true,
      segment,
      allocatedBlock: {
        start: bestBlock.start,
        size: segment.size,
        segment,
        isFree: false,
      },
      message: `Allocated ${segment.name} (${segment.size} KB) at position ${bestBlock.start} using Best-Fit (waste: ${minWaste} KB)`,
    }
  }

  return {
    success: false,
    segment,
    message: `Failed to allocate ${segment.name} (${segment.size} KB) - No suitable block found`,
  }
}

export function worstFit(
  blocks: MemoryBlock[],
  segment: Segment
): AllocationResult {
  // Find largest free block
  let worstBlock: MemoryBlock | null = null
  let worstBlockIndex = -1
  let maxSize = -1

  blocks.forEach((block, index) => {
    if (block.isFree && block.size >= segment.size && block.size > maxSize) {
      maxSize = block.size
      worstBlock = block
      worstBlockIndex = index
    }
  })

  if (worstBlock) {
    const remaining = worstBlock.size - segment.size
    return {
      success: true,
      segment,
      allocatedBlock: {
        start: worstBlock.start,
        size: segment.size,
        segment,
        isFree: false,
      },
      message: `Allocated ${segment.name} (${segment.size} KB) at position ${worstBlock.start} using Worst-Fit (remaining: ${remaining} KB)`,
    }
  }

  return {
    success: false,
    segment,
    message: `Failed to allocate ${segment.name} (${segment.size} KB) - No suitable block found`,
  }
}

export function allocateSegment(
  blocks: MemoryBlock[],
  segment: Segment,
  strategy: AllocationStrategy
): { newBlocks: MemoryBlock[], result: AllocationResult } {
  let result: AllocationResult

  switch (strategy) {
    case 'FirstFit':
      result = firstFit(blocks, segment)
      break
    case 'BestFit':
      result = bestFit(blocks, segment)
      break
    case 'WorstFit':
      result = worstFit(blocks, segment)
      break
  }

  if (!result.success || !result.allocatedBlock) {
    return { newBlocks: blocks, result }
  }

  // Split the block
  const newBlocks: MemoryBlock[] = []
  
  blocks.forEach(block => {
    if (block.isFree && block.start === result.allocatedBlock!.start) {
      // Add allocated block
      newBlocks.push({
        ...result.allocatedBlock!,
      })

      // Add remaining free space if any
      const remaining = block.size - segment.size
      if (remaining > 0) {
        newBlocks.push({
          start: block.start + segment.size,
          size: remaining,
          segment: null,
          isFree: true,
        })
      }
    } else {
      newBlocks.push({ ...block })
    }
  })

  return { newBlocks, result }
}

export function deallocateSegment(
  blocks: MemoryBlock[],
  segmentId: string
): MemoryBlock[] {
  const newBlocks = blocks.map(block => {
    if (block.segment?.id === segmentId) {
      return {
        ...block,
        segment: null,
        isFree: true,
      }
    }
    return { ...block }
  })

  // Merge adjacent free blocks
  return mergeAdjacentFreeBlocks(newBlocks)
}

function mergeAdjacentFreeBlocks(blocks: MemoryBlock[]): MemoryBlock[] {
  if (blocks.length === 0) return blocks

  const merged: MemoryBlock[] = []
  let current = { ...blocks[0] }

  for (let i = 1; i < blocks.length; i++) {
    const next = blocks[i]

    if (current.isFree && next.isFree) {
      // Merge adjacent free blocks
      current.size += next.size
    } else {
      merged.push(current)
      current = { ...next }
    }
  }

  merged.push(current)
  return merged
}

export function compactMemory(blocks: MemoryBlock[], totalMemory: number): MemoryBlock[] {
  // Move all allocated blocks to the beginning
  const allocatedBlocks = blocks.filter(b => !b.isFree)
  const newBlocks: MemoryBlock[] = []

  let currentStart = 0
  allocatedBlocks.forEach(block => {
    newBlocks.push({
      start: currentStart,
      size: block.size,
      segment: block.segment,
      isFree: false,
    })
    currentStart += block.size
  })

  // Add remaining free space as one block
  const usedSpace = allocatedBlocks.reduce((sum, b) => sum + b.size, 0)
  if (usedSpace < totalMemory) {
    newBlocks.push({
      start: currentStart,
      size: totalMemory - usedSpace,
      segment: null,
      isFree: true,
    })
  }

  return newBlocks
}

