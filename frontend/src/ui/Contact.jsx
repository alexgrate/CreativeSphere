import { useEffect, useState } from "react"
import { ArrowRight, MapPin } from "lucide-react"
import { postContact } from "../lib/api"

const ADDRESS = '5B Adewumi Adu St, off Sanni Balogun Street, Abule-Egba, Lagos 101232, Nigeria'

const MAX = 600
const MAILTO = 'inthecreativesphere@gmail.com'

const BLANK = { name: '', company: '', email: '', phone: '', message: '', website: '' }
const OWN_FIELDS = new Set(['name', 'company', 'email', 'phone', 'message'])

const serverErrors = (err) => {
    if (err.status === 429) {
        return { form: `Too many messages sent from here recently. Please try again later, or email us at ${MAILTO}.` }
    }

    const mapped = {}
    if (err.detail && typeof err.detail === 'object' && !Array.isArray(err.detail)) {
        for (const [key, value] of Object.entries(err.detail)) {
            if (OWN_FIELDS.has(key)) mapped[key] = Array.isArray(value) ? value[0] : String(value)
        }
    }
    if (Object.keys(mapped).length) return mapped

    return { form: `Something went wrong sending that. Please email us directly at ${MAILTO}.` }
}

const FIELDS = [
    { name: 'name',    label: 'Name',    type: 'text',  required: true,  half: true },
    { name: 'company', label: 'Company', type: 'text',  required: true,  half: true },
    { name: 'email',   label: 'Email',   type: 'email', required: true,  half: true },
    { name: 'phone',   label: 'Phone',   type: 'tel',   required: false, half: true },
]

const officeOpen = () => {
    try {
        const parts = new Intl.DateTimeFormat('en-GB', {
            timeZone: 'Africa/Lagos', weekday: 'short', hour: '2-digit', hour12: false,
        }).formatToParts(new Date())
        const day = parts.find((p) => p.type === 'weekday')?.value
        const hour = Number(parts.find((p) => p.type === 'hour')?.value)
        const weekday = !['Sat', 'Sun'].includes(day)
        return { open: weekday && hour >= 9 && hour < 18, hour }
    } catch {
        return { open: false, hour: null }
    }
}

