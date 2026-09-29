import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Settings,
  Building,
  CreditCard,
  Globe,
  Users,
  ShieldCheck,
  Download,
  CheckCircle2,
  Lock,
  Clock,
  History
} from 'lucide-react';

export const SettingsScreen: React.FC = () => {
  const {
    payers,
    stateRules,
    auditLogs,
    currentRole,
    addToast
  } = useApp();

  const [activeTab, setActiveTab] = useState<'company' | 'payers' | 'rules' | 'users' | 'audit'>('company');

  // Company details
  const [companyName, setCompanyName] = useState('TripProof NEMT Fleet LLC');
  const [npi, setNpi] = useState('1942859102');
  const [providerId, setProviderId] = useState('ODM-089421');
  const [phone, setPhone] = useState('(614) 555-0100');
  const [address, setAddress] = useState('1490 E Main St, Columbus, OH 43205');
  const [autoSessionTimeout, setAutoSessionTimeout] = useState('15');

  const handleSaveCompany = (e: React.FormEvent) => {
    e.preventDefault();
    addToast({
      type: 'success',
      title: 'Company Settings Saved',
      message: 'Provider profile updated. Changes reflected on all generated claim batches.'
    });
  };

  const handleExportAllData = () => {
    addToast({
      type: 'success',
      title: 'Full Compliance Archive Exported',
      message: 'JSON and CSV archive containing all immutable trip logs and PHI access records generated.'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-[#1A0A0F]">
            Settings & Audit Trail
          </h1>
          <p className="text-sm text-[#6B4F57] mt-1">
            Set it up once.
          </p>
        </div>

        <button
          onClick={handleExportAllData}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white/80 backdrop-blur-xs border border-[#1A0A0F]/15 hover:bg-white text-[#1A0A0F] rounded-xl text-xs font-semibold shadow-xs transition-colors"
        >
          <Download className="w-4 h-4 text-[#1A0A0F]" />
          <span>Export Complete Logbook Backup</span>
        </button>
      </div>

      {/* Settings Navigation Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto p-1.5 bg-white/80 backdrop-blur-md border border-[#1A0A0F]/10 rounded-2xl text-xs font-medium shadow-xs">
        {[
          { id: 'company', label: 'Company Profile' },
          { id: 'payers', label: 'Contracted Payers' },
          { id: 'rules', label: 'State EVV Rules' },
          { id: 'users', label: 'Users & Roles' },
          { id: 'audit', label: `Immutable Audit Trail (${auditLogs.length})` }
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

      {/* TAB 1: COMPANY PROFILE */}
      {activeTab === 'company' && (
        <div className="bg-white/80 backdrop-blur-md border border-[#1A0A0F]/10 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="pb-3 border-b border-[#1A0A0F]/10">
            <h3 className="font-semibold text-sm text-[#1A0A0F]">
              NEMT Operating Provider Identification
            </h3>
            <p className="text-xs text-[#6B4F57] mt-0.5">
              These credentials are encrypted and automatically embedded into all CMS-1500 / 837P electronic claim batches.
            </p>
          </div>

          <form onSubmit={handleSaveCompany} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-[11px] font-semibold text-[#6B4F57] mb-1">Legal Company / DBA Name *</label>
              <input
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-[#1A0A0F]/15 bg-white/90 text-[#1A0A0F]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#6B4F57] mb-1">Billing National Provider Identifier (NPI) *</label>
              <input
                type="text"
                required
                value={npi}
                onChange={(e) => setNpi(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-[#1A0A0F]/15 bg-white/90 text-[#1A0A0F] font-mono-num"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#6B4F57] mb-1">State Medicaid Provider ID *</label>
              <input
                type="text"
                required
                value={providerId}
                onChange={(e) => setProviderId(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-[#1A0A0F]/15 bg-white/90 text-[#1A0A0F] font-mono-num"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#6B4F57] mb-1">Dispatch Contact Phone</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-[#1A0A0F]/15 bg-white/90 text-[#1A0A0F]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[11px] font-semibold text-[#6B4F57] mb-1">Physical Base / Vehicle Depot Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-[#1A0A0F]/15 bg-white/90 text-[#1A0A0F]"
              />
            </div>

            <div className="sm:col-span-2 pt-2 border-t border-[#1A0A0F]/10">
              <div className="p-3 bg-white/70 backdrop-blur-xs border border-[#1A0A0F]/10 rounded-xl space-y-1">
                <span className="font-semibold text-[#1A0A0F] block text-xs">HIPAA Automatic Idle Timeout:</span>
                <div className="flex items-center gap-3">
                  <select
                    value={autoSessionTimeout}
                    onChange={(e) => setAutoSessionTimeout(e.target.value)}
                    className="p-1.5 rounded-xl border border-[#1A0A0F]/15 bg-white text-xs font-mono-num text-[#1A0A0F]"
                  >
                    <option value="10">10 Minutes</option>
                    <option value="15">15 Minutes (Recommended)</option>
                    <option value="30">30 Minutes</option>
                  </select>
                  <span className="text-[11px] text-[#6B4F57]">
                    Desktop dispatcher/billing screens will lock if unattended to prevent unauthorized PHI viewing.
                  </span>
                </div>
              </div>
            </div>

            <div className="sm:col-span-2 flex justify-end pt-2">
              <button
                type="submit"
                className="px-5 py-2.5 bg-gradient-to-r from-[#2D121B] to-[#1A0A0F] hover:from-[#3A1620] hover:to-[#240E15] text-white text-xs font-semibold rounded-xl shadow-xs transition-all border border-white/10"
              >
                Save Company Profile
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 2: CONTRACTED PAYERS */}
      {activeTab === 'payers' && (
        <div className="bg-white/80 backdrop-blur-md border border-[#1A0A0F]/10 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="pb-3 border-b border-[#1A0A0F]/10">
            <h3 className="font-semibold text-sm text-[#1A0A0F]">
              Contracted Medicaid Payers & Brokers
            </h3>
            <p className="text-xs text-[#6B4F57] mt-0.5">
              Rate cards, clearinghouse submission credentials, and prior authorization rules.
            </p>
          </div>

          <div className="space-y-3">
            {payers.map((payer) => (
              <div
                key={payer.id}
                className="hover-cream-card p-4 rounded-xl border border-[#1A0A0F]/10 bg-white/70 backdrop-blur-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xs"
              >
                <div>
                  <span className="text-[10px] font-bold text-[#1A0A0F] uppercase tracking-wider block">
                    {payer.shortCode}
                  </span>
                  <h4 className="font-bold text-sm text-[#1A0A0F]">{payer.name}</h4>
                  <div className="text-[11px] text-[#6B4F57] mt-0.5 font-mono-num">
                    NPI: {payer.billingNpi} · Base Walking: ${payer.baseRateWalking.toFixed(2)} · Wheelchair: ${payer.baseRateWheelchair.toFixed(2)} · Per Mile: ${payer.perMileRate.toFixed(2)}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono-num font-semibold text-[#1E5A2D] bg-[#EDF6EE] px-2 py-0.5 rounded-lg border border-[#C6E2CA]">
                    {payer.requiresPriorAuth ? 'Prior Auth Required' : 'Direct Dispatch'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: STATE RULES */}
      {activeTab === 'rules' && (
        <div className="bg-white/80 backdrop-blur-md border border-[#1A0A0F]/10 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="pb-3 border-b border-[#1A0A0F]/10">
            <h3 className="font-semibold text-sm text-[#1A0A0F]">
              State Aggregator Integration Rules
            </h3>
            <p className="text-xs text-[#6B4F57] mt-0.5">
              TripProof dynamically enforces the exact EVV criteria for each supported Medicaid state.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {stateRules.map((rule) => (
              <div key={rule.stateCode} className="hover-cream-card p-4 rounded-xl border border-[#1A0A0F]/10 bg-white/70 backdrop-blur-xs space-y-2 shadow-xs">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-[#1A0A0F] text-sm">
                    {rule.stateName} ({rule.stateCode})
                  </h4>
                  <span className="text-[11px] font-mono-num text-[#1E5A2D] font-semibold">
                    Tolerance: ±{rule.toleranceMinutes} min
                  </span>
                </div>
                <p className="font-semibold text-[#1A0A0F]">{rule.brokerSystem}</p>
                <p className="text-[11px] text-[#6B4F57] leading-relaxed">{rule.notes}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: USERS & ROLES */}
      {activeTab === 'users' && (
        <div className="bg-white/80 backdrop-blur-md border border-[#1A0A0F]/10 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="pb-3 border-b border-[#1A0A0F]/10">
            <h3 className="font-semibold text-sm text-[#1A0A0F]">
              Role-Based Access Control (RBAC)
            </h3>
            <p className="text-xs text-[#6B4F57] mt-0.5">
              Enforces HIPAA minimum-necessary access principles. Drivers only see their assigned runs; billing specialists cannot alter raw GPS telemetry.
            </p>
          </div>

          <div className="space-y-3 text-xs">
            <div className="hover-cream-card p-3 rounded-xl border border-[#1A0A0F]/10 bg-white/70 backdrop-blur-xs flex items-center justify-between shadow-xs">
              <div>
                <span className="font-bold text-[#1A0A0F]">Sarah Chen (Owner / Admin)</span>
                <span className="text-[#6B4F57] block text-[11px]">Full platform access, financial audit logs, rate configs, and user management.</span>
              </div>
              <span className="text-xs font-semibold text-[#1A0A0F] bg-[#F6E6EA] px-2 py-0.5 rounded-lg border border-[#1A0A0F]/10">Owner</span>
            </div>

            <div className="hover-cream-card p-3 rounded-xl border border-[#1A0A0F]/10 bg-white/70 backdrop-blur-xs flex items-center justify-between shadow-xs">
              <div>
                <span className="font-bold text-[#1A0A0F]">David Miller (Dispatcher)</span>
                <span className="text-[#6B4F57] block text-[11px]">Dispatch board, trip scheduling, driver assignment, real-time alerts.</span>
              </div>
              <span className="text-xs font-semibold text-[#3D5A80] bg-[#EEF3F8] px-2 py-0.5 rounded-lg border border-[#3D5A80]/20">Dispatcher</span>
            </div>

            <div className="hover-cream-card p-3 rounded-xl border border-[#1A0A0F]/10 bg-white/70 backdrop-blur-xs flex items-center justify-between shadow-xs">
              <div>
                <span className="font-bold text-[#1A0A0F]">Linda Kowalski (Billing Staff)</span>
                <span className="text-[#6B4F57] block text-[11px]">Exception resolution, claim batching, 837P export, denial reconciliation.</span>
              </div>
              <span className="text-xs font-semibold text-[#1E5A2D] bg-[#EDF6EE] px-2 py-0.5 rounded-lg border border-[#C6E2CA]">Billing</span>
            </div>

            <div className="hover-cream-card p-3 rounded-xl border border-[#1A0A0F]/10 bg-white/70 backdrop-blur-xs flex items-center justify-between shadow-xs">
              <div>
                <span className="font-bold text-[#1A0A0F]">Fleet Drivers (8 Active Accounts)</span>
                <span className="text-[#6B4F57] block text-[11px]">Mobile app access only: large tap buttons, GPS location logging, signature waivers.</span>
              </div>
              <span className="text-xs font-semibold text-[#6B4F57] bg-white border border-[#1A0A0F]/15 px-2 py-0.5 rounded-lg">Driver</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: IMMUTABLE AUDIT TRAIL */}
      {activeTab === 'audit' && (
        <div className="bg-white/80 backdrop-blur-md border border-[#1A0A0F]/10 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1A0A0F]/10">
            <div>
              <h3 className="font-semibold text-sm text-[#1A0A0F] flex items-center gap-2">
                <History className="w-4 h-4 text-[#1A0A0F]" />
                Immutable System Audit Trail
              </h3>
              <p className="text-xs text-[#6B4F57] mt-0.5">
                Every record creation, edit, PHI reveal, and verification override is permanently logged with timestamp and user role.
              </p>
            </div>

            <span className="text-xs font-mono-num font-semibold text-[#1E5A2D] bg-[#EDF6EE] px-2.5 py-1 rounded-xl border border-[#C6E2CA]">
              {auditLogs.length} Logged Entries
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono-num">
              <thead>
                <tr className="bg-white/60 border-b border-[#1A0A0F]/10 text-[#6B4F57] font-sans">
                  <th className="py-2.5 px-3">Timestamp</th>
                  <th className="py-2.5 px-3">User & Role</th>
                  <th className="py-2.5 px-3">Action Type</th>
                  <th className="py-2.5 px-3">Subject / Entity</th>
                  <th className="py-2.5 px-3">Details & Justification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1A0A0F]/10">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover-cream-row">
                    <td className="py-3 px-3 text-[#6B4F57]">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>
                    <td className="py-3 px-3 font-sans">
                      <span className="font-semibold text-[#1A0A0F] block">{log.userName}</span>
                      <span className="text-[10px] text-[#6B4F57] capitalize">{log.userRole.replace('_', ' ')}</span>
                    </td>
                    <td className="py-3 px-3 font-sans">
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-lg capitalize ${
                          log.action === 'view_phi'
                            ? 'bg-[#FEF7EA] text-[#B7791F] border border-[#F5D6A4]'
                            : log.action === 'override_verification'
                            ? 'bg-[#FDF1F0] text-[#A82220] border border-[#F6C4C1]'
                            : 'bg-[#F6E6EA] text-[#1A0A0F] border border-[#1A0A0F]/10'
                        }`}
                      >
                        {log.action.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-sans font-medium text-[#1A0A0F]">
                      {log.entityName}
                    </td>
                    <td className="py-3 px-3 font-sans text-[#1A0A0F] max-w-sm">
                      <div>{log.details}</div>
                      {log.reason && (
                        <div className="text-[11px] text-[#1A0A0F] italic mt-0.5">
                          Audit justification: "{log.reason}"
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
