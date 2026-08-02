import { useEffect, useRef, useState } from 'react';

export function useCountUp(target, active, duration = 1600) {
    const [value, setValue] = useState(0)
    const raf = useRef()

    useEffect(() => {
        if (!active) {
            setValue(0)
            return
        }

        const start = performance.now()
        const tick = (now) => {
            const p = Math.min((now - start) / duration, 1)
            const eased = 1 - Math.pow(1 - p, 3)
            setValue(Math.floor(target * eased))
            if (p < 1) raf.current = requestAnimationFrame(tick)
        }
        raf.current = requestAnimationFrame(tick)
        return () => cancelAnimationFrame(raf.current)
    }, [active, target, duration])

    return value
}