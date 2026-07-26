import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from 'three'
import { createGlowTexture } from "../utils/glowTexture";

const POOL = 300
const SPAWN_DIST = 8
const DRAG = 0.94
const LIFE = 1.1

export default function CursorWake() {
    const points = useRef()
    const glow = useMemo(() => createGlowTexture(), [])

    const pool = useMemo(() => ({
        positions: new Float32Array(POOL * 3),
        colors: new Float32Array(POOL * 3),
        velocities: new Float32Array(POOL * 3),
        life: new Float32Array(POOL),
        next: 0,
    }), [])

    const tmp = useMemo(() => ({
        now: new THREE.Vector3(),
        prev: new THREE.Vector3(),
        dir: new THREE.Vector3(),
        hasPrev: false,
    }), [])

    useFrame((state, delta) => {
        const geo = points.current?.geometry
        if (!geo) return
        const { positions, colors, velocities, life } = pool

        tmp.dir.set(state.pointer.x, state.pointer.y, 0.5).unproject(state.camera)
        tmp.dir.sub(state.camera.position).normalize()
        tmp.now.copy(state.camera.position).addScaledVector(tmp.dir, SPAWN_DIST)

        if (tmp.hasPrev) {
            const speed = tmp.now.distanceTo(tmp.prev)
            const count = Math.min(Math.floor(speed * 18), 6)
            for (let n = 0; n < count; n++) {
                const i = pool.next
                pool.next = (pool.next + 1) % POOL  

                positions[i * 3 + 0] = tmp.now.x
                positions[i * 3 + 1] = tmp.now.y
                positions[i * 3 + 2] = tmp.now.z

                velocities[i * 3 + 0] = (tmp.now.x - tmp.prev.x) * 6 + (Math.random() - 0.5) * 0.6
                velocities[i * 3 + 1] = (tmp.now.y - tmp.prev.y) * 6 + (Math.random() - 0.5) * 0.6
                velocities[i * 3 + 2] = (tmp.now.z - tmp.prev.z) * 6 + (Math.random() - 0.5) * 0.6

                life[i] = LIFE
            }
        }
        tmp.prev.copy(tmp.now)
        tmp.hasPrev = true

        for (let i = 0; i < POOL; i++) {
            if (life[i] <= 0) {
                colors[i * 3] = colors[i * 3 + 1] = colors[i * 3 + 2] = 0  
                continue
            }
            life[i] -= delta

            positions[i * 3 + 0] += velocities[i * 3 + 0] * delta
            positions[i * 3 + 1] += velocities[i * 3 + 1] * delta
            positions[i * 3 + 2] += velocities[i * 3 + 2] * delta

            velocities[i * 3 + 0] *= DRAG
            velocities[i * 3 + 1] *= DRAG
            velocities[i * 3 + 2] *= DRAG

            const b = Math.max(life[i] / LIFE, 0)
            colors[i * 3 + 0] = b
            colors[i * 3 + 1] = b * 0.92
            colors[i * 3 + 2] = b * 0.85
        }

        geo.attributes.position.needsUpdate = true
        geo.attributes.color.needsUpdate = true
    })

    return (
        <points ref={points} frustumCulled={false}>
        <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[pool.positions, 3]} />
            <bufferAttribute attach="attributes-color" args={[pool.colors, 3]} />
        </bufferGeometry>
        <pointsMaterial
            size={0.12}
            sizeAttenuation
            map={glow}
            vertexColors
            transparent
            depthWrite={false}
            blending={THREE.AdditiveBlending}
        />
        </points>
    )
}