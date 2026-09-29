import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Trip, Driver, Vehicle } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import {
  CalendarDays,
  Clock,
  UserCheck,
  AlertTriangle,
  AlertOctagon,
  Send,
  CheckCircle2,
  X,
  Plus,
  Car,
  ChevronRight
} from 'lucide-react';

interface DispatchBoardScreenProps {
  onOpenTripDetail: (trip: Trip) => void;
  onOpenFixModal: (trip: Trip) => void;
}

export const DispatchBoardScreen: React.FC<DispatchBoardScreenProps> = ({
  onOpenTripDetail
}) => {
  const { trips, drivers, vehicles, assignTrip, addToast, setActiveScreen } = useApp();

  const [selectedUnassignedTrip, setSelectedUnassignedTrip] = useState<Trip | null>(null);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [targetDriverId, setTargetDriverId] = useState<string>('');
  const [targetVehicleId, setTargetVehicleId] = useState<string>('');
  const [conflictWarning, setConflictWarning] = useState<string | null>(null);

  const hours = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17];
  const todayStr = '2026-09-28';
  const todayTrips = trips.filter((t) => t.date === todayStr);

  const unassignedTrips = todayTrips.filter((t) => !t.driverId || t.status === 'scheduled');

  const openAssignDialog = (trip: Trip) => {
    setSelectedUnassignedTrip(trip);
    // Suggest first active non-blocked driver & suitable vehicle
    const validDriver = drivers.find((d) => !d.credentials.some((c) => c.status === 'expired'));
    const validVehicle = vehicles.find((v) => {
      if (trip.mobilityType === 'wheelchair') return v.maxWheelchairs > 0 && v.status !== 'grounded';
      if (trip.mobilityType === 'stretcher') return v.type === 'stretcher_van' && v.status !== 'grounded';
      return v.status !== 'grounded';
    });

    setTargetDriverId(validDriver?.id || drivers[0].id);
    setTargetVehicleId(validVehicle?.id || vehicles[0].id);
    setConflictWarning(null);
    setAssignModalOpen(true);
  };

  const handleDriverChange = (driverId: string) => {
    setTargetDriverId(driverId);
    checkConflicts(driverId, targetVehicleId);
  };

  const handleVehicleChange = (vehicleId: string) => {
    setTargetVehicleId(vehicleId);
    checkConflicts(targetDriverId, vehicleId);
  };

  const checkConflicts = (dId: string, vId: string) => {
    if (!selectedUnassignedTrip) return;
    const drv = drivers.find((d) => d.id === dId);
    const veh = vehicles.find((v) => v.id === vId);

    if (drv?.credentials.some((c) => c.status === 'expired')) {
      const exp = drv.credentials.find((c) => c.status === 'expired');
      setConflictWarning(`HARD BLOCK: ${drv.name} has an expired ${exp?.name}. State regulations prohibit dispatch.`);
      return;
    }

    if (veh?.credentials.some((c) => c.status === 'expired')) {
      const exp = veh.credentials.find((c) => c.status === 'expired');
      setConflictWarning(`HARD BLOCK: ${veh.name} has an expired ${exp?.name}. Vehicle is grounded.`);
      return;
    }

    if (selectedUnassignedTrip.mobilityType === 'wheelchair' && veh && veh.maxWheelchairs === 0) {
      setConflictWarning(`INCOMPATIBLE: ${selectedUnassignedTrip.riderName} is in a wheelchair, but ${veh.name} has no wheelchair lift/ramp.`);
      return;
    }

    if (selectedUnassignedTrip.mobilityType === 'stretcher' && veh && veh.type !== 'stretcher_van') {
      setConflictWarning(`INCOMPATIBLE: Stretcher transport requires stretcher van (#301).`);
      return;
    }

    // Check overlapping schedule
    const driverTrips = todayTrips.filter((t) => t.driverId === dId);
    const tripHour = parseInt(selectedUnassignedTrip.scheduledPickupTime.split(':')[0], 10);
    const overlap = driverTrips.some((t) => {
      const h = parseInt(t.scheduledPickupTime.split(':')[0], 10);
      return Math.abs(h - tripHour) < 1;
    });

    if (overlap) {
      setConflictWarning(`TIMING WARNING: ${drv?.name} already has a trip scheduled within 45 minutes of this pickup. Tight schedule risk.`);
      return;
    }

    setConflictWarning(null);
  };

  const handleConfirmAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUnassignedTrip) return;

    const res = assignTrip(selectedUnassignedTrip.id, targetDriverId, targetVehicleId);
    if (res.success) {
      setAssignModalOpen(false);
      setSelectedUnassignedTrip(null);
    }
  };

  const handleSendToDriver = (trip: Trip) => {
    addToast({
      type: 'success',
      title: 'Dispatched to Mobile App',
      message: `Push alert sent to ${trip.driverName} for ${trip.tripNumber}. Acknowledged on vehicle tablet.`
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-[#1A0A0F]">
            Dispatch Board
          </h1>
          <p className="text-sm text-[#6B4F57] mt-1">
            Drag a trip to a driver. We'll warn you if something's wrong.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-[#1A0A0F] font-semibold silver-glass-chip px-3.5 py-1.5 rounded-xl shadow-xs">
            Date: <strong className="font-bold">Today, Sep 28, 2026</strong>
          </span>
        </div>
      </div>

      {/* Main Board Layout: Left Unassigned Trips + Right Timeline Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Unassigned Trips Queue (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="silver-glass-card rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#1A0A0F]/10">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#1A0A0F]" />
                <h3 className="font-bold text-sm text-[#1A0A0F]">
                  Unassigned Rides Queue
                </h3>
              </div>
              <span className="text-xs font-mono-num font-bold text-[#9E6714] bg-[#FDF5E6]/90 px-2.5 py-0.5 rounded-lg border border-[#F6DEC0] shadow-xs">
                {unassignedTrips.length} Pending
              </span>
            </div>

            <p className="text-xs text-[#6B4F57] mt-2 mb-3">
              Rides needing vehicle & driver matching for today. Click "Assign" to preview conflict safety checks.
            </p>

            <div className="space-y-3">
              {unassignedTrips.length === 0 ? (
                <div className="p-6 text-center text-xs text-[#6B4F57] bg-white/50 backdrop-blur-sm rounded-xl border border-dashed border-[#1A0A0F]/15">
                  <CheckCircle2 className="w-6 h-6 text-[#1E5A2D] mx-auto mb-1" />
                  <p className="font-bold text-[#1A0A0F]">All rides assigned!</p>
                  <p className="text-[11px] mt-0.5">Your fleet is fully scheduled for today.</p>
                </div>
              ) : (
                unassignedTrips.map((trip) => (
                  <div
                    key={trip.id}
                    className="hover-cream-card p-3.5 rounded-xl border border-white/60 bg-white/70 backdrop-blur-sm shadow-xs space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#1A0A0F] font-mono-num">
                        {trip.scheduledPickupTime}
                      </span>
                      <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-lg bg-[#ECD0D8] text-[#1A0A0F]">
                        {trip.mobilityType}
                      </span>
                    </div>

                    <div>
                      <div className="font-bold text-[#1A0A0F] text-sm">{trip.riderName}</div>
                      <div className="text-[11px] text-[#6B4F57] truncate mt-0.5" title={trip.pickupAddress}>
                        Pickup: {trip.pickupAddress.split(',')[0]}
                      </div>
                      <div className="text-[11px] text-[#6B4F57] truncate" title={trip.dropoffAddress}>
                        Drop: {trip.dropoffAddress.split(',')[0]}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-[#1A0A0F]/10 flex items-center justify-between">
                      <span className="text-[11px] font-mono-num font-bold text-[#1E5A2D]">
                        ${trip.fare.total.toFixed(2)}
                      </span>
                      <button
                        onClick={() => openAssignDialog(trip)}
                        className="px-3 py-1.5 bg-[#1A0A0F] hover:bg-[#3A1620] text-white text-xs font-semibold rounded-xl transition-all shadow-xs"
                      >
                        Assign Driver →
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Driver Timeline Grid (8 cols) */}
        <div className="lg:col-span-8 silver-glass-card rounded-2xl p-5 shadow-xs overflow-hidden flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-[#1A0A0F]/10">
            <div>
              <h3 className="font-bold text-sm text-[#1A0A0F]">
                Driver Schedule & Real-Time Availability
              </h3>
              <p className="text-xs text-[#6B4F57] mt-0.5">
                Horizontal timeline across 7:00 AM to 5:00 PM. Expired drivers are hard-blocked.
              </p>
            </div>
          </div>

          {/* Timeline Table */}
          <div className="overflow-x-auto mt-4">
            <div className="min-w-[650px]">
              {/* Hours Header */}
              <div className="grid grid-cols-12 gap-1 pb-2 border-b border-[#1A0A0F]/10 text-[11px] text-[#6B4F57] font-mono-num">
                <div className="col-span-3 font-bold text-[#1A0A0F]">Driver / Vehicle</div>
                {hours.map((h) => (
                  <div key={h} className="col-span-1 text-center font-semibold">
                    {h > 12 ? `${h - 12}p` : `${h}a`}
                  </div>
                ))}
              </div>

              {/* Driver Rows */}
              <div className="divide-y divide-[#1A0A0F]/10">
                {drivers.map((driver) => {
                  const hasExpired = driver.credentials.some((c) => c.status === 'expired');
                  const assignedVehicle = vehicles.find((v) => v.id === driver.assignedVehicleId);
                  const isVehGrounded = assignedVehicle?.status === 'grounded';
                  const driverTodayTrips = todayTrips.filter((t) => t.driverId === driver.id);

                  return (
                    <div
                      key={driver.id}
                      className={`grid grid-cols-12 gap-1 py-3 items-center ${
                        hasExpired || isVehGrounded ? 'bg-[#FDF0F1]/60' : ''
                      }`}
                    >
                      {/* Driver & Vehicle info */}
                      <div className="col-span-3 pr-2">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-xs text-[#1A0A0F] truncate">
                            {driver.name}
                          </span>
                        </div>
                        <div className="text-[10px] text-[#6B4F57] truncate mt-0.5">
                          {assignedVehicle ? assignedVehicle.name.split('(')[0] : 'No vehicle'}
                        </div>

                        {hasExpired ? (
                          <div className="text-[10px] text-[#A82220] font-bold flex items-center gap-1 mt-0.5">
                            <AlertOctagon className="w-3 h-3 shrink-0" />
                            <span>BLOCKED: Expired Doc</span>
                          </div>
                        ) : isVehGrounded ? (
                          <div className="text-[10px] text-[#A82220] font-bold flex items-center gap-1 mt-0.5">
                            <AlertOctagon className="w-3 h-3 shrink-0" />
                            <span>VEHICLE GROUNDED</span>
                          </div>
                        ) : null}
                      </div>

                      {/* Hour slots */}
                      {hours.map((h) => {
                        // Find trip in this hour
                        const tripInHour = driverTodayTrips.find((t) => {
                          const tripH = parseInt(t.scheduledPickupTime.split(':')[0], 10);
                          return tripH === h;
                        });

                        const isBlocked = hasExpired || isVehGrounded;

                        return (
                          <div
                            key={h}
                            className={`col-span-1 h-12 rounded-lg flex flex-col justify-center items-center text-[10px] p-1 transition-all ${
                              isBlocked
                                ? 'dispatch-slot-blocked'
                                : tripInHour
                                ? 'dispatch-slot-box bg-gradient-to-r from-[#2D121B] to-[#1A0A0F] text-white font-medium border border-[#1A0A0F] shadow-xs'
                                : 'dispatch-slot-box bg-white/70 backdrop-blur-sm border border-white/70 text-[#6B4F57] shadow-2xs'
                            }`}
                            onClick={() => {
                              if (tripInHour) onOpenTripDetail(tripInHour);
                            }}
                            title={
                              tripInHour
                                ? `${tripInHour.tripNumber}: ${tripInHour.riderName} (${tripInHour.scheduledPickupTime})`
                                : isBlocked
                                ? 'Driver document expired / vehicle grounded - dispatch blocked'
                                : `Available hour (${h > 12 ? `${h - 12}:00 PM` : `${h}:00 AM`})`
                            }
                          >
                            {tripInHour ? (
                              <div className="text-center w-full truncate">
                                <span className="font-bold text-[9px] block">
                                  {tripInHour.scheduledPickupTime}
                                </span>
                                <span className="truncate block opacity-90 text-[8px]">
                                  {tripInHour.riderName.split(' ')[0]}
                                </span>
                              </div>
                            ) : null}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Quick Notification simulator action */}
          <div className="mt-4 pt-3 border-t border-[#1A0A0F]/10 flex flex-col sm:flex-row items-center justify-between text-xs text-[#6B4F57] gap-2">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-[#1A0A0F]" /> Booked Ride
              <span className="w-2.5 h-2.5 rounded bg-white border border-[#1A0A0F]/20 ml-2" /> Free Window
              <span className="w-2.5 h-2.5 rounded bg-[#FDF0F1] border border-[#F8D0D4] ml-2" /> Compliance Block
            </span>

            <button
              onClick={() => {
                const activeOnTrip = trips.find((t) => t.status === 'passenger_onboard' || t.status === 'assigned');
                if (activeOnTrip) handleSendToDriver(activeOnTrip);
              }}
              className="inline-flex items-center gap-1 text-[#1A0A0F] hover:underline font-semibold"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Simulate Broadcast Trip Update</span>
            </button>
          </div>
        </div>
      </div>

      {/* Manual Assignment Modal with Safety & Conflict Engine */}
      {assignModalOpen && selectedUnassignedTrip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-[#F6E6EA]/95 backdrop-blur-xl border border-[#1A0A0F]/15 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-[#1A0A0F]">
            <div className="p-4 bg-white/85 backdrop-blur-md border-b border-[#1A0A0F]/10 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base font-display text-[#1A0A0F]">
                  Assign Trip {selectedUnassignedTrip.tripNumber}
                </h3>
                <p className="text-xs text-[#6B4F57] mt-0.5">
                  Rider: <strong>{selectedUnassignedTrip.riderName}</strong> ({selectedUnassignedTrip.mobilityType}) @ {selectedUnassignedTrip.scheduledPickupTime}
                </p>
              </div>
              <button
                onClick={() => setAssignModalOpen(false)}
                className="p-1.5 rounded-xl text-[#6B4F57] hover:text-[#1A0A0F] hover:bg-[#ECD0D8]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmAssignment} className="p-5 space-y-4">
              {/* Conflict banner */}
              {conflictWarning && (
                <div
                  className={`p-3.5 rounded-xl text-xs flex items-start gap-2 ${
                    conflictWarning.startsWith('HARD BLOCK') || conflictWarning.startsWith('INCOMPATIBLE')
                      ? 'bg-[#FDF0F1] border border-[#F8D0D4] text-[#A82220]'
                      : 'bg-[#FDF5E6] border border-[#F6DEC0] text-[#9E6714]'
                  }`}
                >
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div className="leading-relaxed font-medium">
                    <strong>Notice:</strong> {conflictWarning}
                  </div>
                </div>
              )}

              {/* Driver select */}
              <div>
                <label className="block text-xs font-bold text-[#1A0A0F] uppercase tracking-wider mb-1">
                  1. Assign Driver *
                </label>
                <select
                  value={targetDriverId}
                  onChange={(e) => handleDriverChange(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-[#1A0A0F]/15 bg-white text-[#1A0A0F] focus:outline-none focus:ring-1 focus:ring-[#1A0A0F]"
                >
                  {drivers.map((d) => {
                    const isExp = d.credentials.some((c) => c.status === 'expired');
                    return (
                      <option key={d.id} value={d.id}>
                        {d.name} {isExp ? '⛔ (EXPIRED CREDENTIAL - BLOCKED)' : `(${d.status})`}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Vehicle select */}
              <div>
                <label className="block text-xs font-bold text-[#1A0A0F] uppercase tracking-wider mb-1">
                  2. Assign Fleet Vehicle *
                </label>
                <select
                  value={targetVehicleId}
                  onChange={(e) => handleVehicleChange(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-[#1A0A0F]/15 bg-white text-[#1A0A0F] focus:outline-none focus:ring-1 focus:ring-[#1A0A0F]"
                >
                  {vehicles.map((v) => {
                    const isGrounded = v.status === 'grounded';
                    return (
                      <option key={v.id} value={v.id}>
                        {v.name} {isGrounded ? '⛔ (GROUNDED - EXPIRED LIFT CHECK)' : `[${v.type.replace('_', ' ')}]`}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#1A0A0F]/10">
                <button
                  type="button"
                  onClick={() => setAssignModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-[#6B4F57] hover:text-[#1A0A0F]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!!conflictWarning && (conflictWarning.startsWith('HARD BLOCK') || conflictWarning.startsWith('INCOMPATIBLE'))}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-[#2D121B] to-[#1A0A0F] hover:from-[#3A1620] hover:to-[#240E15] disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all shadow-xs"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Confirm Dispatch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
