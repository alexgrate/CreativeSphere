import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { easing } from 'maath'
import { useApp } from '../stores/useApp'

// The Deep Field: the void, alive. Three enormous pools of near-black
// color drift behind everything, and their hues follow the section —
// luminance stays abyssal (the discipline), only the hue breathes.
// Dithered so dark gradients never band.

const PALETTES = [
  ['#131c4d', '#2a1140', '#0a2438'], // hero — indigo / violet / deep sea
  ['#0d2547', '#0a3038', '#1a1650'], // services — blue / teal / indigo
  ['#301040', '#411330', '#141c4a'], // work — violet / magenta / blue
  ['#0a3038', '#0d3b2e', '#101b4d'], // impact — teal / deep green / blue
  ['#2b1c14', '#33141f', '#171040'], // about — warm umber / wine / indigo
  ['#0d1030', '#1b1148', '#082035'], // contact — midnight / violet / abyss
]

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const fragmentShader = /* glsl */ `
  uniform float uTime;
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform vec3 uColorC;
  varying vec2 vUv;

  void main() {
    vec2 uv = vUv;

    // three pools of color, drifting on very slow orbits
    vec2 p1 = vec2(0.30 + 0.16 * sin(uTime * 0.050), 0.62 + 0.11 * cos(uTime * 0.040));
    vec2 p2 = vec2(0.74 + 0.13 * sin(uTime * 0.037 + 2.0), 0.30 + 0.15 * cos(uTime * 0.043 + 1.0));
    vec2 p3 = vec2(0.50 + 0.18 * sin(uTime * 0.028 + 4.0), 0.86 + 0.09 * cos(uTime * 0.050 + 3.0));

    float d1 = exp(-3.2 * distance(uv, p1));
    float d2 = exp(-3.2 * distance(uv, p2));
    float d3 = exp(-3.8 * distance(uv, p3));

    vec3 col = uColorA * d1 + uColorB * d2 + uColorC * d3;

    // dither: a whisper of noise so the dark gradients never band
    float n = fract(sin(dot(uv * vec2(1234.5, 987.6) + uTime * 0.1, vec2(12.9898, 78.233))) * 43758.5453);
    col += (n - 0.5) * 0.012;

    gl_FragColor = vec4(col, 1.0);
  }
`

export default function DeepField() {
  const mesh = useRef()
  const mat = useRef()

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColorA: { value: new THREE.Color(PALETTES[0][0]) },
      uColorB: { value: new THREE.Color(PALETTES[0][1]) },
      uColorC: { value: new THREE.Color(PALETTES[0][2]) },
    }),
    []
  )

  useFrame((state, delta) => {
    if (!mat.current || !mesh.current) return
    const u = mat.current.uniforms
    u.uTime.value = state.clock.elapsedTime

    // the abyss follows the camera, always far behind everything
    mesh.current.position.set(
      state.camera.position.x,
      state.camera.position.y,
      state.camera.position.z - 260
    )

    // hue follows the section, crossfading through the warp
    const pal = PALETTES[useApp.getState().section] ?? PALETTES[0]
    easing.dampC(u.uColorA.value, pal[0], 1.4, delta)
    easing.dampC(u.uColorB.value, pal[1], 1.4, delta)
    easing.dampC(u.uColorC.value, pal[2], 1.4, delta)
  })

  return (
    <mesh ref={mesh} renderOrder={-10} frustumCulled={false}>
      <planeGeometry args={[1150, 540]} />
      <shaderMaterial
        ref={mat}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        depthWrite={false}
        depthTest={false}
      />
    </mesh>
  )
}
