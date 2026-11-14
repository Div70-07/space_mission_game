// src/scene/__tests__/scene.test.ts
// Unit tests for Part D: Scene visualization canvas functions and MissionScene exports.

import { describe, it, expect } from 'vitest'
import { drawLaunch, drawOrbit, MissionScene } from '../index'

// Helper mock 2D context for headless canvas testing
function createMockCanvas(): HTMLCanvasElement {
  const canvas = {
    width: 800,
    height: 450,
    getContext: (_type: string) => ({
      fillStyle: '',
      strokeStyle: '',
      lineWidth: 1,
      font: '',
      globalAlpha: 1,
      fillRect: () => {},
      strokeRect: () => {},
      rect: () => {},
      clearRect: () => {},
      beginPath: () => {},
      closePath: () => {},
      moveTo: () => {},
      lineTo: () => {},
      arc: () => {},
      ellipse: () => {},
      fill: () => {},
      stroke: () => {},
      save: () => {},
      restore: () => {},
      translate: () => {},
      rotate: () => {},
      scale: () => {},
      clip: () => {},
      quadraticCurveTo: () => {},
      setLineDash: () => {},
      fillText: () => {},
      createLinearGradient: () => ({
        addColorStop: () => {},
      }),
      createRadialGradient: () => ({
        addColorStop: () => {},
      }),
    }),
  } as unknown as HTMLCanvasElement

  return canvas
}

describe('Part D: Scene Visualization Tests', () => {
  it('exports MissionScene component', () => {
    expect(MissionScene).toBeDefined()
    expect(typeof MissionScene).toBe('function')
  })

  it('drawLaunch renders without throwing on canvas target', () => {
    const canvas = createMockCanvas()
    expect(() => drawLaunch(canvas)).not.toThrow()
    expect(() => drawLaunch(canvas, 800, 450, 0, { rocketName: 'Falcon 9' })).not.toThrow()
    expect(() => drawLaunch(canvas, 800, 450, 0.4, { rocketName: 'Falcon 9' })).not.toThrow()
    expect(() => drawLaunch(canvas, 800, 450, 0.75, { rocketName: 'Falcon 9' })).not.toThrow()
    expect(() => drawLaunch(canvas, 800, 450, 1.0, { rocketName: 'Falcon 9', isSuccess: true })).not.toThrow()
    expect(() => drawLaunch(canvas, 800, 450, 1.0, { rocketName: 'Falcon 9', isSuccess: false })).not.toThrow()
  })

  it('drawOrbit renders Earth, Moon, and Mars targets without throwing', () => {
    const canvas = createMockCanvas()
    expect(() => drawOrbit(canvas)).not.toThrow()
    expect(() => drawOrbit(canvas, 800, 450, 0.25, { targetBody: 'earth', showScanBeam: true })).not.toThrow()
    expect(() => drawOrbit(canvas, 800, 450, 0.5, { targetBody: 'moon', showScanBeam: false })).not.toThrow()
    expect(() => drawOrbit(canvas, 800, 450, 0.75, { targetBody: 'mars', isSuccess: false })).not.toThrow()
    expect(() => drawOrbit(canvas, 800, 450, 1.0, { targetBody: 'earth', isSuccess: true })).not.toThrow()
  })
})
