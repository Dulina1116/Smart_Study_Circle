import React, { useState, useEffect } from "react";
import {
  ChevronDown,
  AlertTriangle,
  Clock,
  TrendingUp,
  TrendingDown,
  Activity,
  Users,
  Target,
  Download,
  ClipboardList
} from "lucide-react";
import { jsPDF } from "jspdf";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  LabelList
} from "recharts";

// --- Mock Data ---

const interactionData = [
  { name: "WEEK 01", messages: 120, activity: 200, engagement: 220 },
  { name: "WEEK 04", messages: 180, activity: 380, engagement: 210 },
  { name: "WEEK 08", messages: 250, activity: 280, engagement: 230 },
  { name: "WEEK 12", messages: 300, activity: 550, engagement: 240 },
  { name: "WEEK 14", messages: 450, activity: 450, engagement: 250 },
];


const topContributors = [
  { id: 1, initials: "AS", name: "Alex Sterling", studentId: "ID: 2190334", posts: 42, score: "89%", engagement: "982 pts" },
  { id: 2, initials: "MK", name: "Maya Kova", studentId: "ID: 2190112", posts: 38, score: "92%", engagement: "945 pts" },
  { id: 3, initials: "JT", name: "James Thorne", studentId: "ID: 2190556", posts: 24, score: "76%", engagement: "812 pts" },
];