export default function Contact() {
    const [values, setValues] = useState(BLANK)
    const [errors, setErrors] = useState({})
    const [sending, setSending] = useState(false)
    const [sent, setSent] = useState(false)
    const [office, setOffice] = useState(officeOpen)

    useEffect(() => {
        const id = setInterval(() => setOffice(officeOpen()), 60_000)
        return () => clearInterval(id)
    }, [])

    const set = (k) => (e) => {
        const v = k === 'message' ? e.target.value.slice(0, MAX) : e.target.value
        setValues((s) => ({ ...s, [k]: v }))
        if (errors[k]) setErrors((s) => ({ ...s, [k]: undefined }))
    }

    const validate = () => {
        const next = {}
        for (const f of FIELDS) {
            if (f.required && !values[f.name].trim()) next[f.name] = 'Required'
        }
        if (values.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(values.email.trim())) {
            next.email = 'Enter a valid email address'
        }
        if (!values.message.trim()) next.message = 'Required'
        return next
    }

    const submit = async (e) => {
        e.preventDefault()
        const next = validate()
        setErrors(next)
        const first = Object.keys(next)[0]
        if (first) {
            document.querySelector(`[name="${first}"]`)?.focus()
            return
        }

        setSending(true)
        try {
            await postContact(values)
            setValues(BLANK)
            setSent(true)
        } catch (err) {
            setErrors(serverErrors(err))
        } finally {
            setSending(false)
        }
    }

    return (
        <section className="ct">
            <div className="ct-left">
                <h1 className="ct-title spark">Contact us.</h1>
                <p className="ct-lead">
                    Interested in working together? So are we. Fill out the form and we&rsquo;ll
                    come back to you. Already have a brief? Send it straight to{' '}
                    <a href={`mailto:${MAILTO}`}>{MAILTO}</a>
                </p>

                <div className="ct-offices">
                    <article className="ct-office">
                        <MapPin size={22} strokeWidth={1.6} aria-hidden="true" />
                        <h2 className="ct-city">
                            Lagos, Nigeria
                            <span
                                className={`ct-dot ${office.open ? 'is-open' : ''}`}
                                title={office.open ? 'Open now' : 'Closed now'}
                            />
                            <span className="ct-sr">{office.open ? 'Open now' : 'Closed now'}</span>
                        </h2>
                        <p className="ct-org">The Creative Sphere</p>
                        <address className="ct-addr">
                            5B Adewumi Adu St, off Sanni Balogun Street,<br />
                            Abule-Egba, Lagos 101232
                        </address>
                        <p className="ct-meta">Mon&ndash;Fri, 9am&ndash;6pm WAT</p>
                        <p className="ct-meta">
                            <a href={`mailto:${MAILTO}`}>{MAILTO}</a><br />
                            <a href="tel:+2349057051623">+234 905 705 1623</a>
                        </p>
                    </article>
                </div>
            </div>

            <form className="ct-form" onSubmit={submit} noValidate>
                <div className="ct-rows">
                    {FIELDS.map((f) => (
                        <div className={`ct-field ${f.half ? 'is-half' : ''}`} key={f.name}>
                            <label htmlFor={`ct-${f.name}`}>
                                {f.label}{f.required && <i aria-hidden="true">*</i>}
                            </label>
                            <input
                                id={`ct-${f.name}`}
                                name={f.name}
                                type={f.type}
                                value={values[f.name]}
                                onChange={set(f.name)}
                                aria-invalid={!!errors[f.name]}
                                aria-describedby={errors[f.name] ? `err-${f.name}` : undefined}
                                className={errors[f.name] ? 'has-error' : ''}
                            />
                            {errors[f.name] && (
                                <span className="ct-err" id={`err-${f.name}`}>{errors[f.name]}</span>
                            )}
                        </div>
                    ))}

                    <div className="ct-field">
                        <label htmlFor="ct-message">Message<i aria-hidden="true">*</i></label>
                        <textarea
                            id="ct-message"
                            name="message"
                            rows={8}
                            maxLength={MAX}
                            value={values.message}
                            onChange={set('message')}
                            aria-invalid={!!errors.message}
                            aria-describedby="ct-count"
                            className={errors.message ? 'has-error' : ''}
                        />
                        <span className="ct-count" id="ct-count">
                            {values.message.length} of {MAX} max characters
                        </span>
                        {errors.message && <span className="ct-err">{errors.message}</span>}
                    </div>
                </div>

                <input
                    className="ct-hp"
                    type="text"
                    name="website"
                    value={values.website}
                    onChange={set('website')}
                    tabIndex={-1}
                    autoComplete="off"
                    aria-hidden="true"
                />

                {errors.form && <p className="ct-err">{errors.form}</p>}

                <button type="submit" className="ct-btn" disabled={sending}>
                    {sending ? 'Sending' : sent ? 'Thank you' : 'Send message'}
                    <ArrowRight size={18} strokeWidth={1.8} aria-hidden="true" />
                </button>

                <p className="ct-status" role="status">
                    {sent && 'Thanks your message is on its way.'}
                </p>
            </form>

            <div className="ct-map" data-reveal>
                <div className="ct-map-frame">
                    <iframe
                        title="The Creative Sphere on Google Maps — Abule-Egba, Lagos"
                        src={`https://maps.google.com/maps?q=${encodeURIComponent(ADDRESS)}&z=16&output=embed`}
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        allowFullScreen
                    />
                </div>

                <a
                    className="ct-map-pin"
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ADDRESS)}`}
                    target="_blank"
                    rel="noreferrer"
                >
                    <span className="ct-map-label">The studio</span>
                    <span className="ct-map-addr">{ADDRESS}</span>
                    <span className="ct-map-go">
                        Open in Maps
                        <ArrowRight size={15} strokeWidth={1.8} aria-hidden="true" />
                    </span>
                </a>
            </div>
        </section>
    )
}
