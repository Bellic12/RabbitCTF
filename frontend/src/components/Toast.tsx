import React from 'react'

export type ToastType = 'info' | 'success' | 'warning' | 'error'

export interface ToastMessage {
  id: string
  message: string
  type: ToastType
  duration?: number
}

interface ToastProps {
  toasts: ToastMessage[]
  removeToast: (id: string) => void
}

export const Toast: React.FC<ToastProps> = ({ toasts }) => {
  return (
    <div className="toast toast-end toast-bottom z-50">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`alert ${
            toast.type === 'success'
              ? 'alert-success'
              : toast.type === 'error'
              ? 'alert-error'
              : toast.type === 'warning'
              ? 'alert-warning'
              : 'alert-info'
          }`}
        >
          <span>{toast.message}</span>
        </div>
      ))}
    </div>
  )
}
