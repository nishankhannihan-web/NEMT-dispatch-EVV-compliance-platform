import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertTriangle, AlertOctagon, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none px-4 sm:px-0">
      {toasts.map((toast) => {
        let borderClass = 'border-[#C6E2CA]';
        let icon = <CheckCircle2 className="w-5 h-5 text-[#1E5A2D] shrink-0" />;

        if (toast.type === 'danger') {
          borderClass = 'border-[#F8D0D4]';
          icon = <AlertOctagon className="w-5 h-5 text-[#A82220] shrink-0" />;
        } else if (toast.type === 'warning') {
          borderClass = 'border-[#F6DEC0]';
          icon = <AlertTriangle className="w-5 h-5 text-[#9E6714] shrink-0" />;
        } else if (toast.type === 'info') {
          borderClass = 'border-[#CADAEB]';
          icon = <Info className="w-5 h-5 text-[#2D4F7C] shrink-0" />;
        }

        return (
          <div
            key={toast.id}
            role="alert"
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl border shadow-xl bg-white/95 backdrop-blur-xl ${borderClass} transition-all duration-200 animate-in fade-in slide-in-from-bottom-2`}
          >
            {icon}
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold text-[#1A0A0F] font-sans truncate">{toast.title}</h4>
              <p className="text-xs text-[#6B4F57] mt-0.5 leading-relaxed">{toast.message}</p>
            </div>
            <button
              onClick={() => dismissToast(toast.id)}
              className="text-[#6B4F57] hover:text-[#1A0A0F] p-1 -mr-1 -mt-1 transition-colors"
              aria-label="Dismiss notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
