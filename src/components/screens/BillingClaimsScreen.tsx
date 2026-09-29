import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Trip, ClaimBatch, Payer } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import {
  FileCheck2,
  DollarSign,
  Download,
  AlertOctagon,
  CheckCircle2,
  Layers,
  ArrowRight,
  Calculator,
  X,
  FileSpreadsheet
} from 'lucide-react';

interface BillingClaimsScreenProps {
  onOpenTripDetail: (trip: Trip) => void;
  onOpenFixModal: (trip: Trip) => void;
}

export const BillingClaimsScreen: React.FC<BillingClaimsScreenProps> = ({
  onOpenTripDetail,
  onOpenFixModal
}) => {
  const {
    trips,
    payers,
    claimBatches,
    createClaimBatch,
    resubmitDeniedTrip,
    addToast
  } = useApp();

  const [activeTab, setActiveTab] = useState<'ready' | 'needs_fixing' | 'submitted' | 'paid' | 'denied' | 'rates'>('ready');
  const [selectedTripIds, setSelectedTripIds] = useState<string[]>([]);
  const [selectedPayerForBatch, setSelectedPayerForBatch] = useState<string>(payers[0]?.id || '');

  // Denial fix modal
  const [deniedTripToFix, setDeniedTripToFix] = useState<Trip | null>(null);
  const [denialFixDetails, setDenialFixDetails] = useState('');
  const [denialAuditReason, setDenialAuditReason] = useState('');

  // Financial summary metrics
  const paidTotal = trips
    .filter((t) => t.billingStatus === 'paid')
    .reduce((s, t) => s + t.fare.total, 0);

  const submittedTotal = trips
    .filter((t) => t.billingStatus === 'submitted')
    .reduce((s, t) => s + t.fare.total, 0);

  const readyTotal = trips
    .filter((t) => t.billingStatus === 'ready_to_bill')
    .reduce((s, t) => s + t.fare.total, 0);

  const atRiskTotal = trips
    .filter((t) => t.billingStatus === 'needs_fixing' || t.billingStatus === 'denied')
    .reduce((s, t) => s + t.fare.total, 0);

  // Trips per tab
  const readyTrips = trips.filter((t) => t.billingStatus === 'ready_to_bill');
  const onHoldTrips = trips.filter((t) => t.billingStatus === 'needs_fixing');
  const submittedTrips = trips.filter((t) => t.billingStatus === 'submitted');
  const paidTrips = trips.filter((t) => t.billingStatus === 'paid');
  const deniedTrips = trips.filter((t) => t.billingStatus === 'denied');

  const toggleSelectTrip = (id: string) => {
    setSelectedTripIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const selectAllReady = () => {
    if (selectedTripIds.length === readyTrips.length) {
      setSelectedTripIds([]);
    } else {
      setSelectedTripIds(readyTrips.map((t) => t.id));
    }
  };

  const handleCreateBatch = () => {
    if (selectedTripIds.length === 0) return;
    const batch = createClaimBatch(selectedPayerForBatch, selectedTripIds);
    setSelectedTripIds([]);
  };

  const handleExportCSV = (batch: ClaimBatch) => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'BatchNumber,Date,Payer,TripCount,TotalAmount\n' +
      `${batch.batchNumber},${batch.createdAt},"${batch.payerName}",${batch.tripIds.length},${batch.totalAmount}\n`;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${batch.batchNumber}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addToast({
      type: 'success',
      title: 'Batch CSV Exported',
      message: `${batch.batchNumber} downloaded for broker clearinghouse upload.`
    });
  };

  const handleResubmitDenial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deniedTripToFix) return;

    resubmitDeniedTrip(deniedTripToFix.id, denialFixDetails, denialAuditReason);
    setDeniedTripToFix(null);
    setDenialFixDetails('');
    setDenialAuditReason('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-[#1A0A0F]">
            Billing & Claims
          </h1>
          <p className="text-sm text-[#6B4F57] mt-1">
            Only clean trips go out. Get paid faster.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-[#6B4F57] bg-white/80 backdrop-blur-xs border border-[#1A0A0F]/10 px-3 py-1.5 rounded-xl shadow-xs">
            Billing NPI: <strong className="text-[#1A0A0F]">1942859102</strong> (Ohio Medicaid)
          </span>
        </div>
      </div>

      {/* Money Summary 4-Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl silver-glass-card interactive-stat-card shadow-xs">
          <span className="text-xs font-semibold text-[#6B4F57] uppercase tracking-wider block">
            Ready to Bill
          </span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono-num text-[#1E5A2D]">
              ${readyTotal.toFixed(2)}
            </span>
            <span className="text-xs text-[#6B4F57]">({readyTrips.length} clean rides)</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl silver-glass-card interactive-stat-card shadow-xs">
          <span className="text-xs font-semibold text-[#6B4F57] uppercase tracking-wider block">
            Submitted / Batched
          </span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono-num text-[#3D5A80]">
              ${submittedTotal.toFixed(2)}
            </span>
            <span className="text-xs text-[#6B4F57]">({submittedTrips.length} in transit)</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl silver-glass-card interactive-stat-card shadow-xs">
          <span className="text-xs font-semibold text-[#6B4F57] uppercase tracking-wider block">
            Paid to Date
          </span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono-num text-[#1A0A0F]">
              ${paidTotal.toFixed(2)}
            </span>
            <span className="text-xs text-[#1E5A2D] font-medium">Reconciled</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl silver-glass-card interactive-stat-card shadow-xs">
          <span className="text-xs font-semibold text-[#A82220] uppercase tracking-wider block">
            At Risk (Blocked / Denied)
          </span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono-num text-[#A82220]">
              ${atRiskTotal.toFixed(2)}
            </span>
            <span className="text-xs text-[#A82220]">({onHoldTrips.length + deniedTrips.length} blocked)</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto p-1.5 bg-white/80 backdrop-blur-md border border-[#1A0A0F]/10 rounded-2xl shadow-xs text-xs font-medium">
        {[
          { id: 'ready', label: `Ready to Bill (${readyTrips.length})` },
          { id: 'needs_fixing', label: `On Hold / Needs Fixing (${onHoldTrips.length})` },
          { id: 'submitted', label: `Submitted Batches (${claimBatches.length})` },
          { id: 'paid', label: `Paid Archives (${paidTrips.length})` },
          { id: 'denied', label: `Denial Tracker (${deniedTrips.length})` },
          { id: 'rates', label: 'Payer Rate Tables' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3.5 py-2 rounded-xl whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-[#2D121B] to-[#1A0A0F] text-white font-bold shadow-xs border border-white/10'
                : 'text-[#6B4F57] hover:text-[#1A0A0F] hover:bg-white/40'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: READY TO BILL */}
      {activeTab === 'ready' && (
        <div className="bg-white/80 backdrop-blur-md border border-[#1A0A0F]/10 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1A0A0F]/10">
            <div>
              <h3 className="font-semibold text-sm text-[#1A0A0F]">
                Clean Verified Trips Ready for Batch Claim Export
              </h3>
              <p className="text-xs text-[#6B4F57] mt-0.5">
                Every trip below has 100% verified EVV timestamps, geocodes, and signed proof.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={selectedPayerForBatch}
                onChange={(e) => setSelectedPayerForBatch(e.target.value)}
                className="text-xs p-2 rounded-xl border border-[#1A0A0F]/15 bg-white/90 text-[#1A0A0F]"
              >
                {payers.map((p) => (
                  <option key={p.id} value={p.id}>
                    Payer: {p.shortCode}
                  </option>
                ))}
              </select>

              <button
                onClick={handleCreateBatch}
                disabled={selectedTripIds.length === 0}
                className="px-4 py-2 bg-[#1E5A2D] hover:bg-[#164321] disabled:opacity-40 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors border border-white/10"
              >
                <Layers className="w-4 h-4" />
                <span>Create Claim Batch ({selectedTripIds.length})</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-white/60 border-b border-[#1A0A0F]/10 text-[#6B4F57] font-semibold">
                  <th className="py-2.5 px-3 w-8">
                    <input
                      type="checkbox"
                      checked={selectedTripIds.length === readyTrips.length && readyTrips.length > 0}
                      onChange={selectAllReady}
                      className="rounded text-[#1A0A0F] focus:ring-[#1A0A0F]"
                    />
                  </th>
                  <th className="py-2.5 px-3">Trip #</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Rider Name</th>
                  <th className="py-2.5 px-3">Payer / Broker</th>
                  <th className="py-2.5 px-3">Prior Auth #</th>
                  <th className="py-2.5 px-3">Mobility</th>
                  <th className="py-2.5 px-3 text-right">Fare</th>
                  <th className="py-2.5 px-3 text-center">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1A0A0F]/10">
                {readyTrips.length === 0 ? (
                  <tr className="no-hover-row">
                    <td colSpan={9} className="py-8 text-center text-xs text-[#6B4F57]">
                      No trips waiting to be batched.
                    </td>
                  </tr>
                ) : (
                  readyTrips.map((trip) => {
                    const isSelected = selectedTripIds.includes(trip.id);
                    return (
                      <tr key={trip.id} className="hover-cream-row">
                        <td className="py-3 px-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelectTrip(trip.id)}
                            className="rounded text-[#1A0A0F] focus:ring-[#1A0A0F]"
                          />
                        </td>
                        <td className="py-3 px-3 font-mono-num font-bold text-[#1A0A0F]">
                          {trip.tripNumber}
                        </td>
                        <td className="py-3 px-3 font-mono-num text-[#6B4F57]">{trip.date}</td>
                        <td className="py-3 px-3 font-medium text-[#1A0A0F]">{trip.riderName}</td>
                        <td className="py-3 px-3 text-[#6B4F57]">{trip.payerName.split(' ')[0]}</td>
                        <td className="py-3 px-3 font-mono-num text-[#1A0A0F]">
                          {trip.authorizationNumber || 'N/A'}
                        </td>
                        <td className="py-3 px-3 capitalize">{trip.mobilityType}</td>
                        <td className="py-3 px-3 text-right font-mono-num font-semibold text-[#1A0A0F]">
                          ${trip.fare.total.toFixed(2)}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <button
                            onClick={() => onOpenTripDetail(trip)}
                            className="text-[#1A0A0F] hover:underline font-semibold text-[11px]"
                          >
                            Details
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: ON HOLD / NEEDS FIXING */}
      {activeTab === 'needs_fixing' && (
        <div className="bg-white/80 backdrop-blur-md border border-[#1A0A0F]/10 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="pb-3 border-b border-[#1A0A0F]/10">
            <h3 className="font-semibold text-sm text-[#A82220]">
              Trips On Hold (Verification Exceptions)
            </h3>
            <p className="text-xs text-[#6B4F57] mt-0.5">
              These trips cannot be submitted until missing timestamps, signatures, or prior auth numbers are reconciled.
            </p>
          </div>

          <div className="space-y-3">
            {onHoldTrips.map((trip) => (
              <div
                key={trip.id}
                className="hover-cream-card p-3.5 rounded-xl border border-[#A82220]/30 bg-white/70 backdrop-blur-xs flex items-center justify-between text-xs shadow-xs"
              >
                <div>
                  <div className="font-bold text-[#1A0A0F] font-mono-num">{trip.tripNumber} — {trip.riderName}</div>
                  <div className="text-[#6B4F57] text-[11px] mt-0.5">
                    Service Date: {trip.date} · Value: ${trip.fare.total.toFixed(2)}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onOpenTripDetail(trip)}
                    className="px-3 py-1.5 rounded-xl border border-[#1A0A0F]/15 bg-white/80 hover:bg-white text-xs text-[#1A0A0F] font-medium"
                  >
                    Inspect
                  </button>
                  <button
                    onClick={() => onOpenFixModal(trip)}
                    className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-[#2D121B] to-[#1A0A0F] hover:from-[#3A1620] hover:to-[#240E15] text-white text-xs font-semibold shadow-xs transition-all border border-white/10"
                  >
                    Fix Exception
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: SUBMITTED BATCHES */}
      {activeTab === 'submitted' && (
        <div className="bg-white/80 backdrop-blur-md border border-[#1A0A0F]/10 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="pb-3 border-b border-[#1A0A0F]/10">
            <h3 className="font-semibold text-sm text-[#1A0A0F]">
              Generated Claim Batches & 837P EDI Files
            </h3>
            <p className="text-xs text-[#6B4F57] mt-0.5">
              Export batches as clean CSV or electronic billing files for upload to clearinghouses.
            </p>
          </div>

          <div className="space-y-3">
            {claimBatches.map((batch) => (
              <div
                key={batch.id}
                className="hover-cream-card p-4 rounded-xl border border-[#1A0A0F]/10 bg-white/70 backdrop-blur-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#1A0A0F] font-mono-num text-sm">
                      {batch.batchNumber}
                    </span>
                    <StatusBadge status={batch.status} />
                  </div>
                  <div className="text-[11px] text-[#6B4F57] mt-1">
                    Payer: <strong>{batch.payerName}</strong> · {batch.tripIds.length} Rides Included · Created: {new Date(batch.createdAt).toLocaleDateString()}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold font-mono-num text-[#1A0A0F]">
                    ${batch.totalAmount.toFixed(2)}
                  </span>
                  <button
                    onClick={() => handleExportCSV(batch)}
                    className="px-3.5 py-1.5 bg-white border border-[#1A0A0F]/20 text-[#1A0A0F] hover:bg-[#F6E6EA] rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download CSV</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: PAID ARCHIVES */}
      {activeTab === 'paid' && (
        <div className="bg-white/80 backdrop-blur-md border border-[#1A0A0F]/10 rounded-2xl p-5 shadow-xs space-y-3">
          <div className="pb-3 border-b border-[#1A0A0F]/10">
            <h3 className="font-semibold text-sm text-[#1E5A2D]">
              Paid & Reconciled Remittance Files
            </h3>
            <p className="text-xs text-[#6B4F57] mt-0.5">
              Electronic Remittance Advice (ERA 835) confirmed funds in bank account.
            </p>
          </div>

          {paidTrips.map((trip) => (
            <div
              key={trip.id}
              className="hover-cream-card p-3 rounded-xl border border-[#C6E2CA] bg-[#EDF6EE]/60 flex items-center justify-between text-xs"
            >
              <div>
                <span className="font-mono-num font-bold text-[#1A0A0F]">{trip.tripNumber} — {trip.riderName}</span>
                <span className="text-[11px] text-[#6B4F57] block mt-0.5">
                  Paid by {trip.payerName} on {trip.date}
                </span>
              </div>
              <span className="font-mono-num font-bold text-[#1E5A2D]">
                +${trip.fare.total.toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* TAB 5: DENIAL TRACKER */}
      {activeTab === 'denied' && (
        <div className="bg-white/80 backdrop-blur-md border border-[#1A0A0F]/10 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="pb-3 border-b border-[#1A0A0F]/10">
            <h3 className="font-semibold text-sm text-[#A82220]">
              Medicaid Broker Denial Tracker & Resubmission Flow
            </h3>
            <p className="text-xs text-[#6B4F57] mt-0.5">
              When a payer rejects a claim, resolve the root cause here and move it directly back to Ready to Bill.
            </p>
          </div>

          <div className="space-y-3">
            {deniedTrips.length === 0 ? (
              <p className="text-xs text-[#6B4F57]">No denied claims at this time.</p>
            ) : (
              deniedTrips.map((trip) => (
                <div
                  key={trip.id}
                  className="hover-cream-card p-4 rounded-xl border border-[#A82220]/30 bg-white/70 backdrop-blur-xs text-xs space-y-2 shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-[#1A0A0F] font-mono-num">
                        {trip.tripNumber}
                      </span>
                      <span className="ml-2 font-semibold text-[#1A0A0F]">
                        {trip.riderName}
                      </span>
                      <span className="ml-2 text-[#6B4F57]">({trip.payerName})</span>
                    </div>

                    <span className="text-xs font-bold font-mono-num text-[#A82220]">
                      ${trip.fare.total.toFixed(2)} Denied
                    </span>
                  </div>

                  <div className="bg-white/90 p-3 rounded-xl border border-[#A82220]/20 text-xs">
                    <span className="font-bold text-[#A82220] block text-[11px] uppercase tracking-wider mb-0.5">
                      Payer Denial Code: {trip.denialCode || 'CO-16'}
                    </span>
                    <p className="text-[#1A0A0F]">{trip.denialReason}</p>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      onClick={() => onOpenTripDetail(trip)}
                      className="px-3 py-1.5 rounded-xl border border-[#1A0A0F]/15 bg-white text-[#6B4F57] hover:text-[#1A0A0F] transition-colors"
                    >
                      Inspect Trip
                    </button>
                    <button
                      onClick={() => {
                        setDeniedTripToFix(trip);
                        setDenialFixDetails('Appended correct procedure modifier / re-verified prior auth with broker.');
                        setDenialAuditReason('Billing correction after provider portal review.');
                      }}
                      className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-[#2D121B] to-[#1A0A0F] hover:from-[#3A1620] hover:to-[#240E15] text-white font-semibold shadow-xs transition-all border border-white/10"
                    >
                      Fix & Resubmit
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 6: PAYER RATE TABLES */}
      {activeTab === 'rates' && (
        <div className="bg-white/80 backdrop-blur-md border border-[#1A0A0F]/10 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="pb-3 border-b border-[#1A0A0F]/10">
            <h3 className="font-semibold text-sm text-[#1A0A0F]">
              Contracted Medicaid Payer Rate Schedules
            </h3>
            <p className="text-xs text-[#6B4F57] mt-0.5">
              TripProof automatically calculates exact fares based on base fee, certified mileage, and wheelchair/stretcher surcharges.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {payers.map((payer) => (
              <div
                key={payer.id}
                className="hover-cream-card bg-white/70 backdrop-blur-xs border border-[#1A0A0F]/10 rounded-xl p-4 text-xs space-y-3 shadow-xs"
              >
                <div className="pb-2 border-b border-[#1A0A0F]/10">
                  <span className="text-[10px] font-bold text-[#1A0A0F] uppercase tracking-wider block">
                    {payer.shortCode}
                  </span>
                  <h4 className="font-bold text-sm text-[#1A0A0F] mt-0.5">{payer.name}</h4>
                  <span className="text-[11px] text-[#6B4F57] block mt-0.5">
                    NPI: {payer.billingNpi} · Phone: {payer.contactPhone}
                  </span>
                </div>

                <div className="space-y-1.5 font-mono-num text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-[#6B4F57]">Walking Base:</span>
                    <span className="font-semibold text-[#1A0A0F]">${payer.baseRateWalking.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6B4F57]">Wheelchair Base:</span>
                    <span className="font-semibold text-[#1A0A0F]">${payer.baseRateWheelchair.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6B4F57]">Stretcher Base:</span>
                    <span className="font-semibold text-[#1A0A0F]">${payer.baseRateStretcher.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-t border-[#1A0A0F]/10 pt-1">
                    <span className="text-[#6B4F57]">Per Mile Rate:</span>
                    <span className="font-semibold text-[#1A0A0F]">${payer.perMileRate.toFixed(2)}/mi</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6B4F57]">Wheelchair Lift Surcharge:</span>
                    <span className="font-semibold text-[#1A0A0F]">+${payer.wheelchairSurcharge.toFixed(2)}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#1A0A0F]/10 text-[11px] text-[#6B4F57]">
                  Prior Auth: <strong>{payer.requiresPriorAuth ? 'Mandatory' : 'Exempt'}</strong> · Sig: <strong>{payer.requiresSignature ? 'Required' : 'Optional'}</strong>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Denial Fix Modal */}
      {deniedTripToFix && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white/95 backdrop-blur-xl border border-[#1A0A0F]/15 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-[#1A0A0F]">
            <div className="p-4 bg-white/90 border-b border-[#1A0A0F]/10 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-base font-display text-[#1A0A0F]">
                  Fix & Resubmit Denied Claim
                </h3>
                <p className="text-xs text-[#6B4F57] mt-0.5">
                  Trip {deniedTripToFix.tripNumber} ({deniedTripToFix.riderName})
                </p>
              </div>
              <button
                onClick={() => setDeniedTripToFix(null)}
                className="p-1 rounded-xl text-[#6B4F57] hover:text-[#1A0A0F]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleResubmitDenial} className="p-5 space-y-4 text-xs">
              <div className="p-3 bg-[#FDF1F0] border border-[#F6C4C1] rounded-xl">
                <span className="font-bold text-[#A82220] block">Rejection Notice:</span>
                <p className="text-[#1A0A0F] mt-0.5">{deniedTripToFix.denialReason}</p>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#6B4F57] mb-1">
                  Correction Actions Taken *
                </label>
                <textarea
                  required
                  rows={2}
                  value={denialFixDetails}
                  onChange={(e) => setDenialFixDetails(e.target.value)}
                  placeholder="e.g. Corrected authorization number in broker clearinghouse portal and re-verified eligibility."
                  className="w-full p-2.5 rounded-xl border border-[#1A0A0F]/15 bg-white text-[#1A0A0F]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#6B4F57] mb-1">
                  Mandatory Audit Reason *
                </label>
                <input
                  type="text"
                  required
                  value={denialAuditReason}
                  onChange={(e) => setDenialAuditReason(e.target.value)}
                  placeholder="e.g. Provider dispute resolution filed with Buckeye Health."
                  className="w-full p-2.5 rounded-xl border border-[#1A0A0F]/15 bg-white text-[#1A0A0F]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#1A0A0F]/10">
                <button
                  type="button"
                  onClick={() => setDeniedTripToFix(null)}
                  className="px-4 py-2 text-xs text-[#6B4F57] hover:text-[#1A0A0F]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-[#1E5A2D] hover:bg-[#164321] rounded-xl transition-colors shadow-xs"
                >
                  Resubmit to Ready to Bill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
