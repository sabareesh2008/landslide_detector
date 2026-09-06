import React from 'react';
import { Volume2, ArrowRight } from 'lucide-react';
import { EarlyWarningAlert } from '../types';
import { playDisasterSiren } from '../utils/audioAlert';
import { useI18n } from '../i18n/I18nContext';

interface EmergencyBannerProps {
  alerts: EarlyWarningAlert[];
  onOpenEvacuationGuide: () => void;
  onOpenAlertDetails: (alert: EarlyWarningAlert) => void;
}

export const EmergencyBanner: React.FC<EmergencyBannerProps> = ({
  alerts,
  onOpenEvacuationGuide,
  onOpenAlertDetails
}) => {
  const { t } = useI18n();
  const criticalAlert = alerts.find(a => a.severity === 'critical') || alerts[0];

  if (!criticalAlert) return null;

  return (
    <div className="bg-gradient-to-r from-red-950 via-red-900 to-amber-950 border-b border-red-500/60 px-4 py-2 text-white shadow-lg shadow-red-950/40 animate-pulse-slow">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="flex h-2.5 w-2.5 relative shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
          </span>
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="font-sans font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-red-800 border border-red-400/40 text-[10px] text-red-100 shrink-0">
              {t('critical')} FLASH WARNING
            </span>
            <span className="font-semibold text-red-100 truncate">
              {criticalAlert.headline}
            </span>
            <span className="hidden md:inline text-red-300/80 font-sans text-[11px]">
              • {criticalAlert.expectedRiskPeriod}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => playDisasterSiren(3)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-red-900/80 hover:bg-red-800 text-red-200 border border-red-500/50 transition-colors"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span className="text-[11px] font-medium hidden sm:inline">{t('testSirenBtn')}</span>
          </button>
          
          <button
            onClick={() => onOpenAlertDetails(criticalAlert)}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-white text-red-950 hover:bg-slate-100 font-bold transition-colors shadow-sm"
          >
            <span>{t('openEvacuationBtn')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
