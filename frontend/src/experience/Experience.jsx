import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { easing } from 'maath'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'
import { useControls } from 'leva'
import * as THREE from 'three'
import { useJourney } from '../stores/useJourney'
import BirthDust from './scenes/BirthDust'
import BirthSnap from './scenes/BirthSnap'
import IdeaStar from './scenes/IdeaStar'
import { StarField, NebulaHaze } from './StarField'
import { CityLights, HorizonDusk } from './scenes/GroundWorld'
import CursorWake from './CursorWake'
import { ASCENT_END, WORLD_DROP } from './constants'
import CloudLayer from './scenes/CloudLayer'
import StardustHeadline from './scenes/StardustHeadline'
import { railZ } from '../journey/rail'

function CameraRig() {
    useFrame((state, delta) => {
        const { progress } = useJourney.getState()
        const a = Math.min(progress / ASCENT_END, 1)
        
        const targetZ = railZ(progress)

        const up = THREE.MathUtils.smoothstep(a, 0, 0.55)
        const level = THREE.MathUtils.smoothstep(a, 0.55, 1)
        const targetRx = -0.1 + up * 0.28 - level * 0.18

        easing.damp(state.camera.position, 'z', targetZ, 0.25, delta)
        easing.damp(state.camera.rotation, 'x', targetRx, 0.3, delta)
    })
    return null
}

function Sinking({ children }) {
    const g = useRef()
    useFrame((_, delta) => {
        const { progress } = useJourney.getState()
        const a = Math.min(progress / ASCENT_END, 1)
        const e = a * a * (3 - 2 * a)
        if (g.current) easing.damp(g.current.position, 'y', -e * WORLD_DROP, 0.3, delta)
    })
    return <group ref={g}>{children}</group>
}

const INDIGO = new THREE.Color('#070b18')
const SPACE = new THREE.Color('#000004')
const skyTmp = new THREE.Color()

function SkyMood() {
    useFrame((state, delta) => {
        const { progress, birth } = useJourney.getState()
        if (birth !== 'born') {
            easing.dampC(state.scene.background, '#000000', 1.5, delta)
            return
        }
        const alt = THREE.MathUtils.smoothstep(progress, 0.02, 0.13)
        skyTmp.copy(INDIGO).lerp(SPACE, alt)
        easing.dampC(state.scene.background, skyTmp, 0.8, delta)
    })
    return null
}

export default function Experience() {
    const { intensity, threshold } = useControls('bloom', {
        intensity: { value: 0.8, min: 0, max: 3, step: 0.05 },
        threshold: { value: 0.1, min: 0, max: 1, step: 0.01 },
    })

    return (
        <>
        <color attach="background" args={['#000000']} />
        <SkyMood />

        <CameraRig />
        <StarField/>
        <NebulaHaze />
        <Sinking>
            <CityLights />
            <HorizonDusk />
            <CloudLayer />
        </Sinking>

        <StardustHeadline />

        <group position={[0, 0.4, -5]}>
            <BirthDust />
            <BirthSnap />
        </group>

        <IdeaStar />

        <CursorWake />

        <EffectComposer>
            <Bloom intensity={intensity} luminanceThreshold={threshold} luminanceSmoothing={0.9} mipmapBlur />
            <Vignette offset={0.2} darkness={0.85} />
        </EffectComposer>
        </>
    )
}
