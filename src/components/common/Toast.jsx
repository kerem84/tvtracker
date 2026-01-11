import { createContext, useContext, useState, useCallback } from 'react'

const ToastContext = createContext(null)

export const useToast = () => {
    const context = useContext(ToastContext)
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider')
    }
    return context
}

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([])

    const addToast = useCallback((message, type = 'info', duration = 3000) => {
        const id = Date.now() + Math.random()
        const newToast = { id, message, type }

        setToasts(prev => [...prev, newToast])

        if (duration > 0) {
            setTimeout(() => {
                setToasts(prev => prev.filter(t => t.id !== id))
            }, duration)
        }

        return id
    }, [])

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id))
    }, [])

    const success = useCallback((message, duration) => addToast(message, 'success', duration), [addToast])
    const error = useCallback((message, duration) => addToast(message, 'error', duration), [addToast])
    const warning = useCallback((message, duration) => addToast(message, 'warning', duration), [addToast])
    const info = useCallback((message, duration) => addToast(message, 'info', duration), [addToast])

    return (
        <ToastContext.Provider value={{ addToast, removeToast, success, error, warning, info }}>
            {children}
            <ToastContainer toasts={toasts} removeToast={removeToast} />
        </ToastContext.Provider>
    )
}

const TOAST_ICONS = {
    success: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
        </svg>
    ),
    error: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
        </svg>
    ),
    warning: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
    ),
    info: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
}

const TOAST_STYLES = {
    success: 'bg-green-500/90 border-green-400/50 text-white shadow-green-500/25',
    error: 'bg-red-500/90 border-red-400/50 text-white shadow-red-500/25',
    warning: 'bg-amber-500/90 border-amber-400/50 text-white shadow-amber-500/25',
    info: 'bg-indigo-500/90 border-indigo-400/50 text-white shadow-indigo-500/25',
}

const ToastContainer = ({ toasts, removeToast }) => {
    if (toasts.length === 0) return null

    return (
        <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
            {toasts.map((toast) => (
                <div
                    key={toast.id}
                    className={`pointer-events-auto flex items-center gap-3 px-5 py-3.5 rounded-2xl border backdrop-blur-xl shadow-2xl animate-toast-in font-medium ${TOAST_STYLES[toast.type]}`}
                >
                    <div className="flex-shrink-0">
                        {TOAST_ICONS[toast.type]}
                    </div>
                    <span className="text-sm font-bold">{toast.message}</span>
                    <button
                        onClick={() => removeToast(toast.id)}
                        className="flex-shrink-0 ml-2 opacity-70 hover:opacity-100 transition-opacity"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            ))}
        </div>
    )
}

export default ToastProvider
