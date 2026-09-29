import React from 'react';
import { CheckCircle2, AlertTriangle, AlertOctagon, Clock, XCircle, ArrowRightCircle } from 'lucide-react';
import { TripStatus, BillingStatus } from '../../types';

interface StatusBadgeProps {
  status:
    | TripStatus
    | BillingStatus
    | 'draft'
    | 'valid'
    | 'expiring_soon'
    | 'expired'
    | 'on_trip'
    | 'idle'
    | 'offline';
  labelOverride?: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, labelOverride, size = 'sm' }) => {
  const iconSize = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4';
  const textClass = size === 'sm' ? 'text-xs' : 'text-sm font-medium';

  // Helper mappings
  switch (status) {
    // Green states
    case 'completed':
    case 'paid':
    case 'valid':
      return (
        <span className={`inline-flex items-center gap-1.5 text-[#1E5A2D] bg-[#EDF6EE] border border-[#C6E2CA] px-2.5 py-0.5 rounded-lg shadow-2xs font-medium ${textClass}`}>
          <CheckCircle2 className={`${iconSize} shrink-0`} aria-hidden="true" />
          <span>{labelOverride || (status === 'valid' ? 'Valid & On File' : status === 'paid' ? 'Paid' : 'Completed')}</span>
        </span>
      );

    case 'ready_to_bill':
      return (
        <span className={`inline-flex items-center gap-1.5 text-[#1E5A2D] bg-[#EDF6EE] border border-[#C6E2CA] px-2.5 py-0.5 rounded-lg shadow-2xs font-medium ${textClass}`}>
          <CheckCircle2 className={`${iconSize} shrink-0`} aria-hidden="true" />
          <span>{labelOverride || 'Ready to Bill'}</span>
        </span>
      );

    case 'on_trip':
    case 'passenger_onboard':
    case 'arrived_pickup':
    case 'en_route_pickup':
    case 'arrived_destination':
      return (
        <span className={`inline-flex items-center gap-1.5 text-[#2D4F7C] bg-[#EEF3F8] border border-[#CADAEB] px-2.5 py-0.5 rounded-lg shadow-2xs font-medium ${textClass}`}>
          <ArrowRightCircle className={`${iconSize} shrink-0`} aria-hidden="true" />
          <span>
            {labelOverride ||
              (status === 'passenger_onboard'
                ? 'Rider Onboard'
                : status === 'arrived_pickup'
                ? 'At Pickup'
                : status === 'en_route_pickup'
                ? 'En Route'
                : status === 'arrived_destination'
                ? 'At Destination'
                : 'On Active Trip')}
          </span>
        </span>
      );

    case 'scheduled':
    case 'assigned':
    case 'idle':
    case 'batched':
    case 'submitted':
      return (
        <span className={`inline-flex items-center gap-1.5 text-[#6B4F57] bg-white/85 border border-[#1A0A0F]/10 px-2.5 py-0.5 rounded-lg shadow-2xs font-medium ${textClass}`}>
          <Clock className={`${iconSize} shrink-0`} aria-hidden="true" />
          <span>
            {labelOverride ||
              (status === 'scheduled'
                ? 'Scheduled'
                : status === 'assigned'
                ? 'Assigned'
                : status === 'idle'
                ? 'Available / Idle'
                : status === 'submitted'
                ? 'Claim Submitted'
                : 'Batched')}
          </span>
        </span>
      );

    // Amber / Warning states
    case 'expiring_soon':
      return (
        <span className={`inline-flex items-center gap-1.5 text-[#9E6714] bg-[#FDF5E6] border border-[#F6DEC0] px-2.5 py-0.5 rounded-lg shadow-2xs font-medium ${textClass}`}>
          <AlertTriangle className={`${iconSize} shrink-0`} aria-hidden="true" />
          <span>{labelOverride || 'Expiring Soon'}</span>
        </span>
      );

    // Red / Danger states (blocks dispatch or billing)
    case 'needs_fixing':
      return (
        <span className={`inline-flex items-center gap-1.5 text-[#A82220] bg-[#FDF0F1] border border-[#F8D0D4] px-2.5 py-0.5 rounded-lg font-semibold shadow-2xs ${textClass}`}>
          <AlertOctagon className={`${iconSize} shrink-0`} aria-hidden="true" />
          <span>{labelOverride || 'Needs Fixing'}</span>
        </span>
      );

    case 'denied':
    case 'expired':
      return (
        <span className={`inline-flex items-center gap-1.5 text-[#A82220] bg-[#FDF0F1] border border-[#F8D0D4] px-2.5 py-0.5 rounded-lg font-semibold shadow-2xs ${textClass}`}>
          <XCircle className={`${iconSize} shrink-0`} aria-hidden="true" />
          <span>{labelOverride || (status === 'denied' ? 'Claim Denied' : 'Expired (Blocked)')}</span>
        </span>
      );

    case 'cancelled':
    case 'offline':
    default:
      return (
        <span className={`inline-flex items-center gap-1.5 text-[#7A5C64] bg-[#F2DEE4]/70 border border-[#E2CBD2] px-2.5 py-0.5 rounded-lg shadow-2xs font-medium ${textClass}`}>
          <Clock className={`${iconSize} shrink-0`} aria-hidden="true" />
          <span>{labelOverride || (status === 'offline' ? 'Offline' : 'Cancelled')}</span>
        </span>
      );
  }
};
