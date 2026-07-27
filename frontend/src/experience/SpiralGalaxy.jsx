import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { easing } from 'maath'
import { useApp } from '../stores/useApp'

const COUNT = 34000
const ARMS = 2
const GALAXY_TINT_A = new THREE.Color('#7c8cff')
const GALAXY_TINT_B = new THREE.Color('#ffd2a1')
const RADIUS = 4.6
const TWIST = 10.0          
const THICKNESS = 0.2
const KNOTS = 150          

const GOLD = new THREE.Color('#ffd2a1')
const CREAM = new THREE.Color('#fff1dc')
const WHITE = new THREE.Color('#f2f4ff')
const BLUE = new THREE.Color('#bcc9ff')

const gauss = () => (Math.random() + Math.random() + Math.random() - 1.5) / 1.5

const vertexShader = `
    uniform float uTime;
    uniform float uPixelRatio;
    uniform float uWave;
    uniform vec3 uOrigin;
    uniform float uAmp;
    attribute float aSize;
    attribute vec3 aColor;
    attribute float aPhase;
    attribute vec3 aDir;
    varying vec3 vColor;
    varying float vTwinkle;

    void main() {
        // the unleash ripple: stars fly only when the wave reaches them
        float distFromClick = distance(position, uOrigin);
        float waveRadius = uWave * 11.0;
        float hit = clamp((waveRadius - distFromClick) / 2.6, 0.0, 1.0);
        hit = hit * hit * (3.0 - 2.0 * hit);

        vec3 displaced = position + aDir * hit * uAmp;

        vec4 mvPosition = modelViewMatrix * vec4(displaced, 1.0);
        gl_Position = projectionMatrix * mvPosition;
        vTwinkle = 0.8 + 0.2 * sin(uTime * (0.4 + aPhase * 1.6) + aPhase * 40.0);
        vColor = aColor;
        gl_PointSize = min(aSize * uPixelRatio * (90.0 / -mvPosition.z), 16.0 * uPixelRatio);
    }
`

const fragmentShader = `
    uniform float uReveal;
    uniform vec3 uTint;
    varying vec3 vColor;
    varying float vTwinkle;
    void main() {
        float d = distance(gl_PointCoord, vec2(0.5));
        float glow = smoothstep(0.3, 0.0, d);
        float core = smoothstep(0.055, 0.0, d);
        float alpha = (glow * 0.06 + core) * vTwinkle * uReveal;
        vec3 color = vColor * (0.75 + 0.25 * vTwinkle);
        color = mix(color, uTint, 0.22);
        gl_FragColor = vec4(color, alpha);
    }
`

