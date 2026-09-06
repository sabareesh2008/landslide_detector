import React from 'react';
import { 
  ShieldAlert, 
  MapPin, 
  UserCheck, 
  Volume2, 
  VolumeX, 
  Languages, 
  Menu
} from 'lucide-react';
import { NEState, UserRole } from '../types';
import { NE_STATES } from '../data/mockData';
import { useI18n, LanguageCode } from '../i18n/I18nContext';

interface NavbarProps {
  selectedState: NEState | 'All NE States';
  onSelectState: (state: NEState | 'All NE States') => void;
  currentRole: UserRole;
  onChangeRole: (role: UserRole) => void;
  currentLang: string;
  onChangeLang: (lang: string) => void;
  isAudioAlertEnabled: boolean;
  onToggleAudio: () => void;
  simSpeedMode: 'realtime' | 'accelerated';
  onToggleMobileSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  selectedState,
  onSelectState,
  currentRole,
  onChangeRole,
  currentLang,
  onChangeLang,
  isAudioAlertEnabled,
  onToggleAudio,
  simSpeedMode,
  onToggleMobileSidebar
}) => {
  const { t } = useI18n();

  return (
    <header className="sticky top-0 z-40 bg-[#0c121e]/95 backdrop-blur-md border-b border-slate-800 text-slate-200">
      {/* Top Brand & Controls Row */}
      <div className="px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {/* Mobile Sidebar Toggle Button */}
          {onToggleMobileSidebar && (
            <button
              onClick={onToggleMobileSidebar}
              aria-label="Toggle Navigation Sidebar"
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 md:hidden transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <div className="relative flex items-center justify-center w-10 h-10 rounded-lg bg-red-950/70 border border-red-500/50 shadow-lg shadow-red-950/50 text-red-400 shrink-0">
            <ShieldAlert className="w-6 h-6 animate-pulse" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-red-500 ring-2 ring-slate-900" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-bold text-base sm:text-lg tracking-tight text-white font-sans">
                {t('appTitle')}
              </h1>
              <span className="px-1.5 py-0.5 text-[10px] font-sans uppercase tracking-wider rounded bg-cyan-950/80 border border-cyan-500/40 text-cyan-300">
                {t('regionalTag')}
              </span>
              {simSpeedMode === 'accelerated' && (
                <span className="px-1.5 py-0.5 text-[10px] font-sans rounded bg-amber-950 border border-amber-500/40 text-amber-300 animate-pulse">
                  ⚡ 1m = 1h
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 font-sans hidden md:block max-w-2xl truncate">
              {t('appSubtitle')}
            </p>
          </div>
        </div>

        {/* Global Controls: State, Role, Language, Audio */}
        <div className="flex items-center flex-wrap gap-2 text-xs">
          {/* State Filter */}
          <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-700/80 rounded-lg px-2.5 py-1.5" title={t('stateSelectorLabel')}>
            <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <select
              aria-label={t('stateSelectorLabel')}
              value={selectedState}
              onChange={(e) => onSelectState(e.target.value as any)}
              className="bg-transparent text-slate-200 text-xs font-medium focus:outline-none cursor-pointer max-w-[130px] sm:max-w-none truncate"
            >
              <option value="All NE States" className="bg-slate-900 text-slate-100">{t('allStates')}</option>
              {NE_STATES.map((st) => (
                <option key={st} value={st} className="bg-slate-900 text-slate-100">{st}</option>
              ))}
            </select>
          </div>

          {/* Role Switcher */}
          <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-700/80 rounded-lg px-2.5 py-1.5" title={t('roleSelectorLabel')}>
            <UserCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <select
              aria-label={t('roleSelectorLabel')}
              value={currentRole}
              onChange={(e) => onChangeRole(e.target.value as UserRole)}
              className="bg-transparent text-slate-200 text-xs font-medium focus:outline-none cursor-pointer max-w-[120px] sm:max-w-none truncate"
            >
              <option value="Disaster Management Authority" className="bg-slate-900">Disaster Authority (Full Ops)</option>
              <option value="District Administration" className="bg-slate-900">District Collector / DDMA</option>
              <option value="Field Official" className="bg-slate-900">Field Official / Engineer</option>
              <option value="Administrator" className="bg-slate-900">System Administrator</option>
              <option value="Citizen" className="bg-slate-900">Citizen / Public View</option>
            </select>
          </div>

          {/* Language Switcher */}
          <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-700/80 rounded-lg px-2.5 py-1.5">
            <Languages className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <select
              aria-label="Select Interface Language"
              value={currentLang}
              onChange={(e) => onChangeLang(e.target.value as LanguageCode)}
              className="bg-transparent text-slate-200 text-xs font-medium focus:outline-none cursor-pointer"
            >
              <option value="en" className="bg-slate-900">English</option>
              <option value="hi" className="bg-slate-900">हिंदी (Hindi)</option>
              <option value="as" className="bg-slate-900">অসমীয়া (Assamese)</option>
              <option value="bn" className="bg-slate-900">বাংলা (Bengali)</option>
              <option value="ne" className="bg-slate-900">नेपाली (Nepali)</option>
            </select>
          </div>

          {/* Siren Audio Toggle */}
          <button
            onClick={onToggleAudio}
            title={isAudioAlertEnabled ? t('audioAlertMute') : t('audioAlertUnmute')}
            className={`flex items-center justify-center p-2 rounded-lg border transition-colors ${
              isAudioAlertEnabled
                ? 'bg-red-950/70 border-red-500/60 text-red-300 hover:bg-red-900/80'
                : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
          >
            {isAudioAlertEnabled ? <Volume2 className="w-4 h-4 animate-pulse" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </header>
  );
};
