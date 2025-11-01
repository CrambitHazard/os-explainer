import { PageFrame, SimulationStep, SimulationResult } from '../types'

export function optimal(referenceString: number[], numFrames: number): SimulationResult {
  const frames: PageFrame[] = Array(numFrames).fill(null).map(() => ({ pageNumber: null }))
  const steps: SimulationStep[] = []
  let pageFaults = 0

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
        // Replace page that won't be used for longest time
        let replaceIndex = -1
        let farthestUse = -1
        
        frames.forEach((frame, frameIdx) => {
          // Find next use of this page
          let nextUse = referenceString.length // Default to end if not found
          
          for (let i = index + 1; i < referenceString.length; i++) {
            if (referenceString[i] === frame.pageNumber) {
              nextUse = i
              break
            }
          }
          
          if (nextUse > farthestUse) {
            farthestUse = nextUse
            replaceIndex = frameIdx
          }
        })
        
        const replacedPage = frames[replaceIndex].pageNumber
        frames[replaceIndex].pageNumber = page
        
        const nextUseInfo = farthestUse === referenceString.length 
          ? 'not used again' 
          : `next used at position ${farthestUse + 1}`
        
        steps.push({
          referenceNumber: index + 1,
          reference: page,
          frames: frames.map(f => ({ ...f })),
          isPageFault: true,
          action: `Page fault! Replaced page ${replacedPage} (${nextUseInfo}) with ${page}`,
          replacedPage: replacedPage!,
        })
      }
    }
  })

  const pageHits = referenceString.length - pageFaults

  return {
    algorithm: 'Optimal',
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

