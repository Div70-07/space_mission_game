// src/scene/drawLaunch.ts
// Owner: D. Rocket launch staging, atmospheric ascent, and exhaust canvas renderer.

export interface LaunchDrawOptions {
  rocketName?: string
  missionName?: string
  isSuccess?: boolean
  stage?: number // 1 = first stage, 2 = upper stage
  altitudeKm?: number
  velocityKmS?: number
}

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  alpha: number
  color: string
  life: number
  maxLife: number
}

// Particle pool to avoid garbage collection spikes
const particles: Particle[] = []
const MAX_PARTICLES = 160

/**
 * Spawns an exhaust flame/smoke particle at the rocket engine nozzle.
 */
function spawnParticle(x: number, y: number, speedMultiplier: number = 1.0) {
  if (particles.length >= MAX_PARTICLES) return

  const angle = Math.PI / 2 + (Math.random() - 0.5) * 0.45
  const speed = (Math.random() * 4 + 3) * speedMultiplier
  const isFlame = Math.random() < 0.65

  particles.push({
    x: x + (Math.random() - 0.5) * 6,
    y: y,
    vx: Math.cos(angle) * speed + (Math.random() - 0.5) * 1.5,
    vy: Math.sin(angle) * speed + 2,
    size: isFlame ? Math.random() * 5 + 4 : Math.random() * 9 + 6,
    alpha: 1.0,
    color: isFlame
      ? Math.random() < 0.4
        ? '#ffffff'
        : Math.random() < 0.7
          ? '#f59e0b'
          : '#ef4444'
      : '#94a3b8',
    life: 0,
    maxLife: isFlame ? Math.random() * 18 + 12 : Math.random() * 35 + 25,
  })
}

/**
 * Updates and renders active exhaust particles.
 */
function updateAndDrawParticles(ctx: CanvasRenderingContext2D) {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i]
    p.life++
    p.x += p.vx
    p.y += p.vy
    p.size *= 1.025
    p.alpha = Math.max(0, 1.0 - p.life / p.maxLife)

    if (p.life >= p.maxLife || p.alpha <= 0) {
      particles.splice(i, 1)
      continue
    }

    ctx.save()
    ctx.globalAlpha = p.alpha
    ctx.fillStyle = p.color
    ctx.beginPath()
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  }
}

/**
 * Primary drawLaunch renderer.
 * Supports both drawLaunch(canvas) for legacy compatibility and
 * drawLaunch(ctx, width, height, progress, options) for rich animation frames.
 */
