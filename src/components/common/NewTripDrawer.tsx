import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MobilityType, Trip } from '../../types';
import { X, Calendar, AlertTriangle, Clock, MapPin, User, Check, Plus } from 'lucide-react';

interface NewTripDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onTripCreated?: (trip: Trip) => void;
}

export const NewTripDrawer: React.FC<NewTripDrawerProps> = ({ isOpen, onClose, onTripCreated }) => {
  const { riders, payers, addTrip } = useApp();

  const [selectedRiderId, setSelectedRiderId] = useState(riders[0]?.id || '');
  const [selectedPayerId, setSelectedPayerId] = useState(payers[0]?.id || '');
  const [date, setDate] = useState('2026-09-28');
  const [scheduledPickupTime, setScheduledPickupTime] = useState('09:30');
  const [appointmentTime, setAppointmentTime] = useState('10:15');
  const [pickupAddress, setPickupAddress] = useState(riders[0]?.homeAddress || '');
  const [dropoffAddress, setDropoffAddress] = useState(riders[0]?.defaultDropoffAddress || '');
  const [mobilityType, setMobilityType] = useState<MobilityType>(riders[0]?.mobilityType || 'wheelchair');
  const [authorizationNumber, setAuthorizationNumber] = useState('');
  const [escortRequired, setEscortRequired] = useState(false);
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringDays, setRecurringDays] = useState<string[]>(['Mon', 'Wed', 'Fri']);
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const currentRider = riders.find((r) => r.id === selectedRiderId);
  const currentPayer = payers.find((p) => p.id === selectedPayerId);

  // When rider changes, prefill home & clinic address & mobility
  const handleRiderChange = (riderId: string) => {
    setSelectedRiderId(riderId);
    const r = riders.find((item) => item.id === riderId);
    if (r) {
      setPickupAddress(r.homeAddress);
      setDropoffAddress(r.defaultDropoffAddress);
      setMobilityType(r.mobilityType);
      setEscortRequired(r.escortRequired);
      if (r.preferredPayerId) setSelectedPayerId(r.preferredPayerId);
    }
  };

  const toggleDay = (day: string) => {
    setRecurringDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newTrip = addTrip({
      riderId: selectedRiderId,
      riderName: currentRider?.name,
      payerId: selectedPayerId,
      payerName: currentPayer?.name,
      date,
      scheduledPickupTime,
      appointmentTime,
      pickupAddress,
      dropoffAddress,
      mobilityType,
      authorizationNumber,
      escortRequired,
      isRecurring,
      recurringDays: isRecurring ? recurringDays : [],
      notes
    });

    if (onTripCreated) onTripCreated(newTrip);
    onClose();
  };

  // Smart inline warnings
  const showWheelchairNotice = mobilityType === 'wheelchair' && currentRider?.mobilityType === 'wheelchair';
  const showPriorAuthWarning = currentPayer?.requiresPriorAuth && !authorizationNumber.trim();

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-[#F6E6EA]/95 backdrop-blur-xl text-[#1A0A0F] h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-200 border-l border-[#1A0A0F]/15">
        {/* Header */}
        <div className="p-5 border-b border-[#1A0A0F]/10 bg-white/85 backdrop-blur-md flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold font-display text-[#1A0A0F]">Book New NEMT Trip</h3>
            <p className="text-xs text-[#6B4F57] mt-0.5">Pre-validates EVV requirements and payer authorization rules</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#6B4F57] hover:text-[#1A0A0F] hover:bg-[#ECD0D8] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Rider Selection */}
          <div className="bg-white/85 backdrop-blur-md p-4 rounded-2xl border border-[#1A0A0F]/10 shadow-xs space-y-2">
            <label className="block text-xs font-bold text-[#1A0A0F] uppercase tracking-wider">
              1. Rider Details *
            </label>
            <select
              value={selectedRiderId}
              onChange={(e) => handleRiderChange(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-[#1A0A0F]/15 bg-white text-[#1A0A0F] focus:outline-none focus:ring-1 focus:ring-[#1A0A0F]"
            >
              {riders.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} ({r.mobilityType.toUpperCase()}) — {r.homeAddress.split(',')[0]}
                </option>
              ))}
            </select>

            {currentRider && (
              <div className="text-[11px] text-[#6B4F57] bg-white/60 p-2.5 rounded-xl border border-[#1A0A0F]/10">
                <span>Medicaid ID: <strong>{currentRider.medicaidId}</strong></span> ·
                <span className="ml-2">Mobility: <strong className="capitalize">{currentRider.mobilityType}</strong></span>
                {currentRider.physicianCertOnFile && (
                  <span className="ml-2 text-[#1E5A2D] font-semibold">✓ Doctor Cert on file</span>
                )}
              </div>
            )}
          </div>

          {/* Mobility & Vehicle Requirement */}
          <div className="bg-white/85 backdrop-blur-md p-4 rounded-2xl border border-[#1A0A0F]/10 shadow-xs space-y-2">
            <label className="block text-xs font-bold text-[#1A0A0F] uppercase tracking-wider">
              2. Level of Need & Mobility *
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['walking', 'wheelchair', 'stretcher'] as MobilityType[]).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setMobilityType(type)}
                  className={`p-2.5 rounded-xl border text-xs text-center capitalize transition-all ${
                    mobilityType === type
                      ? 'border-[#1A0A0F] bg-[#ECD0D8] text-[#1A0A0F] font-bold shadow-xs'
                      : 'border-[#1A0A0F]/15 bg-white text-[#6B4F57] hover:bg-[#ECD0D8]/40'
                  }`}
                >
                  {type === 'walking' ? '🚶 Ambulatory' : type === 'wheelchair' ? '♿ Wheelchair' : '🛏️ Stretcher'}
                </button>
              ))}
            </div>

            {/* Smart warning */}
            {showWheelchairNotice && (
              <div className="flex items-center gap-1.5 text-[11px] text-[#1E5A2D] bg-[#EDF6EE] p-2.5 rounded-xl border border-[#C6E2CA]">
                <Check className="w-3.5 h-3.5 shrink-0" />
                <span>Rider has valid wheelchair physician certification. Wheelchair lift surcharge will apply.</span>
              </div>
            )}
          </div>

          {/* Schedule & Times */}
          <div className="bg-white/85 backdrop-blur-md p-4 rounded-2xl border border-[#1A0A0F]/10 shadow-xs space-y-3">
            <label className="block text-xs font-bold text-[#1A0A0F] uppercase tracking-wider">
              3. Date & Appointment Window *
            </label>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[11px] text-[#6B4F57] mb-0.5">Date</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-[#1A0A0F]/15 bg-white text-[#1A0A0F] font-mono-num focus:outline-none focus:ring-1 focus:ring-[#1A0A0F]"
                />
              </div>
              <div>
                <label className="block text-[11px] text-[#6B4F57] mb-0.5">Pickup Window</label>
                <input
                  type="time"
                  required
                  value={scheduledPickupTime}
                  onChange={(e) => setScheduledPickupTime(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-[#1A0A0F]/15 bg-white text-[#1A0A0F] font-mono-num focus:outline-none focus:ring-1 focus:ring-[#1A0A0F]"
                />
              </div>
              <div>
                <label className="block text-[11px] text-[#6B4F57] mb-0.5">Clinic Appt Time</label>
                <input
                  type="time"
                  required
                  value={appointmentTime}
                  onChange={(e) => setAppointmentTime(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-[#1A0A0F]/15 bg-white text-[#1A0A0F] font-mono-num focus:outline-none focus:ring-1 focus:ring-[#1A0A0F]"
                />
              </div>
            </div>

            {/* Recurring weekly toggle */}
            <div className="pt-2 border-t border-[#1A0A0F]/10 space-y-2">
              <label className="flex items-center gap-2 cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={isRecurring}
                  onChange={(e) => setIsRecurring(e.target.checked)}
                  className="rounded text-[#1A0A0F] focus:ring-[#1A0A0F]"
                />
                <span className="font-semibold text-[#1A0A0F]">Recurring Standing Order (e.g. Dialysis, Chemo, Wound Care)</span>
              </label>

              {isRecurring && (
                <div className="flex gap-1.5 pt-1">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => {
                    const active = recurringDays.includes(day);
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => toggleDay(day)}
                        className={`px-3 py-1 text-xs rounded-xl border transition-colors ${
                          active
                            ? 'bg-[#1A0A0F] text-white border-[#1A0A0F] font-semibold'
                            : 'bg-white text-[#6B4F57] border-[#1A0A0F]/15'
                        }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Locations */}
          <div className="bg-white/85 backdrop-blur-md p-4 rounded-2xl border border-[#1A0A0F]/10 shadow-xs space-y-3">
            <label className="block text-xs font-bold text-[#1A0A0F] uppercase tracking-wider">
              4. Pickup & Drop-Off Locations *
            </label>
            <div>
              <label className="block text-[11px] text-[#6B4F57] mb-0.5 flex items-center gap-1 font-medium">
                <MapPin className="w-3 h-3 text-[#1E5A2D]" /> Pickup Origin
              </label>
              <input
                type="text"
                required
                value={pickupAddress}
                onChange={(e) => setPickupAddress(e.target.value)}
                placeholder="Street address, City, Zip"
                className="w-full text-xs p-2.5 rounded-xl border border-[#1A0A0F]/15 bg-white text-[#1A0A0F] focus:outline-none focus:ring-1 focus:ring-[#1A0A0F]"
              />
            </div>
            <div>
              <label className="block text-[11px] text-[#6B4F57] mb-0.5 flex items-center gap-1 font-medium">
                <MapPin className="w-3 h-3 text-[#A82220]" /> Drop-Off Destination
              </label>
              <input
                type="text"
                required
                value={dropoffAddress}
                onChange={(e) => setDropoffAddress(e.target.value)}
                placeholder="Hospital/Clinic name and street address"
                className="w-full text-xs p-2.5 rounded-xl border border-[#1A0A0F]/15 bg-white text-[#1A0A0F] focus:outline-none focus:ring-1 focus:ring-[#1A0A0F]"
              />
            </div>
          </div>

          {/* Payer & Prior Authorization */}
          <div className="bg-white/85 backdrop-blur-md p-4 rounded-2xl border border-[#1A0A0F]/10 shadow-xs space-y-3">
            <label className="block text-xs font-bold text-[#1A0A0F] uppercase tracking-wider">
              5. Payer & Billing Compliance
            </label>
            <div>
              <label className="block text-[11px] text-[#6B4F57] mb-0.5">Contracted Payer / Broker</label>
              <select
                value={selectedPayerId}
                onChange={(e) => setSelectedPayerId(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-[#1A0A0F]/15 bg-white text-[#1A0A0F] focus:outline-none focus:ring-1 focus:ring-[#1A0A0F]"
              >
                {payers.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.shortCode})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] text-[#6B4F57] mb-0.5 font-medium">
                Broker Prior Authorization # {currentPayer?.requiresPriorAuth && <span className="text-[#A82220] font-semibold">* (Required)</span>}
              </label>
              <input
                type="text"
                value={authorizationNumber}
                onChange={(e) => setAuthorizationNumber(e.target.value)}
                placeholder="e.g. AUTH-BCH-88201"
                className="w-full text-xs p-2.5 rounded-xl border border-[#1A0A0F]/15 bg-white text-[#1A0A0F] font-mono-num focus:outline-none focus:ring-1 focus:ring-[#1A0A0F]"
              />
            </div>

            {/* Smart warning if prior auth missing */}
            {showPriorAuthWarning && (
              <div className="flex items-center gap-1.5 text-[11px] text-[#9E6714] bg-[#FDF5E6] p-2.5 rounded-xl border border-[#F6DEC0]">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>
                  {currentPayer?.shortCode} requires prior authorization. You can book this trip now, but it will be flagged as "Needs Fixing" until an auth number is entered.
                </span>
              </div>
            )}
          </div>

          {/* Additional details */}
          <div className="bg-white/85 backdrop-blur-md p-4 rounded-2xl border border-[#1A0A0F]/10 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={escortRequired}
                  onChange={(e) => setEscortRequired(e.target.checked)}
                  className="rounded text-[#1A0A0F] focus:ring-[#1A0A0F]"
                />
                <span className="text-[#1A0A0F] font-medium">Rider requires passenger escort</span>
              </label>
            </div>

            <div>
              <label className="block text-[11px] text-[#6B4F57] mb-0.5">Driver Dispatch Notes</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Ring side buzzer, patient uses portable oxygen"
                className="w-full text-xs p-2.5 rounded-xl border border-[#1A0A0F]/15 bg-white text-[#1A0A0F] focus:outline-none focus:ring-1 focus:ring-[#1A0A0F]"
              />
            </div>
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#2D121B] to-[#1A0A0F] hover:from-[#3A1620] hover:to-[#240E15] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Book Trip & Check Compliance
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
