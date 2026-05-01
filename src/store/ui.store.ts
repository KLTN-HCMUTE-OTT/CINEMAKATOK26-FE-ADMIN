import { create } from 'zustand'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface Toast {
  id: string
  message: string
  type: ToastType
}

interface UIState {
  toasts: Toast[]
  loadingKeys: Set<string>
  globalLoading: boolean
  startLoading: (key: string) => void
  stopLoading: (key: string) => void
  isLoading: (key: string) => boolean
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
  setGlobalLoading: (loading: boolean) => void
}

export const useUIStore = create<UIState>((set, get) => ({
  toasts: [],
  loadingKeys: new Set<string>(),
  globalLoading: false,
  startLoading: (key: string) =>
    set(state => {
      const next = new Set(state.loadingKeys)

      next.add(key)

      return { loadingKeys: next, globalLoading: true }
    }),
  stopLoading: (key: string) =>
    set(state => {
      const next = new Set(state.loadingKeys)

      next.delete(key)

      return { loadingKeys: next, globalLoading: next.size > 0 }
    }),
  isLoading: (key: string) => get().loadingKeys.has(key),
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
