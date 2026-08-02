import { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger)

let lenisRef = null

export function useSmoothScroll() {
    useEffect(() => {
        const lenis = new Lenis({ duration: 1.1, smoothWheel: true })
        lenisRef = lenis
        lenis.on('scroll', ScrollTrigger.update)
        const tick = (time) => lenis.raf(time * 1000)
        gsap.ticker.add(tick)
        gsap.ticker.lagSmoothing(0)
        return () => {
            gsap.ticker.remove(tick)
            lenis.destroy()
            lenisRef = null
        }
    }, [])
}

export function lockScroll(locked) {
    if (locked) lenisRef?.stop()
    else lenisRef?.start()
}