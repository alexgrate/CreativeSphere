import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { easing } from 'maath'
import { useJourney } from '../../stores/useJourney'
import { createGlowTexture } from '../../utils/glowTexture'

const BIRTH_POINT = [0, 0.4, -3] 
const PERCH = [0, 9, -80]      

export default function IdeaStar() {
  const sprite = useRef()
  const glow = useMemo(() => createGlowTexture(), [])

  useFrame((state, delta) => {
    const s = sprite.current
    if (!s) return
    const { birth } = useJourney.getState()
    const born = birth === 'born'

    easing.damp(s.material, 'opacity', born ? 1 : 0, 0.4, delta)
    if (born) easing.damp3(s.position, PERCH, 2.5, delta)

    const breath = 1 + Math.sin(state.clock.elapsedTime * 1.4) * 0.12
    const size = 2.2 * breath
    s.scale.set(size, size, 1)
  })

  return (
    <sprite ref={sprite} position={BIRTH_POINT}>
      <spriteMaterial
        map={glow}
        color="#eaf0ff"
        transparent
        opacity={0}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </sprite>
  )
}
