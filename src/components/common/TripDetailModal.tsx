import React, { useState } from 'react';
import { Trip } from '../../types';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from './StatusBadge';
import { VerificationChecklist } from './VerificationChecklist';
import { PhiField } from './PhiField';
import {
  X,
  MapPin,
  Clock,
  Car,
  User,
  FileText,
  DollarSign,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
  Download,
  Edit3
} from 'lucide-react';

interface TripDetailModalProps {
  trip: Trip | null;
  onClose: () => void;
  onOpenFixModal?: (trip: Trip) => void;
}

export const TripDetailModal: React.FC<TripDetailModalProps> = ({
  trip,
  onClose,
  onOpenFixModal
}) => {
  if (!trip) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs overflow-y-auto">
      <div className="bg-[#F6E6EA]/95 backdrop-blur-xl border border-[#1A0A0F]/15 rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-[#1A0A0F]">
        {/* Header */}
        <div className="p-5 border-b border-[#1A0A0F]/10 bg-white/85 backdrop-blur-md flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold font-display text-[#1A0A0F]">
                  {trip.tripNumber}
                </h3>
                <StatusBadge status={trip.status} />
                <StatusBadge status={trip.billingStatus} />
              </div>
              <p className="text-xs text-[#6B4F57] mt-0.5">
                Service Date: <strong>{trip.date}</strong> · Scheduled Pickup: <strong>{trip.scheduledPickupTime}</strong> (Appt: {trip.appointmentTime})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#6B4F57] hover:text-[#1A0A0F] hover:bg-[#ECD0D8] transition-colors"
            aria-label="Close trip details"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Denial / Needs Fixing Banner if applicable */}
          {trip.denialReason && (
            <div className="p-4 rounded-2xl bg-[#FDF0F1]/95 border border-[#F8D0D4] text-xs">
              <div className="flex items-center gap-2 font-bold text-[#A82220] mb-1">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>Medicaid Broker Claim Denial Notice: {trip.denialCode}</span>
              </div>
              <p className="text-[#A82220] leading-relaxed">{trip.denialReason}</p>
            </div>
          )}

          {/* Quick 2-Column Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Rider & Route Card */}
            <div className="p-4 rounded-2xl bg-white/85 backdrop-blur-md border border-[#1A0A0F]/10 shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#1A0A0F]/10">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-[#1A0A0F]" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#6B4F57]">
                    Rider Profile
                  </span>
                </div>
                <span className="text-xs font-semibold text-[#1A0A0F] bg-[#ECD0D8] px-2 py-0.5 rounded-lg capitalize">
                  {trip.mobilityType} Transport
                </span>
              </div>

              <div>
                <h4 className="font-bold text-base text-[#1A0A0F]">{trip.riderName}</h4>
                <div className="text-xs text-[#6B4F57] mt-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <span>Medicaid ID:</span>
                    <PhiField
                      id={`medicaid-${trip.riderId}`}
                      value={trip.riderMedicaidId}
                      riderName={trip.riderName}
                      fieldType="medicaid"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Phone:</span>
                    <PhiField
                      id={`phone-${trip.riderId}`}
                      value={trip.riderPhone}
                      riderName={trip.riderName}
                      fieldType="phone"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Escort Allowed:</span>
                    <span className="font-semibold text-[#1A0A0F]">{trip.escortRequired ? 'Yes (Mandatory)' : 'No'}</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-[#1A0A0F]/10 space-y-2 text-xs">
                <div>
                  <span className="text-[11px] font-bold text-[#1A0A0F] uppercase tracking-wider flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-[#1E5A2D]" /> Pickup Location:
                  </span>
                  <p className="text-[#1A0A0F] font-medium mt-0.5">{trip.pickupAddress}</p>
                </div>
                <div>
                  <span className="text-[11px] font-bold text-[#1A0A0F] uppercase tracking-wider flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-[#A82220]" /> Drop-Off Destination:
                  </span>
                  <p className="text-[#1A0A0F] font-medium mt-0.5">{trip.dropoffAddress}</p>
                </div>
              </div>
            </div>

            {/* Dispatch, Vehicle & Payer Card */}
            <div className="p-4 rounded-2xl bg-white/85 backdrop-blur-md border border-[#1A0A0F]/10 shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#1A0A0F]/10">
                <div className="flex items-center gap-2">
                  <Car className="w-4 h-4 text-[#1A0A0F]" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#6B4F57]">
                    Dispatch & Rate
                  </span>
                </div>
                <span className="text-xs font-mono-num font-bold text-[#1E5A2D]">
                  ${trip.fare.total.toFixed(2)} Total
                </span>
              </div>

              <div className="text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[#6B4F57]">Assigned Driver:</span>
                  <span className="font-semibold text-[#1A0A0F]">{trip.driverName || 'Unassigned'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#6B4F57]">Assigned Vehicle:</span>
                  <span className="font-semibold text-[#1A0A0F]">{trip.vehicleName || 'None'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#6B4F57]">Contracted Payer:</span>
                  <span className="font-semibold text-[#1A0A0F]">{trip.payerName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#6B4F57]">Prior Auth / Job #:</span>
                  <span className="font-mono-num font-semibold text-[#1A0A0F]">
                    {trip.authorizationNumber || <span className="text-[#A82220]">Missing Authorization</span>}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-[#1A0A0F]/10 text-xs">
                <div className="text-[11px] font-semibold text-[#6B4F57] uppercase tracking-wider mb-1">
                  Fare Calculation Ledger
                </div>
                <div className="bg-white/60 p-2.5 rounded-xl border border-[#1A0A0F]/10 space-y-1 font-mono-num text-[11px]">
                  <div className="flex justify-between">
                    <span>Base Rate ({trip.mobilityType}):</span>
                    <span>${trip.fare.baseRate.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Mileage ({trip.estimatedMiles} mi):</span>
                    <span>${trip.fare.mileageRate.toFixed(2)}</span>
                  </div>
                  {trip.fare.surcharges > 0 && (
                    <div className="flex justify-between text-[#1A0A0F] font-semibold">
                      <span>Mobility Surcharge:</span>
                      <span>+${trip.fare.surcharges.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold border-t border-[#1A0A0F]/10 pt-1 text-[#1A0A0F]">
                    <span>Total Claim Value:</span>
                    <span>${trip.fare.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* EVV Verification Section */}
          <div className="p-4 rounded-2xl bg-white/85 backdrop-blur-md border border-[#1A0A0F]/10 shadow-xs">
            <VerificationChecklist verification={trip.verification} />
          </div>

          {/* GPS Route & Timestamps Timeline */}
          <div className="p-4 rounded-2xl bg-white/85 backdrop-blur-md border border-[#1A0A0F]/10 shadow-xs">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#6B4F57] mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#1A0A0F]" />
              Immutable EVV Timestamp Timeline & Geocodes
            </h4>

            {trip.events.length === 0 ? (
              <p className="text-xs text-[#6B4F57] italic">No transit events recorded yet.</p>
            ) : (
              <div className="relative pl-6 space-y-4 before:content-[''] before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#1A0A0F]/15">
                {trip.events.map((ev, idx) => (
                  <div key={ev.id} className="relative">
                    <span className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-[#1A0A0F] ring-4 ring-white" />
                    <div className="text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#1A0A0F] capitalize">
                          {ev.type.replace('_', ' ')}
                        </span>
                        <span className="font-mono-num text-[11px] text-[#6B4F57]">
                          {new Date(ev.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#6B4F57] mt-0.5">
                        Logged by {ev.recordedByName}
                        {ev.lat && ev.lng && (
                          <span className="ml-2 font-mono-num font-semibold text-[#1A0A0F]">
                            [GPS: {ev.lat.toFixed(4)}, {ev.lng.toFixed(4)}]
                          </span>
                        )}
                      </p>
                      {ev.note && <p className="text-[11px] text-[#1A0A0F] italic mt-0.5">{ev.note}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Signature Verification */}
          <div className="p-4 rounded-2xl bg-white/85 backdrop-blur-md border border-[#1A0A0F]/10 shadow-xs">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#6B4F57] mb-2 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#1A0A0F]" />
              Service Delivery Proof & Signature
            </h4>

            {trip.signature ? (
              <div className="flex items-center justify-between bg-white/60 p-3.5 rounded-xl border border-[#1A0A0F]/10">
                <div>
                  <div className="text-xs font-bold text-[#1A0A0F]">
                    {trip.signature.unableToSign ? 'Rider Exception / Facility Attestation' : 'Rider Electronic Signature'}
                  </div>
                  <div className="text-[11px] text-[#6B4F57] mt-0.5">
                    Signer: <strong>{trip.signature.signedBy}</strong> · Captured at {new Date(trip.signature.timestamp).toLocaleTimeString()}
                  </div>
                  {trip.signature.unableToSignReason && (
                    <div className="text-[11px] text-[#9E6714] font-semibold mt-0.5">
                      Waiver reason: {trip.signature.unableToSignReason.replace('_', ' ')}
                    </div>
                  )}
                </div>

                <span className="text-xs font-mono-num text-[#1E5A2D] bg-[#EDF6EE] px-2.5 py-1 rounded-lg border border-[#C6E2CA] font-semibold flex items-center gap-1 shadow-2xs">
                  <CheckCircle className="w-3.5 h-3.5" /> Verified
                </span>
              </div>
            ) : (
              <div className="p-3 bg-[#FDF5E6] border border-[#F6DEC0] rounded-xl text-xs text-[#9E6714] font-medium">
                Signature not yet collected. Required before submitting claim to {trip.payerName}.
              </div>
            )}
          </div>

          {/* Audit Notes if any manual fixes */}
          {trip.auditNotes && trip.auditNotes.length > 0 && (
            <div className="p-4 rounded-2xl bg-white/70 backdrop-blur-md border border-[#1A0A0F]/15 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#1A0A0F]">
                Audit Log Justifications for Corrections
              </h4>
              {trip.auditNotes.map((an) => (
                <div key={an.id} className="text-xs bg-white/80 p-2.5 rounded-xl border border-[#1A0A0F]/10">
                  <div className="flex items-center justify-between text-[11px] text-[#6B4F57]">
                    <span>By: {an.userName}</span>
                    <span className="font-mono-num">{new Date(an.timestamp).toLocaleString()}</span>
                  </div>
                  <p className="font-medium text-[#1A0A0F] mt-1">{an.fieldChanged}: {an.reason}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="p-4 bg-white/85 backdrop-blur-md border-t border-[#1A0A0F]/10 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-[#6B4F57] hover:text-[#1A0A0F] transition-colors"
          >
            Close Logbook Entry
          </button>

          <div className="flex items-center gap-2">
            {trip.billingStatus === 'needs_fixing' && onOpenFixModal && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenFixModal(trip);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-[#A82220] to-[#8C1B19] hover:from-[#8C1B19] hover:to-[#721513] rounded-xl transition-all shadow-xs"
              >
                <Edit3 className="w-3.5 h-3.5" />
                Resolve Exception Now
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
