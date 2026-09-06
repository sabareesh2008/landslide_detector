import React from 'react';
import { 
  LayoutDashboard, 
  Map, 
  MapPin, 
  CloudRain, 
  Radio, 
  Navigation, 
  Camera, 
  ShieldAlert, 
  Compass, 
  History, 
  FileText, 
  Settings, 
  BookOpen,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useI18n } from '../i18n/I18nContext';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  criticalCount: number;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  criticalCount,
  isCollapsed = false,
  onToggleCollapse,
  className = ''
}) => {
  const { t } = useI18n();

  const navigationGroups = [
    {
      group: t('groupLiveIntelligence'),
      items: [
        { id: 'command', label: t('navCommandHub'), icon: LayoutDashboard, badge: null },
        { 
          id: 'gis', 
          label: t('navGISMap'), 
          icon: Map, 
          badge: criticalCount > 0 ? `${criticalCount} ${t('critical')}` : null,
          badgeColor: 'bg-red-500 text-white animate-pulse'
        },
        { id: 'state_drilldown', label: t('navStateDistrict'), icon: MapPin, badge: null },
        { id: 'forecast', label: t('navForecast'), icon: CloudRain, badge: 'Live' },
        { id: 'pipeline', label: t('navPipeline'), icon: Radio, badge: null },
      ]
    },
    {
      group: t('groupOperationsAI'),
      items: [
        { id: 'roads', label: t('navRoads'), icon: Navigation, badge: null },
        { id: 'field_reports', label: t('navFieldVision'), icon: Camera, badge: 'Vision' },
        { id: 'emergency', label: t('navEmergency'), icon: ShieldAlert, badge: null },
      ]
    },
    {
      group: t('groupAnalyticsGovernance'),
      items: [
        { id: 'citizen', label: t('navCitizen'), icon: Compass, badge: null },
        { id: 'historical', label: t('navHistorical'), icon: History, badge: null },
        { id: 'reports_export', label: t('navReports'), icon: FileText, badge: 'Export' },
        { id: 'settings', label: t('navAdmin'), icon: Settings, badge: null },
        { id: 'contacts', label: t('navHandbook'), icon: BookOpen, badge: '24x7' },
      ]
    }
  ];

  return (
    <aside
      className={`bg-[#0c121e] border-r border-slate-800 text-slate-300 flex flex-col transition-all duration-200 shrink-0 select-none ${
        isCollapsed ? 'w-16' : 'w-64'
      } ${className}`}
    >
      {/* Sidebar Header / Brand Mini Banner */}
      <div className="p-3 border-b border-slate-800/80 flex items-center justify-between">
        {!isCollapsed ? (
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span className="text-[11px] font-sans uppercase font-bold tracking-wider text-slate-400">
              {t('toolNavigation')}
            </span>
          </div>
        ) : (
          <div className="mx-auto">
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          </div>
        )}

        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors hidden md:block"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        )}
      </div>

      {/* Vertical Tool Navigation List (Up to Down) */}
      <div className="flex-1 overflow-y-auto py-3 px-2 space-y-4 scrollbar-thin scrollbar-thumb-slate-800">
        {navigationGroups.map((group, groupIdx) => (
          <div key={groupIdx} className="space-y-1">
            {!isCollapsed && (
              <div className="px-3 py-1 text-[10px] font-sans uppercase tracking-wider text-slate-500 font-semibold truncate">
                {group.group}
              </div>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => onSelectTab(item.id)}
                    title={isCollapsed ? item.label : undefined}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all group ${
                      isActive
                        ? 'bg-gradient-to-r from-cyan-950/80 to-slate-900 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-950/50 font-semibold'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
                    } ${isCollapsed ? 'justify-center px-2' : ''}`}
                  >
                    <Icon
                      className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                        isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-200'
                      }`}
                    />

                    {!isCollapsed && (
                      <span className="flex-1 text-left truncate">{item.label}</span>
                    )}

                    {!isCollapsed && item.badge && (
                      <span
                        className={`px-1.5 py-0.5 text-[9px] font-sans rounded font-bold uppercase ${
                          item.badgeColor || 'bg-slate-800 text-slate-300 border border-slate-700'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}

                    {isCollapsed && item.badge && (
                      <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer Info in Sidebar */}
      {!isCollapsed ? (
        <div className="p-3 border-t border-slate-800/80 text-[11px] text-slate-500 space-y-1 bg-[#080d15]">
          <div className="flex items-center justify-between font-sans text-[10px] text-slate-400">
            <span>GSI • ISRO Bhuvan</span>
            <span className="text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {t('onlineStatus')}
            </span>
          </div>
          <div className="text-[10px] text-slate-500 leading-tight">
            {t('modulesActive')}
          </div>
        </div>
      ) : (
        <div className="p-2 border-t border-slate-800/80 flex justify-center bg-[#080d15]">
          <span className="w-2 h-2 rounded-full bg-emerald-400" title={t('modulesActive')} />
        </div>
      )}
    </aside>
  );
};
