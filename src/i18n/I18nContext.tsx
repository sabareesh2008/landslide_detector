import React, { createContext, useContext, useState, useEffect } from 'react';

export type LanguageCode = 'en' | 'hi' | 'as' | 'bn' | 'ne';

export interface TranslationDictionary {
  // Brand & Header
  appTitle: string;
  appSubtitle: string;
  regionalTag: string;
  stateSelectorLabel: string;
  allStates: string;
  roleSelectorLabel: string;
  audioAlertTitle: string;
  audioAlertMute: string;
  audioAlertUnmute: string;
  activeHazardsCount: string;

  // Sidebar & Navigation Groups
  groupLiveIntelligence: string;
  groupOperationsAI: string;
  groupAnalyticsGovernance: string;
  toolNavigation: string;
  onlineStatus: string;
  modulesActive: string;

  // Nav Items
  navCommandHub: string;
  navGISMap: string;
  navStateDistrict: string;
  navForecast: string;
  navPipeline: string;
  navRoads: string;
  navFieldVision: string;
  navEmergency: string;
  navCitizen: string;
  navHistorical: string;
  navReports: string;
  navAdmin: string;
  navHandbook: string;

  // Risk Severities
  critical: string;
  high: string;
  moderate: string;
  low: string;
  normal: string;
  criticalEvacuate: string;
  highPrepare: string;
  moderateWatch: string;
  lowNormal: string;

  // Simulation Controls
  simEngineTitle: string;
  simEngineDesc: string;
  simAccelerated: string;
  simRealtime: string;
  simTriggerStorm: string;
  simIngestPass: string;
  simReset: string;
  simNextUpdateIn: string;
  simPaused: string;
  simRunning: string;
  simResume: string;
  simPause: string;

  // Command Hub
  activeAlertsCount: string;
  monitoredZones: string;
  criticalSectors: string;
  highRiskVillages: string;
  blockedRoads: string;
  iotSensorsActive: string;
  exposedPopulation: string;
  priorityDispatchTasks: string;
  activeRedAlertsBanner: string;
  livePrecipitationRadar: string;
  riskFactorCurve: string;
  prioritySlopeSectors: string;
  viewGISMapBtn: string;
  openEvacuationBtn: string;
  downloadReportBtn: string;
  submitFieldReportBtn: string;
  testSirenBtn: string;

  // Table Columns & Details
  colZone: string;
  colLocation: string;
  colRain72h: string;
  colSlope: string;
  colPorePressure: string;
  colSafetyFactor: string;
  colRiskScore: string;
  colStatus: string;
  colActions: string;
  inspectZone: string;

  // GIS Map
  mapLayers: string;
  layerHeatmap: string;
  layerInSAR: string;
  layerRadar: string;
  layerSensors: string;
  layerRoads: string;
  layer3DContours: string;
  inspectorTitle: string;
  factorSafetyFS: string;
  inSARDeformation: string;
  saturationLevel: string;
  evacuationRoutes: string;
  nearestShelter: string;
  closeInspector: string;

  // Field Vision AI
  fieldVisionTitle: string;
  fieldVisionSubtitle: string;
  uploadPhoto: string;
  dragDropPhoto: string;
  aiClassification: string;
  detectedHazard: string;
  confidenceScore: string;
  officialVerification: string;
  verifiedOfficial: string;
  pendingReview: string;

  // Road Lifelines
  roadsTitle: string;
  roadsSubtitle: string;
  highwayStatusClear: string;
  highwayStatusBlocked: string;
  highwayStatusOneWay: string;
  debrisVolume: string;
  debrisAccumulation: string;
  clearanceETA: string;
  estimatedClearance: string;
  detourRoute: string;
  responsibleAgency: string;

  // Emergency Response
  eocTitle: string;
  eocSubtitle: string;
  dispatchRank: string;
  assignedUnit: string;
  teamLeader: string;
  personnelKit: string;
  estimatedArrival: string;
  statusDispatched: string;
  statusOnSiteRescue: string;
  statusCompleted: string;
  updateTacticalStatus: string;

  // Citizen & Handbook
  citizenPortalTitle: string;
  citizenPortalSubtitle: string;
  evacuationNotice: string;
  sheltersHeading: string;
  safeEvacuationRoutes: string;
  emergencyKitList: string;
  whatToDoBefore: string;
  whatToDoDuring: string;
  whatToDoAfter: string;
  helplineDirectory: string;
  tollFreeHelpline: string;
  soundDisasterSiren: string;

  // Weather & Satellite
  forecastTitle: string;
  forecastSubtitle: string;
  satelliteTitle: string;
  satelliteSubtitle: string;
  ingestionStatus: string;
  latencyMs: string;

  // Historical & Reports
  historicalTitle: string;
  historicalSubtitle: string;
  modelAccuracy: string;
  reportsTitle: string;
  reportsSubtitle: string;
  generateBulletin: string;
  downloadCSV: string;
  postgisSchema: string;

  // Admin & Settings
  adminTitle: string;
  adminSubtitle: string;
  thresholdSettings: string;
  saveThresholds: string;
  auditTrail: string;
}

