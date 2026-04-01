import { useState } from 'react';
import { Users, Database, AlertCircle, GraduationCap, Archive, Link, Eye, CheckCircle, Clock } from 'lucide-react';

const stats = [
  { icon: Users, label: 'Total Active Users', value: '24,582', trend: '+12%', trendColor: 'text-emerald-500', iconColor: 'text-cyan-500', bgColor: 'bg-none' },
  { icon: Database, label: 'System Storage', value: '75%', suffix: 'used', subtext: 'Warning', trendColor: 'text-[var(--dash-warm)]', iconColor: 'text-[var(--dash-warm)]', bgColor: 'bg-none' },
  { icon: AlertCircle, label: 'Pending Moderation', value: '12', subtext: 'Requires immediate action', iconColor: 'text-rose-500', bgColor: 'bg-none' },
  { icon: GraduationCap, label: 'Active Study Circles', value: '1,104', subtext: 'Live', iconColor: 'text-[var(--dash-accent)]', bgColor: 'bg-none' },
];

const recentActivity = [
  { action: 'Archived Circle #402', admin: 'Admin Sarah', time: '2 mins ago', status: 'COMPLETED', statusColor: 'text-gray-500' },
  { action: 'System updated to v2.4', admin: 'Automated System', time: '45 mins ago', status: 'SUCCESS', statusColor: 'text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded text-xs' },
  { action: 'Suspended User ID: #8891', admin: 'Admin Mike', time: '2 hours ago', status: 'COMPLETED', statusColor: 'text-gray-500' },
];

