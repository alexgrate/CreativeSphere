import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Header from './ui/Header'
import Hero from './ui/Hero'
import { useSmoothScroll } from './hooks/useSmoothScroll'
import Impact from './ui/Impact'
import Formats from './ui/Formats'
import Studio from './ui/Studio'
import StartProject from './ui/StartProject'
import NotFound from './ui/NotFound'
import Footer from './ui/Footer'
import { useReveal } from './hooks/useReveal'
import AboutPage from './pages/AboutPage'

function Home() {
  useSmoothScroll()
  useReveal()
  return (
    <>
      <Header />
      <main className="shell">
        <Hero />
        <Impact />
        <Formats />
        <Studio />
        <StartProject />
      </main>
      <div className="ftr-spacer" aria-hidden="true" />
      <Footer />
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path='/about' element={<AboutPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}
