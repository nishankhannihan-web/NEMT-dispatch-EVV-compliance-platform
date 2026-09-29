import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Role,
  Trip,
  Driver,
  Vehicle,
  Rider,
  Payer,
  ClaimBatch,
  AuditLogItem,
  StateRule,
  OnboardingStep,
  TripEvent,
  SignatureData
} from '../types';
import {
  INITIAL_TRIPS,
  INITIAL_DRIVERS,
  INITIAL_VEHICLES,
  INITIAL_RIDERS,
  INITIAL_PAYERS,
  INITIAL_CLAIM_BATCHES,
  INITIAL_AUDIT_LOGS,
  INITIAL_STATE_RULES,
  INITIAL_ONBOARDING_STEPS
} from '../data/mockData';

export interface ToastMessage {
  id: string;
  type: 'success' | 'warning' | 'danger' | 'info';
  title: string;
  message: string;
  timestamp: number;
}

interface AppContextType {
  // Navigation & Role
  currentRole: Role;
  setCurrentRole: (role: Role) => void;
  activeScreen: string;
  setActiveScreen: (screen: string) => void;
  activeDriverId: string;
  setActiveDriverId: (id: string) => void;

  // Data
  trips: Trip[];
  drivers: Driver[];
  vehicles: Vehicle[];
  riders: Rider[];
  payers: Payer[];
  claimBatches: ClaimBatch[];
  auditLogs: AuditLogItem[];
  stateRules: StateRule[];
  selectedStateCode: string;
  setSelectedStateCode: (code: string) => void;
  onboardingSteps: OnboardingStep[];

  // PHI security
  revealedPhiKeys: Set<string>;
  revealPhi: (key: string, riderName: string, reason: string) => void;

  // Actions
  addTrip: (newTrip: Partial<Trip>) => Trip;
  updateTrip: (id: string, updates: Partial<Trip>, auditReason?: string) => void;
  assignTrip: (tripId: string, driverId: string, vehicleId: string) => { success: boolean; error?: string };
  recordDriverStep: (tripId: string, step: 'started' | 'arrived_pickup' | 'picked_up' | 'arrived_dropoff' | 'completed') => void;
  saveSignature: (tripId: string, signature: SignatureData) => void;
  fixTripVerification: (tripId: string, updates: Partial<Trip>, auditReason: string) => void;
  resubmitDeniedTrip: (tripId: string, fixDetails: string, auditReason: string) => void;
  createClaimBatch: (payerId: string, tripIds: string[]) => ClaimBatch;
  addRider: (rider: Partial<Rider>) => void;
  renewDriverCredential: (driverId: string, credentialId: string, newExpiry: string) => void;
  renewVehicleCredential: (vehicleId: string, credType: string, newExpiry: string) => void;
  toggleOnboardingStep: (stepId: string) => void;

  // Driver Offline Simulation
  isOfflineMode: boolean;
  toggleOfflineMode: () => void;
  queuedSyncCount: number;

  // Notifications
  toasts: ToastMessage[];
  addToast: (toast: Omit<ToastMessage, 'id' | 'timestamp'>) => void;
  dismissToast: (id: string) => void;

  // Quick stats
  selectedTripForDetail: Trip | null;
  setSelectedTripForDetail: (trip: Trip | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentRole, setCurrentRoleState] = useState<Role>('owner_admin');
  const [activeScreen, setActiveScreen] = useState<string>('today');
  const [activeDriverId, setActiveDriverId] = useState<string>('drv-1');
  const [selectedStateCode, setSelectedStateCode] = useState<string>('OH');

