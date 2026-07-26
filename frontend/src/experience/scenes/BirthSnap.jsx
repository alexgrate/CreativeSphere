import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from 'three'
import { useJourney } from "../../stores/useJourney";
import { createGlowTexture } from "../../utils/glowTexture";

export default function BirthSnap() {
    const flash = useRef()
    const ring = useRef()
    const bornAt = useRef(null)
    const glow = useMemo(() => createGlowTexture(), [])

    useFrame((state) => {
        const { birth } = useJourney.getState()
        if (birth !== 'born') return

        if (bornAt.current === null) bornAt.current = state.clock.elapsedTime
        const age = state.clock.elapsedTime - bornAt.current

        if (flash.current) {
            const f = Math.max(1 - age / 0.35, 0)
            flash.current.material.opacity = f * f
            const s = 6 + age * 10
            flash.current.scale.set(s, s, 1)
        }

        if (ring.current) {
            const r = Math.min(age / 1.5, 1)
            const eased = 1 - Math.pow(1 - r, 3)
            const s = 0.3 + eased * 9
            ring.current.scale.set(s, s, 1)
            ring.current.material.opacity = (1 - eased) * 0.5
        }
    })

    return (
        <group position={[0, 0, 2]} >
            <sprite ref={flash} scale={[0, 0, 1]}>
                <spriteMaterial map={glow} transparent opacity={0} depthWrite={false} blending={THREE.AdditiveBlending} />
            </sprite>
            <mesh ref={ring}>
                <ringGeometry args={[0.95, 1, 96]} />
                <meshBasicMaterial color='#cfd8ff' transparent opacity={0} side={THREE.DoubleSide} depthWrite={false} blending={THREE.AdditiveBlending} />
            </mesh>
        </group>
    )
}