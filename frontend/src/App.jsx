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
      <Routes>
        <Route path="/" element={<HeroPrototype />} />
        <Route path="/work" element={<WorkPage />} />
        <Route path="/work/:slug" element={<CaseStudyPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}