  const [trips, setTrips] = useState<Trip[]>(INITIAL_TRIPS);
  const [drivers, setDrivers] = useState<Driver[]>(INITIAL_DRIVERS);
  const [vehicles, setVehicles] = useState<Vehicle[]>(INITIAL_VEHICLES);
  const [riders, setRiders] = useState<Rider[]>(INITIAL_RIDERS);
  const [payers] = useState<Payer[]>(INITIAL_PAYERS);
  const [claimBatches, setClaimBatches] = useState<ClaimBatch[]>(INITIAL_CLAIM_BATCHES);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>(INITIAL_AUDIT_LOGS);
  const [stateRules] = useState<StateRule[]>(INITIAL_STATE_RULES);
  const [onboardingSteps, setOnboardingSteps] = useState<OnboardingStep[]>(INITIAL_ONBOARDING_STEPS);

  const [revealedPhiKeys, setRevealedPhiKeys] = useState<Set<string>>(new Set());
  const [isOfflineMode, setIsOfflineMode] = useState<boolean>(false);
  const [queuedSyncCount, setQueuedSyncCount] = useState<number>(0);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [selectedTripForDetail, setSelectedTripForDetail] = useState<Trip | null>(null);

  // Auto-switch screen if driver role is selected
  const setCurrentRole = (role: Role) => {
    setCurrentRoleState(role);
    if (role === 'driver') {
      setActiveScreen('driver_app');
    } else if (activeScreen === 'driver_app') {
      setActiveScreen('today');
    }
  };

