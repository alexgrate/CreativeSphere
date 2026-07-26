import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { easing } from 'maath'
import { useJourney } from '../../stores/useJourney'
import { createGlowTexture } from '../../utils/glowTexture'

const CLOUDS = 14

export default function CloudLayer() {
  const group = useRef()
  const glow = useMemo(() => createGlowTexture(256), [])

  const puffs = useMemo(
    () =>
      Array.from({ length: CLOUDS }, () => ({
        x: (Math.random() - 0.5) * 60,
        y: 8 + Math.random() * 34,       
        z: -4 - Math.random() * 36,
        s: 22 + Math.random() * 30,
        o: 0.1 + Math.random() * 0.1,
        phase: Math.random() * Math.PI * 2,
      })),
    []
  )

  useFrame((state, delta) => {
    const { progress, birth } = useJourney.getState()
    const revealed = birth === 'born' ? 1 : 0
    const past = 1 - THREE.MathUtils.smoothstep(progress, 0.10, 0.16)

    group.current?.children.forEach((sprite, i) => {
      const p = puffs[i]
      sprite.position.x = p.x + Math.sin(state.clock.elapsedTime * 0.1 + p.phase) * 2
      easing.damp(sprite.material, 'opacity', p.o * revealed * past, 0.6, delta)
    })
  })

  return (
    <group ref={group}>
      {puffs.map((p, i) => (
        <sprite key={i} position={[p.x, p.y, p.z]} scale={[p.s, p.s * 0.35, 1]}>
          <spriteMaterial map={glow} color="#5a6b8f" transparent opacity={0} depthWrite={false} />
        </sprite>
      ))}
    </group>
  )
}
