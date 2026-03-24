import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  GraduationCap,
  LayoutDashboard,
  Users,
  BookOpen, // Library
  Activity, // Student Analytics
  Flag,
  Gavel, // Disputes
  Settings,
  Search,
  Bell,
  Clock,
  Star,
  AlertCircle,
  FileText, // For PDF/DOC
  TrendingUp,
  AlertTriangle,
  XCircle,
  LogOut,
  User
} from 'lucide-react'
import { clearAuth, getUser } from '../utils/authUtils'
import LecturerProfileSettings from '../components/LecturerProfileSettings'
import LecturerMyCircles from '../components/LecturerMyCircles'
import LecturerResourceLibrary from '../components/LecturerResourceLibrary'

const API_ORIGIN = import.meta.env.VITE_API_ORIGIN || `${window.location.protocol}//${window.location.hostname}:5000`

const resolveImageUrl = (value) => {
  if (!value || typeof value !== 'string') return ''
  if (value.startsWith('http://') || value.startsWith('https://') || value.startsWith('data:') || value.startsWith('blob:')) return value
  if (value.startsWith('/')) return `${API_ORIGIN}${value}`
  if (value.startsWith('uploads/')) return `${API_ORIGIN}/${value}`
  if (value.startsWith('profile-')) return `${API_ORIGIN}/uploads/${value}`
  return value
}