  const addToast = (toast: Omit<ToastMessage, 'id' | 'timestamp'>) => {
    const id = 'toast-' + Math.random().toString(36).substring(2, 9);
    const newToast: ToastMessage = {
      ...toast,
      id,
      timestamp: Date.now()
    };
    setToasts((prev) => [...prev, newToast]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const addAuditLog = (
    action: AuditLogItem['action'],
    entityType: AuditLogItem['entityType'],
    entityId: string,
    entityName: string,
    details: string,
    reason?: string
  ) => {
    const newLog: AuditLogItem = {
      id: 'aud-' + Date.now(),
      timestamp: new Date().toISOString(),
      userId: `usr-${currentRole}`,
      userName:
        currentRole === 'owner_admin'
          ? 'Sarah Chen (Owner)'
          : currentRole === 'dispatcher'
          ? 'David Miller (Dispatch)'
          : currentRole === 'driver'
          ? 'Marcus Vance (Driver)'
          : 'Linda Kowalski (Billing)',
      userRole: currentRole,
      action,
      entityType,
      entityId,
      entityName,
      details,
      reason
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  const revealPhi = (key: string, riderName: string, reason: string) => {
    setRevealedPhiKeys((prev) => new Set(prev).add(key));
    addAuditLog(
      'view_phi',
      'rider',
      key,
      riderName,
      `User unmasked protected health information (${key}).`,
      reason || 'Staff clinical/billing necessity'
    );
    addToast({
      type: 'info',
      title: 'PHI Reveal Logged',
      message: `Access to ${riderName}'s identification has been entered into the immutable HIPAA audit log.`
    });
  };

  const toggleOfflineMode = () => {
    if (isOfflineMode) {
      setIsOfflineMode(false);
      if (queuedSyncCount > 0) {
        addToast({
          type: 'success',
          title: 'Back Online & Synced',
          message: `Successfully synchronized ${queuedSyncCount} offline EVV GPS events to the server.`
        });
        setQueuedSyncCount(0);
      } else {
        addToast({
          type: 'success',
          title: 'Connection Restored',
          message: 'Device is connected to cellular network.'
        });
      }
    } else {
      setIsOfflineMode(true);
      addToast({
        type: 'warning',
        title: 'Offline Simulation Active',
        message: 'Driver device is offline. Timestamps and GPS will queue locally until reconnected.'
      });
    }
  };

  const addTrip = (newTripData: Partial<Trip>): Trip => {
    const count = trips.length + 101;
    const tripNum = `TP-2026-${count.toString().padStart(3, '0')}`;
    const payer = payers.find((p) => p.id === newTripData.payerId) || payers[0];
    const mobility = newTripData.mobilityType || 'walking';

    const baseRate =
      mobility === 'stretcher'
        ? payer.baseRateStretcher
        : mobility === 'wheelchair'
        ? payer.baseRateWheelchair
        : payer.baseRateWalking;
    const surcharge = mobility === 'wheelchair' ? payer.wheelchairSurcharge : mobility === 'stretcher' ? payer.stretcherSurcharge : 0;
    const estMiles = newTripData.estimatedMiles || 4.5;
    const mileageCost = Number((estMiles * payer.perMileRate).toFixed(2));
    const totalFare = Number((baseRate + mileageCost + surcharge).toFixed(2));

    const rider = riders.find((r) => r.id === newTripData.riderId);

    const trip: Trip = {
      id: 'trip-' + Date.now(),
      tripNumber: tripNum,
      riderId: newTripData.riderId || '',
      riderName: rider?.name || newTripData.riderName || 'Unknown Rider',
      riderPhone: rider?.phone || '(614) 555-0000',
      riderMedicaidId: rider?.medicaidId || 'OH-00000000',
      payerId: payer.id,
      payerName: payer.name,
      authorizationNumber: newTripData.authorizationNumber || '',
      date: newTripData.date || new Date().toISOString().split('T')[0],
      scheduledPickupTime: newTripData.scheduledPickupTime || '09:00',
      appointmentTime: newTripData.appointmentTime || '09:45',
      pickupAddress: newTripData.pickupAddress || rider?.homeAddress || '100 Main St, Columbus, OH',
      pickupLat: newTripData.pickupLat || 39.9612,
      pickupLng: newTripData.pickupLng || -82.9988,
      dropoffAddress: newTripData.dropoffAddress || rider?.defaultDropoffAddress || 'Hospital Outpatient, Columbus, OH',
      dropoffLat: newTripData.dropoffLat || 39.9700,
      dropoffLng: newTripData.dropoffLng || -82.9900,
      mobilityType: mobility,
      escortRequired: !!newTripData.escortRequired,
      isRecurring: !!newTripData.isRecurring,
      recurringDays: newTripData.recurringDays || [],
      notes: newTripData.notes || '',
      status: 'scheduled',
      billingStatus: 'ready_to_bill',
      estimatedMiles: estMiles,
      fare: {
        baseRate,
        mileageRate: mileageCost,
        surcharges: surcharge,
        total: totalFare
      },
      verification: {
        serviceType: true,
        riderIdentity: true,
        serviceDate: true,
        locations: true,
        driverIdentity: false, // Needs assignment!
        exactTimes: false,     // Needs trip execution!
        authorization: !payer.requiresPriorAuth || !!newTripData.authorizationNumber,
        signature: false
      },
      events: [
        {
          id: 'ev-' + Date.now(),
          tripId: 'trip-' + Date.now(),
          type: 'created',
          timestamp: new Date().toISOString(),
          recordedByUserId: `usr-${currentRole}`,
          recordedByName: currentRole === 'owner_admin' ? 'Sarah Chen' : 'David Miller',
          note: 'Trip booked in system.'
        }
      ]
    };

    setTrips((prev) => [trip, ...prev]);
    addAuditLog('edit_trip', 'trip', trip.id, trip.tripNumber, `Created new trip for ${trip.riderName}.`);
    addToast({
      type: 'success',
      title: 'Trip Created',
      message: `${trip.tripNumber} booked for ${trip.riderName}. Ready for dispatch.`
    });
    return trip;
  };

  const updateTrip = (id: string, updates: Partial<Trip>, auditReason?: string) => {
    setTrips((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const updated = { ...t, ...updates };
          return updated;
        }
        return t;
      })
    );
    if (auditReason) {
      addAuditLog('edit_trip', 'trip', id, `Trip ${id}`, `Updated trip details.`, auditReason);
    }
  };

  const assignTrip = (tripId: string, driverId: string, vehicleId: string): { success: boolean; error?: string } => {
    const driver = drivers.find((d) => d.id === driverId);
    const vehicle = vehicles.find((v) => v.id === vehicleId);
    const trip = trips.find((t) => t.id === tripId);

    if (!driver || !vehicle || !trip) {
      return { success: false, error: 'Driver, vehicle, or trip not found.' };
    }

    // HARD BLOCK 1: Check driver expired credentials!
    const hasExpiredDriverCred = driver.credentials.some((c) => c.status === 'expired');
    if (hasExpiredDriverCred) {
      const expiredCred = driver.credentials.find((c) => c.status === 'expired');
      const msg = `DISPATCH BLOCKED: ${driver.name} has an expired required credential (${expiredCred?.name}). State Medicaid regulations prohibit dispatching drivers with non-compliant files.`;
      addToast({ type: 'danger', title: 'Dispatch Blocked', message: msg });
      return { success: false, error: msg };
    }

    // HARD BLOCK 2: Check vehicle expired credentials!
    const hasExpiredVehicleCred = vehicle.credentials.some((c) => c.status === 'expired');
    if (hasExpiredVehicleCred) {
      const expiredDoc = vehicle.credentials.find((c) => c.status === 'expired');
      const msg = `DISPATCH BLOCKED: ${vehicle.name} has an expired certification (${expiredDoc?.name}). Grounded by compliance rule.`;
      addToast({ type: 'danger', title: 'Vehicle Grounded', message: msg });
      return { success: false, error: msg };
    }

    // HARD BLOCK 3: Capability mismatch (Wheelchair trip in a sedan)
    if (trip.mobilityType === 'wheelchair' && vehicle.maxWheelchairs === 0) {
      const msg = `DISPATCH BLOCKED: ${trip.riderName} requires a wheelchair lift van, but ${vehicle.name} is a standard sedan.`;
      addToast({ type: 'danger', title: 'Vehicle Incompatible', message: msg });
      return { success: false, error: msg };
    }

    if (trip.mobilityType === 'stretcher' && vehicle.type !== 'stretcher_van') {
      const msg = `DISPATCH BLOCKED: Stretcher gurney requires specialized stretcher van (#301).`;
      addToast({ type: 'danger', title: 'Vehicle Incompatible', message: msg });
      return { success: false, error: msg };
    }

    // Perform assignment
    setTrips((prev) =>
      prev.map((t) => {
        if (t.id === tripId) {
          const newEvents: TripEvent[] = [
            ...t.events,
            {
              id: 'ev-' + Date.now(),
              tripId: t.id,
              type: 'assigned',
              timestamp: new Date().toISOString(),
              recordedByUserId: `usr-${currentRole}`,
              recordedByName: currentRole === 'owner_admin' ? 'Sarah Chen' : 'David Miller',
              note: `Assigned to ${driver.name} with ${vehicle.name}.`
            }
          ];
          return {
            ...t,
            driverId: driver.id,
            driverName: driver.name,
            vehicleId: vehicle.id,
            vehicleName: vehicle.name,
            status: t.status === 'scheduled' ? 'assigned' : t.status,
            verification: {
              ...t.verification,
              driverIdentity: true
            },
            events: newEvents
          };
        }
        return t;
      })
    );

    addAuditLog(
      'assign_trip',
      'trip',
      trip.id,
      trip.tripNumber,
      `Assigned ${driver.name} (${vehicle.name}) to transport ${trip.riderName}.`
    );

    addToast({
      type: 'success',
      title: 'Trip Assigned & Dispatched',
      message: `${trip.tripNumber} assigned to ${driver.name}. Mobile push notification dispatched.`
    });

    return { success: true };
  };

  const recordDriverStep = (
    tripId: string,
    step: 'started' | 'arrived_pickup' | 'picked_up' | 'arrived_dropoff' | 'completed'
  ) => {
    const trip = trips.find((t) => t.id === tripId);
    if (!trip) return;

    if (isOfflineMode) {
      setQueuedSyncCount((prev) => prev + 1);
    }

    // Coordinates simulation based on stage
    const lat =
      step === 'arrived_pickup' || step === 'picked_up'
        ? trip.pickupLat
        : step === 'arrived_dropoff' || step === 'completed'
        ? trip.dropoffLat
        : trip.pickupLat - 0.005;
    const lng =
      step === 'arrived_pickup' || step === 'picked_up'
        ? trip.pickupLng
        : step === 'arrived_dropoff' || step === 'completed'
        ? trip.dropoffLng
        : trip.pickupLng + 0.004;

    const eventType =
      step === 'started'
        ? 'started'
        : step === 'arrived_pickup'
        ? 'arrived_pickup'
        : step === 'picked_up'
        ? 'picked_up'
        : step === 'arrived_dropoff'
        ? 'arrived_dropoff'
        : 'completed';

    const newStatus =
      step === 'started'
        ? 'en_route_pickup'
        : step === 'arrived_pickup'
        ? 'arrived_pickup'
        : step === 'picked_up'
        ? 'passenger_onboard'
        : step === 'arrived_dropoff'
        ? 'arrived_destination'
        : 'completed';

    const timestamp = new Date().toISOString();

    setTrips((prev) =>
      prev.map((t) => {
        if (t.id === tripId) {
          const events: TripEvent[] = [
            ...t.events,
            {
              id: 'ev-' + Date.now(),
              tripId: t.id,
              type: eventType,
              timestamp,
              lat,
              lng,
              recordedByUserId: t.driverId || 'drv-1',
              recordedByName: t.driverName || 'Driver',
              note: `EVV GPS point logged (${lat.toFixed(4)}, ${lng.toFixed(4)}).`
            }
          ];

          const isComplete = step === 'completed';
          return {
            ...t,
            status: newStatus,
            verification: {
              ...t.verification,
              exactTimes: isComplete ? true : t.verification.exactTimes,
              locations: isComplete ? true : t.verification.locations
            },
            events
          };
        }
        return t;
      })
    );

    // Update driver status in drivers list
    if (trip.driverId) {
      setDrivers((prev) =>
        prev.map((d) => {
          if (d.id === trip.driverId) {
            return {
              ...d,
              status: step === 'completed' ? 'idle' : 'on_trip',
              currentTripId: step === 'completed' ? undefined : tripId
            };
          }
          return d;
        })
      );
    }

    addToast({
      type: 'success',
      title: `GPS Event Logged: ${step.replace('_', ' ').toUpperCase()}`,
      message: `Recorded at ${new Date().toLocaleTimeString()} · Lat ${lat.toFixed(4)}, Lng ${lng.toFixed(4)}`
    });
  };

  const saveSignature = (tripId: string, sigData: SignatureData) => {
    setTrips((prev) =>
      prev.map((t) => {
        if (t.id === tripId) {
          return {
            ...t,
            signature: sigData,
            verification: {
              ...t.verification,
              signature: true
            }
          };
        }
        return t;
      })
    );

    addAuditLog(
      'edit_trip',
      'trip',
      tripId,
      `Trip ${tripId}`,
      sigData.unableToSign
        ? `Documented inability to sign: ${sigData.unableToSignReason}.`
        : `Captured electronic signature from ${sigData.signedBy}.`
    );

    addToast({
      type: 'success',
      title: 'Verification Complete',
      message: sigData.unableToSign
        ? 'Waiver exception reason verified.'
        : `Electronic signature captured for ${sigData.signedBy}.`
    });
  };

  const fixTripVerification = (tripId: string, updates: Partial<Trip>, auditReason: string) => {
    setTrips((prev) =>
      prev.map((t) => {
        if (t.id === tripId) {
          const updatedVerification = {
            ...t.verification,
            ...(updates.verification || {}),
            locations: true,
            exactTimes: true,
            authorization: true,
            signature: true
          };

          const newAuditNotes = [
            ...(t.auditNotes || []),
            {
              id: 'an-' + Date.now(),
              timestamp: new Date().toISOString(),
              userId: `usr-${currentRole}`,
              userName: currentRole === 'owner_admin' ? 'Sarah Chen (Owner)' : 'Linda Kowalski (Billing)',
              fieldChanged: 'Verification exception resolved',
              oldValue: 'Incomplete / Missing EVV detail',
              newValue: 'Verified clean',
              reason: auditReason
            }
          ];

          return {
            ...t,
            ...updates,
            status: t.status === 'needs_fixing' ? 'completed' : t.status,
            billingStatus: 'ready_to_bill',
            verification: updatedVerification,
            auditNotes: newAuditNotes
          };
        }
        return t;
      })
    );

    addAuditLog(
      'override_verification',
      'trip',
      tripId,
      `Trip ${tripId}`,
      `Manual correction applied to trip verification data.`,
      auditReason
    );

    addToast({
      type: 'success',
      title: 'Trip Cleaned & Ready to Bill',
      message: `Exception resolved. Audit trail entry created with justification.`
    });
  };

  const resubmitDeniedTrip = (tripId: string, fixDetails: string, auditReason: string) => {
    setTrips((prev) =>
      prev.map((t) => {
        if (t.id === tripId) {
          return {
            ...t,
            billingStatus: 'ready_to_bill',
            denialReason: undefined,
            denialCode: undefined,
            notes: (t.notes ? t.notes + '\n' : '') + `[Resubmission Fix] ${fixDetails}`
          };
        }
        return t;
      })
    );

    addAuditLog('fix_claim', 'claim', tripId, `Trip ${tripId}`, `Resolved denial: ${fixDetails}`, auditReason);
    addToast({
      type: 'success',
      title: 'Claim Corrected',
      message: 'Trip moved to "Ready to Bill" queue for the next batch export.'
    });
  };

  const createClaimBatch = (payerId: string, tripIds: string[]): ClaimBatch => {
    const payer = payers.find((p) => p.id === payerId) || payers[0];
    const selectedTrips = trips.filter((t) => tripIds.includes(t.id));
    const totalAmount = Number(selectedTrips.reduce((sum, t) => sum + t.fare.total, 0).toFixed(2));
    const batchNum = `BATCH-2026-${(claimBatches.length + 10).toString().padStart(3, '0')}`;

    const newBatch: ClaimBatch = {
      id: 'batch-' + Date.now(),
      batchNumber: batchNum,
      createdAt: new Date().toISOString(),
      payerId: payer.id,
      payerName: payer.name,
      tripIds,
      totalAmount,
      status: 'submitted',
      exportedAt: new Date().toISOString()
    };

    setClaimBatches((prev) => [newBatch, ...prev]);

    setTrips((prev) =>
      prev.map((t) => {
        if (tripIds.includes(t.id)) {
          return {
            ...t,
            billingStatus: 'submitted',
            batchId: newBatch.id
          };
        }
        return t;
      })
    );

    addAuditLog(
      'create_batch',
      'claim',
      newBatch.id,
      newBatch.batchNumber,
      `Created batch of ${tripIds.length} clean trips totaling $${totalAmount.toFixed(2)} for ${payer.name}.`
    );

    addToast({
      type: 'success',
      title: 'Claim Batch Generated',
      message: `${batchNum} created with ${tripIds.length} trips ($${totalAmount.toFixed(2)}). Ready for download.`
    });

    return newBatch;
  };

  const addRider = (newRiderData: Partial<Rider>) => {
    const count = riders.length + 1;
    const newRider: Rider = {
      id: 'rdr-' + Date.now(),
      name: newRiderData.name || 'New Rider',
      phone: newRiderData.phone || '(614) 555-0000',
      medicaidId: newRiderData.medicaidId || `OH-${Math.floor(10000000 + Math.random() * 90000000)}`,
      dateOfBirth: newRiderData.dateOfBirth || '1960-01-01',
      homeAddress: newRiderData.homeAddress || '123 Main St, Columbus, OH',
      homeLat: 39.9612,
      homeLng: -82.9988,
      defaultDropoffAddress: newRiderData.defaultDropoffAddress || 'Ohio State Outpatient Care',
      mobilityType: newRiderData.mobilityType || 'walking',
      escortRequired: !!newRiderData.escortRequired,
      physicianCertOnFile: !!newRiderData.physicianCertOnFile,
      physicianCertExpiry: newRiderData.physicianCertExpiry,
      specialNotes: newRiderData.specialNotes,
      preferredPayerId: newRiderData.preferredPayerId || payers[0].id
    };

    setRiders((prev) => [newRider, ...prev]);
    addAuditLog('edit_trip', 'rider', newRider.id, newRider.name, 'Enrolled new rider into system.');
    addToast({
      type: 'success',
      title: 'Rider Added',
      message: `${newRider.name} is now active for scheduling.`
    });
  };

  const renewDriverCredential = (driverId: string, credentialId: string, newExpiry: string) => {
    setDrivers((prev) =>
      prev.map((d) => {
        if (d.id === driverId) {
          const updatedCreds = d.credentials.map((c) => {
            if (c.id === credentialId) {
              return {
                ...c,
                expiryDate: newExpiry,
                status: 'valid' as const,
                lastVerified: new Date().toISOString().split('T')[0]
              };
            }
            return c;
          });
          return { ...d, credentials: updatedCreds };
        }
        return d;
      })
    );

    const driver = drivers.find((d) => d.id === driverId);
    addAuditLog('credential_upload', 'driver', driverId, driver?.name || 'Driver', `Renewed credential expiry to ${newExpiry}.`);
    addToast({
      type: 'success',
      title: 'Credential Verified & Saved',
      message: `Document renewed until ${newExpiry}. Status updated to Valid.`
    });
  };

  const renewVehicleCredential = (vehicleId: string, credType: string, newExpiry: string) => {
    setVehicles((prev) =>
      prev.map((v) => {
        if (v.id === vehicleId) {
          const updatedCreds = v.credentials.map((c) => {
            if (c.type === credType) {
              return {
                ...c,
                expiryDate: newExpiry,
                status: 'valid' as const
              };
            }
            return c;
          });
          const isGrounded = updatedCreds.some((c) => c.status === 'expired');
          return {
            ...v,
            status: isGrounded ? 'grounded' : 'active',
            credentials: updatedCreds
          };
        }
        return v;
      })
    );

    const veh = vehicles.find((v) => v.id === vehicleId);
    addAuditLog('credential_upload', 'vehicle', vehicleId, veh?.name || 'Vehicle', `Renewed inspection/certification to ${newExpiry}.`);
    addToast({
      type: 'success',
      title: 'Vehicle Inspection Recorded',
      message: `${veh?.name} document renewed. Dispatches unblocked.`
    });
  };

  const toggleOnboardingStep = (stepId: string) => {
    setOnboardingSteps((prev) =>
      prev.map((step) => {
        if (step.id === stepId) {
          return { ...step, completed: !step.completed };
        }
        return step;
      })
    );
  };

  return (
    <AppContext.Provider
      value={{
        currentRole,
        setCurrentRole,
        activeScreen,
        setActiveScreen,
        activeDriverId,
        setActiveDriverId,
        trips,
        drivers,
        vehicles,
        riders,
        payers,
        claimBatches,
        auditLogs,
        stateRules,
        selectedStateCode,
        setSelectedStateCode,
        onboardingSteps,
        revealedPhiKeys,
        revealPhi,
        addTrip,
        updateTrip,
        assignTrip,
        recordDriverStep,
        saveSignature,
        fixTripVerification,
        resubmitDeniedTrip,
        createClaimBatch,
        addRider,
        renewDriverCredential,
        renewVehicleCredential,
        toggleOnboardingStep,
        isOfflineMode,
        toggleOfflineMode,
        queuedSyncCount,
        toasts,
        addToast,
        dismissToast,
        selectedTripForDetail,
        setSelectedTripForDetail
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
