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

// ——— Nebula v2: fractal-noise nebulae with filaments and dark lanes ———
// Real nebulosity is turbulence, not blobs. We build value-noise octaves
// (fBm), emphasize ridges into filaments, carve dark lanes with a second
// noise field, and ramp color by density. Same math family as film VFX.

function makeLattice(n) {
    const a = new Float32Array((n + 2) * (n + 2))
    for (let i = 0; i < a.length; i++) a[i] = Math.random()
    return a
}

const smoothT = (t) => t * t * (3 - 2 * t)

function sampleNoise(lattice, n, x, y) {
    const gx = Math.min(x * n, n - 0.001)
    const gy = Math.min(y * n, n - 0.001)
    const x0 = Math.floor(gx)
    const y0 = Math.floor(gy)
    const fx = smoothT(gx - x0)
    const fy = smoothT(gy - y0)
    const w = n + 2
    const v00 = lattice[y0 * w + x0]
    const v10 = lattice[y0 * w + x0 + 1]
    const v01 = lattice[(y0 + 1) * w + x0]
    const v11 = lattice[(y0 + 1) * w + x0 + 1]
    return (v00 * (1 - fx) + v10 * fx) * (1 - fy) + (v01 * (1 - fx) + v11 * fx) * fy
}

export function createNebulaTexture(size = 384, colors = ['#8a5cff', '#ff5ea8', '#4d8dff']) {
    const canvas = document.createElement('canvas')
    canvas.width = canvas.height = size
    const ctx = canvas.getContext('2d')
    const img = ctx.createImageData(size, size)
    const data = img.data

    // four octaves of detail + one field reserved for dark lanes
    const octaves = [
        [makeLattice(4), 4, 0.5],
        [makeLattice(8), 8, 0.26],
        [makeLattice(16), 16, 0.15],
        [makeLattice(32), 32, 0.09],
    ]
    const lanes = makeLattice(7)

    const cA = new THREE.Color(colors[0])
    const cB = new THREE.Color(colors[1])
    const cC = new THREE.Color(colors[2] ?? colors[0])

    for (let py = 0; py < size; py++) {
        const v = py / size
        for (let px = 0; px < size; px++) {
            const u = px / size

            // fBm density
            let f = 0
            for (const [lat, n, w] of octaves) f += w * sampleNoise(lat, n, u, v)

            // ridges → filaments
            const ridge = Math.pow(1 - Math.abs(2 * f - 1), 3)
            let dens = Math.pow(f, 1.6) * 0.8 + ridge * 0.5

            // soft radial mask, slightly irregular so the edge isn't a circle
            const dx = u - 0.5
            const dy = v - 0.5
            const rad = Math.sqrt(dx * dx + dy * dy) * (2.1 + f * 0.5)
            const mask = Math.max(0, 1 - rad)
            let a = Math.max(0, Math.min(1, dens * mask * mask - 0.05))

            // dark lanes: cold dust blocking the glow
            const lane = sampleNoise(lanes, 7, u + 0.31, v + 0.67)
            a *= 0.45 + 0.55 * smoothT(lane)

            // color ramps with density: base hue → second hue, filaments → third
            const t = smoothT(f)
            let r = cA.r + (cB.r - cA.r) * t
            let g = cA.g + (cB.g - cA.g) * t
            let b = cA.b + (cB.b - cA.b) * t
            r += (cC.r - r) * ridge * 0.6
            g += (cC.g - g) * ridge * 0.6
            b += (cC.b - b) * ridge * 0.6

            const i = (py * size + px) * 4
            data[i] = r * 255
            data[i + 1] = g * 255
            data[i + 2] = b * 255
            data[i + 3] = a * 165
        }
    }

    ctx.putImageData(img, 0, 0)
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