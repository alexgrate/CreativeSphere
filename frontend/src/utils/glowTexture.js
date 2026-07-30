import * as THREE from 'three'

function parseHexColor(color) {
    try {
        if (typeof color === 'string') {
            const c = new THREE.Color(color)
            return `${Math.round(c.r * 255)}, ${Math.round(c.g * 255)}, ${Math.round(c.b * 255)}`
        }
    } catch {

    }
    return '255, 255, 255'
}

export function createGlowTexture(size = 128, color = '#ffffff') {
    const canvas = document.createElement('canvas')
    canvas.width = canvas.height = size
    
    const ctx = canvas.getContext('2d')
    const rgb = parseHexColor(color)
    const g = ctx.createRadialGradient(
        size / 2, size / 2, 0,
        size / 2, size / 2, size / 2
    )
    g.addColorStop(0, `rgba(${rgb}, 1)`)
    g.addColorStop(0.3, `rgba(${rgb}, 0.5)`)
    g.addColorStop(1, `rgba(${rgb}, 0)`)

    ctx.fillStyle = g
    ctx.fillRect(0, 0, size, size)

    return new THREE.CanvasTexture(canvas)
}

// A structured nebula: a random-walk cluster of soft color blobs —
// cloudy FORM, not a flat tint. The Hubble trick, in a canvas.
export function createNebulaTexture(size = 512, colors = ['#8a5cff', '#ff5ea8', '#4d8dff']) {
    const canvas = document.createElement('canvas')
    canvas.width = canvas.height = size
    const ctx = canvas.getContext('2d')
    ctx.globalCompositeOperation = 'lighter'

    let x = size / 2
    let y = size / 2
    const c = new THREE.Color()
    for (let i = 0; i < 90; i++) {
        // the cloud wanders, so it clumps like real nebulosity
        x += (Math.random() - 0.5) * size * 0.22
        y += (Math.random() - 0.5) * size * 0.22
        x = Math.max(size * 0.15, Math.min(size * 0.85, x))
        y = Math.max(size * 0.15, Math.min(size * 0.85, y))

        const r = size * (0.04 + Math.random() * 0.13)
        c.set(colors[Math.floor(Math.random() * colors.length)])
        c.offsetHSL((Math.random() - 0.5) * 0.06, 0, (Math.random() - 0.5) * 0.1)
        const rgb = `${(c.r * 255) | 0}, ${(c.g * 255) | 0}, ${(c.b * 255) | 0}`

        const g = ctx.createRadialGradient(x, y, 0, x, y, r)
        g.addColorStop(0, `rgba(${rgb}, 0.1)`)
        g.addColorStop(1, `rgba(${rgb}, 0)`)
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.arc(x, y, r, 0, Math.PI * 2)
        ctx.fill()
    }

    // soft radial mask: no hard sprite edges, ever
    ctx.globalCompositeOperation = 'destination-in'
    const m = ctx.createRadialGradient(size / 2, size / 2, size * 0.1, size / 2, size / 2, size * 0.5)
    m.addColorStop(0, 'rgba(0,0,0,1)')
    m.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = m
    ctx.fillRect(0, 0, size, size)

    return new THREE.CanvasTexture(canvas)
}

export function createStarSpriteTexture(size = 64, color = '#ffffff') {
    const canvas = document.createElement('canvas')
    canvas.width = canvas.height = size
    const ctx = canvas.getContext('2d')
    const half = size / 2

    ctx.globalCompositeOperation = 'lighter'

    const rayLength = half
    const rayWidth = size * 0.07
    const makeRay = (rotate) => {
        ctx.save()
        ctx.translate(half, half)
        ctx.rotate(rotate)
        const g = ctx.createLinearGradient(-rayLength, 0, rayLength, 0)
        g.addColorStop(0, 'rgba(255,255,255,0)')
        g.addColorStop(0.5, 'rgba(255,255,255,0.9)')
        g.addColorStop(1, 'rgba(255,255,255,0)')
        ctx.fillStyle = g
        ctx.fillRect(-rayLength, -rayWidth / 2, rayLength * 2, rayWidth)
        ctx.restore()
    }
    makeRay(0)
    makeRay(Math.PI / 2)

    const core = ctx.createRadialGradient(half, half, 0, half, half, size * 0.14)
    core.addColorStop(0, 'rgba(255,255,255,1)')
    core.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = core
    ctx.beginPath()
    ctx.arc(half, half, size * 0.14, 0, Math.PI * 2)
    ctx.fill()

    return new THREE.CanvasTexture(canvas)
}