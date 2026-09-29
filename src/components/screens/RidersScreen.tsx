import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Rider, Trip } from '../../types';
import { PhiField } from '../common/PhiField';
import {
  Users,
  Search,
  Plus,
  Phone,
  MapPin,
  FileCheck,
  FileX,
  History,
  ShieldCheck,
  X,
  AlertCircle
} from 'lucide-react';

interface RidersScreenProps {
  onOpenTripDetail: (trip: Trip) => void;
}

export const RidersScreen: React.FC<RidersScreenProps> = ({ onOpenTripDetail }) => {
  const { riders, trips, addRider } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRider, setSelectedRider] = useState<Rider | null>(riders[0] || null);
  const [newRiderModalOpen, setNewRiderModalOpen] = useState(false);

  // New rider form states
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newMedicaidId, setNewMedicaidId] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newClinic, setNewClinic] = useState('');
  const [newMobility, setNewMobility] = useState<'walking' | 'wheelchair' | 'stretcher'>('walking');
  const [newNotes, setNewNotes] = useState('');

  const filteredRiders = riders.filter((r) => {
    const q = searchQuery.toLowerCase();
    return (
      r.name.toLowerCase().includes(q) ||
      r.medicaidId.toLowerCase().includes(q) ||
      r.homeAddress.toLowerCase().includes(q)
    );
  });

  const riderTrips = selectedRider
    ? trips.filter((t) => t.riderId === selectedRider.id)
    : [];

  const handleCreateRider = (e: React.FormEvent) => {
    e.preventDefault();
    addRider({
      name: newName,
      phone: newPhone || '(614) 555-4019',
      medicaidId: newMedicaidId || `OH-${Math.floor(10000000 + Math.random() * 90000000)}`,
      homeAddress: newAddress || '100 High St, Columbus, OH',
      defaultDropoffAddress: newClinic || 'OhioHealth Clinic',
      mobilityType: newMobility,
      specialNotes: newNotes,
      physicianCertOnFile: newMobility !== 'walking'
    });
    setNewRiderModalOpen(false);
    setNewName('');
    setNewPhone('');
    setNewMedicaidId('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-[#1A0A0F]">
            Riders
          </h1>
          <p className="text-sm text-[#6B4F57] mt-1">
            Who we transport and what they need.
          </p>
        </div>

        <button
          onClick={() => setNewRiderModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-[#2D121B] to-[#1A0A0F] hover:from-[#3A1620] hover:to-[#240E15] text-white text-xs font-semibold rounded-xl transition-all shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Rider</span>
        </button>
      </div>

      {/* Main Split: Left Rider List + Right Selected Profile */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Rider List (5 cols) */}
        <div className="lg:col-span-5 bg-white/85 backdrop-blur-md border border-[#1A0A0F]/10 rounded-2xl p-4 shadow-xs space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-[#6B4F57] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search rider name or address..."
              className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-[#1A0A0F]/15 bg-white text-[#1A0A0F] focus:outline-none focus:ring-1 focus:ring-[#1A0A0F]"
            />
          </div>

          <div className="divide-y divide-[#1A0A0F]/10 max-h-[600px] overflow-y-auto">
            {filteredRiders.map((rider) => {
              const isSelected = selectedRider?.id === rider.id;
              return (
                <div
                  key={rider.id}
                  onClick={() => setSelectedRider(rider)}
                  className={`p-3 rounded-xl cursor-pointer transition-all duration-200 ease-out ${
                    isSelected
                      ? 'bg-[#ECD0D8] border border-[#1A0A0F]/20'
                      : 'hover:bg-[#ECD0D8] hover:-translate-y-[2px] hover:shadow-[0_6px_16px_-2px_rgba(26,10,15,0.12)] hover:relative hover:z-10'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-[#1A0A0F]">{rider.name}</span>
                    <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-lg bg-white/80 border border-[#1A0A0F]/10 text-[#6B4F57]">
                      {rider.mobilityType}
                    </span>
                  </div>

                  <div className="text-[11px] text-[#6B4F57] mt-1 flex items-center justify-between">
                    <span className="truncate max-w-[200px]">{rider.homeAddress.split(',')[0]}</span>
                    <span>DOB: {rider.dateOfBirth.slice(0, 4)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Rider Details & Trip History (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {selectedRider ? (
            <div className="bg-white/85 backdrop-blur-md border border-[#1A0A0F]/10 rounded-2xl p-5 shadow-xs space-y-5">
              {/* Profile Card Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#1A0A0F]/10 gap-2">
                <div>
                  <h3 className="text-xl font-bold font-display text-[#1A0A0F]">
                    {selectedRider.name}
                  </h3>
                  <div className="text-xs text-[#6B4F57] flex items-center gap-3 mt-1">
                    <span>DOB: <strong>{selectedRider.dateOfBirth}</strong></span>
                    <span>·</span>
                    <span className="capitalize font-semibold text-[#1A0A0F]">
                      {selectedRider.mobilityType === 'wheelchair' ? '♿ Wheelchair Transport' : selectedRider.mobilityType === 'stretcher' ? '🛏️ Stretcher Transport' : '🚶 Ambulatory Walking'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#1E5A2D] bg-[#EDF6EE] border border-[#C6E2CA] px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1 shadow-2xs">
                    <ShieldCheck className="w-3.5 h-3.5" /> HIPAA Masked
                  </span>
                </div>
              </div>

              {/* PHI Sensitive details with reveal */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-white/60 p-4 rounded-2xl border border-[#1A0A0F]/10">
                <div>
                  <span className="text-[#6B4F57] block text-[11px] mb-1 font-medium">State Medicaid ID (PHI):</span>
                  <PhiField
                    id={`medicaid-${selectedRider.id}`}
                    value={selectedRider.medicaidId}
                    riderName={selectedRider.name}
                    fieldType="medicaid"
                  />
                </div>

                <div>
                  <span className="text-[#6B4F57] block text-[11px] mb-1 font-medium">Contact Phone:</span>
                  <PhiField
                    id={`phone-${selectedRider.id}`}
                    value={selectedRider.phone}
                    riderName={selectedRider.name}
                    fieldType="phone"
                  />
                </div>

                <div className="sm:col-span-2 pt-2 border-t border-[#1A0A0F]/10 space-y-1">
                  <span className="text-[#6B4F57] block text-[11px] font-medium">Pickup Origin Address:</span>
                  <p className="font-semibold text-[#1A0A0F] flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#1E5A2D] shrink-0" />
                    {selectedRider.homeAddress}
                  </p>
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <span className="text-[#6B4F57] block text-[11px] font-medium">Primary Medical Facility / Dialysis:</span>
                  <p className="font-semibold text-[#1A0A0F] flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#A82220] shrink-0" />
                    {selectedRider.defaultDropoffAddress}
                  </p>
                </div>
              </div>

              {/* Medical Necessity Certification */}
              <div className="p-3.5 rounded-xl border text-xs bg-white/80 border-[#1A0A0F]/10 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#1A0A0F] uppercase tracking-wider text-[11px]">
                    Physician Certification of Medical Necessity
                  </span>
                  {selectedRider.physicianCertOnFile ? (
                    <span className="text-[#1E5A2D] font-semibold flex items-center gap-1">
                      <FileCheck className="w-3.5 h-3.5" /> On File (Expires: {selectedRider.physicianCertExpiry})
                    </span>
                  ) : (
                    <span className="text-[#6B4F57] flex items-center gap-1 font-medium">
                      <FileX className="w-3.5 h-3.5" /> Not required for walking
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-[#6B4F57]">
                  Required by Medicaid MCOs to bill wheelchair lift and stretcher transport codes without automated denial.
                </p>
              </div>

              {/* Special Driver Notes */}
              {selectedRider.specialNotes && (
                <div className="p-3.5 bg-[#FDF5E6] border border-[#F6DEC0] rounded-xl text-xs text-[#1A0A0F]">
                  <span className="font-bold text-[#9E6714] block text-[11px] uppercase tracking-wider mb-0.5">
                    Driver Assistance & Care Instructions:
                  </span>
                  {selectedRider.specialNotes}
                </div>
              )}

              {/* Rider Trip History */}
              <div className="space-y-2 pt-2 border-t border-[#1A0A0F]/10">
                <h4 className="font-bold text-xs text-[#1A0A0F] uppercase tracking-wider flex items-center gap-1.5">
                  <History className="w-4 h-4 text-[#1A0A0F]" />
                  Ride History ({riderTrips.length} transports logged)
                </h4>

                {riderTrips.length === 0 ? (
                  <p className="text-xs text-[#6B4F57] italic">No prior trips recorded for this rider.</p>
                ) : (
                  <div className="space-y-2">
                    {riderTrips.map((t) => (
                      <div
                        key={t.id}
                        onClick={() => onOpenTripDetail(t)}
                        className="p-3 rounded-xl border border-[#1A0A0F]/10 hover:border-[#1A0A0F]/30 bg-white/70 hover:bg-white flex items-center justify-between text-xs cursor-pointer transition-colors shadow-2xs"
                      >
                        <div>
                          <div className="font-bold text-[#1A0A0F] font-mono-num">{t.tripNumber}</div>
                          <div className="text-[11px] text-[#6B4F57]">
                            {t.date} @ {t.scheduledPickupTime} · {t.payerName.split(' ')[0]}
                          </div>
                        </div>
                        <div className="text-right font-mono-num">
                          <span className="font-bold text-[#1A0A0F]">${t.fare.total.toFixed(2)}</span>
                          <span className="block text-[10px] text-[#1E5A2D] font-semibold capitalize">{t.billingStatus.replace('_', ' ')}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white/85 backdrop-blur-md border border-[#1A0A0F]/10 rounded-2xl p-12 text-center text-xs text-[#6B4F57]">
              Select a rider from the left to view medical mobility profile.
            </div>
          )}
        </div>
      </div>

      {/* New Rider Modal */}
      {newRiderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-[#F6E6EA]/95 backdrop-blur-xl border border-[#1A0A0F]/15 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-[#1A0A0F]">
            <div className="p-4 bg-white/85 backdrop-blur-md border-b border-[#1A0A0F]/10 flex items-center justify-between">
              <h3 className="font-bold text-base font-display text-[#1A0A0F]">
                Enroll New NEMT Rider
              </h3>
              <button
                onClick={() => setNewRiderModalOpen(false)}
                className="p-1.5 rounded-xl text-[#6B4F57] hover:text-[#1A0A0F] hover:bg-[#ECD0D8]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRider} className="p-5 space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-[#6B4F57] mb-0.5">Rider Full Name *</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Ronald Campbell"
                  className="w-full p-2.5 rounded-xl border border-[#1A0A0F]/15 bg-white text-[#1A0A0F] focus:outline-none focus:ring-1 focus:ring-[#1A0A0F]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-[#6B4F57] mb-0.5">Medicaid ID *</label>
                  <input
                    type="text"
                    required
                    value={newMedicaidId}
                    onChange={(e) => setNewMedicaidId(e.target.value)}
                    placeholder="OH-99281729"
                    className="w-full p-2.5 rounded-xl border border-[#1A0A0F]/15 bg-white text-[#1A0A0F] font-mono-num focus:outline-none focus:ring-1 focus:ring-[#1A0A0F]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#6B4F57] mb-0.5">Phone Number</label>
                  <input
                    type="text"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="(614) 555-0199"
                    className="w-full p-2.5 rounded-xl border border-[#1A0A0F]/15 bg-white text-[#1A0A0F] font-mono-num focus:outline-none focus:ring-1 focus:ring-[#1A0A0F]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#6B4F57] mb-0.5">Home Pickup Address *</label>
                <input
                  type="text"
                  required
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  placeholder="1234 Main St, Columbus, OH"
                  className="w-full p-2.5 rounded-xl border border-[#1A0A0F]/15 bg-white text-[#1A0A0F] focus:outline-none focus:ring-1 focus:ring-[#1A0A0F]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#6B4F57] mb-0.5">Default Dialysis / Clinic Destination</label>
                <input
                  type="text"
                  value={newClinic}
                  onChange={(e) => setNewClinic(e.target.value)}
                  placeholder="Wexner Outpatient Dialysis"
                  className="w-full p-2.5 rounded-xl border border-[#1A0A0F]/15 bg-white text-[#1A0A0F] focus:outline-none focus:ring-1 focus:ring-[#1A0A0F]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#6B4F57] mb-0.5">Mobility Level</label>
                <select
                  value={newMobility}
                  onChange={(e) => setNewMobility(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl border border-[#1A0A0F]/15 bg-white text-[#1A0A0F] focus:outline-none focus:ring-1 focus:ring-[#1A0A0F]"
                >
                  <option value="walking">Ambulatory (Walking / Cane / Walker)</option>
                  <option value="wheelchair">Wheelchair (Requires Ramp / Lift Van)</option>
                  <option value="stretcher">Stretcher (Requires Ferno Cot Gurney)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#6B4F57] mb-0.5">Care & Boarding Notes</label>
                <input
                  type="text"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="e.g. Needs driver to knock firmly on back door"
                  className="w-full p-2.5 rounded-xl border border-[#1A0A0F]/15 bg-white text-[#1A0A0F] focus:outline-none focus:ring-1 focus:ring-[#1A0A0F]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#1A0A0F]/10">
                <button
                  type="button"
                  onClick={() => setNewRiderModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-[#6B4F57] hover:text-[#1A0A0F]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-[#2D121B] to-[#1A0A0F] hover:from-[#3A1620] hover:to-[#240E15] rounded-xl transition-all shadow-xs"
                >
                  Save Rider
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
