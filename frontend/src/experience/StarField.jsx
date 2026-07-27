import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from 'three'
import { easing } from "maath";
import { useJourney } from "../stores/useJourney";
import { createGlowTexture } from "../utils/glowTexture";
import { TRAVEL_DISTANCE } from "./constants";

const COUNT = 14000
const SECONDARY_COUNT = 8000
const STAR_TINT_A = new THREE.Color('#7c8cff')
const STAR_TINT_B = new THREE.Color('#ffd2a1')

const vertexShader = `
    uniform float uTime;
    uniform float uPixelRatio;
    attribute float aSize;
    attribute vec3 aColor;
    attribute float aPhase;
    varying vec3 vColor;
    varying float vTwinkle;
    varying float vNear;

    void main() {
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_Position = projectionMatrix * mvPosition;

        vTwinkle = 0.72 + 0.28 * sin(uTime * (0.4 + aPhase * 1.6) + aPhase * 40.0);

        vColor = aColor;

        float dist = -mvPosition.z;

        vNear = smoothstep(1.5, 20.0, dist);

        gl_PointSize = min(aSize * uPixelRatio * (220.0 / dist), 50.0 * uPixelRatio);
    }
`

const fragmentShader = `
    uniform float uOpacity;
    uniform vec3 uTint;
    varying vec3 vColor;
    varying float vTwinkle;
    varying float vNear;

    void main() {
        float d = distance(gl_PointCoord, vec2(0.5));

        float glow = smoothstep(0.35, 0.0, d);
        float core = smoothstep(0.06, 0.0, d);

        float alpha = (glow * 0.12 + core) * vTwinkle * vNear * uOpacity;
        vec3 color = vColor * (0.6 + 0.4 * vTwinkle);
        color = mix(color, uTint, 0.18);
        gl_FragColor = vec4(color, alpha);
    }
`

