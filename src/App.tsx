import React, { useState, useEffect } from 'react';
import { 
  GridCellRisk, 
  SensorNode, 
  RoadCorridor, 
  FieldReport, 
  EarlyWarningAlert, 
  EmergencyTask, 
  NEState, 
  UserRole 
} from './types';
import { 
  INITIAL_GRID_CELLS, 
  INITIAL_SENSORS, 
  INITIAL_ROADS, 
  INITIAL_FIELD_REPORTS, 
  INITIAL_ALERTS, 
  INITIAL_EMERGENCY_TASKS 
} from './data/mockData';
import { simulateHourlyStep } from './services/mlEngine';
import { playNotificationChime, playDisasterSiren } from './utils/audioAlert';
import { I18nProvider, LanguageCode } from './i18n/I18nContext';

// Components
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { EmergencyBanner } from './components/EmergencyBanner';
import { SimulationControls } from './components/SimulationControls';
import { GISMap } from './components/GISMap';
import { RegionalCommandView } from './components/RegionalCommandView';
import { StateDistrictView } from './components/StateDistrictView';
import { WeatherForecastView } from './components/WeatherForecastView';
import { SatellitePipelineView } from './components/SatellitePipelineView';
import { RoadConnectivityView } from './components/RoadConnectivityView';
import { FieldReportView } from './components/FieldReportView';
import { EmergencyResponseView } from './components/EmergencyResponseView';
import { CitizenPortalView } from './components/CitizenPortalView';
import { HistoricalAnalyticsView } from './components/HistoricalAnalyticsView';
import { ReportsExportView } from './components/ReportsExportView';
import { AdminSettingsView } from './components/AdminSettingsView';
import { EmergencyContactsView } from './components/EmergencyContactsView';

import { X, ShieldAlert, Volume2 } from 'lucide-react';