export default function SpiralGalaxy() {
    const spin = useRef()
    const mat = useRef()
    const burst = useRef({ v: 0, target: 0 })

    const aspect = useThree((s) => s.size.width / s.size.height)
    const fit = THREE.MathUtils.clamp(aspect / 2.0, 0.45, 0.7)

    const { positions, sizes, colors, phases, dirs } = useMemo(() => {
        const positions = new Float32Array(COUNT * 3)
        const sizes = new Float32Array(COUNT)
        const colors = new Float32Array(COUNT * 3)
        const phases = new Float32Array(COUNT)
        const dirs = new Float32Array(COUNT * 3)
        const c = new THREE.Color()

        const knots = Array.from({ length: KNOTS }, () => ({
            t: Math.pow(Math.random(), 1.25),
            arm: Math.floor(Math.random() * ARMS),
        }))

        for (let i = 0; i < COUNT; i++) {
            let x, y, z
            const kind = Math.random()

            if (kind < 0.16) {
                const r = Math.abs(gauss()) * 0.5
                const a = Math.random() * Math.PI * 2
                const b = (Math.random() - 0.5) * Math.PI
                x = Math.cos(a) * Math.cos(b) * r
                y = Math.sin(b) * r * 0.35
                z = Math.sin(a) * Math.cos(b) * r

                c.copy(GOLD).lerp(CREAM, r / 0.5)
                c.multiplyScalar(0.75 + Math.random() * 0.45)
                sizes[i] = 0.6 + Math.pow(Math.random(), 5.0) * 4.0
            } else if (kind < 0.22) {
                const t = Math.random()
                const radius = Math.sqrt(t) * RADIUS * 1.05
                const a = Math.random() * Math.PI * 2
                x = Math.cos(a) * radius
                y = gauss() * THICKNESS
                z = Math.sin(a) * radius

                c.copy(WHITE).multiplyScalar(0.12 + Math.random() * 0.12)
                sizes[i] = 0.4 + Math.random() * 0.25
            } else {
                let t
                let arm
                if (Math.random() < 0.65) {
                    const k = knots[Math.floor(Math.random() * KNOTS)]
                    t = THREE.MathUtils.clamp(k.t + gauss() * 0.025, 0, 1)
                    arm = k.arm
                } else {
                    t = Math.pow(Math.random(), 1.25)
                    arm = i % ARMS
                }
                const radius = 0.3 + t * (RADIUS - 0.3)
                const spread = (1 - t * t) * 0.16 + 0.035
                const angle = arm * Math.PI + t * TWIST + gauss() * spread * 1.6
                x = Math.cos(angle) * radius
                y = gauss() * THICKNESS * (1 - t * 0.7)
                z = Math.sin(angle) * radius

                if (Math.random() < 0.16) {
                    c.copy(GOLD).lerp(CREAM, Math.random())
                } else {
                    c.copy(CREAM)
                        .lerp(WHITE, Math.min(t * 4.0, 1))
                        .lerp(BLUE, Math.min(Math.max((t - 0.15) / 0.5, 0), 1) * 0.8)
                }
                const lum = Math.random() < 0.18 ? 0.9 + Math.random() * 0.5 : 0.34 + Math.random() * 0.38
                c.multiplyScalar(lum)
                sizes[i] = 0.65 + Math.pow(Math.random(), 12.0) * 7.0
            }

            positions[i * 3 + 0] = x
            positions[i * 3 + 1] = y
            positions[i * 3 + 2] = z

            colors[i * 3 + 0] = c.r
            colors[i * 3 + 1] = c.g
            colors[i * 3 + 2] = c.b

            phases[i] = Math.random()

            const len = Math.hypot(x, z) || 1
            const push = 0.6 + Math.random() * 1.2
            const swirl = 0.5 + Math.random() * 0.9
            dirs[i * 3 + 0] = (x / len) * push + (-z / len) * swirl + gauss() * 0.25
            dirs[i * 3 + 1] = gauss() * 0.3
            dirs[i * 3 + 2] = (z / len) * push + (x / len) * swirl + gauss() * 0.25
        }
        return { positions, sizes, colors, phases, dirs }
    }, [])

    const uniforms = useMemo(
        () => ({
            uTime: { value: 0 },
            uPixelRatio: { value: 1 },
            uWave: { value: 0 },
            uOrigin: { value: new THREE.Vector3() },
            uAmp: { value: 2.0 },
            uReveal: { value: 0 },
            uTint: { value: new THREE.Color('#7c8cff') },
        }),
        []
    )

    const unleash = (e) => {
        e.stopPropagation()
        if (spin.current && mat.current) {
            const local = spin.current.worldToLocal(e.point.clone())
            mat.current.uniforms.uOrigin.value.copy(local)
        }
        burst.current.target = 1
    }

    useFrame((state, delta) => {
        if (mat.current) {
            const u = mat.current.uniforms
            u.uTime.value = state.clock.elapsedTime
            u.uPixelRatio.value = state.viewport.dpr

            const tintPhase = 0.5 + 0.5 * Math.sin(state.clock.elapsedTime * 0.08)
            u.uTint.value.copy(GALAXY_TINT_A).lerp(GALAXY_TINT_B, tintPhase)

            const b = burst.current
            easing.damp(b, 'v', b.target, b.target === 1 ? 0.9 : 3.4, delta)
            if (b.target === 1 && b.v > 0.92) b.target = 0
            u.uWave.value = b.v

            easing.damp(u.uReveal, 'value', useApp.getState().phase === 'ready' ? 1 : 0, 1.2, delta)
            if (b.target === 1 && b.v > 0.92) b.target = 0
            u.uWave.value = b.v
        }
        if (spin.current) spin.current.rotation.y += delta * 0.03
    })

    return (
        <group rotation={[0.42, 0, 0.25]} scale={fit}>
            <group ref={spin}>
                <points frustumCulled={false}>
                    <bufferGeometry>
                        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
                        <bufferAttribute attach="attributes-aSize" args={[sizes, 1]} />
                        <bufferAttribute attach="attributes-aColor" args={[colors, 3]} />
                        <bufferAttribute attach="attributes-aPhase" args={[phases, 1]} />
                        <bufferAttribute attach="attributes-aDir" args={[dirs, 3]} />
                    </bufferGeometry>
                    <shaderMaterial
                        ref={mat}
                        vertexShader={vertexShader}
                        fragmentShader={fragmentShader}
                        uniforms={uniforms}
                        transparent
                        depthWrite={false}
                        blending={THREE.AdditiveBlending}
                    />
                </points>

                <mesh
                    rotation={[-Math.PI / 2, 0, 0]}
                    onClick={unleash}
                    onPointerOver={() => (document.body.style.cursor = 'pointer')}
                    onPointerOut={() => (document.body.style.cursor = 'auto')}
                >
                    <circleGeometry args={[RADIUS * 1.05, 48]} />
                    <meshBasicMaterial transparent opacity={0} depthWrite={false} />
                </mesh>
            </group>
        </group>
    )
}
