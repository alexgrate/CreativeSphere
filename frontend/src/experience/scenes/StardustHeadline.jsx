import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useJourney } from '../../stores/useJourney'
import { createGlowTexture } from '../../utils/glowTexture'
import { sampleText } from '../../utils/sampleText'

const ANCHOR = [0, 0.8, -9] 
const WORLD_SIZE = 1.6        

export default function StardustHeadline() {
  const points = useRef()
  const glow = useMemo(() => createGlowTexture(), [])

  const { positions, colors, targets, scatter, count } = useMemo(() => {
    const { pts, unit } = sampleText(
      ['Every great brand', 'begins with one idea.'],
      { fontSize: 96, step: 4 }
    )
    const count = pts.length / 2
    const targets = new Float32Array(count * 3)
    const scatter = new Float32Array(count * 3)
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)

    const k = WORLD_SIZE * unit
    for (let i = 0; i < count; i++) {
      targets[i * 3 + 0] = ANCHOR[0] + pts[i * 2] * k
      targets[i * 3 + 1] = ANCHOR[1] + pts[i * 2 + 1] * k
      targets[i * 3 + 2] = ANCHOR[2] + (Math.random() - 0.5) * 0.3 

      scatter[i * 3 + 0] = ANCHOR[0] + (Math.random() - 0.5) * 24
      scatter[i * 3 + 1] = ANCHOR[1] + (Math.random() - 0.5) * 14
      scatter[i * 3 + 2] = ANCHOR[2] + (Math.random() - 0.5) * 18

      positions.set(scatter.subarray(i * 3, i * 3 + 3), i * 3)
    }
    return { positions, colors, targets, scatter, count }
  }, [])

  useFrame((state, delta) => {
    const geo = points.current?.geometry
    if (!geo) return
    const { progress } = useJourney.getState()

    const reveal = THREE.MathUtils.smoothstep(progress, 0.125, 0.145)
    const disperse = THREE.MathUtils.smoothstep(progress, 0.20, 0.23)
    const presence = reveal * (1 - disperse)

    const lam = 1 - Math.pow(0.001, delta) 

    for (let i = 0; i < count; i++) {
      const gx = scatter[i * 3] + (targets[i * 3] - scatter[i * 3]) * reveal
      const gy = scatter[i * 3 + 1] + (targets[i * 3 + 1] - scatter[i * 3 + 1]) * reveal
      const gz = scatter[i * 3 + 2] + (targets[i * 3 + 2] - scatter[i * 3 + 2]) * reveal

      positions[i * 3 + 0] += (gx - positions[i * 3 + 0]) * lam
      positions[i * 3 + 1] += (gy - positions[i * 3 + 1]) * lam
      positions[i * 3 + 2] += (gz - positions[i * 3 + 2]) * lam

      const tw = 0.8 + 0.2 * Math.sin(state.clock.elapsedTime * 2 + i * 0.7)
      const b = presence * tw
      colors[i * 3 + 0] = b
      colors[i * 3 + 1] = b * 0.97
      colors[i * 3 + 2] = b * 0.92
    }
    geo.attributes.position.needsUpdate = true
    geo.attributes.color.needsUpdate = true
  })

  return (
    <points ref={points} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        sizeAttenuation
        map={glow}
        vertexColors
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}