export default function LecturerStudentAnalytics({ user }) {

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedModule, setSelectedModule] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const url = selectedModule 
          ? `http://localhost:5000/api/progress/lecturer/analytics?moduleCode=${encodeURIComponent(selectedModule)}`
          : `http://localhost:5000/api/progress/lecturer/analytics`;
        
        const token = user?.token || localStorage.getItem("token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const res = await fetch(url, { headers });
        const result = await res.json();
        
        if (result.success) {
          setData(result.data);
          if (!selectedModule && result.data.currentModule !== "Overall") {
             setSelectedModule(result.data.currentModule);
          }
        } else {
          setError(result.message || "Failed to load data");
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedModule, user]);

  const resolvedInteractionData = data?.charts?.interactionData || interactionData;

  const resolvedTopContributors = data?.topContributors || topContributors;





  const generateReport = () => {
    const doc = new jsPDF();
    const margin = 15;
    
    // --- Header Background ---
    doc.setFillColor(20, 125, 111); // Teal color matching the image
    doc.rect(0, 0, 210, 40, "F");
    
    // --- Header Text ---
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("Smart Study Circle", margin, 20);
    
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`Student Analytics Report - ${selectedModule} ${data?.currentModule !== "Overall" ? "Dashboard" : ""}`, margin, 31);
    
    // --- Generated Date ---
    const dateStr = new Date().toLocaleString();
    doc.setTextColor(100, 116, 139); // slate-500
    doc.setFontSize(10);
    doc.text(`Generated: ${dateStr}`, margin, 50);
    
    // --- 4 KPI Cards ---
    const cardY = 60;
    const cardWidth = 41.25;
    const cardHeight = 26;
    const gap = 5;
    
    const kpis = [
      { title: "Average Grade", value: data?.kpis?.averageGrade || "0%", color: [16, 185, 129] },    // Emerald
      { title: "Assignments", value: data?.kpis?.completionRate || "0%", color: [59, 130, 246] },      // Blue
      { title: "Engagement", value: data?.kpis?.engagement || "0 pts", color: [139, 92, 246] },     // Purple
      { title: "At-Risk", value: String(data?.kpis?.atRisk || 0), color: [249, 115, 22] }              // Orange
    ];
    
    kpis.forEach((kpi, index) => {
      const x = margin + (cardWidth + gap) * index;
      
      // Card Background
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(x, cardY, cardWidth, cardHeight, 3, 3, "F");
      
      // Colored side bar
      doc.setFillColor(kpi.color[0], kpi.color[1], kpi.color[2]);
      doc.roundedRect(x + 4, cardY + 5, 2.5, 9, 1.25, 1.25, "F");
      
      // Value
      doc.setTextColor(15, 23, 42); // slate-900
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text(kpi.value, x + 9, cardY + 12.5);
      
      // Title
      doc.setTextColor(100, 116, 139); // slate-500
      doc.setFontSize(8.5);
      doc.setFont("helvetica", "normal");
      doc.text(kpi.title, x + 9, cardY + 20);
    });
    
    // --- Wide Card (Executive Summary) ---
    const wideCardY = cardY + cardHeight + 12; 
    doc.setFillColor(240, 253, 244); // Very light mint green matching image
    doc.roundedRect(margin, wideCardY, 180, 26, 3, 3, "F");
    
    doc.setTextColor(13, 148, 136); // Teal-600 text
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Executive Summary", margin + 6, wideCardY + 11.5);
    
    doc.setTextColor(71, 85, 105);
    doc.setFontSize(9.5);
    doc.setFont("helvetica", "normal");
    const summaryText = `Overall class performance is ${parseFloat(data?.kpis?.averageGrade) >= 70 ? 'stable' : 'needs improvement'}. ${data?.kpis?.atRisk || 0} students require critical focus to prevent failure.`;
    doc.text(summaryText, margin + 6, wideCardY + 19);
    
    // --- Table Header: Top Contributors ---
    const tableY = wideCardY + 26 + 15; 
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Top Contributors", margin, tableY);
    
    // Column Headers
    doc.setTextColor(100, 116, 139);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    const colY = tableY + 10;
    doc.text("Student ID & Name", margin, colY);
    doc.text("Forum Posts", 100, colY);
    doc.text("Avg Score", 140, colY);
    doc.text("Engagement", 170, colY);
    
    // Separator Line
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, colY + 3, 210 - margin, colY + 3);
    
    // Table Rows
    let currentRowY = colY + 11;
    resolvedTopContributors.forEach((student) => {
      doc.setTextColor(15, 23, 42);
      doc.setFont("helvetica", "bold");
      doc.text(student.name, margin, currentRowY);
      
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 116, 139);
      doc.text(student.studentId, margin, currentRowY + 4);
      
      doc.setTextColor(71, 85, 105);
      doc.text(String(student.posts), 100, currentRowY + 1.5);
      doc.setTextColor(16, 185, 129); // green
      doc.text(student.score, 140, currentRowY + 1.5);
      doc.setTextColor(71, 85, 105);
      doc.text(student.engagement, 170, currentRowY + 1.5);
      
      currentRowY += 12;
    });

    // Disclaimer footer
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184); // slate-400
    doc.text("Generated by Smart Study Circle Analytics • Confidential", margin, 297 - 15);

    doc.save("Student_Analytics_Report.pdf");
  };

  return (
    <div className="w-full max-w-[1400px] mx-auto text-slate-800 pb-10">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 mb-1 tracking-tight">
            Student Analytics Dashboard
          </h1>
          <p className="text-sm text-slate-500 font-medium">
            Semester 1 • Academic Year 25/26
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-700">Module:</span>
            <div className="relative">
              <select 
                value={selectedModule}
                onChange={(e) => setSelectedModule(e.target.value)}
                className="appearance-none bg-white border border-slate-200 text-slate-700 py-2.5 pl-4 pr-10 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-sm cursor-pointer"
              >
                {data?.availableModules?.map(m => (
                   <option key={m} value={m}>{m}</option>
                )) || <option>Loading...</option>}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>
          <button 
            onClick={generateReport}
            disabled={loading || !data}
            className={`flex items-center gap-2 ${loading ? 'bg-slate-300' : 'bg-teal-500 hover:bg-teal-600'} text-white py-2.5 px-4 rounded-xl text-sm font-bold transition-colors shadow-sm ml-2`}
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export Report</span>
          </button>
        </div>
      </div>

      {loading && (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E55C3A]"></div>
        </div>
      )}

      {error && !loading && (
        <div className="bg-red-50 text-red-500 p-4 rounded-xl mb-6">
          {error}
        </div>
      )}

      {!loading && !error && (
        <>
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Average Grade */}
        <div className="bg-white rounded-[24px] p-6 shadow-[0_2px_15px_rgba(0,0,0,0.03)] border border-slate-50 relative">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-[12px] font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Activity className="w-3.5 h-3.5" /> Average Grade
            </h3>
            <span className="flex items-center gap-1 bg-emerald-100 text-emerald-600 text-[11px] font-bold px-2 py-0.5 rounded-full">
              <TrendingUp className="w-3 h-3" /> +2.5%
            </span>
          </div>
          <div className="mb-8">
            <div className="flex items-end gap-2 mb-1">
              <span className="text-2xl font-extrabold text-slate-800 tracking-tight">{data?.kpis?.averageGrade || "0%"}</span>
              <span className="text-sm font-medium text-slate-500 mb-0.5">class avg</span>
            </div>
            <p className="text-xs font-medium text-slate-400">Target: 70.0%</p>
          </div>
          <div className="absolute bottom-5 left-6 right-6">
            <div className="flex justify-between text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">
              <span>Goal Progress</span>
              <span className="text-slate-500">74%</span>
            </div>
            <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-slate-800 rounded-full" style={{ width: "74.2%" }}></div>
            </div>
          </div>
        </div>

        {/* Assignment Completion */}
        <div className="bg-white rounded-[24px] p-6 shadow-[0_2px_15px_rgba(0,0,0,0.03)] border border-slate-50 relative">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-[12px] font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <ClipboardList className="w-3.5 h-3.5" /> Assignment Completion
            </h3>
            <span className="flex items-center gap-1 bg-emerald-100 text-emerald-600 text-[11px] font-bold px-2 py-0.5 rounded-full">
              <TrendingUp className="w-3 h-3" /> +4.2%
            </span>
          </div>
          <div className="mb-8">
            <div className="flex items-end gap-2 mb-1">
              <span className="text-2xl font-extrabold text-slate-800 tracking-tight">{data?.kpis?.completionRate || "92.4%"}</span>
              <span className="text-sm font-medium text-slate-500 mb-0.5">submission rate</span>
            </div>
            <p className="text-xs font-medium text-slate-400">vs last period (88.2%)</p>
          </div>
          <div className="absolute bottom-5 left-6 right-6">
            <div className="flex justify-between text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">
              <span>Overall Progress</span>
              <span className="text-slate-500">92%</span>
            </div>
            <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-blue-600 rounded-full" style={{ width: "92.4%" }}></div>
            </div>
          </div>
        </div>

        {/* Engagement Score */}
        <div className="bg-white rounded-[24px] p-6 shadow-[0_2px_15px_rgba(0,0,0,0.03)] border border-slate-50 relative">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-[12px] font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Target className="w-3.5 h-3.5" /> Engagement Score
            </h3>
            <span className="flex items-center gap-1 bg-emerald-100 text-emerald-600 text-[11px] font-bold px-2 py-0.5 rounded-full">
              <TrendingUp className="w-3 h-3" /> +15.4%
            </span>
          </div>
          <div className="mb-8">
            <div className="flex items-end gap-2 mb-1">
              <span className="text-2xl font-extrabold text-slate-800 tracking-tight">{Math.floor(parseInt(data?.kpis?.engagement || "0"))}</span>
              <span className="text-sm font-medium text-slate-500 mb-0.5">points avg</span>
            </div>
            <p className="text-xs font-medium text-slate-400">High engagement tier</p>
          </div>
          <div className="absolute bottom-5 left-6 right-6">
            <div className="flex justify-between text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">
              <span>Tier Progress</span>
              <span className="text-slate-500">62%</span>
            </div>
            <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-slate-800 rounded-full" style={{ width: "62%" }}></div>
            </div>
          </div>
        </div>

        {/* At-Risk Students */}
        <div className="bg-[#E55C3A] rounded-[24px] p-6 shadow-[0_4px_20px_rgba(229,92,58,0.2)] text-white relative overflow-hidden">
          <div className="flex justify-between items-start mb-2 relative z-10">
            <h3 className="text-[12px] font-extrabold text-white/90 uppercase tracking-widest flex items-center gap-2">
              <AlertTriangle className="w-3.5 h-3.5" /> At-Risk Students
            </h3>
          </div>
          <div className="flex flex-col relative z-10 mb-8">
            <div className="flex items-end gap-2 mb-1 mt-2">
              <span className="text-2xl font-extrabold tracking-tight">{data?.kpis?.atRisk || 0}</span>
              <span className="text-[13px] font-medium text-white/80 mb-0.5">students</span>
            </div>
            <span className="text-[13px] font-medium text-white/90 bg-white/20 inline-block px-3 py-1 rounded-lg w-max mt-1 border border-white/10">
              Critical focus needed for {data?.criticalAlerts?.length || 0}
            </span>
          </div>
          <div className="absolute bottom-5 left-6 right-6 z-10">
            <div className="flex justify-between text-[10px] font-bold text-white/70 mb-1.5 uppercase tracking-wider">
              <span>Risk Ratio</span>
              <span className="text-white/90">8%</span>
            </div>
            <div className="h-1 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-white rounded-full" style={{ width: "8%" }}></div>
            </div>
          </div>
          {/* Decorative background circle */}
          <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-white/10 rounded-full pointer-events-none"></div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Student Interaction Score */}
        <div className="bg-white rounded-[24px] p-6 shadow-[0_2px_15px_rgba(0,0,0,0.03)] border border-slate-50">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <h3 className="text-[16px] font-bold text-slate-900">Student Interaction Score</h3>
              <span className="flex items-center gap-1 bg-emerald-100 text-emerald-600 text-[11px] font-bold px-2 py-0.5 rounded-full">
                <TrendingUp className="w-3 h-3" /> +12%
              </span>
            </div>
            <div className="relative">
              <select className="appearance-none bg-slate-50 border border-slate-100 text-slate-600 py-1.5 pl-3 pr-8 rounded-lg text-xs font-bold focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer">
                <option>Last 30 Days</option>
                <option>Last 3 Months</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
            </div>
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={resolvedInteractionData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorActivity" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1E3A8A" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#1E3A8A" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorEngagement" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorMessages" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#F43F5E" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94A3B8', fontWeight: 600 }} dy={10} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', fontWeight: 'bold', padding: '12px' }}
                  itemStyle={{ fontSize: '13px', paddingTop: '4px' }}
                  labelStyle={{ fontSize: '11px', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}
                  formatter={(value, name) => [<span style={{ fontWeight: 800 }}>{value}</span>, name]}
                />
                <Area type="monotone" dataKey="activity" name="Activity" stroke="#1E3A8A" strokeWidth={3} fillOpacity={1} fill="url(#colorActivity)" activeDot={{ r: 6, strokeWidth: 0, fill: '#1E3A8A' }} />
                <Area type="monotone" dataKey="engagement" name="Engagement" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#colorEngagement)" />
                <Area type="monotone" dataKey="messages" name="Messages" stroke="#F43F5E" strokeWidth={2} fillOpacity={1} fill="url(#colorMessages)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          {/* Custom Legend */}
          <div className="flex items-center gap-6 mt-4 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[#1E3A8A]"></div>
              <span className="text-[12px] font-bold text-slate-500">Activity</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[#10B981]"></div>
              <span className="text-[12px] font-bold text-slate-500">Engagement</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[#F43F5E]"></div>
              <span className="text-[12px] font-bold text-slate-500">Messages</span>
            </div>
          </div>
        </div>

        {/* Resource Engagement Analysis */}
        <div className="bg-white rounded-[24px] p-6 shadow-[0_2px_15px_rgba(0,0,0,0.03)] border border-slate-50">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <h3 className="text-[16px] font-bold text-slate-900">Resource Engagement Analysis</h3>
              <span className="bg-orange-100 text-orange-600 text-[10px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider">
                Trend
              </span>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#1E3A8A]"></div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Views</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#F97316]"></div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Uploads</span>
              </div>
            </div>
          </div>
          <div className="h-[250px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.charts?.resourceActivity || []} margin={{ top: 20, right: 0, left: -20, bottom: 0 }} barGap={8}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#94A3B8', fontWeight: 600 }} 
                  dy={10} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#94A3B8', fontWeight: 600 }}
                />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', fontWeight: 'bold', padding: '12px' }}
                  itemStyle={{ fontSize: '13px', padding: '2px 0' }}
                  labelStyle={{ fontSize: '11px', color: '#94A3B8', marginBottom: '8px', textTransform: 'uppercase' }}
                />
                <Bar dataKey="views" name="Views" fill="#1E3A8A" radius={[4, 4, 0, 0]} barSize={24} />
                <Bar dataKey="uploads" name="Uploads" fill="#F97316" radius={[4, 4, 0, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Contributors */}
        <div className="bg-white rounded-[24px] shadow-[0_2px_15px_rgba(0,0,0,0.03)] border border-slate-50 overflow-hidden flex flex-col">
          <div className="p-6 flex items-center justify-between border-b border-slate-50">
            <h3 className="text-[16px] font-bold text-slate-900">Top Contributors</h3>
            <button className="text-[13px] font-bold text-[#E55C3A] hover:text-[#d44c2b] transition-colors">
              View All Students
            </button>
          </div>
          <div className="p-0 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr>
                  <th className="px-6 py-5 text-[11px] font-extrabold text-slate-400 uppercase tracking-widest whitespace-nowrap">Student</th>
                  <th className="px-6 py-5 text-[11px] font-extrabold text-slate-400 uppercase tracking-widest whitespace-nowrap text-center">Forum Posts</th>
                  <th className="px-6 py-5 text-[11px] font-extrabold text-slate-400 uppercase tracking-widest whitespace-nowrap text-center">Avg Score</th>
                  <th className="px-6 py-5 text-[11px] font-extrabold text-slate-400 uppercase tracking-widest whitespace-nowrap text-right">Engagement</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/60 border-t border-slate-100/60">
                {resolvedTopContributors.length > 0 ? resolvedTopContributors.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50/80 transition-all duration-200 group cursor-default">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-sm shrink-0 border border-orange-200/50">
                          {student.initials}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[14px] font-bold text-slate-900 leading-tight group-hover:text-orange-600 transition-colors">{student.name}</span>
                          <span className="text-[11px] font-medium text-slate-400/70 mt-0.5">{student.studentId}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[14px] font-bold text-slate-700 text-center">
                      {student.posts}
                    </td>
                    <td className="px-6 py-4 text-[14px] font-bold text-emerald-500 text-center">
                      {student.score}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="inline-flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-full text-[12px] font-bold text-slate-600 border border-slate-200/60 shadow-sm group-hover:border-slate-300 transition-colors">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                        {student.engagement}
                      </span>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="4" className="px-6 py-8 text-center text-slate-500 font-medium">No contributors found for this module</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Critical Alerts */}
        <div className="bg-white rounded-[24px] shadow-[0_2px_15px_rgba(0,0,0,0.03)] border border-slate-50 p-6 flex flex-col">
          <div className="flex items-center gap-2 mb-6">
            <AlertTriangle className="w-5 h-5 text-[#E55C3A]" strokeWidth={2.5} />
            <h3 className="text-[16px] font-bold text-slate-900">Critical Alerts</h3>
          </div>

          <div className="space-y-4">
            {data?.criticalAlerts && data.criticalAlerts.length > 0 ? data.criticalAlerts.map(alert => (
              <div key={alert.id} className={`border rounded-[20px] p-4 flex flex-col gap-3 ${alert.type === 'Low Attendance' ? 'bg-[#FFF1F2] border-[#FECDD3]' : 'bg-[#FFFBEB] border-[#FDE68A]'}`}>
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-full bg-white shadow-sm border flex items-center justify-center font-bold text-xs shrink-0 ${alert.type === 'Low Attendance' ? 'border-[#FFE4E6] text-[#BE123C]' : 'border-[#FEF3C7] text-[#B45309]'}`}>
                        {alert.initials}
                      </div>
                      <div>
                        <h4 className="text-[14px] font-bold text-slate-900 leading-none mb-1">{alert.studentName}</h4>
                        <div className="flex items-center gap-2">
                           <span className={`text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-md ${alert.type === 'Low Attendance' ? 'text-[#BE123C] bg-[#FFE4E6]' : 'text-[#B45309] bg-[#FEF3C7]'}`}>{alert.type}</span>
                        </div>
                      </div>
                   </div>
                   <span className={`text-[11px] font-bold uppercase tracking-wider ${alert.type === 'Low Attendance' ? 'text-[#FDA4AF]' : 'text-[#FCD34D]'}`}>{alert.timeAgo}</span>
                </div>
                
                <p className="text-[13px] font-medium text-slate-600 leading-snug">
                   {alert.message}
                </p>
                
                <button className={`w-full bg-white border py-2 rounded-lg text-[12px] font-bold transition-colors shadow-sm mt-1 ${alert.type === 'Low Attendance' ? 'hover:bg-[#FFE4E6]/50 text-[#BE123C] border-[#FECDD3]' : 'hover:bg-[#FEF3C7]/50 text-[#B45309] border-[#FDE68A]'}`}>
                  {alert.actionText}
                </button>
              </div>
            )) : (
               <div className="p-4 text-center text-slate-500 font-medium">No critical alerts for this module! All clear 🚀</div>
            )}
          </div>
        </div>
      </div>
      </>
      )}
    </div>
  );
}