export function App() {
  // Master Application State
  const [cells, setCells] = useState<GridCellRisk[]>(INITIAL_GRID_CELLS);
  const [sensors, setSensors] = useState<SensorNode[]>(INITIAL_SENSORS);
  const [roads, setRoads] = useState<RoadCorridor[]>(INITIAL_ROADS);
  const [reports, setReports] = useState<FieldReport[]>(INITIAL_FIELD_REPORTS);
  const [alerts, setAlerts] = useState<EarlyWarningAlert[]>(INITIAL_ALERTS);
  const [tasks, setTasks] = useState<EmergencyTask[]>(INITIAL_EMERGENCY_TASKS);

  // UI Navigation & Filters
  const [currentTab, setCurrentTab] = useState<string>('command');
  const [selectedState, setSelectedState] = useState<NEState | 'All NE States'>('All NE States');
  const [currentRole, setCurrentRole] = useState<UserRole>('Disaster Management Authority');
  const [currentLang, setCurrentLang] = useState<LanguageCode>('en');
  const [isAudioAlertEnabled, setIsAudioAlertEnabled] = useState<boolean>(true);
  const [selectedZone, setSelectedZone] = useState<GridCellRisk | null>(null);

  // Active Alert Modal
  const [activeModalAlert, setActiveModalAlert] = useState<EarlyWarningAlert | null>(null);

  // Sidebar controls
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);

  // Simulation Clock & Loop (1 min = 1 hour or real-time)
  const [isSimRunning, setIsSimRunning] = useState<boolean>(true);
  const [simSpeedMode, setSimSpeedMode] = useState<'realtime' | 'accelerated'>('accelerated');
  const [secondsRemaining, setSecondsRemaining] = useState<number>(60);

  const cycleDuration = simSpeedMode === 'accelerated' ? 60 : 3600;

  // Step simulation forward
  const stepSimulation = (isSevereStorm = false) => {
    setCells((prev) => {
      const updated = simulateHourlyStep(prev, isSevereStorm);
      const newCritical = updated.filter(c => c.severity === 'critical');
      if (newCritical.length > 0 && isAudioAlertEnabled) {
        playNotificationChime();
      }
      return updated;
    });
    setSecondsRemaining(cycleDuration);
  };

  // Simulation Interval Timer
  useEffect(() => {
    if (!isSimRunning) return;

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          stepSimulation(false);
          return cycleDuration;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isSimRunning, simSpeedMode, cycleDuration, isAudioAlertEnabled]);

  const handleResetSimulation = () => {
    setCells(INITIAL_GRID_CELLS);
    setSensors(INITIAL_SENSORS);
    setRoads(INITIAL_ROADS);
    setReports(INITIAL_FIELD_REPORTS);
    setTasks(INITIAL_EMERGENCY_TASKS);
    setSecondsRemaining(cycleDuration);
  };

  const handleAddReport = (newReport: FieldReport) => {
    setReports(prev => [newReport, ...prev]);
    if (isAudioAlertEnabled) {
      playNotificationChime();
    }
  };

  const handleVerifyReport = (reportId: string, remarks: string, status: 'verified_by_official' | 'action_dispatched') => {
    setReports(prev => prev.map(r => r.id === reportId ? {
      ...r,
      verificationStatus: status,
      officialRemarks: remarks
    } : r));
  };

  const handleUpdateTaskStatus = (taskId: string, status: EmergencyTask['status']) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status } : t));
  };

  const handleAddTask = (newTask: EmergencyTask) => {
    setTasks(prev => [newTask, ...prev]);
  };

  const criticalCellsCount = cells.filter(c => c.severity === 'critical').length;

  return (
    <I18nProvider currentLang={currentLang} onChangeLang={setCurrentLang}>
      <div className="min-h-screen bg-[#070b12] text-slate-100 font-sans flex flex-col selection:bg-cyan-500 selection:text-slate-950">
        {/* Top Persistent Emergency Notification Ribbon */}
        <EmergencyBanner
          alerts={alerts}
          onOpenEvacuationGuide={() => setCurrentTab('citizen')}
          onOpenAlertDetails={(alert) => setActiveModalAlert(alert)}
        />

        {/* Main Navigation Header */}
        <Navbar
          selectedState={selectedState}
          onSelectState={setSelectedState}
          currentRole={currentRole}
          onChangeRole={setCurrentRole}
          currentLang={currentLang}
          onChangeLang={(lang) => setCurrentLang(lang as LanguageCode)}
          isAudioAlertEnabled={isAudioAlertEnabled}
          onToggleAudio={() => setIsAudioAlertEnabled(!isAudioAlertEnabled)}
          simSpeedMode={simSpeedMode}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(prev => !prev)}
        />

        {/* Main Layout: Left-Side Vertical Sidebar (Up to Down) + Main Content Viewport */}
        <div className="flex-1 flex flex-row min-h-0 w-full relative">
          {/* Desktop Left-Side Vertical Sidebar */}
          <Sidebar
            currentTab={currentTab}
            onSelectTab={(tab) => {
              setCurrentTab(tab);
              setIsMobileSidebarOpen(false);
            }}
            criticalCount={criticalCellsCount}
            isCollapsed={isSidebarCollapsed}
            onToggleCollapse={() => setIsSidebarCollapsed(prev => !prev)}
            className="hidden md:flex sticky top-[57px] max-h-[calc(100vh-57px)]"
          />

          {/* Mobile Navigation Drawer */}
          {isMobileSidebarOpen && (
            <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm md:hidden flex">
              <Sidebar
                currentTab={currentTab}
                onSelectTab={(tab) => {
                  setCurrentTab(tab);
                  setIsMobileSidebarOpen(false);
                }}
                criticalCount={criticalCellsCount}
                isCollapsed={false}
                className="h-full w-72 shadow-2xl z-50 border-r border-slate-700"
              />
              <div 
                className="flex-1" 
                onClick={() => setIsMobileSidebarOpen(false)} 
              />
            </div>
          )}

          {/* Main Content Workspace */}
          <main className="flex-1 min-w-0 p-4 sm:p-6 space-y-6 max-w-full overflow-x-hidden">
            {/* Simulation Playback & Trigger Strip */}
            <SimulationControls
              isRunning={isSimRunning}
              onTogglePlay={() => setIsSimRunning(!isSimRunning)}
              onReset={handleResetSimulation}
              simMode={simSpeedMode}
              onToggleMode={() => setSimSpeedMode(prev => prev === 'accelerated' ? 'realtime' : 'accelerated')}
              onTriggerHourlyUpdate={() => stepSimulation(false)}
              onTriggerSevereStorm={() => stepSimulation(true)}
              secondsRemaining={secondsRemaining}
            />

            {/* View Switcher based on Tab */}
            {currentTab === 'command' && (
              <RegionalCommandView
                cells={cells}
                sensors={sensors}
                roads={roads}
                reports={reports}
                alerts={alerts}
                tasks={tasks}
                onSelectState={(st) => {
                  setSelectedState(st);
                }}
                onSelectZone={(c) => {
                  setSelectedZone(c);
                  setCurrentTab('gis');
                }}
                onNavigateTab={setCurrentTab}
              />
            )}

            {currentTab === 'gis' && (
              <GISMap
                cells={cells}
                sensors={sensors}
                roads={roads}
                reports={reports}
                selectedState={selectedState}
                onSelectZone={setSelectedZone}
                selectedZone={selectedZone}
              />
            )}

            {currentTab === 'state_drilldown' && (
              <StateDistrictView
                cells={cells}
                selectedState={selectedState}
                onSelectState={(st) => setSelectedState(st)}
                onSelectZone={(c) => {
                  setSelectedZone(c);
                  setCurrentTab('gis');
                }}
              />
            )}

            {currentTab === 'forecast' && (
              <WeatherForecastView />
            )}

            {currentTab === 'pipeline' && (
              <SatellitePipelineView
                onForceIngest={() => stepSimulation(false)}
                secondsRemaining={secondsRemaining}
              />
            )}

            {currentTab === 'roads' && (
              <RoadConnectivityView
                roads={roads}
                selectedState={selectedState}
                onSelectState={setSelectedState}
              />
            )}

            {currentTab === 'field_reports' && (
              <FieldReportView
                reports={reports}
                onAddReport={handleAddReport}
                onVerifyReport={handleVerifyReport}
                selectedState={selectedState}
              />
            )}

            {currentTab === 'emergency' && (
              <EmergencyResponseView
                tasks={tasks}
                onUpdateTaskStatus={handleUpdateTaskStatus}
                onAddTask={handleAddTask}
              />
            )}

            {currentTab === 'citizen' && (
              <CitizenPortalView
                currentLang={currentLang}
                onChangeLang={(l) => setCurrentLang(l as LanguageCode)}
              />
            )}

            {currentTab === 'historical' && (
              <HistoricalAnalyticsView />
            )}

            {currentTab === 'reports_export' && (
              <ReportsExportView
                cells={cells}
                roads={roads}
                sensors={sensors}
                reports={reports}
                selectedState={selectedState}
              />
            )}

            {currentTab === 'settings' && (
              <AdminSettingsView
                currentRole={currentRole}
                onChangeRole={setCurrentRole}
              />
            )}

            {currentTab === 'contacts' && (
              <EmergencyContactsView />
            )}
          </main>
        </div>

        {/* Emergency Action Modal */}
        {activeModalAlert && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#0f172a] border-2 border-red-500 rounded-2xl max-w-xl w-full p-6 text-slate-100 shadow-2xl relative space-y-4 animate-scale-up">
              <button
                onClick={() => setActiveModalAlert(null)}
                className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 text-red-400 font-sans text-xs uppercase font-bold tracking-wide">
                <ShieldAlert className="w-5 h-5 animate-pulse" />
                <span>{activeModalAlert.alertCode} • {activeModalAlert.state}</span>
              </div>

              <h3 className="text-xl font-bold text-white leading-snug">
                {activeModalAlert.headline}
              </h3>

              <p className="text-xs text-slate-300 leading-relaxed">
                {activeModalAlert.details}
              </p>

              <div className="p-3 rounded-xl bg-red-950/50 border border-red-500/40 text-xs space-y-2">
                <div className="font-bold text-red-200 uppercase font-sans text-[11px] tracking-wide">
                  Mandatory Civil Safety Instructions
                </div>
                <ul className="space-y-1">
                  {activeModalAlert.safetyInstructions.map((inst, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-slate-200 text-[11px]">
                      <span className="text-red-400 font-bold">•</span>
                      <span>{inst}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 font-sans pt-2 border-t border-slate-800">
                <span>SMS Broadcasts: {activeModalAlert.smsBroadcastCount.toLocaleString()} Sent</span>
                <span>Push Alerts: {activeModalAlert.appPushCount.toLocaleString()} Delivered</span>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => playDisasterSiren(3)}
                  className="flex-1 py-2.5 rounded-lg bg-red-900/80 hover:bg-red-800 text-red-200 font-bold text-xs flex items-center justify-center gap-2 border border-red-500/50"
                >
                  <Volume2 className="w-4 h-4" />
                  <span>Test Audio Siren</span>
                </button>
                <button
                  onClick={() => {
                    setActiveModalAlert(null);
                    setCurrentTab('citizen');
                  }}
                  className="flex-1 py-2.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg shadow-red-950"
                >
                  Open Evacuation Routes
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="border-t border-slate-800/80 bg-[#090e17] py-4 px-6 text-center text-xs text-slate-500">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
            <span>Landslide Sentinel AI © 2026 — Geological Survey of India (GSI) & North Eastern Disaster Management Authority</span>
            <span className="font-sans text-[11px] text-slate-400">Integrated with Sentinel-1 InSAR, IMD Radar, ISRO Bhuvan & Gemini AI</span>
          </div>
        </footer>
      </div>
    </I18nProvider>
  );
}
export default App;
