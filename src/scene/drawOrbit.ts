// src/scene/drawOrbit.ts
// Owner: D. Celestial body, orbital trajectory, spacecraft attitude, and science scanning renderer.

export interface OrbitDrawOptions {
  targetBody?: 'earth' | 'moon' | 'mars'
  orbitId?: string
  altitudeKm?: number
  isSuccess?: boolean
  showScanBeam?: boolean
  missionName?: string
}

/**
 * Draws the celestial body (Earth, Moon, or Mars) with realistic radial shading and features.
 */
function drawCelestialBody(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  body: 'earth' | 'moon' | 'mars',
  rotation: number = 0
) {
  ctx.save()

  // 1. Atmosphere Glow / Corona (Earth & Mars)
  if (body === 'earth') {
    const atmoGlow = ctx.createRadialGradient(cx, cy, radius * 0.95, cx, cy, radius * 1.25)
    atmoGlow.addColorStop(0, 'rgba(56, 189, 248, 0.55)')
    atmoGlow.addColorStop(0.5, 'rgba(14, 165, 233, 0.25)')
    atmoGlow.addColorStop(1, 'rgba(2, 132, 199, 0)')
    ctx.fillStyle = atmoGlow
    ctx.beginPath()
    ctx.arc(cx, cy, radius * 1.25, 0, Math.PI * 2)
    ctx.fill()
  } else if (body === 'mars') {
    const atmoGlow = ctx.createRadialGradient(cx, cy, radius * 0.96, cx, cy, radius * 1.18)
    atmoGlow.addColorStop(0, 'rgba(249, 115, 22, 0.45)')
    atmoGlow.addColorStop(0.6, 'rgba(234, 88, 12, 0.15)')
    atmoGlow.addColorStop(1, 'rgba(154, 52, 18, 0)')
    ctx.fillStyle = atmoGlow
    ctx.beginPath()
    ctx.arc(cx, cy, radius * 1.18, 0, Math.PI * 2)
    ctx.fill()
  }

  // 2. Base Planet Disk Clip
  ctx.beginPath()
  ctx.arc(cx, cy, radius, 0, Math.PI * 2)
  ctx.closePath()
  ctx.clip()

  // 3. Surface Base Texture
  if (body === 'earth') {
    // Deep Ocean Blue
    ctx.fillStyle = '#0369a1'
    ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2)

    // Continents (Green/Brown organic landmasses rotated)
    ctx.save()
    ctx.translate(cx, cy)
    ctx.rotate(rotation)

    ctx.fillStyle = '#15803d'
    ctx.beginPath()
    ctx.ellipse(-radius * 0.35, -radius * 0.25, radius * 0.45, radius * 0.3, 0.4, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = '#854d0e'
    ctx.beginPath()
    ctx.ellipse(radius * 0.25, radius * 0.35, radius * 0.35, radius * 0.5, -0.2, 0, Math.PI * 2)
    ctx.fill()

    // Swirling Cloud Formations
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)'
    ctx.beginPath()
    ctx.arc(-radius * 0.2, -radius * 0.4, radius * 0.35, 0.1, Math.PI * 1.2)
    ctx.lineWidth = radius * 0.15
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)'
    ctx.stroke()

    ctx.beginPath()
    ctx.arc(radius * 0.1, radius * 0.2, radius * 0.45, 1.2, Math.PI * 1.8)
    ctx.stroke()
    ctx.restore()

  } else if (body === 'moon') {
    // Lunar Highlands Ash Grey
    ctx.fillStyle = '#94a3b8'
    ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2)

    // Dark Basaltic Maria (Sea of Tranquility & Oceanus Procellarum hints)
    ctx.save()
    ctx.translate(cx, cy)
    ctx.rotate(rotation)

    ctx.fillStyle = '#475569'
    ctx.beginPath()
    ctx.arc(-radius * 0.25, -radius * 0.2, radius * 0.32, 0, Math.PI * 2)
    ctx.fill()

    ctx.beginPath()
    ctx.arc(radius * 0.28, -radius * 0.1, radius * 0.25, 0, Math.PI * 2)
    ctx.fill()

    ctx.beginPath()
    ctx.arc(radius * 0.05, radius * 0.3, radius * 0.28, 0, Math.PI * 2)
    ctx.fill()

    // Craters & Ejecta Rays (Tycho / Copernicus style)
    ctx.strokeStyle = '#cbd5e1'
    ctx.lineWidth = 1.5
    ctx.strokeRect(-radius * 0.35, radius * 0.45, radius * 0.1, radius * 0.1)

    ctx.beginPath()
    ctx.arc(-radius * 0.3, radius * 0.5, radius * 0.08, 0, Math.PI * 2)
    ctx.stroke()
    ctx.restore()

  } else if (body === 'mars') {
    // Reddish Rust / Iron-Oxide Surface
    ctx.fillStyle = '#c2410c'
    ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2)

    // Dark Volcanic Plains & Canyons (Syrtis Major / Valles Marineris)
    ctx.save()
    ctx.translate(cx, cy)
    ctx.rotate(rotation)

    ctx.fillStyle = '#7c2d12'
    ctx.beginPath()
    ctx.ellipse(radius * 0.1, radius * 0.05, radius * 0.55, radius * 0.22, 0.15, 0, Math.PI * 2)
    ctx.fill()

    ctx.beginPath()
    ctx.arc(-radius * 0.3, -radius * 0.15, radius * 0.25, 0, Math.PI * 2)
    ctx.fill()

    // Polar Ice Cap (Bright White CO2 / H2O Ice)
    ctx.fillStyle = '#f8fafc'
    ctx.beginPath()
    ctx.ellipse(0, -radius * 0.88, radius * 0.35, radius * 0.15, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  }

  // 4. Planetary Terminator & 3D Spherical Shading
  const sphereShade = ctx.createRadialGradient(
    cx - radius * 0.35,
    cy - radius * 0.35,
    radius * 0.1,
    cx,
    cy,
    radius
  )
  sphereShade.addColorStop(0, 'rgba(255, 255, 255, 0.25)')
  sphereShade.addColorStop(0.5, 'rgba(0, 0, 0, 0)')
  sphereShade.addColorStop(0.85, 'rgba(0, 0, 0, 0.55)')
  sphereShade.addColorStop(1, 'rgba(0, 0, 0, 0.88)')

  ctx.fillStyle = sphereShade
  ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2)

  ctx.restore()
}

