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

// The ambient bed: three deep detuned tones + filtered air, breathing slowly
function buildBed() {
  bedGain = ctx.createGain()
  bedGain.gain.value = 0.8
  bedGain.connect(master)

  const freqs = [55, 110.4, 164.8] // a deep A, its octave slightly detuned, a fifth
  const gains = [0.5, 0.28, 0.1]
  freqs.forEach((f, i) => {
    const osc = ctx.createOscillator()
    osc.type = 'sine'
    osc.frequency.value = f
    const g = ctx.createGain()
    g.gain.value = gains[i]
    osc.connect(g).connect(bedGain)
    osc.start()
  })

  // the "air": looped noise squeezed through a narrow band
  const len = ctx.sampleRate * 2
  const buf = ctx.createBuffer(1, len, ctx.sampleRate)
  const data = buf.getChannelData(0)
  for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1
  const noise = ctx.createBufferSource()
  noise.buffer = buf
  noise.loop = true
  const bp = ctx.createBiquadFilter()
  bp.type = 'bandpass'
  bp.frequency.value = 900
  bp.Q.value = 0.6
  const airGain = ctx.createGain()
  airGain.gain.value = 0.035
  noise.connect(bp).connect(airGain).connect(bedGain)
  noise.start()

  // the breath: a very slow wave gently swelling the whole bed
  const lfo = ctx.createOscillator()
  lfo.frequency.value = 0.05
  const lfoGain = ctx.createGain()
  lfoGain.gain.value = 0.12
  lfo.connect(lfoGain).connect(bedGain.gain)
  lfo.start()
}

export const sfx = {
  enable() {
    ensureContext()
    ctx.resume()
    master.gain.cancelScheduledValues(now())
    master.gain.setTargetAtTime(0.16, now(), 0.8) // fade in over ~2s
  },

  disable() {
    if (!ctx) return
    master.gain.cancelScheduledValues(now())
    master.gain.setTargetAtTime(0.0001, now(), 0.4)
  },

  // warp jump: a noise whoosh sweeping from bright to deep
  warp() {
    if (!ctx) return
    const dur = 1.1
    const len = ctx.sampleRate * dur
    const buf = ctx.createBuffer(1, len, ctx.sampleRate)
    const d = buf.getChannelData(0)
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len)
    const src = ctx.createBufferSource()
    src.buffer = buf
    const lp = ctx.createBiquadFilter()
    lp.type = 'lowpass'
    lp.frequency.setValueAtTime(2400, now())
    lp.frequency.exponentialRampToValueAtTime(220, now() + dur)
    const g = ctx.createGain()
    g.gain.setValueAtTime(0.5, now())
    g.gain.exponentialRampToValueAtTime(0.001, now() + dur)
    src.connect(lp).connect(g).connect(master)
    src.start()
  },

  // the unleash: a soft descending pop, like a droplet in the dark
  pop() {
    if (!ctx) return
    const o = ctx.createOscillator()
    o.type = 'sine'
    o.frequency.setValueAtTime(520, now())
    o.frequency.exponentialRampToValueAtTime(160, now() + 0.5)
    const g = ctx.createGain()
    g.gain.setValueAtTime(0.25, now())
    g.gain.exponentialRampToValueAtTime(0.001, now() + 0.55)
    o.connect(g).connect(master)
    o.start()
    o.stop(now() + 0.6)
  },
}
