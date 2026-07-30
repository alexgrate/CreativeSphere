import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { easing } from 'maath'
import { useApp } from '../stores/useApp'
import { createGlowTexture } from '../utils/glowTexture'

// The Services sphere: the company logo made real — a globe of stars
// where six bright nodes are the six services, and pulses of light
// travel the connections between them. The sphere thinks.

const MINOR = 36
const R = 3.0
const PULSES = 10
const RING_DOTS = 90

const tmpV = new THREE.Vector3()

function ringPositions(radius) {
  const arr = new Float32Array(RING_DOTS * 3)
  for (let i = 0; i < RING_DOTS; i++) {
    const a = (i / RING_DOTS) * Math.PI * 2
    arr[i * 3 + 0] = Math.cos(a) * radius
    arr[i * 3 + 1] = Math.sin(a) * radius
    arr[i * 3 + 2] = 0
  }
  return arr
}

export default function ServiceConstellation() {
  const spin = useRef()
  const minorMat = useRef()
  const lineMat = useRef()
  const pulseMat = useRef()
  const pulsePts = useRef()
  const majorRefs = useRef([])
  const glow = useMemo(() => createGlowTexture(), [])

  const { nodes, majors, edges, linePositions, minorPositions } = useMemo(() => {
    // fibonacci sphere: evenly scattered stars, like the logo mark
    const nodes = []
    const golden = Math.PI * (3 - Math.sqrt(5))
    const total = MINOR + 6
    for (let i = 0; i < total; i++) {
      const y = 1 - (i / (total - 1)) * 2
      const rad = Math.sqrt(1 - y * y)
      const a = golden * i
      nodes.push(new THREE.Vector3(Math.cos(a) * rad * R, y * R, Math.sin(a) * rad * R))
    }

    // six majors, spread evenly around the globe — the services
    const majors = Array.from({ length: 6 }, (_, k) =>
      Math.round(((k + 0.5) * total) / 6)
    )

    // the web: every star reaches its two nearest neighbours
    const edges = []
    const seen = new Set()
    nodes.forEach((p, i) => {
      nodes
        .map((q, j) => ({ j, d: p.distanceTo(q) }))
        .filter((o) => o.j !== i)
        .sort((a, b) => a.d - b.d)
        .slice(0, 2)
        .forEach(({ j }) => {
          const key = i < j ? `${i}-${j}` : `${j}-${i}`
          if (!seen.has(key)) {
            seen.add(key)
            edges.push([i, j])
          }
        })
    })

    const linePositions = new Float32Array(edges.length * 6)
    edges.forEach(([a, b], i) => {
      linePositions.set(nodes[a].toArray(), i * 6)
      linePositions.set(nodes[b].toArray(), i * 6 + 3)
    })

    const majorSet = new Set(majors)
    const minor = []
    nodes.forEach((p, i) => {
      if (!majorSet.has(i)) minor.push(p.x, p.y, p.z)
    })

    return { nodes, majors, edges, linePositions, minorPositions: new Float32Array(minor) }
  }, [])

  // travelling sparks: each rides an edge, arrives, picks another
  const pulses = useMemo(
    () =>
      Array.from({ length: PULSES }, () => ({
        edge: Math.floor(Math.random() * edges.length),
        t: Math.random(),
        speed: 0.5 + Math.random() * 0.7,
      })),
    [edges]
  )
  const pulsePositions = useMemo(() => new Float32Array(PULSES * 3), [])

  // which node index belongs to which of the six services
  const majorSlot = useMemo(() => new Map(majors.map((idx, k) => [idx, k])), [majors])
  const flash = useMemo(() => new Float32Array(6), [])

  const ringA = useRef()
  const ringB = useRef()
  const ringMatA = useRef()
  const ringMatB = useRef()

  useFrame((state, delta) => {
    const { section, hoverService } = useApp.getState()
    const on = section === 1
    const t = state.clock.elapsedTime

    if (spin.current) {
      if (hoverService >= 0) {
        const p = nodes[majors[hoverService]]
        const targetY = -Math.atan2(p.x, p.z)
        const targetX = Math.atan2(p.y, Math.sqrt(p.x * p.x + p.z * p.z))
        const wrap = (a) => Math.atan2(Math.sin(a), Math.cos(a))
        const k = 1 - Math.exp(-delta * 5)
        spin.current.rotation.y += wrap(targetY - spin.current.rotation.y) * k
        spin.current.rotation.x += wrap(targetX - spin.current.rotation.x) * k
      } else {
        spin.current.rotation.y += delta * 0.09
        spin.current.rotation.x = Math.sin(t * 0.2) * 0.12
      }
    }
    if (ringA.current) ringA.current.rotation.z += delta * 0.05
    if (ringB.current) ringB.current.rotation.z -= delta * 0.04

    // the thinking: pulses ride the web; arrivals make services flash
    const geo = pulsePts.current?.geometry
    if (geo) {
      pulses.forEach((p, i) => {
        p.t += delta * p.speed
        if (p.t >= 1) {
          const arrivedAt = edges[p.edge][1]
          const slot = majorSlot.get(arrivedAt)
          if (slot !== undefined) flash[slot] = 1
          p.t = 0
          p.edge = Math.floor(Math.random() * edges.length)
        }
        const [a, b] = edges[p.edge]
        tmpV.lerpVectors(nodes[a], nodes[b], p.t)
        pulsePositions[i * 3 + 0] = tmpV.x
        pulsePositions[i * 3 + 1] = tmpV.y
        pulsePositions[i * 3 + 2] = tmpV.z
      })
      geo.attributes.position.needsUpdate = true
    }

    if (minorMat.current) easing.damp(minorMat.current, 'opacity', on ? 0.7 : 0, 0.6, delta)
    if (lineMat.current) easing.damp(lineMat.current, 'opacity', on ? 0.16 : 0, 0.6, delta)
    if (pulseMat.current) easing.damp(pulseMat.current, 'opacity', on ? 0.9 : 0, 0.6, delta)
    if (ringMatA.current) easing.damp(ringMatA.current, 'opacity', on ? 0.3 : 0, 0.6, delta)
    if (ringMatB.current) easing.damp(ringMatB.current, 'opacity', on ? 0.22 : 0, 0.6, delta)
    majorRefs.current.forEach((sprite, k) => {
      if (!sprite) return
      flash[k] *= Math.exp(-delta * 3)
      const chosen = hoverService === k
      const dimmed = hoverService >= 0 && !chosen
      easing.damp(sprite.material, 'opacity', on ? (dimmed ? 0.4 : 0.95) : 0, 0.6, delta)
      const breath =
        0.5 * (1 + Math.sin(t * 1.3 + k * 1.9) * 0.14) +
        flash[k] * 0.24 +
        (chosen ? 0.45 : 0)
      sprite.scale.set(breath, breath, 1)
    })
  })

  return (
    <group position={[0, 0.3, -62]}>
      <group ref={spin}>
        {/* the lattice of minor stars */}
        <points frustumCulled={false}>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[minorPositions, 3]} />
          </bufferGeometry>
          <pointsMaterial
            ref={minorMat}
            size={0.09}
            sizeAttenuation
            map={glow}
            color="#9fb2e8"
            transparent
            opacity={0}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </points>

        {/* the web */}
        <lineSegments frustumCulled={false}>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[linePositions, 3]} />
          </bufferGeometry>
          <lineBasicMaterial
            ref={lineMat}
            color="#4d8dff"
            transparent
            opacity={0}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </lineSegments>

        {/* the thoughts in transit */}
        <points ref={pulsePts} frustumCulled={false}>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[pulsePositions, 3]} />
          </bufferGeometry>
          <pointsMaterial
            ref={pulseMat}
            size={0.17}
            sizeAttenuation
            map={glow}
            color="#9cc2ff"
            transparent
            opacity={0}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </points>

        {/* the orbits: two counter-rotating rings of fine dust */}
        <group ref={ringA} rotation={[1.25, 0.2, 0]}>
          <points frustumCulled={false}>
            <bufferGeometry>
              <bufferAttribute attach="attributes-position" args={[ringPositions(3.8), 3]} />
            </bufferGeometry>
            <pointsMaterial ref={ringMatA} size={0.05} sizeAttenuation map={glow} color="#8fb1ff" transparent opacity={0} depthWrite={false} blending={THREE.AdditiveBlending} />
          </points>
        </group>
        <group ref={ringB} rotation={[-0.95, -0.35, 0.3]}>
          <points frustumCulled={false}>
            <bufferGeometry>
              <bufferAttribute attach="attributes-position" args={[ringPositions(4.3), 3]} />
            </bufferGeometry>
            <pointsMaterial ref={ringMatB} size={0.045} sizeAttenuation map={glow} color="#cdd8ff" transparent opacity={0} depthWrite={false} blending={THREE.AdditiveBlending} />
          </points>
        </group>

        {/* the six services: bright, breathing, brand-lit */}
        {majors.map((idx, k) => (
          <sprite
            key={k}
            ref={(el) => (majorRefs.current[k] = el)}
            position={nodes[idx].toArray()}
            scale={[0.5, 0.5, 1]}
          >
            <spriteMaterial
              map={glow}
              color={k % 2 ? '#eef2ff' : '#1173ff'}
              transparent
              opacity={0}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
            />
          </sprite>
        ))}
      </group>
    </group>
  )
}
