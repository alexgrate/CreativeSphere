import { useMemo, useRef, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from 'three'
import { easing } from "maath";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import SpiralGalaxy from "./SpiralGalaxy";
import { createGlowTexture } from "../utils/glowTexture";
import HeroOverlay from "../ui/HeroOverlay";
import CursorWake from "./CursorWake";
import { setReady } from "../stores/useApp";
import LoaderSwirl from "./LoaderSwirl";
import Loader from "../ui/Loader";


function AmbientStars({ count = 700 }) {
    const glow = useMemo(() => createGlowTexture(), [])
    const positions = useMemo(() => {
        const arr = new Float32Array(count * 3)
        for (let i = 0; i < count; i++) {
            const r = 40 + Math.random() * 60
            const a = Math.random() * Math.PI * 2
            const b = (Math.random() - 0.5) * Math.PI
            arr[i * 3 + 0] = Math.cos(a) * Math.cos(b) * r
            arr[i * 3 + 1] = Math.sin(b) * r
            arr[i * 3 + 2] = Math.sin(a) * Math.cos(b) * r
        }
        return arr
    }, [count])
    return (
        <points>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" args={[positions, 3]} />
            </bufferGeometry>
            <pointsMaterial size={0.35} sizeAttenuation map={glow} transparent opacity={0.35} depthWrite={false} blending={THREE.AdditiveBlending} />
        </points>
    )
}

function ParallaxRig({ children }) {
    const g = useRef()
    useFrame((state, delta) => {
        if (!g.current) return
        easing.damp(g.current.rotation, 'y', state.pointer.x * 0.08, 0.8, delta)
        easing.damp(g.current.rotation, 'x', -state.pointer.y * 0.05, 0.8, delta)
    })
    return <group ref={g} position={[0, 0, -7]}>{children}</group>
}

export default function HeroPrototype() {
    useEffect(() => {
        const ceremony = new Promise((resolve) => setTimeout(resolve, 2800))
        Promise.all([document.fonts.ready, ceremony]).then(() => setReady())
    }, [])

    return (
        <div style={{ position: 'fixed', inset: 0 }}>
            <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
                <color attach="background" args={['#000004']} />
                <ParallaxRig>
                    <AmbientStars />
                    <SpiralGalaxy />
                </ParallaxRig>
                <CursorWake />
                <LoaderSwirl />
                <EffectComposer>
                    <Bloom intensity={0.55} luminanceThreshold={0.15} luminanceSmoothing={0.9} mipmapBlur />
                    <Vignette offset={0.2} darkness={0.8} />
                </EffectComposer>
            </Canvas>
            <HeroOverlay />
            <Loader />
        </div>
    )
}