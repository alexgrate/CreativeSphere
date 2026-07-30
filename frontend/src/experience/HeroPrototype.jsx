import { useMemo, useRef, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from 'three'
import { easing } from "maath";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import SpiralGalaxy from "./SpiralGalaxy";
import { StarField } from "./StarField";
import { createGlowTexture } from "../utils/glowTexture";
import HeroOverlay from "../ui/HeroOverlay";
import CursorWake from "./CursorWake";
import { SECTIONS, setReady, setSection, useApp } from "../stores/useApp";
import LoaderSwirl from "./LoaderSwirl";
import Loader from "../ui/Loader";
import Sections from "../ui/Sections";
import WarpStreak from "./WarpStreaks";
import ServiceConstellation from "./ServiceConstellation";
import PlanetField from "./PlanetField";
import ContactMoon from "./ContactMoon";
import { Fluid } from '@whatisjery/react-fluid-distortion'
import SkyEvents from "./SkyEvents";
import { getMood } from "./timeOfDay";


function AmbientStars({ count = 1400, tint = '#ffffff'}) {
    const glow = useMemo(() => createGlowTexture(), [])
    const positions = useMemo(() => {
        const arr = new Float32Array(count * 3)
        for (let i = 0; i < count; i++) {
            arr[i * 3 + 0] = (Math.random() - 0.5) * 120
            arr[i * 3 + 1] = (Math.random() - 0.5) * 120
            arr[i * 3 + 2] = 20 - Math.random() * 340
        }
        return arr
    }, [count])

    return (
        <points>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" args={[positions, 3]} />
            </bufferGeometry>
            <pointsMaterial size={0.35} sizeAttenuation map={glow} transparent opacity={0.35} depthWrite={false} blending={THREE.AdditiveBlending} color={tint} />
        </points>
    )
}

function MoodHaze({ color, opacity }) {
    const glow = useMemo(() => createGlowTexture(256), [])
    const spots = [
        [0, -2, -40],
        [9, 4, -140],
        [-7, 0, -240],
    ]
    return spots.map((pos, i) => (
        <sprite key={i} position={pos} scale={[170, 95, 1]}>
            <spriteMaterial
                map={glow}
                color={color}
                transparent
                opacity={opacity}
                depthWrite={false}
                blending={THREE.AdditiveBlending}
            />
        </sprite>
    ))
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

function WarpRig() {
    const prevZ = useRef(5)
    useFrame((state, delta) => {
        const { section } = useApp.getState()
        easing.damp(state.camera.position, 'z', 5 - section * 55, 0.7, delta)

        const vel = Math.abs(prevZ.current - state.camera.position.z) / Math.max(delta, 0.001)
        prevZ.current = state.camera.position.z
        easing.damp(state.camera, 'fov', 45 + Math.min(vel * 0.28, 15), 0.25, delta)
        state.camera.updateProjectionMatrix()
    })
    return null
}

export default function HeroPrototype() {
    useEffect(() => {
        let alive = true
        let timer
        const ceremony = new Promise((resolve) => { timer = setTimeout(resolve, 2800) })
        Promise.all([document.fonts.ready, ceremony]).then(() => {
            if (alive) setReady()
        })
        return () => {
            alive = false
            clearTimeout(timer)
        }
    }, [])

    useEffect(() => {
        let cooling = false
        const onWheel = (e) => {
            if (cooling || Math.abs(e.deltaY) < 24) return
            const { section, phase } = useApp.getState()
            if (phase !== 'ready') return
            const dir = e.deltaY > 0 ? 1 : -1
            const next = section + dir
            if (next >= 0 && next < SECTIONS.length && next !== section) {
                setSection(next)
                cooling = true
                setTimeout(() => { cooling = false }, 1700)
            }
        }
        window.addEventListener('wheel', onWheel, { passive: true })
        return () => window.removeEventListener('wheel', onWheel)
    }, [])

    useEffect(() => {
        let cooling = false
        let startY = null

        const jump = (dir) => {
            if (cooling) return
            const { section, phase } = useApp.getState()
            if (phase !== 'ready') return
            const next = section + dir
            if (next >= 0 && next < SECTIONS.length){
                setSection(next)
                cooling = true
                setTimeout(() => { cooling = false }, 1700)
            }
        }

        const onTouchStart = (e) => { startY = e.touches[0].clientY }
        const onTouchEnd = (e) => {
            if (startY === null) return
            const delta = startY - e.changedTouches[0].clientY
            if (Math.abs(delta) > 50) jump(delta > 0 ? 1 : -1) // swipe up = travel deeper
            startY = null
        }

        const onKey = (e) => {
            if (e.key === 'ArrowDown' || e.key === 'PageDown') jump(1)
            if (e.key === 'ArrowUp' || e.key === 'PageUp') jump(-1)
        }

        window.addEventListener('touchstart', onTouchStart, { passive: true })
        window.addEventListener('touchend', onTouchEnd, { passive: true })
        window.addEventListener('keydown', onKey)
        return () => {
            window.removeEventListener('touchstart', onTouchStart)
            window.removeEventListener('touchend', onTouchEnd)
            window.removeEventListener('keydown', onKey)
        }
    }, [])

    const enableFluid = useMemo(
        () =>
            window.matchMedia('(hover: hover) and (pointer: fine)').matches &&
            !window.matchMedia('(prefers-reduced-motion: reduce)').matches,
        []
    )

    const mood = useMemo(() => getMood(), [])

    return (
        <div style={{ position: 'fixed', inset: 0 }}>
            <Canvas camera={{ position: [0, 0, 5], fov: 45 }} dpr={[1, 2]}>
                <color attach="background" args={[mood.bg]} />
                <ParallaxRig>
                    <AmbientStars tint={mood.stars} />
                    <StarField />
                    <SpiralGalaxy />
                    <WarpRig />
                </ParallaxRig>
                <ServiceConstellation />
                <PlanetField />
                <SkyEvents />
                <WarpStreak />
                <CursorWake />
                <LoaderSwirl />
                <ContactMoon />
                <EffectComposer multisampling={0}>
                    {enableFluid && (
                        <Fluid
                            rainbow={false}
                            fluidColor="#1173ff"
                            showBackground={false}
                            blend={0}
                            intensity={2}
                            force={1.2}
                            distortion={0.6}
                            radius={0.1}
                            curl={6}
                            swirl={8}
                            velocityDissipation={1}
                            densityDissipation={0.96}
                            pressure={0.8}
                        />
                    )}
                    <Bloom intensity={0.55} luminanceThreshold={0.15} luminanceSmoothing={0.9} mipmapBlur />
                    <Vignette offset={0.2} darkness={0.8} />
                </EffectComposer>
            </Canvas>
            <HeroOverlay />
            <Loader />
            <Sections />
        </div>
    )
}