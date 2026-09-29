import {
  Driver,
  Vehicle,
  Rider,
  Payer,
  Trip,
  ClaimBatch,
  AuditLogItem,
  StateRule,
  OnboardingStep
} from '../types';

export const INITIAL_STATE_RULES: StateRule[] = [
  {
    stateCode: 'OH',
    stateName: 'Ohio',
    brokerSystem: 'Sandata / Ohio Department of Medicaid (ODM)',
    evvMandated: true,
    toleranceMinutes: 15,
    requiredFields: [
      'Service Type (T2003 / A0130)',
      'Individual Receiving Service (Medicaid ID)',
      'Service Date',
      'Location of Service Delivery (GPS Geocode at Pickup & Dropoff)',
      'Individual Providing Service (Driver NPI/Tax ID)',
      'Time Service Begins & Ends (GPS Time Stamp)',
      'Signed Service Verification or Documented Exception Code'
    ],
    notes: 'Ohio EVV mandates strict GPS capture within 500ft of facility. Missing drop-off timestamps cause 100% automated claim rejection.'
  },
  {
    stateCode: 'FL',
    stateName: 'Florida',
    brokerSystem: 'AHCA / Modivcare & Access2Care',
    evvMandated: true,
    toleranceMinutes: 20,
    requiredFields: [
      'Broker Authorization Number',
      'Rider Medicaid ID',
      'Vehicle VIN & Plate Verification',
      'Exact Odometer Start/End or Certified Mileage',
      'Electronic Rider Signature or Representative Signoff'
    ],
    notes: 'Prior authorization is mandatory before trip start. Surcharges for wheelchair lifts require certified vehicle upload.'
  },
  {
    stateCode: 'NY',
    stateName: 'New York',
    brokerSystem: 'eMedNY / Medical Answering Services (MAS)',
    evvMandated: true,
    toleranceMinutes: 10,
    requiredFields: [
      'MAS Trip Confirmation Number',
      'Driver TLC / License Expiry Check',
      'Facility Sign-In Log or Electronic Signature',
      'Exact Pickup & Drop-Off Timestamps'
    ],
    notes: 'Strict 10-minute window for on-time arrival. Dialysis recurring authorizations must be re-verified monthly.'
  },
  {
    stateCode: 'TX',
    stateName: 'Texas',
    brokerSystem: 'Texas Medicaid & Healthcare Partnership (TMHP)',
    evvMandated: true,
    toleranceMinutes: 15,
    requiredFields: [
      'TMHP EVV Aggregator ID',
      'Driver Member ID',
      'GPS Lat/Long at Boarding & Alighting',
      'Service Authorization Code'
    ],
    notes: 'Alternative device entry allowed only if mobile app loses cellular connectivity during transit.'
  },
  {
    stateCode: 'GA',
    stateName: 'Georgia',
    brokerSystem: 'GAMMIS / Southeastrans & Verida',
    evvMandated: true,
    toleranceMinutes: 15,
    requiredFields: [
      'Level of Need (Ambulatory vs Wheelchair Certificate)',
      'Origin and Destination Geocoordinates',
      'Driver Attestation'
    ],
    notes: 'Wheelchair trips require physician certificate of medical necessity within the last 12 months.'
  }
];

export const INITIAL_PAYERS: Payer[] = [
  {
    id: 'pyr-1',
    name: 'Buckeye Community Health (Ohio Medicaid MCO)',
    shortCode: 'BUCKEYE',
    contactPhone: '(866) 246-4358',
    portalUrl: 'https://provider.buckeyehealthplan.com',
    billingNpi: '1942859102',
    baseRateWalking: 24.50,
    baseRateWheelchair: 42.00,
    baseRateStretcher: 95.00,
    perMileRate: 2.85,
    wheelchairSurcharge: 18.00,
    stretcherSurcharge: 45.00,
    waitRatePerHour: 22.00,
    requiresPriorAuth: true,
    requiresSignature: true
  },
  {
    id: 'pyr-2',
    name: 'CareSource NEMT Transportation',
    shortCode: 'CARESOURCE',
    contactPhone: '(800) 488-0134',
    portalUrl: 'https://transport.caresource.com',
    billingNpi: '1487295101',
    baseRateWalking: 26.00,
    baseRateWheelchair: 45.00,
    baseRateStretcher: 100.00,
    perMileRate: 3.10,
    wheelchairSurcharge: 20.00,
    stretcherSurcharge: 50.00,
    waitRatePerHour: 25.00,
    requiresPriorAuth: true,
    requiresSignature: true
  },
  {
    id: 'pyr-3',
    name: 'UnitedHealthcare Community Plan OH',
    shortCode: 'UHC-COMM',
    contactPhone: '(877) 542-9236',
    portalUrl: 'https://uhcprovider.com/nemt',
    billingNpi: '1093847291',
    baseRateWalking: 22.00,
    baseRateWheelchair: 40.00,
    baseRateStretcher: 90.00,
    perMileRate: 2.75,
    wheelchairSurcharge: 15.00,
    stretcherSurcharge: 40.00,
    waitRatePerHour: 20.00,
    requiresPriorAuth: false,
    requiresSignature: true
  }
];

export const INITIAL_VEHICLES: Vehicle[] = [
  {
    id: 'veh-101',
    name: 'Van #101 (Ford Transit High Roof)',
    plateNumber: 'OH-MED-101',
    vin: '1FTBR1Y85KKA19284',
    type: 'wheelchair_van',
    maxWheelchairs: 2,
    maxAmbulatory: 4,
    status: 'active',
    currentDriverId: 'drv-1',
    credentials: [
      { type: 'insurance', name: 'Commercial Auto Liability', expiryDate: '2027-02-15', status: 'valid' },
      { type: 'inspection', name: 'Annual State Safety Inspection', expiryDate: '2026-12-10', status: 'valid' },
      { type: 'registration', name: 'BMV Commercial Plate Reg', expiryDate: '2027-04-01', status: 'valid' },
      { type: 'wheelchair_lift_check', name: 'BraunAbility Hydraulic Lift Certified', expiryDate: '2026-11-20', status: 'valid' }
    ]
  },
  {
    id: 'veh-102',
    name: 'Van #102 (Dodge Grand Caravan Side-Entry)',
    plateNumber: 'OH-MED-102',
    vin: '2C4RDGBG9KR720194',
    type: 'wheelchair_van',
    maxWheelchairs: 1,
    maxAmbulatory: 3,
    status: 'active',
    currentDriverId: 'drv-2',
    credentials: [
      { type: 'insurance', name: 'Commercial Auto Liability', expiryDate: '2027-02-15', status: 'valid' },
      { type: 'inspection', name: 'Annual State Safety Inspection', expiryDate: '2026-10-18', status: 'expiring_soon' }, // 20 days away
      { type: 'registration', name: 'BMV Commercial Plate Reg', expiryDate: '2027-04-01', status: 'valid' },
      { type: 'wheelchair_lift_check', name: 'Ramp Deployment & Interlock', expiryDate: '2027-01-14', status: 'valid' }
    ]
  },
  {
    id: 'veh-103',
    name: 'Van #103 (Toyota Sienna BraunAbility)',
    plateNumber: 'OH-MED-103',
    vin: '5TDZK3DC8LS391048',
    type: 'wheelchair_van',
    maxWheelchairs: 1,
    maxAmbulatory: 3,
    status: 'grounded', // HARD BLOCK example: expired lift inspection!
    credentials: [
      { type: 'insurance', name: 'Commercial Auto Liability', expiryDate: '2027-02-15', status: 'valid' },
      { type: 'inspection', name: 'Annual State Safety Inspection', expiryDate: '2027-03-22', status: 'valid' },
      { type: 'registration', name: 'BMV Commercial Plate Reg', expiryDate: '2027-04-01', status: 'valid' },
      { type: 'wheelchair_lift_check', name: 'Hydraulic Lift Safety Cert', expiryDate: '2026-09-15', status: 'expired' } // Expired 13 days ago!
    ]
  },
  {
    id: 'veh-201',
    name: 'Sedan #201 (Chevy Malibu Hybrid)',
    plateNumber: 'OH-MED-201',
    vin: '1G1ZD5ST8LF102948',
    type: 'sedan',
    maxWheelchairs: 0,
    maxAmbulatory: 4,
    status: 'active',
    currentDriverId: 'drv-3',
    credentials: [
      { type: 'insurance', name: 'Commercial Auto Liability', expiryDate: '2027-02-15', status: 'valid' },
      { type: 'inspection', name: 'Annual State Safety Inspection', expiryDate: '2027-01-30', status: 'valid' },
      { type: 'registration', name: 'BMV Commercial Plate Reg', expiryDate: '2027-04-01', status: 'valid' }
    ]
  },
  {
    id: 'veh-202',
    name: 'Van #202 (Ford Transit Passenger)',
    plateNumber: 'OH-MED-202',
    vin: '1FTBR2Y89LKB28193',
    type: 'ambulatory_van',
    maxWheelchairs: 0,
    maxAmbulatory: 7,
    status: 'active',
    credentials: [
      { type: 'insurance', name: 'Commercial Auto Liability', expiryDate: '2027-02-15', status: 'valid' },
      { type: 'inspection', name: 'Annual State Safety Inspection', expiryDate: '2026-12-05', status: 'valid' },
      { type: 'registration', name: 'BMV Commercial Plate Reg', expiryDate: '2027-04-01', status: 'valid' }
    ]
  },
  {
    id: 'veh-301',
    name: 'Special #301 (Ram ProMaster Stretcher/Gurney)',
    plateNumber: 'OH-MED-301',
    vin: '3C6TRVDG2LE192847',
    type: 'stretcher_van',
    maxWheelchairs: 1,
    maxAmbulatory: 2,
    status: 'active',
    credentials: [
      { type: 'insurance', name: 'Commercial Auto Liability', expiryDate: '2027-02-15', status: 'valid' },
      { type: 'inspection', name: 'Annual State Safety Inspection', expiryDate: '2027-05-18', status: 'valid' },
      { type: 'registration', name: 'BMV Commercial Plate Reg', expiryDate: '2027-04-01', status: 'valid' },
      { type: 'wheelchair_lift_check', name: 'Ferno Stryker Cot Fastener Certification', expiryDate: '2027-02-10', status: 'valid' }
    ]
  }
];

