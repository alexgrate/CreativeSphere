import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Header from './ui/Header'
import Hero from './ui/Hero'
import { useSmoothScroll } from './hooks/useSmoothScroll'
import About from './ui/About'
import Services from './ui/Services'

function Home() {
  useSmoothScroll()
  return (
    <main className="shell">
      <Header />
      <Hero />
      <About />
      <Services />
    </main>
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
