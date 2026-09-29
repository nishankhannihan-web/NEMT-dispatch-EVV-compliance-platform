export type Role = 'owner_admin' | 'dispatcher' | 'driver' | 'billing';

export type MobilityType = 'walking' | 'wheelchair' | 'stretcher';

export type TripStatus =
  | 'scheduled'
  | 'assigned'
  | 'en_route_pickup'
  | 'arrived_pickup'
  | 'passenger_onboard'
  | 'arrived_destination'
  | 'completed'
  | 'cancelled'
  | 'needs_fixing';

export type BillingStatus =
  | 'needs_fixing'
  | 'ready_to_bill'
  | 'batched'
  | 'submitted'
  | 'paid'
  | 'denied';

export type DriverStatus = 'on_trip' | 'idle' | 'offline';

export type VehicleType = 'sedan' | 'ambulatory_van' | 'wheelchair_van' | 'stretcher_van';

export interface EVVVerification {
  serviceType: boolean;      // e.g., T2003 / Non-emergency transportation
  riderIdentity: boolean;    // Name + verified Medicaid ID
  serviceDate: boolean;      // Date of transport verified
  locations: boolean;        // GPS verified pickup and drop-off
  driverIdentity: boolean;   // Active driver assigned with valid credentials
  exactTimes: boolean;       // Both pickup and dropoff recorded with GPS
  authorization: boolean;    // Prior auth or broker job reference present
  signature: boolean;        // Rider signature captured or compliant waiver reason
}

export interface TripEvent {
  id: string;
  tripId: string;
  type: 'created' | 'assigned' | 'started' | 'arrived_pickup' | 'picked_up' | 'arrived_dropoff' | 'completed' | 'fixed';
  timestamp: string; // ISO string
  lat?: number;
  lng?: number;
  recordedByUserId: string;
  recordedByName: string;
  note?: string;
}

export interface SignatureData {
  signedBy: string; // rider or representative
  signatureUrl?: string;
  timestamp: string;
  unableToSign: boolean;
  unableToSignReason?: 'physical_impairment' | 'cognitive_impairment' | 'medical_emergency' | 'facility_staff_signed' | 'refusal';
}

export interface AuditNote {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  fieldChanged: string;
  oldValue: string;
  newValue: string;
  reason: string;
}

export interface Trip {
  id: string;
  tripNumber: string; // e.g. "TP-2026-0842"
  riderId: string;
  riderName: string;
  riderPhone: string;
  riderMedicaidId: string;
  driverId?: string;
  driverName?: string;
  vehicleId?: string;
  vehicleName?: string;
  payerId: string;
  payerName: string;
  authorizationNumber: string;
  date: string; // YYYY-MM-DD
  scheduledPickupTime: string; // HH:MM
  appointmentTime: string; // HH:MM
  pickupAddress: string;
  pickupLat: number;
  pickupLng: number;
  dropoffAddress: string;
  dropoffLat: number;
  dropoffLng: number;
  mobilityType: MobilityType;
  escortRequired: boolean;
  isRecurring?: boolean;
  recurringDays?: string[]; // e.g. ["Mon", "Wed", "Fri"]
  notes?: string;
  status: TripStatus;
  billingStatus: BillingStatus;
  denialReason?: string;
  denialCode?: string;
  
  // Financials
  estimatedMiles: number;
  fare: {
    baseRate: number;
    mileageRate: number;
    surcharges: number;
    total: number;
  };

  // EVV verification state
  verification: EVVVerification;
  events: TripEvent[];
  signature?: SignatureData;
  auditNotes?: AuditNote[];
  batchId?: string;
}

export type CredentialType =
  | 'drivers_license'
  | 'background_check'
  | 'drug_test'
  | 'cpr_first_aid'
  | 'defensive_driving'
  | 'passenger_assistance'
  | 'monthly_exclusion_check';

export interface CredentialItem {
  id: string;
  name: string;
  type: CredentialType;
  expiryDate: string; // YYYY-MM-DD
  status: 'valid' | 'expiring_soon' | 'expired'; // >60 green, 15-60 amber, <15 or past red
  documentNumber?: string;
  fileRef?: string;
  lastVerified: string;
}

export interface Driver {
  id: string;
  name: string;
  phone: string;
  email: string;
  photoUrl: string;
  status: DriverStatus;
  currentTripId?: string;
  assignedVehicleId?: string;
  credentials: CredentialItem[];
}

export type VehicleDocType = 'insurance' | 'inspection' | 'registration' | 'wheelchair_lift_check';

export interface VehicleCredential {
  type: VehicleDocType;
  name: string;
  expiryDate: string;
  status: 'valid' | 'expiring_soon' | 'expired';
}

export interface Vehicle {
  id: string;
  name: string;
  plateNumber: string;
  vin: string;
  type: VehicleType;
  maxWheelchairs: number;
  maxAmbulatory: number;
  status: 'active' | 'in_maintenance' | 'grounded';
  currentDriverId?: string;
  credentials: VehicleCredential[];
}

export interface Rider {
  id: string;
  name: string;
  phone: string;
  medicaidId: string;
  dateOfBirth: string;
  homeAddress: string;
  homeLat: number;
  homeLng: number;
  defaultDropoffAddress: string;
  mobilityType: MobilityType;
  escortRequired: boolean;
  physicianCertOnFile: boolean;
  physicianCertExpiry?: string;
  specialNotes?: string;
  preferredDriverId?: string;
  preferredPayerId: string;
}

export interface Payer {
  id: string;
  name: string;
  shortCode: string;
  contactPhone: string;
  portalUrl?: string;
  billingNpi: string;
  baseRateWalking: number;
  baseRateWheelchair: number;
  baseRateStretcher: number;
  perMileRate: number;
  wheelchairSurcharge: number;
  stretcherSurcharge: number;
  waitRatePerHour: number;
  requiresPriorAuth: boolean;
  requiresSignature: boolean;
}

export interface ClaimBatch {
  id: string;
  batchNumber: string;
  createdAt: string;
  payerId: string;
  payerName: string;
  tripIds: string[];
  totalAmount: number;
  status: 'draft' | 'submitted' | 'paid';
  exportedAt?: string;
}

export interface AuditLogItem {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: Role;
  action: 'view_phi' | 'edit_trip' | 'assign_trip' | 'override_verification' | 'create_batch' | 'fix_claim' | 'credential_upload';
  entityType: 'trip' | 'rider' | 'driver' | 'vehicle' | 'claim';
  entityId: string;
  entityName: string;
  details: string;
  reason?: string;
}

export interface StateRule {
  stateCode: string;
  stateName: string;
  brokerSystem: string;
  evvMandated: boolean;
  toleranceMinutes: number;
  requiredFields: string[];
  notes: string;
}

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  actionLabel: string;
  routeTo: string;
}
