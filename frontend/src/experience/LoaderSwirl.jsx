import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from 'three'
import { easing } from "maath";
import { useApp } from "../stores/useApp";
import { createGlowTexture } from "../utils/glowTexture";

const COUNT = 420
const GHOSTS = 4
const TOTAL = COUNT * GHOSTS
const TRAIL_GAP = 0.05

const GOLD = new THREE.Color('#ffd2a1')
const WHITE = new THREE.Color('#f2f4ff')

const gauss = () => (Math.random() + Math.random() + Math.random() - 1.5) / 1.5

export default function LoaderSwirl() {
    const points = useRef()
    const mat = useRef()
    const release = useRef({ v: 0 })
    const glow = useMemo(() => createGlowTexture(), [])

    const specks = useMemo(
        () => 
            Array.from({ length: COUNT }, () => {
                const r0 = 0.45 + Math.abs(gauss()) * 0.5
                return {
                    r0,
                    angle: Math.random() * Math.PI * 2,
                    speed: 0.55 / r0,
                    wobble: Math.random() * Math.PI * 2,
                    out: 0.7 + Math.random() * 1.8,
                    lum: 0.5 + Math.random() * 0.5,
                }
            }),
        []
    )

    const { positions, colors } = useMemo(() => {
        const positions = new Float32Array(TOTAL * 3)
        const colors = new Float32Array(TOTAL * 3)
        const c = new THREE.Color()
        specks.forEach((s, i) => {
            const warmth = 1 - (s.r0 - 0.45) / 0.5
            for (let k = 0; k < GHOSTS; k++) {
                const j = i * GHOSTS + k
                const fade = 1 - k 
                c.copy(WHITE).lerp(GOLD, warmth * 0.8).multiplyScalar(s.lum * fade)
                colors[j * 3 + 0] = c.r
                colors[j * 3 + 1] = c.g
                colors[j * 3 + 2] = c.b
            }
        })
        return { positions, colors }
    }, [specks])

    useFrame((state, delta) => {
        const geo = points.current?.geometry
        if (!geo || !mat.current) return
        const t = state.clock.elapsedTime
        const { phase } = useApp.getState()

        easing.damp(release.current, 'v', phase === 'ready' ? 1 : 0, 0.9, delta)
        const rel = release.current.v

        specks.forEach((s, i) => {
            for (let k = 0; k < GHOSTS; k++) {
                const j = i * GHOSTS + k
                const time = t - k * TRAIL_GAP

                const angle = s.angle + time * s.speed + rel * 2.5 * s.speed
                const breathe = 1 + Math.sin(time * 2 + s.wobble) * 0.05
                const radius = s.r0 * breathe + rel * s.out * 7
                positions[i * 3 + 0] = Math.cos(angle) * radius
                positions[i * 3 + 1] = Math.sin(angle) * radius * 0.5
                positions[i * 3 + 2] = 0
            }
        })
        geo.attributes.position.needsUpdate = true

        mat.current.opacity = 0.9 * (1 - rel)
    })

    return (
        <group position={[0, 0, 1.5]}>
            <points ref={points} frustumCulled={false}>
                <bufferGeometry>
                    <bufferAttribute attach="attributes-position" args={[positions, 3]} />
                    <bufferAttribute attach="attributes-color" args={[colors, 3]} />
                </bufferGeometry>
                <pointsMaterial
                    ref={mat}
                    size={0.055}
                    sizeAttenuation
                    map={glow}
                    vertexColors
                    transparent
                    opacity={0.9}
                    depthWrite={false}
                    blending={THREE.AdditiveBlending}
                />
            </points>
        </group>
    )
}