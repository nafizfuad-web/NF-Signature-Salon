import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import Icon from '@/components/common/Icon'
import {
  ToastContext,
  type ToastContextValue,
  type ToastItem,
  type ToastType,
} from '@/context/toastContext'

const TOAST_DURATION = 5000
let nextToastId = 0

interface ToastProviderProps {
  children: ReactNode
}

export default function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const timers = useRef<Map<number, number>>(new Map())

  const dismiss = useCallback((id: number) => {
    const timer = timers.current.get(id)
    if (timer) {
      window.clearTimeout(timer)
      timers.current.delete(id)
    }
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const push = useCallback(
    (type: ToastType, title: string, message?: string) => {
      const id = ++nextToastId
      setToasts((current) => [...current.slice(-3), { id, type, title, message }])
      const timer = window.setTimeout(() => dismiss(id), TOAST_DURATION)
      timers.current.set(id, timer)
    },
    [dismiss]
  )

  const toast = useMemo(
    () => ({
      success: (title: string, message?: string) => push('success', title, message),
      error: (title: string, message?: string) => push('error', title, message),
      info: (title: string, message?: string) => push('info', title, message),
    }),
    [push]
  )

  useEffect(() => {
    const activeTimers = timers.current
    return () => {
      activeTimers.forEach((timer) => window.clearTimeout(timer))
      activeTimers.clear()
    }
  }, [])

  const value: ToastContextValue = { toast, toasts, dismiss }

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-viewport" aria-live="polite" aria-atomic="false">
        {toasts.map((item) => (
          <div
            key={item.id}
            className={`toast toast-${item.type}`}
            role={item.type === 'error' ? 'alert' : 'status'}
          >
            <span className="toast-icon" aria-hidden="true">
              <Icon
                name={
                  item.type === 'success'
                    ? 'check'
                    : item.type === 'error'
                      ? 'alert-circle'
                      : 'info'
                }
                size={18}
              />
            </span>
            <div className="toast-copy">
              <p className="toast-title">{item.title}</p>
              {item.message && <p className="toast-message">{item.message}</p>}
            </div>
            <button
              type="button"
              className="toast-close"
              onClick={() => dismiss(item.id)}
              aria-label="Dismiss notification"
            >
              <Icon name="x" size={15} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
