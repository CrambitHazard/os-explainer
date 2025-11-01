import { PageFrame, SimulationStep, SimulationResult } from '../types'

export function fifo(referenceString: number[], numFrames: number): SimulationResult {
  const frames: PageFrame[] = Array(numFrames).fill(null).map(() => ({ pageNumber: null }))
  const steps: SimulationStep[] = []
  let pageFaults = 0
  let queueIndex = 0

  referenceString.forEach((page, index) => {
    const framesCopy = frames.map(f => ({ ...f }))
    const existingFrame = frames.findIndex(f => f.pageNumber === page)

    if (existingFrame !== -1) {
      // Page hit
      steps.push({
        referenceNumber: index + 1,
        reference: page,
        frames: framesCopy,
        isPageFault: false,
        action: `Page ${page} found in frame ${existingFrame}`,
      })
    } else {
      // Page fault
      pageFaults++
      
      const emptyFrame = frames.findIndex(f => f.pageNumber === null)
      
      if (emptyFrame !== -1) {
        // Place in empty frame
        frames[emptyFrame].pageNumber = page
        steps.push({
          referenceNumber: index + 1,
          reference: page,
          frames: frames.map(f => ({ ...f })),
          isPageFault: true,
          action: `Page fault! Placed page ${page} in empty frame ${emptyFrame}`,
        })
      } else {
        // Replace using FIFO
        const replacedPage = frames[queueIndex].pageNumber
        frames[queueIndex].pageNumber = page
        
        steps.push({
          referenceNumber: index + 1,
          reference: page,
          frames: frames.map(f => ({ ...f })),
          isPageFault: true,
          action: `Page fault! Replaced page ${replacedPage} with ${page} in frame ${queueIndex}`,
          replacedPage: replacedPage!,
        })
        
        queueIndex = (queueIndex + 1) % numFrames
      }
    }
  })

  const pageHits = referenceString.length - pageFaults

  return {
    algorithm: 'FIFO',
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