export const TRANSLATIONS: Record<LanguageCode, TranslationDictionary> = {
  en: {
    appTitle: 'LANDSLIDE SENTINEL AI',
    appSubtitle: '8-State Early Warning & GIS Hazard Monitoring (Arunachal, Assam, Manipur, Meghalaya, Mizoram, Nagaland, Sikkim, Tripura)',
    regionalTag: 'North East India EOC',
    stateSelectorLabel: 'Filter by State',
    allStates: 'All 8 NE States',
    roleSelectorLabel: 'User Access Role',
    audioAlertTitle: 'Emergency Audio Siren',
    audioAlertMute: 'Mute Siren',
    audioAlertUnmute: 'Unmute Siren',
    activeHazardsCount: 'Active Hazards',

    groupLiveIntelligence: 'Live Intelligence',
    groupOperationsAI: 'Operations & AI',
    groupAnalyticsGovernance: 'Analytics & Governance',
    toolNavigation: 'Tool Navigation',
    onlineStatus: 'Online',
    modulesActive: '13 Integrated Hazard Tools Active',

    navCommandHub: 'Command Hub',
    navGISMap: 'GIS Risk Map',
    navStateDistrict: 'States & Districts',
    navForecast: 'Weather Forecast',
    navPipeline: 'Satellite Pipeline',
    navRoads: 'Road Lifelines',
    navFieldVision: 'Field Vision AI',
    navEmergency: 'Emergency Response',
    navCitizen: 'Citizen Portal',
    navHistorical: 'Historical Analytics',
    navReports: 'Reports & PostGIS',
    navAdmin: 'Admin & Integrations',
    navHandbook: 'Safety Handbook',

    critical: 'Critical',
    high: 'High',
    moderate: 'Moderate',
    low: 'Low',
    normal: 'Normal',
    criticalEvacuate: 'Critical (Immediate Evacuation)',
    highPrepare: 'High (Prepare for Relocation)',
    moderateWatch: 'Moderate (Active Watch)',
    lowNormal: 'Low (Normal Routine)',

    simEngineTitle: 'Real-Time Geotechnical & Cloudburst Physics Simulator',
    simEngineDesc: 'Calculates slope shear strength, pore-water pressure and InSAR creep velocity across 14 geo-physical parameters.',
    simAccelerated: 'Accelerated Mode (1 min = 1 hour)',
    simRealtime: 'Real-Time Clock',
    simTriggerStorm: 'Trigger Severe Cloudburst Storm',
    simIngestPass: 'Ingest Satellite Pass Now',
    simReset: 'Reset Simulation',
    simNextUpdateIn: 'Next Satellite Ingest in',
    simPaused: 'Simulation Paused',
    simRunning: 'Simulation Running',
    simResume: 'Resume Simulation',
    simPause: 'Pause Simulation',

    activeAlertsCount: 'Active Critical Alerts',
    monitoredZones: 'Monitored Micro-Catchments',
    criticalSectors: 'Critical Red Sectors',
    highRiskVillages: 'High Risk Settlements',
    blockedRoads: 'Blocked Hill Highways',
    iotSensorsActive: 'Active IoT Field Nodes',
    exposedPopulation: 'Vulnerable Population',
    priorityDispatchTasks: 'Tactical EOC Tasks',
    activeRedAlertsBanner: 'Active Red Alerts & Imminent Slope Rupture Bulletins',
    livePrecipitationRadar: 'Live Precipitation Doppler Radar & Telemetry',
    riskFactorCurve: 'Rainfall Saturation & Soil Deformation Curve',
    prioritySlopeSectors: 'Priority High-Risk Slope Sectors',
    viewGISMapBtn: 'Open GIS Map',
    openEvacuationBtn: 'Evacuation Routes',
    downloadReportBtn: 'Export Reports',
    submitFieldReportBtn: 'Report Incident',
    testSirenBtn: 'Test Audio Siren',

    colZone: 'Zone Code & Name',
    colLocation: 'State & District',
    colRain72h: '72h Rain (mm)',
    colSlope: 'Slope Angle',
    colPorePressure: 'Pore Pressure',
    colSafetyFactor: 'Safety Factor (FS)',
    colRiskScore: 'Risk Index',
    colStatus: 'Hazard Level',
    colActions: 'Action',
    inspectZone: 'Inspect',

    mapLayers: 'Map Layer Controls',
    layerHeatmap: 'Risk Heatmap Overlay',
    layerInSAR: 'InSAR Ground Creep Velocity',
    layerRadar: 'IMD Doppler Radar Reflectivity',
    layerSensors: 'IoT Telemetry Sensors',
    layerRoads: 'National Hill Highways',
    layer3DContours: 'CartoDEM Topographic Contours',
    inspectorTitle: 'Geotechnical Slope Inspector',
    factorSafetyFS: 'Safety Factor (FS)',
    inSARDeformation: 'InSAR Creep Velocity',
    saturationLevel: 'Soil Moisture Saturation',
    evacuationRoutes: 'Designated Safe Evacuation Paths',
    nearestShelter: 'Nearest Safe Relief Shelter',
    closeInspector: 'Close Inspector',

    fieldVisionTitle: 'Computer Vision Ground Crack & Scarp Classifier',
    fieldVisionSubtitle: 'Upload geo-tagged field photos to automatically detect tension cracks and rotational shear planes with Gemini 3.7 Vision.',
    uploadPhoto: 'Upload Field Inspection Image',
    dragDropPhoto: 'Drag & drop image here or browse filesystem',
    aiClassification: 'AI Structural Assessment',
    detectedHazard: 'Detected Geological Hazard',
    confidenceScore: 'Model Confidence',
    officialVerification: 'Official District Verification',
    verifiedOfficial: 'Verified by District Collector',
    pendingReview: 'Pending Official Review',

    roadsTitle: 'Strategic Hill Highway & Lifeline Road Corridors',
    roadsSubtitle: 'Real-time blockage monitoring, estimated clearing times, debris volumes and detour routing for Border Roads Organisation (BRO).',
    highwayStatusClear: 'Clear & Open',
    highwayStatusBlocked: 'Blocked by Landslide Debris',
    highwayStatusOneWay: 'Single Lane / Restricted Convoy',
    debrisVolume: 'Debris Volume',
    debrisAccumulation: 'Debris Accumulation',
    clearanceETA: 'Clearing ETA',
    estimatedClearance: 'Estimated Clearance',
    detourRoute: 'Alternate Bypass Route',
    responsibleAgency: 'Responsible BRO Task Force',

    eocTitle: 'Emergency Operations Center (EOC) Tactical Coordination',
    eocSubtitle: 'Urgency prioritization and multi-agency rescue dispatch ranked by mathematical risk and population exposure.',
    dispatchRank: 'Urgency Priority Rank',
    assignedUnit: 'Assigned Rescue Unit',
    teamLeader: 'Team Leader & Contact',
    personnelKit: 'Personnel & Equipment',
    estimatedArrival: 'Estimated Arrival (ETA)',
    statusDispatched: 'Dispatched',
    statusOnSiteRescue: 'On-Site Rescue',
    statusCompleted: 'Completed',
    updateTacticalStatus: 'Update Tactical Status',

    citizenPortalTitle: 'Community Landslide Early Warning & Evacuation Portal',
    citizenPortalSubtitle: 'Public civil protection handbook, emergency shelters, interactive safe route navigation, and direct audio alarms.',
    evacuationNotice: 'Civil Evacuation Notice & Safe Highland Corridors',
    sheltersHeading: 'Active Relief Shelters & Safe Evacuation Points',
    safeEvacuationRoutes: 'Safe Highland Evacuation Corridors',
    emergencyKitList: 'Emergency Survival Kit Checklist',
    whatToDoBefore: 'Before Landslide (Preparedness)',
    whatToDoDuring: 'During Landslide (Immediate Action)',
    whatToDoAfter: 'After Landslide (Recovery & Safety)',
    helplineDirectory: '24x7 State Emergency Hotlines',
    tollFreeHelpline: 'Toll-Free Control Room: 1070 / 112',
    soundDisasterSiren: 'Sound Public Siren Warning',

    forecastTitle: 'Doppler Radar Precipitation & Monsoon Forecast',
    forecastSubtitle: 'GPM satellite precipitation calibration with 72-hour antecedent rainfall buildup tracking.',
    satelliteTitle: 'Satellite SAR & Earth Observation Data Pipeline',
    satelliteSubtitle: 'Ingestion monitor for Sentinel-1 InSAR, Sentinel-2 Optical, and ISRO Bhuvan CartoDEM.',
    ingestionStatus: 'Ingestion Engine Status',
    latencyMs: 'Feed Latency',

    historicalTitle: 'Historical Landslide Archive & Geotechnical Thresholds',
    historicalSubtitle: 'Calibrated against 10+ years of North East India cloudburst and slope-failure records.',
    modelAccuracy: 'Model Accuracy (ROC-AUC)',
    reportsTitle: 'Automated Reports, PostGIS Architecture & Data Export',
    reportsSubtitle: 'Synthesize executive disaster bulletins using Gemini 3.7 Flash and export spatial GIS formats.',
    generateBulletin: 'Generate Executive Situation Bulletin',
    downloadCSV: 'Download CSV Dataset',
    postgisSchema: 'PostgreSQL / PostGIS DDL Schema',

    adminTitle: 'System Administration & Alert Trigger Calibration',
    adminSubtitle: 'Configure mathematical risk thresholds, manage multi-agency credentials, and monitor audit trails.',
    thresholdSettings: 'Early Warning Automated Trigger Thresholds',
    saveThresholds: 'Save Threshold Parameters',
    auditTrail: 'Immutable Security & Audit Trail'
  },

  hi: {
    appTitle: 'भूस्खलन प्रहरी एआई (LANDSLIDE SENTINEL AI)',
    appSubtitle: 'पूर्वोत्तर भारत के ८ राज्यों के लिए एआई-आधारित भूस्खलन पूर्व-चेतावनी एवं भू-स्थानिक जोखिम प्रबंधन प्रणाली',
    regionalTag: 'पूर्वोत्तर आपातकालीन संचालन केंद्र',
    stateSelectorLabel: 'राज्य चुनें',
    allStates: 'सभी ८ पूर्वोत्तर राज्य',
    roleSelectorLabel: 'उपयोगकर्ता भूमिका',
    audioAlertTitle: 'आपातकालीन सायरन चेतावनी',
    audioAlertMute: 'सायरन बंद करें',
    audioAlertUnmute: 'सायरन चालू करें',
    activeHazardsCount: 'सक्रिय खतरे',

    groupLiveIntelligence: 'सक्रिय खुफिया तंत्र',
    groupOperationsAI: 'अभियान एवं एआई',
    groupAnalyticsGovernance: 'विश्लेषण एवं शासन',
    toolNavigation: 'उपकरण नेविगेशन',
    onlineStatus: 'ऑनलाइन',
    modulesActive: '१३ एकीकृत आपदा निगरानी उपकरण सक्रिय',

    navCommandHub: 'कमांड हब',
    navGISMap: 'जीआईएस जोखिम मानचित्र',
    navStateDistrict: 'राज्य एवं जिले',
    navForecast: 'मौसम पूर्वानुमान',
    navPipeline: 'उपग्रह डेटा पाइपलाइन',
    navRoads: 'राजमार्ग जीवन रेखाएं',
    navFieldVision: 'फील्ड विजन एआई',
    navEmergency: 'आपातकालीन प्रतिक्रिया',
    navCitizen: 'नागरिक सुरक्षा पोर्टल',
    navHistorical: 'ऐतिहासिक विश्लेषण',
    navReports: 'रिपोर्ट एवं पोस्टजीआईएस',
    navAdmin: 'प्रशासन एवं सेटिंग्स',
    navHandbook: 'सुरक्षा नियमावली',

    critical: 'अति गंभीर',
    high: 'उच्च जोखिम',
    moderate: 'मध्यम',
    low: 'निम्न',
    normal: 'सामान्य',
    criticalEvacuate: 'अति गंभीर (तत्काल सुरक्षित स्थान पर जाएं)',
    highPrepare: 'उच्च जोखिम (स्थानांतरण की तैयारी करें)',
    moderateWatch: 'मध्यम (सतर्क रहें)',
    lowNormal: 'निम्न (सामान्य स्थिति)',

    simEngineTitle: 'रीयल-टाइम भू-तकनीकी एवं बादल फटने का भौतिकी सिम्युलेटर',
    simEngineDesc: '१४ भौतिक मापदंडों के आधार पर ढलान की शक्ति, छिद्र-जल दबाव और इनसार विरूपण गति की गणना करता है।',
    simAccelerated: 'त्वरित गति (१ मिनट = १ घंटा)',
    simRealtime: 'वास्तविक समय',
    simTriggerStorm: 'भीषण बादल फटने का तूफान प्रारंभ करें',
    simIngestPass: 'नया उपग्रह डेटा अभी प्राप्त करें',
    simReset: 'सिमुलेशन रीसेट करें',
    simNextUpdateIn: 'अगला उपग्रह डेटा अपडेट:',
    simPaused: 'सिमुलेशन रुका हुआ',
    simRunning: 'सिमुलेशन सक्रिय',
    simResume: 'सिमुलेशन जारी रखें',
    simPause: 'सिमुलेशन रोकें',

    activeAlertsCount: 'सक्रिय गंभीर अलर्ट',
    monitoredZones: 'निगरानी वाले क्षेत्र',
    criticalSectors: 'अति संवेदनशील रेड जोन',
    highRiskVillages: 'जोखिमग्रस्त बस्तियां',
    blockedRoads: 'अवरुद्ध पर्वतीय राजमार्ग',
    iotSensorsActive: 'सक्रिय आईओटी सेंसर',
    exposedPopulation: 'प्रभावित जनसंख्या',
    priorityDispatchTasks: 'प्राथमिकता बचाव कार्य',
    activeRedAlertsBanner: 'सक्रिय रेड अलर्ट एवं त्वरित ढलान भूस्खलन बुलेटिन',
    livePrecipitationRadar: 'लाइव डॉपलर रडार वर्षा एवं टेलीमेट्री',
    riskFactorCurve: 'वर्षा संतृप्ति एवं मिट्टी विरूपण वक्र',
    prioritySlopeSectors: 'उच्च जोखिम वाले ढलान क्षेत्र',
    viewGISMapBtn: 'जीआईएस नक्शा खोलें',
    openEvacuationBtn: 'निकासी मार्ग देखें',
    downloadReportBtn: 'रिपोर्ट निर्यात करें',
    submitFieldReportBtn: 'फील्ड रिपोर्ट भेजें',
    testSirenBtn: 'सायरन परीक्षण करें',

    colZone: 'जोन कोड एवं नाम',
    colLocation: 'राज्य एवं जिला',
    colRain72h: '७२ घंटे की वर्षा (मिमी)',
    colSlope: 'ढलान कोण',
    colPorePressure: 'छिद्र-जल दबाव',
    colSafetyFactor: 'सुरक्षा गुणांक (FS)',
    colRiskScore: 'जोखिम सूचकांक',
    colStatus: 'खतरा स्तर',
    colActions: 'कार्रवाई',
    inspectZone: 'जांचें',

    mapLayers: 'मानचित्र परत नियंत्रण',
    layerHeatmap: 'जोखिम हीटमैप परत',
    layerInSAR: 'इनसार भू-गति वेग',
    layerRadar: 'आईएमडी डॉपलर रडार वर्षा',
    layerSensors: 'आईओटी टेलीमेट्री सेंसर',
    layerRoads: 'राष्ट्रीय पर्वतीय राजमार्ग',
    layer3DContours: 'कार्टोडेम ३डी स्थलाकृतिक समोच्च रेखाएं',
    inspectorTitle: 'भू-तकनीकी ढलान विश्लेषक',
    factorSafetyFS: 'सुरक्षा गुणांक (FS)',
    inSARDeformation: 'भू-खिसकाव गति',
    saturationLevel: 'मृदा संतृप्ति प्रतिशत',
    evacuationRoutes: 'सुरक्षित निकासी मार्ग',
    nearestShelter: 'निकटतम राहत आश्रय',
    closeInspector: 'बंद करें',

    fieldVisionTitle: 'कंप्यूटर विजन भू-दरार एवं भूस्खलन क्लासिफायर',
    fieldVisionSubtitle: 'जेमिनी ३.७ विजन द्वारा ढलान की दरारों और संरचनात्मक खतरों का तुरंत विश्लेषण करने हेतु फोटो अपलोड करें।',
    uploadPhoto: 'फील्ड निरीक्षण फोटो अपलोड करें',
    dragDropPhoto: 'फोटो यहाँ खींचे या फाइल चुनें',
    aiClassification: 'एआई संरचनात्मक मूल्यांकन',
    detectedHazard: 'पहचाना गया भूवैज्ञानिक खतरा',
    confidenceScore: 'मॉडल सटीकता विश्वास',
    officialVerification: 'जिला प्रशासन प्रमाणीकरण',
    verifiedOfficial: 'जिला कलेक्टर द्वारा सत्यापित',
    pendingReview: 'समीक्षा हेतु लंबित',

    roadsTitle: 'रणनीतिक पर्वतीय राजमार्ग एवं जीवन रेखा गलियारे',
    roadsSubtitle: 'सीमा सड़क संगठन (बीआरओ) हेतु वास्तविक समय रुकावट निगरानी, मलबा हटाने का समय और वैकल्पिक मार्ग।',
    highwayStatusClear: 'खुला एवं सुरक्षित',
    highwayStatusBlocked: 'मलबे से पूर्णतः अवरुद्ध',
    highwayStatusOneWay: 'एकतरफा / सीमित आवागमन',
    debrisVolume: 'मलबे की मात्रा',
    debrisAccumulation: 'मलबा संचय',
    clearanceETA: 'सफाई का अनुमानित समय',
    estimatedClearance: 'अनुमानित निकासी समय',
    detourRoute: 'वैकल्पिक बाईपास मार्ग',
    responsibleAgency: 'प्रभारी बीआरओ टास्क फोर्स',

    eocTitle: 'आपातकालीन संचालन केंद्र (EOC) सामरिक समन्वय',
    eocSubtitle: 'गणितीय जोखिम एवं जनसंख्या घनत्व के आधार पर बहु-एजेंसी बचाव कार्य आवंटन।',
    dispatchRank: 'प्राथमिकता रैंक',
    assignedUnit: 'तैनात बचाव दल',
    teamLeader: 'टीम लीडर एवं संपर्क',
    personnelKit: 'कार्मिक एवं उपकरण',
    estimatedArrival: 'पहुंचने का अनुमानित समय (ETA)',
    statusDispatched: 'रवाना किया गया',
    statusOnSiteRescue: 'घटनास्थल पर बचाव कार्य जारी',
    statusCompleted: 'सफलतापूर्वक संपन्न',
    updateTacticalStatus: 'स्थिति अपडेट करें',

    citizenPortalTitle: 'नागरिक भूस्खलन पूर्व चेतावनी एवं निकासी पोर्टल',
    citizenPortalSubtitle: 'सार्वजनिक नागरिक सुरक्षा नियमावली, आपातकालीन आश्रय, सुरक्षित मार्ग नेविगेशन और सायरन अलार्म।',
    evacuationNotice: 'नागरिक निकासी सूचना एवं सुरक्षित ऊंचाई वाले गलियारे',
    sheltersHeading: 'सक्रिय राहत शिविर एवं सुरक्षित निकासी केंद्र',
    safeEvacuationRoutes: 'सुरक्षित ऊंचे निकासी मार्ग',
    emergencyKitList: 'आपातकालीन जीवन-रक्षक किट सूची',
    whatToDoBefore: 'भूस्खलन से पहले (पूर्व तैयारी)',
    whatToDoDuring: 'भूस्खलन के दौरान (तत्काल कदम)',
    whatToDoAfter: 'भूस्खलन के बाद (सुरक्षा एवं रिकवरी)',
    helplineDirectory: '२४x७ राज्य आपातकालीन हेल्पलाइन',
    tollFreeHelpline: 'टोल-फ्री नियंत्रण कक्ष: १०७० / ११२',
    soundDisasterSiren: 'सार्वजनिक सायरन बजाएं',

    forecastTitle: 'डॉपलर रडार वर्षा एवं मानसून पूर्वानुमान',
    forecastSubtitle: 'जीपीएम उपग्रह वर्षा अंशांकन और ७२ घंटे की संचयी वर्षा निगरानी।',
    satelliteTitle: 'उपग्रह सार (SAR) एवं पृथ्वी अवलोकन डेटा पाइपलाइन',
    satelliteSubtitle: 'सेंटिनल-१ इनसार, सेंटिनल-२ ऑप्टिकल एवं इसरो भुवन कार्टोडेम डेटा मॉनिटर।',
    ingestionStatus: 'डेटा पाइपलाइन स्थिति',
    latencyMs: 'डेटा विलंबता',

    historicalTitle: 'ऐतिहासिक भूस्खलन डेटाबेस एवं भू-तकनीकी सीमाएं',
    historicalSubtitle: 'पूर्वोत्तर भारत के १०+ वर्षों के बादल फटने एवं ढलान विफलता रिकॉर्ड द्वारा अंशांकित।',
    modelAccuracy: 'मॉडल सटीकता (ROC-AUC)',
    reportsTitle: 'स्वचालित रिपोर्ट, पोस्टजीआईएस संरचना एवं डेटा निर्यात',
    reportsSubtitle: 'जेमिनी ३.७ फ्लैश द्वारा कार्यकारी आपदा बुलेटिन बनाएं और स्थानिक डेटा डाउनलोड करें।',
    generateBulletin: 'कार्यकारी स्थिति बुलेटिन तैयार करें',
    downloadCSV: 'सीएसवी डेटा डाउनलोड करें',
    postgisSchema: 'पोस्टग्रेएसक्यूएल / पोस्टजीआईएस डीडीएल स्कीमा',

    adminTitle: 'सिस्टम प्रशासन एवं चेतावनी सीमा अंशांकन',
    adminSubtitle: 'जोखिम सीमाएं कॉन्फ़िगर करें, बहु-एजेंसी क्रेडेंशियल्स प्रबंधित करें और सुरक्षा लॉग देखें।',
    thresholdSettings: 'स्वचालित पूर्व चेतावनी सीमा सेटिंग्स',
    saveThresholds: 'सीमा मापदंड सहेजें',
    auditTrail: 'सुरक्षा ऑडिट ट्रेल'
  },

  as: {
    appTitle: 'ভূমিস্খলন প্ৰহৰী এআই (LANDSLIDE SENTINEL AI)',
    appSubtitle: 'উত্তৰ-পূব ভাৰতৰ ৮ খন ৰাজ্যৰ বাবে এআই-চালিত ভূমিস্খলন পূৰ্ব-সতৰ্কবাণী আৰু জিআইএছ দুৰ্যোগ ব্যৱস্থাপনা',
    regionalTag: 'উত্তৰ-পূব জৰুৰীকালীন কাৰ্যালয়',
    stateSelectorLabel: 'ৰাজ্য বাছনি কৰক',
    allStates: 'সকলো ৮ খন উত্তৰ-পূব ৰাজ্য',
    roleSelectorLabel: 'ব্যৱহাৰকাৰী ভূমিকা',
    audioAlertTitle: 'জৰুৰীকালীন চাইৰেন সতৰ্কবাণী',
    audioAlertMute: 'চাইৰেন বন্ধ কৰক',
    audioAlertUnmute: 'চাইৰেন আৰম্ভ কৰক',
    activeHazardsCount: 'সক্ৰিয় বিপদসমূহ',

    groupLiveIntelligence: 'সক্ৰিয় চোৰাংচোৱা তথ্য',
    groupOperationsAI: 'অভিযান আৰু এআই',
    groupAnalyticsGovernance: 'বিশ্লেষণ আৰু প্ৰশাসন',
    toolNavigation: 'টুল নেভিগেচন',
    onlineStatus: 'অনলাইন',
    modulesActive: '১৩ টা সংহত দুৰ্যোগ নিৰীক্ষণ সঁজুলি সক্ৰিয়',

    navCommandHub: 'কমাণ্ড হাব',
    navGISMap: 'জিআইএছ মানচিত্ৰ',
    navStateDistrict: 'ৰাজ্য আৰু জিলাসমূহ',
    navForecast: 'বতৰৰ পূৰ্বাভাস',
    navPipeline: 'উপগ্ৰহ ডেটা পাইপলাইন',
    navRoads: 'ৰাজপথৰ যোগাযোগ',
    navFieldVision: 'ফিল্ড ভিজন এআই',
    navEmergency: 'জৰুৰীকালীন সঁহাৰি',
    navCitizen: 'নাগৰিক সুৰক্ষা প’ৰ্টেল',
    navHistorical: 'ঐতিহাসিক তথ্য বিশ্লেষণ',
    navReports: 'প্ৰতিবেদন আৰু পষ্টজিআইএছ',
    navAdmin: 'প্ৰশাসন আৰু ছেটিংছ',
    navHandbook: 'সুৰক্ষা নিয়মাবলী',

    critical: 'চৰম সংকটজনক',
    high: 'উচ্চ বিপদাপন্ন',
    moderate: 'মধ্যমীয়া',
    low: 'নিম্ন',
    normal: 'স্বাভাৱিক',
    criticalEvacuate: 'চৰম সংকটজনক (অবিলম্বে সুৰক্ষিত স্থানলৈ যাওক)',
    highPrepare: 'উচ্চ বিপদাপন্ন (স্থানান্তৰৰ বাবে সাজু হওক)',
    moderateWatch: 'মধ্যমীয়া (সতৰ্ক থাকক)',
    lowNormal: 'নিম্ন (স্বাভাৱিক অৱস্থা)',

    simEngineTitle: 'ৰিয়েল-টাইম ভূ-কাৰিকৰী আৰু ডাৱৰ বিস্ফোৰণ চিমুলেটৰ',
    simEngineDesc: '১৪ টা ভৌতিক মাপকাঠীৰ আধাৰত পাহাৰীয়া ঢালৰ শক্তি, মাটিৰ জল-চাপ আৰু ইনছাৰ গতি গণনা কৰে।',
    simAccelerated: 'দ্ৰুত অৱস্থা (১ মিনিট = ১ ঘণ্টা)',
    simRealtime: 'প্ৰকৃত সময়',
    simTriggerStorm: 'ভয়ংকৰ ডাৱৰ বিস্ফোৰণ ধুমুহা আৰম্ভ কৰক',
    simIngestPass: 'নতুন উপগ্ৰহ ডেটা এতিয়াই সংগ্ৰহ কৰক',
    simReset: 'চিমুলেচন পুনৰ সংস্থাপন কৰক',
    simNextUpdateIn: 'পৰৱৰ্তী উপগ্ৰহ ডেটা সংগ্ৰহ:',
    simPaused: 'চিমুলেচন স্থগিত',
    simRunning: 'চিমুলেচন চলি আছে',
    simResume: 'চিমুলেচন আৰম্ভ কৰক',
    simPause: 'চিমুলেচন ৰখাওক',

    activeAlertsCount: 'সক্ৰিয় চৰম সতৰ্কবাণী',
    monitoredZones: 'নিৰীক্ষণাধীন অঞ্চল',
    criticalSectors: 'সংকটজনক ৰেড জ’ন',
    highRiskVillages: 'বিপদাপন্ন গাঁওসমূহ',
    blockedRoads: 'অৱৰুদ্ধ পাহাৰীয়া ৰাজপথ',
    iotSensorsActive: 'সক্ৰিয় আইঅ’টি সংবেদক',
    exposedPopulation: 'প্ৰভাৱিত জনসংখ্যা',
    priorityDispatchTasks: 'উদ্ধাৰকাৰ্যৰ দায়িত্ব',
    activeRedAlertsBanner: 'সক্ৰিয় ৰেড এলাৰ্ট আৰু তাৎক্ষণিক ভূমিস্খলন বুলেটিন',
    livePrecipitationRadar: 'লাইভ ডপলাৰ ৰাডাৰ বৰষুণ আৰু টেলিমেট্ৰি',
    riskFactorCurve: 'বৰষুণৰ পৰিমাণ আৰু মাটিৰ বিকৃতি ৰেখাচিত্র',
    prioritySlopeSectors: 'উচ্চ বিপদাপন্ন পাহাৰীয়া ঢাল অঞ্চল',
    viewGISMapBtn: 'জিআইএছ মানচিত্ৰ খোলক',
    openEvacuationBtn: 'স্থানান্তৰ পথ চাওক',
    downloadReportBtn: 'প্ৰতিবেদন ডাউনলোড',
    submitFieldReportBtn: 'তথ্য প্ৰেৰণ কৰক',
    testSirenBtn: 'চাইৰেন পৰীক্ষা কৰক',

    colZone: 'জ’ন ক’ড আৰু নাম',
    colLocation: 'ৰাজ্য আৰু জিলা',
    colRain72h: '৭২ ঘণ্টাৰ বৰষুণ (মিমি)',
    colSlope: 'ঢালৰ কোণ',
    colPorePressure: 'জল-চাপ',
    colSafetyFactor: 'সুৰক্ষা গুণাংক (FS)',
    colRiskScore: 'বিপদ সূচক',
    colStatus: 'বিপদৰ স্তৰ',
    colActions: 'পদক্ষেপ',
    inspectZone: 'পৰীক্ষা কৰক',

    mapLayers: 'মানচিত্ৰ স্তৰ নিয়ন্ত্ৰণ',
    layerHeatmap: 'বিপদৰ হিটমেপ স্তৰ',
    layerInSAR: 'ইনছাৰ মাটিৰ খহনীয়া গতি',
    layerRadar: 'আইএমডি ডপলাৰ ৰাডাৰ বৰষুণ',
    layerSensors: 'আইঅ’টি সংবেদকসমূহ',
    layerRoads: 'ৰাষ্ট্ৰীয় পাহাৰীয়া ঘাইপথ',
    layer3DContours: 'কাৰ্ট’ডেম ৩ডি সমোচ্চ ৰেখা',
    inspectorTitle: 'পাহাৰীয়া ঢাল পৰিদৰ্শক',
    factorSafetyFS: 'সুৰক্ষা গুণাংক (FS)',
    inSARDeformation: 'মাটি খহাৰ গতি',
    saturationLevel: 'মাটিৰ জল-আৰ্দ্ৰতা',
    evacuationRoutes: 'সুৰক্ষিত স্থানান্তৰ পথ',
    nearestShelter: 'নিকটতম সাহায্য শিবিৰ',
    closeInspector: 'বন্ধ কৰক',

    fieldVisionTitle: 'কম্পিউটাৰ ভিজন মাটিৰ ফাট আৰু স্খলন শ্ৰেণীবিভাজক',
    fieldVisionSubtitle: 'জেকিনি ৩.৭ ভিজনৰ জৰিয়তে পাহাৰীয়া ফাট আৰু বিপদসমূহ চিনাক্ত কৰিবলৈ ফটো আপলোড কৰক।',
    uploadPhoto: 'পৰিদৰ্শন ফটো আপলোড কৰক',
    dragDropPhoto: 'ফটো ইয়ালৈ টানি আনক বা বাছক',
    aiClassification: 'এআই ভূ-গাঠনিক মূল্যাংকন',
    detectedHazard: 'চিনাক্ত হোৱা ভূ-তাত্বিক বিপদ',
    confidenceScore: 'মডেলৰ সঠিকতাৰ মাত্ৰা',
    officialVerification: 'জিলা প্ৰশাসনৰ অনুমোদন',
    verifiedOfficial: 'জিলা আয়ুক্তই অনুমোদন জনোৱা',
    pendingReview: 'অনুমোদনৰ অপেক্ষাত',

    roadsTitle: 'কৌশলগত পাহাৰীয়া ঘাইপথ আৰু জীৱনৰেখা যোগাযোগ',
    roadsSubtitle: 'সীমান্ত পথ সংস্থা (বিআৰঅ’)ৰ বাবে ৰিয়েল-টাইম পথ অৱৰোধ নিৰীক্ষণ, আৱৰ্জনা নিষ্কাষণৰ সময় আৰু বিকল্প পথ।',
    highwayStatusClear: 'খোলা আৰু সুৰক্ষিত',
    highwayStatusBlocked: 'ভূমিস্খলনৰ বাবে বন্ধ',
    highwayStatusOneWay: 'একমুখী / নিয়ন্ত্ৰিত যান-বাহন',
    debrisVolume: 'আৱৰ্জনাৰ পৰিমাণ',
    debrisAccumulation: 'ধ্বংসাৱশেষ জমা হোৱা',
    clearanceETA: 'পথ মুকলিৰ আনুমানিক সময়',
    estimatedClearance: 'আনুমানিক পৰিষ্কাৰ সময়',
    detourRoute: 'বিকল্প পথ',
    responsibleAgency: 'দায়িত্বপ্রাপ্ত বিআৰঅ’ দল',

    eocTitle: 'জৰুৰীকালীন কাৰ্যালয় (EOC) সমন্বয় কক্ষ',
    eocSubtitle: 'গাণিতিক বিপদ আৰু জনসংখ্যাৰ ভিত্তিত উদ্ধাৰকাৰী দল প্ৰেৰণ।',
    dispatchRank: 'প্ৰাথমিকতা স্থিতি',
    assignedUnit: 'নিয়োজিত উদ্ধাৰকাৰী দল',
    teamLeader: 'দলৰ নেতা আৰু ফোন নম্বৰ',
    personnelKit: 'কৰ্মী আৰু সঁজুলি',
    estimatedArrival: 'উপস্থিতিৰ আনুমানিক সময় (ETA)',
    statusDispatched: 'প্ৰেৰণ কৰা হ’ল',
    statusOnSiteRescue: 'ঘটনাস্থলীত উদ্ধাৰ অভিযান',
    statusCompleted: 'সম্পূৰ্ণ হ’ল',
    updateTacticalStatus: 'স্থিতি আপডেট কৰক',

    citizenPortalTitle: 'ৰাজহুৱা ভূমিস্খলন পূৰ্ব-সতৰ্কতা আৰু স্থানান্তৰ প’ৰ্টেল',
    citizenPortalSubtitle: 'ৰাজহুৱা সুৰক্ষা নিৰ্দেশনা, আশ্ৰয় শিবিৰ, সুৰক্ষিত পথ আৰু সতৰ্কতামূলক চাইৰেন।',
    evacuationNotice: 'নাগৰিক স্থানান্তৰণ জাননী আৰু সুৰক্ষিত ওখ ঠাইৰ পথ',
    sheltersHeading: 'সক্ৰিয় সাহায্য শিবিৰ আৰু সুৰক্ষিত আশ্ৰয়স্থল',
    safeEvacuationRoutes: 'সুৰক্ষিত উচ্চ স্থানান্তৰ পথ',
    emergencyKitList: 'জৰুৰীকালীন প্ৰয়োজনীয় সামগ্ৰীৰ তালিকা',
    whatToDoBefore: 'ভূমিস্খলনৰ পূৰ্বে (পূৰ্ব প্ৰস্তুতি)',
    whatToDoDuring: 'ভূমিস্খলনৰ সময়ত (তাৎক্ষণিক পদক্ষেপ)',
    whatToDoAfter: 'ভূমিস্খলনৰ পিছত (পুনৰুদ্ধাৰ আৰু সুৰক্ষা)',
    helplineDirectory: '২৪x৭ ৰাজ্যিক জৰুৰীকালীন হেল্পলাইন',
    tollFreeHelpline: 'টোল-ফ্ৰী নিয়ন্ত্ৰণ কক্ষ: ১০৭০ / ১১২',
    soundDisasterSiren: 'ৰাজহুৱা চাইৰেন বজাওক',

    forecastTitle: 'ডপলাৰ ৰাডাৰ বৰষুণ আৰু মৌচুমী পূৰ্বাভাস',
    forecastSubtitle: 'উপগ্ৰহীয় বৃষ্টিপাত আৰু ৭২ ঘণ্টাৰ সংগৃহীত বৰষুণৰ নিৰীক্ষণ।',
    satelliteTitle: 'উপগ্ৰহ ছাৰ (SAR) আৰু পৃথিৱী নিৰীক্ষণ ডেটা পাইপলাইন',
    satelliteSubtitle: 'চেন্টিনেল-১ ইনছাৰ আৰু ইছৰো ভুৱন কাৰ্ট’ডেম তথ্য নিৰীক্ষণ।',
    ingestionStatus: 'ডেটা সংগ্ৰহৰ অৱস্থা',
    latencyMs: 'ডেটা বিলম্বতা',

    historicalTitle: 'ঐতিহাসিক ভূমিস্খলন তথ্যভঁৰাল আৰু ভূ-কাৰিকৰী সীমা',
    historicalSubtitle: 'উত্তৰ-পূব ভাৰতৰ ১০+ বছৰৰ ডাৱৰ বিস্ফোৰণ আৰু ভূমিস্খলন তথ্যৰ আধাৰত প্ৰস্তুত।',
    modelAccuracy: 'মডেল সঠিকতা (ROC-AUC)',
    reportsTitle: 'স্বয়ংক্ৰিয় প্ৰতিবেদন আৰু ডেটা ডাউনল’ড',
    reportsSubtitle: 'জেমিনি ৩.৭ ফ্লেছ ব্যৱহাৰ কৰি কাৰ্যবাহী দুৰ্যোগ বুলেটিন প্ৰস্তুত কৰক আৰু স্থানভিত্তিক ডেটা সংগ্ৰহ কৰক।',
    generateBulletin: 'কাৰ্যবাহী স্থিতি বুলেটিন প্ৰস্তুত কৰক',
    downloadCSV: 'চিএছভি ডেটা ডাউনল’ড কৰক',
    postgisSchema: 'পষ্টজিআইএছ ডিডিএল স্কীমা',

    adminTitle: 'প্ৰশাসন আৰু সতৰ্কবাণী সীমা নিৰ্ধাৰণ',
    adminSubtitle: 'বিপদৰ সীমা কনফিগাৰ কৰক, সুৰক্ষা লগ পৰীক্ষা কৰক।',
    thresholdSettings: 'স্বয়ংক্ৰিয় পূৰ্ব-সতৰ্কবাণীৰ সীমা নিৰ্ধাৰণ',
    saveThresholds: 'পৰিমাপ সংৰক্ষণ কৰক',
    auditTrail: 'সুৰক্ষা অডিট ট্ৰেইল'
  },

  bn: {
    appTitle: 'ভূমিধস সেন্টিনেল এআই (LANDSLIDE SENTINEL AI)',
    appSubtitle: 'উত্তর-পূর্ব ভারতের ৮টি রাজ্যের কৃত্রিম বুদ্ধিমত্তা চালিত ভূমিধস আগাম সতর্কবার্তা ও জিআইএস দুর্যোগ ব্যবস্থাপনা',
    regionalTag: 'উত্তর-পূর্ব জরুরি অপারেশন কেন্দ্র',
    stateSelectorLabel: 'রাজ্য নির্বাচন করুন',
    allStates: 'সকল ৮টি উত্তর-পূর্ব রাজ্য',
    roleSelectorLabel: 'ব্যবহারকারী ভূমিকা',
    audioAlertTitle: 'জরুরী সাইরেন সতর্কতা',
    audioAlertMute: 'সাইরেন মিউট করুন',
    audioAlertUnmute: 'সাইরেন চালু করুন',
    activeHazardsCount: 'সক্রিয় বিপদ',

    groupLiveIntelligence: 'সক্রিয় গোয়েন্দা তথ্য',
    groupOperationsAI: 'অপারেশন ও এআই',
    groupAnalyticsGovernance: 'বিশ্লেষণ ও প্রশাসন',
    toolNavigation: 'টুল নেভিগেশন',
    onlineStatus: 'অনলাইন',
    modulesActive: '১৩টি সমন্বিত দুর্যোগ পর্যবেক্ষণ সরঞ্জাম সক্রিয়',

    navCommandHub: 'কমান্ড হাব',
    navGISMap: 'জিআইএস ঝুঁকি মানচিত্র',
    navStateDistrict: 'রাজ্য ও জেলাসমূহ',
    navForecast: 'আবহাওয়া পূর্বাভাস',
    navPipeline: 'স্যাটেলাইট ডেটা পাইপলাইন',
    navRoads: 'মহাসড়ক যোগাযোগ',
    navFieldVision: 'ফিল্ড ভিশন এআই',
    navEmergency: 'জরুরী প্রতিক্রিয়া',
    navCitizen: 'নাগরিক সুরক্ষা পোর্টাল',
    navHistorical: 'ঐতিহাসিক বিশ্লেষণ',
    navReports: 'রিপোর্ট ও পোস্টজিআইএস',
    navAdmin: 'প্রশাসন ও সেটিংস',
    navHandbook: 'সুরক্ষা নির্দেশিকা',

    critical: 'চরম ঝুঁকি',
    high: 'উচ্চ ঝুঁকি',
    moderate: 'মাঝারি',
    low: 'নিম্ন',
    normal: 'স্বাভাবিক',
    criticalEvacuate: 'চরম ঝুঁকি (অবিলম্বে নিরাপদে সরে যান)',
    highPrepare: 'উচ্চ ঝুঁকি (স্থানান্তরের জন্য প্রস্তুত হন)',
    moderateWatch: 'মাঝারি (সতর্ক থাকুন)',
    lowNormal: 'নিম্ন (স্বাভাবিক অবস্থা)',

    simEngineTitle: 'রিয়েল-টাইম ভূ-প্রকৌশল ও মেঘভাঙা বৃষ্টির পদার্থবিদ্যা সিমুলেটর',
    simEngineDesc: '১৪টি ভৌতিক প্যারামিটারের ভিত্তিতে ঢালের শক্তি, মাটির ছিদ্র-জল চাপ ও ইনসার গতি পরিমাপ করে।',
    simAccelerated: 'দ্রুত মোড (১ মিনিট = ১ ঘণ্টা)',
    simRealtime: 'রিয়েল টাইম ঘড়ি',
    simTriggerStorm: 'ভয়াবহ মেঘভাঙা ঝড় শুরু করুন',
    simIngestPass: 'নতুন স্যাটেলাইট ডেটা সংগ্রহ করুন',
    simReset: 'সিমুলেশন রিসেট করুন',
    simNextUpdateIn: 'পরবর্তী স্যাটেলাইট আপডেট:',
    simPaused: 'সিমুলেশন স্থগিত',
    simRunning: 'সিমুলেশন চলছে',
    simResume: 'সিমুলেশন শুরু করুন',
    simPause: 'সিমুলেশন থামান',

    activeAlertsCount: 'সক্রিয় চরম সতর্কতা',
    monitoredZones: 'নজরদারিকৃত অঞ্চলসমূহ',
    criticalSectors: 'সংকটজনক রেড জোন',
    highRiskVillages: 'ঝুঁকিপূর্ণ গ্রামসমূহ',
    blockedRoads: 'অবরুদ্ধ পাহাড়ি মহাসড়ক',
    iotSensorsActive: 'সক্রিয় আইওটি সেন্সর',
    exposedPopulation: 'ঝুঁকির মুখে জনসংখ্যা',
    priorityDispatchTasks: 'উদ্ধার অভিযান দায়িত্ব',
    activeRedAlertsBanner: 'সক্রিয় রেড অ্যালার্ট ও তাৎক্ষণিক ভূমিধস বুলেটিন',
    livePrecipitationRadar: 'লাইভ ডপলার রাডার বৃষ্টিপাত ও টেলিমেট্রি',
    riskFactorCurve: 'বৃষ্টিপাত স্যাচুরেশন ও মাটির বিকৃতি গ্রাফ',
    prioritySlopeSectors: 'উচ্চ ঝুঁকিপূর্ণ পাহাড়ি ঢাল এলাকা',
    viewGISMapBtn: 'জিআইএস ম্যাপ খুলুন',
    openEvacuationBtn: 'উদ্ধার রুট দেখুন',
    downloadReportBtn: 'রিপোর্ট ডাউনলোড',
    submitFieldReportBtn: 'মাঠের রিপোর্ট জমা দিন',
    testSirenBtn: 'সাইরেন পরীক্ষা করুন',

    colZone: 'জোন কোড ও নাম',
    colLocation: 'রাজ্য ও জেলা',
    colRain72h: '৭২ ঘণ্টার বৃষ্টি (মিমি)',
    colSlope: 'ঢালের কোণ',
    colPorePressure: 'জল-চাপ',
    colSafetyFactor: 'নিরাপত্তা গুণাঙ্ক (FS)',
    colRiskScore: 'ঝুঁকি সূচক',
    colStatus: 'ঝুঁকির স্তর',
    colActions: 'পদক্ষেপ',
    inspectZone: 'পরীক্ষা করুন',

    mapLayers: 'মানচিত্র লেয়ার নিয়ন্ত্রণ',
    layerHeatmap: 'ঝুঁকি হিটম্যাপ লেয়ার',
    layerInSAR: 'ইনসার মাটির গতিবেগ',
    layerRadar: 'আইএমডি ডপলার রাডার বৃষ্টিপাত',
    layerSensors: 'আইওটি সেন্সরসমূহ',
    layerRoads: 'জাতীয় পাহাড়ি মহাসড়ক',
    layer3DContours: 'কার্টোডেম ৩ডি সমোচ্চ রেখা',
    inspectorTitle: 'পাহাড়ি ঢাল পরিদর্শক',
    factorSafetyFS: 'নিরাপত্তা গুণাঙ্ক (FS)',
    inSARDeformation: 'মাটি ধসের গতি',
    saturationLevel: 'মাটির আর্দ্রতা সম্পৃক্তি',
    evacuationRoutes: 'নিরাপদ স্থানান্তর রুট',
    nearestShelter: 'নিকটতম ত্রাণ শিবির',
    closeInspector: 'বন্ধ করুন',

    fieldVisionTitle: 'কম্পিউটার ভিশন মাটির ফাটল ও ভূমিধস বিশ্লেষক',
    fieldVisionSubtitle: 'জেমিনি ৩.৭ ভিশন দ্বারা পাহাড়ি ফাটল এবং ভূতাত্ত্বিক ঝুঁকি স্বয়ংক্রিয়ভাবে শনাক্ত করতে ছবি আপলোড করুন।',
    uploadPhoto: 'পরিদর্শন ছবি আপলোড করুন',
    dragDropPhoto: 'ছবি এখানে টানুন বা ফাইল নির্বাচন করুন',
    aiClassification: 'এআই ভূ-গাঠনিক মূল্যায়ন',
    detectedHazard: 'শনাক্তকৃত ভূতাত্ত্বিক ঝুঁকি',
    confidenceScore: 'মডেল আত্মবিশ্বাস',
    officialVerification: 'জেলা প্রশাসনের অনুমোদন',
    verifiedOfficial: 'জেলা প্রশাসক কর্তৃক অনুমোদিত',
    pendingReview: 'পর্যালোচনার অপেক্ষায়',

    roadsTitle: 'কৌশলগত পাহাড়ি মহাসড়ক ও জীবনরেখা যোগাযোগ',
    roadsSubtitle: 'বর্ডার রোডস অর্গানাইজেশন (বিআরও)-এর জন্য রিয়েল-টাইম সড়ক অবরোধ পর্যবেক্ষণ, ধ্বংসাবশেষ অপসারণ ও বিকল্প রুট।',
    highwayStatusClear: 'উন্মুক্ত ও নিরাপদ',
    highwayStatusBlocked: 'ভূমিধসের ধ্বংসাবশেষে অবরুদ্ধ',
    highwayStatusOneWay: 'একমুখী / নিয়ন্ত্রিত চলাচল',
    debrisVolume: 'ধ্বংসাবশেষের পরিমাণ',
    debrisAccumulation: 'ধ্বংসস্তূপ জমা',
    clearanceETA: 'রাস্তা পরিষ্কারের আনুমানিক সময়',
    estimatedClearance: 'সম্ভাব্য অপসারণ সময়',
    detourRoute: 'বিকল্প বাইপাস রুট',
    responsibleAgency: 'দায়িত্বপ্রাপ্ত বিআরও টাস্ক ফোর্স',

    eocTitle: 'জরুরী অপারেশন কেন্দ্র (EOC) কৌশলগত সমন্বয়',
    eocSubtitle: 'গাণিতিক ঝুঁকি ও জনসংখ্যার ভিত্তিতে উদ্ধারকারী দল মোতায়েন।',
    dispatchRank: 'অগ্রাধিকার পদমর্যাদা',
    assignedUnit: 'নিয়োজিত উদ্ধারকারী দল',
    teamLeader: 'দলনেতা ও যোগাযোগ',
    personnelKit: 'কর্মী ও সরঞ্জাম',
    estimatedArrival: 'পৌঁছানোর আনুমানিক সময় (ETA)',
    statusDispatched: 'রওয়ানা হয়েছে',
    statusOnSiteRescue: 'ঘটনাস্থলে উদ্ধার অভিযান চলছে',
    statusCompleted: 'সম্পূর্ণ হয়েছে',
    updateTacticalStatus: 'অবস্থা আপডেট করুন',

    citizenPortalTitle: 'জনসাধারণের ভূমিধস পূর্ব সতর্কতা ও স্থানান্তর পোর্টাল',
    citizenPortalSubtitle: 'নাগরিক সুরক্ষা পুস্তিকা, জরুরী আশ্রয়কেন্দ্র, নিরাপদ পথ নেভিগেশন এবং সরাসরি সাইরেন অ্যালার্ম।',
    evacuationNotice: 'নাগরিক স্থানান্তর বিজ্ঞপ্তি ও নিরাপদ উঁচু স্থান',
    sheltersHeading: 'সক্রিয় ত্রাণ শিবির ও নিরাপদ স্থানান্তর পয়েন্ট',
    safeEvacuationRoutes: 'নিরাপদ উঁচু স্থানান্তর রুট',
    emergencyKitList: 'জরুরী বেঁচে থাকার কিট তালিকা',
    whatToDoBefore: 'ভূমিধসের পূর্বে (পূর্ব প্রস্তুতি)',
    whatToDoDuring: 'ভূমিধসের সময় (তাৎক্ষণিক করণীয়)',
    whatToDoAfter: 'ভূমিধসের পরে (পুনরুদ্ধার ও নিরাপত্তা)',
    helplineDirectory: '২৪x৭ রাজ্য জরুরি হেল্পলাইন',
    tollFreeHelpline: 'টোল-ফ্রি নিয়ন্ত্রণ কক্ষ: ১০৭০ / ১১২',
    soundDisasterSiren: 'পাবলিক সাইরেন বাজান',

    forecastTitle: 'ডপলার রাডার বৃষ্টিপাত ও বর্ষা পূর্বাভাস',
    forecastSubtitle: 'উপগ্রহ বৃষ্টিপাত ক্রমাঙ্কন এবং ৭২ ঘণ্টার বৃষ্টিপাত পর্যবেক্ষণ।',
    satelliteTitle: 'স্যাটেলাইট সার (SAR) ও আর্থ অবজারভেশন ডেটা পাইপলাইন',
    satelliteSubtitle: 'সেন্টিনেল-১ ইনসার এবং ইসরো ভুবন কার্টোডেম ডেটা মনিটর।',
    ingestionStatus: 'ডেটা সংগ্রহের অবস্থা',
    latencyMs: 'ডেটা বিলম্বতা',

    historicalTitle: 'ঐতিহাসিক ভূমিধস আর্কাইভ ও ভূ-প্রকৌশল সীমা',
    historicalSubtitle: 'উত্তর-পূর্ব ভারতের ১০+ বছরের মেঘভাঙা বৃষ্টি ও ভূমিধস তথ্যের ভিত্তিতে তৈরি।',
    modelAccuracy: 'মডেল নির্ভুলতা (ROC-AUC)',
    reportsTitle: 'স্বয়ংক্রিয় রিপোর্ট ও স্থানিক ডেটা ডাউনলোড',
    reportsSubtitle: 'জেমিনি ৩.৭ ফ্ল্যাশ ব্যবহার করে নির্বাহী দুর্যোগ বুলেটিন তৈরি করুন এবং ডেটা ডাউনলোড করুন।',
    generateBulletin: 'নির্বাহী দুর্যোগ বুলেটিন তৈরি করুন',
    downloadCSV: 'সিএসভি ডেটা ডাউনলোড করুন',
    postgisSchema: 'পোস্টজিআইএস ডিডিএল স্কিমা',

    adminTitle: 'সিস্টেম প্রশাসন ও সতর্কতা সীমা নির্ধারণ',
    adminSubtitle: 'ঝুঁকির সীমা কনফিগার করুন এবং সুরক্ষা অডিট লগ পর্যালোচনা করুন।',
    thresholdSettings: 'স্বয়ংক্রিয় আগাম সতর্কবার্তা সীমা',
    saveThresholds: 'প্যারামিটার সংরক্ষণ করুন',
    auditTrail: 'নিরাপত্তা অডিট ট্রেইল'
  },

  ne: {
    appTitle: 'पहिरो प्रहरी एआई (LANDSLIDE SENTINEL AI)',
    appSubtitle: 'पूर्वोत्तर भारत तथा सिक्किमका ८ राज्यहरूका लागि एआई-आधारित पहिरो पूर्व-चेतावनी तथा भू-स्थानिक जोखिम व्यवस्थापन प्रणाली',
    regionalTag: 'पूर्वोत्तर आपतकालीन कार्य सञ्चालन केन्द्र',
    stateSelectorLabel: 'राज्य छान्नुहोस्',
    allStates: 'सबै ८ पूर्वोत्तर राज्यहरू',
    roleSelectorLabel: 'प्रयोगकर्ता भूमिका',
    audioAlertTitle: 'आपतकालीन साइरन चेतावनी',
    audioAlertMute: 'साइरन बन्द गर्नुहोस्',
    audioAlertUnmute: 'साइरन सुचारु गर्नुहोस्',
    activeHazardsCount: 'सक्रिय जोखिमहरू',

    groupLiveIntelligence: 'प्रत्यक्ष गुप्तचर सूचना',
    groupOperationsAI: 'अपरेशन तथा एआई',
    groupAnalyticsGovernance: 'विश्लेषण तथा शासन',
    toolNavigation: 'उपकरण नेभिगेसन',
    onlineStatus: 'अनलाइन',
    modulesActive: '१३ एकीकृत विपद् निगरानी उपकरणहरू सक्रिय',

    navCommandHub: 'कमान्ड हब',
    navGISMap: 'जीआईएस जोखिम नक्सा',
    navStateDistrict: 'राज्य तथा जिल्लाहरू',
    navForecast: 'मौसम पूर्वानुमान',
    navPipeline: 'स्याटेलाइट डेटा पाइपलाइन',
    navRoads: 'राजमार्ग लाइफलाइनहरू',
    navFieldVision: 'फिल्ड भिजन एआई',
    navEmergency: 'आपतकालीन उद्धार कार्य',
    navCitizen: 'नागरिक सुरक्षा पोर्टल',
    navHistorical: 'ऐतिहासिक विश्लेषण',
    navReports: 'प्रतिवेदन तथा पोस्टजीआईएस',
    navAdmin: 'प्रशासन तथा सेटिङहरू',
    navHandbook: 'सुरक्षा पुस्तिका',

    critical: 'अति संवेदनशील',
    high: 'उच्च जोखिम',
    moderate: 'मध्यम',
    low: 'न्यून',
    normal: 'सामान्य',
    criticalEvacuate: 'अति संवेदनशील (तुरुन्तै सुरक्षित स्थानमा जानुहोस्)',
    highPrepare: 'उच्च जोखिम (स्थानान्तरणको तयारी गर्नुहोस्)',
    moderateWatch: 'मध्यम (सतर्क रहनुहोस्)',
    lowNormal: 'न्यून (सामान्य अवस्था)',

    simEngineTitle: 'वास्तविक-समय भू-प्राविधिक तथा बादल विस्फोट भौतिकी सिमुलेटर',
    simEngineDesc: '१४ वटा भौतिक मापदण्डका आधारमा भीरको शक्ति, छिद्र-जल दबाब र इनसार विरूपण गति गणना गर्दछ।',
    simAccelerated: 'द्रुत गति (१ मिनेट = १ घण्टा)',
    simRealtime: 'वास्तविक समय घडी',
    simTriggerStorm: 'भीषण बादल विस्फोट आँधी सुरु गर्नुहोस्',
    simIngestPass: 'नयाँ स्याटेलाइट डेटा तुरुन्त लिनुहोस्',
    simReset: 'सिमुलेशन रिसेट गर्नुहोस्',
    simNextUpdateIn: 'अर्को स्याटेलाइट अपडेट:',
    simPaused: 'सिमुलेशन रोकिएको छ',
    simRunning: 'सिमुलेशन सक्रिय छ',
    simResume: 'सिमुलेशन सुरु गर्नुहोस्',
    simPause: 'सिमुलेशन रोक्नुहोस्',

    activeAlertsCount: 'सक्रिय अति संवेदनशील अलर्टहरू',
    monitoredZones: 'निगरानी गरिएका क्षेत्रहरू',
    criticalSectors: 'संवेदनशील रेड जोनहरू',
    highRiskVillages: 'जोखिममा रहेका बस्तीहरू',
    blockedRoads: 'अवरुद्ध पहाडी राजमार्गहरू',
    iotSensorsActive: 'सक्रिय आईओटी सेन्सरहरू',
    exposedPopulation: 'जोखिममा परेको जनसंख्या',
    priorityDispatchTasks: 'प्राथमिकता उद्धार कार्यहरू',
    activeRedAlertsBanner: 'सक्रिय रेड अलर्ट तथा तत्काल पहिरो सम्बन्धी बुलेटिन',
    livePrecipitationRadar: 'प्रत्यक्ष डपलर रडार वर्षा तथा टेलिमेट्री',
    riskFactorCurve: 'वर्षा संतृप्ति तथा माटो विरूपण ग्राफ',
    prioritySlopeSectors: 'उच्च जोखिमयुक्त भीर क्षेत्रहरू',
    viewGISMapBtn: 'जीआईएस नक्सा खोल्नुहोस्',
    openEvacuationBtn: 'निकासी मार्गहरू हेर्नुहोस्',
    downloadReportBtn: 'प्रतिवेदन डाउनलोड गर्नुहोस्',
    submitFieldReportBtn: 'फिल्ड रिपोर्ट पठाउनुहोस्',
    testSirenBtn: 'साइरन परीक्षण गर्नुहोस्',

    colZone: 'जोन कोड र नाम',
    colLocation: 'राज्य र जिल्ला',
    colRain72h: '७२ घण्टाको वर्षा (मिमी)',
    colSlope: 'भीरको कोण',
    colPorePressure: 'छिद्र-जल दबाब',
    colSafetyFactor: 'सुरक्षा गुणांक (FS)',
    colRiskScore: 'जोखिम सूचकांक',
    colStatus: 'जोखिम स्तर',
    colActions: 'कार्य',
    inspectZone: 'जाँच गर्नुहोस्',

    mapLayers: 'नक्सा तह नियन्त्रणहरू',
    layerHeatmap: 'जोखिम हिटम्याप तह',
    layerInSAR: 'इनसार जमिन खस्कने गति',
    layerRadar: 'आईएमडी डपलर रडार वर्षा',
    layerSensors: 'आईओटी टेलिमेट्री सेन्सरहरू',
    layerRoads: 'राष्ट्रिय पहाडी राजमार्गहरू',
    layer3DContours: 'कार्टोडेम ३डी स्थलाकृतिक कन्टुरहरू',
    inspectorTitle: 'भू-प्राविधिक भीर निरीक्षक',
    factorSafetyFS: 'सुरक्षा गुणांक (FS)',
    inSARDeformation: 'जमिन खस्कने गति',
    saturationLevel: 'माटोको संतृप्ति प्रतिशत',
    evacuationRoutes: 'सुरक्षित निकासी मार्गहरू',
    nearestShelter: 'नजिकको राहत आश्रयस्थल',
    closeInspector: 'बन्द गर्नुहोस्',

    fieldVisionTitle: 'कम्प्युटर भिजन जमिनको धाँजा तथा पहिरो वर्गीकरण',
    fieldVisionSubtitle: 'जेमिनी ३.७ भिजनद्वारा जमिनको धाँजा र भू-प्राविधिक जोखिम तुरुन्त पहिचान गर्न फोटो अपलोड गर्नुहोस्।',
    uploadPhoto: 'स्थलगत निरीक्षण फोटो अपलोड गर्नुहोस्',
    dragDropPhoto: 'फोटो यहाँ तान्नुहोस् वा फाइल छान्नुहोस्',
    aiClassification: 'एआई भू-संरचनात्मक मूल्याङ्कन',
    detectedHazard: 'पहिचान गरिएको भौगर्भिक जोखिम',
    confidenceScore: 'मोडल विश्वसनीयता',
    officialVerification: 'जिल्ला प्रशासन प्रमाणीकरण',
    verifiedOfficial: 'जिल्ला अधिकारीद्वारा प्रमाणित',
    pendingReview: 'प्रमाणीकरण प्रक्रियामा',

    roadsTitle: 'रणनीतिक पहाडी राजमार्ग तथा लाइफलाइन सडकहरू',
    roadsSubtitle: 'सीमा सडक संगठन (बीआरओ) का लागि वास्तविक समय सडक अवरोध निगरानी, पहिरो पन्छाउने समय र वैकल्पिक मार्गहरू।',
    highwayStatusClear: 'सफा र खुला',
    highwayStatusBlocked: 'पहिरोको कारण पूर्ण अवरुद्ध',
    highwayStatusOneWay: 'एकतर्फी / सीमित आवागमन',
    debrisVolume: 'पहिरोको मात्रा',
    debrisAccumulation: 'पहिरोको थुप्रो संकलन',
    clearanceETA: 'सडक खुलाउने अनुमानित समय',
    estimatedClearance: 'अनुमानित सफाइ समय',
    detourRoute: 'वैकल्पिक बाइपास मार्ग',
    responsibleAgency: 'जिम्मेवार बीआरओ टोली',

    eocTitle: 'आपतकालीन कार्य सञ्चालन केन्द्र (EOC) रणनीतिक समन्वय',
    eocSubtitle: 'गणितीय जोखिम र जनसंख्याको आधारमा उद्धार टोली परिचालन।',
    dispatchRank: 'प्राथमिकता श्रेणी',
    assignedUnit: 'खटिएको उद्धार टोली',
    teamLeader: 'टोली प्रमुख र सम्पर्क',
    personnelKit: 'कर्मचारी र उपकरण',
    estimatedArrival: 'पुग्ने अनुमानित समय (ETA)',
    statusDispatched: 'टोली प्रस्थान गरेको',
    statusOnSiteRescue: 'घटनास्थलमा उद्धार जारी',
    statusCompleted: 'सम्पन्न भयो',
    updateTacticalStatus: 'अवस्था अपडेट गर्नुहोस्',

    citizenPortalTitle: 'नागरिक पहिरो पूर्व-चेतावनी तथा निकासी पोर्टल',
    citizenPortalSubtitle: 'सार्वजनिक नागरिक सुरक्षा पुस्तिका, आपतकालीन आश्रय, सुरक्षित मार्ग नेभिगेसन र साइरन चेतावनी।',
    evacuationNotice: 'नागरिक स्थानान्तरण सूचना तथा सुरक्षित अग्लो स्थानका मार्गहरू',
    sheltersHeading: 'सक्रिय राहत शिविर तथा सुरक्षित स्थानान्तरण बिन्दुहरू',
    safeEvacuationRoutes: 'सुरक्षित उचाइका निकासी मार्गहरू',
    emergencyKitList: 'आपतकालीन जीवन-रक्षक किट सूची',
    whatToDoBefore: 'पहिरो जानुअघि (पूर्व तयारी)',
    whatToDoDuring: 'पहिरो जाँदा (तत्काल गर्नुपर्ने)',
    whatToDoAfter: 'पहिरो गएपछि (सुरक्षा र पुनरुत्थान)',
    helplineDirectory: '२४x७ राज्य आपतकालीन हेल्पलाइनहरू',
    tollFreeHelpline: 'टोल-फ्री नियन्त्रण कक्ष: १०७० / ११२',
    soundDisasterSiren: 'सार्वजनिक साइरन बजाउनुहोस्',

    forecastTitle: 'डपलर रडार वर्षा तथा मनसुन पूर्वानुमान',
    forecastSubtitle: 'उपग्रह वर्षा मापन र ७२ घण्टाको संचित वर्षा निगरानी।',
    satelliteTitle: 'स्याटेलाइट सार (SAR) तथा पृथ्वी अवलोकन डेटा पाइपलाइन',
    satelliteSubtitle: 'सेन्टिनेल-१ इनसार र इस्रो भुवन कार्टोडेम डेटा मनिटर।',
    ingestionStatus: 'डेटा पाइपलाइन अवस्था',
    latencyMs: 'डेटा ढिलाइ',

    historicalTitle: 'ऐतिहासिक पहिरो अभिलेखालय तथा भू-प्राविधिक सीमाहरू',
    historicalSubtitle: 'पूर्वोत्तर भारतको १०+ वर्षको बादल विस्फोट र पहिरो अभिलेखद्वारा क्यालिब्रेट गरिएको।',
    modelAccuracy: 'मोडल शुद्धता (ROC-AUC)',
    reportsTitle: 'स्वचालित प्रतिवेदन, पोस्टजीआईएस संरचना तथा डेटा डाउनलोड',
    reportsSubtitle: 'जेमिनी ३.७ फ्ल्यास प्रयोग गरी विपद् बुलेटिन बनाउनुहोस् र डेटा डाउनलोड गर्नुहोस्।',
    generateBulletin: 'विपद् स्थिति बुलेटिन तयार गर्नुहोस्',
    downloadCSV: 'सीएसभी डेटा डाउनलोड गर्नुहोस्',
    postgisSchema: 'पोस्टग्रेएसक्यूएल / पोस्टजीआईएस डीडीएल स्किमा',

    adminTitle: 'प्रणाली प्रशासन तथा चेतावनी सीमा क्यालिब्रेसन',
    adminSubtitle: 'जोखिम सीमाहरू कन्फिगर गर्नुहोस् र सुरक्षा अडिट लगहरू हेर्नुहोस्।',
    thresholdSettings: 'स्वचालित पूर्व चेतावनी सीमा सेटिङहरू',
    saveThresholds: 'सीमा मापदण्ड बचत गर्नुहोस्',
    auditTrail: 'सुरक्षा अडिट ट्रेल'
  }
};

interface I18nContextType {
  currentLang: LanguageCode;
  changeLang: (lang: LanguageCode) => void;
  t: (key: keyof TranslationDictionary) => string;
  translations: TranslationDictionary;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const I18nProvider: React.FC<{
  currentLang: LanguageCode;
  onChangeLang: (lang: LanguageCode) => void;
  children: React.ReactNode;
}> = ({ currentLang, onChangeLang, children }) => {
  const currentTranslations = TRANSLATIONS[currentLang] || TRANSLATIONS.en;

  const t = (key: keyof TranslationDictionary): string => {
    return currentTranslations[key] || TRANSLATIONS.en[key] || key;
  };

  return (
    <I18nContext.Provider
      value={{
        currentLang,
        changeLang: onChangeLang,
        t,
        translations: currentTranslations
      }}
    >
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = (): I18nContextType => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};
