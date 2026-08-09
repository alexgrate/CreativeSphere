import { useLayoutEffect } from 'react'

const SITE = 'The Creative Sphere'
const ORIGIN = 'https://dcreativesphere.com'

const DEFAULT_TITLE = `${SITE} — Brand, campaign and content studio in Lagos`
const DEFAULT_DESCRIPTION =
    'A Lagos creative studio building brands, campaigns and content for companies that ' +
    'have to be understood before they can be chosen.'
const DEFAULT_IMAGE = `${ORIGIN}/brand/og-image.png`

const tag = (selector, create) => {
    let el = document.head.querySelector(selector)
    if (!el) {
        el = create()
        document.head.appendChild(el)
    }
    return el
}

const meta = (name, content, property = false) => {
    const attr = property ? 'property' : 'name'
    tag(`meta[${attr}="${name}"]`, () => {
        const el = document.createElement('meta')
        el.setAttribute(attr, name)
        return el
    }).setAttribute('content', content)
}

/**
 * Sets the title and the meta a crawler reads, per route.
 *
 * Bear in mind this is a client-rendered app: Google renders JavaScript and will
 * see these, but the social scrapers behind link previews do not. Those always
 * use the static values in index.html, whichever page was shared.
 *
 * @param title       page-specific part; omit on the home page
 * @param description one or two sentences, ideally under ~155 characters
 * @param path        route path, for the canonical URL
 * @param image       absolute URL, when a page has a better image than the default
 * @param noindex     keep this route out of search results
 */
export function usePageMeta({ title, description, path, image, noindex } = {}) {
    useLayoutEffect(() => {
        const fullTitle = title ? `${title} — ${SITE}` : DEFAULT_TITLE
        const desc = description || DEFAULT_DESCRIPTION
        const url = `${ORIGIN}${path || '/'}`
        const img = image || DEFAULT_IMAGE

        document.title = fullTitle

        meta('description', desc)
        meta('og:title', fullTitle, true)
        meta('og:description', desc, true)
        meta('og:url', url, true)
        meta('og:image', img, true)
        meta('twitter:title', fullTitle)
        meta('twitter:description', desc)
        meta('twitter:image', img)
        meta('robots', noindex ? 'noindex, follow' : 'index, follow, max-image-preview:large')

        tag('link[rel="canonical"]', () => {
            const el = document.createElement('link')
            el.setAttribute('rel', 'canonical')
            return el
        }).setAttribute('href', url)
    }, [title, description, path, image, noindex])
}
