import { useLayoutEffect } from "react"
import Header from "../ui/Header"
import Footer from "../ui/Footer"
import WorkHero from "../ui/WorkHero"
import WorkGrid from "../ui/WorkGrid"
import CTA from "../ui/CTA"
import { useWork } from "../lib/api"
import { usePageMeta } from "../hooks/usePageMeta"

export default function WorkPage() {
    const { work, ready, error } = useWork()

    usePageMeta({
        title: 'Selected work',
        description: 'Brand, campaign and content work for Nigerian companies that had to be '
                   + 'understood before they could be chosen — banking, FMCG, insurance and energy.',
        path: '/work',
    })

    useLayoutEffect(() => {
        document.documentElement.classList.add('page-dark')
        return () => document.documentElement.classList.remove('page-dark')
    }, [])

    return (
        <>
            <Header />
            <main className="shell">
                {ready ? (
                    <>
                        <WorkHero work={work} />
                        <WorkGrid work={work} />
                    </>
                ) : (
                    <div className="wk-wait">{error && <p>Work is unavailable right now.</p>}</div>
                )}
                <CTA />
            </main>
            <div className="ftr-spacer" aria-hidden="true" />
            <Footer />
        </>
    )
}
