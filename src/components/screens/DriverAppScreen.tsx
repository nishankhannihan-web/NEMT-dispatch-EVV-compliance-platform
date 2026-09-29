import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Trip, SignatureData } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import {
  Smartphone,
  PhoneCall,
  Navigation,
  CheckCircle2,
  Clock,
  MapPin,
  Shield,
  Wifi,
  WifiOff,
  PenTool,
  RotateCcw,
  AlertCircle
} from 'lucide-react';

export const DriverAppScreen: React.FC = () => {
  const {
    trips,
    drivers,
    activeDriverId,
    setActiveDriverId,
    recordDriverStep,
    saveSignature,
    isOfflineMode,
    toggleOfflineMode,
    queuedSyncCount,
    addToast
  } = useApp();

  const activeDriver = drivers.find((d) => d.id === activeDriverId) || drivers[0];
  const driverTrips = trips.filter((t) => t.driverId === activeDriver.id && t.date === '2026-09-28');

  // Currently active or next upcoming trip
  const [selectedTripId, setSelectedTripId] = useState<string>(
    driverTrips.find((t) => t.status !== 'completed')?.id || driverTrips[0]?.id || ''
  );

  const currentTrip = driverTrips.find((t) => t.id === selectedTripId) || driverTrips[0];

  // Signature modal states
  const [sigModalOpen, setSigModalOpen] = useState(false);
  const [signerName, setSignerName] = useState(currentTrip?.riderName || '');
  const [unableToSign, setUnableToSign] = useState(false);
  const [unableReason, setUnableReason] = useState<'facility_staff_signed' | 'physical_impairment' | 'cognitive_impairment' | 'medical_emergency' | 'refusal'>('facility_staff_signed');
  const [isDrawing, setIsDrawing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Phone frame simulation toggle
  const [phoneFrameView, setPhoneFrameView] = useState(false);

  useEffect(() => {
    if (currentTrip) {
      setSignerName(currentTrip.riderName);
    }
  }, [currentTrip]);

  // Canvas signature helpers
  const clearCanvas = () => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#1A0A0F';
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const handleSaveSignature = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTrip) return;

    let dataUrl = '';
    if (canvasRef.current && !unableToSign) {
      dataUrl = canvasRef.current.toDataURL();
    }

    const sigData: SignatureData = {
      signedBy: signerName || currentTrip.riderName,
      signatureUrl: dataUrl,
      timestamp: new Date().toISOString(),
      unableToSign,
      unableToSignReason: unableToSign ? unableReason : undefined
    };

    saveSignature(currentTrip.id, sigData);
    setSigModalOpen(false);
  };

  const handleSimulateCall = () => {
    addToast({
      type: 'info',
      title: 'Calling Dispatcher Dave...',
      message: 'Connecting via hands-free fleet audio: (614) 555-0100'
    });
  };

  const handleSimulateNav = (address: string) => {
    addToast({
      type: 'info',
      title: 'GPS Turn-By-Turn Routing',
      message: `Navigating to: ${address}. Audio guidance active.`
    });
  };

  // Determine current step in progress
  const getStepButton = () => {
    if (!currentTrip) return null;

    if (currentTrip.status === 'scheduled' || currentTrip.status === 'assigned') {
      return (
        <button
          onClick={() => recordDriverStep(currentTrip.id, 'started')}
          className="w-full h-16 rounded-xl bg-gradient-to-r from-[#2D121B] to-[#1A0A0F] hover:from-[#3A1620] hover:to-[#240E15] active:scale-[0.98] text-white text-lg font-bold shadow-md flex items-center justify-center gap-3 transition-all border border-white/10"
        >
          <Navigation className="w-6 h-6" />
          <span>START TRIP (En Route to Pickup)</span>
        </button>
      );
    }

    if (currentTrip.status === 'en_route_pickup') {
      return (
        <button
          onClick={() => recordDriverStep(currentTrip.id, 'arrived_pickup')}
          className="w-full h-16 rounded-xl bg-[#3D5A80] hover:bg-[#2e4562] active:scale-[0.98] text-white text-lg font-bold shadow-md flex items-center justify-center gap-3 transition-all border border-white/10"
        >
          <MapPin className="w-6 h-6" />
          <span>ARRIVED AT PICKUP LOCATION</span>
        </button>
      );
    }

    if (currentTrip.status === 'arrived_pickup') {
      return (
        <button
          onClick={() => recordDriverStep(currentTrip.id, 'picked_up')}
          className="w-full h-16 rounded-xl bg-[#1E5A2D] hover:bg-[#164321] active:scale-[0.98] text-white text-lg font-bold shadow-md flex items-center justify-center gap-3 transition-all border border-white/10"
        >
          <CheckCircle2 className="w-6 h-6" />
          <span>RIDER BOARDED & SECURED</span>
        </button>
      );
    }

    if (currentTrip.status === 'passenger_onboard') {
      return (
        <button
          onClick={() => recordDriverStep(currentTrip.id, 'arrived_dropoff')}
          className="w-full h-16 rounded-xl bg-[#B7791F] hover:bg-[#976319] active:scale-[0.98] text-white text-lg font-bold shadow-md flex items-center justify-center gap-3 transition-all border border-white/10"
        >
          <MapPin className="w-6 h-6" />
          <span>ARRIVED AT DESTINATION</span>
        </button>
      );
    }

    if (currentTrip.status === 'arrived_destination') {
      return (
        <div className="space-y-3">
          {!currentTrip.signature && (
            <button
              onClick={() => setSigModalOpen(true)}
              className="w-full h-14 rounded-xl bg-white/90 backdrop-blur-xs border-2 border-[#1A0A0F] text-[#1A0A0F] hover:bg-[#F6E6EA] text-base font-bold shadow-xs flex items-center justify-center gap-2 transition-colors"
            >
              <PenTool className="w-5 h-5" />
              <span>COLLECT RIDER SIGNATURE (Required)</span>
            </button>
          )}

          <button
            onClick={() => recordDriverStep(currentTrip.id, 'completed')}
            className="w-full h-16 rounded-xl bg-[#1E5A2D] hover:bg-[#164321] active:scale-[0.98] text-white text-lg font-bold shadow-md flex items-center justify-center gap-3 transition-all border border-white/10"
          >
            <CheckCircle2 className="w-6 h-6" />
            <span>COMPLETE TRIP & LOG EVV TIME</span>
          </button>
        </div>
      );
    }

    return (
      <div className="p-4 rounded-xl bg-[#EDF6EE] border border-[#C6E2CA] text-center text-[#1E5A2D] text-base font-bold flex items-center justify-center gap-2">
        <CheckCircle2 className="w-6 h-6" />
        <span>Trip Completed & Verified</span>
      </div>
    );
  };

  const appContent = (
    <div className="space-y-5">
      {/* Offline Alert Banner */}
      {isOfflineMode && (
        <div className="p-3 bg-[#FEF7EA] border border-[#F5D6A4] rounded-xl flex items-center justify-between text-xs text-[#B7791F] shadow-xs">
          <div className="flex items-center gap-2">
            <WifiOff className="w-4 h-4 shrink-0" />
            <span>
              <strong>Offline Mode Active:</strong> All GPS taps are queued locally ({queuedSyncCount} pending) and will auto-sync upon cell reconnect.
            </span>
          </div>
          <button
            onClick={toggleOfflineMode}
            className="px-2.5 py-1 bg-white/90 border border-[#B7791F] rounded font-medium text-[11px] hover:bg-white transition-colors"
          >
            Reconnect
          </button>
        </div>
      )}

      {/* Driver Identity Card & Emergency Dispatch Call */}
      <div className="bg-white/85 backdrop-blur-md border border-[#1A0A0F]/10 rounded-2xl p-4 flex items-center justify-between shadow-xs">
        <div>
          <span className="text-[11px] uppercase tracking-wider text-[#6B4F57] font-semibold block">
            Active Vehicle Tablet
          </span>
          <h2 className="text-base font-bold text-[#1A0A0F] font-display">
            Driver: {activeDriver.name}
          </h2>
          <span className="text-xs text-[#1E5A2D] flex items-center gap-1 mt-0.5 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" /> All 7 Credentials Valid & On File
          </span>
        </div>

        <button
          onClick={handleSimulateCall}
          className="flex items-center gap-1.5 px-3 py-2 bg-[#F6E6EA] text-[#1A0A0F] hover:bg-[#1A0A0F] hover:text-white rounded-xl text-xs font-bold transition-all shadow-xs border border-[#1A0A0F]/10"
        >
          <PhoneCall className="w-4 h-4" />
          <span>Call Dispatch</span>
        </button>
      </div>

      {/* Current Active Trip Focus Card */}
      {currentTrip ? (
        <div className="bg-white/90 backdrop-blur-md border-2 border-[#1A0A0F]/20 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#1A0A0F]/10">
            <div>
              <span className="text-xs font-mono-num font-bold text-[#1A0A0F]">
                {currentTrip.tripNumber}
              </span>
              <h3 className="text-xl font-bold font-display text-[#1A0A0F]">
                {currentTrip.riderName}
              </h3>
            </div>
            <div className="text-right">
              <span className="text-xs font-mono-num font-bold text-[#1A0A0F] block">
                Pickup: {currentTrip.scheduledPickupTime}
              </span>
              <span className="text-[11px] text-[#6B4F57]">
                (Appt: {currentTrip.appointmentTime})
              </span>
            </div>
          </div>

          {/* Mobility indicator */}
          <div className="flex items-center justify-between bg-white/70 backdrop-blur-xs p-3 rounded-xl border border-[#1A0A0F]/10 text-xs">
            <span className="font-semibold text-[#1A0A0F] capitalize flex items-center gap-1.5">
              <span>{currentTrip.mobilityType === 'wheelchair' ? '♿ Wheelchair Van Needed' : currentTrip.mobilityType === 'stretcher' ? '🛏️ Stretcher Gurney' : '🚶 Ambulatory Walking'}</span>
            </span>
            <span className="text-[#6B4F57] font-mono-num">{currentTrip.estimatedMiles} miles</span>
          </div>

          {/* Special Notes for Driver */}
          {currentTrip.notes && (
            <div className="p-3 bg-[#FEF7EA] border border-[#F5D6A4] rounded-xl text-xs text-[#1A0A0F]">
              <span className="font-semibold text-[#1A0A0F] block text-[11px] uppercase tracking-wider mb-0.5">
                Rider Pickup Note:
              </span>
              {currentTrip.notes}
            </div>
          )}

          {/* Addresses with One-Tap Navigate Buttons */}
          <div className="space-y-3">
            {/* Pickup */}
            <div className="p-3 bg-white/70 backdrop-blur-xs border border-[#1A0A0F]/10 rounded-xl flex items-center justify-between gap-2">
              <div className="min-w-0">
                <span className="text-[11px] font-semibold text-[#1E5A2D] uppercase tracking-wider flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" /> 1. Pickup Origin:
                </span>
                <p className="text-xs font-semibold text-[#1A0A0F] mt-0.5 truncate">
                  {currentTrip.pickupAddress}
                </p>
              </div>
              <button
                onClick={() => handleSimulateNav(currentTrip.pickupAddress)}
                className="px-3 py-1.5 bg-white border border-[#1E5A2D] text-[#1E5A2D] hover:bg-[#EDF6EE] rounded-lg text-xs font-bold shrink-0 flex items-center gap-1 shadow-xs transition-colors"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>GPS</span>
              </button>
            </div>

            {/* Dropoff */}
            <div className="p-3 bg-white/70 backdrop-blur-xs border border-[#1A0A0F]/10 rounded-xl flex items-center justify-between gap-2">
              <div className="min-w-0">
                <span className="text-[11px] font-semibold text-[#A82220] uppercase tracking-wider flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" /> 2. Drop-Off Destination:
                </span>
                <p className="text-xs font-semibold text-[#1A0A0F] mt-0.5 truncate">
                  {currentTrip.dropoffAddress}
                </p>
              </div>
              <button
                onClick={() => handleSimulateNav(currentTrip.dropoffAddress)}
                className="px-3 py-1.5 bg-white border border-[#A82220] text-[#A82220] hover:bg-[#FDF1F0] rounded-lg text-xs font-bold shrink-0 flex items-center gap-1 shadow-xs transition-colors"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>GPS</span>
              </button>
            </div>
          </div>

          {/* Current Step Big Action Button (One-Hand 48px+ Touch Target) */}
          <div className="pt-2">
            {getStepButton()}
          </div>

          {/* Location Privacy Notice */}
          <div className="pt-2 flex items-center justify-center gap-1.5 text-[11px] text-[#6B4F57]">
            <Shield className="w-3.5 h-3.5 text-[#1E5A2D]" />
            <span>Driver Privacy: GPS coordinates logged strictly upon pressing action buttons.</span>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center text-xs text-[#6B4F57] bg-white/80 backdrop-blur-md border border-[#1A0A0F]/10 rounded-2xl">
          No rides scheduled for this driver today.
        </div>
      )}

      {/* Driver's Other Rides for Today */}
      <div className="bg-white/85 backdrop-blur-md border border-[#1A0A0F]/10 rounded-2xl p-4 space-y-3 shadow-xs">
        <h3 className="font-semibold text-xs text-[#6B4F57] uppercase tracking-wider">
          Today's Ride Schedule ({driverTrips.length} Total)
        </h3>

        <div className="space-y-2">
          {driverTrips.map((t) => (
            <div
              key={t.id}
              onClick={() => setSelectedTripId(t.id)}
              className={`p-3 rounded-xl border flex items-center justify-between text-xs cursor-pointer transition-all ${
                t.id === selectedTripId
                  ? 'border-[#1A0A0F] bg-[#F6E6EA]/80 shadow-xs'
                  : 'border-[#1A0A0F]/10 hover:bg-[#F6E6EA]/40'
              }`}
            >
              <div>
                <div className="font-semibold text-[#1A0A0F]">{t.riderName}</div>
                <div className="text-[11px] text-[#6B4F57]">
                  Pickup @ {t.scheduledPickupTime} · {t.mobilityType}
                </div>
              </div>
              <StatusBadge status={t.status} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Top Controller Bar: Switch Driver & Toggle Phone Mockup */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-[#1A0A0F]/10 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-display text-[#1A0A0F]">
            Driver App Simulator
          </h1>
          <p className="text-xs text-[#6B4F57] mt-0.5">
            Simple, high-contrast, one-hand operation for drivers on the road.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-[#6B4F57]">
            <span>Simulate Driver:</span>
            <select
              value={activeDriverId}
              onChange={(e) => setActiveDriverId(e.target.value)}
              className="text-xs p-1.5 rounded-xl border border-[#1A0A0F]/15 bg-white/90 text-[#1A0A0F] font-medium"
            >
              {drivers.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setPhoneFrameView(!phoneFrameView)}
            className={`px-3 py-1.5 text-xs rounded-xl border font-medium transition-all ${
              phoneFrameView
                ? 'bg-gradient-to-r from-[#2D121B] to-[#1A0A0F] text-white border-[#1A0A0F] shadow-xs'
                : 'bg-white/80 text-[#1A0A0F] border-[#1A0A0F]/15 hover:bg-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5 inline mr-1" />
            <span>{phoneFrameView ? 'Exit Phone Bezel' : 'Phone Frame View'}</span>
          </button>
        </div>
      </div>

      {/* Main View Area */}
      {phoneFrameView ? (
        <div className="flex justify-center py-4">
          <div className="w-[390px] bg-[#1A0A0F] rounded-[44px] p-3 shadow-2xl border-4 border-[#3A1620] relative">
            {/* Phone Notch */}
            <div className="w-32 h-5 bg-[#1A0A0F] rounded-b-xl mx-auto mb-2" />
            <div className="bg-[#F6E6EA] rounded-[34px] p-4 max-h-[750px] overflow-y-auto">
              {appContent}
            </div>
            {/* Home indicator */}
            <div className="w-28 h-1 bg-white/40 rounded-full mx-auto mt-2" />
          </div>
        </div>
      ) : (
        <div className="max-w-2xl mx-auto">
          {appContent}
        </div>
      )}

      {/* Signature Capture Modal */}
      {sigModalOpen && currentTrip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white/95 backdrop-blur-xl border border-[#1A0A0F]/15 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-[#1A0A0F]">
            <div className="p-4 bg-white/90 border-b border-[#1A0A0F]/10 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-base font-display text-[#1A0A0F]">
                  Service Verification Signature
                </h3>
                <p className="text-xs text-[#6B4F57] mt-0.5">
                  Trip {currentTrip.tripNumber} · {currentTrip.riderName}
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveSignature} className="p-5 space-y-4 text-xs">
              <label className="flex items-center gap-2 cursor-pointer bg-white/80 p-2.5 rounded-xl border border-[#1A0A0F]/10">
                <input
                  type="checkbox"
                  checked={unableToSign}
                  onChange={(e) => setUnableToSign(e.target.checked)}
                  className="rounded text-[#1A0A0F] focus:ring-[#1A0A0F]"
                />
                <span className="font-medium text-[#1A0A0F]">Rider unable to sign (Waiver exception)</span>
              </label>

              {unableToSign ? (
                <div className="space-y-3 bg-white/80 p-3 rounded-xl border border-[#1A0A0F]/10">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#6B4F57] mb-1">
                      Medicaid Waiver Exception Reason *
                    </label>
                    <select
                      value={unableReason}
                      onChange={(e) => setUnableReason(e.target.value as any)}
                      className="w-full p-2 rounded-xl border border-[#1A0A0F]/15 bg-white text-[#1A0A0F]"
                    >
                      <option value="facility_staff_signed">Facility staff / Nurse signed intake</option>
                      <option value="physical_impairment">Physical impairment / tremor prevents signing</option>
                      <option value="cognitive_impairment">Cognitive memory limitation (verbal consent)</option>
                      <option value="medical_emergency">Immediate emergency room triage transfer</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#6B4F57] mb-1">
                      Signer / Attendant Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={signerName}
                      onChange={(e) => setSignerName(e.target.value)}
                      placeholder="e.g. RN Karen Diaz"
                      className="w-full p-2 rounded-xl border border-[#1A0A0F]/15 bg-white text-[#1A0A0F]"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-[#6B4F57]">
                      Draw signature in the box below:
                    </span>
                    <button
                      type="button"
                      onClick={clearCanvas}
                      className="text-[11px] text-[#1A0A0F] hover:underline flex items-center gap-0.5 font-medium"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Clear</span>
                    </button>
                  </div>

                  <div className="bg-white border-2 border-dashed border-[#1A0A0F]/30 rounded-xl overflow-hidden touch-none h-40 relative">
                    <canvas
                      ref={canvasRef}
                      width={380}
                      height={160}
                      className="w-full h-full cursor-crosshair"
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onTouchStart={startDrawing}
                      onTouchMove={draw}
                      onTouchEnd={stopDrawing}
                    />
                    <span className="absolute bottom-2 left-3 text-[10px] text-[#6B4F57]/60 pointer-events-none">
                      Sign on line ____________________________________
                    </span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#6B4F57] mb-1">Signer Name</label>
                    <input
                      type="text"
                      value={signerName}
                      onChange={(e) => setSignerName(e.target.value)}
                      className="w-full p-2 rounded-xl border border-[#1A0A0F]/15 bg-white text-[#1A0A0F]"
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#1A0A0F]/10">
                <button
                  type="button"
                  onClick={() => setSigModalOpen(false)}
                  className="px-4 py-2 text-xs text-[#6B4F57] hover:text-[#1A0A0F]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-[#1E5A2D] hover:bg-[#164321] rounded-xl transition-colors shadow-xs"
                >
                  Save Signature Verification
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