export const INITIAL_DRIVERS: Driver[] = [
  {
    id: 'drv-1',
    name: 'Marcus Vance',
    phone: '(614) 555-0182',
    email: 'm.vance@tripprooftransport.com',
    photoUrl: '',
    status: 'on_trip',
    currentTripId: 'trip-101',
    assignedVehicleId: 'veh-101',
    credentials: [
      { id: 'c-1', name: "Driver's License (Class D + Chauffeur)", type: 'drivers_license', expiryDate: '2027-08-14', status: 'valid', lastVerified: '2026-08-14' },
      { id: 'c-2', name: 'BCI & FBI Criminal Background Check', type: 'background_check', expiryDate: '2027-05-10', status: 'valid', lastVerified: '2026-05-10' },
      { id: 'c-3', name: '10-Panel Non-DOT Drug Screen', type: 'drug_test', expiryDate: '2027-06-20', status: 'valid', lastVerified: '2026-06-20' },
      { id: 'c-4', name: 'American Red Cross CPR / Basic First Aid', type: 'cpr_first_aid', expiryDate: '2027-01-15', status: 'valid', lastVerified: '2025-01-15' },
      { id: 'c-5', name: 'NSC Defensive Driving 4-Hour Course', type: 'defensive_driving', expiryDate: '2027-09-02', status: 'valid', lastVerified: '2025-09-02' },
      { id: 'c-6', name: 'PASS (Passenger Assistance Safety & Securement)', type: 'passenger_assistance', expiryDate: '2027-03-12', status: 'valid', lastVerified: '2025-03-12' },
      { id: 'c-7', name: 'OIG/SAM Monthly Medicaid Exclusion Screening', type: 'monthly_exclusion_check', expiryDate: '2026-10-01', status: 'valid', lastVerified: '2026-09-01' }
    ]
  },
  {
    id: 'drv-2',
    name: 'Clara Hernandez',
    phone: '(614) 555-0193',
    email: 'c.hernandez@tripprooftransport.com',
    photoUrl: '',
    status: 'on_trip',
    currentTripId: 'trip-102',
    assignedVehicleId: 'veh-102',
    credentials: [
      { id: 'c-8', name: "Driver's License (Class D)", type: 'drivers_license', expiryDate: '2027-04-19', status: 'valid', lastVerified: '2026-04-19' },
      { id: 'c-9', name: 'BCI & FBI Criminal Background Check', type: 'background_check', expiryDate: '2027-03-22', status: 'valid', lastVerified: '2026-03-22' },
      { id: 'c-10', name: '10-Panel Non-DOT Drug Screen', type: 'drug_test', expiryDate: '2027-04-10', status: 'valid', lastVerified: '2026-04-10' },
      { id: 'c-11', name: 'CPR / First Aid Certification', type: 'cpr_first_aid', expiryDate: '2026-10-05', status: 'expiring_soon', lastVerified: '2024-10-05' }, // 7 days remaining!
      { id: 'c-12', name: 'NSC Defensive Driving', type: 'defensive_driving', expiryDate: '2026-12-14', status: 'valid', lastVerified: '2024-12-14' },
      { id: 'c-13', name: 'PASS Wheelchair Securement', type: 'passenger_assistance', expiryDate: '2027-02-18', status: 'valid', lastVerified: '2025-02-18' },
      { id: 'c-14', name: 'OIG Exclusion Check', type: 'monthly_exclusion_check', expiryDate: '2026-10-01', status: 'valid', lastVerified: '2026-09-01' }
    ]
  },
  {
    id: 'drv-3',
    name: 'Terrence Washington',
    phone: '(614) 555-0245',
    email: 't.washington@tripprooftransport.com',
    photoUrl: '',
    status: 'idle',
    assignedVehicleId: 'veh-201',
    credentials: [
      { id: 'c-15', name: "Driver's License", type: 'drivers_license', expiryDate: '2027-11-30', status: 'valid', lastVerified: '2026-02-10' },
      { id: 'c-16', name: 'Background Check', type: 'background_check', expiryDate: '2027-08-15', status: 'valid', lastVerified: '2026-08-15' },
      { id: 'c-17', name: 'Drug Screen', type: 'drug_test', expiryDate: '2027-07-01', status: 'valid', lastVerified: '2026-07-01' },
      { id: 'c-18', name: 'CPR / First Aid', type: 'cpr_first_aid', expiryDate: '2027-02-28', status: 'valid', lastVerified: '2025-02-28' },
      { id: 'c-19', name: 'Defensive Driving', type: 'defensive_driving', expiryDate: '2027-01-20', status: 'valid', lastVerified: '2025-01-20' },
      { id: 'c-20', name: 'Passenger Assistance', type: 'passenger_assistance', expiryDate: '2027-04-15', status: 'valid', lastVerified: '2025-04-15' },
      { id: 'c-21', name: 'OIG Exclusion', type: 'monthly_exclusion_check', expiryDate: '2026-10-01', status: 'valid', lastVerified: '2026-09-01' }
    ]
  },
  {
    id: 'drv-4',
    name: 'Dwayne Miller',
    phone: '(614) 555-0371',
    email: 'd.miller@tripprooftransport.com',
    photoUrl: '',
    status: 'offline', // HARD BLOCK example: expired background check!
    credentials: [
      { id: 'c-22', name: "Driver's License", type: 'drivers_license', expiryDate: '2027-05-12', status: 'valid', lastVerified: '2026-05-12' },
      { id: 'c-23', name: 'BCI & FBI Criminal Background Check', type: 'background_check', expiryDate: '2026-09-20', status: 'expired', lastVerified: '2025-09-20' }, // Expired 8 days ago!
      { id: 'c-24', name: '10-Panel Drug Screen', type: 'drug_test', expiryDate: '2027-01-10', status: 'valid', lastVerified: '2026-01-10' },
      { id: 'c-25', name: 'CPR / First Aid', type: 'cpr_first_aid', expiryDate: '2026-11-15', status: 'expiring_soon', lastVerified: '2024-11-15' },
      { id: 'c-26', name: 'Defensive Driving', type: 'defensive_driving', expiryDate: '2027-03-01', status: 'valid', lastVerified: '2025-03-01' },
      { id: 'c-27', name: 'Passenger Assistance', type: 'passenger_assistance', expiryDate: '2027-06-18', status: 'valid', lastVerified: '2025-06-18' },
      { id: 'c-28', name: 'OIG Monthly Check', type: 'monthly_exclusion_check', expiryDate: '2026-10-01', status: 'valid', lastVerified: '2026-09-01' }
    ]
  },
  {
    id: 'drv-5',
    name: 'Sarah Jenkins',
    phone: '(614) 555-0489',
    email: 's.jenkins@tripprooftransport.com',
    photoUrl: '',
    status: 'idle',
    assignedVehicleId: 'veh-202',
    credentials: [
      { id: 'c-29', name: "Driver's License", type: 'drivers_license', expiryDate: '2027-09-18', status: 'valid', lastVerified: '2026-09-01' },
      { id: 'c-30', name: 'Background Check', type: 'background_check', expiryDate: '2027-06-14', status: 'valid', lastVerified: '2026-06-14' },
      { id: 'c-31', name: 'Drug Screen', type: 'drug_test', expiryDate: '2027-05-20', status: 'valid', lastVerified: '2026-05-20' },
      { id: 'c-32', name: 'CPR / First Aid', type: 'cpr_first_aid', expiryDate: '2027-04-10', status: 'valid', lastVerified: '2025-04-10' },
      { id: 'c-33', name: 'Defensive Driving', type: 'defensive_driving', expiryDate: '2027-03-25', status: 'valid', lastVerified: '2025-03-25' },
      { id: 'c-34', name: 'PASS Certification', type: 'passenger_assistance', expiryDate: '2027-08-01', status: 'valid', lastVerified: '2025-08-01' },
      { id: 'c-35', name: 'OIG Monthly Check', type: 'monthly_exclusion_check', expiryDate: '2026-10-01', status: 'valid', lastVerified: '2026-09-01' }
    ]
  },
  {
    id: 'drv-6',
    name: 'Roberto Gomez',
    phone: '(614) 555-0512',
    email: 'r.gomez@tripprooftransport.com',
    photoUrl: '',
    status: 'on_trip',
    currentTripId: 'trip-103',
    assignedVehicleId: 'veh-301',
    credentials: [
      { id: 'c-36', name: "Driver's License", type: 'drivers_license', expiryDate: '2027-10-04', status: 'valid', lastVerified: '2026-02-12' },
      { id: 'c-37', name: 'Background Check', type: 'background_check', expiryDate: '2027-07-29', status: 'valid', lastVerified: '2026-07-29' },
      { id: 'c-38', name: 'Drug Screen', type: 'drug_test', expiryDate: '2027-08-14', status: 'valid', lastVerified: '2026-08-14' },
      { id: 'c-39', name: 'CPR / First Aid', type: 'cpr_first_aid', expiryDate: '2027-01-20', status: 'valid', lastVerified: '2025-01-20' },
      { id: 'c-40', name: 'Defensive Driving', type: 'defensive_driving', expiryDate: '2027-05-18', status: 'valid', lastVerified: '2025-05-18' },
      { id: 'c-41', name: 'Stretcher / Cot Transfer Cert', type: 'passenger_assistance', expiryDate: '2027-06-30', status: 'valid', lastVerified: '2025-06-30' },
      { id: 'c-42', name: 'OIG Monthly Check', type: 'monthly_exclusion_check', expiryDate: '2026-10-01', status: 'valid', lastVerified: '2026-09-01' }
    ]
  },
  {
    id: 'drv-7',
    name: 'Aaliyah Woods',
    phone: '(614) 555-0639',
    email: 'a.woods@tripprooftransport.com',
    photoUrl: '',
    status: 'idle',
    credentials: [
      { id: 'c-43', name: "Driver's License", type: 'drivers_license', expiryDate: '2027-07-22', status: 'valid', lastVerified: '2026-07-22' },
      { id: 'c-44', name: 'Background Check', type: 'background_check', expiryDate: '2027-09-10', status: 'valid', lastVerified: '2026-09-10' },
      { id: 'c-45', name: 'Drug Screen', type: 'drug_test', expiryDate: '2027-09-01', status: 'valid', lastVerified: '2026-09-01' },
      { id: 'c-46', name: 'CPR / First Aid', type: 'cpr_first_aid', expiryDate: '2027-03-15', status: 'valid', lastVerified: '2025-03-15' },
      { id: 'c-47', name: 'Defensive Driving', type: 'defensive_driving', expiryDate: '2027-04-18', status: 'valid', lastVerified: '2025-04-18' },
      { id: 'c-48', name: 'PASS Wheelchair Cert', type: 'passenger_assistance', expiryDate: '2027-02-11', status: 'valid', lastVerified: '2025-02-11' },
      { id: 'c-49', name: 'OIG Monthly Check', type: 'monthly_exclusion_check', expiryDate: '2026-10-01', status: 'valid', lastVerified: '2026-09-01' }
    ]
  },
  {
    id: 'drv-8',
    name: 'Greg Larson',
    phone: '(614) 555-0728',
    email: 'g.larson@tripprooftransport.com',
    photoUrl: '',
    status: 'offline',
    credentials: [
      { id: 'c-50', name: "Driver's License", type: 'drivers_license', expiryDate: '2027-12-05', status: 'valid', lastVerified: '2026-01-10' },
      { id: 'c-51', name: 'Background Check', type: 'background_check', expiryDate: '2027-04-19', status: 'valid', lastVerified: '2026-04-19' },
      { id: 'c-52', name: 'Drug Screen', type: 'drug_test', expiryDate: '2027-03-14', status: 'valid', lastVerified: '2026-03-14' },
      { id: 'c-53', name: 'CPR / First Aid', type: 'cpr_first_aid', expiryDate: '2026-10-18', status: 'expiring_soon', lastVerified: '2024-10-18' },
      { id: 'c-54', name: 'Defensive Driving', type: 'defensive_driving', expiryDate: '2027-01-11', status: 'valid', lastVerified: '2025-01-11' },
      { id: 'c-55', name: 'Passenger Assistance', type: 'passenger_assistance', expiryDate: '2027-05-19', status: 'valid', lastVerified: '2025-05-19' },
      { id: 'c-56', name: 'OIG Monthly Check', type: 'monthly_exclusion_check', expiryDate: '2026-10-01', status: 'valid', lastVerified: '2026-09-01' }
    ]
  }
];

