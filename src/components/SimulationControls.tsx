import React from 'react';
import { Play, Pause, RotateCcw, FastForward, CloudRain, Satellite, Clock } from 'lucide-react';
import { useI18n } from '../i18n/I18nContext';

interface SimulationControlsProps {
  isRunning: boolean;
  onTogglePlay: () => void;
  onReset: () => void;
  simMode: 'realtime' | 'accelerated';
  onToggleMode: () => void;
  onTriggerHourlyUpdate: () => void;
  onTriggerSevereStorm: () => void;
  secondsRemaining: number;
}

export const SimulationControls: React.FC<SimulationControlsProps> = ({
  isRunning,
  onTogglePlay,
  onReset,
  simMode,
  onToggleMode,
  onTriggerHourlyUpdate,
  onTriggerSevereStorm,
  secondsRemaining
}) => {
  const { t } = useI18n();

  return (
    <div className="bg-[#111726]/90 border border-slate-800 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs shadow-md">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-1.5 font-sans text-cyan-400">
          <Clock className="w-3.5 h-3.5 text-cyan-400 animate-spin-slow" />
          <span>{t('simNextUpdateIn')}: </span>
          <strong className="text-white">
            {Math.floor(secondsRemaining / 60)}m {secondsRemaining % 60}s
          </strong>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={onTogglePlay}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg border font-medium transition-colors ${
              isRunning
                ? 'bg-amber-950/60 border-amber-500/50 text-amber-300 hover:bg-amber-900/80'
                : 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300 hover:bg-emerald-900/80'
            }`}
          >
            {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isRunning ? t('simPause') : t('simResume')}</span>
          </button>

          <button
            onClick={onToggleMode}
            title={simMode === 'accelerated' ? t('simAccelerated') : t('simRealtime')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg border font-medium transition-colors ${
              simMode === 'accelerated'
                ? 'bg-cyan-950/80 border-cyan-400 text-cyan-300 shadow-sm shadow-cyan-950'
                : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
          >
            <FastForward className="w-3.5 h-3.5" />
            <span>{simMode === 'accelerated' ? t('simAccelerated') : t('simRealtime')}</span>
          </button>

          <button
            onClick={onReset}
            title={t('simReset')}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={onTriggerHourlyUpdate}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-950/70 border border-cyan-500/50 text-cyan-300 hover:bg-cyan-900/80 font-medium transition-colors"
        >
          <Satellite className="w-3.5 h-3.5" />
          <span>{t('simIngestPass')}</span>
        </button>

        <button
          onClick={onTriggerSevereStorm}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-950/70 border border-indigo-500/50 text-indigo-300 hover:bg-indigo-900/80 font-medium transition-colors"
        >
          <CloudRain className="w-3.5 h-3.5" />
          <span>{t('simTriggerStorm')}</span>
        </button>
      </div>
    </div>
  );
};
