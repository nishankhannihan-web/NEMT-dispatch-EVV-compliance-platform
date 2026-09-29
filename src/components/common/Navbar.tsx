import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { Role } from '../../types';
import { Shield, Clock, UserCheck, ChevronDown, Wifi, WifiOff, PhoneCall, Radio, Car, FileText } from 'lucide-react';

export const Navbar: React.FC<{ onMenuToggle?: () => void }> = ({ onMenuToggle }) => {
  const {
    currentRole,
    setCurrentRole,
    activeScreen,
    isOfflineMode,
    toggleOfflineMode,
    drivers,
    activeDriverId,
    setActiveDriverId
  } = useApp();

  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(900); // 15 minute session idle simulation
  const headerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const updateHeaderHeight = () => {
      if (headerRef.current) {
        const height = headerRef.current.offsetHeight;
        document.documentElement.style.setProperty('--header-h', `${height}px`);
      }
    };

    updateHeaderHeight();

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined' && headerRef.current) {
      resizeObserver = new ResizeObserver(() => {
        updateHeaderHeight();
      });
      resizeObserver.observe(headerRef.current);
    }

    window.addEventListener('resize', updateHeaderHeight);
    return () => {
      if (resizeObserver) resizeObserver.disconnect();
      window.removeEventListener('resize', updateHeaderHeight);
    };
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => (prev > 10 ? prev - 1 : 900));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatIdleTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const roleLabels: Record<Role, { label: string; badge: string; desc: string; icon: React.FC<{ className?: string }> }> = {
    owner_admin: { label: 'Owner / Admin', badge: 'Owner', desc: 'Compliance health, revenue, full access', icon: Shield },
    dispatcher: { label: 'Dispatcher', badge: 'Dispatcher', desc: 'Trip scheduling, driver timeline & alerts', icon: Radio },
    driver: { label: 'Driver (Mobile)', badge: 'Driver View', desc: 'Large 1-hand touch screen, GPS events', icon: Car },
    billing: { label: 'Billing Specialist', badge: 'Billing', desc: 'Verification fixes, claim batches & denials', icon: FileText }
  };

  return (
    <header ref={headerRef} className="sticky top-0 z-40 silver-glass-header">
      {/* Main Top Bar: Full Width without max-w or mx-auto */}
      <div
        className="w-full h-14 flex items-center justify-between relative"
        style={{
          paddingLeft: 'var(--header-pad-left, 20px)',
          paddingRight: 'var(--header-pad-right, 32px)'
        }}
      >
        {/* Zone 1: Wordmark */}
        <div className="flex items-center gap-3">
          {onMenuToggle && (
            <button
              onClick={onMenuToggle}
              className="lg:hidden p-1.5 -ml-1 rounded-xl text-[#6B4F57] hover:text-[#1A0A0F] silver-glass-chip focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          )}

          <a href="#" className="group">
            <span className="text-xl font-bold font-display text-[#1A0A0F] tracking-tight group-hover:text-[#3A1620] transition-colors leading-none drop-shadow-2xs">
              TripProof
            </span>
          </a>
        </div>

        {/* Zone 2: Perfectly Centered Idle Timeout Pill (Silver-Glass Chip) */}
        <div className="hidden md:flex items-center gap-3 text-xs text-[#6B4F57] absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-auto">
          <div className="flex items-center gap-2 silver-glass-chip px-3 py-1.5 rounded-[12px]">
            <Clock className="w-3.5 h-3.5 text-[#1A0A0F]" />
            <span className="text-[#1A0A0F]">Idle Timeout:</span>
            <span className="font-mono-num font-bold text-[#1A0A0F]">{formatIdleTime(secondsRemaining)}</span>
            <button
              onClick={() => setSecondsRemaining(900)}
              className="text-[10px] text-[#1A0A0F] hover:bg-white font-bold ml-1 px-1.5 py-0.5 rounded bg-white/70 border border-white/80 shadow-2xs transition-colors"
              title="Reset idle timer"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Zone 3: Role Switcher & User Profile (Pushed to Far Right) */}
        <div className="flex items-center gap-2 sm:gap-3 ml-auto">
          {currentRole === 'driver' && (
            <button
              onClick={toggleOfflineMode}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[12px] silver-glass-chip text-xs transition-colors ${
                isOfflineMode
                  ? 'bg-[#FDF5E6]/90 border-[#F6DEC0] text-[#9E6714]'
                  : 'text-[#1E5A2D]'
              }`}
              title="Simulate cellular loss in vehicle"
            >
              {isOfflineMode ? <WifiOff className="w-3.5 h-3.5" /> : <Wifi className="w-3.5 h-3.5" />}
              <span className="font-medium hidden sm:inline">{isOfflineMode ? 'Simulating Offline' : 'Online'}</span>
            </button>
          )}

          {/* Driver selector if in driver role */}
          {currentRole === 'driver' && (
            <select
              value={activeDriverId}
              onChange={(e) => setActiveDriverId(e.target.value)}
              className="text-xs silver-glass-chip rounded-[12px] px-2.5 py-1.5 text-[#1A0A0F] focus:ring-1 focus:ring-[#1A0A0F]"
              title="Select active driver"
            >
              {drivers.map((d) => (
                <option key={d.id} value={d.id}>
                  Driver: {d.name}
                </option>
              ))}
            </select>
          )}

          {/* Role Switcher Dropdown (Silver-Glass Chip) */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
              className="flex items-center gap-2 role-dropdown-chip px-3.5 py-1.5 rounded-[12px] text-xs font-semibold"
              aria-expanded={roleDropdownOpen}
            >
              <UserCheck className="w-3.5 h-3.5 transition-transform group-hover:scale-105" />
              <span className="hidden sm:inline font-normal opacity-85">Role:</span>
              <span className="font-bold">{roleLabels[currentRole].badge}</span>
              <ChevronDown className="w-3.5 h-3.5 opacity-70 transition-transform group-hover:translate-y-0.5" />
            </button>

            {roleDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setRoleDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-68 silver-glass-panel rounded-2xl shadow-xl z-50 p-2 space-y-1.5 border border-white/80 backdrop-blur-xl">
                  <div className="px-2 py-1 text-[11px] text-[#6B4F57] font-semibold uppercase tracking-wider">
                    Switch Prototype Role
                  </div>
                  <div className="silver-glass-divider mb-1" />
                  {(Object.keys(roleLabels) as Role[]).map((r) => {
                    const isSelected = currentRole === r;
                    const RoleIcon = roleLabels[r].icon;
                    return (
                      <button
                        key={r}
                        type="button"
                        onClick={() => {
                          setCurrentRole(r);
                          setRoleDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2.5 rounded-[12px] text-xs flex flex-col gap-1 transition-all ${
                          isSelected
                            ? 'role-option-chip-selected font-semibold'
                            : 'role-option-chip'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <RoleIcon className="w-3.5 h-3.5 shrink-0" />
                            <span className="font-semibold">{roleLabels[r].badge}</span>
                          </div>
                          {isSelected && (
                            <span className="role-active-badge text-[10px] font-bold bg-[#EDF6EE] text-[#1E5A2D] px-1.5 py-0.5 rounded-md border border-[#C6E2CA]">
                              Active
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] opacity-80 font-normal leading-tight pl-5.5">
                          {roleLabels[r].desc}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
