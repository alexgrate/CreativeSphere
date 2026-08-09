import { useLayoutEffect } from "react"
import Header from "../ui/Header"
import Footer from "../ui/Footer"
import WorkHero from "../ui/WorkHero"
import WorkGrid from "../ui/WorkGrid"
import CTA from "../ui/CTA"
import { useSmoothScroll } from "../hooks/useSmoothScroll"
import { useReveal } from "../hooks/useReveal"

export default function WorkPage() {
    useSmoothScroll()
    useReveal()

    useLayoutEffect(() => {
        document.documentElement.classList.add('page-dark')
        return () => document.documentElement.classList.remove('page-dark')
    }, [])

    return (
        <>
            <Header />
            <main className="shell">
                <WorkHero />
                <WorkGrid />
                <CTA />
            </main>
            <div className="ftr-spacer" aria-hidden="true" />
            <Footer />
        </>
    )
}