export const INITIAL_RIDERS: Rider[] = [
  {
    id: 'rdr-1',
    name: 'Eleanor Vance',
    phone: '(614) 555-8291',
    medicaidId: 'OH-92841029',
    dateOfBirth: '1948-03-14',
    homeAddress: '1428 E Broad St, Columbus, OH 43205',
    homeLat: 39.9664,
    homeLng: -82.9558,
    defaultDropoffAddress: 'Ohio State Wexner Dialysis, 1492 E Broad St, Columbus, OH',
    mobilityType: 'wheelchair',
    escortRequired: false,
    physicianCertOnFile: true,
    physicianCertExpiry: '2027-04-30',
    specialNotes: 'Power wheelchair with ramp access. Door-through-door assist requested.',
    preferredDriverId: 'drv-1',
    preferredPayerId: 'pyr-1'
  },
  {
    id: 'rdr-2',
    name: 'Henry Jenkins',
    phone: '(614) 555-4819',
    medicaidId: 'OH-84729103',
    dateOfBirth: '1952-11-09',
    homeAddress: '883 S 22nd St, Columbus, OH 43206',
    homeLat: 39.9482,
    homeLng: -82.9642,
    defaultDropoffAddress: 'Grant Medical Center Cardiac Rehab, 111 S Grant Ave, Columbus, OH',
    mobilityType: 'walking',
    escortRequired: false,
    physicianCertOnFile: false,
    specialNotes: 'Uses single-point cane. Needs steady arm assist on porch steps.',
    preferredPayerId: 'pyr-2'
  },
  {
    id: 'rdr-3',
    name: 'Maria Gonzalez',
    phone: '(614) 555-3810',
    medicaidId: 'OH-73629105',
    dateOfBirth: '1961-07-23',
    homeAddress: '2410 S High St, Apt 3B, Columbus, OH 43207',
    homeLat: 39.9192,
    homeLng: -82.9975,
    defaultDropoffAddress: 'Fresenius Kidney Care South, 3600 S High St, Columbus, OH',
    mobilityType: 'wheelchair',
    escortRequired: true,
    physicianCertOnFile: true,
    physicianCertExpiry: '2027-01-15',
    specialNotes: 'Spanish speaking primary. Daughter Maria Jr. rides along as registered escort.',
    preferredPayerId: 'pyr-1'
  },
  {
    id: 'rdr-4',
    name: 'Samuel Washington',
    phone: '(614) 555-1948',
    medicaidId: 'OH-62849102',
    dateOfBirth: '1944-12-01',
    homeAddress: '3150 Cleveland Ave, Columbus, OH 43224',
    homeLat: 40.0381,
    homeLng: -82.9592,
    defaultDropoffAddress: 'Chalmers P. Wylie VA Ambulatory Care, 420 N James Rd, Columbus, OH',
    mobilityType: 'stretcher',
    escortRequired: false,
    physicianCertOnFile: true,
    physicianCertExpiry: '2026-12-31',
    specialNotes: 'Non-ambulatory, requires two-person transfer to Ferno gurney.',
    preferredPayerId: 'pyr-2'
  },
  {
    id: 'rdr-5',
    name: 'Arthur Pendelton',
    phone: '(614) 555-7391',
    medicaidId: 'OH-51928471',
    dateOfBirth: '1956-05-18',
    homeAddress: '640 S Champion Ave, Columbus, OH 43205',
    homeLat: 39.9512,
    homeLng: -82.9610,
    defaultDropoffAddress: 'OhioHealth Doctors West Hospital, 5100 W Broad St, Columbus, OH',
    mobilityType: 'wheelchair',
    escortRequired: false,
    physicianCertOnFile: true,
    physicianCertExpiry: '2027-05-10',
    specialNotes: 'Manual wheelchair folding into rear or secured on ramp. Oxygen tank in pouch.',
    preferredPayerId: 'pyr-3'
  },
  {
    id: 'rdr-6',
    name: 'Beatrice O\'Connor',
    phone: '(614) 555-9204',
    medicaidId: 'OH-40291847',
    dateOfBirth: '1939-08-30',
    homeAddress: '1120 Bryden Rd, Columbus, OH 43205',
    homeLat: 39.9598,
    homeLng: -82.9691,
    defaultDropoffAddress: 'Mount Carmel East Physical Therapy, 6001 E Broad St, Columbus, OH',
    mobilityType: 'walking',
    escortRequired: true,
    physicianCertOnFile: false,
    specialNotes: 'Walker user. Memory care resident; nurse will accompany to door.',
    preferredPayerId: 'pyr-1'
  },
  {
    id: 'rdr-7',
    name: 'James C. Miller',
    phone: '(614) 555-6621',
    medicaidId: 'OH-39182740',
    dateOfBirth: '1965-02-14',
    homeAddress: '1755 S 4th St, Columbus, OH 43207',
    homeLat: 39.9320,
    homeLng: -82.9980,
    defaultDropoffAddress: 'DaVita Capital City Dialysis, 100 E Campus View Blvd, Columbus, OH',
    mobilityType: 'wheelchair',
    escortRequired: false,
    physicianCertOnFile: true,
    physicianCertExpiry: '2027-02-28',
    specialNotes: 'Heavy bariatric wheelchair (350 lbs combined). Requires Van 101 heavy-duty lift.',
    preferredPayerId: 'pyr-1'
  },
  {
    id: 'rdr-8',
    name: 'Dorothy Campbell',
    phone: '(614) 555-3319',
    medicaidId: 'OH-28194018',
    dateOfBirth: '1950-10-12',
    homeAddress: '492 Glenwood Ave, Columbus, OH 43223',
    homeLat: 39.9540,
    homeLng: -83.0270,
    defaultDropoffAddress: 'Riverside Methodist Hospital Outpatient, 3535 Olentangy River Rd, Columbus, OH',
    mobilityType: 'walking',
    escortRequired: false,
    physicianCertOnFile: false,
    specialNotes: 'Mild vertigo, please drive smoothly on freeway ramps.',
    preferredPayerId: 'pyr-2'
  },
  {
    id: 'rdr-9',
    name: 'Walter Sterling',
    phone: '(614) 555-8822',
    medicaidId: 'OH-19482736',
    dateOfBirth: '1947-04-05',
    homeAddress: '2280 W Broad St, Columbus, OH 43223',
    homeLat: 39.9582,
    homeLng: -83.0560,
    defaultDropoffAddress: 'Wexner Medical Center Chemotherapy, 410 W 10th Ave, Columbus, OH',
    mobilityType: 'walking',
    escortRequired: false,
    physicianCertOnFile: false,
    specialNotes: 'Needs curb pickup right in front of driveway gate.',
    preferredPayerId: 'pyr-3'
  },
  {
    id: 'rdr-10',
    name: 'Gwendolyn Hayes',
    phone: '(614) 555-4491',
    medicaidId: 'OH-88371920',
    dateOfBirth: '1958-09-17',
    homeAddress: '741 E 5th Ave, Columbus, OH 43201',
    homeLat: 39.9880,
    homeLng: -82.9860,
    defaultDropoffAddress: 'Central Ohio Nephrology, 1020 Dennison Ave, Columbus, OH',
    mobilityType: 'wheelchair',
    escortRequired: false,
    physicianCertOnFile: true,
    physicianCertExpiry: '2026-11-30',
    specialNotes: 'Standard manual wheelchair. Driver must verify lock before ramp transit.',
    preferredPayerId: 'pyr-1'
  }
];

