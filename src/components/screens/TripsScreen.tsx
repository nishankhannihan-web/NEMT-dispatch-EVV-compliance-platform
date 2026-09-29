import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Trip } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { VerificationChecklist } from '../common/VerificationChecklist';
import { Search, Plus, Filter, MapPin, Eye, Edit3, Calendar } from 'lucide-react';

interface TripsScreenProps {
  onOpenTripDetail: (trip: Trip) => void;
  onOpenFixModal: (trip: Trip) => void;
  onOpenNewTrip: () => void;
}

export const TripsScreen: React.FC<TripsScreenProps> = ({
  onOpenTripDetail,
  onOpenFixModal,
  onOpenNewTrip
}) => {
  const { trips } = useApp();
  const [filterTab, setFilterTab] = useState<'today' | 'upcoming' | 'needs_fixing' | 'completed' | 'all'>('today');
  const [searchQuery, setSearchQuery] = useState('');

  const todayStr = '2026-09-28';

  const filteredTrips = trips.filter((trip) => {
    // Tab filter
    if (filterTab === 'today') {
      if (trip.date !== todayStr) return false;
    } else if (filterTab === 'upcoming') {
      if (trip.date <= todayStr && trip.status === 'completed') return false;
    } else if (filterTab === 'needs_fixing') {
      if (trip.billingStatus !== 'needs_fixing') return false;
    } else if (filterTab === 'completed') {
      if (trip.status !== 'completed') return false;
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTripNum = trip.tripNumber.toLowerCase().includes(q);
      const matchRider = trip.riderName.toLowerCase().includes(q);
      const matchPayer = trip.payerName.toLowerCase().includes(q);
      const matchAuth = trip.authorizationNumber.toLowerCase().includes(q);
      return matchTripNum || matchRider || matchPayer || matchAuth;
    }

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-[#1A0A0F]">
            Trips
          </h1>
          <p className="text-sm text-[#6B4F57] mt-1">
            Every ride, past and future.
          </p>
        </div>

        <button
          onClick={onOpenNewTrip}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-[#2D121B] to-[#1A0A0F] hover:from-[#3A1620] hover:to-[#240E15] text-white text-xs font-semibold rounded-xl transition-all shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Book New Trip</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="silver-glass-card p-3.5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs">
        {/* Interactive Segmented Filter tabs */}
        <div className="flex items-center gap-1 overflow-x-auto p-1 bg-white/50 backdrop-blur-sm border border-white/60 rounded-xl">
          {[
            { id: 'today', label: "Today's Trips" },
            { id: 'needs_fixing', label: 'Needs Fixing ⚠' },
            { id: 'upcoming', label: 'Active & Upcoming' },
            { id: 'completed', label: 'Completed' },
            { id: 'all', label: 'All Trips' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterTab(tab.id as any)}
              className={`px-3 py-1.5 text-xs rounded-lg whitespace-nowrap transition-all ${
                filterTab === tab.id
                  ? 'silver-glass-active font-semibold shadow-xs'
                  : 'text-[#6B4F57] hover:text-[#1A0A0F] hover:bg-white/60'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-[#6B4F57] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search rider, trip ID, payer, auth..."
            className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-white/60 bg-white/70 backdrop-blur-sm text-[#1A0A0F] placeholder:text-[#6B4F57]/60 focus:outline-none focus:ring-1 focus:ring-[#1A0A0F]/30"
          />
        </div>
      </div>

      {/* Trips Table */}
      <div className="silver-glass-card rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-white/70 backdrop-blur-sm border-b border-[#1A0A0F]/10 text-[#6B4F57] font-semibold">
                <th className="py-3 px-4">Trip # / Date</th>
                <th className="py-3 px-4">Rider & Mobility</th>
                <th className="py-3 px-4">Origin & Destination</th>
                <th className="py-3 px-4">Driver & Vehicle</th>
                <th className="py-3 px-4">EVV Verification</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Fare</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1A0A0F]/10">
              {filteredTrips.length === 0 ? (
                <tr className="no-hover-row">
                  <td colSpan={8} className="py-12 text-center text-[#6B4F57]">
                    <div className="max-w-xs mx-auto space-y-2">
                      <Calendar className="w-8 h-8 text-[#1A0A0F] mx-auto opacity-40" />
                      <p className="font-bold text-sm text-[#1A0A0F]">No trips found</p>
                      <p className="text-xs">No rides match this filter or search query. Click "+ New Trip" to schedule.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredTrips.map((trip) => {
                  const isBlocked = trip.billingStatus === 'needs_fixing';

                  return (
                    <tr
                      key={trip.id}
                      className={`hover-cream-row ${
                        isBlocked ? 'bg-[#FDF0F1]/50' : ''
                      }`}
                    >
                      {/* Trip # & Date */}
                      <td className="py-3.5 px-4 font-mono-num">
                        <div className="font-bold text-[#1A0A0F]">{trip.tripNumber}</div>
                        <div className="text-[11px] text-[#6B4F57]">
                          {trip.date} · {trip.scheduledPickupTime}
                        </div>
                      </td>

                      {/* Rider & Mobility */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-[#1A0A0F]">{trip.riderName}</div>
                        <div className="text-[11px] text-[#6B4F57] flex items-center gap-1.5 mt-0.5">
                          <span className="capitalize">{trip.mobilityType}</span>
                          {trip.isRecurring && (
                            <span className="text-[10px] text-[#1A0A0F] font-bold bg-[#ECD0D8] px-1.5 py-0.5 rounded">
                              Recurring
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Origin & Destination */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="truncate text-[#1A0A0F] font-medium" title={trip.pickupAddress}>
                          From: {trip.pickupAddress.split(',')[0]}
                        </div>
                        <div className="truncate text-[#6B4F57] text-[11px]" title={trip.dropoffAddress}>
                          To: {trip.dropoffAddress.split(',')[0]}
                        </div>
                      </td>

                      {/* Driver & Vehicle */}
                      <td className="py-3.5 px-4">
                        {trip.driverName ? (
                          <>
                            <div className="font-semibold text-[#1A0A0F]">{trip.driverName}</div>
                            <div className="text-[11px] text-[#6B4F57] truncate">{trip.vehicleName?.split('(')[0]}</div>
                          </>
                        ) : (
                          <span className="text-[#9E6714] font-semibold">Unassigned</span>
                        )}
                      </td>

                      {/* EVV Checklist */}
                      <td className="py-3.5 px-4">
                        <VerificationChecklist verification={trip.verification} compact />
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <StatusBadge status={trip.status} />
                          {trip.billingStatus === 'needs_fixing' && (
                            <StatusBadge status="needs_fixing" labelOverride="Fix Missing EVV" />
                          )}
                        </div>
                      </td>

                      {/* Fare */}
                      <td className="py-3.5 px-4 text-right font-mono-num font-bold text-[#1A0A0F]">
                        ${trip.fare.total.toFixed(2)}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => onOpenTripDetail(trip)}
                            className="p-1.5 rounded-xl text-[#6B4F57] hover:text-[#1A0A0F] hover:bg-[#ECD0D8] transition-colors"
                            title="Inspect trip proof logbook"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {trip.billingStatus === 'needs_fixing' && (
                            <button
                              onClick={() => onOpenFixModal(trip)}
                              className="px-2.5 py-1 bg-gradient-to-r from-[#A82220] to-[#8C1B19] hover:from-[#8C1B19] hover:to-[#721513] text-white rounded-lg text-[11px] font-semibold transition-all shadow-2xs"
                              title="Resolve missing verification data"
                            >
                              Fix
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer scannable count */}
        <div className="p-3.5 bg-white/70 border-t border-[#1A0A0F]/10 flex items-center justify-between text-xs text-[#6B4F57]">
          <span>
            Showing <strong>{filteredTrips.length}</strong> of {trips.length} total logged trips
          </span>
          <span className="font-mono-num">
            Total Value: <strong>${filteredTrips.reduce((s, t) => s + t.fare.total, 0).toFixed(2)}</strong>
          </span>
        </div>
      </div>
    </div>
  );
};
