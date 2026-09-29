import React, { useState } from 'react';
import { Eye, EyeOff, ShieldCheck, Lock } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface PhiFieldProps {
  id: string; // Unique key e.g. "medicaid-rdr-1"
  value: string;
  riderName: string;
  fieldType: 'medicaid' | 'phone' | 'dob';
  displayLabel?: string;
  className?: string;
}

export const PhiField: React.FC<PhiFieldProps> = ({
  id,
  value,
  riderName,
  fieldType,
  className = ''
}) => {
  const { revealedPhiKeys, revealPhi } = useApp();
  const isRevealed = revealedPhiKeys.has(id);
  const [showPrompt, setShowPrompt] = useState(false);
  const [reason, setReason] = useState('Broker eligibility and billing review');

  // Masking helpers
  const getMasked = (val: string, type: 'medicaid' | 'phone' | 'dob') => {
    if (type === 'medicaid') {
      const parts = val.split('-');
      if (parts.length > 1) {
        return `${parts[0]}-••••${parts[1].slice(-4)}`;
      }
      return `••••-••••-${val.slice(-4)}`;
    }
    if (type === 'phone') {
      return '(•••) •••-' + val.slice(-4);
    }
    if (type === 'dob') {
      return '••••-••-' + val.slice(-2);
    }
    return '••••••••';
  };

  const handleRevealClick = () => {
    if (isRevealed) return;
    setShowPrompt(true);
  };

  const confirmReveal = (e: React.FormEvent) => {
    e.preventDefault();
    revealPhi(id, riderName, reason);
    setShowPrompt(false);
  };

  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      <span className="font-mono-num tracking-wide">
        {isRevealed ? value : getMasked(value, fieldType)}
      </span>

      {isRevealed ? (
        <span
          title="Protected Health Information unmasked and logged in audit log"
          className="inline-flex items-center gap-1 text-[11px] text-[#1E5A2D] bg-[#EDF6EE] border border-[#C6E2CA] px-1.5 py-0.5 rounded-md font-medium"
        >
          <ShieldCheck className="w-3 h-3 text-[#1E5A2D]" />
          <span>Logged</span>
        </span>
      ) : (
        <button
          type="button"
          onClick={handleRevealClick}
          className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] text-[#1A0A0F] font-semibold hover:bg-[#ECD0D8] rounded-md transition-colors border border-[#1A0A0F]/15"
          title="Tap to unmask (audited by HIPAA policy)"
        >
          <Lock className="w-3 h-3" />
          <span>Reveal</span>
        </button>
      )}

      {showPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white/95 backdrop-blur-xl border border-[#1A0A0F]/15 rounded-2xl max-w-sm w-full p-5 shadow-2xl text-[#1A0A0F]">
            <div className="flex items-center gap-2 mb-2 text-[#1A0A0F]">
              <Lock className="w-5 h-5" />
              <h4 className="font-bold text-base font-display">PHI Access Justification</h4>
            </div>
            <p className="text-xs text-[#6B4F57] mb-4 leading-relaxed">
              Access to protected health information for <strong>{riderName}</strong> is logged immutably under HIPAA Minimum Necessary Rule. Please specify reason:
            </p>
            <form onSubmit={confirmReveal} className="space-y-3">
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-[#1A0A0F]/15 bg-white text-[#1A0A0F] focus:outline-none focus:ring-1 focus:ring-[#1A0A0F]"
              >
                <option value="Broker eligibility and billing review">Broker eligibility and billing review</option>
                <option value="Dispatch routing and rider special care">Dispatch routing & special care</option>
                <option value="State Medicaid compliance audit">State Medicaid compliance audit</option>
                <option value="Provider dispute resolution">Provider dispute resolution</option>
              </select>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPrompt(false)}
                  className="px-3.5 py-1.5 text-xs text-[#6B4F57] hover:text-[#1A0A0F] font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-[#2D121B] to-[#1A0A0F] hover:from-[#3A1620] hover:to-[#240E15] rounded-xl transition-all shadow-xs"
                >
                  Confirm & Unmask
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
