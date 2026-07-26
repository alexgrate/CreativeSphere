import { Canvas } from '@react-three/fiber'
import Experience from './experience/Experience'
import ScrollRig from './journey/ScrollRig'
import DebugHud from './ui/DebugHud'

export default function App() {
  return (
    <>
      <div style={{ position: 'fixed', inset: 0 }}>
        <Canvas camera={{ position: [0, 0.6, 5], fov: 45, rotation: [-0.1, 0, 0] }}>
          <Experience />
        </Canvas>
      </div>

      <ScrollRig />
      <DebugHud />
    </>
  )
}