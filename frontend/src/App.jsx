import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HeroPrototype from './experience/HeroPrototype'
import WorkPage from './pages/WorkPage'
import CaseStudyPage from './pages/CaseStudyPage'
import ScrollToTop from './ScrollToTop'

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<HeroPrototype />} />
        <Route path="/work" element={<WorkPage />} />
        <Route path="/work/:slug" element={<CaseStudyPage />} />
      </Routes>
    </BrowserRouter>
  )
}
