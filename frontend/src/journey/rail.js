import { ASCENT_END } from "../experience/constants";

export const STATIONS = [
    { id: 'arrival', at: 0.14, until: 0.20, z: -4 },
    { id: 'direction', at: 0.28, until: 0.35, z: -45 },
    { id: 'building', at: 0.44, until: 0.52, z: -85 },
    { id: 'constellations', at: 0.60, until: 0.66, z: -120 },
    { id: 'worlds', at: 0.72, until: 0.78, z: -150 },
    { id: 'process', at: 0.84, until: 0.88, z: -175 },
    { id: 'future', at: 0.94, until: 0.97, z: -195 },
]

const smooth = (t) => {
    const c = Math.min(Math.max(t, 0), 1)
    return c * c * (3 - 2 * c)
}

export function railZ(p) {
    let prev = { until: ASCENT_END, z: 5 }
    for (const s of STATIONS) {
        if (p < s.at) {
            return prev.z + (s.z - prev.z) * smooth((p - prev.until) / (s.at - prev.until))
        }
        if (p <= s.until) return s.z
        prev = s
    }
    return prev.z
}