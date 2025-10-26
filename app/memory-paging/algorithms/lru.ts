import { PageFrame, SimulationStep, SimulationResult } from '../types'

export function lru(referenceString: number[], numFrames: number): SimulationResult {
  const frames: PageFrame[] = Array(numFrames).fill(null).map(() => ({ 
    pageNumber: null, 
    lastUsed: 0 
  }))
  const steps: SimulationStep[] = []
  let pageFaults = 0

  referenceString.forEach((page, index) => {
    const framesCopy = frames.map(f => ({ ...f }))
    const existingFrameIndex = frames.findIndex(f => f.pageNumber === page)

    if (existingFrameIndex !== -1) {
      // Page hit - update last used time
      frames[existingFrameIndex].lastUsed = index
      
      steps.push({
        referenceNumber: index + 1,
        reference: page,
        frames: framesCopy,
        isPageFault: false,
        action: `Page ${page} found in frame ${existingFrameIndex}, updated access time`,
      })
    } else {
      // Page fault
      pageFaults++
      
      const emptyFrame = frames.findIndex(f => f.pageNumber === null)
      
      if (emptyFrame !== -1) {
        // Place in empty frame
        frames[emptyFrame].pageNumber = page
        frames[emptyFrame].lastUsed = index
        
        steps.push({
          referenceNumber: index + 1,
          reference: page,
          frames: frames.map(f => ({ ...f })),
          isPageFault: true,
          action: `Page fault! Placed page ${page} in empty frame ${emptyFrame}`,
        })
      } else {
        // Replace least recently used page
        let lruIndex = 0
        let lruTime = frames[0].lastUsed!
        
        frames.forEach((frame, idx) => {
          if (frame.lastUsed! < lruTime) {
            lruTime = frame.lastUsed!
            lruIndex = idx
          }
        })
        
        const replacedPage = frames[lruIndex].pageNumber
        frames[lruIndex].pageNumber = page
        frames[lruIndex].lastUsed = index
        
        steps.push({
          referenceNumber: index + 1,
          reference: page,
          frames: frames.map(f => ({ ...f })),
          isPageFault: true,
          action: `Page fault! Replaced LRU page ${replacedPage} (last used at ${lruTime}) with ${page}`,
          replacedPage: replacedPage!,
        })
      }
    }
  })

  const pageHits = referenceString.length - pageFaults

  return {
    algorithm: 'LRU',
    steps,
    metrics: {
      totalReferences: referenceString.length,
      pageFaults,
      pageHits,
      pageFaultRate: (pageFaults / referenceString.length) * 100,
      pageHitRate: (pageHits / referenceString.length) * 100,
    },
  }
}

