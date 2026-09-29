import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Sun,
  MapPin,
  CalendarDays,
  Users,
  CarFront,
  Smartphone,
  ShieldAlert,
  FileCheck2,
  FileBarChart2,
  Settings,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onMobileClose
}) => {
  const { activeScreen, setActiveScreen } = useApp();

  const navItems = [
    {
      id: 'today',
      label: 'Today',
      icon: Sun,
      subtitle: 'Daily pulse & action list'
    },
    {
      id: 'trips',
      label: 'Trips',
      icon: MapPin,
      subtitle: 'Book, filter & inspect'
    },
    {
      id: 'dispatch',
      label: 'Dispatch Board',
      icon: CalendarDays,
      subtitle: 'Driver timeline & alerts'
    },
    {
      id: 'riders',
      label: 'Riders',
      icon: Users,
      subtitle: 'Mobility & PHI records'
    },
    {
      id: 'fleet',
      label: 'Drivers & Fleet',
      icon: CarFront,
      subtitle: 'Vehicles & credentials'
    },
    {
      id: 'driver_app',
      label: 'Driver App',
      icon: Smartphone,
      subtitle: 'Mobile driver simulator'
    },
    {
      id: 'verification',
      label: 'Verification Center',
      icon: ShieldAlert,
      subtitle: 'EVV 6-point checklist'
    },
    {
      id: 'billing',
      label: 'Billing & Claims',
      icon: FileCheck2,
      subtitle: 'Claim batches & denials'
    },
    {
      id: 'reports',
      label: 'Audit & Reports',
      icon: FileBarChart2,
      subtitle: 'Proof packets & export'
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      subtitle: 'Payers, rules & audit log'
    }
  ];

  const handleNavClick = (screenId: string) => {
    setActiveScreen(screenId);
    if (mobileOpen) onMobileClose();
  };

  const sidebarContent = (
    <div className="flex flex-col h-full silver-glass-panel text-[#1A0A0F] relative overflow-hidden">
      {/* Top Header info block with at least 16px padding on all sides */}
      <div className="p-4 shrink-0 relative z-10">
        {!collapsed ? (
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl silver-glass-chip flex items-center justify-center font-display font-bold text-xs text-[#1A0A0F] shadow-xs shrink-0">
                TP
              </div>
              <div className="flex flex-col justify-center min-w-0">
                <span className="text-xs font-semibold text-[#1A0A0F] uppercase tracking-wider leading-snug whitespace-nowrap drop-shadow-2xs">
                  Operator Logbook
                </span>
                <span className="text-[10px] text-[#6B4F57] font-medium leading-snug whitespace-nowrap">
                  Columbus Metro NEMT Fleet
                </span>
              </div>
            </div>

            <button
              onClick={onToggleCollapse}
              className="hidden lg:flex collapse-toggle-btn w-8 h-8 rounded-full items-center justify-center shrink-0 cursor-pointer"
              title="Collapse sidebar"
              aria-label="Collapse sidebar"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-2.5">
            <div className="w-9 h-9 rounded-xl silver-glass-chip flex items-center justify-center font-display font-bold text-xs text-[#1A0A0F] shadow-xs shrink-0">
              TP
            </div>
            <button
              onClick={onToggleCollapse}
              className="hidden lg:flex collapse-toggle-btn w-8 h-8 rounded-full items-center justify-center shrink-0 cursor-pointer"
              title="Expand sidebar"
              aria-label="Expand sidebar"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* 1px glowing silver-glass gradient divider with 16px spacing before menu items */}
      <div className="silver-glass-divider shrink-0" />

      {/* Nav List with 16px top spacing below divider */}
      <nav className="flex-1 overflow-y-auto p-2.5 pt-4 space-y-1.5 relative z-10">
        {navItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = activeScreen === item.id;
          // Staggered entrance from bottom to top: settings (bottom) starts earliest, today (top) latest
          const delayMs = (navItems.length - 1 - index) * 90;

          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              style={{
                animationDelay: `${delayMs}ms`
              }}
              className={`sidebar-nav-item-enter w-full flex items-center ${
                collapsed ? 'justify-center px-2' : 'gap-3 px-3'
              } py-2.5 rounded-[12px] text-left text-xs font-medium group relative ${
                isActive
                  ? 'sidebar-nav-chip-active font-semibold'
                  : 'sidebar-nav-chip'
              }`}
              title={collapsed ? `${item.label} — ${item.subtitle}` : undefined}
            >
              <Icon
                className={`w-4 h-4 shrink-0 transition-transform ${
                  isActive ? 'scale-105' : 'group-hover:scale-105'
                }`}
              />

              {!collapsed && (
                <span className="flex-1 min-w-0 truncate">
                  {item.label}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer log info with glowing silver divider */}
      {!collapsed && (
        <>
          <div className="silver-glass-divider shrink-0" />
          <div className="p-3 text-[11px] text-[#6B4F57] bg-white/40 backdrop-blur-md shrink-0 relative z-10">
            <div className="flex items-center justify-between">
              <span>EVV Status:</span>
              <span className="font-semibold text-[#1E5A2D] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#1E5A2D] animate-pulse" />
                Active / Sandata
              </span>
            </div>
            <div className="text-[10px] text-[#7A5C64] mt-0.5 font-mono-num">
              Ohio Medicaid Provider #089421
            </div>
          </div>
        </>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop sticky sidebar with height calc(100vh - var(--header-h)) */}
      <aside
        className={`hidden lg:block shrink-0 transition-all duration-200 sticky z-30 ${
          collapsed ? 'w-20' : 'w-72'
        }`}
        style={{
          top: 'var(--header-h, 84px)',
          height: 'calc(100vh - var(--header-h, 84px))'
        }}
      >
        <div className="w-full h-full">
          {sidebarContent}
        </div>
      </aside>

      {/* Mobile Drawer (Tablets & Phones) */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-x-0 bottom-0 z-50 flex"
          style={{
            top: 'var(--header-h, 84px)'
          }}
        >
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs -z-10"
            onClick={onMobileClose}
          />
          <div className="relative w-72 max-w-xs h-full z-10 animate-in slide-in-from-left duration-200 shadow-xl">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
