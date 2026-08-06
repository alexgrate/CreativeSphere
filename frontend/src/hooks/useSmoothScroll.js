import { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger)

let lenisRef = null

export function useSmoothScroll() {
    useEffect(() => {
        const lenis = new Lenis({ 
            lerp: 0.085,
            wheelMultiplier: 0.9,
            smoothWheel: true,
            syncTouch: false,
        })
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

/* Lenis owns the scroll position, so window.scrollTo would fight it —
   route programmatic jumps through the instance when there is one. */
export function scrollToY(y, duration = 0.9) {
    if (lenisRef) lenisRef.scrollTo(y, { duration })
    else window.scrollTo({ top: y, behavior: 'smooth' })
}

export function lockScroll(locked) {
    if (locked) lenisRef?.stop()
    else lenisRef?.start()
}