export const INITIAL_TRIPS: Trip[] = [
  // --- TODAY'S TRIPS (2026-09-28) ---
  {
    id: 'trip-101',
    tripNumber: 'TP-2026-091',
    riderId: 'rdr-1',
    riderName: 'Eleanor Vance',
    riderPhone: '(614) 555-8291',
    riderMedicaidId: 'OH-92841029',
    driverId: 'drv-1',
    driverName: 'Marcus Vance',
    vehicleId: 'veh-101',
    vehicleName: 'Van #101 (Ford Transit High Roof)',
    payerId: 'pyr-1',
    payerName: 'Buckeye Community Health',
    authorizationNumber: 'AUTH-BCH-98124',
    date: '2026-09-28',
    scheduledPickupTime: '08:15',
    appointmentTime: '09:00',
    pickupAddress: '1428 E Broad St, Columbus, OH 43205',
    pickupLat: 39.9664,
    pickupLng: -82.9558,
    dropoffAddress: 'Ohio State Wexner Dialysis, 1492 E Broad St, Columbus, OH',
    dropoffLat: 39.9670,
    dropoffLng: -82.9530,
    mobilityType: 'wheelchair',
    escortRequired: false,
    isRecurring: true,
    recurringDays: ['Mon', 'Wed', 'Fri'],
    notes: 'Dialysis appointment. In progress now - passenger onboard.',
    status: 'passenger_onboard',
    billingStatus: 'ready_to_bill',
    estimatedMiles: 1.8,
    fare: {
      baseRate: 42.00,
      mileageRate: 5.13,
      surcharges: 18.00,
      total: 65.13
    },
    verification: {
      serviceType: true,
      riderIdentity: true,
      serviceDate: true,
      locations: true,
      driverIdentity: true,
      exactTimes: true,
      authorization: true,
      signature: true
    },
    events: [
      { id: 'ev-1', tripId: 'trip-101', type: 'created', timestamp: '2026-09-27T18:00:00Z', recordedByUserId: 'usr-disp', recordedByName: 'Dispatcher Dave' },
      { id: 'ev-2', tripId: 'trip-101', type: 'assigned', timestamp: '2026-09-28T07:15:00Z', recordedByUserId: 'usr-disp', recordedByName: 'Dispatcher Dave' },
      { id: 'ev-3', tripId: 'trip-101', type: 'started', timestamp: '2026-09-28T08:00:12Z', lat: 39.9610, lng: -82.9590, recordedByUserId: 'drv-1', recordedByName: 'Marcus Vance' },
      { id: 'ev-4', tripId: 'trip-101', type: 'arrived_pickup', timestamp: '2026-09-28T08:12:44Z', lat: 39.9663, lng: -82.9559, recordedByUserId: 'drv-1', recordedByName: 'Marcus Vance' },
      { id: 'ev-5', tripId: 'trip-101', type: 'picked_up', timestamp: '2026-09-28T08:19:30Z', lat: 39.9664, lng: -82.9558, recordedByUserId: 'drv-1', recordedByName: 'Marcus Vance' }
    ]
  },
  {
    id: 'trip-102',
    tripNumber: 'TP-2026-092',
    riderId: 'rdr-3',
    riderName: 'Maria Gonzalez',
    riderPhone: '(614) 555-3810',
    riderMedicaidId: 'OH-73629105',
    driverId: 'drv-2',
    driverName: 'Clara Hernandez',
    vehicleId: 'veh-102',
    vehicleName: 'Van #102 (Dodge Grand Caravan)',
    payerId: 'pyr-1',
    payerName: 'Buckeye Community Health',
    authorizationNumber: 'AUTH-BCH-77491',
    date: '2026-09-28',
    scheduledPickupTime: '08:45',
    appointmentTime: '09:30',
    pickupAddress: '2410 S High St, Apt 3B, Columbus, OH 43207',
    pickupLat: 39.9192,
    pickupLng: -82.9975,
    dropoffAddress: 'Fresenius Kidney Care South, 3600 S High St, Columbus, OH',
    dropoffLat: 39.8980,
    dropoffLng: -83.0010,
    mobilityType: 'wheelchair',
    escortRequired: true,
    isRecurring: true,
    recurringDays: ['Mon', 'Wed', 'Fri'],
    notes: 'Escort onboard. Arrived at pickup location.',
    status: 'arrived_pickup',
    billingStatus: 'ready_to_bill',
    estimatedMiles: 3.2,
    fare: {
      baseRate: 42.00,
      mileageRate: 9.12,
      surcharges: 18.00,
      total: 69.12
    },
    verification: {
      serviceType: true,
      riderIdentity: true,
      serviceDate: true,
      locations: true,
      driverIdentity: true,
      exactTimes: true,
      authorization: true,
      signature: true
    },
    events: [
      { id: 'ev-6', tripId: 'trip-102', type: 'created', timestamp: '2026-09-27T18:00:00Z', recordedByUserId: 'usr-disp', recordedByName: 'Dispatcher Dave' },
      { id: 'ev-7', tripId: 'trip-102', type: 'started', timestamp: '2026-09-28T08:25:10Z', lat: 39.9310, lng: -82.9910, recordedByUserId: 'drv-2', recordedByName: 'Clara Hernandez' },
      { id: 'ev-8', tripId: 'trip-102', type: 'arrived_pickup', timestamp: '2026-09-28T08:44:05Z', lat: 39.9191, lng: -82.9976, recordedByUserId: 'drv-2', recordedByName: 'Clara Hernandez' }
    ]
  },
  {
    id: 'trip-103',
    tripNumber: 'TP-2026-093',
    riderId: 'rdr-4',
    riderName: 'Samuel Washington',
    riderPhone: '(614) 555-1948',
    riderMedicaidId: 'OH-62849102',
    driverId: 'drv-6',
    driverName: 'Roberto Gomez',
    vehicleId: 'veh-301',
    vehicleName: 'Special #301 (Ram ProMaster Stretcher)',
    payerId: 'pyr-2',
    payerName: 'CareSource NEMT',
    authorizationNumber: 'AUTH-CS-33819',
    date: '2026-09-28',
    scheduledPickupTime: '09:15',
    appointmentTime: '10:00',
    pickupAddress: '3150 Cleveland Ave, Columbus, OH 43224',
    pickupLat: 40.0381,
    pickupLng: -82.9592,
    dropoffAddress: 'Chalmers P. Wylie VA Ambulatory Care, 420 N James Rd, Columbus, OH',
    dropoffLat: 39.9820,
    dropoffLng: -82.8980,
    mobilityType: 'stretcher',
    escortRequired: false,
    notes: 'Stretcher transport. En route to pickup.',
    status: 'en_route_pickup',
    billingStatus: 'ready_to_bill',
    estimatedMiles: 6.8,
    fare: {
      baseRate: 100.00,
      mileageRate: 21.08,
      surcharges: 50.00,
      total: 171.08
    },
    verification: {
      serviceType: true,
      riderIdentity: true,
      serviceDate: true,
      locations: true,
      driverIdentity: true,
      exactTimes: true,
      authorization: true,
      signature: true
    },
    events: [
      { id: 'ev-9', tripId: 'trip-103', type: 'created', timestamp: '2026-09-27T18:00:00Z', recordedByUserId: 'usr-disp', recordedByName: 'Dispatcher Dave' },
      { id: 'ev-10', tripId: 'trip-103', type: 'started', timestamp: '2026-09-28T08:52:14Z', lat: 40.0100, lng: -82.9700, recordedByUserId: 'drv-6', recordedByName: 'Roberto Gomez' }
    ]
  },
  // Trip needing fixing #1: Missing drop-off time & GPS!
  {
    id: 'trip-104',
    tripNumber: 'TP-2026-094',
    riderId: 'rdr-2',
    riderName: 'Henry Jenkins',
    riderPhone: '(614) 555-4819',
    riderMedicaidId: 'OH-84729103',
    driverId: 'drv-3',
    driverName: 'Terrence Washington',
    vehicleId: 'veh-201',
    vehicleName: 'Sedan #201 (Chevy Malibu)',
    payerId: 'pyr-2',
    payerName: 'CareSource NEMT',
    authorizationNumber: 'AUTH-CS-44910',
    date: '2026-09-28',
    scheduledPickupTime: '07:30',
    appointmentTime: '08:15',
    pickupAddress: '883 S 22nd St, Columbus, OH 43206',
    pickupLat: 39.9482,
    pickupLng: -82.9642,
    dropoffAddress: 'Grant Medical Center Cardiac Rehab, 111 S Grant Ave, Columbus, OH',
    dropoffLat: 39.9610,
    dropoffLng: -82.9910,
    mobilityType: 'walking',
    escortRequired: false,
    notes: 'Driver finished ride but forgot to tap Completed on device.',
    status: 'needs_fixing',
    billingStatus: 'needs_fixing',
    estimatedMiles: 4.1,
    fare: {
      baseRate: 26.00,
      mileageRate: 12.71,
      surcharges: 0,
      total: 38.71
    },
    verification: {
      serviceType: true,
      riderIdentity: true,
      serviceDate: true,
      locations: false, // Missing dropoff GPS!
      driverIdentity: true,
      exactTimes: false, // Missing dropoff time!
      authorization: true,
      signature: true
    },
    events: [
      { id: 'ev-11', tripId: 'trip-104', type: 'created', timestamp: '2026-09-27T18:00:00Z', recordedByUserId: 'usr-disp', recordedByName: 'Dispatcher Dave' },
      { id: 'ev-12', tripId: 'trip-104', type: 'started', timestamp: '2026-09-28T07:15:10Z', recordedByUserId: 'drv-3', recordedByName: 'Terrence Washington' },
      { id: 'ev-13', tripId: 'trip-104', type: 'arrived_pickup', timestamp: '2026-09-28T07:28:40Z', recordedByUserId: 'drv-3', recordedByName: 'Terrence Washington' },
      { id: 'ev-14', tripId: 'trip-104', type: 'picked_up', timestamp: '2026-09-28T07:34:15Z', recordedByUserId: 'drv-3', recordedByName: 'Terrence Washington' }
      // NOTE: Missing arrived_dropoff and completed!
    ]
  },
  // Trip needing fixing #2: Missing Authorization Number!
  {
    id: 'trip-105',
    tripNumber: 'TP-2026-095',
    riderId: 'rdr-5',
    riderName: 'Arthur Pendelton',
    riderPhone: '(614) 555-7391',
    riderMedicaidId: 'OH-51928471',
    driverId: 'drv-5',
    driverName: 'Sarah Jenkins',
    vehicleId: 'veh-202',
    vehicleName: 'Van #202 (Ford Transit)',
    payerId: 'pyr-1', // Buckeye requires prior auth!
    payerName: 'Buckeye Community Health',
    authorizationNumber: '', // BLANK!
    date: '2026-09-28',
    scheduledPickupTime: '10:00',
    appointmentTime: '10:45',
    pickupAddress: '640 S Champion Ave, Columbus, OH 43205',
    pickupLat: 39.9512,
    pickupLng: -82.9610,
    dropoffAddress: 'OhioHealth Doctors West Hospital, 5100 W Broad St, Columbus, OH',
    dropoffLat: 39.9650,
    dropoffLng: -83.1190,
    mobilityType: 'wheelchair',
    escortRequired: false,
    notes: 'Urgent clinic visit requested by case manager. Broker approval pending.',
    status: 'assigned',
    billingStatus: 'needs_fixing',
    estimatedMiles: 11.4,
    fare: {
      baseRate: 42.00,
      mileageRate: 32.49,
      surcharges: 18.00,
      total: 92.49
    },
    verification: {
      serviceType: true,
      riderIdentity: true,
      serviceDate: true,
      locations: true,
      driverIdentity: true,
      exactTimes: true,
      authorization: false, // Missing prior auth!
      signature: true
    },
    events: [
      { id: 'ev-15', tripId: 'trip-105', type: 'created', timestamp: '2026-09-28T07:00:00Z', recordedByUserId: 'usr-disp', recordedByName: 'Dispatcher Dave' },
      { id: 'ev-16', tripId: 'trip-105', type: 'assigned', timestamp: '2026-09-28T07:45:00Z', recordedByUserId: 'usr-disp', recordedByName: 'Dispatcher Dave' }
    ]
  },
  // Trip needing fixing #3: Completed but missing signature/refusal waiver!
  {
    id: 'trip-106',
    tripNumber: 'TP-2026-096',
    riderId: 'rdr-6',
    riderName: 'Beatrice O\'Connor',
    riderPhone: '(614) 555-9204',
    riderMedicaidId: 'OH-40291847',
    driverId: 'drv-7',
    driverName: 'Aaliyah Woods',
    vehicleId: 'veh-201',
    vehicleName: 'Sedan #201 (Chevy Malibu)',
    payerId: 'pyr-1',
    payerName: 'Buckeye Community Health',
    authorizationNumber: 'AUTH-BCH-62914',
    date: '2026-09-28',
    scheduledPickupTime: '07:00',
    appointmentTime: '07:45',
    pickupAddress: '1120 Bryden Rd, Columbus, OH 43205',
    pickupLat: 39.9598,
    pickupLng: -82.9691,
    dropoffAddress: 'Mount Carmel East Physical Therapy, 6001 E Broad St, Columbus, OH',
    dropoffLat: 39.9780,
    dropoffLng: -82.8360,
    mobilityType: 'walking',
    escortRequired: true,
    notes: 'Completed ride. Driver did not capture signature or waiver reason at facility.',
    status: 'completed',
    billingStatus: 'needs_fixing',
    estimatedMiles: 8.5,
    fare: {
      baseRate: 24.50,
      mileageRate: 24.23,
      surcharges: 0,
      total: 48.73
    },
    verification: {
      serviceType: true,
      riderIdentity: true,
      serviceDate: true,
      locations: true,
      driverIdentity: true,
      exactTimes: true,
      authorization: true,
      signature: false // Missing signature!
    },
    events: [
      { id: 'ev-17', tripId: 'trip-106', type: 'created', timestamp: '2026-09-27T18:00:00Z', recordedByUserId: 'usr-disp', recordedByName: 'Dispatcher Dave' },
      { id: 'ev-18', tripId: 'trip-106', type: 'started', timestamp: '2026-09-28T06:45:00Z', recordedByUserId: 'drv-7', recordedByName: 'Aaliyah Woods' },
      { id: 'ev-19', tripId: 'trip-106', type: 'arrived_pickup', timestamp: '2026-09-28T06:58:10Z', recordedByUserId: 'drv-7', recordedByName: 'Aaliyah Woods' },
      { id: 'ev-20', tripId: 'trip-106', type: 'picked_up', timestamp: '2026-09-28T07:05:00Z', recordedByUserId: 'drv-7', recordedByName: 'Aaliyah Woods' },
      { id: 'ev-21', tripId: 'trip-106', type: 'arrived_dropoff', timestamp: '2026-09-28T07:38:20Z', recordedByUserId: 'drv-7', recordedByName: 'Aaliyah Woods' },
      { id: 'ev-22', tripId: 'trip-106', type: 'completed', timestamp: '2026-09-28T07:42:00Z', recordedByUserId: 'drv-7', recordedByName: 'Aaliyah Woods' }
    ]
  },
  // Scheduled afternoon trips
  {
    id: 'trip-107',
    tripNumber: 'TP-2026-097',
    riderId: 'rdr-7',
    riderName: 'James C. Miller',
    riderPhone: '(614) 555-6621',
    riderMedicaidId: 'OH-39182740',
    driverId: 'drv-1',
    driverName: 'Marcus Vance',
    vehicleId: 'veh-101',
    vehicleName: 'Van #101 (Ford Transit High Roof)',
    payerId: 'pyr-1',
    payerName: 'Buckeye Community Health',
    authorizationNumber: 'AUTH-BCH-44102',
    date: '2026-09-28',
    scheduledPickupTime: '13:00',
    appointmentTime: '14:00',
    pickupAddress: '1755 S 4th St, Columbus, OH 43207',
    pickupLat: 39.9320,
    pickupLng: -82.9980,
    dropoffAddress: 'DaVita Capital City Dialysis, 100 E Campus View Blvd, Columbus, OH',
    dropoffLat: 40.1190,
    dropoffLng: -83.0180,
    mobilityType: 'wheelchair',
    escortRequired: false,
    notes: 'Afternoon dialysis return trip.',
    status: 'assigned',
    billingStatus: 'ready_to_bill',
    estimatedMiles: 14.2,
    fare: {
      baseRate: 42.00,
      mileageRate: 40.47,
      surcharges: 18.00,
      total: 100.47
    },
    verification: {
      serviceType: true,
      riderIdentity: true,
      serviceDate: true,
      locations: true,
      driverIdentity: true,
      exactTimes: true,
      authorization: true,
      signature: true
    },
    events: [
      { id: 'ev-23', tripId: 'trip-107', type: 'created', timestamp: '2026-09-27T18:00:00Z', recordedByUserId: 'usr-disp', recordedByName: 'Dispatcher Dave' },
      { id: 'ev-24', tripId: 'trip-107', type: 'assigned', timestamp: '2026-09-28T07:15:00Z', recordedByUserId: 'usr-disp', recordedByName: 'Dispatcher Dave' }
    ]
  },
  // Unassigned trip on the dispatch board
  {
    id: 'trip-108',
    tripNumber: 'TP-2026-098',
    riderId: 'rdr-8',
    riderName: 'Dorothy Campbell',
    riderPhone: '(614) 555-3319',
    riderMedicaidId: 'OH-28194018',
    payerId: 'pyr-2',
    payerName: 'CareSource NEMT',
    authorizationNumber: 'AUTH-CS-99120',
    date: '2026-09-28',
    scheduledPickupTime: '11:15',
    appointmentTime: '12:00',
    pickupAddress: '492 Glenwood Ave, Columbus, OH 43223',
    pickupLat: 39.9540,
    pickupLng: -83.0270,
    dropoffAddress: 'Riverside Methodist Hospital Outpatient, 3535 Olentangy River Rd, Columbus, OH',
    dropoffLat: 40.0350,
    dropoffLng: -83.0370,
    mobilityType: 'walking',
    escortRequired: false,
    notes: 'Unassigned trip. Needs driver assignment for 11:15 AM.',
    status: 'scheduled',
    billingStatus: 'ready_to_bill',
    estimatedMiles: 6.9,
    fare: {
      baseRate: 26.00,
      mileageRate: 21.39,
      surcharges: 0,
      total: 47.39
    },
    verification: {
      serviceType: true,
      riderIdentity: true,
      serviceDate: true,
      locations: true,
      driverIdentity: false, // Needs driver!
      exactTimes: true,
      authorization: true,
      signature: true
    },
    events: [
      { id: 'ev-25', tripId: 'trip-108', type: 'created', timestamp: '2026-09-28T07:30:00Z', recordedByUserId: 'usr-disp', recordedByName: 'Dispatcher Dave' }
    ]
  },
  // Unassigned wheelchair trip
  {
    id: 'trip-109',
    tripNumber: 'TP-2026-099',
    riderId: 'rdr-10',
    riderName: 'Gwendolyn Hayes',
    riderPhone: '(614) 555-4491',
    riderMedicaidId: 'OH-88371920',
    payerId: 'pyr-1',
    payerName: 'Buckeye Community Health',
    authorizationNumber: 'AUTH-BCH-10294',
    date: '2026-09-28',
    scheduledPickupTime: '14:30',
    appointmentTime: '15:15',
    pickupAddress: '741 E 5th Ave, Columbus, OH 43201',
    pickupLat: 39.9880,
    pickupLng: -82.9860,
    dropoffAddress: 'Central Ohio Nephrology, 1020 Dennison Ave, Columbus, OH',
    dropoffLat: 39.9830,
    dropoffLng: -83.0110,
    mobilityType: 'wheelchair',
    escortRequired: false,
    notes: 'Wheelchair van required. Check lift clearance.',
    status: 'scheduled',
    billingStatus: 'ready_to_bill',
    estimatedMiles: 2.5,
    fare: {
      baseRate: 42.00,
      mileageRate: 7.13,
      surcharges: 18.00,
      total: 67.13
    },
    verification: {
      serviceType: true,
      riderIdentity: true,
      serviceDate: true,
      locations: true,
      driverIdentity: false,
      exactTimes: true,
      authorization: true,
      signature: true
    },
    events: [
      { id: 'ev-26', tripId: 'trip-109', type: 'created', timestamp: '2026-09-28T07:45:00Z', recordedByUserId: 'usr-disp', recordedByName: 'Dispatcher Dave' }
    ]
  },
  {
    id: 'trip-110',
    tripNumber: 'TP-2026-100',
    riderId: 'rdr-9',
    riderName: 'Walter Sterling',
    riderPhone: '(614) 555-8822',
    riderMedicaidId: 'OH-19482736',
    driverId: 'drv-5',
    driverName: 'Sarah Jenkins',
    vehicleId: 'veh-202',
    vehicleName: 'Van #202 (Ford Transit)',
    payerId: 'pyr-3',
    payerName: 'UnitedHealthcare Community Plan OH',
    authorizationNumber: 'UHC-DIRECT-192',
    date: '2026-09-28',
    scheduledPickupTime: '15:45',
    appointmentTime: '16:30',
    pickupAddress: '2280 W Broad St, Columbus, OH 43223',
    pickupLat: 39.9582,
    pickupLng: -83.0560,
    dropoffAddress: 'Wexner Medical Center Chemotherapy, 410 W 10th Ave, Columbus, OH',
    dropoffLat: 39.9980,
    dropoffLng: -83.0170,
    mobilityType: 'walking',
    escortRequired: false,
    notes: 'Chemotherapy appointment.',
    status: 'assigned',
    billingStatus: 'ready_to_bill',
    estimatedMiles: 5.7,
    fare: {
      baseRate: 22.00,
      mileageRate: 15.68,
      surcharges: 0,
      total: 37.68
    },
    verification: {
      serviceType: true,
      riderIdentity: true,
      serviceDate: true,
      locations: true,
      driverIdentity: true,
      exactTimes: true,
      authorization: true,
      signature: true
    },
    events: [
      { id: 'ev-27', tripId: 'trip-110', type: 'created', timestamp: '2026-09-28T08:00:00Z', recordedByUserId: 'usr-disp', recordedByName: 'Dispatcher Dave' }
    ]
  },

  // --- PAST COMPLETED TRIPS (2026-09-25 to 2026-09-27) ---
  // Denied claim #1 (Ready to Fix and Resubmit!)
  {
    id: 'trip-082',
    tripNumber: 'TP-2026-082',
    riderId: 'rdr-1',
    riderName: 'Eleanor Vance',
    riderPhone: '(614) 555-8291',
    riderMedicaidId: 'OH-92841029',
    driverId: 'drv-1',
    driverName: 'Marcus Vance',
    vehicleId: 'veh-101',
    vehicleName: 'Van #101 (Ford Transit High Roof)',
    payerId: 'pyr-1',
    payerName: 'Buckeye Community Health',
    authorizationNumber: 'AUTH-BCH-98124',
    date: '2026-09-25',
    scheduledPickupTime: '08:15',
    appointmentTime: '09:00',
    pickupAddress: '1428 E Broad St, Columbus, OH 43205',
    pickupLat: 39.9664,
    pickupLng: -82.9558,
    dropoffAddress: 'Ohio State Wexner Dialysis, 1492 E Broad St, Columbus, OH',
    dropoffLat: 39.9670,
    dropoffLng: -82.9530,
    mobilityType: 'wheelchair',
    escortRequired: false,
    notes: 'Claim denied by Buckeye: Missing modifier U1 (Unscheduled return vs Scheduled).',
    status: 'completed',
    billingStatus: 'denied',
    denialReason: 'Procedure code modifier missing (Requires U1 transport modifier on Line 1).',
    denialCode: 'CO-16 / N56',
    estimatedMiles: 1.8,
    fare: {
      baseRate: 42.00,
      mileageRate: 5.13,
      surcharges: 18.00,
      total: 65.13
    },
    verification: {
      serviceType: true,
      riderIdentity: true,
      serviceDate: true,
      locations: true,
      driverIdentity: true,
      exactTimes: true,
      authorization: true,
      signature: true
    },
    signature: {
      signedBy: 'Eleanor Vance',
      signatureUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="40"><path d="M10 25 Q 30 10 50 25 T 90 20" stroke="%238C3B1F" fill="none" stroke-width="2"/></svg>',
      timestamp: '2026-09-25T08:52:10Z',
      unableToSign: false
    },
    events: [
      { id: 'ev-28', tripId: 'trip-082', type: 'completed', timestamp: '2026-09-25T08:55:00Z', recordedByUserId: 'drv-1', recordedByName: 'Marcus Vance' }
    ]
  },
  // Denied claim #2 (Broker authorization mismatch)
  {
    id: 'trip-079',
    tripNumber: 'TP-2026-079',
    riderId: 'rdr-3',
    riderName: 'Maria Gonzalez',
    riderPhone: '(614) 555-3810',
    riderMedicaidId: 'OH-73629105',
    driverId: 'drv-2',
    driverName: 'Clara Hernandez',
    vehicleId: 'veh-102',
    vehicleName: 'Van #102 (Dodge Grand Caravan)',
    payerId: 'pyr-2',
    payerName: 'CareSource NEMT',
    authorizationNumber: 'AUTH-CS-WRONG-99',
    date: '2026-09-23',
    scheduledPickupTime: '08:45',
    appointmentTime: '09:30',
    pickupAddress: '2410 S High St, Columbus, OH',
    pickupLat: 39.9192,
    pickupLng: -82.9975,
    dropoffAddress: 'Fresenius Kidney Care South, Columbus, OH',
    dropoffLat: 39.8980,
    dropoffLng: -83.0010,
    mobilityType: 'wheelchair',
    escortRequired: true,
    status: 'completed',
    billingStatus: 'denied',
    denialReason: 'Prior authorization number AUTH-CS-WRONG-99 not found in CareSource portal.',
    denialCode: 'CO-197',
    estimatedMiles: 3.2,
    fare: {
      baseRate: 45.00,
      mileageRate: 9.92,
      surcharges: 20.00,
      total: 74.92
    },
    verification: {
      serviceType: true,
      riderIdentity: true,
      serviceDate: true,
      locations: true,
      driverIdentity: true,
      exactTimes: true,
      authorization: false,
      signature: true
    },
    events: [
      { id: 'ev-29', tripId: 'trip-079', type: 'completed', timestamp: '2026-09-23T09:25:00Z', recordedByUserId: 'drv-2', recordedByName: 'Clara Hernandez' }
    ]
  },
  // Ready to bill trips
  {
    id: 'trip-088',
    tripNumber: 'TP-2026-088',
    riderId: 'rdr-2',
    riderName: 'Henry Jenkins',
    riderPhone: '(614) 555-4819',
    riderMedicaidId: 'OH-84729103',
    driverId: 'drv-3',
    driverName: 'Terrence Washington',
    vehicleId: 'veh-201',
    vehicleName: 'Sedan #201 (Chevy Malibu)',
    payerId: 'pyr-2',
    payerName: 'CareSource NEMT',
    authorizationNumber: 'AUTH-CS-88129',
    date: '2026-09-26',
    scheduledPickupTime: '13:00',
    appointmentTime: '13:45',
    pickupAddress: '883 S 22nd St, Columbus, OH',
    pickupLat: 39.9482,
    pickupLng: -82.9642,
    dropoffAddress: 'Grant Medical Center Cardiac Rehab, Columbus, OH',
    dropoffLat: 39.9610,
    dropoffLng: -82.9910,
    mobilityType: 'walking',
    escortRequired: false,
    status: 'completed',
    billingStatus: 'ready_to_bill',
    estimatedMiles: 4.1,
    fare: {
      baseRate: 26.00,
      mileageRate: 12.71,
      surcharges: 0,
      total: 38.71
    },
    verification: {
      serviceType: true,
      riderIdentity: true,
      serviceDate: true,
      locations: true,
      driverIdentity: true,
      exactTimes: true,
      authorization: true,
      signature: true
    },
    signature: {
      signedBy: 'Henry Jenkins',
      timestamp: '2026-09-26T13:40:12Z',
      unableToSign: false
    },
    events: [
      { id: 'ev-30', tripId: 'trip-088', type: 'completed', timestamp: '2026-09-26T13:42:00Z', recordedByUserId: 'drv-3', recordedByName: 'Terrence Washington' }
    ]
  },
  {
    id: 'trip-089',
    tripNumber: 'TP-2026-089',
    riderId: 'rdr-4',
    riderName: 'Samuel Washington',
    riderPhone: '(614) 555-1948',
    riderMedicaidId: 'OH-62849102',
    driverId: 'drv-6',
    driverName: 'Roberto Gomez',
    vehicleId: 'veh-301',
    vehicleName: 'Special #301 (Ram ProMaster Stretcher)',
    payerId: 'pyr-2',
    payerName: 'CareSource NEMT',
    authorizationNumber: 'AUTH-CS-66190',
    date: '2026-09-26',
    scheduledPickupTime: '10:00',
    appointmentTime: '11:00',
    pickupAddress: '3150 Cleveland Ave, Columbus, OH',
    pickupLat: 40.0381,
    pickupLng: -82.9592,
    dropoffAddress: 'Chalmers P. Wylie VA, Columbus, OH',
    dropoffLat: 39.9820,
    dropoffLng: -82.8980,
    mobilityType: 'stretcher',
    escortRequired: false,
    status: 'completed',
    billingStatus: 'ready_to_bill',
    estimatedMiles: 6.8,
    fare: {
      baseRate: 100.00,
      mileageRate: 21.08,
      surcharges: 50.00,
      total: 171.08
    },
    verification: {
      serviceType: true,
      riderIdentity: true,
      serviceDate: true,
      locations: true,
      driverIdentity: true,
      exactTimes: true,
      authorization: true,
      signature: true
    },
    signature: {
      signedBy: 'RN S. Adams (VA Attendant)',
      timestamp: '2026-09-26T10:55:00Z',
      unableToSign: true,
      unableToSignReason: 'facility_staff_signed'
    },
    events: [
      { id: 'ev-31', tripId: 'trip-089', type: 'completed', timestamp: '2026-09-26T10:58:00Z', recordedByUserId: 'drv-6', recordedByName: 'Roberto Gomez' }
    ]
  },
  // Batched & Submitted trips
  {
    id: 'trip-071',
    tripNumber: 'TP-2026-071',
    riderId: 'rdr-1',
    riderName: 'Eleanor Vance',
    riderPhone: '(614) 555-8291',
    riderMedicaidId: 'OH-92841029',
    driverId: 'drv-1',
    driverName: 'Marcus Vance',
    vehicleId: 'veh-101',
    vehicleName: 'Van #101 (Ford Transit High Roof)',
    payerId: 'pyr-1',
    payerName: 'Buckeye Community Health',
    authorizationNumber: 'AUTH-BCH-98124',
    date: '2026-09-21',
    scheduledPickupTime: '08:15',
    appointmentTime: '09:00',
    pickupAddress: '1428 E Broad St, Columbus, OH',
    pickupLat: 39.9664,
    pickupLng: -82.9558,
    dropoffAddress: 'Ohio State Wexner Dialysis, Columbus, OH',
    dropoffLat: 39.9670,
    dropoffLng: -82.9530,
    mobilityType: 'wheelchair',
    escortRequired: false,
    status: 'completed',
    billingStatus: 'submitted',
    batchId: 'batch-001',
    estimatedMiles: 1.8,
    fare: {
      baseRate: 42.00,
      mileageRate: 5.13,
      surcharges: 18.00,
      total: 65.13
    },
    verification: {
      serviceType: true,
      riderIdentity: true,
      serviceDate: true,
      locations: true,
      driverIdentity: true,
      exactTimes: true,
      authorization: true,
      signature: true
    },
    events: [
      { id: 'ev-32', tripId: 'trip-071', type: 'completed', timestamp: '2026-09-21T08:50:00Z', recordedByUserId: 'drv-1', recordedByName: 'Marcus Vance' }
    ]
  },
  {
    id: 'trip-065',
    tripNumber: 'TP-2026-065',
    riderId: 'rdr-5',
    riderName: 'Arthur Pendelton',
    riderPhone: '(614) 555-7391',
    riderMedicaidId: 'OH-51928471',
    driverId: 'drv-2',
    driverName: 'Clara Hernandez',
    vehicleId: 'veh-102',
    vehicleName: 'Van #102 (Dodge Grand Caravan)',
    payerId: 'pyr-3',
    payerName: 'UnitedHealthcare Community Plan OH',
    authorizationNumber: 'UHC-DIRECT-110',
    date: '2026-09-19',
    scheduledPickupTime: '10:00',
    appointmentTime: '10:45',
    pickupAddress: '640 S Champion Ave, Columbus, OH',
    pickupLat: 39.9512,
    pickupLng: -82.9610,
    dropoffAddress: 'OhioHealth Doctors West Hospital, Columbus, OH',
    dropoffLat: 39.9650,
    dropoffLng: -83.1190,
    mobilityType: 'wheelchair',
    escortRequired: false,
    status: 'completed',
    billingStatus: 'paid',
    batchId: 'batch-000',
    estimatedMiles: 11.4,
    fare: {
      baseRate: 40.00,
      mileageRate: 31.35,
      surcharges: 15.00,
      total: 86.35
    },
    verification: {
      serviceType: true,
      riderIdentity: true,
      serviceDate: true,
      locations: true,
      driverIdentity: true,
      exactTimes: true,
      authorization: true,
      signature: true
    },
    events: [
      { id: 'ev-33', tripId: 'trip-065', type: 'completed', timestamp: '2026-09-19T10:40:00Z', recordedByUserId: 'drv-2', recordedByName: 'Clara Hernandez' }
    ]
  }
];

