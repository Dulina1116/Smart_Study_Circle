import { useState } from 'react';
import { Calendar, Database, HardDrive, Shield, Bell, CheckCircle2 } from 'lucide-react';

export default function AdminSystemSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">System Configuration</h2>
        <p className="text-sm text-gray-500">Manage global institutional parameters and resource constraints.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Academic Cycles */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
              <div className="p-1.5 bg-[var(--dash-accent-soft)] text-[var(--dash-accent)] rounded-lg">
                 <Calendar className="w-4 h-4" />
              </div>
              Academic Cycles
            </h3>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
               <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Semester Start Date</label>
                  <input type="date" className="w-full border-gray-200 rounded-lg text-sm text-gray-700 bg-gray-50 focus:ring-[var(--dash-accent)] py-2.5 px-3" defaultValue="2024-09-01" />
               </div>
               <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Semester End Date</label>
                  <input type="date" className="w-full border-gray-200 rounded-lg text-sm text-gray-700 bg-gray-50 focus:ring-[var(--dash-accent)] py-2.5 px-3" defaultValue="2025-01-15" />
               </div>
            </div>

            <div className="flex items-center justify-between mb-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
               <div>
                  <h4 className="font-bold text-sm text-gray-900">Active Semester Toggle</h4>
                  <p className="text-xs text-gray-500">Enable current cycle for student enrollment</p>
               </div>
               <div className="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in">
                  <input type="checkbox" defaultChecked name="toggle" id="toggle" className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer border-[var(--dash-accent)] accent-[var(--dash-accent)]" style={{ right: 0 }} />
                  <label htmlFor="toggle" className="toggle-label block overflow-hidden h-6 rounded-full bg-[var(--dash-accent)] cursor-pointer"></label>
               </div>
            </div>

            <button className="w-full py-3 bg-[var(--dash-accent)] hover:bg-[var(--dash-accent-strong)] text-white font-bold rounded-xl shadow-sm transition-all shadow-[rgba(15,118,110,0.2)]">
               Update Cycle
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {/* Resource Constraints */}
             <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
                <div>
                   <h3 className="font-bold text-sm text-gray-900 mb-4 flex items-center gap-2">
                     <div className="p-1.5 bg-cyan-50 text-cyan-500 rounded-lg">
                        <HardDrive className="w-3.5 h-3.5" />
                     </div>
                     Resource Constraints
                   </h3>
                   <div className="mb-4">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Max File Size (MB)</label>
                      <div className="relative">
                         <input type="number" className="w-full border-gray-200 rounded-lg text-sm text-gray-700 bg-gray-50 focus:ring-[var(--dash-accent)] py-2 px-3 pr-8" defaultValue="50" />
                         <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-bold">MB</span>
                      </div>
                   </div>
                </div>
                <div>
                   <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Allowed File Types</label>
                   <div className="grid grid-cols-2 gap-2">
                       <label className="flex items-center gap-2 text-xs font-semibold text-gray-700">
                          <input type="checkbox" defaultChecked className="rounded text-[var(--dash-accent)] focus:ring-[var(--dash-accent)]" /> PDF
                       </label>
                       <label className="flex items-center gap-2 text-xs font-semibold text-gray-700">
                          <input type="checkbox" defaultChecked className="rounded text-cyan-500 focus:ring-cyan-500" /> DOCX
                       </label>
                       <label className="flex items-center gap-2 text-xs font-semibold text-gray-700">
                          <input type="checkbox" defaultChecked className="rounded text-cyan-500 focus:ring-cyan-500" /> PPTX
                       </label>
                       <label className="flex items-center gap-2 text-xs font-semibold text-gray-700">
                          <input type="checkbox" className="rounded text-cyan-500 focus:ring-cyan-500" /> ZIP
                       </label>
                   </div>
                </div>
             </div>

             {/* User Permissions */}
             <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
                <div>
                   <h3 className="font-bold text-sm text-gray-900 mb-4 flex items-center gap-2">
                     <div className="p-1.5 bg-[var(--dash-accent-soft)] text-[var(--dash-accent)] rounded-lg">
                        <Shield className="w-3.5 h-3.5" />
                     </div>
                     User Permissions
                   </h3>
                   <div className="space-y-4">
                       <label className="flex items-center justify-between text-xs font-semibold text-gray-700">
                          Student-Led Circle Creation
                          <input type="checkbox" defaultChecked className="rounded text-fuchsia-500 focus:ring-fuchsia-500 w-4 h-4" />
                       </label>
                       <label className="flex items-center justify-between text-xs font-semibold text-gray-700">
                          Direct Messaging
                          <input type="checkbox" defaultChecked className="rounded text-fuchsia-500 focus:ring-fuchsia-500 w-4 h-4" />
                       </label>
                       <label className="flex items-center justify-between text-xs font-semibold text-gray-700">
                          Public Profile Visibility
                          <input type="checkbox" className="rounded text-fuchsia-500 focus:ring-fuchsia-500 w-4 h-4" />
                       </label>
                   </div>
                </div>
             </div>

             {/* Notification Rules */}
             <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
                <div>
                   <h3 className="font-bold text-sm text-gray-900 mb-4 flex items-center gap-2">
                     <div className="p-1.5 bg-[var(--dash-accent-soft)] text-[var(--dash-accent)] rounded-lg">
                        <Bell className="w-3.5 h-3.5" />
                     </div>
                     Notification Rules
                   </h3>
                   <div className="mb-4">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">System Alert Frequency</label>
                      <select className="w-full border-gray-200 rounded-lg text-sm text-gray-700 bg-gray-50 focus:ring-[var(--dash-accent)] py-2">
                         <option>Daily Summary</option>
                         <option>Real-time</option>
                         <option>Weekly Digest</option>
                      </select>
                   </div>
                   <p className="text-[9px] text-gray-400 leading-relaxed italic">
                      * Administrators will receive high-priority security alerts regardless of this frequency setting.
                   </p>
                </div>
             </div>
          </div>
        </div>

        {/* Right Sidebar Elements */}
        <div className="space-y-6">
           {/* Storage Management */}
           <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center">
              <h3 className="font-bold text-gray-900 mb-6 w-full text-center">Storage Management</h3>
              
              <div className="relative w-40 h-40 mb-6">
                 {/* Donut Chart Mockup */}
                 <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" stroke="#f3f4f6" strokeWidth="12" fill="none" />
                    <circle cx="50" cy="50" r="40" stroke="#0f766e" strokeWidth="12" fill="none" strokeDasharray="251.2" strokeDashoffset="62.8" className="drop-shadow-sm" />
                 </svg>
                 <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-3xl font-extrabold text-gray-900 tracking-tight leading-none">75%</span>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Used</span>
                 </div>
              </div>

              <div className="text-center mb-6">
                 <p className="text-lg font-bold text-gray-900">750 GB <span className="text-gray-400 font-medium">/ 1 TB</span></p>
                 <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">Enterprise Cloud Storage</p>
              </div>

              <div className="flex w-full gap-3">
                 <button className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl transition-all">
                    Clean Up
                 </button>
                 <button className="flex-1 py-2.5 bg-[var(--dash-accent)] hover:bg-[var(--dash-accent-strong)] text-white font-bold text-xs rounded-xl shadow-sm shadow-[rgba(15,118,110,0.2)] transition-all">
                    Upgrade Plan
                 </button>
              </div>
           </div>
        </div>
      </div>

      <div className="bg-teal-600 rounded-2xl p-5 text-white flex items-center justify-between shadow-lg shadow-teal-500/20 relative overflow-hidden mt-6">
         <div className="absolute inset-0 bg-gradient-to-r from-teal-700 to-teal-600 opacity-50"></div>
         <div className="relative z-10">
            <h3 className="font-bold flex items-center gap-2">
               System Health: Optimal
            </h3>
            <p className="text-xs text-teal-100 mt-1">
               All backend clusters are operating within normal parameters.
            </p>
         </div>
         <div className="relative z-10 flex items-center gap-2 px-3 py-1.5 bg-white/20 rounded-full border border-white/20">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-white">Live Sync Active</span>
         </div>
      </div>
    </div>
  );
}
