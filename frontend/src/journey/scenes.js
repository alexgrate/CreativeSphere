export const SCENES = [
    { id: 'beginning', title: 'The Beginning', start: 0.00, end: 0.14},
    { id: 'direction', title: 'Finding Direction', start: 0.14, end: 0.27},
    { id: 'building', title: 'Building the Brand', start: 0.27, end: 0.42},
    { id: 'constellations', title: 'The Constellations', start: 0.42, end: 0.55},
    { id: 'worlds', title: "Worlds We've Created", start: 0.55, end: 0.68},
    { id: 'process', title: 'The Creative Process', start: 0.68, end: 0.80},
    { id: 'impact', title: 'Impact', start: 0.80, end: 0.90},
    { id: 'future', title: 'The Future', start: 0.90, end: 1.00},
]

export function locate(progress) {
    const scene = 
        SCENES.find((s) => progress >= s.start && progress < s.end) ??
        SCENES[SCENES.length - 1]
    const local = (progress - scene.start) / (scene.end - scene.start)
    return { scene, local: Math.min(Math.max(local, 0), 1) }
}