import { Suspense, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { easing } from 'maath'
import { useTexture } from '@react-three/drei'
import { useApp } from '../stores/useApp'

const smooth = (t) => t * t * (3 - 2 * t)
const lerp = THREE.MathUtils.lerp

function Moon() {
  const mesh = useRef()
  const light = useRef()
  const phase = useRef({ p: 0 })
  const texture = useTexture('/textures/planets/moon.jpg')

  const mat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: texture,
        roughness: 1,
        transparent: true,
        opacity: 0,
      }),
    [texture]
  )

  useFrame((state, delta) => {
    const on = useApp.getState().section === 5

    easing.damp(phase.current, 'p', on ? 1 : 0, on ? 1.3 : 0.5, delta)
    const p = phase.current.p

    if (!mesh.current) return

    let y, z, glow
    if (p < 0.5) {
      const a = smooth(p / 0.5)
      y = lerp(-13, -4.2, a)
      z = -272.5
      glow = lerp(2.0, 3.4, a)
    } else {
      const a = smooth((p - 0.5) / 0.5)
      y = lerp(-4.2, -8.4, a)
      z = lerp(-272.5, -278.5, a)
      glow = lerp(3.4, 1.1, a)
    }

    mesh.current.position.set(0, y, z)
    mesh.current.rotation.y += delta * 0.008

    easing.damp(mat, 'opacity', on ? 1 : 0, 0.4, delta)
    if (light.current) light.current.intensity = glow
  })

  return (
    <group>
      <pointLight ref={light} position={[0, 7, -264]} intensity={0} decay={0} />
      <mesh ref={mesh} material={mat} position={[0, -13, -272.5]}>
        <sphereGeometry args={[7, 96, 96]} />
      </mesh>
    </group>
  )
}

export default function ContactMoon() {
  return (
    <Suspense fallback={null}>
      <Moon />
    </Suspense>
  )
}
