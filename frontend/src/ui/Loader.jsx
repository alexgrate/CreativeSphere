import { useApp } from '../stores/useApp'
import './loader.css'

export default function Loader() {
  const phase = useApp((s) => s.phase)
  return (
    <div className={`loader ${phase === 'ready' ? 'is-done' : ''}`}>
      <span className="loader-wordmark">THE CREATIVE-SPHERE</span>
    </div>
  )
}
