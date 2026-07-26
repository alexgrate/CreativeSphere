import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from 'three';
import { easing } from "maath";
import { useJourney } from "../../stores/useJourney";
import { createGlowTexture } from "../../utils/glowTexture";

const COUNT = 500
const GHOSTS = 6
const TOTAL = COUNT * GHOSTS
const TRAIL_GAP = 0.045 

export default function BirthDust() {
    const points = useRef()
    const mat = useRef()
    const glow = useMemo(() => createGlowTexture(), [])

    const specks = useMemo(
        () => 
            Array.from({ length: COUNT }, () => ({
                angle: Math.random() * Math.PI * 2,
                radius: 6 + Math.random() * 8,
                delay: Math.random() * 2.2,
                speed: 0.75 + Math.random() * 0.5,
                wobble: 0.5 + Math.random() * 0.9,
            })),
        []
    )

    const { positions, colors } = useMemo(() => {
        const positions = new Float32Array(TOTAL * 3)
        const colors = new Float32Array(TOTAL * 3)
        for (let i = 0; i < COUNT; i++) {
            for (let k = 0; k < GHOSTS; k++) {
                const j = i * GHOSTS + k
                const b = 1 - k
                colors[j * 3 + 0] = b
                colors[j * 3 + 1] = b * 0.95
                colors[j * 3 + 2] = b * 0.9
            }
        }
        return { positions, colors }
    }, [])

    const placeSpeck = (s, time, out) => {
        let p = ((time - s.delay) * s.speed) / 3.5
        p = Math.min(Math.max(p, 0), 1)
        const eased = p * p * (3 - 2 * p)

        const radius = s.radius * (1 - eased)
        const angle = s.angle + eased * 5

        const calm = 1 - eased
        const wx = Math.sin(time * 0.9 + s.angle * 3.1 + radius * 0.8) * s.wobble * calm
        const wy = Math.cos(time * 1.2 + s.angle * 2.3 + radius * 0.6) * s.wobble * calm

        out.x = Math.cos(angle) * radius + wx
        out.y = Math.sin(angle) * radius * 0.6 + wy
        return p
    }

    const tmp = useMemo(() => ({ x: 0, y: 0 }), [])

    useFrame((state, delta) => {
        const geo = points.current?.geometry
        if (!geo || !mat.current) return
        const t = state.clock.elapsedTime

        let arrived = 0
        for (let i = 0; i < COUNT; i++) {
            const s = specks[i]
            for (let k = 0; k < GHOSTS; k++) {
                const j = i * GHOSTS + k
                const p = placeSpeck(s, t - k * TRAIL_GAP, tmp)
                positions[j * 3 + 0] = tmp.x
                positions[j * 3 + 1] = tmp.y
                positions[j * 3 + 2] = 2
                if (k === 0 && p === 1) arrived++
            }
        }
        geo.attributes.position.needsUpdate = true

        const { birth } = useJourney.getState()
        if (arrived > COUNT * 0.95 && birth === 'gathering') {
            useJourney.setState({ birth: 'born' })
        }
        if (birth === 'born') easing.damp(mat.current, 'opacity', 0, 1.2, delta)
    })

    return (
        <points ref={points}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" args={[positions, 3]} />
                <bufferAttribute attach="attributes-color" args={[colors, 3]} />
            </bufferGeometry>
            <pointsMaterial
                ref={mat}
                side={0.07}
                sizeAttenuation
                map={glow}
                transparent
                opacity={0.7}
                depthWrite={false}
                blending={THREE.AdditiveBlending}
            />
        </points>
    )
}
