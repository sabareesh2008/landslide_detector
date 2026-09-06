/**
 * Types & Data Schemas for Landslide Sentinel AI
 * North Eastern Region Landslide Detection & Early-Warning Platform
 */

export type NEState = 
  | 'Arunachal Pradesh'
  | 'Assam'
  | 'Manipur'
  | 'Meghalaya'
  | 'Mizoram'
  | 'Nagaland'
  | 'Sikkim'
  | 'Tripura';

export type UserRole = 
  | 'Administrator'
  | 'District Administration'
  | 'Disaster Management Authority'
  | 'Field Official'
  | 'Citizen';

export type RiskSeverity = 'low' | 'moderate' | 'high' | 'critical';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  state: NEState | 'All NE States';
  district: string;
  badge: string;
  phone: string;
}

export interface GridCellRisk {
  id: string;
  cellCode: string;
  name: string;
  state: NEState;
  district: string;
  lat: number;
  lng: number;
  elevationMeters: number;
  slopeDegrees: number;
  slopeAspect: string;
  geologyType: string;
  soilType: string;
  
  // Real-time & Satellite Derived Metrics
  rainfallIntensityMmHr: number;
  cumulativeRainfall24hMm: number;
  cumulativeRainfall72hMm: number;
  forecastRainfall24hMm: number;
  surfaceSoilMoisturePercent: number; // 0 - 100
  waterSaturationIndex: number; // 0 - 1
  vegetationIndexNdviDelta: number; // -1 to 1 (negative indicates loss)
  landSurfaceTempC: number;
  terrainDeformationMmMonth: number; // InSAR ground movement
  poreWaterPressureKPa: number;
  vibrationLevelG: number;

  // AI/ML Model Output
  riskScore: number; // 0 - 100
  severity: RiskSeverity;
  landslideProbability: number; // 0 - 1
  predictionConfidence: number; // 0 - 1
  riskTrend: 'rapidly_increasing' | 'increasing' | 'stable' | 'decreasing';
  expectedRiskPeriod: string;
  primaryContributingFactors: string[];
  
  // Impacted Assets
  affectedVillages: string[];
  populationExposed: number;
  affectedRoads: string[];
  criticalInfrastructure: string[]; // e.g. "Civil Hospital", "Hydro Power Plant", "Baily Bridge"
  recommendedAction: string;
  
  // Pipeline Timestamps
  lastSatelliteObservation: string;
  calculationTimestamp: string;
  nextScheduledUpdate: string;
  isOutdated: boolean;
}

export interface SensorNode {
  id: string;
  name: string;
  state: NEState;
  district: string;
  lat: number;
  lng: number;
  type: 'Soil Moisture' | 'InSAR Tiltmeter' | 'Piezometer' | 'Vibration Geophone' | 'Rain Gauge' | 'ESP32 Integrated Node';
  status: 'active' | 'warning' | 'faulty' | 'offline';
  batteryPercent: number;
  signalDbm: number;
  lastTransmission: string;
  readings: {
    soilMoisture?: number;
    tiltAngleX?: number;
    tiltAngleY?: number;
    porePressure?: number;
    rainfallMm?: number;
    vibration?: number;
    ambientTemp?: number;
  };
  history: Array<{
    timestamp: string;
    value: number;
    unit: string;
  }>;
}

export interface RoadCorridor {
  id: string;
  name: string;
  highwayNumber: string;
  state: NEState;
  stretch: string;
  status: 'clear' | 'partially_blocked' | 'fully_blocked' | 'high_hazard_warning';
  blockageLocation?: { lat: number; lng: number };
  debrisVolumeM3?: number;
  estimatedClearanceTime?: string;
  alternateRoute?: string;
  trafficPriority: 'Critical Relief Corridor' | 'Civilian Transit' | 'Defense Logistics';
  lastUpdated: string;
}

export interface FieldReport {
  id: string;
  reporterName: string;
  reporterPhone: string;
  reporterRole: 'Citizen' | 'Field Official' | 'Local Police';
  state: NEState;
  district: string;
  locationName: string;
  lat: number;
  lng: number;
  timestamp: string;
  incidentType: 
    | 'Road Crack / Fissure' 
    | 'Slope Slump / Mudslide' 
    | 'Rockfall / Debris' 
    | 'Retaining Wall Bulge' 
    | 'Leaning Trees / Utility Poles' 
    | 'Water Seepage / Gush' 
    | 'Bridge Approach Damage';
  description: string;
  mediaUrl: string;
  aiClassification?: {
    detectedHazard: string;
    severityEstimate: 'Minor' | 'Moderate' | 'Severe' | 'Critical Failure';
    confidence: number;
    detectedFeatures: string[];
    annotatedRegions?: Array<{ x: number; y: number; w: number; h: number; label: string }>;
    geminiAnalysis?: string;
  };
  verificationStatus: 'pending' | 'verified_by_official' | 'rejected' | 'action_dispatched';
  officialRemarks?: string;
  isOfflineQueued?: boolean;
}

export interface EarlyWarningAlert {
  id: string;
  alertCode: string;
  state: NEState;
  district: string;
  zonesAffected: string[];
  severity: RiskSeverity;
  headline: string;
  details: string;
  safetyInstructions: string[];
  expectedRiskPeriod: string;
  issuedAt: string;
  validUntil: string;
  dataSource: string;
  confidenceScore: number;
  acknowledgedByDistrictAdmin: boolean;
  smsBroadcastCount: number;
  appPushCount: number;
  voiceCallBroadcast: boolean;
  isEscalated: boolean;
}

export interface EmergencyTask {
  id: string;
  priorityRank: number;
  urgencyScore: number; // 0 - 100 calculated from risk * exposure / access
  title: string;
  state: NEState;
  district: string;
  lat: number;
  lng: number;
  incidentCategory: string;
  affectedPopulation: number;
  requiredAction: string;
  assignedTeam: {
    name: string;
    unit: 'NDRF 1st Bn' | 'SDRF Quick Response' | 'BRO Clearance Wing' | 'Civil Defense' | 'Medical First Responder';
    members: number;
    contactLead: string;
    leader?: string;
    contact?: string;
    equipment?: string[];
    status: 'en_route' | 'on_site' | 'standby' | 'mission_completed';
    estimatedArrivalMins: number;
  };
  recommendedRoute: string;
  travelTimeMins: number;
  createdAt: string;
  status: 'pending' | 'dispatched' | 'active_rescue' | 'mitigated';
}

export interface SatellitePipelineStep {
  id: number;
  name: string;
  description: string;
  status: 'idle' | 'processing' | 'completed' | 'delayed' | 'failed';
  latencyMs: number;
  detail: string;
}

export interface PipelineState {
  currentCycleId: string;
  lastSuccessTimestamp: string;
  nextUpdateSecondsRemaining: number;
  isDelayed: boolean;
  retryCount: number;
  overallStatus: 'healthy' | 'running' | 'delayed' | 'fallback_mode';
  steps: SatellitePipelineStep[];
  satelliteFeeds: {
    sentinel2Optical: 'nominal' | 'cloud_occlusion' | 'delayed';
    sentinel1InSAR: 'nominal' | 'processing' | 'delayed';
    imdGPMPrecipitation: 'nominal' | 'live_feed';
    isroBhuvanGIS: 'nominal' | 'connected';
  };
}

export interface LanguageDictionary {
  code: 'en' | 'hi' | 'as' | 'bn' | 'ne';
  name: string;
  nativeName: string;
}
