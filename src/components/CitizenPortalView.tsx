import React from 'react';
import { 
  ShieldCheck, 
  PhoneCall, 
  AlertTriangle, 
  Volume2, 
  Home, 
  ArrowRight,
  HeartPulse
} from 'lucide-react';
import { MULTILINGUAL_STRINGS } from '../data/mockData';
import { playDisasterSiren } from '../utils/audioAlert';
import { useI18n } from '../i18n/I18nContext';

interface CitizenPortalViewProps {
  currentLang: string;
  onChangeLang: (lang: string) => void;
}

export const CitizenPortalView: React.FC<CitizenPortalViewProps> = ({
  currentLang
}) => {
  const { t } = useI18n();
  const strings = MULTILINGUAL_STRINGS[currentLang] || MULTILINGUAL_STRINGS.en;

  const shelters = [
    { name: 'Mangan Community Hall & District Shelter', state: 'Sikkim', distance: '1.2 km', capacity: '450 people', status: 'Open (Food & Medical ready)' },
    { name: 'Noney Higher Secondary Evacuation Center', state: 'Manipur', distance: '2.8 km', capacity: '300 people', status: 'Open (SDRF Stationed)' },
    { name: 'Dympep Village Panchayat Building', state: 'Meghalaya', distance: '0.8 km', capacity: '200 people', status: 'Open' },
    { name: 'Chungthang Indoor Stadium', state: 'Sikkim', distance: '3.5 km', capacity: '600 people', status: 'Standby' },
  ];

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-[#111827] border border-emerald-500/40 rounded-xl p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 font-sans text-xs uppercase font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>{t('navCitizen')} • {t('navHandbook')}</span>
          </div>
          <h2 className="text-lg font-bold text-white mt-1">
            {strings.evacuateInstruction || t('evacuationNotice')}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {t('appSubtitle')}
          </p>
        </div>

        {/* Siren Audio Trigger */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => playDisasterSiren(4)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-red-900/80 hover:bg-red-800 text-red-200 border border-red-500/60 text-xs font-bold transition-colors shadow-lg"
          >
            <Volume2 className="w-4 h-4 animate-pulse" />
            <span>{t('testSirenBtn')}</span>
          </button>
        </div>
      </div>

      {/* Immediate Life-Saving Action Card */}
      <div className="p-5 rounded-xl bg-gradient-to-r from-red-950/60 to-amber-950/40 border-2 border-red-500/60 shadow-2xl space-y-3">
        <div className="flex items-center gap-2 text-red-300 font-sans text-xs uppercase font-bold">
          <AlertTriangle className="w-5 h-5 text-red-400 animate-bounce" />
          <span>{t('critical')} {t('evacuationNotice')}</span>
        </div>
        <p className="text-sm font-semibold text-white leading-relaxed">
          {strings.evacuateInstruction}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 text-xs">
          <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-700">
            <strong className="text-red-400 block mb-1">1. {t('simNextUpdateIn')}</strong>
            <p className="text-slate-300 text-[11px]">{strings.sosEmergencyText}</p>
          </div>
          <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-700">
            <strong className="text-amber-400 block mb-1">2. {t('highwayStatusBlocked')}</strong>
            <p className="text-slate-300 text-[11px]">{strings.roadBlockedNotice}</p>
          </div>
          <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-700">
            <strong className="text-emerald-400 block mb-1">3. {t('verifiedOfficial')}</strong>
            <p className="text-slate-300 text-[11px]">{strings.shelterNotice}</p>
          </div>
        </div>
      </div>

      {/* Evacuation Shelters Directory */}
      <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 shadow-xl">
        <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider font-sans flex items-center gap-2">
            <Home className="w-4 h-4 text-emerald-400" />
            {t('sheltersHeading')}
          </h3>
          <span className="text-xs text-emerald-400 font-sans">4 {t('onlineStatus')}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {shelters.map((s, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="text-sm font-bold text-white">{s.name}</h4>
                  <span className="text-[11px] text-slate-400">{s.state} • Approx {s.distance}</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-950 text-emerald-300 border border-emerald-500">
                  {s.status}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800">
                <span className="text-slate-400">Capacity: <strong className="text-white">{s.capacity}</strong></span>
                <span className="text-cyan-400 font-semibold flex items-center gap-1">
                  Safe Route <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Emergency Dialers */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <a
          href="tel:112"
          className="p-4 rounded-xl bg-red-950/40 border border-red-500/50 hover:bg-red-900/60 transition-colors flex items-center justify-between text-white"
        >
          <div className="flex items-center gap-3">
            <PhoneCall className="w-6 h-6 text-red-400 animate-pulse" />
            <div>
              <div className="font-bold text-sm">National Emergency 112</div>
              <span className="text-[11px] text-red-300">Police, Ambulance, Fire</span>
            </div>
          </div>
          <span className="text-xs font-sans font-bold bg-red-800 px-2.5 py-1 rounded">112</span>
        </a>

        <a
          href="tel:1077"
          className="p-4 rounded-xl bg-amber-950/40 border border-amber-500/50 hover:bg-amber-900/60 transition-colors flex items-center justify-between text-white"
        >
          <div className="flex items-center gap-3">
            <HeartPulse className="w-6 h-6 text-amber-400" />
            <div>
              <div className="font-bold text-sm">State Disaster Control 1077</div>
              <span className="text-[11px] text-amber-300">DDMA / SDRF Control Room</span>
            </div>
          </div>
          <span className="text-xs font-sans font-bold bg-amber-800 px-2.5 py-1 rounded">1077</span>
        </a>

        <a
          href="tel:1078"
          className="p-4 rounded-xl bg-cyan-950/40 border border-cyan-500/50 hover:bg-cyan-900/60 transition-colors flex items-center justify-between text-white"
        >
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-cyan-400" />
            <div>
              <div className="font-bold text-sm">NDMA Emergency 1078</div>
              <span className="text-[11px] text-cyan-300">National Disaster Helpline</span>
            </div>
          </div>
          <span className="text-xs font-sans font-bold bg-cyan-800 px-2.5 py-1 rounded">1078</span>
        </a>
      </div>
    </div>
  );
};
