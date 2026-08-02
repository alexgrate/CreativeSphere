import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { easing } from 'maath'

const COUNT = 700

export default function WarpStreak() {
    const mat = useRef()
    const prevZ = useRef(5)

    const { positions, tails } = useMemo(() => {
        const positions = new Float32Array(COUNT * 2 * 3)
        const tails = new Float32Array(COUNT * 2)
        for (let i = 0; i < COUNT; i++) {
            const x = (Math.random() - 0.5) * 110
            const y = (Math.random() - 0.5) * 110
            const z = 20 - Math.random() * 340
            for (let k = 0; k < 2; k++) {
                positions[(i * 2 + k) * 3 + 0] = x
                positions[(i * 2 + k) * 3 + 1] = y
                positions[(i * 2 + k) * 3 + 2] = z
                tails[i * 2 + k] = k
            }
        }
        return { positions, tails }
    }, [])

    const uniforms = useMemo(
        () => ({ uStretch: { value: 0 }, uFade: { value: 0 } }),
        []
    )

    useFrame((state, delta) => {
        if (!mat.current) return
        const z = state.camera.position.z
        const vel = (prevZ.current - z) / Math.max(delta, 0.001)
        prevZ.current = z

        const u = mat.current.uniforms
        easing.damp(u.uStretch, 'value', THREE.MathUtils.clamp(vel * 0.28, -11, 11), 0.12, delta)
        easing.damp(u.uFade, 'value', Math.min(Math.abs(vel) / 10, 1), 0.18, delta)
    })

    return (
        <lineSegments frustumCulled={false}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" args={[positions, 3]} />
                <bufferAttribute attach="attributes-aTail" args={[tails, 1]} />
            </bufferGeometry>
            <shaderMaterial
                ref={mat}
                transparent
                depthWrite={false}
                blending={THREE.AdditiveBlending}
                uniforms={uniforms}
                vertexShader={`
                    attribute float aTail;
                    uniform float uStretch;
                    void main() {
                        vec3 p = position;
                        p.z += aTail * uStretch;
                        gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
                    }
                `}
                fragmentShader={`
                    uniform float uFade;
                    void main() {
                        gl_FragColor = vec4(0.35, 0.55, 1.0, 0.7 * uFade);
                    }
                `}
            />
        </lineSegments>
    )
}