export const INITIAL_CLAIM_BATCHES: ClaimBatch[] = [
  {
    id: 'batch-001',
    batchNumber: 'BATCH-2026-09A',
    createdAt: '2026-09-22T14:30:00Z',
    payerId: 'pyr-1',
    payerName: 'Buckeye Community Health',
    tripIds: ['trip-071'],
    totalAmount: 65.13,
    status: 'submitted',
    exportedAt: '2026-09-22T14:35:00Z'
  },
  {
    id: 'batch-000',
    batchNumber: 'BATCH-2026-09-ARCH',
    createdAt: '2026-09-20T10:00:00Z',
    payerId: 'pyr-3',
    payerName: 'UnitedHealthcare Community Plan OH',
    tripIds: ['trip-065'],
    totalAmount: 86.35,
    status: 'paid',
    exportedAt: '2026-09-20T10:15:00Z'
  }
];

export const INITIAL_AUDIT_LOGS: AuditLogItem[] = [
  {
    id: 'aud-1',
    timestamp: '2026-09-28T07:15:00Z',
    userId: 'usr-disp',
    userName: 'David Miller',
    userRole: 'dispatcher',
    action: 'assign_trip',
    entityType: 'trip',
    entityId: 'trip-101',
    entityName: 'Trip #TP-2026-091 (Eleanor Vance)',
    details: 'Assigned Marcus Vance and Van #101 to recurring dialysis run.'
  },
  {
    id: 'aud-2',
    timestamp: '2026-09-28T07:30:15Z',
    userId: 'usr-admin',
    userName: 'Sarah Chen (Owner)',
    userRole: 'owner_admin',
    action: 'view_phi',
    entityType: 'rider',
    entityId: 'rdr-1',
    entityName: 'Eleanor Vance',
    details: 'Revealed masked Medicaid ID for broker eligibility audit.',
    reason: 'Monthly ODM compliance file verification'
  },
  {
    id: 'aud-3',
    timestamp: '2026-09-28T08:05:42Z',
    userId: 'usr-bill',
    userName: 'Linda Kowalski',
    userRole: 'billing',
    action: 'edit_trip',
    entityType: 'trip',
    entityId: 'trip-082',
    entityName: 'Trip #TP-2026-082',
    details: 'Appended missing U1 modifier after Buckeye denial notice.',
    reason: 'Provider dispute resolution for dialysis return leg'
  }
];

