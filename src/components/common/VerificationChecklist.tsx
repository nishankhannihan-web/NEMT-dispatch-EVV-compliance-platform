import React from 'react';
import { Check, X } from 'lucide-react';
import { EVVVerification } from '../../types';

interface VerificationChecklistProps {
  verification: EVVVerification;
  showLabels?: boolean;
  compact?: boolean;
}

export const VerificationChecklist: React.FC<VerificationChecklistProps> = ({
  verification,
  showLabels = false,
  compact = false
}) => {
  const items = [
    { key: 'serviceType', label: 'Service Type' },
    { key: 'riderIdentity', label: 'Rider ID' },
    { key: 'serviceDate', label: 'Date' },
    { key: 'locations', label: 'Pickup & Drop GPS' },
    { key: 'driverIdentity', label: 'Driver ID' },
    { key: 'exactTimes', label: 'Start & End Times' },
    { key: 'authorization', label: 'Prior Auth' },
    { key: 'signature', label: 'Signature' }
  ];

  const allPassed = Object.values(verification).every(Boolean);
  const passCount = Object.values(verification).filter(Boolean).length;

  if (compact) {
    return (
      <div className="flex items-center gap-1.5" title={`${passCount} of 8 EVV verification points confirmed`}>
        <div className="flex gap-0.5">
          {items.map((item) => {
            const isPassed = verification[item.key as keyof EVVVerification];
            return (
              <span
                key={item.key}
                title={`${item.label}: ${isPassed ? 'Verified' : 'Missing'}`}
                className={`w-2 h-2 rounded-full ${
                  isPassed ? 'bg-[#1E5A2D]' : 'bg-[#A82220]'
                }`}
              />
            );
          })}
        </div>
        <span className={`text-[11px] font-mono-num font-semibold ${allPassed ? 'text-[#1E5A2D]' : 'text-[#A82220]'}`}>
          {passCount}/8
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between pb-1 border-b border-[#1A0A0F]/10">
        <span className="text-xs font-semibold text-[#1A0A0F] uppercase tracking-wider">
          6-Point EVV Verification Checklist
        </span>
        <span
          className={`text-xs font-mono-num px-2.5 py-0.5 rounded-lg border font-semibold ${
            allPassed
              ? 'bg-[#EDF6EE] border-[#C6E2CA] text-[#1E5A2D]'
              : 'bg-[#FDF0F1] border-[#F8D0D4] text-[#A82220]'
          }`}
        >
          {passCount} / 8 Passed {allPassed ? '✓ Clean' : '⚠ Action Needed'}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
        {items.map((item) => {
          const isPassed = verification[item.key as keyof EVVVerification];
          return (
            <div
              key={item.key}
              className={`flex items-center justify-between px-2.5 py-1.5 rounded-xl border text-xs ${
                isPassed
                  ? 'bg-white/80 border-[#1A0A0F]/8 text-[#1A0A0F]'
                  : 'bg-[#FDF0F1]/90 border-[#F8D0D4] text-[#A82220]'
              }`}
            >
              <div className="flex items-center gap-2">
                <span
                  className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                    isPassed ? 'bg-[#1E5A2D] text-white' : 'bg-[#A82220] text-white'
                  }`}
                >
                  {isPassed ? <Check className="w-2.5 h-2.5" /> : <X className="w-2.5 h-2.5" />}
                </span>
                <span className={isPassed ? 'font-normal' : 'font-semibold'}>{item.label}</span>
              </div>
              <span className="text-[11px] font-mono-num font-medium">
                {isPassed ? 'Pass' : 'Missing'}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
