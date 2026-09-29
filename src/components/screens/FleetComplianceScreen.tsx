import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Driver, Vehicle } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import {
  Car,
  UserCheck,
  FileCheck,
  AlertTriangle,
  AlertOctagon,
  Calendar,
  Upload,
  CheckCircle2,
  X,
  ShieldCheck,
  Clock
} from 'lucide-react';

export const FleetComplianceScreen: React.FC = () => {
  const {
    drivers,
    vehicles,
    renewDriverCredential,
    renewVehicleCredential,
    addToast
  } = useApp();

  const [activeTab, setActiveTab] = useState<'drivers' | 'vehicles'>('drivers');
  const [renewModalData, setRenewModalData] = useState<{
    type: 'driver' | 'vehicle';
    entityId: string;
    entityName: string;
    credentialIdOrType: string;
    credentialName: string;
    currentExpiry: string;
  } | null>(null);

  const [newExpiryDate, setNewExpiryDate] = useState('2027-10-01');

  const handleOpenRenew = (
    type: 'driver' | 'vehicle',
    entityId: string,
    entityName: string,
    credentialIdOrType: string,
    credentialName: string,
    currentExpiry: string
  ) => {
    setRenewModalData({
      type,
      entityId,
      entityName,
      credentialIdOrType,
      credentialName,
      currentExpiry
    });
    setNewExpiryDate('2027-09-30');
  };

  const handleSaveRenewal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!renewModalData) return;

    if (renewModalData.type === 'driver') {
      renewDriverCredential(renewModalData.entityId, renewModalData.credentialIdOrType, newExpiryDate);
    } else {
      renewVehicleCredential(renewModalData.entityId, renewModalData.credentialIdOrType, newExpiryDate);
    }

    setRenewModalData(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-[#1A0A0F]">
            Drivers & Fleet
          </h1>
          <p className="text-sm text-[#6B4F57] mt-1">
            Keep your people and vehicles ready to dispatch.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-1 bg-white/85 backdrop-blur-md p-1 rounded-xl border border-[#1A0A0F]/10 shadow-xs">
          <button
            onClick={() => setActiveTab('drivers')}
            className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'drivers'
                ? 'bg-[#1A0A0F] text-white shadow-xs'
                : 'text-[#6B4F57] hover:text-[#1A0A0F]'
            }`}
          >
            Drivers ({drivers.length})
          </button>
          <button
            onClick={() => setActiveTab('vehicles')}
            className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'vehicles'
                ? 'bg-[#1A0A0F] text-white shadow-xs'
                : 'text-[#6B4F57] hover:text-[#1A0A0F]'
            }`}
          >
            Vehicles ({vehicles.length})
          </button>
        </div>
      </div>

      {/* Compliance Rule Banner */}
      <div className="bg-white/85 backdrop-blur-md border border-[#1A0A0F]/10 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xs">
        <div className="flex items-start sm:items-center gap-2.5">
          <ShieldCheck className="w-5 h-5 text-[#1A0A0F] shrink-0" />
          <span className="text-[#1A0A0F]">
            <strong>Automatic Safety Lock:</strong> Any driver or vehicle with a red document (&lt;15 days or expired) is automatically prohibited from dispatch suggestions to protect Medicaid broker standing.
          </span>
        </div>
        <div className="flex items-center gap-3 shrink-0 text-[11px] font-mono-num font-semibold">
          <span className="text-[#1E5A2D]">● &gt;60d Valid</span>
          <span className="text-[#9E6714]">● 15-60d Warning</span>
          <span className="text-[#A82220]">● &lt;15d / Expired</span>
        </div>
      </div>

      {/* DRIVERS TAB */}
      {activeTab === 'drivers' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {drivers.map((driver) => {
            const hasExpired = driver.credentials.some((c) => c.status === 'expired');
            const hasExpiringSoon = driver.credentials.some((c) => c.status === 'expiring_soon');

            return (
              <div
                key={driver.id}
                className={`hover-cream-card bg-white/85 backdrop-blur-md border rounded-2xl p-5 shadow-xs transition-all ${
                  hasExpired
                    ? 'border-[#F8D0D4] bg-[#FDF0F1]/50'
                    : hasExpiringSoon
                    ? 'border-[#F6DEC0]'
                    : 'border-[#1A0A0F]/10'
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between pb-3 border-b border-[#1A0A0F]/10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#ECD0D8] text-[#1A0A0F] font-bold font-display flex items-center justify-center text-sm border border-[#1A0A0F]/15">
                      {driver.name.split(' ').map((n) => n[0]).join('')}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-[#1A0A0F]">{driver.name}</h3>
                      <p className="text-xs text-[#6B4F57] font-mono-num">{driver.phone}</p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <StatusBadge status={driver.status} />
                    {hasExpired && (
                      <span className="text-[10px] font-bold text-[#A82220] bg-[#FDF0F1] px-2 py-0.5 rounded-lg border border-[#F8D0D4]">
                        Dispatch Blocked
                      </span>
                    )}
                  </div>
                </div>

                {/* 7 Required Credentials Checklist */}
                <div className="mt-4 space-y-2">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-[#6B4F57] flex items-center justify-between">
                    <span>Required Driver Credentials</span>
                    <span className="text-[10px] font-normal">7/7 Tracked</span>
                  </div>

                  <div className="space-y-1.5">
                    {driver.credentials.map((cred) => {
                      const isExpired = cred.status === 'expired';
                      const isSoon = cred.status === 'expiring_soon';

                      return (
                        <div
                          key={cred.id}
                          className={`flex items-center justify-between p-2 rounded-xl text-xs border ${
                            isExpired
                              ? 'bg-[#FDF0F1] border-[#F8D0D4] text-[#A82220]'
                              : isSoon
                              ? 'bg-[#FDF5E6] border-[#F6DEC0] text-[#9E6714]'
                              : 'bg-white/80 border-[#1A0A0F]/10 text-[#1A0A0F]'
                          }`}
                        >
                          <div className="min-w-0 pr-2">
                            <span className="font-semibold truncate block">{cred.name}</span>
                            <span className="text-[10px] opacity-80 font-mono-num block">
                              Exp: {cred.expiryDate} {isExpired ? '(EXPIRED)' : isSoon ? '(Due soon)' : ''}
                            </span>
                          </div>

                          <div className="shrink-0 flex items-center gap-1.5">
                            {(isExpired || isSoon) && (
                              <button
                                onClick={() =>
                                  handleOpenRenew(
                                    'driver',
                                    driver.id,
                                    driver.name,
                                    cred.id,
                                    cred.name,
                                    cred.expiryDate
                                  )
                                }
                                className="px-2.5 py-0.5 bg-[#1A0A0F] hover:bg-[#3A1620] text-white rounded-lg text-[10px] font-semibold shadow-2xs"
                              >
                                Renew
                              </button>
                            )}
                            <span
                              className={`w-2.5 h-2.5 rounded-full ${
                                isExpired ? 'bg-[#A82220]' : isSoon ? 'bg-[#9E6714]' : 'bg-[#1E5A2D]'
                              }`}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VEHICLES TAB */}
      {activeTab === 'vehicles' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {vehicles.map((vehicle) => {
            const hasExpired = vehicle.credentials.some((c) => c.status === 'expired');
            const hasExpiringSoon = vehicle.credentials.some((c) => c.status === 'expiring_soon');

            return (
              <div
                key={vehicle.id}
                className={`hover-cream-card bg-white/85 backdrop-blur-md border rounded-2xl p-5 shadow-xs transition-all ${
                  vehicle.status === 'grounded' || hasExpired
                    ? 'border-[#F8D0D4] bg-[#FDF0F1]/50'
                    : hasExpiringSoon
                    ? 'border-[#F6DEC0]'
                    : 'border-[#1A0A0F]/10'
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between pb-3 border-b border-[#1A0A0F]/10">
                  <div>
                    <h3 className="font-bold text-sm text-[#1A0A0F]">{vehicle.name}</h3>
                    <p className="text-xs text-[#6B4F57] font-mono-num mt-0.5">
                      Plate: <strong>{vehicle.plateNumber}</strong> · VIN: {vehicle.vin.slice(-6)}
                    </p>
                  </div>

                  <div className="text-right space-y-1">
                    <span
                      className={`text-xs px-2.5 py-1 rounded-lg font-semibold font-mono-num inline-block ${
                        vehicle.status === 'grounded'
                          ? 'bg-[#FDF0F1] text-[#A82220] border border-[#F8D0D4]'
                          : 'bg-[#EDF6EE] text-[#1E5A2D] border border-[#C6E2CA]'
                      }`}
                    >
                      {vehicle.status === 'grounded' ? 'GROUNDED' : 'IN SERVICE'}
                    </span>
                    <span className="block text-[11px] text-[#6B4F57] capitalize">
                      {vehicle.type.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                {/* Capacity */}
                <div className="py-2.5 flex items-center gap-4 text-xs text-[#6B4F57] font-mono-num border-b border-[#1A0A0F]/10">
                  <span>Wheelchair Lift: <strong>{vehicle.maxWheelchairs} spots</strong></span>
                  <span>Ambulatory: <strong>{vehicle.maxAmbulatory} seats</strong></span>
                </div>

                {/* Vehicle Compliance Documents */}
                <div className="mt-3 space-y-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#6B4F57] block">
                    Safety & Lift Certifications
                  </span>

                  {vehicle.credentials.map((cred) => {
                    const isExpired = cred.status === 'expired';
                    const isSoon = cred.status === 'expiring_soon';

                    return (
                      <div
                        key={cred.type}
                        className={`flex items-center justify-between p-2 rounded-xl text-xs border ${
                          isExpired
                            ? 'bg-[#FDF0F1] border-[#F8D0D4] text-[#A82220]'
                            : isSoon
                            ? 'bg-[#FDF5E6] border-[#F6DEC0] text-[#9E6714]'
                            : 'bg-white/80 border-[#1A0A0F]/10 text-[#1A0A0F]'
                        }`}
                      >
                        <div>
                          <span className="font-semibold block">{cred.name}</span>
                          <span className="text-[10px] opacity-80 font-mono-num">
                            Exp: {cred.expiryDate} {isExpired ? '(EXPIRED - GROUNDED)' : isSoon ? '(Due soon)' : ''}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {(isExpired || isSoon) && (
                            <button
                              onClick={() =>
                                handleOpenRenew(
                                  'vehicle',
                                  vehicle.id,
                                  vehicle.name,
                                  cred.type,
                                  cred.name,
                                  cred.expiryDate
                                )
                              }
                              className="px-2.5 py-0.5 bg-[#1A0A0F] hover:bg-[#3A1620] text-white rounded-lg text-[10px] font-semibold shadow-2xs"
                            >
                              Renew Inspection
                            </button>
                          )}
                          <span
                            className={`w-2.5 h-2.5 rounded-full ${
                              isExpired ? 'bg-[#A82220]' : isSoon ? 'bg-[#9E6714]' : 'bg-[#1E5A2D]'
                            }`}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Renew Document Modal */}
      {renewModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-[#F6E6EA]/95 backdrop-blur-xl border border-[#1A0A0F]/15 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-[#1A0A0F]">
            <div className="p-4 bg-white/85 backdrop-blur-md border-b border-[#1A0A0F]/10 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base font-display text-[#1A0A0F]">
                  Upload & Renew Compliance Document
                </h3>
                <p className="text-xs text-[#6B4F57] mt-0.5">
                  {renewModalData.entityName} — {renewModalData.credentialName}
                </p>
              </div>
              <button
                onClick={() => setRenewModalData(null)}
                className="p-1.5 rounded-xl text-[#6B4F57] hover:text-[#1A0A0F] hover:bg-[#ECD0D8]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRenewal} className="p-5 space-y-4 text-xs">
              <div className="p-3 bg-white/80 border border-[#1A0A0F]/10 rounded-xl">
                <span className="block text-[11px] text-[#6B4F57]">Document Type:</span>
                <span className="font-bold text-[#1A0A0F] text-sm">{renewModalData.credentialName}</span>
                <span className="block text-[10px] text-[#A82220] mt-1 font-mono-num font-semibold">
                  Previous Expiry: {renewModalData.currentExpiry}
                </span>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#6B4F57] mb-1">
                  New Verified Expiration Date *
                </label>
                <input
                  type="date"
                  required
                  value={newExpiryDate}
                  onChange={(e) => setNewExpiryDate(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#1A0A0F]/15 bg-white text-[#1A0A0F] font-mono-num text-xs focus:outline-none focus:ring-1 focus:ring-[#1A0A0F]"
                />
              </div>

              <div className="p-4 border-2 border-dashed border-[#1A0A0F]/20 rounded-xl text-center bg-white/70 space-y-1">
                <Upload className="w-5 h-5 text-[#1A0A0F] mx-auto" />
                <span className="text-xs font-semibold text-[#1A0A0F] block">
                  Simulate Document Scan / PDF Attachment
                </span>
                <span className="text-[11px] text-[#6B4F57] block">
                  e.g. bci_screen_2026.pdf (Verified & Encrypted at rest)
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#1A0A0F]/10">
                <button
                  type="button"
                  onClick={() => setRenewModalData(null)}
                  className="px-4 py-2 text-xs font-medium text-[#6B4F57] hover:text-[#1A0A0F]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-[#1E5A2D] to-[#154220] hover:from-[#266e37] hover:to-[#1a5127] rounded-xl transition-all shadow-xs"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Save & Unblock Dispatch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
