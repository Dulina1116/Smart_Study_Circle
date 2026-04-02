import { useState } from 'react';
import { Plus, Eye, Trash2, Shield, Settings2, Sparkles, TrendingUp } from 'lucide-react';

const circles = [
  { name: 'Quantum Study Group', id: '#CS-9021', initials: 'QS', color: 'bg-emerald-100 text-emerald-600', subject: 'Physics', members: 142, activity: 'High', activityColor: 'text-emerald-500', date: 'Oct 12, 2023' },
  { name: 'Algo Logic Pro', id: '#CS-8442', initials: 'AL', color: 'bg-blue-100 text-blue-600', subject: 'Comp Sci', members: 89, activity: 'Medium', activityColor: 'text-amber-500', date: 'Nov 05, 2023' },
  { name: 'Modern History Hub', id: '#HS-1102', initials: 'MH', color: 'bg-rose-100 text-rose-600', subject: 'History', members: 34, activity: 'Low', activityColor: 'text-rose-500', date: 'Dec 01, 2023' },
  { name: 'Eco Bio Warriors', id: '#BI-5561', initials: 'EB', color: 'bg-[var(--dash-accent-soft)] text-[var(--dash-accent)]', subject: 'Biology', members: 215, activity: 'High', activityColor: 'text-emerald-500', date: 'Jan 14, 2024' },
];

