import { create } from "zustand";

export const useApp = create(() => ({
    phase: 'loading',
}))

export const setReady = () => useApp.setState({ phase: 'ready' })