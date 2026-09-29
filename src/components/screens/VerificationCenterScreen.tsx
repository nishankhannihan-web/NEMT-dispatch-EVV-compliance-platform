import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Trip, StateRule } from '../../types';
import { VerificationChecklist } from '../common/VerificationChecklist';
import { Tooltip } from '../common/Tooltip';
import {
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  FileSpreadsheet,
  Globe,
  Edit3,
  Calendar
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  Tooltip as ChartTooltip,
  CartesianGrid
} from 'recharts';

interface VerificationCenterScreenProps {
  onOpenTripDetail: (trip: Trip) => void;
  onOpenFixModal: (trip: Trip) => void;
}

// Custom Background Bar Shape scaled to each day's value, animated rising from bottom
const TrendBarShape = (props: any) => {
  const { x, y, width, height, index = 0 } = props;
  if (x == null || y == null || width == null || height == null || height <= 0) return null;
  return (
    <rect
      key={`trend-bar-${index}`}
      x={x}
      y={y}
      width={width}
      height={height}
      rx={4}
      ry={4}
      fill="#F6E6EA"
      stroke="#E2CBD2"
      strokeWidth={1}
      className="chart-background-bar"
      style={{
        animationDelay: `${index * 110 + 60}ms`
      }}
    />
  );
};

// Custom Square / Box Point Marker for the 7-day clean claim verification trend
const SquarePointMarker = (props: any) => {
  const { cx, cy, index = 0 } = props;
  if (cx == null || cy == null) return null;
  const size = 9;
  return (
    <rect
      key={`square-dot-${index}`}
      x={cx - size / 2}
      y={cy - size / 2}
      width={size}
      height={size}
      rx={1.5}
      ry={1.5}
      fill="#F6E6EA"
      stroke="#1A0A0F"
      strokeWidth={1.5}
      className="chart-square-dot"
      style={{
        animationDelay: `${index * 110 + 130}ms`,
        transformOrigin: `${cx}px ${cy}px`
      }}
    />
  );
};

const ActiveSquarePointMarker = (props: any) => {
  const { cx, cy } = props;
  if (cx == null || cy == null) return null;
  const size = 12;
  return (
    <rect
      x={cx - size / 2}
      y={cy - size / 2}
      width={size}
      height={size}
      rx={2}
      ry={2}
      fill="#F6E6EA"
      stroke="#3A0A14"
      strokeWidth={2}
      style={{ filter: 'drop-shadow(0 2px 6px rgba(58, 10, 20, 0.4))' }}
    />
  );
};

