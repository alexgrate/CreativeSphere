import { create } from 'zustand'

export const useJourney = create(() => ({
    progress: 0,
    velocity: 0,
    birth: 'gathering',
    sceneId: "beginning",
    sceneTitle: "The Beginning",
    sceneLocal: 0,
}))