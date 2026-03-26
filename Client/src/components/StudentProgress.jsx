import React, { useState, useEffect } from 'react';
import {
  Share2,
  FileText,
  Zap,
  Users,
  Download,
  BookOpen,
  ChevronUp,
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  Cell,
} from 'recharts';

const API_ORIGIN =
  import.meta.env.VITE_API_ORIGIN ||
  `${window.location.protocol}//${window.location.hostname}:5000`;

export default function StudentProgress({ user, role = 'student' }) {
  const isAdmin = role === 'admin';
  const [progressData, setProgressData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleDownloadReport = () => {
    if (!progressData) return;

    const summary = progressData.summary || {};
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const marginLeft = 48;
    const marginRight = 48;
    const contentWidth = pageWidth - marginLeft - marginRight;
    let y = 60;

    // Header band
    doc.setFillColor(15, 118, 110);
    doc.rect(0, 0, pageWidth, 90, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(255, 255, 255);
    doc.text('Smart Study Circle', marginLeft, 40);
    doc.setFontSize(12);
    doc.setTextColor(226, 232, 240);
    doc.text('Student Progress Report', marginLeft, 62);

    y = 110;
    doc.setTextColor(71, 85, 105);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleString()}`, marginLeft, y);
    y += 20;

    // Summary cards
    const cardGap = 12;
    const cardWidth = (contentWidth - cardGap * 3) / 4;
    const cardHeight = 64;
    const cards = [
      { label: 'Active Circles', value: progressData.activeCircles || 0, color: [16, 185, 129] },
      { label: 'Resources Shared', value: summary.resourcesShared || 0, color: [59, 130, 246] },
      { label: 'Resources Viewed', value: summary.resourcesViewed || 0, color: [99, 102, 241] },
      { label: 'Messages Sent', value: summary.messagesCount || 0, color: [245, 158, 11] },
    ];

    cards.forEach((card, index) => {
      const x = marginLeft + index * (cardWidth + cardGap);
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(x, y, cardWidth, cardHeight, 10, 10, 'F');
      doc.setFillColor(...card.color);
      doc.roundedRect(x + 10, y + 10, 6, 28, 3, 3, 'F');
      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.text(String(card.value), x + 24, y + 30);
      doc.setTextColor(100, 116, 139);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text(card.label, x + 24, y + 48);
    });

    y += cardHeight + 24;

    // Engagement summary block
    doc.setFillColor(240, 253, 250);
    doc.roundedRect(marginLeft, y, contentWidth, 70, 12, 12, 'F');
    doc.setTextColor(13, 148, 136);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('Engagement Score', marginLeft + 16, y + 26);
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(22);
    doc.text(String(summary.engagementScore || 0), marginLeft + 16, y + 52);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(71, 85, 105);
    doc.text(
      `Joined circles: ${progressData.joinedCircles || 0} · Active circles: ${progressData.activeCircles || 0}`,
      marginLeft + 150,
      y + 40,
    );

    y += 90;

    // Top resources table
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('Top Resources', marginLeft, y);
    y += 12;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text('Title', marginLeft, y + 14);
    doc.text('Views', marginLeft + contentWidth - 110, y + 14);
    doc.text('Downloads', marginLeft + contentWidth - 40, y + 14);
    doc.setDrawColor(226, 232, 240);
    doc.line(marginLeft, y + 20, marginLeft + contentWidth, y + 20);

    y += 30;
    doc.setTextColor(15, 23, 42);
    const topResources = progressData.topResources || [];
    if (topResources.length === 0) {
      doc.setTextColor(100, 116, 139);
      doc.text('No viewed resources yet.', marginLeft, y);
    } else {
      topResources.slice(0, 6).forEach((res) => {
        const title = String(res.title || 'Untitled');
        doc.text(title, marginLeft, y, { maxWidth: contentWidth - 140 });
        doc.text(String(res.views || 0), marginLeft + contentWidth - 110, y);
        doc.text(String(res.downloads || 0), marginLeft + contentWidth - 40, y);
        y += 18;
      });
    }

    doc.save(`student-progress-${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        let endpoint = '';
        if (isAdmin) {
          endpoint = `${API_ORIGIN}/api/progress/admin/overview`;
        } else {
          const userId = user?._id || user?.id;
          if (!userId) {
            throw new Error('Missing user id for student progress');
          }
          endpoint = `${API_ORIGIN}/api/progress/student/${userId}`;
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

  const circleStats = progressData.circleStats || [];
  const recentResources = progressData.recentResources || [];
  const topResources = progressData.topResources || [];
  const circleHighlights = [...circleStats]
    .sort((a, b) => (b.memberCount || 0) - (a.memberCount || 0))
    .slice(0, 3);
  const recentResourceHighlights = recentResources.slice(0, 3);
  const topResourceHighlights = topResources.slice(0, 4);

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
                : "See how your study circles, shared resources, and activity contribute to your learning."}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <select className="bg-white border border-gray-200 text-gray-700 font-semibold px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-light">
              <option>This Month</option>
              <option>Last Month</option>
              <option>This Semester</option>
            </select>
            <button
              onClick={handleDownloadReport}
              className="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 font-semibold px-4 py-2.5 rounded-xl text-sm flex items-center transition-colors"
            >
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
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-500">
                <Users className="w-6 h-6" />
              </div>
              <span className="bg-emerald-50 text-emerald-600 text-xs font-bold px-2 py-1 rounded-lg flex items-center">
                <ChevronUp className="w-3 h-3 ml-0.5" />
              </span>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                {isAdmin ? "Active Circles" : "Study Circles"}
              </p>
              <h3 className="text-3xl font-extrabold text-gray-900">
                {isAdmin
                  ? (summary.activeStudyCircles || 0).toLocaleString()
                  : `${progressData.activeCircles || 0}`}
              </h3>
              {!isAdmin && (
                <p className="text-[11px] text-gray-500 mt-1">
                  {progressData.joinedCircles || 0} total joined
                </p>
              )}
            </div>
          </div>

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
                {isAdmin
                  ? (summary.totalResourcesShared || 0).toLocaleString()
                  : (summary.resourcesShared || 0).toLocaleString()}
              </h3>
            </div>
          </div>

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
                {isAdmin ? "Total Study Plans" : "Resources Viewed"}
              </p>
              <h3 className="text-3xl font-extrabold text-gray-900">
                {isAdmin
                  ? (summary.totalStudyPlansCreated || 0).toLocaleString()
                  : (summary.resourcesViewed || 0).toLocaleString()}
              </h3>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-500">
                <Zap className="w-6 h-6" />
              </div>
              <span className="bg-amber-50 text-amber-600 text-xs font-bold px-2 py-1 rounded-lg flex items-center">
                <ChevronUp className="w-3 h-3 ml-0.5" />
              </span>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                {isAdmin ? "Total Students" : "Messages Sent"}
              </p>
              <h3 className="text-3xl font-extrabold text-gray-900">
                {isAdmin
                  ? (summary.totalStudents || 0).toLocaleString()
                  : (summary.messagesCount || 0).toLocaleString()}
              </h3>
            </div>
          </div>
        </div>

        {/* Study Circles + Resources */}
        {!isAdmin && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-500">
                    Study Circles
                  </p>
                  <h2 className="text-2xl font-extrabold text-[#0f172a] mt-2">
                    Active circles
                  </h2>
                </div>
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                  {progressData.activeCircles || 0}/{progressData.joinedCircles || 0}
                </span>
              </div>

              <div className="space-y-3">
                {circleHighlights.length === 0 ? (
                  <div className="text-sm text-gray-400">No active circles yet.</div>
                ) : (
                  circleHighlights.map((circle) => (
                    <div key={circle.id} className="flex items-center justify-between rounded-2xl border border-gray-100 bg-gray-50/70 px-4 py-3">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {circle.subject || "Study Circle"}
                        </p>
                        <p className="text-[11px] uppercase tracking-widest text-gray-500">
                          {circle.moduleCode || "MODULE"} · {circle.semester || "Term"}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-emerald-600">
                          {circle.memberCount || 0}
                        </p>
                        <p className="text-[11px] text-gray-400">members</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-500">
                    Resources
                  </p>
                  <h2 className="text-2xl font-extrabold text-[#0f172a] mt-2">
                    Top resources
                  </h2>
                </div>
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                  {topResources.length} total
                </span>
              </div>

              <div className="space-y-3">
                {topResourceHighlights.length === 0 ? (
                  <div className="text-sm text-gray-400">No viewed resources yet.</div>
                ) : (
                  topResourceHighlights.map((res) => (
                    <div key={res.id} className="rounded-2xl border border-gray-100 bg-gray-50/70 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-gray-900 line-clamp-2">
                            {res.title}
                          </p>
                          <p className="text-[11px] uppercase tracking-widest text-gray-400">
                            {res.type || "file"}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-bold text-emerald-600">
                            {res.views || 0} views
                          </p>
                          <p className="text-[11px] text-gray-400">
                            {res.downloads || 0} downloads
                          </p>
                        </div>
                      </div>
                      <div className="mt-2 text-[10px] text-gray-400">
                        {res.createdAt ? new Date(res.createdAt).toLocaleDateString() : ""}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

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


        {/* My Goals */}
        {!isAdmin && (
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-500">
                  My Goals
                </p>
                <h3 className="text-2xl font-extrabold text-[#0f172a] mt-2">
                  Weekly targets
                </h3>
              </div>
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                This week
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-2xl border border-indigo-100 bg-indigo-50/40 p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Share resources</span>
                  <span className="text-xs font-semibold text-indigo-600">{summary.resourcesShared || 0}/3</span>
                </div>
                <div className="h-2 rounded-full bg-indigo-100 overflow-hidden">
                  <div
                    className="h-full bg-indigo-500"
                    style={{ width: `${Math.min(((summary.resourcesShared || 0) / 3) * 100, 100)}%` }}
                  />
                </div>
                <p className="text-[11px] text-gray-500 mt-3">Upload 3 helpful resources.</p>
              </div>

              <div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">Stay active</span>
                  <span className="text-xs font-semibold text-emerald-600">{progressData.activeCircles || 0}/{progressData.joinedCircles || 0}</span>
                </div>
                <div className="h-2 rounded-full bg-emerald-100 overflow-hidden">
                  <div
                    className="h-full bg-emerald-500"
                    style={{ width: `${Math.min((progressData.joinedCircles ? (progressData.activeCircles / progressData.joinedCircles) : 0) * 100, 100)}%` }}
                  />
                </div>
                <p className="text-[11px] text-gray-500 mt-3">Keep your circles active.</p>
              </div>

              <div className="rounded-2xl border border-amber-100 bg-amber-50/40 p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-amber-600 uppercase tracking-widest">Message streak</span>
                  <span className="text-xs font-semibold text-amber-600">{summary.messagesCount || 0}/10</span>
                </div>
                <div className="h-2 rounded-full bg-amber-100 overflow-hidden">
                  <div
                    className="h-full bg-amber-500"
                    style={{ width: `${Math.min(((summary.messagesCount || 0) / 10) * 100, 100)}%` }}
                  />
                </div>
                <p className="text-[11px] text-gray-500 mt-3">Send 10 helpful messages.</p>
              </div>
            </div>
          </div>
        )}

        {/* Removed noisy achievement badges for a cleaner layout */}

      </div>
    </div>
  );
}
