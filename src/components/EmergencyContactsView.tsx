import React, { useState } from 'react';
import { NE_STATES } from '../data/mockData';
import { NEState } from '../types';
import { 
  PhoneCall, 
  MapPin, 
  Building2, 
  ShieldAlert, 
  HeartPulse, 
  Radio, 
  BookOpen,
  Search,
  ExternalLink
} from 'lucide-react';

export const EmergencyContactsView: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const stateContacts = [
    {
      state: 'Sikkim',
      sdma: 'State Disaster Management Authority (Gangtok)',
      phone: '+91 3592 201145 / 1070',
      sdrf: '1st SDRF Battalion (Tadong), +91 3592 231100',
      bro: 'Project Swastik HQ (Singtam), +91 3592 233450',
      hospital: 'STNM Multi-Speciality Hospital, Gangtok (+91 3592 202944)'
    },
    {
      state: 'Manipur',
      sdma: 'State Emergency Operations Centre (Imphal)',
      phone: '+91 385 2443441 / 1070',
      sdrf: 'Manipur SDRF Command, +91 385 2450100',
      bro: 'Project Sewak (Dimapur-Imphal Road), +91 3862 248760',
      hospital: 'RIMS Emergency Department, Imphal (+91 385 2414629)'
    },
    {
      state: 'Meghalaya',
      sdma: 'Meghalaya State Disaster Management (Shillong)',
      phone: '+91 364 2502188 / 1070',
      sdrf: 'Meghalaya Fire & SDRF, +91 364 2222222',
      bro: 'Project Setuk HQ (Shillong), +91 364 2534560',
      hospital: 'NEIGRIHMS Emergency, Mawdiangdiang (+91 364 2538011)'
    },
    {
      state: 'Arunachal Pradesh',
      sdma: 'Disaster Management Directorate (Itanagar)',
      phone: '+91 360 2212228 / 1070',
      sdrf: 'Arunachal 1st SDRF (Chimpu), +91 360 2212333',
      bro: 'Project Vartak (Tezpur/Tawang) & Project Arunank',
      hospital: 'Tomo Riba Institute of Health Sciences, Naharlagun (+91 360 2244256)'
    },
    {
      state: 'Nagaland',
      sdma: 'Nagaland State Disaster Management Authority (Kohima)',
      phone: '+91 370 2291122 / 1070',
      sdrf: 'Nagaland SDRF Battalion, +91 370 2244101',
      bro: 'Project Sewak Kohima Detachment',
      hospital: 'Naga Hospital Authority Kohima (+91 370 2222916)'
    },
    {
      state: 'Mizoram',
      sdma: 'Disaster Management & Rehabilitation (Aizawl)',
      phone: '+91 389 2335842 / 1070',
      sdrf: 'Mizoram SDRF Central Unit, +91 389 2334100',
      bro: 'Project Pushpak HQ (Aizawl), +91 389 2345678',
      hospital: 'Civil Hospital Emergency, Aizawl (+91 389 2322318)'
    },
    {
      state: 'Assam',
      sdma: 'Assam State Disaster Management Authority (Guwahati)',
      phone: '+91 361 2237221 / 1070',
      sdrf: 'Assam SDRF Battalions (Guwahati/Barpeta), 101 / 112',
      bro: 'Project Vartak & Project Pushpak Liaison',
      hospital: 'Guwahati Medical College Hospital Emergency (+91 361 2529457)'
    },
    {
      state: 'Tripura',
      sdma: 'Tripura State Disaster Management Authority (Agartala)',
      phone: '+91 381 2416045 / 1070',
      sdrf: 'TSR (Tripura State Rifles) Disaster Cell, +91 381 2323333',
      bro: 'Project Setuk Southern Detachment',
      hospital: 'AGMC & GBP Hospital Emergency (+91 381 2356701)'
    }
  ];

  const filteredContacts = stateContacts.filter(c => 
    c.state.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.sdma.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.hospital.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-[#111827] border border-cyan-500/40 rounded-xl p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 font-sans text-xs uppercase font-semibold">
            <BookOpen className="w-4 h-4 text-cyan-400" />
            <span>24x7 State Emergency Directory & Community Survival Handbook</span>
          </div>
          <h2 className="text-lg font-bold text-white mt-1">
            North Eastern Disaster Control Rooms & Medical Hotlines
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Verified direct telephone lines for SDMA, NDRF battalions, Border Roads Organisation (BRO), and trauma centers.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search state, hospital, unit..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Directory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredContacts.map((c) => (
          <div
            key={c.state}
            className="p-5 rounded-xl bg-slate-900 border border-slate-800 shadow-xl space-y-3"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-cyan-400" />
                <h3 className="font-bold text-white text-sm">{c.state}</h3>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-sans bg-cyan-950 text-cyan-300 border border-cyan-500/40">
                Toll Free: 1070 / 112
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-start gap-2">
                <Building2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-400 block text-[10px]">State Disaster Authority:</span>
                  <span className="text-slate-200 font-semibold">{c.sdma}</span>
                  <div className="text-cyan-300 font-sans mt-0.5">{c.phone}</div>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-400 block text-[10px]">SDRF Response Unit:</span>
                  <span className="text-slate-200">{c.sdrf}</span>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Radio className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-400 block text-[10px]">Border Roads Organisation (BRO):</span>
                  <span className="text-slate-200">{c.bro}</span>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <HeartPulse className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-400 block text-[10px]">Apex Trauma Hospital:</span>
                  <span className="text-slate-200">{c.hospital}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
