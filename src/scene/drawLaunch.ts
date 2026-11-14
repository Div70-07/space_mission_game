// Owner: D. Rocket launch staging and ascent canvas renderer.
export function drawLaunch(canvas: HTMLCanvasElement): void {
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  ctx.strokeStyle = '#f59e0b'
  ctx.strokeRect(0, 0, canvas.width, canvas.height)
}
