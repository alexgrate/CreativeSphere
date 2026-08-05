import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Header from './ui/Header'
import Hero from './ui/Hero'
import { useSmoothScroll } from './hooks/useSmoothScroll'
import Impact from './ui/Impact'

function Home() {
  useSmoothScroll()
  return (
    <>
      <Header />
      <main className="shell">
        <Hero />
        <Impact />
      </main>
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="*" element={<Home />} />
      </Routes>
    </BrowserRouter>
  )
}
