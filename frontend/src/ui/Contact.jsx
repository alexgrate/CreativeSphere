import { useEffect, useState } from "react"
import { ArrowRight, MapPin } from "lucide-react"

const MAX = 600
const MAILTO = 'hello@thecreativesphere.com'


const FORM_ENDPOINT = null

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
    const [values, setValues] = useState({ name: '', company: '', email: '', phone: '', message: '' })
    const [errors, setErrors] = useState({})
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

        if (FORM_ENDPOINT) {
            try {
                await fetch(FORM_ENDPOINT, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(values),
                })
                setSent(true)
            } catch {
                setErrors({ form: 'Something went wrong. Please email us directly.' })
            }
            return
        }

        const body = [
            `Name: ${values.name}`,
            `Company: ${values.company}`,
            `Email: ${values.email}`,
            values.phone && `Phone: ${values.phone}`,
            '', values.message,
        ].filter(Boolean).join('\n')
        window.location.href =
            `mailto:${MAILTO}?subject=${encodeURIComponent(`New enquiry — ${values.company}`)}` +
            `&body=${encodeURIComponent(body)}`
        setSent(true)
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

                {errors.form && <p className="ct-err">{errors.form}</p>}

                <button type="submit" className="ct-btn">
                    {sent ? 'Thank you' : 'Send message'}
                    <ArrowRight size={18} strokeWidth={1.8} aria-hidden="true" />
                </button>

                <p className="ct-status" role="status">
                    {sent && 'Thanks — your message is on its way.'}
                </p>
            </form>
        </section>
    )
}
