import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { createNebulaTexture } from '../utils/glowTexture'

// Structured nebulae along the journey — Hubble color with FORM,
// placed at the frame's edges so the void (and the text) stay clean.
const CLOUDS = [
  { palette: ['#8a5cff', '#ff5ea8', '#4d8dff'], pos: [-26, 14, -60], scale: 95, op: 0.5, spin: 0.004 },
  { palette: ['#3ddad7', '#4d8dff', '#8a5cff'], pos: [30, -12, -95], scale: 110, op: 0.4, spin: -0.003 },
  { palette: ['#ff9d45', '#ff5ea8', '#ffd2a1'], pos: [-20, -16, -150], scale: 120, op: 0.45, spin: 0.002 },
  { palette: ['#8a5cff', '#3ddad7', '#4d8dff'], pos: [24, 16, -205], scale: 130, op: 0.42, spin: -0.004 },
  { palette: ['#ff5ea8', '#8a5cff', '#ff9d45'], pos: [-30, 8, -255], scale: 120, op: 0.4, spin: 0.003 },
]

export default function NebulaField() {
  const group = useRef()

  const textures = useMemo(
    () => CLOUDS.map((c) => createNebulaTexture(512, c.palette)),
    []
  )

  useFrame((_, delta) => {
    // the slow inner churn of each cloud
    group.current?.children.forEach((sprite, i) => {
      sprite.material.rotation += CLOUDS[i].spin * delta * 60
    })
  })

  return (
    <group ref={group}>
      {CLOUDS.map((c, i) => (
        <sprite key={i} position={c.pos} scale={[c.scale, c.scale, 1]}>
          <spriteMaterial
            map={textures[i]}
            transparent
            opacity={c.op}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </sprite>
      ))}
    </group>
  )
}
