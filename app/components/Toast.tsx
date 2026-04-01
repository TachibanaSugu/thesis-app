"use client";
import { useState, useEffect, createContext, useContext, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";

// Types
interface Toast {
  id: number;
  message: string;
  type: "success" | "error" | "info";
}

// Context
const ToastContext = createContext<{
  addToast: (message: string, type?: "success" | "error" | "info") => void;
}>({ addToast: () => {} });

export const useToast = () => useContext(ToastContext);

// Provider
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: "success" | "error" | "info" = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      {/* Toast Container */}
      <div className="fixed bottom-6 left-6 z-[100] flex flex-col gap-3">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: -100, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -100, scale: 0.8 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className={`px-5 py-3.5 rounded-xl shadow-2xl font-bold text-sm flex items-center gap-3 min-w-[280px] backdrop-blur-xl border ${
                toast.type === "success"
                  ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30 shadow-emerald-500/10"
                  : toast.type === "error"
                  ? "bg-red-500/15 text-red-400 border-red-500/30 shadow-red-500/10"
                  : "bg-cyan-500/15 text-cyan-400 border-cyan-500/30 shadow-cyan-500/10"
              }`}
            >
              {toast.type === "success" && (
                <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              )}
              {toast.type === "error" && (
                <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
              {toast.type === "info" && (
                <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              {toast.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
