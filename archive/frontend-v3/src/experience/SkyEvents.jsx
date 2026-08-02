import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { createGlowTexture } from '../utils/glowTexture'

const GHOSTS = 14           
const METEORS = 2            
const METEOR_LIFE = 0.9
const NOVA_DURATION = 2.4
const GAP = [3, 7]        

const rnd = (a, b) => a + Math.random() * (b - a)

export default function SkyEvents() {
  const glow = useMemo(() => createGlowTexture(), [])
  const points = useRef()
  const novaRef = useRef()

  const calm = useMemo(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    []
  )

  const director = useRef({ nextAt: 10 }) 

  const meteors = useRef(
    Array.from({ length: METEORS }, () => ({ t0: -Infinity }))
  )
  const nova = useRef({ t0: -Infinity, pos: new THREE.Vector3() })

  const positions = useMemo(() => new Float32Array(METEORS * GHOSTS * 3), [])
  const colors = useMemo(() => new Float32Array(METEORS * GHOSTS * 3), [])

  const launchMeteor = (m, t, camZ, delay = 0) => {
    m.t0 = t + delay
    m.x = rnd(-16, 16)
    m.y = rnd(3.5, 8)
    m.z = camZ - rnd(24, 40)
    m.vx = rnd(6, 10) * (Math.random() < 0.5 ? -1 : 1)
    m.vy = -rnd(3, 5.5)
    m.blue = Math.random() < 0.1 
  }

  useFrame((state) => {
    const t = state.clock.elapsedTime
    const camZ = state.camera.position.z
    const d = director.current

    if (!calm && t >= d.nextAt) {
      const roll = Math.random()
      if (roll < 0.55) {
        launchMeteor(meteors.current[0], t, camZ)
      } else if (roll < 0.75) {
        launchMeteor(meteors.current[0], t, camZ)
        launchMeteor(meteors.current[1], t, camZ, 0.3)
      } else {
        const n = nova.current
        n.t0 = t
        n.pos.set(rnd(-40, 40), rnd(-8, 26), camZ - rnd(50, 120))
      }
      d.nextAt = t + rnd(GAP[0], GAP[1])
    }

    const geo = points.current?.geometry
    if (geo) {
      meteors.current.forEach((m, mi) => {
        const age = t - m.t0
        for (let k = 0; k < GHOSTS; k++) {
          const j = mi * GHOSTS + k
          if (age < 0 || age > METEOR_LIFE) {
            colors[j * 3] = colors[j * 3 + 1] = colors[j * 3 + 2] = 0
            continue
          }
          const tau = Math.max(age - k * 0.018, 0)
          positions[j * 3 + 0] = m.x + m.vx * tau
          positions[j * 3 + 1] = m.y + m.vy * tau
          positions[j * 3 + 2] = m.z

          const fade = Math.sin(Math.PI * (age / METEOR_LIFE))
          const b = fade * (1 - k / GHOSTS)
          colors[j * 3 + 0] = b * (m.blue ? 0.45 : 1.0)
          colors[j * 3 + 1] = b * (m.blue ? 0.65 : 0.96)
          colors[j * 3 + 2] = b * (m.blue ? 1.0 : 0.88)
        }
      })
      geo.attributes.position.needsUpdate = true
      geo.attributes.color.needsUpdate = true
    }

    const s = novaRef.current
    if (s) {
      const n = nova.current
      const age = t - n.t0
      if (age >= 0 && age <= NOVA_DURATION) {
        const i = Math.pow(Math.sin(Math.PI * (age / NOVA_DURATION)), 1.5)
        s.material.opacity = 0.9 * i
        const size = 0.5 + i * 1.6
        s.scale.set(size, size, 1)
        s.position.copy(n.pos)
      } else {
        s.material.opacity = 0
      }
    }
  })

  return (
    <group>
      <points ref={points} frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
          <bufferAttribute attach="attributes-color" args={[colors, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.14}
          sizeAttenuation
          map={glow}
          vertexColors
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>

      <sprite ref={novaRef} scale={[0.5, 0.5, 1]}>
        <spriteMaterial
          map={glow}
          color="#eef2ff"
          transparent
          opacity={0}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </sprite>
    </group>
  )
}