export default function AdminCircleManagement() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Circle Management</h2>
          <p className="text-sm text-gray-500">Monitor and moderate active study circles across the platform.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-[var(--dash-accent)] text-white text-sm font-semibold rounded-xl hover:bg-[var(--dash-accent-strong)] shadow-sm transition-all shadow-[rgba(15,118,110,0.2)]">
          <Plus className="w-4 h-4" /> Create New Circle
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm md:w-1/3 flex flex-col justify-center">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total Circles</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-gray-900">1,284</span>
          </div>
          <p className="text-xs font-semibold text-emerald-500 mt-2 flex items-center gap-1">
             <TrendingUp className="w-3 h-3" /> +12% this month
          </p>
        </div>
        
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm md:w-2/3 flex items-center gap-4">
           <div className="flex-1">
             <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Filter By Subject</label>
             <select className="w-full border-gray-200 rounded-lg text-sm text-gray-700 bg-gray-50 focus:ring-[var(--dash-accent)] py-2">
               <option>All Subjects</option>
               <option>Computer Science</option>
               <option>Physics</option>
             </select>
           </div>
           <div className="flex-1">
             <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Filter By Activity</label>
             <select className="w-full border-gray-200 rounded-lg text-sm text-gray-700 bg-gray-50 focus:ring-[var(--dash-accent)] py-2">
               <option>All Levels</option>
               <option>High</option>
               <option>Medium</option>
             </select>
           </div>
           <div className="pt-5">
             <button className="px-4 py-2 border border-gray-200 text-gray-600 font-semibold text-sm rounded-lg hover:bg-gray-50 transition-colors bg-white shadow-sm whitespace-nowrap">
                Reset Filters
             </button>
           </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6">
         <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
               <thead>
                  <tr className="text-[10px] text-gray-400 uppercase tracking-wider border-b border-gray-50 bg-gray-50/30">
                     <th className="px-6 py-4 font-bold">Circle Name</th>
                     <th className="px-6 py-4 font-bold text-center">Subject</th>
                     <th className="px-6 py-4 font-bold text-center">Member Count</th>
                     <th className="px-6 py-4 font-bold">Activity Level</th>
                     <th className="px-6 py-4 font-bold">Creation Date</th>
                     <th className="px-6 py-4 font-bold text-right">Actions</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-gray-50">
                  {circles.map((circle, i) => (
                     <tr key={i} className="hover:bg-gray-50/50 transition-colors group">
                        <td className="px-6 py-4 flex items-center gap-4">
                           <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold ${circle.color} shadow-sm group-hover:scale-105 transition-transform`}>
                              {circle.initials}
                           </div>
                           <div>
                              <p className="font-bold text-gray-900 group-hover:text-[var(--dash-accent)] transition-colors">{circle.name}</p>
                              <p className="text-xs text-gray-400 font-medium tracking-wide">ID: {circle.id}</p>
                           </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                           <span className="text-gray-600 font-medium text-xs">{circle.subject}</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                           <span className="text-gray-900 font-bold">{circle.members}</span>
                        </td>
                        <td className="px-6 py-4">
                           <span className={`inline-flex items-center gap-1.5 text-xs font-bold ${circle.activityColor}`}>
                              <span className={`w-1.5 h-1.5 rounded-full bg-current`}></span>
                              {circle.activity}
                           </span>
                        </td>
                        <td className="px-6 py-4 text-gray-500 font-medium text-xs">
                           {circle.date}
                        </td>
                        <td className="px-6 py-4">
                           <div className="flex justify-end gap-2">
                              <button className="p-1.5 text-gray-400 hover:text-[var(--dash-accent)] hover:bg-[var(--dash-accent-soft)] border border-transparent hover:border-[rgba(15,118,110,0.1)] rounded-lg transition-all delay-75">
                                 <Eye className="w-4 h-4" />
                              </button>
                              <button className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 rounded-lg transition-all delay-75">
                                 <Trash2 className="w-4 h-4" />
                              </button>
                           </div>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>

         <div className="p-4 border-t border-gray-50 flex items-center justify-between text-sm text-gray-500">
            <p>Showing 1 to 4 of 1,284 entries</p>
            <div className="flex gap-1 items-center">
              <button className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-50">&lt;</button>
              <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-[var(--dash-accent)] text-white font-bold shadow-sm">1</button>
              <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-50 font-medium text-gray-600">2</button>
              <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-50 font-medium text-gray-600">3</button>
              <span className="px-1 text-gray-400">...</span>
              <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-50 font-medium text-gray-600">128</button>
              <button className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-50">&gt;</button>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         {/* Automated Moderation */}
         <div className="bg-[linear-gradient(135deg,#0f766e,#14b8a6)] rounded-2xl p-6 text-white relative overflow-hidden shadow-lg shadow-[rgba(15,118,110,0.2)]">
            <div className="absolute -right-4 top-1/2 -translate-y-1/2 opacity-20 transform rotate-12">
               <Sparkles className="w-48 h-48" />
            </div>
            <div className="relative z-10 w-3/4">
               <h3 className="text-xl font-bold mb-2">Automated Moderation</h3>
               <p className="text-sm text-white/80 mb-6 leading-relaxed">
                  Enable AI-powered filters to maintain community standards automatically.
               </p>
               <button className="bg-white text-[var(--dash-accent)] font-bold px-5 py-2.5 rounded-xl flex items-center gap-2 hover:bg-[var(--dash-surface-2)] hover:scale-105 transition-all shadow-sm">
                  <Settings2 className="w-4 h-4" /> Configure AI
               </button>
            </div>
         </div>

         {/* Platform Health */}
         <div className="bg-[var(--dash-ink)] rounded-2xl p-6 text-white shadow-xl relative flex flex-col justify-between">
            <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
               <Shield className="w-5 h-5 text-gray-400" /> Platform Health
            </h3>
            
            <div className="space-y-5">
               <div>
                  <div className="flex justify-between text-xs font-semibold mb-2">
                     <span className="text-gray-400">Active Circles</span>
                     <span className="text-[var(--dash-accent)]">88%</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                     <div className="h-full bg-[var(--dash-accent)] w-[88%] rounded-full shadow-[0_0_10px_rgba(15,118,110,0.5)]"></div>
                  </div>
               </div>

               <div>
                  <div className="flex justify-between text-xs font-semibold mb-2">
                     <span className="text-gray-400">Member Retention</span>
                     <span className="text-blue-400">72%</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                     <div className="h-full bg-blue-500 w-[72%] rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                  </div>
               </div>
            </div>

            <p className="text-[10px] text-gray-500 mt-6 pt-4 border-t border-white/10">Last global sync: 2 minutes ago</p>
         </div>
      </div>
    </div>
  );
}
