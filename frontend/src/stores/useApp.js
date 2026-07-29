import { create } from "zustand";
import { sfx } from "../audio/engine";

export const SECTIONS = ['hero', 'services', 'work', 'impact', 'about', 'contact']

export const useApp = create(() => ({
    phase: 'loading',
    section: 0,
    sound: false,
}))

export const setReady = () => useApp.setState({ phase: 'ready' })

export const setSection = (i) => {
  const next = Math.min(Math.max(i, 0), SECTIONS.length - 1)
  if (next !== useApp.getState().section && useApp.getState().sound) sfx.warp()
  useApp.setState({ section: next })
}

export const toggleSound = () => {
    const on = !useApp.getState().sound
    useApp.setState({ sound: on })
    if (on) sfx.enable()
    else sfx.disable()
}
