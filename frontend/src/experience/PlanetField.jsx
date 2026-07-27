import { Suspense, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { easing } from 'maath'
import { useTexture } from '@react-three/drei'
import { useApp } from '../stores/useApp'

const PLANETS = [
  { tex: '/textures/planets/jupiter.jpg', r: 0.55, pos: [-4.8, 2.1, -1.6], rim: '#ffd9a8', spin: 0.05 },
  { tex: '/textures/planets/mars.jpg',    r: 0.34, pos: [4.5, 2.3, -1],    rim: '#ff9d6f', spin: 0.12 },
  { tex: '/textures/planets/neptune.jpg', r: 0.42, pos: [-5.0, -1.7, 0],   rim: '#7fa8ff', spin: 0.09 },
  { tex: '/textures/planets/venus.jpg',   r: 0.38, pos: [4.9, -1.5, -0.6], rim: '#ffe1b0', spin: 0.07 },
  { tex: '/textures/planets/mercury.jpg', r: 0.22, pos: [-3.0, 2.8, 0.6],  rim: '#cfd4de', spin: 0.16 },
  { tex: '/textures/planets/moon.jpg',    r: 0.26, pos: [3.1, 3.0, -1.9],  rim: '#dfe4f2', spin: 0.1 },
  { tex: '/textures/planets/mars.jpg',    r: 0.13, pos: [0.8, 3.4, -3],    rim: '#ff9d6f', spin: 0.2 },
]

const rimVertex =  `
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vView = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`
const rimFragment =  `
  uniform vec3 uColor;
  uniform float uOpacity;
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    float rim = pow(1.0 - abs(dot(vNormal, vView)), 3.0);
    gl_FragColor = vec4(uColor, rim * uOpacity);
  }
`

function Planets() {
  const group = useRef()
  const textures = useTexture(PLANETS.map((p) => p.tex))

  const aspect = useThree((s) => s.size.width / s.size.height)
  const fit = THREE.MathUtils.clamp(aspect / 1.7, 0.55, 1)

  const bodyMats = useMemo(
    () =>
      PLANETS.map(
        (p, i) =>
          new THREE.MeshStandardMaterial({
            map: textures[i],
            roughness: 0.95,
            transparent: true,
            opacity: 0,
          })
      ),
    [textures]
  )

  const rimMats = useMemo(
    () =>
      PLANETS.map(
        (p) =>
          new THREE.ShaderMaterial({
            vertexShader: rimVertex,
            fragmentShader: rimFragment,
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
            side: THREE.BackSide,
            uniforms: {
              uColor: { value: new THREE.Color(p.rim) },
              uOpacity: { value: 0 },
            },
          })
      ),
    []
  )

  useFrame((state, delta) => {
    const on = useApp.getState().section === 2
    const t = state.clock.elapsedTime
    if (!group.current) return

    group.current.rotation.y = Math.sin(t * 0.08) * 0.05
    group.current.children.forEach((planet, i) => {
      const p = PLANETS[i]
      planet.position.y = p.pos[1] + Math.sin(t * 0.5 + i * 2.1) * 0.08
      planet.children[0].rotation.y += delta * p.spin
      easing.damp(bodyMats[i], 'opacity', on ? 1 : 0, 0.6, delta)
      easing.damp(rimMats[i].uniforms.uOpacity, 'value', on ? 0.8 : 0, 0.6, delta)
    })
  })

  return (
    <group position={[0, 0.2, -117]} scale={fit}>
      <ambientLight intensity={0.18} />
      <directionalLight position={[-6, 5, 6]} intensity={2.2} />

      <group ref={group}>
        {PLANETS.map((p, i) => (
          <group key={i} position={p.pos}>
            <mesh material={bodyMats[i]}>
              <sphereGeometry args={[p.r, 48, 48]} />
            </mesh>
            <mesh material={rimMats[i]} scale={1.16}>
              <sphereGeometry args={[p.r, 32, 32]} />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  )
}

export default function PlanetField() {
  return (
    <Suspense fallback={null}>
      <Planets />
    </Suspense>
  )
}