/**
 * Primary drawOrbit renderer.
 * Supports both drawOrbit(canvas) for legacy compatibility and
 * drawOrbit(ctx, width, height, progress, options) for rich orbital mechanics visualization.
 */
export function drawOrbit(
  target: HTMLCanvasElement | CanvasRenderingContext2D,
  width?: number,
  height?: number,
  progress: number = 0,
  options: OrbitDrawOptions = {}
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

  const p = progress % 1.0 // Orbit cycle repeats continuously
  const body = options.targetBody || 'earth'

  // 1. DEEP SPACE COSMIC BACKGROUND & STARFIELD
  ctx.fillStyle = '#040711'
  ctx.fillRect(0, 0, w, h)

  // Distant Nebula Dust lanes
  const nebulaGrad = ctx.createRadialGradient(w * 0.8, h * 0.2, 20, w * 0.8, h * 0.2, 260)
  nebulaGrad.addColorStop(0, 'rgba(126, 34, 206, 0.22)')
  nebulaGrad.addColorStop(0.6, 'rgba(30, 58, 138, 0.12)')
  nebulaGrad.addColorStop(1, 'rgba(0, 0, 0, 0)')
  ctx.fillStyle = nebulaGrad
  ctx.fillRect(0, 0, w, h)

  // Starfield
  ctx.save()
  ctx.fillStyle = '#ffffff'
  for (let i = 0; i < 110; i++) {
    const sx = (i * 197.3) % w
    const sy = (i * 313.7) % h
    const r = (i % 4 === 0) ? 1.6 : (i % 2 === 0) ? 1.0 : 0.6
    const starAlpha = 0.4 + 0.6 * Math.sin(Date.now() * 0.002 + i)
    ctx.globalAlpha = starAlpha
    ctx.beginPath()
    ctx.arc(sx, sy, r, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.restore()

  // 2. SUN ILLUMINATION DIRECTION INDICATOR (Upper left)
  ctx.save()
  const sunGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, 160)
  sunGrad.addColorStop(0, 'rgba(254, 240, 138, 0.28)')
  sunGrad.addColorStop(0.5, 'rgba(251, 191, 36, 0.1)')
  sunGrad.addColorStop(1, 'rgba(0, 0, 0, 0)')
  ctx.fillStyle = sunGrad
  ctx.fillRect(0, 0, 200, 200)
  ctx.restore()

  // 3. CELESTIAL BODY POSITION & RENDERING
  const planetX = w * 0.5
  const planetY = h * 0.52
  const planetRadius = Math.min(w, h) * 0.22

  // Slowly rotate planet with time
  const planetRotation = (Date.now() * 0.00015) % (Math.PI * 2)
  drawCelestialBody(ctx, planetX, planetY, planetRadius, body, planetRotation)

  // 4. ORBITAL TRAJECTORY ELLIPSE
  const orbitA = planetRadius * 1.65
  const orbitB = planetRadius * 0.95
  const orbitTilt = -0.32

  ctx.save()
  ctx.translate(planetX, planetY)
  ctx.rotate(orbitTilt)

  // Trajectory Glow
  ctx.strokeStyle = body === 'mars' ? 'rgba(249, 115, 22, 0.35)' : 'rgba(45, 212, 191, 0.35)'
  ctx.lineWidth = 4
  ctx.beginPath()
  ctx.ellipse(0, 0, orbitA, orbitB, 0, 0, Math.PI * 2)
  ctx.stroke()

  // Trajectory Core Dashed Line
  ctx.strokeStyle = body === 'mars' ? '#f97316' : '#2dd4bf'
  ctx.lineWidth = 1.5
  ctx.setLineDash([6, 5])
  ctx.beginPath()
  ctx.ellipse(0, 0, orbitA, orbitB, 0, 0, Math.PI * 2)
  ctx.stroke()
  ctx.setLineDash([])

  // Apoapsis & Periapsis Markers
  ctx.font = '9px "Courier New", monospace'
  ctx.fillStyle = '#94a3b8'
  ctx.fillText('Periapsis (Rp)', orbitA + 8, 4)
  ctx.beginPath()
  ctx.arc(orbitA, 0, 3, 0, Math.PI * 2)
  ctx.fillStyle = '#38bdf8'
  ctx.fill()

  ctx.fillStyle = '#94a3b8'
  ctx.fillText('Apoapsis (Ra)', -orbitA - 85, 4)
  ctx.beginPath()
  ctx.arc(-orbitA, 0, 3, 0, Math.PI * 2)
  ctx.fillStyle = '#fbbf24'
  ctx.fill()

  // 5. SPACECRAFT ORBITAL POSITION CALCULATION
  const theta = p * Math.PI * 2
  const satX = orbitA * Math.cos(theta)
  const satY = orbitB * Math.sin(theta)

  // Spacecraft velocity tangent vector angle
  const tangentAngle = Math.atan2(
    orbitB * Math.cos(theta),
    -orbitA * Math.sin(theta)
  )

  // 6. SCIENTIFIC SCANNING SWATH / SENSOR BEAM
  if (options.showScanBeam !== false) {
    const angleToCenter = Math.atan2(-satY, -satX)
    const beamDist = Math.hypot(satX, satY) - planetRadius * 0.85

    ctx.save()
    ctx.translate(satX, satY)
    ctx.rotate(angleToCenter)

    // Conical sensor swath
    const scanGrad = ctx.createLinearGradient(0, 0, beamDist, 0)
    scanGrad.addColorStop(0, 'rgba(45, 212, 191, 0.75)')
    scanGrad.addColorStop(0.3, 'rgba(45, 212, 191, 0.25)')
    scanGrad.addColorStop(1, 'rgba(45, 212, 191, 0.02)')

    ctx.fillStyle = scanGrad
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.lineTo(beamDist, -18)
    ctx.lineTo(beamDist, 18)
    ctx.closePath()
    ctx.fill()

    // Scanning line pulse on planet ground track
    const pulseOffset = (Date.now() * 0.004) % 1.0
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(beamDist, 0, 16 * pulseOffset, -0.6, 0.6)
    ctx.stroke()

    ctx.restore()
  }

  // 7. SPACECRAFT HARDWARE RENDERING
  ctx.save()
  ctx.translate(satX, satY)
  ctx.rotate(tangentAngle)

  // Satellite Central Bus
  ctx.fillStyle = '#fbbf24'
  ctx.fillRect(-7, -7, 14, 14)
  ctx.strokeStyle = '#d97706'
  ctx.lineWidth = 1
  ctx.strokeRect(-7, -7, 14, 14)

  // High-Gain Antenna Dish
  ctx.strokeStyle = '#94a3b8'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.arc(-11, 0, 6, -Math.PI * 0.45, Math.PI * 0.45)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(-11, 0)
  ctx.lineTo(-7, 0)
  ctx.stroke()

  // Deployable Solar Array Wings
  const wingW = 20
  const wingH = 7
  ctx.fillStyle = '#0284c7'
  ctx.fillRect(-wingW - 9, -wingH / 2, wingW, wingH)
  ctx.strokeStyle = '#38bdf8'
  ctx.strokeRect(-wingW - 9, -wingH / 2, wingW, wingH)
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)'
  ctx.lineWidth = 0.5
  ctx.beginPath()
  ctx.moveTo(-wingW - 9 + wingW * 0.33, -wingH / 2)
  ctx.lineTo(-wingW - 9 + wingW * 0.33, wingH / 2)
  ctx.moveTo(-wingW - 9 + wingW * 0.66, -wingH / 2)
  ctx.lineTo(-wingW - 9 + wingW * 0.66, wingH / 2)
  ctx.stroke()

  ctx.fillStyle = '#0284c7'
  ctx.fillRect(9, -wingH / 2, wingW, wingH)
  ctx.strokeStyle = '#38bdf8'
  ctx.lineWidth = 1
  ctx.strokeRect(9, -wingH / 2, wingW, wingH)
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)'
  ctx.lineWidth = 0.5
  ctx.beginPath()
  ctx.moveTo(9 + wingW * 0.33, -wingH / 2)
  ctx.lineTo(9 + wingW * 0.33, wingH / 2)
  ctx.moveTo(9 + wingW * 0.66, -wingH / 2)
  ctx.lineTo(9 + wingW * 0.66, wingH / 2)
  ctx.stroke()

  // Science Payload Optics Aperture
  ctx.fillStyle = '#38bdf8'
  ctx.beginPath()
  ctx.arc(0, 7, 2.5, 0, Math.PI * 2)
  ctx.fill()

  ctx.restore()

  ctx.restore() // End orbit rotation & translation

  // 8. ORBITAL TELEMETRY HUD OVERLAY
  ctx.save()
  ctx.font = '10px "Courier New", monospace'
  ctx.fillStyle = '#94a3b8'

  const orbitName =
    body === 'earth'
      ? 'SUN-SYNCHRONOUS ORBIT (705 km)'
      : body === 'moon'
        ? 'LOW LUNAR POLAR ORBIT (100 km)'
        : 'LOW MARS SCIENCE ORBIT (300 km)'

  const orbVel = (body === 'earth' ? 7.5 : body === 'moon' ? 1.63 : 3.42).toFixed(2)
  const periodMin = body === 'earth' ? 98 : body === 'moon' ? 118 : 115

  ctx.fillText(`TARGET:      ${body.toUpperCase()} // NOMINAL CAPTURE`, 18, 24)
  ctx.fillText(`ORBIT:       ${orbitName}`, 18, 38)
  ctx.fillText(`VELOCITY:    ${orbVel} km/s`, 18, 52)
  ctx.fillText(`PERIOD:      ${periodMin} minutes`, 18, 66)
  ctx.fillText(`TELEMETRY:   100% CARRIER LOCK // DSN SYNC`, 18, 80)

  ctx.fillStyle = '#2dd4bf'
  ctx.fillText(`SCIENCE HARVEST: ACTIVE PAYLOAD ACQUISITION`, 18, 98)

  ctx.strokeStyle = 'rgba(148, 163, 184, 0.25)'
  ctx.lineWidth = 1
  ctx.strokeRect(10, 10, 340, 96)
  ctx.restore()
}