export default function LecturerDashboard() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false) // For mobile
  const [activeTab, setActiveTab] = useState('dashboard')

  // Dashboard Dynamic States
  const [stats, setStats] = useState({ activeCircles: 0, totalSessions: 0, topModule: 'N/A', reportedIssues: 0 })
  const [pendingReports, setPendingReports] = useState([])
  const [topResources, setTopResources] = useState([])
  const [officeHours, setOfficeHours] = useState([])
  const [circleMonitor, setCircleMonitor] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  // Auth Effect
  useEffect(() => {
    const u = getUser()
    if (!u || u.role !== 'lecturer') {
      navigate('/login', { replace: true })
      return
    }
    setUser(u)
  }, [navigate])

  const handleLogout = () => {
    clearAuth()
    navigate('/', { replace: true })
  }

  // Dashboard Fetching Effect
  useEffect(() => {
    if (user && activeTab === 'dashboard') {
      setIsLoading(true)
      const token = localStorage.getItem('token')
      const headers = { Authorization: `Bearer ${token}` }
      
      Promise.all([
        fetch('http://localhost:5000/api/dashboard/stats', { headers }).then(r => r.json()),
        fetch('http://localhost:5000/api/reports', { headers }).then(r => r.json()),
        fetch('http://localhost:5000/api/resources/top', { headers }).then(r => r.json()),
        fetch('http://localhost:5000/api/office-hours', { headers }).then(r => r.json()),
        fetch('http://localhost:5000/api/circles', { headers }).then(r => r.json())
      ]).then(([statsData, reportsData, resourcesData, officeData, circlesData]) => {
        setStats(statsData)
        if (Array.isArray(reportsData)) setPendingReports(reportsData)
        if (Array.isArray(resourcesData)) setTopResources(resourcesData)
        if (Array.isArray(officeData)) setOfficeHours(officeData)
        if (Array.isArray(circlesData)) setCircleMonitor(circlesData.slice(0, 4))
      }).catch(err => console.error(err))
      .finally(() => setIsLoading(false))
    }
  }, [user, activeTab])

  const handleReportAction = async (reportId, status) => {
    const token = localStorage.getItem('token')
    try {
      const res = await fetch(`http://localhost:5000/api/reports/${reportId}/status`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ status })
      })
      if (res.ok) {
        setPendingReports(prev => prev.filter(r => r._id !== reportId))
        setStats(prev => ({...prev, reportedIssues: Math.max(0, prev.reportedIssues - 1)}))
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleViewTrends = async (circleId) => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`http://localhost:5000/api/dashboard/analytics/${circleId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      alert(`Trends for Circle:\nEngagement: ${data.engagementScore}%\nAttendance: ${data.attendanceRate}%\nRecent Activity: ${data.recentActivity}`)
    } catch (err) {
      console.error(err)
    }
  }

  if (!user) return null

  return (
    <div className="flex h-screen bg-[#F4F7FB] font-sans text-slate-800 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex-none flex flex-col z-20 overflow-y-auto">
        {/* Logo Area */}
        <div className="h-16 flex items-center px-6 shrink-0 mt-2 mb-2">
          <div className="flex items-center gap-3">
            <div className="bg-teal-500 p-2 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
            <span className="font-bold text-lg text-slate-900 tracking-tight">SmartStudy</span>
          </div>
        </div>

        {/* Main Nav */}
        <div className="flex-1 py-4 flex flex-col">
          <nav className="space-y-1 px-3">
            <a href="#" onClick={() => setActiveTab('dashboard')} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-semibold text-sm transition-colors ${activeTab === 'dashboard' ? 'bg-teal-50 text-teal-600' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}>
              <LayoutDashboard className="w-[18px] h-[18px]" strokeWidth={2.5}/>
              Dashboard
            </a>
            <a href="#" onClick={() => setActiveTab('circles')} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-semibold text-sm transition-colors ${activeTab === 'circles' ? 'bg-teal-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}>
              <Users className="w-[18px] h-[18px]" strokeWidth={2}/>
              My Circles
            </a>
            <a href="#" onClick={() => setActiveTab('library')} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-semibold text-sm transition-colors ${activeTab === 'library' ? 'bg-teal-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}>
              <BookOpen className="w-[18px] h-[18px]" strokeWidth={2}/>
              Resource Library
            </a>
            <a href="#" className="flex items-center gap-3 px-3 py-2.5 text-slate-500 hover:bg-slate-50 hover:text-slate-800 rounded-lg font-medium text-sm transition-colors">
              <Activity className="w-[18px] h-[18px]" strokeWidth={2}/>
              Student Analytics
            </a>
          </nav>

          <div className="mt-8 px-3">
            <p className="px-3 text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-2">MODERATION</p>
            <nav className="space-y-1">
              <a href="#" className="flex items-center justify-between px-3 py-2.5 text-slate-500 hover:bg-slate-50 hover:text-slate-800 rounded-lg font-medium text-sm transition-colors">
                <div className="flex items-center gap-3">
                  <Flag className="w-[18px] h-[18px]" strokeWidth={2}/>
                  Reports
                </div>
                <span className="bg-red-50 text-red-500 w-5 h-5 flex items-center justify-center rounded-full text-[10px] font-bold">3</span>
              </a>
              <a href="#" className="flex items-center gap-3 px-3 py-2.5 text-slate-500 hover:bg-slate-50 hover:text-slate-800 rounded-lg font-medium text-sm transition-colors">
                <Gavel className="w-[18px] h-[18px]" strokeWidth={2}/>
                Disputes
              </a>
            </nav>
          </div>
        </div>

        {/* Bottom Settings */}
        <div className="p-4 mb-2 shrink-0 border-t border-slate-200 mt-2">
          <a href="#" onClick={() => setActiveTab('profile')} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-semibold text-sm transition-colors ${activeTab === 'profile' ? 'bg-teal-50 text-teal-600' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'} mb-1`}>
            <Settings className="w-[18px] h-[18px]" strokeWidth={2}/>
            Settings
          </a>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 text-red-500 hover:bg-red-50 hover:text-red-600 rounded-lg font-medium text-sm transition-colors">
            <LogOut className="w-[18px] h-[18px]" strokeWidth={2}/>
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#FAFAFA] md:bg-[#FAFAFA]">
        {/* Header */}
        <header className="h-20 bg-white md:bg-transparent border-b border-transparent md:border-slate-200 flex items-center justify-between px-8 shrink-0">
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">Dashboard Overview</h1>

          <div className="flex items-center gap-6">
            <div className="relative hidden lg:block w-72">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="w-4 h-4 text-slate-400" />
              </div>
              <input
                type="text"
                className="bg-slate-100 border-none text-sm rounded-full focus:ring-2 focus:ring-teal-500 block w-full pl-9 pr-4 py-2 text-slate-600 placeholder-slate-400 font-medium w-[300px]"
                placeholder="Search circles or students..."
              />
            </div>
            
            <div className="flex items-center gap-5">
              <button className="relative text-slate-500 hover:text-slate-700 transition-colors">
                <Bell className="w-5 h-5 fill-slate-500" />
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
              </button>
              
              <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setActiveTab('profile')} title="Profile Settings">
                <div className="w-9 h-9 rounded-full overflow-hidden border border-slate-200 bg-slate-100 flex items-center justify-center">
                  {resolveImageUrl(user.profilePicture || user.avatar || '') ? (
                    <img src={resolveImageUrl(user.profilePicture || user.avatar || '')} alt="Profile" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  ) : (
                    <User className="w-5 h-5 text-slate-400 group-hover:scale-105 transition-transform" />
                  )}
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-bold text-slate-800 leading-none mb-1">{user.fullName}</p>
                  <p className="text-xs text-slate-500 font-semibold">{user.designation || (user.role === 'lecturer' ? 'Lecturer' : user.role)}</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content Body (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-8">
          {activeTab === 'dashboard' ? (
          <div className="max-w-[1400px] mx-auto">

            {/* Welcome Title */}
            <div className="mb-8 mt-2">
              <h2 className="text-2xl font-bold text-slate-900 mb-1">Welcome back, {user.fullName}</h2>
              <p className="text-slate-500 text-sm font-medium">Here's what's happening in your study circles today.</p>
            </div>

            {/* 4 Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Active Circles */}
              <div className="bg-white rounded-[20px] p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-[13px] font-semibold text-slate-500 mb-3">Active Circles</h3>
                    <div className="text-3xl font-extrabold text-slate-800">{stats.activeCircles}</div>
                  </div>
                  <div className="w-[42px] h-[42px] rounded-xl bg-teal-50 flex items-center justify-center text-teal-600">
                    <Users className="w-[20px] h-[20px] fill-[#EAF4FE] text-teal-600" />
                  </div>
                </div>
                <div className="pt-2 flex items-center gap-1.5 text-xs">
                  <span className="text-emerald-500 font-bold flex items-center">
                    <TrendingUp className="w-3.5 h-3.5 mr-1" /> +Active
                  </span>
                  <span className="text-slate-400 font-medium">recently</span>
                </div>
              </div>

              {/* Total Sessions */}
              <div className="bg-white rounded-[20px] p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-[13px] font-semibold text-slate-500 mb-3">Total Sessions</h3>
                    <div className="text-3xl font-extrabold text-slate-800">{stats.totalSessions}</div>
                  </div>
                  <div className="w-[42px] h-[42px] rounded-xl bg-[#E8F0FF] flex items-center justify-center text-[#4169E1]">
                    <Clock className="w-[20px] h-[20px]" />
                  </div>
                </div>
                 <div className="pt-2 text-xs font-medium text-slate-500 leading-snug">
                  Total hours <br/>logged across circles
                </div>
              </div>

              {/* Top Module */}
              <div className="bg-white rounded-[20px] p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col space-y-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-[13px] font-semibold text-slate-500 mb-3">Top Module</h3>
                    <div className="text-[17px] font-bold text-slate-800 tracking-tight leading-tight max-w-[120px]">{stats.topModule}</div>
                  </div>
                  <div className="w-[42px] h-[42px] rounded-xl bg-purple-50 flex items-center justify-center">
                    <Star className="w-[20px] h-[20px] text-purple-600 fill-purple-600" />
                  </div>
                </div>
                <div className="pt-1">
                   <div className="flex items-center gap-2">
                    <div className="w-full bg-slate-100 rounded-full h-1.5">
                      <div className="bg-purple-500 h-1.5 rounded-full" style={{ width: '85%' }}></div>
                    </div>
                    <span className="text-xs font-bold text-purple-600">85%</span>
                  </div>
                </div>
              </div>

              {/* Reported Issues */}
              <div className="bg-white rounded-[20px] p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-[13px] font-semibold text-red-500 mb-3">Reported Issues</h3>
                    <div className="text-3xl font-extrabold text-slate-800">{stats.reportedIssues}</div>
                  </div>
                  <div className="w-[42px] h-[42px] rounded-xl bg-red-50 flex items-center justify-center text-red-500">
                    <AlertTriangle className="w-[20px] h-[20px]" strokeWidth={2.5} />
                  </div>
                </div>
                <div className="pt-2 text-xs font-bold text-red-500 mt-auto">
                  Action Required
                </div>
              </div>
            </div>

            {/* Bottom Section (2 Columns) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Main Content Area (Left 2 cols) */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Circle Activity Monitor */}
                <div className="bg-white rounded-[20px] shadow-[0_2px_10px_rgba(0,0,0,0.02)] overflow-hidden">
                  <div className="p-6 flex items-center justify-between">
                    <h3 className="text-[15px] font-bold text-slate-800">Circle Activity Monitor</h3>
                    <a href="#" className="text-sm font-bold text-teal-600 hover:text-blue-600">View All</a>
                  </div>
                  <div className="px-6 pb-6">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-slate-100">
                          <th className="pb-3 text-[13px] font-semibold text-slate-500 whitespace-nowrap">Circle Name</th>
                          <th className="pb-3 text-[13px] font-semibold text-slate-500 whitespace-nowrap">Module</th>
                          <th className="pb-3 text-[13px] font-semibold text-slate-500 whitespace-nowrap">Members</th>
                          <th className="pb-3 text-[13px] font-semibold text-slate-500 whitespace-nowrap">Last Activity</th>
                          <th className="pb-3 text-[13px] font-semibold text-slate-500 text-center whitespace-nowrap">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {circleMonitor.length > 0 ? circleMonitor.map(circle => (
                          <tr key={circle._id} className="border-b border-slate-50 group hover:bg-slate-50/50 transition-colors">
                            <td className="py-4 text-[14px] font-bold text-slate-800 pr-4">{circle.circleName}</td>
                            <td className="py-4 text-[13px] font-medium text-slate-500 pr-4">{circle.courseName}</td>
                            <td className="py-4 pr-4">
                              <div className="flex -space-x-2">
                                <div className="w-7 h-7 rounded-full border-2 border-white bg-slate-100 text-[10px] font-bold text-slate-500 flex items-center justify-center z-10 shadow-sm">
                                  {circle.members?.length || 1}
                                </div>
                              </div>
                            </td>
                            <td className="py-4 text-[13px] font-medium text-slate-500 pr-4">Active</td>
                            <td className="py-4 text-center">
                               <button onClick={() => handleViewTrends(circle._id)} className="px-4 py-1.5 border border-blue-100 text-teal-600 rounded-lg text-xs font-bold hover:bg-blue-50 transition-colors">View Trends</button>
                            </td>
                          </tr>
                        )) : (
                          <tr><td colSpan="5" className="py-8 text-center text-[13px] font-bold text-slate-400">No recent activity detected.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Top Resources */}
                <div className="bg-white rounded-[20px] shadow-[0_2px_10px_rgba(0,0,0,0.02)] p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-[15px] font-bold text-slate-800">Top Resources</h3>
                    <button onClick={() => setActiveTab('library')} className="bg-teal-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-[13px] font-bold transition-colors">Upload Resource</button>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {topResources.length > 0 ? topResources.map(res => (
                      <div key={res._id} className="border border-slate-100 rounded-xl p-4 flex items-center justify-between shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
                        <div className="flex items-center gap-4">
                          <div className="w-[38px] h-[38px] rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
                            <span className="text-[10px] font-extrabold text-red-500 flex items-center">
                               <FileText strokeWidth={2.5} className="w-[20px] h-[20px]" />
                            </span>
                          </div>
                          <div>
                            <h4 className="text-[13px] font-bold text-slate-800 mb-0.5 max-w-[130px] truncate">{res.title}</h4>
                            <p className="text-[11px] text-slate-500 font-medium">{res.downloads} Downloads</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span className="text-[13px] font-bold text-slate-600">New</span>
                        </div>
                      </div>
                    )) : (
                      <div className="text-[13px] font-bold text-slate-400 col-span-2 py-4">No resources shared yet.</div>
                    )}
                  </div>
                </div>

              </div>

              {/* Sidebar Content (Right 1 col) */}
              <div className="space-y-6">
                
                {/* Pending Reports */}
                <div className="bg-white rounded-[20px] shadow-[0_2px_10px_rgba(0,0,0,0.02)] p-6">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-[15px] font-bold text-slate-800">Pending Reports</h3>
                    <span className="bg-red-50 text-red-500 px-2 py-1 rounded-[6px] text-[10px] font-bold tracking-wide">{pendingReports.length} New</span>
                  </div>

                  <div className="space-y-3">
                    {pendingReports.length > 0 ? pendingReports.map(rep => (
                      <div key={rep._id} className="bg-[#FCFCFD] border border-slate-100 rounded-[14px] p-4 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-start gap-3 mb-4">
                          <div className="w-[28px] h-[28px] rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <AlertTriangle className="w-[14px] h-[14px] text-orange-500" strokeWidth={3}/>
                          </div>
                          <div>
                            <h4 className="text-[13px] font-bold text-slate-800 mb-0.5 leading-tight">{rep.title}</h4>
                            <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                              {rep.description || 'Action required from moderation dashboard'}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => handleReportAction(rep._id, 'Reviewed')} className="flex-1 bg-white border border-slate-200 text-slate-700 py-1.5 rounded-[8px] text-[12px] font-bold hover:bg-slate-50 transition-colors shadow-sm">Review</button>
                          <button onClick={() => handleReportAction(rep._id, 'Dismissed')} className="flex-1 bg-white border border-slate-200 text-slate-700 py-1.5 rounded-[8px] text-[12px] font-bold hover:bg-slate-50 transition-colors shadow-sm">Dismiss</button>
                          <button onClick={() => handleReportAction(rep._id, 'Resolved')} className="flex-1 bg-teal-500 text-white py-1.5 rounded-[8px] text-[12px] font-bold hover:bg-teal-600 transition-colors shadow-sm">Resolve</button>
                        </div>
                      </div>
                    )) : (
                      <div className="text-[13px] font-bold text-slate-400 text-center py-6">Dashboard Clear! No issues.</div>
                    )}
                  </div>

                  <div className="text-center mt-5">
                    <a href="#" className="text-[12px] font-bold text-slate-500 hover:text-slate-800 transition-colors">View all reports</a>
                  </div>
                </div>

                {/* Upcoming Office Hours */}
                <div className="bg-white rounded-[20px] shadow-[0_2px_10px_rgba(0,0,0,0.02)] p-6">
                  <h3 className="text-[15px] font-bold text-slate-800 mb-5">Upcoming Office Hours</h3>
                  
                  <div className="space-y-4">
                    {officeHours.length > 0 ? officeHours.map(hour => {
                      const d = new Date(hour.date);
                      return (
                      <div key={hour._id} className="flex gap-4 items-center">
                        <div className="w-[46px] h-[48px] bg-[#FAFAFA] rounded-[12px] border border-slate-100 flex flex-col items-center justify-center flex-shrink-0 shadow-sm">
                          <span className="text-[9px] font-bold text-slate-400 tracking-wider uppercase">{d.toLocaleString('default', { month: 'short' })}</span>
                          <span className="text-[16px] font-extrabold text-slate-800 leading-tight">{d.getDate() || '--'}</span>
                        </div>
                        <div>
                          <h4 className="text-[13px] font-bold text-slate-800 mb-0.5">{hour.title}</h4>
                          <p className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                            {hour.startTime} - {hour.endTime}
                          </p>
                        </div>
                      </div>
                    )}) : (
                      <div className="text-[13px] font-bold text-slate-400 py-2">No scheduled office hours.</div>
                    )}
                  </div>
                </div>

              </div>
            </div>

          </div>
          ) : activeTab === 'profile' ? (
            <LecturerProfileSettings user={user} />
          ) : activeTab === 'circles' ? (
            <LecturerMyCircles user={user} />
          ) : activeTab === 'library' ? (
            <LecturerResourceLibrary />
          ) : null}
        </div>
      </main>
    </div>
  )
}
