import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { easing } from 'maath'
import { useJourney } from '../../stores/useJourney'
import { createGlowTexture } from '../../utils/glowTexture'

const LIGHTS = 2500

export function CityLights() {
  const mat = useRef()
  const glow = useMemo(() => createGlowTexture(), [])

  const { positions, colors } = useMemo(() => {
    const positions = new Float32Array(LIGHTS * 3)
    const colors = new Float32Array(LIGHTS * 3)

    const palette = [
      new THREE.Color('#ffb46b'), 
      new THREE.Color('#ffd9a0'),
      new THREE.Color('#fff2cf'),
      new THREE.Color('#9fd0ff'),
    ]

    for (let i = 0; i < LIGHTS; i++) {
      positions[i * 3 + 0] = (Math.random() - 0.5) * 260
      positions[i * 3 + 1] = -4 - Math.random() * 0.6  
      positions[i * 3 + 2] = 2 - Math.random() * 240   

      const c = palette[Math.floor(Math.random() * palette.length)]
      const dim = 0.35 + Math.random() * 0.65          
      colors[i * 3 + 0] = c.r * dim
      colors[i * 3 + 1] = c.g * dim
      colors[i * 3 + 2] = c.b * dim
    }
    return { positions, colors }
  }, [])

  useFrame((_, delta) => {
    if (!mat.current) return
    const { progress, birth } = useJourney.getState()

    const revealed = birth === 'born' ? 1 : 0
    const leaving = 1 - THREE.MathUtils.smoothstep(progress, 0.04, 0.13)

    easing.damp(mat.current, 'opacity', 0.9 * revealed * leaving, 1.0, delta)
  })

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        ref={mat}
        size={0.5}
        sizeAttenuation
        map={glow}
        vertexColors
        transparent
        opacity={0}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}


export function HorizonDusk() {
  const dusk = useRef()
  const ember = useRef()
  const glow = useMemo(() => createGlowTexture(256), [])

  useFrame((_, delta) => {
    const { progress, birth } = useJourney.getState()
    const revealed = birth === 'born' ? 1 : 0
    const leaving = 1 - THREE.MathUtils.smoothstep(progress, 0.04, 0.13)

    if (dusk.current)
      easing.damp(dusk.current.material, 'opacity', 0.3 * revealed * leaving, 1.0, delta)
    if (ember.current)
      easing.damp(ember.current.material, 'opacity', 0.18 * revealed * leaving, 1.0, delta)
  })

  return (
    <group position={[0, -1, -180]}>
      <sprite ref={dusk} scale={[420, 14, 1]}>
        <spriteMaterial map={glow} color="#31427a" transparent opacity={0} depthWrite={false} blending={THREE.AdditiveBlending} />
      </sprite>
      <sprite ref={ember} position={[0, -2.5, 1]} scale={[300, 7, 1]}>
        <spriteMaterial map={glow} color="#c96f3b" transparent opacity={0} depthWrite={false} blending={THREE.AdditiveBlending} />
      </sprite>
    </group>
  )
}
