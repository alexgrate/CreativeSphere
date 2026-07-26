import * as THREE from 'three'

export function createGlowTexture(size = 128) {
    const canvas = document.createElement('canvas')
    canvas.width = canvas.height = size
    
    const ctx = canvas.getContext('2d')
    const g = ctx.createRadialGradient(
        size / 2, size / 2, 0,
        size / 2, size / 2, size / 2
    )
    g.addColorStop(0, 'rgba(255, 255, 255, 1)')
    g.addColorStop(0.3, 'rgba(255, 255, 255, 0.5)')
    g.addColorStop(1, 'rgba(255, 255, 255, 0)')

    ctx.fillStyle = g
    ctx.fillRect(0, 0, size, size)

    return new THREE.CanvasTexture(canvas)
}