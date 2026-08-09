import { useLayoutEffect } from "react"
import { useParams } from "react-router-dom"
import Header from "../ui/Header"
import Footer from "../ui/Footer"
import WorkDetail from "../ui/WorkDetail"
import NotFound from "../ui/NotFound"
import CTA from "../ui/CTA"
import { WORK } from "../content/site"
import { useSmoothScroll } from "../hooks/useSmoothScroll"

export default function WorkDetailPage() {
    const { id } = useParams()
    const project = WORK.find((w) => w.id === id)

    /* Same dark room as the index. Declared before the early return would
       break the rules of hooks, so the guard lives inside the effect. */
    useLayoutEffect(() => {
        if (!project) return
        document.documentElement.classList.add('page-dark')
        return () => document.documentElement.classList.remove('page-dark')
    }, [project])

    useSmoothScroll()

    if (!project) return <NotFound />

    return (
        <>
            <Header />
            <main className="shell">
                <WorkDetail project={project} />
                <CTA />
            </main>
            <div className="ftr-spacer" aria-hidden="true" />
            <Footer />
        </>
    )
}
