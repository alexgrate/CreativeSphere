import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from 'three'
import { easing } from "maath";
import { useJourney } from "../stores/useJourney";
import { createGlowTexture } from "../utils/glowTexture";
import { TRAVEL_DISTANCE } from "./constants";

const COUNT = 7000

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

        vNear = smoothstep(2.0, 14.0, dist);

        gl_PointSize = min(aSize * uPixelRatio * (200.0 / dist), 40.0 * uPixelRatio);
    }
`

const fragmentShader = `
    uniform float uOpacity;
    varying vec3 vColor;
    varying float vTwinkle;
    varying float vNear;

    void main() {
        float d = distance(gl_PointCoord, vec2(0.5));

        float glow = smoothstep(0.35, 0.0, d);
        float core = smoothstep(0.06, 0.0, d);

        float alpha = (glow * 0.12 + core) * vTwinkle * vNear * uOpacity;
        gl_FragColor = vec4(vColor * (0.6 + 0.4 * vTwinkle), alpha);
    }
`

export function StarField() {
    const mat = useRef()

    const { positions, sizes, colors, phases } = useMemo(() => {
        const positions = new Float32Array(COUNT * 3)
        const sizes = new Float32Array(COUNT)
        const colors = new Float32Array(COUNT * 3)
        const phases = new Float32Array(COUNT)

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
            return { positions, sizes, colors, phases }
        }, [])

        const uniforms = useMemo(
            () => ({
                uTime: { value: 0 },
                uOpacity: { value: 0 },
                uPixelRatio: { value: 1 },
            }),
            []
        )

        useFrame((state, delta) => {
            if (!mat.current) return
            const u = mat.current.uniforms
            u.uTime.value = state.clock.elapsedTime
            u.uPixelRatio.value = state.viewport.dpr

            const { progress } = useJourney.getState()
            const wake = THREE.MathUtils.smoothstep(progress, 0.05, 0.14)
            easing.damp(u.uOpacity, 'value', wake, 0.5, delta)
        })

        return (
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
        )
    }

    export function NebulaHaze() {
        const group = useRef()
        const glow = useMemo(() => createGlowTexture(256), [])
        
        const clouds = useMemo(
            () => [
                { pos: [-30, 10, -80], scale: 90, color: '#1a2a5e', opacity: 0.10 },
                { pos: [40, -15, -140], scale: 120, color: '#3b1f5e', opacity: 0.08 },
                { pos: [0, 25, -200], scale: 140, color: '#12383f', opacity: 0.07 },
            ],
            []
        )

        useFrame((_, delta) => {
            const { progress } = useJourney.getState()
            const wake = THREE.MathUtils.smoothstep(progress, 0.04, 0.16)
            group.current?.children.forEach((sprite, i) => {
            easing.damp(sprite.material, 'opacity', clouds[i].opacity * wake, 0.5, delta)
            })
        })

        return (
            <group ref={group}>
                {clouds.map((c, i) => (
                    <sprite key={i} position={c.pos} scale={[c.scale, c.scale, 1]}>
                        <spriteMaterial 
                            map={glow}
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
