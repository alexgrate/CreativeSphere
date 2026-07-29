import { useEffect, useRef } from 'react'
import './cursor.css'

export default function Cursor() {
  const ring = useRef()

  useEffect(() => {
    const pos = { x: -100, y: -100 }
    const ringPos = { x: -100, y: -100 }
    let raf

    const onMove = (e) => {
      pos.x = e.clientX
      pos.y = e.clientY
      const hot = e.target.closest?.('a, button, [data-hot]')
      ring.current?.classList.toggle('is-hot', !!hot)
    }

    const tick = () => {
      ringPos.x += (pos.x - ringPos.x) * 0.16
      ringPos.y += (pos.y - ringPos.y) * 0.16
      if (ring.current) ring.current.style.transform = `translate(${ringPos.x}px, ${ringPos.y}px)`
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    window.addEventListener('pointermove', onMove)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', onMove)
    }
  }, [])

  return <div ref={ring} className="cursor-ring" />
}
