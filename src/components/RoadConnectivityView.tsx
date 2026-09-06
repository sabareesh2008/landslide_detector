import React from 'react';
import { RoadCorridor, NEState } from '../types';
import { 
  Truck, 
  CornerUpRight
} from 'lucide-react';
import { useI18n } from '../i18n/I18nContext';

interface RoadConnectivityViewProps {
  roads: RoadCorridor[];
  selectedState: NEState | 'All NE States';
  onSelectState: (state: NEState | 'All NE States') => void;
}

export const RoadConnectivityView: React.FC<RoadConnectivityViewProps> = ({
  roads,
  selectedState
}) => {
  const { t } = useI18n();

  const filteredRoads = selectedState === 'All NE States'
    ? roads
    : roads.filter(r => r.state === selectedState);

  const blockedCount = filteredRoads.filter(r => r.status === 'fully_blocked').length;
  const partialCount = filteredRoads.filter(r => r.status === 'partially_blocked').length;
  const clearCount = filteredRoads.filter(r => r.status === 'clear').length;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-[#111827] border border-amber-500/40 rounded-xl p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-400 font-sans text-xs uppercase font-semibold">
            <Truck className="w-4 h-4 text-amber-400" />
            <span>{t('navRoads')}</span>
          </div>
          <h2 className="text-lg font-bold text-white mt-1">
            {t('blockedRoads')} & Lifeline Corridors
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Border Roads Organisation (BRO), NHIDCL, & PWD emergency clearance coordination.
          </p>
        </div>

        {/* Status Counters */}
        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-lg bg-red-950/80 border border-red-500/50 text-red-200 text-xs font-sans">
            <strong>{blockedCount}</strong> {t('highwayStatusBlocked')}
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-orange-950/80 border border-orange-500/50 text-orange-200 text-xs font-sans">
            <strong>{partialCount}</strong> Single-Lane
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 text-xs font-sans">
            <strong>{clearCount}</strong> {t('highwayStatusClear')}
          </div>
        </div>
      </div>

      {/* Roads List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredRoads.map((road) => {
          let statusBadge = (
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-950 text-emerald-300 border border-emerald-500">
              {t('highwayStatusClear')}
            </span>
          );
          let cardBorder = 'border-slate-800 bg-slate-900/80';

          if (road.status === 'fully_blocked') {
            statusBadge = (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-red-950 text-red-300 border border-red-500 animate-pulse">
                ⛔ {t('highwayStatusBlocked')}
              </span>
            );
            cardBorder = 'border-red-500/50 bg-red-950/20';
          } else if (road.status === 'partially_blocked') {
            statusBadge = (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-orange-950 text-orange-300 border border-orange-500">
                ⚠️ Single-Lane Only
              </span>
            );
            cardBorder = 'border-orange-500/50 bg-orange-950/20';
          } else if (road.status === 'high_hazard_warning') {
            statusBadge = (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-950 text-amber-300 border border-amber-500">
                ⚡ High Hazard Warning
              </span>
            );
            cardBorder = 'border-amber-500/50 bg-amber-950/20';
          }

          return (
            <div
              key={road.id}
              className={`p-5 rounded-xl border shadow-xl flex flex-col justify-between transition-all ${cardBorder}`}
            >
              <div>
                {/* Card Header */}
                <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-3">
                  <div>
                    <span className="text-[10px] font-sans text-cyan-400 uppercase font-semibold">
                      {road.highwayNumber} • {road.state}
                    </span>
                    <h3 className="text-sm font-bold text-white mt-0.5">{road.name}</h3>
                  </div>
                  {statusBadge}
                </div>

                {/* Road Stretch & Debris Volume */}
                <div className="mt-3 space-y-2 text-xs">
                  <div className="text-slate-300">
                    <span className="text-slate-500 text-[10px] uppercase font-sans block">Stretch</span>
                    <span className="font-medium text-white">{road.stretch}</span>
                  </div>

                  {road.debrisVolumeM3 && (
                    <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                      <span className="text-slate-400 text-[11px]">{t('debrisAccumulation')}:</span>
                      <strong className="text-red-400 font-sans text-xs">
                        {road.debrisVolumeM3.toLocaleString()} m³
                      </strong>
                    </div>
                  )}

                  {road.estimatedClearanceTime && (
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">{t('estimatedClearance')}:</span>
                      <span className="font-semibold text-amber-300 font-sans">
                        {road.estimatedClearanceTime}
                      </span>
                    </div>
                  )}

                  {/* Alternate Detour Route */}
                  {road.alternateRoute && (
                    <div className="p-2.5 rounded-lg bg-cyan-950/40 border border-cyan-500/40 text-[11px] space-y-1">
                      <div className="flex items-center gap-1 text-cyan-300 font-bold uppercase text-[10px]">
                        <CornerUpRight className="w-3 h-3" />
                        <span>{t('detourRoute')}</span>
                      </div>
                      <p className="text-slate-200">{road.alternateRoute}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Button & Priority Tag */}
              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px]">
                <span className="text-slate-400">
                  Priority: <strong className="text-emerald-400">{road.trafficPriority}</strong>
                </span>
                <span className="px-2.5 py-1 rounded bg-slate-800 text-slate-200 font-medium text-xs">
                  {t('detourRoute')}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
