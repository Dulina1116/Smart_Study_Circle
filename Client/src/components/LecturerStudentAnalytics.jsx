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
  ClipboardList,
  Calendar,
  X,
  StickyNote
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




// --- Utility Components ---

const ScrollPicker = ({ options, value, onChange, label }) => {
  const containerRef = React.useRef(null);
  const itemHeight = 40; // Height of each item in px
  
  const handleScroll = () => {
    if (!containerRef.current) return;
    const scrollTop = containerRef.current.scrollTop;
    // Calculate which index is in the center
    const index = Math.round(scrollTop / itemHeight);
    if (index >= 0 && index < options.length) {
      const selectedValue = options[index];
      if (selectedValue !== value) {
        onChange(selectedValue);
      }
    }
  };

  const handleItemClick = (opt) => {
    if (!containerRef.current) return;
    const index = options.indexOf(opt);
    containerRef.current.scrollTo({
      top: index * itemHeight,
      behavior: 'smooth'
    });
    onChange(opt);
  };

  React.useEffect(() => {
    if (containerRef.current) {
      const index = options.indexOf(value);
      if (index !== -1) {
        // Simple immediate scroll on mount/value change if not already there
        const targetScroll = index * itemHeight;
        if (Math.abs(containerRef.current.scrollTop - targetScroll) > 2) {
           containerRef.current.scrollTop = targetScroll;
        }
      }
    }
  }, [value, options]);

  return (
    <div className="flex flex-col items-center flex-1">
      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
        {label === "Hour" && <Clock className="w-3 h-3" />}
        {label}
      </span>
      <div className="relative w-full h-[120px] bg-slate-50/50 rounded-2xl overflow-hidden border border-slate-100 group">
        {/* Highlight Overlay */}
        <div className="absolute top-[40px] left-2 right-2 h-[40px] bg-teal-500/10 border-y border-teal-500/20 rounded-lg pointer-events-none z-10" />
        
        {/* Gradient Fades */}
        <div className="absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-white to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-white to-transparent z-10 pointer-events-none" />

        <div 
          ref={containerRef}
          onScroll={handleScroll}
          className="h-full overflow-y-auto snap-y snap-mandatory no-scrollbar relative z-0"
          style={{ 
            scrollbarWidth: 'none', 
            msOverflowStyle: 'none',
            scrollBehavior: 'smooth'
          }}
        >
          {/* Spacers for center alignment */}
          <div className="h-[40px]" />
          {options.map((opt) => (
            <div 
              key={opt}
              onClick={() => handleItemClick(opt)}
              className={`h-[40px] flex items-center justify-center snap-center cursor-pointer transition-all duration-300 text-sm font-bold
                ${opt === value ? 'text-teal-600 scale-110' : 'text-slate-400 opacity-30'}`}
            >
              {opt}
            </div>
          ))}
          <div className="h-[40px]" />
        </div>
      </div>
    </div>
  );
};

