import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Header from './ui/Header'
import Hero from './ui/Hero'
import { useSmoothScroll } from './hooks/useSmoothScroll'
import Approach from './ui/Approach'
import Formats from './ui/Formats'
import Studio from './ui/Studio'
import StartProject from './ui/StartProject'
import NotFound from './ui/NotFound'
import Loader from './ui/Loader'
import Footer from './ui/Footer'
import { useReveal } from './hooks/useReveal'
import AboutPage from './pages/AboutPage'
import ServicesPage from './pages/ServicesPage'
import ContactPage from './pages/ContactPage'

function Home() {
  useSmoothScroll()
  useReveal()
  return (
    <>
      <Header />
      <main className="shell">
        <Hero />
        <Approach />
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
      <Loader />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path='/about' element={<AboutPage />} />
        <Route path='/services' element={<ServicesPage />} />
        <Route path='/contact' element={<ContactPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}
