export function sampleText(lines, { fontSize = 96, step = 4 } = {}) {
  const font = `600 ${fontSize}px system-ui, sans-serif`

  const probe = document.createElement('canvas').getContext('2d')
  probe.font = font
  const width = Math.ceil(Math.max(...lines.map((l) => probe.measureText(l).width))) + 20
  const lineHeight = fontSize * 1.35
  const height = Math.ceil(lineHeight * lines.length) + 20

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  ctx.font = font
  ctx.fillStyle = '#fff'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  lines.forEach((line, i) => {
    ctx.fillText(line, width / 2, 10 + lineHeight * (i + 0.5))
  })

  const data = ctx.getImageData(0, 0, width, height).data
  const pts = []
  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      if (data[(y * width + x) * 4 + 3] > 128) {
        pts.push(x - width / 2, -(y - height / 2)) 
      }
    }
  }
  return { pts, unit: 1 / fontSize } 
}
