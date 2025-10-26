import { Segment } from './types'

const COLORS = ['#00ff41', '#2563eb', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6']

export const segmentExamples = {
  basic: {
    name: 'Basic Allocation',
    description: 'Simple segments with various sizes',
    memorySize: 1000,
    segments: [
      { id: '1', name: 'Segment A', size: 200, color: COLORS[0] },
      { id: '2', name: 'Segment B', size: 150, color: COLORS[1] },
      { id: '3', name: 'Segment C', size: 300, color: COLORS[2] },
      { id: '4', name: 'Segment D', size: 100, color: COLORS[3] },
    ] as Segment[],
  },

  fragmentation: {
    name: 'Fragmentation Demo',
    description: 'Demonstrates external fragmentation',
    memorySize: 1000,
    segments: [
      { id: '1', name: 'Segment A', size: 100, color: COLORS[0] },
      { id: '2', name: 'Segment B', size: 400, color: COLORS[1] },
      { id: '3', name: 'Segment C', size: 150, color: COLORS[2] },
      { id: '4', name: 'Segment D', size: 200, color: COLORS[3] },
      { id: '5', name: 'Segment E', size: 50, color: COLORS[4] },
    ] as Segment[],
  },

  largeSegments: {
    name: 'Large Segments',
    description: 'Tests allocation with large segments',
    memorySize: 2000,
    segments: [
      { id: '1', name: 'Segment A', size: 500, color: COLORS[0] },
      { id: '2', name: 'Segment B', size: 600, color: COLORS[1] },
      { id: '3', name: 'Segment C', size: 450, color: COLORS[2] },
      { id: '4', name: 'Segment D', size: 300, color: COLORS[3] },
    ] as Segment[],
  },

  manySmall: {
    name: 'Many Small Segments',
    description: 'Multiple small segments',
    memorySize: 1000,
    segments: [
      { id: '1', name: 'Seg A', size: 50, color: COLORS[0] },
      { id: '2', name: 'Seg B', size: 75, color: COLORS[1] },
      { id: '3', name: 'Seg C', size: 60, color: COLORS[2] },
      { id: '4', name: 'Seg D', size: 80, color: COLORS[3] },
      { id: '5', name: 'Seg E', size: 90, color: COLORS[4] },
      { id: '6', name: 'Seg F', size: 70, color: COLORS[5] },
      { id: '7', name: 'Seg G', size: 100, color: COLORS[6] },
    ] as Segment[],
  },

  worstCase: {
    name: 'Worst Case Scenario',
    description: 'Allocation that causes maximum fragmentation',
    memorySize: 1000,
    segments: [
      { id: '1', name: 'Segment A', size: 300, color: COLORS[0] },
      { id: '2', name: 'Segment B', size: 50, color: COLORS[1] },
      { id: '3', name: 'Segment C', size: 250, color: COLORS[2] },
      { id: '4', name: 'Segment D', size: 50, color: COLORS[3] },
      { id: '5', name: 'Segment E', size: 200, color: COLORS[4] },
    ] as Segment[],
  },
}

export const deallocationPatterns = {
  alternate: {
    name: 'Alternate Deallocation',
    description: 'Deallocate every other segment',
    pattern: 'alternate',
  },
  random: {
    name: 'Random Deallocation',
    description: 'Deallocate segments randomly',
    pattern: 'random',
  },
  sequential: {
    name: 'Sequential Deallocation',
    description: 'Deallocate segments in order',
    pattern: 'sequential',
  },
}

