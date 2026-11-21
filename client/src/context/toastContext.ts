import { createContext } from 'react'

export type ToastType = 'success' | 'error' | 'info'

export interface ToastItem {
  id: number
  type: ToastType
  title: string
  message?: string
}

export interface ToastApi {
  success: (title: string, message?: string) => void
  error: (title: string, message?: string) => void
  info: (title: string, message?: string) => void
}

export interface ToastContextValue {
  toast: ToastApi
  toasts: ToastItem[]
  dismiss: (id: number) => void
}

export const ToastContext = createContext<ToastContextValue | null>(null)
