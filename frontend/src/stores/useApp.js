import { create } from "zustand";

export const SECTIONS = ['hero', 'services', 'work', 'impact', 'about', 'contact']

export const useApp = create(() => ({
    phase: 'loading',
    section: 0,
}))

export const setReady = () => useApp.setState({ phase: 'ready' })

export const setSection = (i) => 
    useApp.setState({
        section: Math.min(Math.max(i, 0), SECTIONS.length - 1),
    })