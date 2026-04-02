import { useState } from 'react';
import { Filter, FileText, MessageSquare, AlertTriangle, ShieldCheck } from 'lucide-react';

const queue = [
  { type: 'Resource: Adv Physics Notes', id: '#RE-9021', icon: FileText, color: 'text-blue-500 bg-blue-50', reporter: 'Sarah Jenkins', reason: 'Copyright Violation', reasonColor: 'text-amber-500', date: 'Oct 24, 2023 - 14:20', severity: 'Urgent', severityColor: 'text-rose-500 bg-rose-50' },
  { type: 'Discussion: Study Hack...', id: '#DP-4412', icon: MessageSquare, color: 'text-[var(--dash-accent)] bg-[var(--dash-accent-soft)]', reporter: 'Michael Chen', reason: 'Spam', reasonColor: 'text-gray-500', date: 'Oct 24, 2023 - 15:45', severity: 'Low', severityColor: 'text-gray-500 bg-gray-50' },
  { type: 'Resource: Quiz PDF', id: '#RE-1102', icon: FileText, color: 'text-blue-500 bg-blue-50', reporter: 'System', reason: 'Inappropriate Content', reasonColor: 'text-rose-500', date: 'Oct 24, 2023 - 16:10', severity: 'Medium', severityColor: 'text-amber-500 bg-amber-50' },
  { type: 'Discussion: Exam Anxiety', id: '#DP-9981', icon: MessageSquare, color: 'text-[var(--dash-accent)] bg-[var(--dash-accent-soft)]', reporter: 'Aisha K.', reason: 'Harassment', reasonColor: 'text-rose-500', date: 'Oct 24, 2023 - 17:05', severity: 'Urgent', severityColor: 'text-rose-500 bg-rose-50' },
];

