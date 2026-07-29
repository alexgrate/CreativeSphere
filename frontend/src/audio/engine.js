// The universe's voice — synthesized live, no audio files.
let ctx = null
let master = null
let bedGain = null

const now = () => ctx.currentTime

function ensureContext() {
  if (ctx) return
  ctx = new (window.AudioContext || window.webkitAudioContext)()
  master = ctx.createGain()
  master.gain.value = 0 // born silent; enable() fades in
  master.connect(ctx.destination)
  buildBed()
}

// one voice of the pad: an oscillator with its own level
function voice(freq, gain, dest) {
  const o = ctx.createOscillator()
  o.type = 'sine'
  o.frequency.value = freq
  const g = ctx.createGain()
  g.gain.value = gain
  o.connect(g).connect(dest)
  o.start()
}

// The ambient bed v2: a warm detuned chord behind a soft lowpass,
// with wandering "air" — closer to a composed pad than a test tone.
function buildBed() {
  bedGain = ctx.createGain()
  bedGain.gain.value = 0.75

  const warmth = ctx.createBiquadFilter()
  warmth.type = 'lowpass'
  warmth.frequency.value = 780
  warmth.Q.value = 0.4
  bedGain.connect(warmth)
  warmth.connect(master)

  // A–E–A–C#: a wide, warm spread. Each note is TWO oscillators
  // detuned ±0.4Hz — the slow beating between them is the "chorus" richness.
  const chord = [
    [55, 0.4],
    [82.41, 0.16],
    [110, 0.22],
    [138.59, 0.07],
  ]
  chord.forEach(([f, g]) => {
    voice(f - 0.4, g / 2, bedGain)
    voice(f + 0.4, g / 2, bedGain)
  })

  // the air: soft noise through a bandpass that WANDERS slowly,
  // so the texture never repeats
  const len = ctx.sampleRate * 2
  const buf = ctx.createBuffer(1, len, ctx.sampleRate)
  const data = buf.getChannelData(0)
  for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1
  const noise = ctx.createBufferSource()
  noise.buffer = buf
  noise.loop = true
  const bp = ctx.createBiquadFilter()
  bp.type = 'bandpass'
  bp.frequency.value = 750
  bp.Q.value = 0.8
  const airGain = ctx.createGain()
  airGain.gain.value = 0.018
  noise.connect(bp).connect(airGain).connect(bedGain)
  noise.start()

  const wander = ctx.createOscillator()
  wander.frequency.value = 0.03
  const wanderGain = ctx.createGain()
  wanderGain.gain.value = 450
  wander.connect(wanderGain).connect(bp.frequency)
  wander.start()

  // the breath
  const lfo = ctx.createOscillator()
  lfo.frequency.value = 0.06
  const lfoGain = ctx.createGain()
  lfoGain.gain.value = 0.1
  lfo.connect(lfoGain).connect(bedGain.gain)
  lfo.start()
}

export const sfx = {
  enable() {
    ensureContext()
    ctx.resume()
    master.gain.cancelScheduledValues(now())
    master.gain.setTargetAtTime(0.14, now(), 0.8)
  },

  disable() {
    if (!ctx) return
    master.gain.cancelScheduledValues(now())
    master.gain.setTargetAtTime(0.0001, now(), 0.4)
  },

  // warp v2: an engine surge (deep sine dive) under a soft wind —
  // it swells in instead of blasting
  warp() {
    if (!ctx) return
    const t = now()

    const o = ctx.createOscillator()
    o.type = 'sine'
    o.frequency.setValueAtTime(170, t)
    o.frequency.exponentialRampToValueAtTime(52, t + 1.0)
    const og = ctx.createGain()
    og.gain.setValueAtTime(0.0001, t)
    og.gain.exponentialRampToValueAtTime(0.26, t + 0.18)
    og.gain.exponentialRampToValueAtTime(0.001, t + 1.1)
    o.connect(og).connect(master)
    o.start(t)
    o.stop(t + 1.2)

    const dur = 1.0
    const len = ctx.sampleRate * dur
    const buf = ctx.createBuffer(1, len, ctx.sampleRate)
    const d = buf.getChannelData(0)
    for (let i = 0; i < len; i++) {
      const env = Math.sin((Math.PI * i) / len) // swells in, fades out
      d[i] = (Math.random() * 2 - 1) * env * env
    }
    const src = ctx.createBufferSource()
    src.buffer = buf
    const lp = ctx.createBiquadFilter()
    lp.type = 'lowpass'
    lp.frequency.setValueAtTime(1400, t)
    lp.frequency.exponentialRampToValueAtTime(240, t + dur)
    const g = ctx.createGain()
    g.gain.value = 0.13
    src.connect(lp).connect(g).connect(master)
    src.start(t)
  },

  // the unleash: a soft descending droplet
  pop() {
    if (!ctx) return
    const t = now()
    const o = ctx.createOscillator()
    o.type = 'sine'
    o.frequency.setValueAtTime(480, t)
    o.frequency.exponentialRampToValueAtTime(170, t + 0.5)
    const g = ctx.createGain()
    g.gain.setValueAtTime(0.16, t)
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.55)
    o.connect(g).connect(master)
    o.start(t)
    o.stop(t + 0.6)
  },

  // the moonrise: a sub-bass presence swelling up from the deep,
  // with a faint fifth above it for mystery
  moon() {
    if (!ctx) return
    const t = now()

    const o = ctx.createOscillator()
    o.type = 'sine'
    o.frequency.setValueAtTime(38, t)
    o.frequency.linearRampToValueAtTime(46, t + 2.2)
    const g = ctx.createGain()
    g.gain.setValueAtTime(0.0001, t)
    g.gain.exponentialRampToValueAtTime(0.38, t + 1.1)
    g.gain.exponentialRampToValueAtTime(0.001, t + 3.2)
    o.connect(g).connect(master)
    o.start(t)
    o.stop(t + 3.3)

    const o2 = ctx.createOscillator()
    o2.type = 'sine'
    o2.frequency.value = 57
    const g2 = ctx.createGain()
    g2.gain.setValueAtTime(0.0001, t)
    g2.gain.exponentialRampToValueAtTime(0.11, t + 1.4)
    g2.gain.exponentialRampToValueAtTime(0.001, t + 3.0)
    o2.connect(g2).connect(master)
    o2.start(t)
    o2.stop(t + 3.1)
  },
}
