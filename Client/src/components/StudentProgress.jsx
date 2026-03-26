import React, { useState, useEffect } from 'react';
import { 
  Share2, FileText, Zap, Users, Download, ChevronRight, CheckCircle2, 
  Award, Target, BookOpen, FileVideo, ChevronUp, ChevronDown 
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  AreaChart, Area, Cell
} from 'recharts';

export default function StudentProgress({ user, role = 'student' }) {
  const isAdmin = role === 'admin';
  const [progressData, setProgressData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        let endpoint = '';
        if (isAdmin) {
          endpoint = 'http://localhost:5000/api/progress/admin/overview';
        } else {
          const userId = user?._id || '60d21b4667d0d8992e610c85'; // Fallback for dev if needed
          endpoint = `http://localhost:5000/api/progress/student/${userId}`;
        }

        const response = await fetch(endpoint);
        if (!response.ok) {
          throw new Error(`Failed to fetch: ${response.statusText}`);
        }
        const result = await response.json();
        
        if (result.success) {
          setProgressData(result);
        } else {
          throw new Error(result.message || 'Error fetching progress data');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProgress();
  }, [isAdmin, user]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50/50 min-h-[500px]">
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-500 font-semibold tracking-wide animate-pulse">Loading progress data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50/50 min-h-[500px]">
        <div className="bg-red-50 text-red-600 px-6 py-4 rounded-xl border border-red-100 flex items-center gap-3">
          <svg className="w-6 h-6 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="font-bold">{error}</span>
          <button onClick={() => window.location.reload()} className="ml-4 underline font-semibold text-sm hover:text-red-800">Retry</button>
        </div>
      </div>
    );
  }

  if (!progressData) return null;

  const summary = progressData.summary || {};
  
  // Safely get engagement arrays or apply empty fallbacks so charts don't crash
  const engagementData = progressData.weeklyEngagement?.length > 0 
    ? progressData.weeklyEngagement 
    : [
        { day: 'Mon', hours: 0 }, { day: 'Tue', hours: 0 }, { day: 'Wed', hours: 0 },
        { day: 'Thu', hours: 0 }, { day: 'Fri', hours: 0 }, { day: 'Sat', hours: 0 }, { day: 'Sun', hours: 0 }
      ];
      
  const studyPlanData = progressData.monthlyEngagement?.length > 0
    ? progressData.monthlyEngagement
    : [
        { name: 'W1', focus: 0 }, { name: 'W2', focus: 0 }, { name: 'W3', focus: 0 }, { name: 'W4', focus: 0 }
      ];

  const modules = isAdmin ? (progressData.moduleBreakdown || []) : (progressData.modules || []);
  const topGroups = progressData.topPerformingGroups || [];

  // Derived calculations for Hero
  let activePercentage = 0;
  if (isAdmin) {
    activePercentage = summary.totalStudents > 0 
      ? Math.round((summary.activeStudents / summary.totalStudents) * 100) 
      : 0;
  } else {
    activePercentage = progressData.joinedCircles > 0 
      ? Math.round((progressData.activeCircles / progressData.joinedCircles) * 100) 
      : 0;
  }

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50/50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-[#0f172a] tracking-tight mb-2">
              {isAdmin ? "Platform Overview" : "Student Progress"}
            </h1>
            <p className="text-gray-500">
              {isAdmin 
                ? "Monitor platform-wide engagement, resource sharing, and study circle activity." 
                : "Track academic engagement, collaboration, and learning progress."}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <select className="bg-white border border-gray-200 text-gray-700 font-semibold px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-light">
              <option>This Month</option>
              <option>Last Month</option>
              <option>This Semester</option>
            </select>
            <button className="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 font-semibold px-4 py-2.5 rounded-xl text-sm flex items-center transition-colors">
              <Download className="w-4 h-4 mr-2 text-gray-500" />
              Report
            </button>
          </div>
        </div>

        {/* Hero Card */}
        <div className="bg-primary rounded-3xl p-8 md:p-10 text-white relative overflow-hidden shadow-lg shadow-primary/20 flex flex-col md:flex-row justify-between items-center group">
          <div className="absolute inset-0 bg-gradient-to-r from-primary-dark/80 to-transparent z-0"></div>
          
          <div className="relative z-10 w-full md:w-2/3 mb-8 md:mb-0">
            <span className="inline-block bg-white/20 px-3 py-1 rounded-full text-xs font-extrabold tracking-wider uppercase mb-4 backdrop-blur-sm">
              {isAdmin ? "Platform Health" : "Weekly Goal"}
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold mb-3">
              {isAdmin ? "System Activity Synopsis" : "Your learning streak"}
            </h2>
            <p className="text-primary-light text-sm md:text-base mb-8 max-w-lg leading-relaxed">
              {isAdmin 
                ? "Review dynamic data aggregated directly from all recorded endpoints and user documents to ensure maximum platform utility." 
                : "Great job! By participating in active study circles, you continuously compound your learning abilities."}
            </p>
            
            <div className="flex gap-6 items-center">
              <div>
                <p className="text-white font-bold text-lg leading-none uppercase">
                  {isAdmin ? `${summary.totalStudents || 0} NETWORK USERS` : `${summary.engagementScore || 0} POINTS`}
                </p>
                <div className="h-1 bg-white/20 w-32 mt-2 rounded-full overflow-hidden">
                  <div className="h-full bg-white w-[75%]"></div>
                </div>
              </div>
              <div>
                <p className="text-white font-bold text-lg leading-none uppercase">
                  {isAdmin ? `${summary.totalModules || 0} MODULES RUNNING` : `${progressData.activeCircles || 0} ACTIVE CIRCLES`}
                </p>
                <div className="h-1 bg-white/20 w-32 mt-2 rounded-full overflow-hidden">
                  <div className="h-full bg-white w-1/2"></div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Circular Progress */}
          <div className="relative z-10 flex items-center justify-center shrink-0 mr-4 md:mr-10">
            <svg viewBox="0 0 36 36" className="w-40 h-40 transform -rotate-90 text-white stroke-current">
              <path
                className="text-white/20"
                strokeWidth="3"
                strokeDasharray="100, 100"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
              />
              <path
                className="text-white drop-shadow-lg transition-all duration-1000 ease-out"
                strokeWidth="3"
                strokeDasharray={`${activePercentage}, 100`}
                strokeLinecap="round"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-4xl font-extrabold tracking-tighter">{activePercentage}%</span>
              <span className="text-[10px] font-bold tracking-widest uppercase text-white/80">
                {isAdmin ? "Active Ratio" : "Active"}
              </span>
            </div>
          </div>
        </div>

        {/* 4 Summary Tiles */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Tile 1 */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-500">
                <Share2 className="w-6 h-6" />
              </div>
              <span className="bg-indigo-50 text-indigo-600 text-xs font-bold px-2 py-1 rounded-lg flex items-center">
                <ChevronUp className="w-3 h-3 ml-0.5" />
              </span>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                {isAdmin ? "Total Resources Shared" : "Resources Shared"}
              </p>
              <h3 className="text-3xl font-extrabold text-gray-900">
                {isAdmin ? (summary.totalResourcesShared || 0).toLocaleString() : (summary.resourcesShared || 0).toLocaleString()}
              </h3>
            </div>
          </div>
          
          {/* Tile 2 */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-500">
                <FileText className="w-6 h-6" />
              </div>
              <span className="bg-blue-50 text-blue-600 text-xs font-bold px-2 py-1 rounded-lg flex items-center">
                <ChevronUp className="w-3 h-3 ml-0.5" />
              </span>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                {isAdmin ? "Total Study Plans" : "Study Plans"}
              </p>
              <h3 className="text-3xl font-extrabold text-gray-900">
                {isAdmin ? (summary.totalStudyPlansCreated || 0).toLocaleString() : (summary.studyPlansCreated || 0).toLocaleString()}
              </h3>
            </div>
          </div>

          {/* Tile 3 */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 flex items-center justify-center text-teal-500">
                {isAdmin ? <Users className="w-6 h-6 fill-current" /> : <Zap className="w-6 h-6 fill-current" />}
              </div>
              <span className="bg-teal-50 text-teal-600 text-xs font-bold px-2 py-1 rounded-lg flex items-center">
                <ChevronUp className="w-3 h-3 ml-0.5" />
              </span>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                {isAdmin ? "Total Students" : "Engagement Score"}
              </p>
              <h3 className="text-3xl font-extrabold text-gray-900">
                {isAdmin ? (summary.totalStudents || 0).toLocaleString() : (summary.engagementScore || 0).toLocaleString()}
              </h3>
            </div>
          </div>

          {/* Tile 4 */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-500">
                {isAdmin ? <BookOpen className="w-6 h-6" /> : <Users className="w-6 h-6" />}
              </div>
              <span className="bg-emerald-50 text-emerald-500 text-xs font-bold px-2 py-1 rounded-lg flex items-center">
                <ChevronUp className="w-3 h-3 ml-0.5" />
              </span>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                {isAdmin ? "Active Circles" : "Group Activity"}
              </p>
              <h3 className="text-3xl font-extrabold text-gray-900">
                {isAdmin ? (summary.activeStudyCircles || 0).toLocaleString() : (summary.groupActivity || 0).toLocaleString()}
              </h3>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Weekly Engagement Chart */}
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm flex flex-col">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-lg font-bold text-gray-900">
                {isAdmin ? "Platform Engagement (Hours)" : "Weekly Engagement"}
              </h3>
              <button className="text-sm font-semibold text-primary hover:text-primary-dark">Details</button>
            </div>
            <div className="flex-1 min-h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={engagementData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280', fontWeight: 600 }} dy={10} />
                  <Tooltip cursor={{ fill: '#f3f4f6', opacity: 0.4 }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Bar dataKey="hours" radius={[6, 6, 6, 6]}>
                    {
                      engagementData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.day === 'Fri' ? '#00b8a9' : '#e0f7f5'} />
                      ))
                    }
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Monthly Progress */}
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm flex flex-col relative overflow-hidden">
            <h3 className="text-lg font-bold text-gray-900 mb-2 z-10 relative">
              {isAdmin ? "Platform Objective Activity" : "Study Plan Focus"}
            </h3>
            
            <div className="absolute inset-x-0 bottom-0 top-16 right-0 opacity-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={studyPlanData} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorFocus" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#9ca3af" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#9ca3af" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Tooltip cursor={{ stroke: '#d1d5db', strokeWidth: 1, strokeDasharray: '4 4' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Area type="monotone" dataKey="focus" stroke="#6b7280" strokeWidth={3} fillOpacity={1} fill="url(#colorFocus)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1"></div>
            <div className="flex items-center gap-2 relative z-10 pb-4">
              <span className="w-2 h-2 rounded-full bg-gray-500"></span>
              <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                {isAdmin ? "Overall Network Focus" : "Focused Study"}
              </span>
            </div>
          </div>
        </div>

        {/* Academic Modules / Breakdowns */}
        <div>
          <div className="flex justify-between items-center mb-6 mt-4">
            <h2 className="text-xl font-extrabold text-[#0f172a] tracking-tight">
              {isAdmin ? "Platform Module Breakdown" : "Your Academic Modules"}
            </h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {modules.length > 0 ? (
              modules.map((mod, index) => {
                const colors = ['blue', 'emerald', 'fuchsia', 'orange'];
                const c = colors[index % colors.length];
                return (
                  <div key={index} className={`bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:border-${c}-200 transition-colors`}>
                    <div className="flex justify-between items-start mb-4">
                      <div className={`w-10 h-10 rounded-xl bg-${c}-50 text-${c}-600 flex items-center justify-center`}>
                        <BookOpen className="w-5 h-5" />
                      </div>
                      <span className="bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider">
                        {mod.semester || 'TERM'}
                      </span>
                    </div>
                    <h3 className="font-bold text-gray-900 mb-1 truncate">{mod.moduleCode || 'Unknown Module'}</h3>
                    <p className="text-xs text-gray-500 mb-4 truncate">
                      {isAdmin ? `${mod.totalStudents || 0} Students Accessing` : `${mod.subject || 'Enrolled Course'}`}
                    </p>
                    
                    <div className="flex justify-between text-xs font-bold mb-1.5">
                      <span className="text-gray-400">Activity Level</span>
                      <span className={`text-${c}-600`}>{isAdmin ? (mod.studyCirclesCount || 0) + ' Circles' : 'Active'}</span>
                    </div>
                    <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full bg-${c}-600 rounded-full`} style={{ width: isAdmin ? `${Math.min((mod.studyCirclesCount / summary.activeStudyCircles) * 100 || 0, 100)}%` : '75%' }}></div>
                    </div>
                  </div>
                )
              })
            ) : (
               <div className="col-span-full bg-white rounded-2xl p-8 border border-gray-100 text-center text-gray-500 shadow-sm">
                 <BookOpen className="w-10 h-10 mx-auto text-gray-300 mb-3" />
                 <p className="font-semibold">{isAdmin ? "No modules have been tracked on the platform yet." : "You haven't joined any modules yet."}</p>
                 <p className="text-sm">Active study circle data will automatically appear here.</p>
               </div>
            )}
          </div>
        </div>

        {/* Bottom Banner: Group Peer Comparison */}
        <div className="bg-white rounded-3xl p-8 md:p-10 border border-gray-100 flex flex-col md:flex-row gap-10 items-center justify-between shadow-sm relative overflow-hidden">
          {/* Abstract background decor */}
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-primary-light/50 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-primary-light/30 rounded-full blur-3xl pointer-events-none"></div>

          <div className="md:w-1/2 relative z-10">
            <h2 className="text-3xl font-extrabold text-[#0f172a] mb-4 leading-tight">
              {isAdmin && topGroups.length > 0 ? "Top Performing Circles" : "Group Peer Comparison"}
            </h2>
            <p className="text-gray-500 text-sm leading-relaxed mb-8">
              {isAdmin 
                ? "The groups represented here have the highest number of active memberships and interactions across all registered study circles this semester."
                : "Your groups are performing exceptionally well. Ensure consistent participation to unlock specific circle achievements!"}
            </p>
            <div className="flex items-center gap-3 bg-primary-light/50 rounded-2xl p-4 border border-primary-light w-fit">
              <Award className="w-5 h-5 text-primary-dark" />
              <span className="text-sm font-bold text-primary-dark tracking-wide truncate max-w-[200px]">
                {isAdmin ? `Leading: ${topGroups[0]?.name || 'N/A'}` : `Circles Joined: ${progressData.joinedCircles || 0}`}
              </span>
            </div>
          </div>

          {/* Dynamic Top Groups CSS Chart representation */}
          <div className="md:w-1/2 flex items-end justify-around h-48 w-full relative z-10 pt-4 border-b border-gray-100 pb-1">
            {isAdmin && topGroups.length > 0 ? (
              topGroups.slice(0, 4).map((group, idx) => {
                const isTop = idx === 0;
                // Height based on rank for visual effect
                const heightClass = ['h-40', 'h-24', 'h-16', 'h-10'][idx] || 'h-8';
                
                return (
                  <div key={group._id || idx} className="flex flex-col items-center gap-2 w-1/5">
                     <div className={`w-full rounded-t-xl relative overflow-hidden ${isTop ? 'bg-gradient-to-t from-primary-dark to-primary shadow-lg shadow-primary/30 ' + heightClass : 'bg-primary-light/50 group-hover:bg-primary-light transition-all ' + heightClass}`}>
                        {!isTop && <div className="absolute bottom-0 w-full h-[60%] bg-primary/20"></div>}
                     </div>
                     <span className={`text-[10px] font-bold uppercase tracking-widest truncate w-full text-center ${isTop ? 'text-primary' : 'text-gray-400'}`} title={group.name}>
                       {group.name?.substring(0, 4) || 'GRP'}
                     </span>
                  </div>
                );
              })
            ) : (
              /* Fallback default style for Student or Empty state to preserve the design layout */
              <>
                <div className="flex flex-col items-center gap-2 w-1/5">
                  <div className="w-full bg-primary-light/50 rounded-t-xl h-12 relative overflow-hidden group hover:bg-primary-light transition-all">
                    <div className="absolute bottom-0 w-full h-[60%] bg-primary/20"></div>
                  </div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Grp C</span>
                </div>
                <div className="flex flex-col items-center gap-2 w-1/5">
                  <div className="w-full bg-primary-light/50 rounded-t-xl h-24 relative overflow-hidden group hover:bg-primary-light transition-all">
                    <div className="absolute bottom-0 w-full h-[75%] bg-primary/20"></div>
                  </div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Grp D</span>
                </div>
                <div className="flex flex-col items-center gap-2 w-1/5">
                  <div className="w-full rounded-t-xl h-40 shadow-lg shadow-primary/30 relative overflow-hidden bg-gradient-to-t from-primary-dark to-primary"></div>
                  <span className="text-[10px] font-bold text-primary uppercase tracking-widest">My Grp</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Recent Achievements */}
        <div className="pt-4 pb-8 border-t border-gray-100 flex flex-col items-center">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-6">
            {isAdmin ? "Platform Insights & Highlights" : "Recent Achievements"}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <div className="bg-indigo-50 border border-indigo-100 px-4 py-2 rounded-full flex items-center gap-2 text-indigo-700 text-xs font-bold transition-transform hover:-translate-y-1 shadow-sm">
              <Award className="w-3.5 h-3.5" /> 
              {isAdmin ? `Total Circles: ${summary.totalStudyCircles || 0}` : "Top Contributor"}
            </div>
            <div className="bg-teal-50 border border-teal-100 px-4 py-2 rounded-full flex items-center gap-2 text-teal-700 text-xs font-bold transition-transform hover:-translate-y-1 shadow-sm">
              <Zap className="w-3.5 h-3.5" /> 
              {isAdmin ? `Avg Engagement Score: ${Math.round(summary.engagementScore/10) || 0}` : "Fast Learner"}
            </div>
            <div className="bg-blue-50 border border-blue-100 px-4 py-2 rounded-full flex items-center gap-2 text-blue-700 text-xs font-bold transition-transform hover:-translate-y-1 shadow-sm">
              <Users className="w-3.5 h-3.5" /> 
              {isAdmin ? `Students Tracked: ${summary.totalStudents || 0}` : "Collaborator Elite"}
            </div>
            <div className="bg-gray-100 border border-gray-200 px-4 py-2 rounded-full flex items-center gap-2 text-gray-700 text-xs font-bold transition-transform hover:-translate-y-1 shadow-sm">
              <Target className="w-3.5 h-3.5" /> 
              {isAdmin ? "Goal Metrics Surpassed" : "Streak Master"}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