export default function AdminOverview() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">System Overview</h2>
        <p className="text-sm text-gray-500">Welcome back, Admin. Here's what's happening today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center text-center relative overflow-hidden">
            {stat.trend && <span className={`absolute top-4 right-4 text-xs font-semibold ${stat.trendColor}`}>{stat.trend}</span>}
            {stat.subtext === 'Warning' && <span className="absolute top-4 right-4 text-xs font-semibold text-[var(--dash-warm)] bg-amber-50 px-2 py-0.5 rounded-full">Warning</span>}
            {stat.subtext === 'Live' && <span className="absolute top-4 right-4 text-xs font-semibold text-[var(--dash-accent)] flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[var(--dash-accent)] animate-pulse"></span>Live</span>}
            
            <div className={`mt-2 p-2 rounded-full mb-3 ${stat.iconColor}`}>
              <stat.icon className="w-6 h-6" />
            </div>
            
            <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-extrabold text-gray-900">{stat.value}</span>
              {stat.suffix && <span className="text-sm text-gray-400">{stat.suffix}</span>}
            </div>
            {stat.subtext && stat.subtext !== 'Warning' && stat.subtext !== 'Live' && (
              <p className="text-xs text-rose-500 mt-2 font-medium">{stat.subtext}</p>
            )}
            
            {stat.label === 'System Storage' && (
              <div className="w-full h-1 bg-gray-100 rounded-full mt-4 absolute bottom-0 left-0">
                <div className="h-full bg-[var(--dash-warm)] w-3/4"></div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Growth Analytics */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Growth Analytics</h3>
                <p className="text-sm text-gray-500">Student and circle registration trend (Last 30 days)</p>
              </div>
              <select className="text-sm border-gray-200 rounded-lg text-gray-600 focus:ring-[var(--dash-accent)] focus:border-[var(--dash-accent)]">
                <option>Last 30 Days</option>
                <option>Last 7 Days</option>
              </select>
            </div>
            
            <div className="h-48 flex items-end justify-between gap-2 overflow-hidden px-2">
              {/* Dummy bar chart data */}
              {[40, 50, 65, 45, 80, 55, 95, 60, 45].map((h, i) => (
                <div key={i} className="flex gap-1 w-full max-w-[40px] h-full items-end group">
                  <div className="w-1/2 bg-teal-500 rounded-t-sm hover:opacity-80 transition-opacity" style={{ height: `${h}%` }}></div>
                  <div className="w-1/2 bg-amber-400 rounded-t-sm hover:opacity-80 transition-opacity" style={{ height: `${h * 0.7}%` }}></div>
                </div>
              ))}
            </div>
            
            <div className="flex items-center gap-4 mt-6">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span className="w-3 h-3 rounded-full bg-teal-500"></span>
                New Students
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span className="w-3 h-3 rounded-full bg-amber-400"></span>
                New Circles
              </div>
            </div>
          </div>

          {/* Recent System Activity */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-gray-900">Recent System Activity</h3>
              <button className="text-sm font-semibold text-[var(--dash-accent)] hover:text-[var(--dash-accent-strong)]">View All</button>
            </div>
            
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-xs text-gray-400 uppercase tracking-wider border-b border-gray-50">
                  <th className="pb-3 font-medium">Action</th>
                  <th className="pb-3 font-medium">Administrator</th>
                  <th className="pb-3 font-medium text-center">Timestamp</th>
                  <th className="pb-3 font-medium text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentActivity.map((activity, i) => (
                  <tr key={i} className="hover:bg-gray-50/50">
                    <td className="py-4 flex gap-3 items-center">
                      <div className="p-2 bg-gray-50 rounded-lg text-gray-400">
                        {i === 0 ? <Archive className="w-4 h-4" /> : i === 1 ? <Database className="w-4 h-4" /> : <Users className="w-4 h-4" />}
                      </div>
                      <span className="font-semibold text-gray-800">{activity.action}</span>
                    </td>
                    <td className="py-4 text-gray-600">{activity.admin}</td>
                    <td className="py-4 text-center text-gray-500 text-xs">{activity.time}</td>
                    <td className="py-4 text-right">
                      <span className={`font-semibold text-xs tracking-wide ${activity.statusColor}`}>{activity.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Sidebar Elements */}
        <div className="space-y-6">
          {/* Moderation Snapshot */}
          <div className="bg-white p-5 rounded-2xl border border-red-100 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500" />
              Moderation Snapshot
            </h3>
            
            <div className="space-y-3">
              <div className="bg-rose-50 p-3 rounded-xl border border-rose-100">
                <p className="text-xs text-gray-600 mb-0.5">Inappropriate Content Report</p>
                <p className="text-sm font-semibold text-gray-900">Circle: "Organic Chem Pro"</p>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-[10px] font-bold text-rose-500 uppercase tracking-widest">Urgent</span>
                  <button className="text-xs font-semibold text-[var(--dash-accent)]">Review Now</button>
                </div>
              </div>
              
              <div className="border border-gray-100 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                <p className="text-xs text-gray-600 mb-0.5">Spam Alert</p>
                <p className="text-sm font-semibold text-gray-900">User: Alex_99 (Mass Messages)</p>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Low Priority</span>
                  <button className="text-xs font-semibold text-[var(--dash-accent)]">Review Now</button>
                </div>
              </div>
            </div>
          </div>

          {/* System Alerts Container */}
          <div className="bg-[var(--dash-ink)] rounded-2xl p-5 text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500"></div>
            <h3 className="font-bold mb-4">System Alerts</h3>
            
            <div className="space-y-4 relative z-10">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-white">High Server Load</h4>
                  <p className="text-xs text-gray-400 mt-1">CPU usage exceeded 90% for 5 mins.</p>
                  <p className="text-[10px] text-gray-500 mt-2">Just Now</p>
                </div>
              </div>
              
              <div className="flex gap-3 bg-white/5 p-3 rounded-xl border border-white/5">
                <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-white">Database Backup Successful</h4>
                  <p className="text-xs text-gray-400 mt-1">Full system snapshot stored in Cloud Region B.</p>
                  <p className="text-[10px] text-gray-500 mt-2">15 mins ago</p>
                </div>
              </div>

               <div className="flex gap-3">
                <Clock className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-white">API Rate Limit</h4>
                  <p className="text-xs text-gray-400 mt-1">Google Books API reaching 80% daily quota.</p>
                  <p className="text-[10px] text-gray-500 mt-2">1 hour ago</p>
                </div>
              </div>
            </div>

            <button className="w-full mt-4 bg-white/10 hover:bg-white/15 text-white text-xs font-semibold py-2 rounded-lg transition-colors">
              System Health Dashboard
            </button>
          </div>

          {/* Decorative Card */}
          <div className="rounded-2xl bg-gradient-to-br from-[#121626] to-[#251b3d] p-5 text-white relative overflow-hidden group shadow-lg h-32 flex flex-col justify-end">
            <div className="absolute inset-0 z-0">
               {/* A placeholder for the image in the design */}
               <div className="absolute inset-0 bg-[#0f766e]/40 mix-blend-overlay"></div>
               <div className="absolute -right-4 -top-10 w-32 h-32 bg-[var(--dash-accent-soft)]/20 blur-2xl rounded-full"></div>
            </div>
            <div className="relative z-10">
              <h3 className="font-bold text-sm">System Audit Ready</h3>
              <p className="text-[10px] text-gray-300">Quarterly reports are now generated.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
