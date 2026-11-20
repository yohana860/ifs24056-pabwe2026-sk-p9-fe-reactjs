import { createContext, useCallback, useContext, useState } from 'react'

const ToastContext = createContext(null)
let counter = 0

const STYLE = {
  success: 'bg-emerald-600 text-white',
  error: 'bg-red-600 text-white',
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const dismiss = useCallback((id) => setToasts((list) => list.filter((t) => t.id !== id)), [])

  const notify = useCallback(
    (type, message) => {
      const id = ++counter
      setToasts((list) => [...list, { id, type, message }])
      setTimeout(() => dismiss(id), 4000)
    },
    [dismiss],
  )

  return (
    <ToastContext.Provider value={notify}>
      {children}
      <div className="fixed right-4 top-4 z-[100] flex w-80 max-w-[calc(100vw-2rem)] flex-col gap-2">
        {toasts.map((t) => (
          <div key={t.id} role={t.type === 'error' ? 'alert' : 'status'} className={`flex items-start justify-between gap-3 rounded-lg px-4 py-3 shadow-lg ${STYLE[t.type]}`}>
            <span className="text-sm">{t.message}</span>
            <button type="button" aria-label="Tutup notifikasi" onClick={() => dismiss(t.id)} className="text-lg leading-none">×</button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  return useContext(ToastContext)
}
