import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { easing } from 'maath'
import { useApp } from '../stores/useApp'
import { createGlowTexture } from '../utils/glowTexture'

const NODES = 26
const R = 0.52

export default function BrandSphere() {
  const group = useRef()
  const lineMat = useRef()
  const pointMat = useRef()
  const glow = useMemo(() => createGlowTexture(), [])

  const { positions, linePositions } = useMemo(() => {
    const pts = []
    const golden = Math.PI * (3 - Math.sqrt(5))
    for (let i = 0; i < NODES; i++) {
      const y = 1 - (i / (NODES - 1)) * 2
      const rad = Math.sqrt(1 - y * y)
      const a = golden * i
      pts.push(new THREE.Vector3(Math.cos(a) * rad * R, y * R, Math.sin(a) * rad * R))
    }
    const positions = new Float32Array(pts.length * 3)
    pts.forEach((p, i) => positions.set([p.x, p.y, p.z], i * 3))

    const lines = []
    pts.forEach((p, i) => {
      pts
        .map((q, j) => ({ j, d: p.distanceTo(q) }))
        .filter((o) => o.j !== i)
        .sort((a, b) => a.d - b.d)
        .slice(0, 2)
        .forEach(({ j }) => lines.push(p, pts[j]))
    })
    const linePositions = new Float32Array(lines.length * 3)
    lines.forEach((p, i) => linePositions.set([p.x, p.y, p.z], i * 3))

    return { positions, linePositions }
  }, [])

  useFrame((state, delta) => {
    const loading = useApp.getState().phase !== 'ready'
    if (group.current) {
      group.current.rotation.y += delta * 0.5
      group.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.4) * 0.25
    }
    if (pointMat.current) easing.damp(pointMat.current, 'opacity', loading ? 0.95 : 0, 0.5, delta)
    if (lineMat.current) easing.damp(lineMat.current, 'opacity', loading ? 0.5 : 0, 0.5, delta)
  })

  return (
    <group ref={group} position={[0, 0, 1.5]}>
      <points frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        </bufferGeometry>
        <pointsMaterial ref={pointMat} size={0.05} sizeAttenuation map={glow} transparent opacity={0} depthWrite={false} blending={THREE.AdditiveBlending} color="#dce8ff" />
      </points>
      <lineSegments frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[linePositions, 3]} />
        </bufferGeometry>
        <lineBasicMaterial ref={lineMat} color="#4d8dff" transparent opacity={0} depthWrite={false} blending={THREE.AdditiveBlending} />
      </lineSegments>
    </group>
  )
}