export default function AdminContentModeration() {
  const [activeTab, setActiveTab] = useState('All Content');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Content Moderation Queue</h2>
        <p className="text-sm text-gray-500">Review and manage reported content across the platform.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center">
           <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Total Flagged</p>
           <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-gray-900">128</span>
              <span className="text-xs font-semibold text-rose-500">+12 today</span>
           </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center">
           <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Pending Review</p>
           <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-gray-900">42</span>
              <span className="text-xs font-semibold text-amber-500">Action Required</span>
           </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center">
           <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Resolved (24h)</p>
           <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-gray-900">86</span>
              <span className="text-xs font-semibold text-emerald-500">92% efficiency</span>
           </div>
        </div>
        <div className="bg-[var(--dash-accent)] p-5 rounded-2xl shadow-lg shadow-[rgba(15,118,110,0.2)] text-white flex flex-col justify-center relative overflow-hidden">
           <div className="absolute -right-4 -bottom-4 bg-white/10 w-24 h-24 rounded-full blur-xl"></div>
           <p className="text-[10px] font-bold text-teal-100 uppercase tracking-widest mb-2 relative z-10">Average Response</p>
           <div className="flex items-baseline gap-2 relative z-10">
              <span className="text-2xl font-extrabold text-white">1.4h</span>
              <span className="text-xs font-semibold text-teal-200">Target: 2h</span>
           </div>
        </div>
      </div>

      <div className="flex items-center justify-between border-b border-gray-100 pb-4">
         <div className="flex gap-6">
            {['All Content', 'Urgent Only', 'Spam'].map(tab => (
               <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`text-sm font-bold relative transition-colors ${activeTab === tab ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
               >
                  {tab}
                  {activeTab === tab && (
                     <span className="absolute -bottom-[18px] left-0 w-full h-0.5 bg-[var(--dash-accent)] rounded-t"></span>
                  )}
               </button>
            ))}
         </div>
         <button className="flex items-center gap-2 px-4 py-2 bg-[var(--dash-ink)] text-white text-xs font-bold rounded-xl hover:bg-black shadow-sm transition-all">
            <Filter className="w-3 h-3" /> More Filters
         </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6">
         <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
               <thead>
                  <tr className="text-[10px] text-gray-400 uppercase tracking-wider border-b border-gray-50 bg-gray-50/30">
                     <th className="px-6 py-4 font-bold">Content Type</th>
                     <th className="px-6 py-4 font-bold">Reported By</th>
                     <th className="px-6 py-4 font-bold">Reason</th>
                     <th className="px-6 py-4 font-bold">Date Flagged</th>
                     <th className="px-6 py-4 font-bold text-center">Severity</th>
                     <th className="px-6 py-4 font-bold text-right">Actions</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-gray-50">
                  {queue.map((item, i) => (
                     <tr key={i} className="hover:bg-gray-50/50 transition-colors group">
                        <td className="px-6 py-4 flex items-start gap-4">
                           <div className={`p-2 rounded-lg ${item.color} mt-1`}>
                              <item.icon className="w-4 h-4" />
                           </div>
                           <div>
                              <p className="font-bold text-gray-900 group-hover:text-[var(--dash-accent)] transition-colors">{item.type}</p>
                              <p className="text-[10px] text-gray-400 font-medium tracking-wide mt-0.5">ID: {item.id}</p>
                           </div>
                        </td>
                        <td className="px-6 py-4">
                           <span className="font-bold text-gray-700">{item.reporter}</span>
                        </td>
                        <td className="px-6 py-4">
                           <span className={`text-xs font-bold tracking-wide ${item.reasonColor}`}>{item.reason}</span>
                        </td>
                        <td className="px-6 py-4 text-gray-500 font-medium text-xs">
                           {item.date}
                        </td>
                        <td className="px-6 py-4 text-center">
                           <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${item.severityColor}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${item.severity === 'Urgent' ? 'bg-rose-500' : item.severity === 'Medium' ? 'bg-amber-500' : 'bg-gray-400'}`}></span>
                              {item.severity}
                           </span>
                        </td>
                        <td className="px-6 py-4">
                           <div className="flex justify-end items-center gap-3">
                              <button className="text-xs font-bold text-gray-500 hover:text-gray-800 transition-colors">
                                 Dismiss
                              </button>
                              <button className="px-3 py-1.5 bg-[var(--dash-accent)] hover:bg-[var(--dash-accent-strong)] text-white text-xs font-bold rounded-lg shadow-sm shadow-[rgba(15,118,110,0.2)] transition-all">
                                 Review Detail
                              </button>
                           </div>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>

         <div className="p-4 border-t border-gray-50 flex items-center justify-between text-sm text-gray-500">
            <p>Showing 1 to 4 of 128 results</p>
            <div className="flex gap-1 items-center">
              <button className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-50">&lt;</button>
              <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-[var(--dash-accent)] text-white font-bold shadow-sm">1</button>
              <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-50 font-medium text-gray-600">2</button>
              <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-50 font-medium text-gray-600">3</button>
              <button className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-50">&gt;</button>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {/* Automated Policy Update */}
         <div className="md:col-span-2 bg-[linear-gradient(135deg,#0f766e,#14b8a6)] rounded-2xl p-6 text-white relative overflow-hidden shadow-lg shadow-[rgba(15,118,110,0.2)]">
            <div className="absolute right-0 top-1/2 -translate-y-1/2 opacity-20 transform rotate-12 -translate-x-4">
               <AlertTriangle className="w-40 h-40" />
            </div>
            <div className="relative z-10 w-[80%]">
               <h3 className="text-xl font-bold mb-2">Automated Policy Update</h3>
               <p className="text-sm text-teal-50 mb-6 leading-relaxed">
                  We've updated our spam detection algorithms for Discussion Posts. 15% more items are now being flagged automatically for human review.
               </p>
               <button className="bg-white text-[var(--dash-accent)] font-bold px-5 py-2.5 rounded-xl hover:bg-[var(--dash-surface-2)] hover:scale-105 transition-all shadow-sm">
                  Review New Guidelines
               </button>
            </div>
         </div>

         {/* Moderator Stats */}
         <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm transform hover:-translate-y-1 transition-transform">
            <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                   <ShieldCheck className="w-5 h-5 text-emerald-500" /> Moderator Stats
                </h3>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-4 mb-4 border border-gray-100 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Your Streak</p>
                </div>
                <div>
                   <span className="text-2xl font-extrabold text-gray-900">12 Days</span>
                </div>
            </div>

            <p className="text-[10px] text-gray-400 leading-relaxed font-medium">
               <span className="text-emerald-500 font-bold">You're in the top 5%</span> of active moderators this month. Keep up the safety focus!
            </p>
         </div>
      </div>
    </div>
  );
}
