import { useLayoutEffect } from "react"
import Header from "../ui/Header"
import Footer from "../ui/Footer"
import WorkHero from "../ui/WorkHero"
import WorkGrid from "../ui/WorkGrid"
import CTA from "../ui/CTA"

export default function WorkPage() {

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
