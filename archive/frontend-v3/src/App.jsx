import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HeroPrototype from './experience/HeroPrototype'
import WorkPage from './pages/WorkPage'
import CaseStudyPage from './pages/CaseStudyPage'
import NotFound from './pages/NotFound'
import ScrollToTop from './ScrollToTop'
import Cursor from './ui/Cursor'

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <div className="grain" />
      <Cursor />
      {/* the sphere never unmounts — pages overlay it, so returning is instant */}
      <HeroPrototype />
      <Routes>
        <Route path="/" element={null} />
        <Route path="/work" element={<WorkPage />} />
        <Route path="/work/:slug" element={<CaseStudyPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}
