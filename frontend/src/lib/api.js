import { useEffect, useState } from 'react'

const API = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://127.0.0.1:8000' : '')

const cache = new Map()
const inflight = new Map()

function load(path) {
    if (cache.has(path)) return Promise.resolve(cache.get(path))
    if (!inflight.has(path)) {
        inflight.set(path, fetch(`${API}${path}`)
            .then((res) => {
                if (!res.ok) throw new Error(`${path} failed: ${res.status}`)
                return res.json()
            })
            .then((data) => { cache.set(path, data); inflight.delete(path); return data })
            .catch((err) => { inflight.delete(path); throw err }))
    }
    return inflight.get(path)
}

function useResource(path, enabled = true) {
    const [data, setData] = useState(() => cache.get(path) ?? null)
    const [error, setError] = useState(null)

    useEffect(() => {
        if (!enabled) return
        if (cache.has(path)) { setData(cache.get(path)); return }

        let alive = true
        load(path)
            .then((d) => { if (alive) setData(d) })
            .catch((err) => { if (alive) setError(err) })
        return () => { alive = false }
    }, [path, enabled])

    return { data: data || [], ready: Boolean(data), error }
}

export function useWork(enabled = true) {
    const { data, ready, error } = useResource('/api/projects/', enabled)
    return { work: data, ready, error }
}

export const useLogos = () => useResource('/api/logos/')
export const useCtaLogos = () => useResource('/api/cta-logos/')

export const useFaqs = (enabled = true) => useResource('/api/faqs/', enabled)
export const useFormats = () => useResource('/api/formats/')

export async function postContact(values) {
    const res = await fetch(`${API}/api/contact/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
    })
    if (res.ok) return res.json()

    const detail = await res.json().catch(() => null)
    throw Object.assign(new Error('Contact request failed'), { status: res.status, detail })
}