export function drawLaunch(
  target: HTMLCanvasElement | CanvasRenderingContext2D,
  width?: number,
  height?: number,
  progress: number = 0,
  options: LaunchDrawOptions = {}
): void {
  let ctx: CanvasRenderingContext2D | null = null
  let w = 800
  let h = 450

  if ('getContext' in target) {
    ctx = target.getContext('2d')
    w = target.width || 800
    h = target.height || 450
  } else {
    ctx = target
    w = width || 800
    h = height || 450
  }

  if (!ctx) return

  const vehicleLabel = options.rocketName || 'HEAVY LIFT LAUNCH VEHICLE'
  const missionLabel = options.missionName ? `// ${options.missionName.toUpperCase()}` : ''

  // Normalized progress clamp [0, 1]
  const p = Math.max(0, Math.min(1, progress))

  // 1. SKY & ATMOSPHERE GRADIENT (Transitions day/twilight -> black vacuum of space)
  const skyGrad = ctx.createLinearGradient(0, 0, 0, h)
  if (p < 0.35) {
    // Sea-level twilight / launch morning
    const ratio = p / 0.35
    skyGrad.addColorStop(0, '#0f172a')
    skyGrad.addColorStop(0.5, '#1e293b')
    skyGrad.addColorStop(0.85, `rgb(${Math.round(30 - ratio * 15)}, ${Math.round(41 - ratio * 20)}, ${Math.round(59 - ratio * 30)})`)
    skyGrad.addColorStop(1, `rgb(${Math.round(180 - ratio * 140)}, ${Math.round(83 - ratio * 60)}, ${Math.round(40 - ratio * 30)})`)
  } else if (p < 0.7) {
    // Stratosphere / Mesosphere transition (deep navy/violet)
    const ratio = (p - 0.35) / 0.35
    skyGrad.addColorStop(0, '#020617')
    skyGrad.addColorStop(0.5, `rgb(${Math.round(15 - ratio * 10)}, ${Math.round(23 - ratio * 15)}, ${Math.round(42 - ratio * 30)})`)
    skyGrad.addColorStop(1, `rgb(${Math.round(30 - ratio * 25)}, ${Math.round(41 - ratio * 35)}, ${Math.round(59 - ratio * 50)})`)
  } else {
    // Vacuum orbital space
    skyGrad.addColorStop(0, '#020617')
    skyGrad.addColorStop(0.7, '#070b14')
    skyGrad.addColorStop(1, '#0b0f19')
  }
  ctx.fillStyle = skyGrad
  ctx.fillRect(0, 0, w, h)

  // 2. STARS (Fade in as altitude increases)
  if (p > 0.25) {
    const starAlpha = Math.min(1.0, (p - 0.25) / 0.45)
    ctx.save()
    ctx.globalAlpha = starAlpha
    ctx.fillStyle = '#ffffff'
    // Deterministic pseudo-random stars based on fixed coordinates
    for (let i = 0; i < 90; i++) {
      const sx = ((i * 137.5) % w)
      const sy = ((i * 229.3) % (h * 0.85))
      const radius = (i % 3 === 0) ? 1.5 : (i % 2 === 0) ? 1.0 : 0.6
      ctx.beginPath()
      ctx.arc(sx, sy, radius, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.restore()
  }

  // 3. GROUND LAUNCH PAD (Visible when altitude is low, recedes downwards)
  const groundOffset = p * h * 1.8
  const groundY = h * 0.88 + groundOffset

  if (groundY < h + 150) {
    ctx.save()
    // Earth surface / launch landscape
    ctx.fillStyle = '#1e293b'
    ctx.fillRect(0, groundY, w, h - groundY + 150)

    // Horizon ocean shoreline tint
    ctx.fillStyle = '#0f766e'
    ctx.fillRect(0, groundY, w, 6)

    // Launch Pad Concrete Complex
    const padX = w * 0.5
    ctx.fillStyle = '#334155'
    ctx.fillRect(padX - 85, groundY - 20, 170, 20)

    // Launch Umbilical Tower (LUT)
    ctx.strokeStyle = '#64748b'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.moveTo(padX - 55, groundY - 20)
    ctx.lineTo(padX - 55, groundY - 140)
    ctx.lineTo(padX - 35, groundY - 140)
    ctx.lineTo(padX - 35, groundY - 20)
    // Cross trusses
    for (let ty = groundY - 20; ty >= groundY - 140; ty -= 20) {
      ctx.moveTo(padX - 55, ty)
      ctx.lineTo(padX - 35, ty - 20)
      ctx.moveTo(padX - 35, ty)
      ctx.lineTo(padX - 55, ty - 20)
    }
    ctx.stroke()

    // Retracted Crew/Service Arm
    ctx.strokeStyle = '#94a3b8'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(padX - 35, groundY - 110)
    ctx.lineTo(padX - 18, groundY - 105)
    ctx.stroke()

    // Floodlight glow on the ground pad
    const padGlow = ctx.createRadialGradient(padX, groundY - 10, 5, padX, groundY - 10, 120)
    padGlow.addColorStop(0, 'rgba(251, 191, 36, 0.45)')
    padGlow.addColorStop(1, 'rgba(251, 191, 36, 0)')
    ctx.fillStyle = padGlow
    ctx.fillRect(padX - 120, groundY - 60, 240, 80)

    ctx.restore()
  }

  // 4. ROCKET POSITION & TRAJECTORY (Gravity turn curve)
  const startX = w * 0.5
  const startY = h * 0.78

  // Trajectory curve
  const rocketX = startX + Math.pow(p, 1.6) * (w * 0.32)
  const rocketY = startY - Math.pow(p, 0.9) * (h * 0.62)

  // Rocket pitch angle (degrees tilted from vertical)
  const pitchAngle = Math.min(68, Math.pow(p, 1.2) * 65) * (Math.PI / 180)

  // 5. SMOKE TRAIL & EXHAUST PARTICLES
  const nozzleLength = 34
  const nozzleX = rocketX - Math.sin(pitchAngle) * nozzleLength
  const nozzleY = rocketY + Math.cos(pitchAngle) * nozzleLength

  // Spawn exhaust particles
  if (p > 0.01 && p < 0.95) {
    for (let k = 0; k < 3; k++) {
      spawnParticle(nozzleX, nozzleY, 1.0 + p * 0.8)
    }
  }
  updateAndDrawParticles(ctx)

  // 6. ROCKET FLAME / MACH SHOCK DIAMONDS (Core Plume)
  if (p < 0.95) {
    ctx.save()
    ctx.translate(nozzleX, nozzleY)
    ctx.rotate(pitchAngle)

    const flameLen = 45 + Math.sin(Date.now() * 0.05) * 8 + p * 20
    const flameGrad = ctx.createLinearGradient(0, 0, 0, flameLen)
    flameGrad.addColorStop(0, '#ffffff')
    flameGrad.addColorStop(0.2, '#fef08a')
    flameGrad.addColorStop(0.55, '#f97316')
    flameGrad.addColorStop(1, 'rgba(239, 68, 68, 0)')

    ctx.fillStyle = flameGrad
    ctx.beginPath()
    ctx.moveTo(-7, 0)
    ctx.quadraticCurveTo(-10, flameLen * 0.45, 0, flameLen)
    ctx.quadraticCurveTo(10, flameLen * 0.45, 7, 0)
    ctx.closePath()
    ctx.fill()

    // Inner supersonic shock diamonds
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)'
    for (let d = 8; d < flameLen * 0.6; d += 12) {
      ctx.beginPath()
      ctx.ellipse(0, d, 2.5, 4, 0, 0, Math.PI * 2)
      ctx.fill()
    }

    ctx.restore()
  }

  // 7. ROCKET VEHICLE FUSELAGE
  ctx.save()
  ctx.translate(rocketX, rocketY)
  ctx.rotate(pitchAngle)

  // Main rocket core dimensions
  const coreW = 14
  const coreH = 58

  // Base Booster Stage
  ctx.fillStyle = '#f1f5f9'
  ctx.strokeStyle = '#334155'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.rect(-coreW / 2, -coreH / 2, coreW, coreH)
  ctx.fill()
  ctx.stroke()

  // Fuselage Shadow / 3D shading
  const hullShade = ctx.createLinearGradient(-coreW / 2, 0, coreW / 2, 0)
  hullShade.addColorStop(0, 'rgba(255, 255, 255, 0.6)')
  hullShade.addColorStop(0.4, 'rgba(255, 255, 255, 0.1)')
  hullShade.addColorStop(1, 'rgba(15, 23, 42, 0.4)')
  ctx.fillStyle = hullShade
  ctx.fillRect(-coreW / 2, -coreH / 2, coreW, coreH)

  // Interstage Ring
  ctx.fillStyle = '#0f172a'
  ctx.fillRect(-coreW / 2 - 0.5, -coreH / 2 + 18, coreW + 1, 4)

  // Payload Fairing (Nose Cone)
  ctx.fillStyle = '#e2e8f0'
  ctx.beginPath()
  ctx.moveTo(-coreW / 2, -coreH / 2)
  ctx.quadraticCurveTo(-coreW / 2, -coreH / 2 - 20, 0, -coreH / 2 - 28)
  ctx.quadraticCurveTo(coreW / 2, -coreH / 2 - 20, coreW / 2, -coreH / 2)
  ctx.closePath()
  ctx.fill()
  ctx.stroke()

  // Fairing Staging Effect (Separates at p > 0.72)
  if (p > 0.72) {
    const sepDist = (p - 0.72) * 90
    // Left fairing half drifting away
    ctx.save()
    ctx.translate(-sepDist, 0)
    ctx.rotate(-0.25)
    ctx.fillStyle = 'rgba(226, 232, 240, 0.85)'
    ctx.beginPath()
    ctx.arc(-8, -coreH / 2 - 10, 8, Math.PI * 0.5, Math.PI * 1.5)
    ctx.fill()
    ctx.restore()

    // Right fairing half drifting away
    ctx.save()
    ctx.translate(sepDist, 0)
    ctx.rotate(0.25)
    ctx.fillStyle = 'rgba(226, 232, 240, 0.85)'
    ctx.beginPath()
    ctx.arc(8, -coreH / 2 - 10, 8, Math.PI * 1.5, Math.PI * 0.5)
    ctx.fill()
    ctx.restore()

    // Inner Payload exposed
    ctx.fillStyle = '#fbbf24'
    ctx.fillRect(-4, -coreH / 2 - 16, 8, 14)
    ctx.fillStyle = '#38bdf8'
    ctx.fillRect(-8, -coreH / 2 - 14, 3, 10)
    ctx.fillRect(5, -coreH / 2 - 14, 3, 10)
  }

  // Aerodynamic Grid Fins (Base)
  ctx.fillStyle = '#475569'
  ctx.fillRect(-coreW / 2 - 4, coreH / 2 - 12, 4, 3)
  ctx.fillRect(coreW / 2, coreH / 2 - 12, 4, 3)

  // Engine Nozzle Cone
  ctx.fillStyle = '#1e293b'
  ctx.beginPath()
  ctx.moveTo(-coreW * 0.35, coreH / 2)
  ctx.lineTo(coreW * 0.35, coreH / 2)
  ctx.lineTo(coreW * 0.45, coreH / 2 + 7)
  ctx.lineTo(-coreW * 0.45, coreH / 2 + 7)
  ctx.closePath()
  ctx.fill()

  ctx.restore()

  // 8. TRANSONIC MACH CONE VAPOR EFFECT (at p ~ 0.36 - 0.46)
  if (p >= 0.36 && p <= 0.46) {
    const shockAlpha = Math.sin(((p - 0.36) / 0.1) * Math.PI) * 0.7
    ctx.save()
    ctx.translate(rocketX, rocketY - 10)
    ctx.rotate(pitchAngle)
    ctx.globalAlpha = shockAlpha
    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.moveTo(-35, 20)
    ctx.quadraticCurveTo(0, -6, 35, 20)
    ctx.stroke()
    ctx.restore()
  }

  // 9. TELEMETRY HEADS-UP DISPLAY (HUD)
  const currentAlt = Math.round(p * 220) // km
  const currentVel = (p * 7.8).toFixed(2) // km/s
  const currentDownrange = Math.round(p * 450) // km

  ctx.save()
  ctx.font = '10px "Courier New", monospace'
  ctx.fillStyle = '#94a3b8'

  // Top-left flight parameters
  ctx.fillText(`VEHICLE:     ${vehicleLabel} ${missionLabel}`, 18, 24)
  ctx.fillText(`ALTITUDE:    ${currentAlt.toString().padStart(4, ' ')} km`, 18, 38)
  ctx.fillText(`VELOCITY:    ${currentVel.padStart(5, ' ')} km/s`, 18, 52)
  ctx.fillText(`DOWNRANGE:   ${currentDownrange.toString().padStart(4, ' ')} km`, 18, 66)

  // Status indicator
  let flightStatus = 'LIFTOFF // NOMINAL THRUST'
  let statusColor = '#34d399'
  if (p < 0.05) {
    flightStatus = 'T-00:00:02 // MAIN ENGINE IGNITION'
  } else if (p >= 0.36 && p <= 0.46) {
    flightStatus = 'TRANSONIC REGIME // MAX-Q FLIGHT DYNAMICS'
    statusColor = '#38bdf8'
  } else if (p > 0.72 && p < 0.88) {
    flightStatus = 'MECO // FAIRING SEPARATION // STAGE 2 IGNITION'
    statusColor = '#fbbf24'
  } else if (p >= 0.88) {
    flightStatus = options.isSuccess === false
      ? 'TRAJECTORY ANOMALY // INSUFFICIENT ORBITAL ENERGY'
      : 'ORBIT INSERTION // MAIN ENGINE CUTOFF'
    statusColor = options.isSuccess === false ? '#f87171' : '#34d399'
  }

  ctx.fillStyle = statusColor
  ctx.fillText(flightStatus, 18, 82)

  // Telemetry box border
  ctx.strokeStyle = 'rgba(148, 163, 184, 0.25)'
  ctx.lineWidth = 1
  ctx.strokeRect(10, 10, 360, 80)
  ctx.restore()
}
