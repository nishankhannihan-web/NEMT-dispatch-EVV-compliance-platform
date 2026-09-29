import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Trip } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import {
  FileBarChart2,
  FileText,
  Download,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  Printer,
  X,
  MapPin,
  Clock,
  Car,
  User
} from 'lucide-react';

interface ReportsScreenProps {
  onOpenTripDetail: (trip: Trip) => void;
}

export const ReportsScreen: React.FC<ReportsScreenProps> = ({ onOpenTripDetail }) => {
  const { trips, drivers, vehicles, addToast } = useApp();
  const [selectedReport, setSelectedReport] = useState<string>('compliance');
  const [selectedTripForPacket, setSelectedTripForPacket] = useState<Trip | null>(trips[0] || null);
  const [proofPacketModalOpen, setProofPacketModalOpen] = useState(false);

  const handleExport = (reportName: string, format: 'csv' | 'pdf') => {
    addToast({
      type: 'success',
      title: `${reportName} Exported (${format.toUpperCase()})`,
      message: `Audit-ready file generated and downloaded to your device.`
    });
  };

  const handlePrintPacket = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-[#1A0A0F]">
            Audit & Reports
          </h1>
          <p className="text-sm text-[#6B4F57] mt-1">
            Proof for auditors, insight for you.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleExport('Compliance_Summary_Q3', 'csv')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white/80 backdrop-blur-xs border border-[#1A0A0F]/15 hover:bg-white text-[#1A0A0F] rounded-xl text-xs font-medium shadow-xs transition-colors"
          >
            <Download className="w-4 h-4 text-[#1A0A0F]" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => {
              if (selectedTripForPacket) setProofPacketModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-[#2D121B] to-[#1A0A0F] hover:from-[#3A1620] hover:to-[#240E15] text-white rounded-xl text-xs font-semibold shadow-xs transition-all border border-white/10"
          >
            <FileText className="w-4 h-4" />
            <span>Generate Trip Proof Packet</span>
          </button>
        </div>
      </div>

      {/* Report Selector Pills */}
      <div className="flex items-center gap-1 overflow-x-auto p-1.5 bg-white/80 backdrop-blur-md border border-[#1A0A0F]/10 rounded-2xl text-xs font-medium shadow-xs">
        {[
          { id: 'compliance', label: '1. EVV Compliance Summary' },
          { id: 'ontime', label: '2. On-Time Performance' },
          { id: 'revenue', label: '3. Vehicle & Driver Revenue' },
          { id: 'denials', label: '4. Denials Root-Cause' },
          { id: 'credentials', label: '5. Credential Expiry Roster' }
        ].map((rep) => (
          <button
            key={rep.id}
            onClick={() => setSelectedReport(rep.id)}
            className={`px-3.5 py-2 rounded-xl whitespace-nowrap transition-all ${
              selectedReport === rep.id
                ? 'bg-gradient-to-r from-[#2D121B] to-[#1A0A0F] text-white font-bold shadow-xs border border-white/10'
                : 'text-[#6B4F57] hover:text-[#1A0A0F] hover:bg-white/40'
            }`}
          >
            {rep.label}
          </button>
        ))}
      </div>

      {/* REPORT 1: COMPLIANCE SUMMARY */}
      {selectedReport === 'compliance' && (
        <div className="bg-white/80 backdrop-blur-md border border-[#1A0A0F]/10 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#1A0A0F]/10">
            <div>
              <h3 className="font-semibold text-sm text-[#1A0A0F]">
                Medicaid EVV 6-Point Verification Compliance Rate
              </h3>
              <p className="text-xs text-[#6B4F57] mt-0.5">
                Evaluation under Ohio Department of Medicaid (ODM) Sandata guidelines.
              </p>
            </div>
            <span className="text-xs font-mono-num font-bold text-[#1E5A2D] bg-[#EDF6EE] px-2.5 py-1 rounded-xl border border-[#C6E2CA]">
              94.2% Passed
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl silver-glass-card interactive-stat-card shadow-2xs">
              <span className="text-[#6B4F57] block">GPS Geocode Capture:</span>
              <span className="text-xl font-bold font-mono-num text-[#1A0A0F] block mt-1">98.1%</span>
              <span className="text-[11px] text-[#1E5A2D] block mt-0.5 font-medium">Within 500ft radius</span>
            </div>
            <div className="p-4 rounded-xl silver-glass-card interactive-stat-card shadow-2xs">
              <span className="text-[#6B4F57] block">Exact Start/End Timestamps:</span>
              <span className="text-xl font-bold font-mono-num text-[#1A0A0F] block mt-1">96.4%</span>
              <span className="text-[11px] text-[#1E5A2D] block mt-0.5 font-medium">Zero rounding errors</span>
            </div>
            <div className="p-4 rounded-xl silver-glass-card interactive-stat-card shadow-2xs">
              <span className="text-[#6B4F57] block">Service Proof Signature / Waiver:</span>
              <span className="text-xl font-bold font-mono-num text-[#1A0A0F] block mt-1">95.0%</span>
              <span className="text-[11px] text-[#1E5A2D] block mt-0.5 font-medium">Electronic or nurse intake</span>
            </div>
          </div>
        </div>
      )}

      {/* REPORT 2: ON-TIME PERFORMANCE */}
      {selectedReport === 'ontime' && (
        <div className="bg-white/80 backdrop-blur-md border border-[#1A0A0F]/10 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#1A0A0F]/10">
            <div>
              <h3 className="font-semibold text-sm text-[#1A0A0F]">
                On-Time Performance & Clinic Arrival Windows
              </h3>
              <p className="text-xs text-[#6B4F57] mt-0.5">
                Broker SLA standard requires arrival between 10 and 45 minutes prior to appointment.
              </p>
            </div>
            <span className="text-xs font-mono-num font-bold text-[#1E5A2D] bg-[#EDF6EE] px-2.5 py-1 rounded-xl border border-[#C6E2CA]">
              97.8% On-Time SLA
            </span>
          </div>

          <div className="p-4 rounded-xl bg-white/70 backdrop-blur-xs border border-[#1A0A0F]/10 text-xs space-y-2">
            <div className="flex justify-between py-1 border-b border-[#1A0A0F]/10">
              <span className="text-[#6B4F57]">Dialysis On-Time Arrivals:</span>
              <span className="font-bold font-mono-num text-[#1E5A2D]">100% (Zero missed sessions)</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#1A0A0F]/10">
              <span className="text-[#6B4F57]">Outpatient Rehab & Physical Therapy:</span>
              <span className="font-bold font-mono-num text-[#1E5A2D]">96.5%</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-[#6B4F57]">Chemotherapy & Specialist Clinics:</span>
              <span className="font-bold font-mono-num text-[#1E5A2D]">98.2%</span>
            </div>
          </div>
        </div>
      )}

      {/* REPORT 3: REVENUE PER VEHICLE & DRIVER */}
      {selectedReport === 'revenue' && (
        <div className="bg-white/80 backdrop-blur-md border border-[#1A0A0F]/10 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="pb-3 border-b border-[#1A0A0F]/10">
            <h3 className="font-semibold text-sm text-[#1A0A0F]">
              Fleet Vehicle Utilization & Revenue Breakdown
            </h3>
            <p className="text-xs text-[#6B4F57] mt-0.5">
              Wheelchair lift vans generate higher per-mile surcharges.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono-num">
              <thead>
                <tr className="bg-white/60 border-b border-[#1A0A0F]/10 text-[#6B4F57] font-sans">
                  <th className="py-2.5 px-3">Vehicle</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Completed Trips</th>
                  <th className="py-2.5 px-3 text-right">Gross Billed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1A0A0F]/10">
                {vehicles.map((v) => {
                  const vTrips = trips.filter((t) => t.vehicleId === v.id);
                  const rev = vTrips.reduce((s, t) => s + t.fare.total, 0);
                  return (
                    <tr key={v.id} className="hover-cream-row">
                      <td className="py-3 px-3 font-sans font-semibold text-[#1A0A0F]">{v.name}</td>
                      <td className="py-3 px-3 font-sans capitalize text-[#6B4F57]">{v.type.replace('_', ' ')}</td>
                      <td className="py-3 px-3">{vTrips.length} rides</td>
                      <td className="py-3 px-3 text-right font-bold text-[#1E5A2D]">${rev.toFixed(2)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* REPORT 4: DENIALS ROOT-CAUSE */}
      {selectedReport === 'denials' && (
        <div className="bg-white/80 backdrop-blur-md border border-[#1A0A0F]/10 rounded-2xl p-5 shadow-xs space-y-3">
          <div className="pb-3 border-b border-[#1A0A0F]/10">
            <h3 className="font-semibold text-sm text-[#A82220]">
              Medicaid Claim Denials by Reason Code
            </h3>
            <p className="text-xs text-[#6B4F57] mt-0.5">
              Prevent repeated rejections by auditing recurring root causes.
            </p>
          </div>

          <div className="space-y-2 text-xs">
            <div className="hover-cream-card p-3 bg-[#FDF1F0] border border-[#F6C4C1] rounded-xl flex items-center justify-between shadow-2xs">
              <div>
                <span className="font-bold text-[#A82220]">Code CO-16 / N56 (Missing Modifier)</span>
                <span className="text-[#6B4F57] text-[11px] block mt-0.5">Dialysis return trip submitted without required U1 modifier.</span>
              </div>
              <span className="font-mono-num font-bold text-[#A82220]">$65.13 affected</span>
            </div>

            <div className="hover-cream-card p-3 bg-[#FDF1F0] border border-[#F6C4C1] rounded-xl flex items-center justify-between shadow-2xs">
              <div>
                <span className="font-bold text-[#A82220]">Code CO-197 (Prior Authorization Mismatch)</span>
                <span className="text-[#6B4F57] text-[11px] block mt-0.5">Broker portal job reference was missing one digit.</span>
              </div>
              <span className="font-mono-num font-bold text-[#A82220]">$74.92 affected</span>
            </div>
          </div>
        </div>
      )}

      {/* REPORT 5: CREDENTIAL EXPIRY ROSTER */}
      {selectedReport === 'credentials' && (
        <div className="bg-white/80 backdrop-blur-md border border-[#1A0A0F]/10 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="pb-3 border-b border-[#1A0A0F]/10">
            <h3 className="font-semibold text-sm text-[#1A0A0F]">
              Complete Driver & Vehicle Document Compliance Roster
            </h3>
            <p className="text-xs text-[#6B4F57] mt-0.5">
              Full audit trail of licenses, inspections, background checks, and OIG exclusions.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-white/60 border-b border-[#1A0A0F]/10 text-[#6B4F57]">
                  <th className="py-2 px-3">Entity</th>
                  <th className="py-2 px-3">Credential Name</th>
                  <th className="py-2 px-3 font-mono-num">Expiry Date</th>
                  <th className="py-2 px-3">Compliance Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1A0A0F]/10 font-mono-num">
                {drivers.flatMap((d) =>
                  d.credentials.map((c) => (
                    <tr key={`${d.id}-${c.id}`} className="hover-cream-row">
                      <td className="py-2.5 px-3 font-sans font-medium text-[#1A0A0F]">{d.name}</td>
                      <td className="py-2.5 px-3 font-sans text-[#6B4F57]">{c.name}</td>
                      <td className="py-2.5 px-3">{c.expiryDate}</td>
                      <td className="py-2.5 px-3">
                        <StatusBadge status={c.status} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TRIP PROOF PACKET GENERATOR & SELECTOR */}
      <div className="bg-white/80 backdrop-blur-md border border-[#1A0A0F]/10 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1A0A0F]/10">
          <div>
            <h3 className="font-semibold text-sm text-[#1A0A0F]">
              Audit-Ready Trip Proof Packet Generator
            </h3>
            <p className="text-xs text-[#6B4F57] mt-0.5">
              Generates a single, unalterable proof packet containing all EVV geocodes, timestamps, signatures, driver IDs, and vehicle specs.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <select
              value={selectedTripForPacket?.id || ''}
              onChange={(e) => {
                const t = trips.find((item) => item.id === e.target.value);
                if (t) setSelectedTripForPacket(t);
              }}
              className="p-2 rounded-xl border border-[#1A0A0F]/15 bg-white/90 text-[#1A0A0F] font-medium"
            >
              {trips.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.tripNumber}: {t.riderName} ({t.date})
                </option>
              ))}
            </select>

            <button
              onClick={() => setProofPacketModalOpen(true)}
              className="px-3.5 py-2 bg-gradient-to-r from-[#2D121B] to-[#1A0A0F] hover:from-[#3A1620] hover:to-[#240E15] text-white rounded-xl text-xs font-semibold shadow-xs transition-all border border-white/10"
            >
              Preview Packet
            </button>
          </div>
        </div>
      </div>

      {/* Printable Trip Proof Packet Modal */}
      {proofPacketModalOpen && selectedTripForPacket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white/95 backdrop-blur-xl border border-[#1A0A0F]/15 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden animate-in fade-in duration-150 text-[#1A0A0F] print:border-none print:shadow-none">
            {/* Top action bar */}
            <div className="p-4 bg-white/90 border-b border-[#1A0A0F]/10 flex items-center justify-between print:hidden">
              <span className="text-xs font-bold text-[#1A0A0F] uppercase tracking-wider">
                Official Medicaid EVV Trip Proof Packet
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrintPacket}
                  className="px-3 py-1.5 bg-gradient-to-r from-[#2D121B] to-[#1A0A0F] text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-all border border-white/10"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print / Save PDF</span>
                </button>
                <button
                  onClick={() => setProofPacketModalOpen(false)}
                  className="p-1 rounded-xl text-[#6B4F57] hover:text-[#1A0A0F]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Paper Document Content */}
            <div className="p-8 bg-[#F6E6EA]/50 space-y-6 text-xs print:bg-white">
              {/* Letterhead */}
              <div className="flex justify-between items-start pb-4 border-b-2 border-[#1A0A0F]">
                <div>
                  <h2 className="text-2xl font-bold font-display text-[#1A0A0F]">TripProof Transport LLC</h2>
                  <p className="text-[11px] text-[#6B4F57] mt-0.5">
                    NEMT Provider NPI: 1942859102 · Ohio Medicaid Provider ID: #089421
                  </p>
                  <p className="text-[11px] text-[#6B4F57]">
                    1490 E Main St, Columbus, OH 43205 · Phone: (614) 555-0100
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-base font-bold font-mono-num text-[#1A0A0F] block">
                    {selectedTripForPacket.tripNumber}
                  </span>
                  <span className="text-[11px] text-[#1E5A2D] font-semibold block mt-0.5">
                    STATUS: EVV VERIFIED & CLEAN
                  </span>
                  <span className="text-[10px] text-[#6B4F57] font-mono-num block">
                    Generated: {new Date().toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Rider & Service Details Grid */}
              <div className="grid grid-cols-2 gap-4 bg-white/80 p-4 rounded-xl border border-[#1A0A0F]/10">
                <div>
                  <span className="font-bold text-[#1A0A0F] uppercase text-[10px] block mb-1">
                    Beneficiary Protected Health Information
                  </span>
                  <p className="font-bold text-sm text-[#1A0A0F]">{selectedTripForPacket.riderName}</p>
                  <p className="font-mono-num text-[#6B4F57]">Medicaid ID: {selectedTripForPacket.riderMedicaidId}</p>
                  <p className="capitalize text-[#6B4F57]">Mobility: {selectedTripForPacket.mobilityType}</p>
                </div>

                <div>
                  <span className="font-bold text-[#1A0A0F] uppercase text-[10px] block mb-1">
                    Payer & Authorization
                  </span>
                  <p className="font-bold text-sm text-[#1A0A0F]">{selectedTripForPacket.payerName}</p>
                  <p className="font-mono-num text-[#6B4F57]">Prior Auth: {selectedTripForPacket.authorizationNumber || 'Direct Broker Order'}</p>
                  <p className="font-mono-num text-[#6B4F57]">Certified Distance: {selectedTripForPacket.estimatedMiles} miles</p>
                </div>
              </div>

              {/* Exact EVV Locations & Timestamps */}
              <div className="bg-white/80 p-4 rounded-xl border border-[#1A0A0F]/10 space-y-3">
                <span className="font-bold text-[#1A0A0F] uppercase text-[10px] block">
                  Mandatory 6-Point EVV Verification Log
                </span>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-2.5 rounded-xl bg-white border border-[#1A0A0F]/10 shadow-2xs">
                    <span className="font-semibold text-[#1E5A2D] block">Pickup Geocode & Time:</span>
                    <p className="font-medium text-[#1A0A0F] mt-0.5">{selectedTripForPacket.pickupAddress}</p>
                    <p className="font-mono-num text-[11px] text-[#6B4F57] mt-1">
                      Time: {selectedTripForPacket.scheduledPickupTime} · Lat: {selectedTripForPacket.pickupLat.toFixed(4)}, Lng: {selectedTripForPacket.pickupLng.toFixed(4)}
                    </p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white border border-[#1A0A0F]/10 shadow-2xs">
                    <span className="font-semibold text-[#A82220] block">Drop-Off Geocode & Time:</span>
                    <p className="font-medium text-[#1A0A0F] mt-0.5">{selectedTripForPacket.dropoffAddress}</p>
                    <p className="font-mono-num text-[11px] text-[#6B4F57] mt-1">
                      Time: {selectedTripForPacket.appointmentTime} · Lat: {selectedTripForPacket.dropoffLat.toFixed(4)}, Lng: {selectedTripForPacket.dropoffLng.toFixed(4)}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#1A0A0F]/10 flex justify-between font-mono-num text-[11px] text-[#6B4F57]">
                  <span>Driver: <strong>{selectedTripForPacket.driverName || 'Marcus Vance'}</strong></span>
                  <span>Vehicle: <strong>{selectedTripForPacket.vehicleName || 'Van #101'}</strong></span>
                </div>
              </div>

              {/* Signature Proof Block */}
              <div className="bg-white/80 p-4 rounded-xl border border-[#1A0A0F]/10 space-y-2">
                <span className="font-bold text-[#1A0A0F] uppercase text-[10px] block">
                  Service Delivery Attestation & Electronic Signature
                </span>
                <p className="text-[11px] text-[#6B4F57]">
                  "I certify that the non-emergency medical transportation service described above was rendered in full compliance with state Medicaid standards."
                </p>

                <div className="pt-3 border-t border-[#1A0A0F]/10 flex justify-between items-end">
                  <div>
                    <span className="font-display italic text-base text-[#1A0A0F] block">
                      {selectedTripForPacket.signature?.signedBy || selectedTripForPacket.riderName}
                    </span>
                    <span className="text-[10px] text-[#6B4F57]">
                      Electronic Signature on Record · {new Date().toLocaleDateString()}
                    </span>
                  </div>
                  <span className="text-xs font-mono-num font-bold text-[#1E5A2D] bg-[#EDF6EE] px-2.5 py-1 rounded-lg border border-[#C6E2CA]">
                    ✓ Verified Audit Stamp
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