export function StarField() {
    const mat = useRef()
    const mat2 = useRef()

    const { positions, sizes, colors, phases, positions2, sizes2, colors2, phases2 } = useMemo(() => {
        const positions = new Float32Array(COUNT * 3)
        const sizes = new Float32Array(COUNT)
        const colors = new Float32Array(COUNT * 3)
        const phases = new Float32Array(COUNT)

        const positions2 = new Float32Array(SECONDARY_COUNT * 3)
        const sizes2 = new Float32Array(SECONDARY_COUNT)
        const colors2 = new Float32Array(SECONDARY_COUNT * 3)
        const phases2 = new Float32Array(SECONDARY_COUNT)

        const palette = [
            new THREE.Color('#a9c4ff'),
            new THREE.Color('#f4f2ff'),
            new THREE.Color('#fff2df'),
            new THREE.Color('#ffd9c9'),
        ]

        for (let i = 0; i < COUNT; i++) {
            positions[i * 3 + 0] = (Math.random() - 0.5) * 140
            positions[i * 3 + 1] = (Math.random() - 0.5) * 140
            positions[i * 3 + 2] = 15 - Math.random() * (TRAVEL_DISTANCE + 80)

            sizes[i] = 1.4 + Math.pow(Math.random(), 9.0) * 16.0

            const c = palette[Math.floor(Math.random() * palette.length)]
            colors[i * 3 + 0] = c.r
            colors[i * 3 + 1] = c.g
            colors[i * 3 + 2] = c.b

            phases[i] = Math.random()
        }

        for (let i = 0; i < SECONDARY_COUNT; i++) {
            positions2[i * 3 + 0] = (Math.random() - 0.5) * 130
            positions2[i * 3 + 1] = (Math.random() - 0.5) * 130
            positions2[i * 3 + 2] = -10 - Math.random() * (TRAVEL_DISTANCE + 120)

            sizes2[i] = 0.8 + Math.pow(Math.random(), 20.0) * 9.0

            const c = palette[Math.floor(Math.random() * palette.length)]
            colors2[i * 3 + 0] = c.r * 0.75
            colors2[i * 3 + 1] = c.g * 0.75
            colors2[i * 3 + 2] = c.b * 0.75

            phases2[i] = Math.random()
        }

        return { positions, sizes, colors, phases, positions2, sizes2, colors2, phases2 }
    }, [])

    const uniforms = useMemo(
        () => ({
            uTime: { value: 0 },
            uOpacity: { value: 0.5 },
            uPixelRatio: { value: 1 },
            uTint: { value: new THREE.Color('#7c8cff') },
        }),
        []
    )

    const uniforms2 = useMemo(
        () => ({
            uTime: { value: 0 },
            uOpacity: { value: 0.4 },
            uPixelRatio: { value: 1 },
            uTint: { value: new THREE.Color('#ffd2a1') },
        }),
        []
    )

    useFrame((state, delta) => {
        if (!mat.current || !mat2.current) return
            const u = mat.current.uniforms
            const u2 = mat2.current.uniforms

            u.uTime.value = u2.uTime.value = state.clock.elapsedTime
            u.uPixelRatio.value = u2.uPixelRatio.value = state.viewport.dpr

            const tintPhase = 0.54 + 0.46 * Math.sin(state.clock.elapsedTime * 0.12)
            u.uTint.value.copy(STAR_TINT_A).lerp(STAR_TINT_B, tintPhase)
            u2.uTint.value.copy(STAR_TINT_B).lerp(STAR_TINT_A, 1.0 - tintPhase)

            const { progress } = useJourney.getState()
            const wake = THREE.MathUtils.smoothstep(progress, 0.05, 0.14)
            const base = 0.55
            easing.damp(u.uOpacity, 'value', base + wake * 0.5, 0.5, delta)
            easing.damp(u2.uOpacity, 'value', base * 0.8 + wake * 0.4, 0.6, delta)
        })

        return (
            <group>
                <points>
                    <bufferGeometry>
                        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
                        <bufferAttribute attach="attributes-aSize" args={[sizes, 1]} />
                        <bufferAttribute attach="attributes-aColor" args={[colors, 3]} />
                        <bufferAttribute attach="attributes-aPhase" args={[phases, 1]} />
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
                <points>
                    <bufferGeometry>
                        <bufferAttribute attach="attributes-position" args={[positions2, 3]} />
                        <bufferAttribute attach="attributes-aSize" args={[sizes2, 1]} />
                        <bufferAttribute attach="attributes-aColor" args={[colors2, 3]} />
                        <bufferAttribute attach="attributes-aPhase" args={[phases2, 1]} />
                    </bufferGeometry>
                    <shaderMaterial 
                        ref={mat2}
                        vertexShader={vertexShader}
                        fragmentShader={fragmentShader}
                        uniforms={uniforms2}
                        transparent
                        depthWrite={false}
                        blending={THREE.AdditiveBlending}
                    />
                </points>
            </group>
        )
    }

    export function NebulaHaze() {
        const group = useRef()
        const glow = useMemo(() => createGlowTexture(256), [])
        const glowTint = useMemo(() => createGlowTexture(220, '#7c8cff'), [])
        const glowWarm = useMemo(() => createGlowTexture(220, '#ffd2a1'), [])
        
        const clouds = useMemo(
            () => [
                { pos: [-24, 12, -75], scale: 90, map: glowTint, color: '#7c8cff', opacity: 0.12 },
                { pos: [36, -18, -130], scale: 120, map: glowWarm, color: '#ffd2a1', opacity: 0.1 },
                { pos: [0, 22, -200], scale: 160, map: glow, color: '#8f9dff', opacity: 0.08 },
                { pos: [-18, -6, -180], scale: 100, map: glow, color: '#44fac8', opacity: 0.06 },
                { pos: [18, 6, -100], scale: 110, map: glowTint, color: '#7c8cff', opacity: 0.09 },
            ],
            []
        )

        useFrame((_, delta) => {
            const { progress } = useJourney.getState()
            const wake = THREE.MathUtils.smoothstep(progress, 0.02, 0.16)
            group.current?.children.forEach((sprite, i) => {
                easing.damp(sprite.material, 'opacity', clouds[i].opacity * wake, 0.5, delta)
            })
        })

        return (
            <group ref={group}>
                {clouds.map((c, i) => (
                    <sprite key={i} position={c.pos} scale={[c.scale, c.scale, 1]}>
                        <spriteMaterial 
                            map={c.map}
                            color={c.color}
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
