import { useEffect } from "react";
import Lenis from 'lenis'
import { useJourney } from "../stores/useJourney";
import { locate } from "./scenes";

export default function ScrollRig() {
    useEffect(() => {
        const lenis = new Lenis({ smoothWheel: true })
        lenis.stop()

        lenis.on('scroll', ({ progress, velocity }) => {
            const { scene, local } = locate(progress)
            useJourney.setState({ 
                progress, 
                velocity,
                sceneId: scene.id,
                sceneTitle: scene.title,
                sceneLocal: local
            })
        })

        let frame
        const raf = (time) => {
            lenis.raf(time)
            if (lenis.isStopped && useJourney.getState().birth === 'born') {
                lenis.start()
            }

            frame = requestAnimationFrame(raf)
        }
        frame = requestAnimationFrame(raf)

        return () => {
            cancelAnimationFrame(frame)
            lenis.destroy()
        }
    }, [])

    return <div style={{ height: '1600vh' }} />
}