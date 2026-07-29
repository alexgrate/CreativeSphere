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