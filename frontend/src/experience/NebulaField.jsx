import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { createNebulaTexture } from '../utils/glowTexture'

// Nebula v2 — living weather, not wallpaper.
// A few nebulae exist at any moment. Each blooms in over ~15s, churns
// for a minute or two, dissolves, and is reborn elsewhere in a new form.
// Different sky every visit; never nebulae everywhere at once.

const SLOTS = 3
const PALETTES = [
  ['#8a5cff', '#ff5ea8', '#4d8dff'], // violet / magenta / blue
  ['#3ddad7', '#4d8dff', '#8a5cff'], // teal / blue / violet
  ['#ff9d45', '#ff5ea8', '#ffd2a1'], // amber / rose / cream
  ['#ff5ea8', '#8a5cff', '#3ddad7'], // magenta / violet / teal
]

const rnd = (a, b) => a + Math.random() * (b - a)
const smooth = (t) => {
  const c = Math.min(Math.max(t, 0), 1)
  return c * c * (3 - 2 * c)
}

function respawn(slot, t, firstBirth = false) {
  const side = Math.random() < 0.5 ? -1 : 1
  slot.pos.set(side * rnd(18, 32), rnd(-16, 18), -rnd(40, 260))
  slot.scale = rnd(80, 145)
  slot.maxOp = rnd(0.45, 0.7)
  slot.life = rnd(50, 100)   // seconds of existence
  slot.fade = rnd(12, 18)    // seconds spent blooming / dissolving
  slot.spin = rnd(-0.006, 0.006)
  // stagger first births so the sky isn't synchronized; some start mid-life
  slot.born = firstBirth ? t - rnd(0, slot.life * 0.7) : t
  slot.texIndex = Math.floor(Math.random() * 6)
}

export default function NebulaField() {
  const group = useRef()

  // a pool of six pre-grown nebula forms (built once, behind the loader)
  const textures = useMemo(
    () =>
      Array.from({ length: 6 }, (_, i) =>
        createNebulaTexture(384, PALETTES[i % PALETTES.length])
      ),
    []
  )

  const slots = useMemo(
    () =>
      Array.from({ length: SLOTS }, () => {
        const s = { pos: new THREE.Vector3() }
        respawn(s, 0, true)
        return s
      }),
    []
  )

  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (!group.current) return

    group.current.children.forEach((sprite, i) => {
      const s = slots[i]
      const age = t - s.born

      // life envelope: bloom in, live, dissolve out — then be reborn elsewhere
      if (age > s.life) {
        respawn(s, t)
        sprite.material.map = textures[s.texIndex]
        sprite.material.needsUpdate = true
        sprite.position.copy(s.pos)
        sprite.scale.set(s.scale, s.scale, 1)
      }

      const born = smooth(age / s.fade)
      const dying = smooth((s.life - age) / s.fade)
      sprite.material.opacity = s.maxOp * Math.min(born, dying)

      // the slow churn
      sprite.material.rotation += s.spin * 0.016
      const breathe = 1 + Math.sin(t * 0.05 + i * 2.4) * 0.04
      sprite.scale.set(s.scale * breathe, s.scale * breathe, 1)
    })
  })

  return (
    <group ref={group}>
      {slots.map((s, i) => (
        <sprite key={i} position={s.pos.toArray()} scale={[s.scale, s.scale, 1]}>
          <spriteMaterial
            map={textures[s.texIndex]}
            transparent
            opacity={0}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </sprite>
      ))}
    </group>
  )
}
