import { useEffect, useState } from "react";
import type { Toast } from "../../hooks/useToast";

interface ToastItemProps {
  toast: Toast;
  onRemove: (id: string) => void;
}

const typeStyle: Record<Toast["type"], string> = {
  error: "bg-red-600 text-white",
  success: "bg-green-600 text-white",
  info: "bg-blue-600 text-white",
};

const typeIcon: Record<Toast["type"], string> = {
  error: "❌",
  success: "✅",
  info: "ℹ️",
};

function ToastItem({ toast, onRemove }: ToastItemProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // mount → slide in
    const showTimer = setTimeout(() => setVisible(true), 10);

    // 2.7s later → slide out before remove
    const hideTimer = setTimeout(() => setVisible(false), 2700);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  return (
    <div
      className={`
        flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg
        transition-all duration-300 ease-in-out
        ${typeStyle[toast.type]}
        ${visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-3"}
      `}
    >
      <span>{typeIcon[toast.type]}</span>
      <span className="flex-1 text-sm font-medium">{toast.message}</span>
      <button
        onClick={() => onRemove(toast.id)}
        className="text-white/70 hover:text-white text-lg leading-none"
      >
        ×
      </button>
    </div>
  );
}

interface ToastContainerProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
}

export default function ToastContainer({
  toasts,
  onRemove,
}: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 w-full max-w-sm px-4">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
}
