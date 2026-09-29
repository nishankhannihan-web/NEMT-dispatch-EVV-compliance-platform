import React, { useState } from 'react';
import { HelpCircle } from 'lucide-react';

interface TooltipProps {
  content: string;
  label?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({ content, label = "What's this?" }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <span className="relative inline-flex items-center ml-1">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        className="inline-flex items-center gap-0.5 text-xs text-[#1A0A0F] hover:text-[#3A1620] underline decoration-dotted transition-colors focus:outline-none"
        aria-label={label}
      >
        <HelpCircle className="w-3.5 h-3.5 inline" />
        <span className="text-[11px] font-normal">{label}</span>
      </button>

      {isOpen && (
        <span
          role="tooltip"
          className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-[#1A0A0F]/95 backdrop-blur-md text-[#F6E6EA] text-xs leading-relaxed rounded-xl shadow-xl border border-white/20 pointer-events-none"
        >
          {content}
          <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#1A0A0F]" />
        </span>
      )}
    </span>
  );
};
