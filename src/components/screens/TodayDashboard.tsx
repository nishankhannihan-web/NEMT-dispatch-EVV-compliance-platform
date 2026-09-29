import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Trip, Driver } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { Tooltip } from '../common/Tooltip';
import {
  Calendar,
  AlertTriangle,
  DollarSign,
  FileWarning,
  ArrowRight,
  CheckCircle2,
  Clock,
  Car,
  UserCheck,
  Phone,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';

interface TodayDashboardProps {
  onOpenTripDetail: (trip: Trip) => void;
  onOpenFixModal: (trip: Trip) => void;
  onOpenNewTrip: () => void;
}

export const TodayDashboard: React.FC<TodayDashboardProps> = ({
  onOpenTripDetail,
  onOpenFixModal,
  onOpenNewTrip
}) => {
  const {
    trips,
    drivers,
    vehicles,
    setActiveScreen,
    onboardingSteps,
    toggleOnboardingStep
  } = useApp();

  const todayStr = '2026-09-28';
  const todayTrips = trips.filter((t) => t.date === todayStr);

  const completedToday = todayTrips.filter((t) => t.status === 'completed').length;
  const inProgressToday = todayTrips.filter((t) =>
    ['en_route_pickup', 'arrived_pickup', 'passenger_onboard', 'arrived_destination'].includes(t.status)
  ).length;
  const upcomingToday = todayTrips.filter((t) => ['scheduled', 'assigned'].includes(t.status)).length;

  const tripsNeedingFixing = trips.filter((t) => t.billingStatus === 'needs_fixing');
  const moneyAtRisk = tripsNeedingFixing.reduce((sum, t) => sum + t.fare.total, 0);

  // Expiring credentials count
  const expiringDrivers = drivers.flatMap((d) => d.credentials).filter((c) => c.status === 'expiring_soon' || c.status === 'expired');
  const expiringVehicles = vehicles.flatMap((v) => v.credentials).filter((c) => c.status === 'expiring_soon' || c.status === 'expired');
  const totalExpiringDocs = expiringDrivers.length + expiringVehicles.length;

  // Onboarding progress
  const completedSteps = onboardingSteps.filter((s) => s.completed).length;
  const onboardingPct = Math.round((completedSteps / onboardingSteps.length) * 100);

  return (
    <div className="space-y-6">
      {/* Page Title & Purpose */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-[#1A0A0F]">
            Today
          </h1>
          <p className="text-sm text-[#6B4F57] mt-1">
            Everything that needs you today, in one place.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenNewTrip}
            className="px-4 py-2 bg-gradient-to-r from-[#2D121B] to-[#1A0A0F] hover:from-[#3A1620] hover:to-[#240E15] text-white text-xs font-semibold rounded-xl transition-all shadow-xs"
          >
            + New Trip
          </button>
        </div>
      </div>

      {/* Top 4 Big Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Trips Today */}
        <div
          onClick={() => setActiveScreen('trips')}
          className="p-5 rounded-2xl silver-glass-card interactive-stat-card shadow-xs group"
        >
          <div className="flex items-center justify-between text-[#6B4F57]">
            <span className="text-xs font-semibold uppercase tracking-wider">Trips Today</span>
            <Calendar className="w-4 h-4 text-[#1A0A0F] group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono-num text-[#1A0A0F]">
              {todayTrips.length}
            </span>
            <span className="text-xs text-[#6B4F57]">rides total</span>
          </div>
          <div className="mt-3 pt-3 border-t border-[#1A0A0F]/10 flex items-center justify-between text-[11px] text-[#6B4F57] font-mono-num">
            <span className="text-[#1E5A2D] font-semibold">{completedToday} done</span>
            <span className="text-[#2D4F7C] font-semibold">{inProgressToday} active</span>
            <span className="text-[#6B4F57]">{upcomingToday} scheduled</span>
          </div>
        </div>

        {/* Card 2: Trips Needing Fixing */}
        <div
          onClick={() => setActiveScreen('verification')}
          className="p-5 rounded-2xl silver-glass-card interactive-stat-card shadow-xs group"
        >
          <div className="flex items-center justify-between text-[#6B4F57]">
            <div className="flex items-center">
              <span className="text-xs font-bold uppercase tracking-wider text-[#A82220]">
                Needs Fixing
              </span>
              <Tooltip content="Trips missing mandatory EVV timestamps, geocodes, signatures, or broker auth codes. Medicaid will reject unverified claims." />
            </div>
            <AlertTriangle className="w-4 h-4 text-[#A82220] group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono-num text-[#A82220]">
              {tripsNeedingFixing.length}
            </span>
            <span className="text-xs text-[#A82220] font-semibold">claims blocked</span>
          </div>
          <div className="mt-3 pt-3 border-t border-[#1A0A0F]/10 flex items-center justify-between text-[11px] text-[#A82220]">
            <span>Resolve before batching</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Card 3: Money at Risk */}
        <div
          onClick={() => setActiveScreen('billing')}
          className="p-5 rounded-2xl silver-glass-card interactive-stat-card shadow-xs group"
        >
          <div className="flex items-center justify-between text-[#6B4F57]">
            <div className="flex items-center">
              <span className="text-xs font-semibold uppercase tracking-wider">Money At Risk</span>
              <Tooltip content="Total dollar value of rides currently blocked from billing due to missing verification data or broker denials." />
            </div>
            <DollarSign className="w-4 h-4 text-[#1A0A0F] group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono-num text-[#1A0A0F]">
              ${moneyAtRisk.toFixed(2)}
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-[#1A0A0F]/10 flex items-center justify-between text-[11px] text-[#6B4F57]">
            <span>Across {tripsNeedingFixing.length} trips</span>
            <span className="text-[#1A0A0F] font-bold">Inspect</span>
          </div>
        </div>

        {/* Card 4: Expiring Soon */}
        <div
          onClick={() => setActiveScreen('fleet')}
          className="p-5 rounded-2xl silver-glass-card interactive-stat-card shadow-xs group"
        >
          <div className="flex items-center justify-between text-[#6B4F57]">
            <div className="flex items-center">
              <span className="text-xs font-semibold uppercase tracking-wider">Credentials Alert</span>
              <Tooltip content="Driver licenses, drug tests, CPR certs, or vehicle inspections expiring within 30 days, or already expired." />
            </div>
            <FileWarning className="w-4 h-4 text-[#9E6714] group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono-num text-[#9E6714]">
              {totalExpiringDocs}
            </span>
            <span className="text-xs text-[#6B4F57]">documents</span>
          </div>
          <div className="mt-3 pt-3 border-t border-[#1A0A0F]/10 flex items-center justify-between text-[11px] text-[#9E6714]">
            <span>2 hard blocks active</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>

      {/* "Do This Next" Action Queue */}
      <div className="silver-glass-card rounded-2xl p-5 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-[#1A0A0F]/10">
          <div>
            <h2 className="text-base font-bold font-display text-[#1A0A0F]">
              Do This Next
            </h2>
            <p className="text-xs text-[#6B4F57] mt-0.5">
              Prioritized tasks that directly protect today's revenue and compliance.
            </p>
          </div>
          <span className="text-xs font-mono-num text-[#1A0A0F] font-bold bg-[#ECD0D8] px-2.5 py-1 rounded-lg">
            5 items pending
          </span>
        </div>

        <div className="divide-y divide-[#1A0A0F]/10">
          {/* Action Item 1: Trip 104 missing dropoff */}
          <div className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-[#A82220] mt-1.5 shrink-0" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#1A0A0F]">
                    Trip #TP-2026-094 (Henry Jenkins)
                  </span>
                  <span className="text-[11px] font-mono-num text-[#A82220] font-semibold bg-[#FDF0F1] px-2 py-0.5 rounded-lg border border-[#F8D0D4]">
                    Missing Drop-Off Time
                  </span>
                </div>
                <p className="text-xs text-[#6B4F57] mt-0.5">
                  Driver completed transport at Grant Medical Center but did not log GPS dropoff event. $38.71 at stake.
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                const t = trips.find((item) => item.id === 'trip-104');
                if (t) onOpenFixModal(t);
              }}
              className="self-start sm:self-center px-3.5 py-1.5 bg-[#1A0A0F] hover:bg-[#3A1620] text-white text-xs font-semibold rounded-xl transition-all shadow-xs whitespace-nowrap"
            >
              Fix Exception
            </button>
          </div>

          {/* Action Item 2: Trip 105 missing prior auth */}
          <div className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-[#A82220] mt-1.5 shrink-0" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#1A0A0F]">
                    Trip #TP-2026-095 (Arthur Pendelton)
                  </span>
                  <span className="text-[11px] font-mono-num text-[#A82220] font-semibold bg-[#FDF0F1] px-2 py-0.5 rounded-lg border border-[#F8D0D4]">
                    Missing Prior Authorization
                  </span>
                </div>
                <p className="text-xs text-[#6B4F57] mt-0.5">
                  Buckeye Health requires pre-auth before dispatch. Wheelchair lift surcharge ($92.49 total) pending auth code.
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                const t = trips.find((item) => item.id === 'trip-105');
                if (t) onOpenFixModal(t);
              }}
              className="self-start sm:self-center px-3.5 py-1.5 bg-[#1A0A0F] hover:bg-[#3A1620] text-white text-xs font-semibold rounded-xl transition-all shadow-xs whitespace-nowrap"
            >
              Enter Auth Code
            </button>
          </div>

          {/* Action Item 3: Denied claim 082 */}
          <div className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-[#A82220] mt-1.5 shrink-0" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#1A0A0F]">
                    Denied Claim #TP-2026-082 (Eleanor Vance)
                  </span>
                  <span className="text-[11px] font-mono-num text-[#A82220] font-semibold bg-[#FDF0F1] px-2 py-0.5 rounded-lg border border-[#F8D0D4]">
                    Denied: Code CO-16 / N56
                  </span>
                </div>
                <p className="text-xs text-[#6B4F57] mt-0.5">
                  Buckeye rejected line item: missing transport modifier U1. Ready to correct and resubmit for $65.13.
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveScreen('billing')}
              className="self-start sm:self-center px-3.5 py-1.5 bg-white/90 border border-[#1A0A0F]/20 hover:bg-[#ECD0D8] text-[#1A0A0F] text-xs font-semibold rounded-xl transition-all shadow-xs whitespace-nowrap"
            >
              Fix in Denial Tracker
            </button>
          </div>

          {/* Action Item 4: Unassigned ride Dorothy Campbell */}
          <div className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-[#9E6714] mt-1.5 shrink-0" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#1A0A0F]">
                    Unassigned Trip: Dorothy Campbell @ 11:15 AM
                  </span>
                  <span className="text-[11px] font-mono-num text-[#9E6714] font-semibold bg-[#FDF5E6] px-2 py-0.5 rounded-lg border border-[#F6DEC0]">
                    Ambulatory Van
                  </span>
                </div>
                <p className="text-xs text-[#6B4F57] mt-0.5">
                  Pickup scheduled in 2 hours to Riverside Methodist. Driver Terrence Washington (#201) is currently idle.
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveScreen('dispatch')}
              className="self-start sm:self-center px-3.5 py-1.5 bg-[#1A0A0F] hover:bg-[#3A1620] text-white text-xs font-semibold rounded-xl transition-all shadow-xs whitespace-nowrap"
            >
              Open Dispatch Board
            </button>
          </div>

          {/* Action Item 5: Expired driver credential */}
          <div className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-[#A82220] mt-1.5 shrink-0" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#1A0A0F]">
                    Driver Compliance Block: Dwayne Miller
                  </span>
                  <span className="text-[11px] font-mono-num text-[#A82220] font-semibold bg-[#FDF0F1] px-2 py-0.5 rounded-lg border border-[#F8D0D4]">
                    BCI Background Expired
                  </span>
                </div>
                <p className="text-xs text-[#6B4F57] mt-0.5">
                  Automatic safety lock engaged. Dwayne is blocked from dispatches until renewed document is on file.
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveScreen('fleet')}
              className="self-start sm:self-center px-3.5 py-1.5 bg-white/90 border border-[#A82220] text-[#A82220] hover:bg-[#FDF0F1] text-xs font-semibold rounded-xl transition-all shadow-xs whitespace-nowrap"
            >
              Upload Renewal
            </button>
          </div>
        </div>
      </div>

      {/* Live Driver Fleet Strip */}
      <div className="silver-glass-card rounded-2xl p-5 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-[#1A0A0F]/10">
          <div>
            <h2 className="text-base font-bold font-display text-[#1A0A0F] flex items-center gap-2">
              <Car className="w-4 h-4 text-[#1A0A0F]" />
              Live Driver & Vehicle Status
            </h2>
            <p className="text-xs text-[#6B4F57] mt-0.5">
              Real-time driver activity across your 8 fleet operators.
            </p>
          </div>
          <button
            onClick={() => setActiveScreen('dispatch')}
            className="text-xs font-semibold text-[#1A0A0F] hover:underline flex items-center gap-1"
          >
            <span>Timeline Grid</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3">
          {drivers.map((drv) => {
            const hasExpired = drv.credentials.some((c) => c.status === 'expired');
            const veh = vehicles.find((v) => v.id === drv.assignedVehicleId);

            return (
              <div
                key={drv.id}
                className={`hover-cream-card p-3.5 rounded-xl border transition-all cursor-pointer ${
                  hasExpired
                    ? 'bg-[#FDF0F1]/90 border-[#F8D0D4]'
                    : drv.status === 'on_trip'
                    ? 'bg-[#EEF3F8]/90 border-[#CADAEB]'
                    : 'silver-glass-chip'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-[#1A0A0F] truncate">{drv.name}</span>
                  <StatusBadge status={drv.status} />
                </div>

                <div className="text-[11px] text-[#6B4F57] mt-1 space-y-0.5">
                  <div className="truncate">Vehicle: {veh ? veh.plateNumber : 'None assigned'}</div>
                  {hasExpired ? (
                    <div className="text-[#A82220] font-semibold flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 shrink-0" />
                      <span>Dispatch Blocked (Expired Doc)</span>
                    </div>
                  ) : drv.currentTripId ? (
                    <div className="text-[#2D4F7C] font-semibold truncate">
                      On Trip #{trips.find((t) => t.id === drv.currentTripId)?.tripNumber || 'Active'}
                    </div>
                  ) : (
                    <div className="text-[#1E5A2D] font-medium">Available for dispatch</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* First-Run Onboarding Checklist */}
      <div className="silver-glass-card rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1A0A0F]/10">
          <div>
            <h2 className="text-base font-bold font-display text-[#1A0A0F] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#1A0A0F]" />
              NEMT Provider Onboarding & Compliance Setup
            </h2>
            <p className="text-xs text-[#6B4F57] mt-0.5">
              Complete these steps to ensure your fleet meets state Medicaid EVV requirements.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono-num font-bold text-[#1A0A0F] bg-[#ECD0D8] px-2.5 py-1 rounded-lg">
              {completedSteps} / {onboardingSteps.length} Complete ({onboardingPct}%)
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-[#1A0A0F]/10 h-2 rounded-full overflow-hidden mt-3">
          <div
            className="bg-[#1A0A0F] h-full transition-all duration-300"
            style={{ width: `${onboardingPct}%` }}
          />
        </div>

        {/* Steps List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
          {onboardingSteps.map((step) => (
            <div
              key={step.id}
              onClick={() => toggleOnboardingStep(step.id)}
              className={`hover-cream-card p-4 rounded-xl border text-xs cursor-pointer transition-all ${
                step.completed
                  ? 'silver-glass-chip border-[#C6E2CA] text-[#1A0A0F]'
                  : 'silver-glass-chip hover:border-white'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <span className={`font-semibold ${step.completed ? 'line-through text-[#6B4F57]' : 'text-[#1A0A0F]'}`}>
                  {step.title}
                </span>
                <span
                  className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                    step.completed ? 'bg-[#1E5A2D] text-white' : 'border border-[#1A0A0F]'
                  }`}
                >
                  {step.completed && <CheckCircle2 className="w-3.5 h-3.5" />}
                </span>
              </div>
              <p className="text-[11px] text-[#6B4F57] mt-1 leading-relaxed">
                {step.description}
              </p>
              <div className="mt-2 text-[10px] text-[#1A0A0F] font-bold flex items-center gap-0.5">
                <span>{step.completed ? 'Mark Incomplete' : step.actionLabel}</span>
                <ChevronRight className="w-3 h-3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