export const VerificationCenterScreen: React.FC<VerificationCenterScreenProps> = ({
  onOpenTripDetail,
  onOpenFixModal
}) => {
  const { trips, stateRules, selectedStateCode, setSelectedStateCode } = useApp();

  const currentStateRule =
    stateRules.find((r) => r.stateCode === selectedStateCode) || stateRules[0];

  // Trips needing fixing
  const needsFixingTrips = trips
    .filter((t) => t.billingStatus === 'needs_fixing')
    .sort((a, b) => b.fare.total - a.fare.total); // Sorted by money at stake

  const moneyAtRisk = needsFixingTrips.reduce((sum, t) => sum + t.fare.total, 0);

  // Overall verification score: count of trips with 100% verified EVV checklist
  const cleanTripsCount = trips.filter(
    (t) => Object.values(t.verification).every(Boolean)
  ).length;
  const verificationScorePct = Math.round((cleanTripsCount / trips.length) * 100);

  // Weekly Trend Chart Data
  const trendData = [
    { day: 'Mon', score: 88, clean: 22, exceptions: 3 },
    { day: 'Tue', score: 91, clean: 25, exceptions: 2 },
    { day: 'Wed', score: 86, clean: 21, exceptions: 4 },
    { day: 'Thu', score: 94, clean: 28, exceptions: 2 },
    { day: 'Fri', score: 96, clean: 31, exceptions: 1 },
    { day: 'Sat', score: 98, clean: 14, exceptions: 0 },
    { day: 'Sun', score: 94, clean: 16, exceptions: 1 }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-[#1A0A0F]">
            Verification Center
          </h1>
          <p className="text-sm text-[#6B4F57] mt-1">
            Fix missing details BEFORE they cost you money.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-[#1E5A2D] bg-[#EDF6EE] border border-[#C6E2CA] px-3 py-1.5 rounded-xl font-semibold flex items-center gap-1.5 shadow-xs">
            <ShieldCheck className="w-4 h-4" />
            <span>21st Century Cures Act Compliant</span>
          </span>
        </div>
      </div>

      {/* Top Banner: Big Verification Score & Money at Stake */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Score & Risk Summary (5 cols) */}
        <div className="lg:col-span-5 silver-glass-card rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#6B4F57]">
                Fleet Verification Health Score
              </span>
              <Tooltip content="Percentage of trips with complete 6-point EVV geocodes, exact timestamps, active driver IDs, and signed waivers." />
            </div>

            <div className="mt-3 flex items-baseline gap-3">
              <span className="text-5xl font-bold font-mono-num text-[#1A0A0F]">
                {verificationScorePct}%
              </span>
              <span className="text-xs text-[#1E5A2D] font-semibold flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" /> +4.2% vs last week
              </span>
            </div>

            <p className="text-xs text-[#6B4F57] mt-1">
              <strong>{cleanTripsCount}</strong> of {trips.length} logged trips have 100% verified claims ready for billing.
            </p>
          </div>

          <div className="pt-4 border-t border-[#1A0A0F]/10 silver-glass-card interactive-stat-card p-4 rounded-xl shadow-xs">
            <div className="flex items-center justify-between text-xs text-[#6B4F57]">
              <span className="font-semibold uppercase tracking-wider text-[#A82220]">
                Blocked Unverified Revenue
              </span>
              <DollarSign className="w-4 h-4 text-[#A82220]" />
            </div>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-2xl font-bold font-mono-num text-[#A82220]">
                ${moneyAtRisk.toFixed(2)}
              </span>
              <span className="stat-card-badge text-xs font-medium text-[#A82220] bg-[#FDF1F0] px-2 py-0.5 rounded border border-[#F6C4C1]">
                {needsFixingTrips.length} Rides Blocked
              </span>
            </div>
            <p className="text-[11px] text-[#6B4F57] mt-1">
              Claims cannot be submitted to Ohio Medicaid until missing dropoff or authorization codes are rectified.
            </p>
          </div>
        </div>

        {/* Verification Trend Chart (7 cols) */}
        <div className="lg:col-span-7 silver-glass-card rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between pb-2 border-b border-[#1A0A0F]/10">
            <div>
              <h3 className="font-semibold text-sm text-[#1A0A0F]">
                7-Day Clean Claim Verification Trend
              </h3>
              <p className="text-xs text-[#6B4F57] mt-0.5">
                Target &gt;95% clean verification rate prevents broker rate audits.
              </p>
            </div>
            <span className="text-xs font-mono-num font-semibold text-[#1A0A0F] bg-[#F6E6EA] px-2 py-0.5 rounded-lg border border-[#1A0A0F]/10">
              Goal: 95%
            </span>
          </div>

          <div className="verification-trend-chart h-44 mt-3">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0EBE1" />
                <XAxis dataKey="day" stroke="#6B4F57" fontSize={11} tickLine={false} />
                <YAxis domain={[80, 100]} stroke="#6B4F57" fontSize={11} tickLine={false} />
                <ChartTooltip
                  contentStyle={{
                    backgroundColor: '#F6E6EA',
                    borderColor: '#1A0A0F',
                    fontSize: '11px',
                    borderRadius: '8px'
                  }}
                  formatter={(value: any, name: any) => [
                    `${value}%`,
                    name === 'score' ? 'Clean Claim Rate' : String(name || '')
                  ]}
                />
                {/* Background Bars scaled to each day's score */}
                <Bar
                  dataKey="score"
                  barSize={28}
                  shape={<TrendBarShape />}
                  isAnimationActive={false}
                  tooltipType="none"
                />
                {/* Maroon Trend Line sitting on top of the bars */}
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#1A0A0F"
                  strokeWidth={2.5}
                  isAnimationActive={true}
                  animationDuration={1350}
                  animationEasing="ease-out"
                  dot={<SquarePointMarker />}
                  activeDot={<ActiveSquarePointMarker />}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* "Needs Fixing" Priority Queue Sorted by Money at Stake */}
      <div className="bg-white/80 backdrop-blur-md border border-[#1A0A0F]/10 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#1A0A0F]/10">
          <div>
            <h2 className="text-base font-bold font-display text-[#A82220] flex items-center gap-2">
              <ShieldAlert className="w-5 h-5" />
              Exception Queue — Action Required (Sorted by Money at Stake)
            </h2>
            <p className="text-xs text-[#6B4F57] mt-0.5">
              These trips are incomplete. Fix them here to unblock billing. Every edit requires an audit justification note.
            </p>
          </div>
          <span className="text-xs font-mono-num font-bold text-[#A82220] bg-[#FDF1F0] px-2.5 py-1 rounded-md border border-[#F6C4C1]">
            ${moneyAtRisk.toFixed(2)} Total at Stake
          </span>
        </div>

        {needsFixingTrips.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#1E5A2D] bg-[#EDF6EE] rounded-2xl border border-[#C6E2CA]">
            <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-[#1E5A2D]" />
            <p className="font-bold text-sm">All trips 100% verified!</p>
            <p className="text-xs text-[#6B4F57] mt-1">There are no verification exceptions pending in your queue.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {needsFixingTrips.map((trip) => {
              // Missing reason extraction
              const missingList: string[] = [];
              if (!trip.verification.exactTimes || !trip.verification.locations) {
                missingList.push('Missing Drop-Off GPS Timestamp');
              }
              if (!trip.authorizationNumber) {
                missingList.push('Missing Broker Prior Authorization Number');
              }
              if (!trip.verification.signature) {
                missingList.push('Missing Rider Signature / Exception Attestation');
              }

              return (
                <div
                  key={trip.id}
                  className="hover-cream-card p-4 rounded-xl border border-[#A82220]/30 bg-white/70 backdrop-blur-xs flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs shadow-xs"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold font-mono-num text-[#1A0A0F]">
                        {trip.tripNumber}
                      </span>
                      <span className="font-semibold text-[#1A0A0F] text-sm">
                        {trip.riderName}
                      </span>
                      <span className="text-[11px] text-[#6B4F57] font-mono-num">
                        · {trip.date} @ {trip.scheduledPickupTime}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {missingList.map((miss, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#A82220] bg-white border border-[#F6C4C1] px-2 py-0.5 rounded-lg shadow-2xs"
                        >
                          <AlertTriangle className="w-3 h-3 shrink-0" />
                          <span>{miss}</span>
                        </span>
                      ))}
                    </div>

                    <p className="text-[11px] text-[#6B4F57] truncate">
                      Payer: <strong>{trip.payerName}</strong> · Driver: {trip.driverName || 'Unassigned'}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 shrink-0 justify-between md:justify-end border-t md:border-t-0 pt-2 md:pt-0 border-[#1A0A0F]/10">
                    <div className="text-right font-mono-num">
                      <span className="block text-sm font-bold text-[#A82220]">
                        ${trip.fare.total.toFixed(2)}
                      </span>
                      <span className="block text-[10px] text-[#6B4F57]">Claim Value</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onOpenTripDetail(trip)}
                        className="px-3 py-1.5 rounded-xl border border-[#1A0A0F]/15 bg-white/80 hover:bg-white text-[#1A0A0F] text-xs font-medium transition-colors"
                      >
                        Inspect
                      </button>
                      <button
                        onClick={() => onOpenFixModal(trip)}
                        className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-[#2D121B] to-[#1A0A0F] hover:from-[#3A1620] hover:to-[#240E15] text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all border border-white/10"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Fix Now</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* State Verification Rules Configurator Panel */}
      <div className="bg-white/80 backdrop-blur-md border border-[#1A0A0F]/10 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1A0A0F]/10">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-[#1A0A0F]" />
            <div>
              <h3 className="font-semibold text-sm text-[#1A0A0F]">
                State & Broker EVV Compliance Matrix
              </h3>
              <p className="text-xs text-[#6B4F57]">
                Rules are configurable per jurisdiction, never hard-coded. Select a state to inspect mandatory data points.
              </p>
            </div>
          </div>

          {/* State selector */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-[#6B4F57]">Active State:</span>
            <select
              value={selectedStateCode}
              onChange={(e) => setSelectedStateCode(e.target.value)}
              className="p-1.5 rounded-xl border border-[#1A0A0F]/15 bg-white/90 text-[#1A0A0F] font-bold text-xs"
            >
              {stateRules.map((rule) => (
                <option key={rule.stateCode} value={rule.stateCode}>
                  {rule.stateName} ({rule.stateCode})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="bg-white/70 backdrop-blur-xs p-4 rounded-xl border border-[#1A0A0F]/10 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#1A0A0F]">{currentStateRule.stateName} Aggregator System:</span>
              <span className="font-mono-num text-[11px] text-[#1E5A2D] font-semibold">
                {currentStateRule.evvMandated ? 'EVV Mandated' : 'Optional'}
              </span>
            </div>
            <p className="text-[#1A0A0F] font-medium">{currentStateRule.brokerSystem}</p>
            <p className="text-[#6B4F57] text-[11px] leading-relaxed pt-1 border-t border-[#1A0A0F]/10">
              {currentStateRule.notes}
            </p>
          </div>

          <div className="bg-white/70 backdrop-blur-xs p-4 rounded-xl border border-[#1A0A0F]/10 space-y-2">
            <span className="font-bold text-[#1A0A0F] block">
              Mandatory Data Verification Elements for {currentStateRule.stateCode}:
            </span>
            <ul className="space-y-1 text-[#6B4F57] text-[11px] list-disc list-inside">
              {currentStateRule.requiredFields.map((field, idx) => (
                <li key={idx} className="font-medium text-[#1A0A0F]">{field}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
