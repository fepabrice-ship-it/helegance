import React, { createContext, useContext, useState, useCallback } from "react";
import type { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle, AlertCircle, ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";

interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "info";
  action?: {
    label: string;
    to: string;
  };
}

interface ToastContextType {
  addToast: (
    message: string,
    type: "success" | "error" | "info",
    action?: { label: string; to: string },
  ) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback(
    (
      message: string,
      type: "success" | "error" | "info",
      action?: { label: string; to: string },
    ) => {
      const id = Math.random().toString(36).substr(2, 9);
      setToasts((prev) => [...prev, { id, message, type, action }]);
      setTimeout(() => {
        removeToast(id);
      }, 5000);
    },
    [removeToast],
  );

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              className="pointer-events-auto bg-gray-900 border border-white/10 p-4 rounded-xl shadow-2xl flex items-center gap-4 min-w-[300px] glass-panel"
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                  toast.type === "success"
                    ? "bg-emerald-500/20 text-emerald-400"
                    : toast.type === "error"
                      ? "bg-red-500/20 text-red-400"
                      : "bg-blue-500/20 text-blue-400"
                }`}
              >
                {toast.type === "success" && <CheckCircle size={20} />}
                {toast.type === "error" && <AlertCircle size={20} />}
                {toast.type === "info" && <ShoppingCart size={20} />}
              </div>
              <div className="flex-grow">
                <p className="text-sm font-medium text-white">
                  {toast.message}
                </p>
                {toast.action && (
                  <Link
                    to={toast.action.to}
                    className="text-xs text-primary hover:underline mt-1 font-bold block"
                    onClick={() => removeToast(toast.id)}
                  >
                    {toast.action.label}
                  </Link>
                )}
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-gray-500 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useToast = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};
