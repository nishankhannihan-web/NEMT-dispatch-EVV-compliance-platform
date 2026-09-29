/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/common/Navbar';
import { Sidebar } from './components/common/Sidebar';
import { ToastContainer } from './components/common/ToastContainer';
import { TripDetailModal } from './components/common/TripDetailModal';
import { FixTripModal } from './components/common/FixTripModal';
import { NewTripDrawer } from './components/common/NewTripDrawer';

// Screens
import { TodayDashboard } from './components/screens/TodayDashboard';
import { TripsScreen } from './components/screens/TripsScreen';
import { DispatchBoardScreen } from './components/screens/DispatchBoardScreen';
import { RidersScreen } from './components/screens/RidersScreen';
import { FleetComplianceScreen } from './components/screens/FleetComplianceScreen';
import { DriverAppScreen } from './components/screens/DriverAppScreen';
import { VerificationCenterScreen } from './components/screens/VerificationCenterScreen';
import { BillingClaimsScreen } from './components/screens/BillingClaimsScreen';
import { ReportsScreen } from './components/screens/ReportsScreen';
import { SettingsScreen } from './components/screens/SettingsScreen';
import { Trip } from './types';
import {
  Sun,
  MapPin,
  CalendarDays,
  Smartphone,
  ShieldAlert
} from 'lucide-react';

const MainLayout: React.FC = () => {
  const { activeScreen, setActiveScreen, currentRole } = useApp();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Global modals
  const [detailTrip, setDetailTrip] = useState<Trip | null>(null);
  const [fixTrip, setFixTrip] = useState<Trip | null>(null);
  const [newTripDrawerOpen, setNewTripDrawerOpen] = useState(false);

  const renderActiveScreen = () => {
    switch (activeScreen) {
      case 'today':
        return (
          <TodayDashboard
            onOpenTripDetail={(t) => setDetailTrip(t)}
            onOpenFixModal={(t) => setFixTrip(t)}
            onOpenNewTrip={() => setNewTripDrawerOpen(true)}
          />
        );
      case 'trips':
        return (
          <TripsScreen
            onOpenTripDetail={(t) => setDetailTrip(t)}
            onOpenFixModal={(t) => setFixTrip(t)}
            onOpenNewTrip={() => setNewTripDrawerOpen(true)}
          />
        );
      case 'dispatch':
        return (
          <DispatchBoardScreen
            onOpenTripDetail={(t) => setDetailTrip(t)}
            onOpenFixModal={(t) => setFixTrip(t)}
          />
        );
      case 'riders':
        return (
          <RidersScreen
            onOpenTripDetail={(t) => setDetailTrip(t)}
          />
        );
      case 'fleet':
        return <FleetComplianceScreen />;
      case 'driver_app':
        return <DriverAppScreen />;
      case 'verification':
        return (
          <VerificationCenterScreen
            onOpenTripDetail={(t) => setDetailTrip(t)}
            onOpenFixModal={(t) => setFixTrip(t)}
          />
        );
      case 'billing':
        return (
          <BillingClaimsScreen
            onOpenTripDetail={(t) => setDetailTrip(t)}
            onOpenFixModal={(t) => setFixTrip(t)}
          />
        );
      case 'reports':
        return (
          <ReportsScreen
            onOpenTripDetail={(t) => setDetailTrip(t)}
          />
        );
      case 'settings':
        return <SettingsScreen />;
      default:
        return (
          <TodayDashboard
            onOpenTripDetail={(t) => setDetailTrip(t)}
            onOpenFixModal={(t) => setFixTrip(t)}
            onOpenNewTrip={() => setNewTripDrawerOpen(true)}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#F6E6EA] text-[#1A0A0F] flex flex-col font-sans selection:bg-[#ECD0D8] selection:text-[#1A0A0F]">
      {/* Top Navbar */}
      <Navbar onMenuToggle={() => setMobileMenuOpen(true)} />

      {/* Main Body with Sidebar + Content */}
      <div className="flex-1 flex w-full">
        {/* Sidebar */}
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          mobileOpen={mobileMenuOpen}
          onMobileClose={() => setMobileMenuOpen(false)}
        />

        {/* Viewport Content Area */}
        <main
          className="flex-1 min-w-0 py-6 pb-20 lg:pb-8"
          style={{
            paddingLeft: 'var(--content-pad, 32px)',
            paddingRight: 'var(--content-pad, 32px)'
          }}
        >
          <div key={activeScreen} className="w-full screen-entrance-wrapper">
            {renderActiveScreen()}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Tab Bar for Quick Access - Crystal Glass Floating Style */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-md border-t border-[#1A0A0F]/10 flex items-center justify-around py-2 px-2 shadow-lg">
        {[
          { id: 'today', label: 'Today', icon: Sun },
          { id: 'trips', label: 'Trips', icon: MapPin },
          { id: 'dispatch', label: 'Dispatch', icon: CalendarDays },
          { id: 'driver_app', label: 'Driver', icon: Smartphone },
          { id: 'verification', label: 'Verify', icon: ShieldAlert }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeScreen === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveScreen(tab.id)}
              className={`flex flex-col items-center gap-1 text-[11px] p-1.5 transition-colors ${
                isActive ? 'text-[#1A0A0F] font-bold' : 'text-[#6B4F57] hover:text-[#1A0A0F]'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Modals & Drawers */}
      <TripDetailModal
        trip={detailTrip}
        onClose={() => setDetailTrip(null)}
        onOpenFixModal={(t) => {
          setDetailTrip(null);
          setFixTrip(t);
        }}
      />

      <FixTripModal
        trip={fixTrip}
        onClose={() => setFixTrip(null)}
      />

      <NewTripDrawer
        isOpen={newTripDrawerOpen}
        onClose={() => setNewTripDrawerOpen(false)}
        onTripCreated={(t) => setDetailTrip(t)}
      />

      {/* Toasts */}
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
