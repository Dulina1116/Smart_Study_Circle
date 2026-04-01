import { useState } from 'react';
import { Download, Plus, Search, MoreVertical, GraduationCap, Users } from 'lucide-react';

const users = [
  { name: 'Julianna Snyders', email: 'j.snyders@university.edu', initials: 'JS', bgColor: 'bg-emerald-100 text-emerald-600', role: 'Student', roleColor: 'bg-[var(--dash-accent-soft)] text-[var(--dash-accent)]', status: 'ACTIVE', statusDot: 'bg-emerald-500', lastLogin: '24 mins ago' },
  { name: 'Dr. Marcus Vance', email: 'm.vance@facultystudy.edu', image: 'https://i.pravatar.cc/150?u=a042581f4e29026704d', role: 'Lecturer', roleColor: 'bg-amber-50 text-amber-700', status: 'ACTIVE', statusDot: 'bg-emerald-500', lastLogin: '2 hours ago' },
  { name: 'Elena Thorne', email: 'e.thorne@studentmail.org', initials: 'ET', bgColor: 'bg-gray-100 text-gray-600', role: 'Student', roleColor: 'bg-[var(--dash-accent-soft)] text-[var(--dash-accent)]', status: 'SUSPENDED', statusDot: 'bg-rose-500', statusTextClass: 'text-rose-600', lastLogin: 'Oct 12, 2023' },
  { name: 'Kevin O\'Shea', email: 'k.oshea@itdept.ssc.edu', image: 'https://i.pravatar.cc/150?u=a042581f4e29026024d', role: 'Admin', roleColor: 'bg-slate-100 text-slate-600', status: 'ACTIVE', statusDot: 'bg-emerald-500', lastLogin: '12 mins ago' },
];

