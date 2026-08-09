import { useLayoutEffect } from "react"
import { useParams } from "react-router-dom"
import Header from "../ui/Header"
import Footer from "../ui/Footer"
import WorkDetail from "../ui/WorkDetail"
import NotFound from "../ui/NotFound"
import CTA from "../ui/CTA"
import { useWork } from "../lib/api"
import { usePageMeta } from "../hooks/usePageMeta"

export default function WorkDetailPage() {
    const { id } = useParams()
    const { work, ready } = useWork()
    const project = work.find((w) => w.id === id)

    // falls back to the work-page defaults until the project resolves
    usePageMeta({
        title: project && `${project.client} — ${project.title}`,
        description: project && `${project.line} ${project.outcome}`.slice(0, 200),
        path: `/work/${id}`,
        image: project?.hero,
    })

    useLayoutEffect(() => {
        if (!project) return
        document.documentElement.classList.add('page-dark')
        return () => document.documentElement.classList.remove('page-dark')
    }, [project])

    if (ready && !project) return <NotFound />

    return (
        <>
            <Header />
            <main className="shell">
                {project ? (
                    <>
                        <WorkDetail project={project} work={work} />
                        <CTA />
                    </>
                ) : (
                    <div className="wk-wait" />
                )}
            </main>
            <div className="ftr-spacer" aria-hidden="true" />
            <Footer />
        </>
    )
}
