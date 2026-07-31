import { Link, useNavigate } from 'react-router-dom'

// a Link that lets the current .page fade out before the route changes
export default function FadeLink({ to, className, children }) {
  const navigate = useNavigate()

  const onClick = (e) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return
    e.preventDefault()
    const page = document.querySelector('.page')
    if (page) {
      page.classList.add('is-leaving')
      setTimeout(() => navigate(to), 240)
    } else {
      navigate(to)
    }
  }

  return (
    <Link to={to} className={className} onClick={onClick}>
      {children}
    </Link>
  )
}
