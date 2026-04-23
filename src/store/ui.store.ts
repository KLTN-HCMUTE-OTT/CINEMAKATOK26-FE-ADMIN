import { create } from 'zustand'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface Toast {
  id: string
  message: string
  type: ToastType
}

interface UIState {
  toasts: Toast[]
  globalLoading: boolean
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
  setGlobalLoading: (loading: boolean) => void
}

export const useUIStore = create<UIState>(set => ({
  toasts: [],
  globalLoading: false,
  addToast: toast =>
    set(state => ({
      toasts: [...state.toasts, { ...toast, id: crypto.randomUUID() }]
    })),
  removeToast: id =>
    set(state => ({
      toasts: state.toasts.filter(t => t.id !== id)
    })),
  setGlobalLoading: globalLoading => set({ globalLoading })
}))