export default function LecturerStudentAnalytics({ user }) {

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedModule, setSelectedModule] = useState("");
  const [isModuleDropdownOpen, setIsModuleDropdownOpen] = useState(false);
  const moduleDropdownRef = React.useRef(null);
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (moduleDropdownRef.current && !moduleDropdownRef.current.contains(event.target)) {
        setIsModuleDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  
  // Meeting Modal States
  const [isMeetingModalOpen, setIsMeetingModalOpen] = useState(false);
  const [meetingTarget, setMeetingTarget] = useState(null); // { name, initials, id }
  const [meetingForm, setMeetingForm] = useState({ date: "", hour: "09", minute: "00", period: "AM", note: "" });
  const [formErrors, setFormErrors] = useState({});
  const [scheduledStudentIds, setScheduledStudentIds] = useState([]);
  const [cancelMeetingTarget, setCancelMeetingTarget] = useState(null);
  const [activeToast, setActiveToast] = useState(null);

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

  const resolvedInteractionData = data?.charts?.interactionData || [];
  const resolvedTopContributors = data?.topContributors || [];





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
      { title: "Average Grade", value: data?.kpis?.averageGrade || "0%", color: [13, 148, 136] },    // teal-600
      { title: "Assignments", value: data?.kpis?.completionRate || "0%", color: [6, 182, 212] },      // cyan-500
      { title: "Engagement", value: data?.kpis?.engagement || "0 pts", color: [20, 184, 166] },     // teal-500
      { title: "At-Risk", value: String(data?.kpis?.atRisk || 0), color: [244, 63, 94] }              // rose-500
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
      doc.setTextColor(13, 148, 136); // teal-600
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

  const handleScheduleMeeting = (alert) => {
    setMeetingTarget({ name: alert.studentName, initials: alert.initials, id: alert.id });
    setMeetingForm({ date: "", hour: "09", minute: "00", period: "AM", note: "" });
    setFormErrors({});
    setIsMeetingModalOpen(true);
  };

  const handleConfirmMeeting = () => {
    const errors = {};
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    
    // Required fields check
    if (!meetingForm.date) errors.date = "Date is required";

    // Reconstruct time for validation
    let hour24 = parseInt(meetingForm.hour);
    if (meetingForm.period === "PM" && hour24 !== 12) hour24 += 12;
    if (meetingForm.period === "AM" && hour24 === 12) hour24 = 0;
    const meetingMinute = parseInt(meetingForm.minute);

    // Date/Time validation
    if (meetingForm.date && meetingForm.date < todayStr) {
      errors.date = "Cannot select a past date";
    }

    if (meetingForm.date === todayStr) {
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      
      if (hour24 < currentHour || (hour24 === currentHour && meetingMinute <= currentMinute)) {
        errors.time = "Cannot select a past time for today";
      }
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    // Mock confirmation logic
    console.log("Meeting Scheduled:", { 
      student: meetingTarget.name, 
      date: meetingForm.date, 
      time: `${meetingForm.hour}:${meetingForm.minute} ${meetingForm.period}`,
      note: meetingForm.note 
    });

    setScheduledStudentIds(prev => [...prev, meetingTarget.id]);
    setIsMeetingModalOpen(false);
    
    // Show Toast
    setActiveToast(`Meeting scheduled for ${meetingTarget.name}`);
    setTimeout(() => setActiveToast(null), 4000);
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
            <div className="relative" ref={moduleDropdownRef}>
              <button 
                onClick={() => setIsModuleDropdownOpen(!isModuleDropdownOpen)}
                className="appearance-none bg-white border border-slate-200 text-slate-700 py-2.5 pl-4 pr-10 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-sm cursor-pointer w-full flex items-center justify-between gap-4 min-w-[140px]"
              >
                <span className="truncate">{selectedModule || "Loading..."}</span>
                <ChevronDown className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none transition-transform duration-200 ${isModuleDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isModuleDropdownOpen && (
                <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-white border border-slate-100 rounded-xl shadow-lg shadow-slate-200/50 z-50 overflow-hidden ring-1 ring-black/5">
                  <div className="max-h-[220px] overflow-y-auto overscroll-contain py-1.5 custom-scrollbar">
                    {data?.availableModules?.map(m => (
                      <button
                        key={m}
                        onClick={() => {
                          setSelectedModule(m);
                          setIsModuleDropdownOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 text-sm font-bold transition-colors duration-150 flex items-center justify-between ${selectedModule === m ? 'bg-teal-50 text-teal-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
                      >
                        <span className="truncate pr-2">{m}</span>
                      </button>
                    ))}
                    {!data?.availableModules && (
                      <div className="px-4 py-3 text-sm font-medium text-slate-400 text-center">Loading...</div>
                    )}
                  </div>
                </div>
              )}
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
        <div className="flex flex-col justify-center items-center py-24 space-y-4">
          <div className="relative">
            <div className="absolute inset-0 rounded-full border-4 border-slate-100"></div>
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-500 border-t-transparent relative z-10"></div>
          </div>
          <p className="text-sm font-medium text-slate-500 animate-pulse">Loading analytics data...</p>
        </div>
      )}

      {error && !loading && (
        <div className="bg-rose-50 border border-rose-100 p-5 rounded-2xl mb-8 flex items-start gap-3 shadow-sm">
          <AlertTriangle className="w-5 h-5 text-rose-500 mt-0.5 shrink-0" />
          <div>
            <h3 className="text-sm font-bold text-rose-800">Failed to load data</h3>
            <p className="text-sm text-rose-600 mt-1">{error}</p>
          </div>
        </div>
      )}

      {!loading && !error && (
        <>
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Average Grade */}
        <div className="bg-white rounded-[24px] p-6 shadow-sm border border-slate-100 relative hover:-translate-y-1 hover:shadow-md transition-all duration-300">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-[12px] font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Activity className="w-3.5 h-3.5" /> Average Grade
            </h3>
            <span className="flex items-center gap-1 bg-teal-100 text-teal-700 text-[11px] font-bold px-2 py-0.5 rounded-full">
              <TrendingUp className="w-3 h-3" /> +2.5%
            </span>
          </div>
          <div className="mb-2">
            <div className="flex items-end gap-2 mb-1">
              <span className="text-2xl font-extrabold text-slate-800 tracking-tight">{data?.kpis?.averageGrade || "0%"}</span>
              <span className="text-sm font-medium text-slate-500 mb-0.5">class avg</span>
            </div>
            <p className="text-xs font-medium text-slate-400">Target: 70.0%</p>
          </div>
        </div>

        {/* Assignment Completion */}
        <div className="bg-white rounded-[24px] p-6 shadow-sm border border-slate-100 relative hover:-translate-y-1 hover:shadow-md transition-all duration-300">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-[12px] font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <ClipboardList className="w-3.5 h-3.5" /> Assignment Completion
            </h3>
            <span className="flex items-center gap-1 bg-teal-100 text-teal-700 text-[11px] font-bold px-2 py-0.5 rounded-full">
              <TrendingUp className="w-3 h-3" /> +4.2%
            </span>
          </div>
          <div className="mb-2">
            <div className="flex items-end gap-2 mb-1">
              <span className="text-2xl font-extrabold text-slate-800 tracking-tight">{data?.kpis?.completionRate || "92.4%"}</span>
              <span className="text-sm font-medium text-slate-500 mb-0.5">submission rate</span>
            </div>
            <p className="text-xs font-medium text-slate-400">vs last period (88.2%)</p>
          </div>
        </div>

        {/* Engagement Score */}
        <div className="bg-white rounded-[24px] p-6 shadow-sm border border-slate-100 relative hover:-translate-y-1 hover:shadow-md transition-all duration-300">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-[12px] font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Target className="w-3.5 h-3.5" /> Engagement Score
            </h3>
            <span className="flex items-center gap-1 bg-teal-100 text-teal-700 text-[11px] font-bold px-2 py-0.5 rounded-full">
              <TrendingUp className="w-3 h-3" /> +15.4%
            </span>
          </div>
          <div className="mb-2">
            <div className="flex items-end gap-2 mb-1">
              <span className="text-2xl font-extrabold text-slate-800 tracking-tight">{Math.floor(parseInt(data?.kpis?.engagement || "0"))}</span>
              <span className="text-sm font-medium text-slate-500 mb-0.5">points avg</span>
            </div>
            <p className="text-xs font-medium text-slate-400">High engagement tier</p>
          </div>
        </div>

        {/* At-Risk Students */}
        <div className="bg-rose-500 rounded-[24px] p-6 shadow-sm relative overflow-hidden hover:-translate-y-1 hover:shadow-md transition-all duration-300 text-white">
          <div className="flex justify-between items-start mb-2 relative z-10">
            <h3 className="text-[12px] font-extrabold text-white/90 uppercase tracking-widest flex items-center gap-2">
              <AlertTriangle className="w-3.5 h-3.5" /> At-Risk Students
            </h3>
          </div>
          <div className="flex flex-col relative z-10 mb-2">
            <div className="flex items-end gap-2 mb-1 mt-2">
              <span className="text-2xl font-extrabold tracking-tight">{data?.kpis?.atRisk || 0}</span>
              <span className="text-[13px] font-medium text-white/80 mb-0.5">students</span>
            </div>
            <span className="text-[13px] font-medium text-white/90 bg-white/20 inline-block px-3 py-1 rounded-lg w-max mt-1 border border-white/10">
              Critical focus needed for {data?.criticalAlerts?.length || 0}
            </span>
          </div>
          {/* Decorative background circle */}
          <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-white/10 rounded-full pointer-events-none"></div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Student Interaction Score */}
        <div className="bg-white rounded-[24px] p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow duration-300">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <h3 className="text-[16px] font-bold text-slate-900">Student Interaction Score</h3>
              <span className="flex items-center gap-1 bg-teal-100 text-teal-700 text-[11px] font-bold px-2 py-0.5 rounded-full">
                <TrendingUp className="w-3 h-3" /> +12%
              </span>
            </div>
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={resolvedInteractionData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorActivity" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0D9488" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#0D9488" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorEngagement" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#06B6D4" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorMessages" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#64748B" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#64748B" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94A3B8', fontWeight: 600 }} dy={10} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', fontWeight: 'bold', padding: '12px' }}
                  itemStyle={{ fontSize: '13px', paddingTop: '4px' }}
                  labelStyle={{ fontSize: '11px', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}
                  formatter={(value, name) => [<span style={{ fontWeight: 800 }}>{value}</span>, name]}
                />
                <Area type="monotone" dataKey="activity" name="Activity" stroke="#0D9488" strokeWidth={3} fillOpacity={1} fill="url(#colorActivity)" activeDot={{ r: 6, strokeWidth: 0, fill: '#0D9488' }} />
                <Area type="monotone" dataKey="engagement" name="Engagement" stroke="#06B6D4" strokeWidth={2} fillOpacity={1} fill="url(#colorEngagement)" />
                <Area type="monotone" dataKey="messages" name="Messages" stroke="#64748B" strokeWidth={2} fillOpacity={1} fill="url(#colorMessages)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          {/* Custom Legend */}
          <div className="flex items-center gap-6 mt-4 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[#0D9488]"></div>
              <span className="text-[12px] font-bold text-slate-500">Activity</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[#06B6D4]"></div>
              <span className="text-[12px] font-bold text-slate-500">Engagement</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[#64748B]"></div>
              <span className="text-[12px] font-bold text-slate-500">Messages</span>
            </div>
          </div>
        </div>

        {/* Class Performance Distribution */}
        <div className="bg-white rounded-[24px] p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow duration-300">
          <div className="flex items-center mb-6">
            <h3 className="text-[16px] font-bold text-slate-900">Class Performance Distribution</h3>
          </div>
          <div className="h-[250px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.charts?.performanceDistribution || []} margin={{ top: 20, right: 0, left: -20, bottom: 0 }} barSize={40}>
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
                <Bar dataKey="count" name="Students">
                  {(data?.charts?.performanceDistribution || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Contributors */}
        <div className="lg:col-span-2 bg-white rounded-[24px] shadow-sm border border-slate-100 overflow-hidden flex flex-col hover:shadow-md transition-shadow duration-300">
          <div className="p-6 flex items-center border-b border-slate-100">
            <h3 className="text-[16px] font-bold text-slate-900">Top Contributors</h3>
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
                  <tr key={student.id} className="hover:bg-slate-50/80 transition-colors duration-200 group cursor-default">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-sm shrink-0 border border-teal-200">
                          {student.initials}
                        </div>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <span className="text-[14px] font-bold text-slate-900 leading-tight group-hover:text-teal-700 transition-colors">
                              {student.name}
                            </span>
                            {scheduledStudentIds.includes(student.id) && (
                              <span className="bg-teal-50 text-teal-600 text-[9px] font-extrabold px-1.5 py-0.5 rounded border border-teal-100 uppercase tracking-wider">Scheduled</span>
                            )}
                          </div>
                          <span className="text-[11px] font-medium text-slate-400/70 mt-0.5">{student.studentId}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[14px] font-bold text-slate-700 text-center">
                      {student.posts}
                    </td>
                    <td className="px-6 py-4 text-[14px] font-bold text-teal-600 text-center">
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
        <div className="bg-white rounded-[24px] shadow-sm border border-slate-100 p-6 flex flex-col hover:shadow-md transition-shadow duration-300">
          <div className="flex items-center gap-2 mb-6">
            <AlertTriangle className="w-5 h-5 text-[#E55C3A]" strokeWidth={2.5} />
            <h3 className="text-[16px] font-bold text-slate-900">Critical Alerts</h3>
          </div>

          <div className="space-y-4">
            {data?.criticalAlerts && data.criticalAlerts.length > 0 ? data.criticalAlerts.map(alert => (
              <div key={alert.id} className={`border rounded-[20px] p-4 flex flex-col gap-3 transition-colors duration-300 ${alert.type === 'Low Attendance' ? 'bg-rose-50/50 border-rose-100 hover:bg-rose-50' : 'bg-amber-50/50 border-amber-100 hover:bg-amber-50'}`}>
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-full bg-white shadow-sm border flex items-center justify-center font-bold text-xs shrink-0 ${alert.type === 'Low Attendance' ? 'border-[#FFE4E6] text-[#BE123C]' : 'border-[#FEF3C7] text-[#B45309]'}`}>
                        {alert.initials}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-[14px] font-bold text-slate-900 leading-none">{alert.studentName}</h4>
                          {scheduledStudentIds.includes(alert.id) && (
                            <span className="bg-teal-50 text-teal-600 text-[9px] font-extrabold px-1.5 py-0.5 rounded border border-teal-100 uppercase tracking-wider">Scheduled</span>
                          )}
                        </div>
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
                
                {scheduledStudentIds.includes(alert.id) ? (
                   <div className="flex flex-col gap-2">
                     <div className="w-full bg-teal-50 text-teal-700 py-2.5 rounded-xl text-[12px] font-extrabold flex items-center justify-center gap-2 border border-teal-100 shadow-sm shadow-teal-500/5">
                        <Target className="w-3.5 h-3.5 text-teal-600" />
                        MEETING SCHEDULED
                     </div>
                     <button 
                       onClick={() => setCancelMeetingTarget(alert)}
                       className="text-[11px] font-bold text-slate-400 hover:text-rose-500 transition-colors uppercase tracking-widest flex items-center justify-center gap-1.5 py-1"
                     >
                        <X className="w-3 h-3" /> Cancel Schedule
                     </button>
                   </div>
                ) : (
                  <button 
                    onClick={() => {
                      if (alert.actionText === "Schedule Meeting") {
                        handleScheduleMeeting(alert);
                      } else {
                        // Placeholder for other actions
                        console.log(`${alert.actionText} for ${alert.studentName}`);
                      }
                    }}
                    className={`w-full bg-white border py-2 rounded-lg text-[12px] font-bold transition-all duration-300 shadow-sm mt-1 ${alert.type === 'Low Attendance' ? 'hover:bg-rose-50 text-[#BE123C] border-rose-200' : 'hover:bg-amber-50 text-[#B45309] border-amber-200'}`}
                  >
                    {alert.actionText}
                  </button>
                )}
              </div>
            )) : (
               <div className="p-4 text-center text-slate-500 font-medium">No critical alerts for this module! All clear 🚀</div>
            )}
          </div>
        </div>
      </div>

      {/* --- Schedule Meeting Modal --- */}
      {isMeetingModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Overlay */}
          <div 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300"
            onClick={() => setIsMeetingModalOpen(false)}
          />
          
          {/* Modal Card */}
          <div className="relative bg-white w-full max-w-md rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-8 duration-500 border border-slate-100">
            {/* Header */}
            <div className="bg-gradient-to-br from-teal-600 via-teal-500 to-cyan-600 p-8 text-white relative overflow-hidden">
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mt-10 -mr-10"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-teal-900/20 rounded-full blur-xl -mb-10 -ml-10"></div>
              
              <button 
                onClick={() => setIsMeetingModalOpen(false)}
                className="absolute top-6 right-6 p-2.5 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md transition-all duration-300 hover:rotate-90"
              >
                <X className="w-4 h-4 text-white" />
              </button>
              
              <div className="flex items-center gap-5 relative z-10">
                <div className="w-16 h-16 rounded-[20px] bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-2xl font-extrabold shadow-inner relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                  {meetingTarget?.initials}
                </div>
                <div>
                  <h3 className="text-2xl font-extrabold tracking-tight drop-shadow-sm mb-1">Schedule Meeting</h3>
                  <p className="text-teal-50 text-[15px] font-medium opacity-90 flex items-center gap-1.5">
                     with {meetingTarget?.name}
                  </p>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="p-8 space-y-7">
              {/* Date */}
              <div className="space-y-2.5">
                <label className="text-[12px] font-extrabold text-slate-500 uppercase tracking-wider flex items-center gap-2 mb-1">
                  <Calendar className="w-3.5 h-3.5 text-teal-500" /> Select Date
                </label>
                <div className="relative group">
                  <input 
                    type="date" 
                    min={new Date().toISOString().split('T')[0]}
                    value={meetingForm.date}
                    onChange={(e) => setMeetingForm({ ...meetingForm, date: e.target.value })}
                    className={`w-full bg-slate-50/50 border ${formErrors.date ? 'border-rose-400 ring-4 ring-rose-500/10' : 'border-slate-200'} rounded-2xl px-5 py-3.5 text-[15px] font-bold text-slate-700 focus:bg-white focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-400 transition-all duration-300 shadow-sm hover:border-teal-300 cursor-pointer appearance-none`}
                  />
                  {formErrors.date && <p className="text-[11px] font-bold text-rose-500 mt-2 absolute -bottom-6 left-1">{formErrors.date}</p>}
                </div>
              </div>

              {/* Time Context */}
              <div className="space-y-2.5 pt-1">
                <label className="text-[12px] font-extrabold text-slate-500 uppercase tracking-wider flex items-center gap-2 mb-1">
                  <Clock className="w-3.5 h-3.5 text-teal-500" /> Set Time
                </label>
                <div className="flex gap-4 items-end bg-slate-50/30 p-2 rounded-3xl border border-slate-100 shadow-sm">
                  <ScrollPicker 
                    label="Hour" 
                    options={[...Array(12)].map((_, i) => (i + 1).toString().padStart(2, '0'))} 
                    value={meetingForm.hour}
                    onChange={(val) => setMeetingForm({ ...meetingForm, hour: val })}
                  />
                  <ScrollPicker 
                    label="Min" 
                    options={[...Array(60)].map((_, i) => i.toString().padStart(2, '0'))} 
                    value={meetingForm.minute}
                    onChange={(val) => setMeetingForm({ ...meetingForm, minute: val })}
                  />
                  <ScrollPicker 
                    label="Period" 
                    options={["AM", "PM"]} 
                    value={meetingForm.period}
                    onChange={(val) => setMeetingForm({ ...meetingForm, period: val })}
                  />
                </div>
                {formErrors.time && <p className="text-[11px] font-bold text-rose-500 mt-2">{formErrors.time}</p>}
              </div>

              {/* Note */}
              <div className="space-y-2.5 pt-1">
                <label className="text-[12px] font-extrabold text-slate-500 uppercase tracking-wider flex items-center gap-2 mb-1">
                  <StickyNote className="w-3.5 h-3.5 text-teal-500" /> Agenda Note <span className="text-[10px] text-slate-400 font-bold ml-1 normal-case tracking-normal">(Optional)</span>
                </label>
                <div className="relative">
                  <textarea 
                    placeholder="Briefly describe what you want to discuss..."
                    rows="3"
                    value={meetingForm.note}
                    onChange={(e) => setMeetingForm({ ...meetingForm, note: e.target.value })}
                    className={`w-full bg-slate-50/50 border ${formErrors.note ? 'border-rose-400 ring-4 ring-rose-500/10' : 'border-slate-200'} rounded-2xl px-5 py-4 text-[14px] font-medium text-slate-700 focus:bg-white focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-400 transition-all duration-300 resize-none shadow-sm hover:border-teal-300 leading-relaxed`}
                  />
                  {formErrors.note && <p className="text-[11px] font-bold text-rose-500 mt-2 absolute -bottom-6 left-1">{formErrors.note}</p>}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-4 pt-4">
                <button 
                  onClick={() => setIsMeetingModalOpen(false)}
                  className="flex-[0.8] px-6 py-4 border-2 border-slate-200 text-slate-500 rounded-2xl text-[14px] font-bold hover:bg-slate-50 hover:text-slate-700 hover:border-slate-300 transition-all duration-300 active:scale-[0.98]"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleConfirmMeeting}
                  className="flex-[1.2] px-6 py-4 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-2xl text-[14px] font-bold hover:from-teal-600 hover:to-cyan-600 shadow-lg shadow-teal-500/25 transition-all duration-300 hover:shadow-teal-500/40 active:scale-[0.98] transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                >
                  <Calendar className="w-4 h-4" />
                  Confirm 
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
        </>
      )}

      {/* --- Cancel Meeting Confirmation Modal --- */}
      {cancelMeetingTarget && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300"
            onClick={() => setCancelMeetingTarget(null)}
          />
          <div className="relative bg-white w-full max-w-sm rounded-[32px] shadow-2xl p-8 animate-in zoom-in-95 duration-300 text-center border border-slate-100 flex flex-col items-center overflow-hidden">
            <div className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center mb-5 text-rose-500 shadow-inner border border-rose-100">
              <AlertTriangle className="w-8 h-8" strokeWidth={2} />
            </div>
            <h3 className="text-xl font-extrabold text-slate-900 tracking-tight mb-2">Cancel Meeting?</h3>
            <p className="text-[15px] font-medium text-slate-500 mb-8 leading-relaxed">
              Are you sure you want to cancel this scheduled meeting with <span className="font-bold text-slate-700">{cancelMeetingTarget.studentName}</span>?
            </p>
            <div className="flex gap-3 w-full">
              <button 
                onClick={() => setCancelMeetingTarget(null)}
                className="flex-[1] px-4 py-3 border-2 border-slate-200 text-slate-500 rounded-2xl text-[14px] font-bold hover:bg-slate-50 hover:text-slate-700 transition-all duration-300 active:scale-[0.98]"
              >
                Keep Meeting
              </button>
              <button 
                onClick={() => {
                  setScheduledStudentIds(prev => prev.filter(id => id !== cancelMeetingTarget.id));
                  setCancelMeetingTarget(null);
                  setActiveToast(`Meeting with ${cancelMeetingTarget.studentName} cancelled.`);
                  setTimeout(() => setActiveToast(null), 4000);
                }}
                className="flex-[1] px-4 py-3 bg-rose-500 text-white rounded-2xl text-[14px] font-bold hover:bg-rose-600 shadow-lg shadow-rose-500/25 transition-all duration-300 hover:shadow-rose-500/40 active:scale-[0.98]"
              >
                Cancel Meeting
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- Toast Notification --- */}
      {activeToast && (
        <div className="fixed bottom-8 right-8 z-[200] animate-in slide-in-from-right-8 fade-in duration-500">
           <div className="bg-slate-900 border border-slate-800 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 min-w-[300px]">
              <div className="w-10 h-10 rounded-full bg-teal-500/20 flex items-center justify-center text-teal-400 shrink-0">
                 <Target className="w-5 h-5" />
              </div>
              <p className="text-sm font-bold tracking-tight">{activeToast}</p>
              <button 
                onClick={() => setActiveToast(null)}
                className="ml-auto text-slate-500 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
           </div>
        </div>
      )}
    </div>
  );
}
