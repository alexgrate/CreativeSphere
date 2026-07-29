import { useRef } from 'react'

export default function Magnetic({ children, strength = 18 }) {
  const ref = useRef()

  const onMove = (e) => {
    const r = ref.current.getBoundingClientRect()
    const x = e.clientX - (r.left + r.width / 2)
    const y = e.clientY - (r.top + r.height / 2)
    ref.current.style.transform = `translate(${(x / r.width) * strength}px, ${(y / r.height) * strength}px)`
  }
  const onLeave = () => {
    ref.current.style.transform = 'translate(0px, 0px)'
  }

  return (
    <span ref={ref} className="magnetic" onPointerMove={onMove} onPointerLeave={onLeave}>
      {children}
    </span>
  )
}
