export default function SplitWords({ text }) {
  return text.split(' ').map((w, i) => (
    <span className="sw" key={i}>
      <span className="sw-in" style={{ transitionDelay: `${0.35 + i * 0.07}s` }}>{w}</span>
    </span>
  ))
}
