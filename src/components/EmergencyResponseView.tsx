import React, { useState } from 'react';
import { EmergencyTask, NEState } from '../types';
import { 
  Users, 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  Navigation, 
  MapPin, 
  Phone, 
  Radio,
  HardHat,
  Plus
} from 'lucide-react';

interface EmergencyResponseViewProps {
  tasks: EmergencyTask[];
  onUpdateTaskStatus: (taskId: string, status: EmergencyTask['status']) => void;
  onAddTask: (task: EmergencyTask) => void;
}

export const EmergencyResponseView: React.FC<EmergencyResponseViewProps> = ({
  tasks,
  onUpdateTaskStatus,
  onAddTask
}) => {
  const [filterState, setFilterState] = useState<string>('all');

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-[#111827] border border-emerald-500/40 rounded-xl p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 font-sans text-xs uppercase font-bold tracking-wide">
            <Users className="w-4 h-4 text-emerald-400" />
            <span>Emergency Operations Center (EOC) Tactical Coordination</span>
          </div>
          <h2 className="text-lg font-bold text-white mt-1">
            Urgency Prioritization & Multi-Agency Dispatch
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Ranked by Mathematical Urgency Score: (Risk Probability × Exposed Population) ÷ Road Access Latency.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-lg bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs font-sans font-semibold">
            {tasks.length} Active Operational Tasks
          </span>
        </div>
      </div>

      {/* Dispatch Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="p-5 rounded-xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-red-950 border border-red-500/60 text-red-300 font-extrabold font-sans flex items-center justify-center text-sm">
                    #{task.priorityRank}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">{task.title}</h3>
                    <span className="text-[11px] text-cyan-400 font-sans font-semibold">
                      {task.district}, {task.state}
                    </span>
                  </div>
                </div>

                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                  task.status === 'active_rescue' ? 'bg-red-950 text-red-300 border border-red-500 animate-pulse' :
                  task.status === 'dispatched' ? 'bg-amber-950 text-amber-300 border border-amber-500' :
                  task.status === 'completed' ? 'bg-emerald-950 text-emerald-300 border border-emerald-500' :
                  'bg-slate-800 text-slate-300'
                }`}>
                  {task.status.replace('_', ' ')}
                </span>
              </div>

              {/* Action Details */}
              <div className="mt-3 space-y-2 text-xs">
                <div>
                  <span className="text-slate-500 text-[10px] uppercase font-sans font-semibold block tracking-wide">Required Intervention</span>
                  <p className="text-slate-200 mt-0.5 leading-relaxed">{task.requiredAction}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 text-[11px]">
                  <div>
                    <span className="text-slate-500 block text-[10px]">Assigned Unit</span>
                    <strong className="text-cyan-300 font-medium">{task.assignedTeam.name}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Team Leader & Contact</span>
                    <span className="text-slate-200">{task.assignedTeam.contactLead || (task.assignedTeam.leader ? `${task.assignedTeam.leader} (${task.assignedTeam.contact || 'Radio'})` : 'Duty Officer (+91 112)')}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Personnel & Kit</span>
                    <span className="text-slate-200">{task.assignedTeam.members} Pax • {task.assignedTeam.equipment && task.assignedTeam.equipment.length > 0 ? task.assignedTeam.equipment.join(', ') : 'Heavy Cutters, Satellite Comm & First Aid'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Estimated Arrival (ETA)</span>
                    <strong className="text-amber-300 font-sans font-semibold">{task.assignedTeam.estimatedArrivalMins} minutes</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Status Update Actions */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
              <span className="text-[11px] text-slate-500">Update Tactical Status:</span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => onUpdateTaskStatus(task.id, 'dispatched')}
                  className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-semibold transition-colors"
                >
                  Dispatched
                </button>
                <button
                  onClick={() => onUpdateTaskStatus(task.id, 'active_rescue')}
                  className="px-2 py-1 rounded bg-red-950/80 hover:bg-red-900 border border-red-500/60 text-red-200 text-xs font-semibold transition-colors"
                >
                  On-Site Rescue
                </button>
                <button
                  onClick={() => onUpdateTaskStatus(task.id, 'completed')}
                  className="px-2 py-1 rounded bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/60 text-emerald-200 text-xs font-semibold transition-colors"
                >
                  Completed
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