export const INITIAL_ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'step-1',
    title: 'Company & Provider Credentials',
    description: 'Set your legal NEMT name, Ohio NPI, and dispatch phone number.',
    completed: true,
    actionLabel: 'Review Profile',
    routeTo: 'settings'
  },
  {
    id: 'step-2',
    title: 'Configure Payer Rate Tables',
    description: 'Add your contracted brokers (Buckeye, CareSource) and mileage rates.',
    completed: true,
    actionLabel: 'View Rates',
    routeTo: 'settings'
  },
  {
    id: 'step-3',
    title: 'Enroll Fleet Vehicles',
    description: 'Add VINs, ramp/lift inspection certs, and capacity limits.',
    completed: true,
    actionLabel: 'Manage Vehicles',
    routeTo: 'fleet'
  },
  {
    id: 'step-4',
    title: 'Add Drivers & Upload Credentials',
    description: 'Ensure licenses, CPR, drug tests, and background checks are on file.',
    completed: true,
    actionLabel: 'Manage Drivers',
    routeTo: 'fleet'
  },
  {
    id: 'step-5',
    title: 'Verify Your First Day of Trips',
    description: 'Watch drivers record EVV timestamps and resolve missing data before billing.',
    completed: false,
    actionLabel: 'Open Verification Center',
    routeTo: 'verification'
  }
];
