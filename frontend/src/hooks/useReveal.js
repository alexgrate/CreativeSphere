import { useEffect } from "react";
import gsap from 'gsap'
import ScrollTrigger from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)


export function useReveal() {
    useEffect(() => {
        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
        if (reduce) return

        const ctx = gsap.context(() => {
            ScrollTrigger.batch('[data-reveal]', {
                start: 'top 88%',
                onEnter: (batch) => gsap.fromTo(batch,
                    { y: 36, opacity: 0 },
                    { y: 0, opacity: 1, duration: 1, ease: 'power3.out', stagger: 0.08, overwrite: true }
                ),
            })

            gsap.utils.toArray('.spark').forEach((el) => {
                const tl = gsap.timeline({
                    scrollTrigger: {
                        trigger: el,
                        start: 'top 78%',
                        toggleActions: 'restart none none reset',
                    },
                })

                tl.fromTo(el,
                    { backgroundPosition: '100% 0' },
                    { backgroundPosition: '0% 0', duration: 2, ease: 'power2.inOut' }
                ).fromTo(el,
                    { filter: 'drop-shadow(0 0 0 rgba(13,114,255,0))' },
                    {
                        filter: 'drop-shadow(0 0 20px rgba(13,114,255,0.45))',
                        duration: 1, ease: 'sine.inOut', yoyo: true, repeat: 1,
                    },
                    0
                )
            })

            const wm = document.querySelector('#ftrSpark')
            if (wm) {
                gsap.fromTo(wm,
                    { attr: { gradientTransform: 'translate(-1 0)' } },
                    {
                        attr: { gradientTransform: 'translate(1.2 0)' },
                        duration: 2.6,
                        ease: 'power2.inOut',
                        scrollTrigger: {
                            trigger: '.ftr-spacer',
                            start: 'top 85%',
                            toggleActions: 'restart none none reset',
                        },
                    }
                )
            }
        })

        const t = setTimeout(() => ScrollTrigger.refresh(), 400)
        return () => { clearTimeout(t); ctx.revert() }
    }, [])
}