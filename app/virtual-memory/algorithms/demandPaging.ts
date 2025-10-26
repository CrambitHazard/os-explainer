import { Frame, SimulationStep, PageReplacementAlgorithm } from '../types'

export function simulateDemandPaging(
  referenceString: number[],
  numFrames: number,
  algorithm: PageReplacementAlgorithm,
  tlbSize: number = 4
): SimulationStep[] {
  const frames: Frame[] = Array(numFrames).fill(null).map((_, i) => ({
    frameNumber: i,
    pageNumber: null,
    locked: false,
  }))

  const steps: SimulationStep[] = []
  const tlb: Map<number, number> = new Map() // page -> frame
  const tlbQueue: number[] = [] // for FIFO replacement
  const pageLastUsed: Map<number, number> = new Map()
  let clockHand = 0
  const referenceBits: Map<number, boolean> = new Map()

  referenceString.forEach((page, index) => {
    const workingSet = calculateWorkingSet(referenceString, index, 5)
    
    // Check TLB
    const tlbHit = tlb.has(page)
    const frameNumber = tlb.get(page)

    if (tlbHit && frameNumber !== undefined) {
      // TLB Hit - page is in memory
      const frame = frames.find(f => f.frameNumber === frameNumber)
      const pageHit = frame !== undefined && frame.pageNumber === page

      pageLastUsed.set(page, index)
      referenceBits.set(page, true)

      steps.push({
        stepNumber: index + 1,
        pageReference: page,
        tlbHit: true,
        pageHit: true,
        pageFault: false,
        action: `TLB Hit: Page ${page} found in frame ${frameNumber}`,
        frames: frames.map(f => ({ ...f })),
        workingSet: new Set(workingSet),
      })
    } else {
      // TLB Miss - check page table (simulated by frames)
      const existingFrame = frames.find(f => f.pageNumber === page)

      if (existingFrame) {
        // Page is in memory but not in TLB
        updateTLB(tlb, tlbQueue, page, existingFrame.frameNumber, tlbSize)
        pageLastUsed.set(page, index)
        referenceBits.set(page, true)

        steps.push({
          stepNumber: index + 1,
          pageReference: page,
          tlbHit: false,
          pageHit: true,
          pageFault: false,
          action: `TLB Miss, Page Hit: Page ${page} in frame ${existingFrame.frameNumber}, updated TLB`,
          frames: frames.map(f => ({ ...f })),
          workingSet: new Set(workingSet),
        })
      } else {
        // Page Fault - need to load page
        const emptyFrame = frames.find(f => f.pageNumber === null)

        if (emptyFrame) {
          // Load into empty frame
          emptyFrame.pageNumber = page
          updateTLB(tlb, tlbQueue, page, emptyFrame.frameNumber, tlbSize)
          pageLastUsed.set(page, index)
          referenceBits.set(page, false)

          steps.push({
            stepNumber: index + 1,
            pageReference: page,
            tlbHit: false,
            pageHit: false,
            pageFault: true,
            action: `Page Fault: Loaded page ${page} into empty frame ${emptyFrame.frameNumber}`,
            frames: frames.map(f => ({ ...f })),
            workingSet: new Set(workingSet),
          })
        } else {
          // Need to replace a page
          let victimFrame: Frame
          let victimPage: number

          switch (algorithm) {
            case 'FIFO':
              victimFrame = findOldestFrame(frames, pageLastUsed)
              break
            case 'LRU':
              victimFrame = findLRUFrame(frames, pageLastUsed, index)
              break
            case 'Clock':
              victimFrame = clockReplacement(frames, referenceBits, clockHand)
              clockHand = (frames.indexOf(victimFrame) + 1) % frames.length
              break
            default:
              victimFrame = frames[0]
          }

          victimPage = victimFrame.pageNumber!
          victimFrame.pageNumber = page
          
          // Remove victim from TLB
          tlb.delete(victimPage)
          const tlbIndex = tlbQueue.indexOf(victimPage)
          if (tlbIndex !== -1) tlbQueue.splice(tlbIndex, 1)

          updateTLB(tlb, tlbQueue, page, victimFrame.frameNumber, tlbSize)
          pageLastUsed.set(page, index)
          referenceBits.set(page, false)

          steps.push({
            stepNumber: index + 1,
            pageReference: page,
            tlbHit: false,
            pageHit: false,
            pageFault: true,
            victim: victimPage,
            swapOut: true,
            action: `Page Fault: Replaced page ${victimPage} with page ${page} in frame ${victimFrame.frameNumber}`,
            frames: frames.map(f => ({ ...f })),
            workingSet: new Set(workingSet),
          })
        }
      }
    }
  })

  return steps
}

function updateTLB(
  tlb: Map<number, number>,
  queue: number[],
  page: number,
  frame: number,
  maxSize: number
) {
  if (tlb.size >= maxSize && !tlb.has(page)) {
    const victim = queue.shift()!
    tlb.delete(victim)
  }
  
  if (!tlb.has(page)) {
    queue.push(page)
  }
  
  tlb.set(page, frame)
}

function findOldestFrame(frames: Frame[], loadTimes: Map<number, number>): Frame {
  let oldest = frames[0]
  let oldestTime = loadTimes.get(frames[0].pageNumber!) ?? 0

  frames.forEach(frame => {
    const time = loadTimes.get(frame.pageNumber!) ?? 0
    if (time < oldestTime) {
      oldestTime = time
      oldest = frame
    }
  })

  return oldest
}

function findLRUFrame(
  frames: Frame[],
  lastUsed: Map<number, number>,
  currentTime: number
): Frame {
  let lru = frames[0]
  let lruTime = lastUsed.get(frames[0].pageNumber!) ?? 0

  frames.forEach(frame => {
    const time = lastUsed.get(frame.pageNumber!) ?? 0
    if (time < lruTime) {
      lruTime = time
      lru = frame
    }
  })

  return lru
}

function clockReplacement(
  frames: Frame[],
  referenceBits: Map<number, boolean>,
  startHand: number
): Frame {
  let hand = startHand

  while (true) {
    const frame = frames[hand]
    const referenced = referenceBits.get(frame.pageNumber!) ?? false

    if (!referenced) {
      return frame
    }

    referenceBits.set(frame.pageNumber!, false)
    hand = (hand + 1) % frames.length
  }
}

function calculateWorkingSet(
  references: number[],
  currentIndex: number,
  windowSize: number
): number[] {
  const start = Math.max(0, currentIndex - windowSize + 1)
  const window = references.slice(start, currentIndex + 1)
  return [...new Set(window)]
}

