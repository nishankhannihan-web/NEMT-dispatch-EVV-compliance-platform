import React, { useState } from 'react';
import { Trip } from '../../types';
import { useApp } from '../../context/AppContext';
import { X, ShieldAlert, CheckCircle2, FileEdit } from 'lucide-react';

interface FixTripModalProps {
  trip: Trip | null;
  onClose: () => void;
}

export const FixTripModal: React.FC<FixTripModalProps> = ({ trip, onClose }) => {
  const { fixTripVerification } = useApp();

  const [authNumber, setAuthNumber] = useState(trip?.authorizationNumber || '');
  const [dropoffTime, setDropoffTime] = useState('08:35');
  const [signatureReason, setSignatureReason] = useState<string>('facility_staff_signed');
  const [staffName, setStaffName] = useState('RN Jessica Keller, Charge Nurse');
  const [auditReason, setAuditReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!trip) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!auditReason.trim()) return;

    setIsSubmitting(true);

    const updates: Partial<Trip> = {};

    if (!trip.authorizationNumber && authNumber.trim()) {
      updates.authorizationNumber = authNumber.trim();
    }

    if (!trip.verification.exactTimes) {
      // Add missing dropoff event
      updates.events = [
        ...trip.events,
        {
          id: 'ev-fix-' + Date.now(),
          tripId: trip.id,
          type: 'arrived_dropoff',
          timestamp: new Date().toISOString(),
          lat: trip.dropoffLat,
          lng: trip.dropoffLng,
          recordedByUserId: 'usr-manual-fix',
          recordedByName: 'Billing Override',
          note: `Manual drop-off time reconciled: ${dropoffTime}. Reason: Driver mobile cell drop.`
        },
        {
          id: 'ev-fix-comp-' + Date.now(),
          tripId: trip.id,
          type: 'completed',
          timestamp: new Date().toISOString(),
          lat: trip.dropoffLat,
          lng: trip.dropoffLng,
          recordedByUserId: 'usr-manual-fix',
          recordedByName: 'Billing Override',
          note: 'Marked completed after verification review.'
        }
      ];
    }

    if (!trip.verification.signature) {
      updates.signature = {
        signedBy: staffName,
        timestamp: new Date().toISOString(),
        unableToSign: true,
        unableToSignReason: signatureReason as any
      };
    }

    fixTripVerification(trip.id, updates, auditReason);
    setIsSubmitting(false);
    onClose();
  };

  const missingItems: string[] = [];
  if (!trip.authorizationNumber && trip.payerId !== 'pyr-3') missingItems.push('Missing Prior Authorization / Broker Job Code');
  if (!trip.verification.exactTimes || !trip.verification.locations) missingItems.push('Missing Drop-Off GPS Timestamp (Driver device disconnect)');
  if (!trip.verification.signature) missingItems.push('Missing Rider Signature / Proof of Service Waiver');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white/95 backdrop-blur-xl border border-[#1A0A0F]/15 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-[#1A0A0F]">
        <div className="p-4 bg-[#FDF0F1] border-b border-[#F8D0D4] flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-[#A82220]">
            <ShieldAlert className="w-5 h-5 shrink-0" />
            <div>
              <h3 className="font-bold text-base font-display">Resolve Trip Verification Exception</h3>
              <p className="text-[11px] text-[#A82220]">{trip.tripNumber} · {trip.riderName}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-[#A82220] hover:bg-[#F8D0D4]/60">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="p-3.5 bg-white/80 border border-[#1A0A0F]/10 rounded-xl">
            <h4 className="text-xs font-bold text-[#1A0A0F] uppercase tracking-wider mb-1.5">
              Identified Compliance Blocks (Why this trip will fail claim submission):
            </h4>
            <ul className="text-xs text-[#1A0A0F] space-y-1 list-disc list-inside">
              {missingItems.length > 0 ? (
                missingItems.map((item, i) => (
                  <li key={i} className="text-[#A82220] font-semibold">{item}</li>
                ))
              ) : (
                <li className="text-[#6B4F57]">Manual review flagged for audit reconciliation.</li>
              )}
            </ul>
          </div>

          {/* Missing fields inputs */}
          {(!trip.authorizationNumber || missingItems.some(i => i.includes('Authorization'))) && (
            <div>
              <label className="block text-xs font-semibold text-[#1A0A0F] mb-1">
                Enter Prior Authorization Number from Broker Portal *
              </label>
              <input
                type="text"
                required
                value={authNumber}
                onChange={(e) => setAuthNumber(e.target.value)}
                placeholder="e.g. AUTH-BCH-99214"
                className="w-full text-xs p-2.5 rounded-xl border border-[#1A0A0F]/15 bg-white text-[#1A0A0F] font-mono-num focus:outline-none focus:ring-1 focus:ring-[#1A0A0F]"
              />
            </div>
          )}

          {(!trip.verification.exactTimes || missingItems.some(i => i.includes('Drop-Off'))) && (
            <div>
              <label className="block text-xs font-semibold text-[#1A0A0F] mb-1">
                Confirmed Drop-Off Time at Medical Facility *
              </label>
              <input
                type="time"
                required
                value={dropoffTime}
                onChange={(e) => setDropoffTime(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-[#1A0A0F]/15 bg-white text-[#1A0A0F] font-mono-num focus:outline-none focus:ring-1 focus:ring-[#1A0A0F]"
              />
              <span className="text-[10px] text-[#6B4F57] mt-0.5 block">
                Destination GPS coordinates ({trip.dropoffLat.toFixed(4)}, {trip.dropoffLng.toFixed(4)}) will be paired with this time.
              </span>
            </div>
          )}

          {(!trip.verification.signature || missingItems.some(i => i.includes('Signature'))) && (
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-[#1A0A0F]">
                Service Verification Exception Waiver Reason *
              </label>
              <select
                value={signatureReason}
                onChange={(e) => setSignatureReason(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-[#1A0A0F]/15 bg-white text-[#1A0A0F] focus:outline-none focus:ring-1 focus:ring-[#1A0A0F]"
              >
                <option value="facility_staff_signed">Facility staff / Nurse signed off on paper intake sheet</option>
                <option value="physical_impairment">Rider physical tremor/impairment prevents touchscreen signature</option>
                <option value="cognitive_impairment">Cognitive memory impairment (authorized verbal consent)</option>
                <option value="medical_emergency">Immediate transport to ER triage upon arrival</option>
              </select>

              <div>
                <label className="block text-[11px] text-[#6B4F57] mb-0.5 font-medium">Facility Signer / Staff Attestation Name</label>
                <input
                  type="text"
                  required
                  value={staffName}
                  onChange={(e) => setStaffName(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-[#1A0A0F]/15 bg-white text-[#1A0A0F] focus:outline-none focus:ring-1 focus:ring-[#1A0A0F]"
                />
              </div>
            </div>
          )}

          {/* MANDATORY AUDIT NOTE */}
          <div className="p-3.5 bg-[#FDF5E6] border border-[#F6DEC0] rounded-xl space-y-1">
            <label className="block text-xs font-bold text-[#9E6714]">
              Mandatory Audit Reason (Required for state Medicaid inspection) *
            </label>
            <textarea
              required
              rows={2}
              value={auditReason}
              onChange={(e) => setAuditReason(e.target.value)}
              placeholder="e.g. Confirmed with dialysis center front desk logbook; driver experienced battery depletion."
              className="w-full text-xs p-2.5 rounded-xl border border-[#1A0A0F]/15 bg-white text-[#1A0A0F] focus:outline-none focus:ring-1 focus:ring-[#1A0A0F]"
            />
            <span className="text-[10px] text-[#6B4F57] block">
              This note is permanently recorded with your user ID and timestamp in the immutable audit trail.
            </span>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#1A0A0F]/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-[#6B4F57] hover:text-[#1A0A0F]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !auditReason.trim()}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-[#1E5A2D] to-[#154220] hover:from-[#266e37] hover:to-[#1a5127] disabled:opacity-50 rounded-xl transition-all shadow-xs"
            >
              <CheckCircle2 className="w-4 h-4" />
              Save Correction & Move to Ready to Bill
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
