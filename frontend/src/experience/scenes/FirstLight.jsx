import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { easing } from 'maath'
import { useJourney } from '../../stores/useJourney'
import { createGlowTexture } from '../../utils/glowTexture'

export default function FirstLight() {
  const sprite = useRef()
  const glow = useMemo(() => createGlowTexture(), [])

  useFrame((state, delta) => {
    const s = sprite.current
    if (!s) return

    const { sceneId, sceneLocal, birth } = useJourney.getState()
    const born = birth === 'born'
    const presence = born && sceneId === 'beginning' ? 1 - sceneLocal * 0.9 : 0
    easing.damp(s.material, 'opacity', presence, 0.5, delta)


    const breath = 1 + Math.sin(state.clock.elapsedTime * 1.6) * 0.15
    const size = 0.6 * breath
    s.scale.set(size, size, 1)

    const target = [state.pointer.x * 2.5, state.pointer.y * 1.5, 2]
    easing.damp3(s.position, target, 0.8, delta)
  })

  return (
    <sprite ref={sprite} position={[0, 0, 2]}>
      <spriteMaterial
        map={glow}
        transparent
        opacity={0}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </sprite>
  )
}
