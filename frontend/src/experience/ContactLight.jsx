import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { easing } from 'maath'
import { useApp } from '../stores/useApp'
import { createGlowTexture } from '../utils/glowTexture'

export default function ContactLight() {
  const sprite = useRef()
  const glow = useMemo(() => createGlowTexture(), [])

  useFrame((state, delta) => {
    const s = sprite.current
    if (!s) return
    const on = useApp.getState().section === 5
    easing.damp(s.material, 'opacity', on ? 0.85 : 0, 0.6, delta)
    const breath = 1 + Math.sin(state.clock.elapsedTime * 1.5) * 0.16
    const size = 1.6 * breath
    s.scale.set(size, size, 1)
  })

  return (
    <sprite ref={sprite} position={[0, 2.1, -284]}>
      <spriteMaterial
        map={glow}
        color="#eef0ff"
        transparent
        opacity={0}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </sprite>
  )
}
