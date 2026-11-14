// Owner: D. Orbit animation and trajectory canvas renderer.
export function drawOrbit(canvas: HTMLCanvasElement): void {
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  ctx.strokeStyle = '#4fd1c5'
  ctx.strokeRect(0, 0, canvas.width, canvas.height)
}
