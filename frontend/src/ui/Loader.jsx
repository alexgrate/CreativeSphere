import { useApp } from '../stores/useApp'
import './loader.css'

export default function Loader() {
  const phase = useApp((s) => s.phase)
  return (
    <div className={`loader ${phase === 'ready' ? 'is-done' : ''}`}>
      <img
        className="loader-logo"
        src="/brand/logo-full-white.png"
        alt="The Creative Sphere"
      />
    </div>
  )
}