export default function AdminUserManagement() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
          <p className="text-sm text-gray-500">Audit, modify, and manage authentication for all registered users.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-50 shadow-sm transition-all">
            <Download className="w-4 h-4" /> Export
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-[var(--dash-accent)] text-white text-sm font-semibold rounded-xl hover:bg-[var(--dash-accent-strong)] shadow-sm transition-all focus:ring-2 focus:ring-[var(--dash-accent-soft)]">
            <Plus className="w-4 h-4" /> New User
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 flex flex-col relative overflow-hidden shadow-sm">
           <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--dash-accent-soft)]/30 rounded-full blur-2xl -translate-y-1/2 translate-x-1/4"></div>
           <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 relative z-10">Total Users</p>
           <div className="flex items-baseline gap-2 relative z-10">
              <span className="text-2xl font-extrabold text-gray-900">12,842</span>
              <span className="text-xs font-semibold text-emerald-500 bg-emerald-50 px-1.5 py-0.5 rounded-full">+4%</span>
           </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 flex flex-col relative shadow-sm">
           <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Students</p>
           <div className="flex items-center justify-between">
              <span className="text-2xl font-extrabold text-gray-900">11,204</span>
              <GraduationCap className="w-6 h-6 text-gray-200" />
           </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 flex flex-col relative shadow-sm">
           <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Lecturers</p>
           <div className="flex items-center justify-between">
             <span className="text-2xl font-extrabold text-gray-900">1,482</span>
             <Users className="w-6 h-6 text-gray-200" />
           </div>
        </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-100 flex flex-col relative shadow-sm">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Active Now</p>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-extrabold text-[var(--dash-accent)]">924</span>
              <div className="flex gap-1">
                 <div className="w-1.5 h-1.5 rounded-full bg-[var(--dash-accent)] animate-pulse"></div>
                 <div className="w-1.5 h-1.5 rounded-full bg-[var(--dash-accent)] animate-pulse delay-75"></div>
              </div>
            </div>
         </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
         <div className="p-4 border-b border-gray-50 flex flex-wrap gap-4 items-center justify-between">
            <div className="flex gap-3">
               <select className="text-sm font-medium border-gray-200 text-gray-700 rounded-lg py-1.5 px-3 bg-gray-50 hover:bg-gray-100 cursor-pointer outline-none">
                  <option>All Roles</option>
                  <option>Student</option>
                  <option>Lecturer</option>
                  <option>Admin</option>
               </select>
               <select className="text-sm font-medium border-gray-200 text-gray-700 rounded-lg py-1.5 px-3 bg-gray-50 hover:bg-gray-100 cursor-pointer outline-none">
                  <option>All Status</option>
                  <option>Active</option>
                  <option>Suspended</option>
               </select>
            </div>
            
            <div className="flex items-center gap-4 hidden md:flex">
               <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Bulk Actions:</span>
               <button className="text-xs font-bold text-rose-500 hover:text-rose-600 transition-colors">Suspend Selected</button>
               <button className="text-xs font-bold text-[var(--dash-accent)] hover:text-[var(--dash-accent-strong)] transition-colors">Reset Password</button>
            </div>
         </div>

         <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
               <thead>
                  <tr className="text-[10px] text-gray-400 uppercase tracking-wider border-b border-gray-50 bg-gray-50/50">
                     <th className="px-6 py-4 font-bold w-12 text-center">
                        <input type="checkbox" className="rounded border-gray-300 text-[var(--dash-accent)] focus:ring-[var(--dash-accent)]" />
                     </th>
                     <th className="px-6 py-4 font-bold">Name</th>
                     <th className="px-6 py-4 font-bold text-center">Role</th>
                     <th className="px-6 py-4 font-bold">Status</th>
                     <th className="px-6 py-4 font-bold">Last Login</th>
                     <th className="px-6 py-4 font-bold text-right">Actions</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-gray-50">
                  {users.map((user, i) => (
                     <tr key={i} className="hover:bg-gray-50/30 transition-colors group">
                        <td className="px-6 py-4 text-center">
                           <input type="checkbox" className="rounded border-gray-300 text-[var(--dash-accent)] focus:ring-[var(--dash-accent)] opacity-0 group-hover:opacity-100 transition-opacity" />
                        </td>
                        <td className="px-6 py-4 flex items-center gap-4">
                           {user.image ? (
                              <img src={user.image} alt={user.name} className="w-10 h-10 rounded-full object-cover border border-gray-100 shadow-sm" />
                           ) : (
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold ${user.bgColor} border border-gray-50 shadow-sm`}>
                                 {user.initials}
                              </div>
                           )}
                           <div>
                              <p className="font-bold text-gray-900 group-hover:text-[var(--dash-accent)] transition-colors">{user.name}</p>
                              <p className="text-xs text-gray-500">{user.email}</p>
                           </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                           <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${user.roleColor}`}>
                              {user.role === 'Student' && <GraduationCap className="w-3 h-3" />}
                              {user.role === 'Lecturer' && <Users className="w-3 h-3" />}
                              {user.role === 'Admin' && <Users className="w-3 h-3" />}
                              {user.role}
                           </span>
                        </td>
                        <td className="px-6 py-4">
                           <span className={`inline-flex items-center gap-1.5 text-xs font-bold ${user.statusTextClass || 'text-emerald-600'}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${user.statusDot}`}></span>
                              {user.status}
                           </span>
                        </td>
                        <td className="px-6 py-4 text-gray-500 text-xs font-medium">{user.lastLogin}</td>
                        <td className="px-6 py-4 text-right">
                           <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                              <MoreVertical className="w-4 h-4" />
                           </button>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>

         <div className="p-4 border-t border-gray-50 flex items-center justify-between text-sm text-gray-500">
            <p>Showing 1 to 4 of 12,842 users</p>
            <div className="flex gap-1 items-center">
              <button className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-50">&lt;</button>
              <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-[var(--dash-accent)] text-white font-bold shadow-sm">1</button>
              <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-50 font-medium text-gray-600">2</button>
              <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-50 font-medium text-gray-600">3</button>
              <span className="px-1 text-gray-400">...</span>
              <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-50 font-medium text-gray-600">452</button>
              <button className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-50">&gt;</button>
            </div>
         </div>
      </div>
    </div>
  );
}
