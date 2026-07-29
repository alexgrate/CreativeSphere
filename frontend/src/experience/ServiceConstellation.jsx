import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { easing } from 'maath'
import { useApp } from '../stores/useApp'
import { createGlowTexture } from '../utils/glowTexture'

const STARS = [
  [-3.2, 1.4, 0], [0, 2.3, -0.6], [3.1, 1.5, 0.3],
  [-2.7, -1.3, 0.4], [0.3, -2.2, 0], [2.9, -1.1, -0.4],
]
const LINKS = [[0, 1], [1, 2], [0, 3], [3, 4], [4, 5], [2, 5], [1, 4]]

export default function ServiceConstellation() {
  const group = useRef()
  const lineMat = useRef()
  const glow = useMemo(() => createGlowTexture(), [])

  const linePositions = useMemo(() => {
    const arr = new Float32Array(LINKS.length * 2 * 3)
    LINKS.forEach(([a, b], i) => {
      arr.set(STARS[a], i * 6)
      arr.set(STARS[b], i * 6 + 3)
    })
    return arr
  }, [])

  useFrame((state, delta) => {
    const on = useApp.getState().section === 1
    const t = state.clock.elapsedTime

    if (group.current) {
      group.current.rotation.z = Math.sin(t * 0.1) * 0.03
      group.current.children.forEach((star, i) => {
        star.position.y = STARS[i][1] + Math.sin(t * 0.6 + i * 1.7) * 0.08
        easing.damp(star.material, 'opacity', on ? 0.9 : 0, 0.6, delta)
      })
    }
    if (lineMat.current) {
      easing.damp(lineMat.current, 'opacity', on ? 0.22 : 0, 0.6, delta)
    }
  })

  return (
    <group position={[0, 0.3, -62]}>
      <group ref={group}>
        {STARS.map((p, i) => (
          <sprite key={i} position={p} scale={[0.5, 0.5, 1]}>
            <spriteMaterial
              map={glow}
              color={i % 2 ? '#cdd8ff' : '#ffd9ac'}
              transparent
              opacity={0}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
            />
          </sprite>
        ))}
      </group>
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[linePositions, 3]} />
        </bufferGeometry>
        <lineBasicMaterial
          ref={lineMat}
          color="#4d8dff"
          transparent
          opacity={0}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>
    </group>
  )
}
