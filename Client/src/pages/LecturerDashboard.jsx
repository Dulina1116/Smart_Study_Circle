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

export default function LecturerDashboard() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false) // For mobile
  const [activeTab, setActiveTab] = useState('dashboard')

  // Keep original authentication logic
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

  if (!user) return null

  return (
    <div className="flex h-screen bg-[#F4F7FB] font-sans text-slate-800 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex-none flex flex-col z-20 overflow-y-auto">
        {/* Logo Area */}
        <div className="h-16 flex items-center px-6 shrink-0 mt-2 mb-2">
          <div className="flex items-center gap-3">
            <div className="bg-[#1E90FF] p-2 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
            <span className="font-bold text-lg text-slate-900 tracking-tight">SmartStudy</span>
          </div>
        </div>

        {/* Main Nav */}
        <div className="flex-1 py-4 flex flex-col">
          <nav className="space-y-1 px-3">
            <a href="#" onClick={() => setActiveTab('dashboard')} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-semibold text-sm transition-colors ${activeTab === 'dashboard' ? 'bg-[#EAF4FE] text-[#1E90FF]' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}>
              <LayoutDashboard className="w-[18px] h-[18px]" strokeWidth={2.5}/>
              Dashboard
            </a>
            <a href="#" className="flex items-center gap-3 px-3 py-2.5 text-slate-500 hover:bg-slate-50 hover:text-slate-800 rounded-lg font-medium text-sm transition-colors">
              <Users className="w-[18px] h-[18px]" strokeWidth={2}/>
              My Circles
            </a>
            <a href="#" className="flex items-center gap-3 px-3 py-2.5 text-slate-500 hover:bg-slate-50 hover:text-slate-800 rounded-lg font-medium text-sm transition-colors">
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
          <a href="#" onClick={() => setActiveTab('profile')} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-semibold text-sm transition-colors ${activeTab === 'profile' ? 'bg-[#EAF4FE] text-[#1E90FF]' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'} mb-1`}>
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
        <header className="h-20 bg-white md:bg-transparent border-b border-transparent md:border-slate-200 flex items-center justify-between px-8 shrink-0 bg-white">
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">Dashboard Overview</h1>

          <div className="flex items-center gap-6">
            <div className="relative hidden lg:block w-72">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="w-4 h-4 text-slate-400" />
              </div>
              <input
                type="text"
                className="bg-slate-100 border-none text-sm rounded-full focus:ring-2 focus:ring-[#1E90FF] block w-full pl-9 pr-4 py-2 text-slate-600 placeholder-slate-400 font-medium w-[300px]"
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
                  {user.profilePicture ? (
                    <img src={`http://localhost:5000${user.profilePicture}`} alt="Profile" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
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
                    <div className="text-3xl font-extrabold text-slate-800">12</div>
                  </div>
                  <div className="w-[42px] h-[42px] rounded-xl bg-[#EAF4FE] flex items-center justify-center text-[#1E90FF]">
                    <Users className="w-[20px] h-[20px] fill-[#EAF4FE] text-[#1E90FF]" />
                  </div>
                </div>
                <div className="pt-2 flex items-center gap-1.5 text-xs">
                  <span className="text-emerald-500 font-bold flex items-center">
                    <TrendingUp className="w-3.5 h-3.5 mr-1" /> +2
                  </span>
                  <span className="text-slate-400 font-medium">from last week</span>
                </div>
              </div>

              {/* Total Sessions */}
              <div className="bg-white rounded-[20px] p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-[13px] font-semibold text-slate-500 mb-3">Total Sessions</h3>
                    <div className="text-3xl font-extrabold text-slate-800">45</div>
                  </div>
                  <div className="w-[42px] h-[42px] rounded-xl bg-[#E8F0FF] flex items-center justify-center text-[#4169E1]">
                    <Clock className="w-[20px] h-[20px]" />
                  </div>
                </div>
                 <div className="pt-2 text-xs font-medium text-slate-500 leading-snug">
                  Total of <span className="font-bold text-slate-700">120 hours</span><br/>logged
                </div>
              </div>

              {/* Top Module */}
              <div className="bg-white rounded-[20px] p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col space-y-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-[13px] font-semibold text-slate-500 mb-3">Top Module</h3>
                    <div className="text-[17px] font-bold text-slate-800 tracking-tight leading-tight max-w-[120px]">Intro to Physics</div>
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
                    <div className="text-3xl font-extrabold text-slate-800">3</div>
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
                    <a href="#" className="text-sm font-bold text-[#1E90FF] hover:text-blue-600">View All</a>
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
                        {/* Row 1 */}
                        <tr className="border-b border-slate-50 group">
                          <td className="py-4 text-[14px] font-bold text-slate-800 pr-4">Physics Group A</td>
                          <td className="py-4 text-[13px] font-medium text-slate-500 pr-4">Intro to Physics</td>
                          <td className="py-4 pr-4">
                            <div className="flex -space-x-2">
                              {/* Using generic placeholders, match visual style */}
                              <img className="w-7 h-7 rounded-full border-2 border-white object-cover" src="https://i.pravatar.cc/100?img=1" alt="avatar" />
                              <img className="w-7 h-7 rounded-full border-2 border-white object-cover" src="https://i.pravatar.cc/100?img=2" alt="avatar" />
                              <img className="w-7 h-7 rounded-full border-2 border-white object-cover" src="https://i.pravatar.cc/100?img=3" alt="avatar" />
                              <div className="w-7 h-7 rounded-full border-2 border-white bg-slate-100 text-[10px] font-bold text-slate-500 flex items-center justify-center z-10">
                                +2
                              </div>
                            </div>
                          </td>
                          <td className="py-4 text-[13px] font-medium text-slate-500 pr-4">2 mins ago</td>
                          <td className="py-4 text-center">
                             <button className="px-4 py-1.5 border border-blue-100 text-[#1E90FF] rounded-lg text-xs font-bold hover:bg-blue-50 transition-colors">View Trends</button>
                          </td>
                        </tr>
                        {/* Row 2 */}
                        <tr className="border-b border-slate-50 group">
                          <td className="py-4 text-[14px] font-bold text-slate-800 pr-4">Calc II Study Block</td>
                          <td className="py-4 text-[13px] font-medium text-slate-500 pr-4">Calculus II</td>
                          <td className="py-4 pr-4">
                            <div className="flex -space-x-2">
                              <img className="w-7 h-7 rounded-full border-2 border-white object-cover" src="https://i.pravatar.cc/100?img=4" alt="avatar" />
                              <img className="w-7 h-7 rounded-full border-2 border-white object-cover" src="https://i.pravatar.cc/100?img=5" alt="avatar" />
                            </div>
                          </td>
                          <td className="py-4 text-[13px] font-medium text-slate-500 pr-4">45 mins ago</td>
                          <td className="py-4 text-center">
                             <button className="px-4 py-1.5 border border-blue-100 text-[#1E90FF] rounded-lg text-xs font-bold hover:bg-blue-50 transition-colors">View Trends</button>
                          </td>
                        </tr>
                        {/* Row 3 */}
                        <tr className="border-b border-slate-50 group">
                          <td className="py-4 text-[14px] font-bold text-slate-800 pr-4">History 101 Midterm Prep</td>
                          <td className="py-4 text-[13px] font-medium text-slate-500 pr-4">World History</td>
                          <td className="py-4 pr-4">
                            <div className="flex -space-x-2">
                              <img className="w-7 h-7 rounded-full border-2 border-white object-cover" src="https://i.pravatar.cc/100?img=6" alt="avatar" />
                              <div className="w-7 h-7 rounded-full border-2 border-white bg-slate-100 text-[10px] font-bold text-slate-500 flex items-center justify-center z-10">
                                +8
                              </div>
                            </div>
                          </td>
                          <td className="py-4 text-[13px] font-medium text-slate-500 pr-4">1 hour ago</td>
                          <td className="py-4 text-center">
                             <button className="px-4 py-1.5 border border-blue-100 text-[#1E90FF] rounded-lg text-xs font-bold hover:bg-blue-50 transition-colors">View Trends</button>
                          </td>
                        </tr>
                        {/* Row 4 */}
                        <tr className="group">
                          <td className="py-4 text-[14px] font-bold text-slate-800 pr-4">Biology Lab Report Help</td>
                          <td className="py-4 text-[13px] font-medium text-slate-500 pr-4">Biology 101</td>
                          <td className="py-4 pr-4">
                            <div className="flex -space-x-2">
                              <img className="w-7 h-7 rounded-full border-2 border-white object-cover" src="https://i.pravatar.cc/100?img=7" alt="avatar" />
                              <img className="w-7 h-7 rounded-full border-2 border-white object-cover" src="https://i.pravatar.cc/100?img=8" alt="avatar" />
                              <img className="w-7 h-7 rounded-full border-2 border-white object-cover" src="https://i.pravatar.cc/100?img=9" alt="avatar" />
                            </div>
                          </td>
                          <td className="py-4 text-[13px] font-medium text-slate-500 pr-4">3 hours ago</td>
                          <td className="py-4 text-center">
                             <button className="px-4 py-1.5 border border-blue-100 text-[#1E90FF] rounded-lg text-xs font-bold hover:bg-blue-50 transition-colors">View Trends</button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Top Resources */}
                <div className="bg-white rounded-[20px] shadow-[0_2px_10px_rgba(0,0,0,0.02)] p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-[15px] font-bold text-slate-800">Top Resources</h3>
                    <button className="bg-[#1E90FF] hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-[13px] font-bold transition-colors">Upload Resource</button>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Res 1 */}
                    <div className="border border-slate-100 rounded-xl p-4 flex items-center justify-between shadow-sm">
                      <div className="flex items-center gap-4">
                        <div className="w-[38px] h-[38px] rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
                          <span className="text-[10px] font-extrabold text-red-500 flex items-center">
                             {/* PDF Icon Mocking */}
                             <FileText strokeWidth={2.5} className="w-[20px] h-[20px]" />
                          </span>
                        </div>
                        <div>
                          <h4 className="text-[13px] font-bold text-slate-800 mb-0.5 max-w-[130px] truncate">Week 4 Lecture Notes</h4>
                          <p className="text-[11px] text-slate-500 font-medium">150 Downloads</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span className="text-[13px] font-bold text-slate-600">4.9</span>
                      </div>
                    </div>

                    {/* Res 2 */}
                    <div className="border border-slate-100 rounded-xl p-4 flex items-center justify-between shadow-sm">
                      <div className="flex items-center gap-4">
                         <div className="w-[38px] h-[38px] rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                          <span className="text-[10px] font-extrabold text-blue-500 flex items-center">
                             <FileText strokeWidth={2.5} className="w-[20px] h-[20px]" />
                          </span>
                        </div>
                        <div>
                          <h4 className="text-[13px] font-bold text-slate-800 mb-0.5 max-w-[130px] truncate">Exam Cheat Sheet...</h4>
                          <p className="text-[11px] text-slate-500 font-medium">98 Downloads</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span className="text-[13px] font-bold text-slate-600">4.8</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Sidebar Content (Right 1 col) */}
              <div className="space-y-6">
                
                {/* Pending Reports */}
                <div className="bg-white rounded-[20px] shadow-[0_2px_10px_rgba(0,0,0,0.02)] p-6">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-[15px] font-bold text-slate-800">Pending Reports</h3>
                    <span className="bg-red-50 text-red-500 px-2 py-1 rounded-[6px] text-[10px] font-bold tracking-wide">3 New</span>
                  </div>

                  <div className="space-y-3">
                    {/* Report 1 */}
                    <div className="bg-[#FCFCFD] border border-slate-100 rounded-[14px] p-4 shadow-sm">
                      <div className="flex items-start gap-3 mb-4">
                        <div className="w-[28px] h-[28px] rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <AlertTriangle className="w-[14px] h-[14px] text-orange-500" strokeWidth={3}/>
                        </div>
                        <div>
                          <h4 className="text-[13px] font-bold text-slate-800 mb-0.5 leading-tight">Inappropriate comment</h4>
                          <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                            in Biology 101 Circle by <span className="text-slate-700 font-semibold">User X</span>
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button className="flex-1 bg-white border border-slate-200 text-slate-700 py-1.5 rounded-[8px] text-[12px] font-bold hover:bg-slate-50 transition-colors shadow-sm">Review</button>
                        <button className="flex-1 bg-white border border-slate-200 text-slate-700 py-1.5 rounded-[8px] text-[12px] font-bold hover:bg-slate-50 transition-colors shadow-sm">Dismiss</button>
                      </div>
                    </div>

                    {/* Report 2 */}
                    <div className="bg-[#FCFCFD] border border-slate-100 rounded-[14px] p-4 shadow-sm">
                      <div className="flex items-start gap-3 mb-4">
                        <div className="w-[28px] h-[28px] rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <XCircle className="w-[14px] h-[14px] text-red-500" strokeWidth={3} />
                        </div>
                        <div>
                          <h4 className="text-[13px] font-bold text-slate-800 mb-0.5 leading-tight">Spam link posted</h4>
                          <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                            in Physics Group A by <span className="text-slate-700 font-semibold">User Y</span>
                          </p>
                        </div>
                      </div>
                      <button className="w-full bg-[#1E90FF] text-white py-2 rounded-[8px] text-[12px] font-bold hover:bg-blue-600 transition-colors shadow-sm">Resolve</button>
                    </div>
                  </div>

                  <div className="text-center mt-5">
                    <a href="#" className="text-[12px] font-bold text-slate-500 hover:text-slate-800 transition-colors">View all reports</a>
                  </div>
                </div>

                {/* Upcoming Office Hours */}
                <div className="bg-white rounded-[20px] shadow-[0_2px_10px_rgba(0,0,0,0.02)] p-6">
                  <h3 className="text-[15px] font-bold text-slate-800 mb-5">Upcoming Office Hours</h3>
                  
                  <div className="space-y-4">
                    {/* Event 1 */}
                    <div className="flex gap-4 items-center">
                      <div className="w-[46px] h-[48px] bg-[#FAFAFA] rounded-[12px] border border-slate-100 flex flex-col items-center justify-center flex-shrink-0 shadow-sm">
                        <span className="text-[9px] font-bold text-slate-400 tracking-wider">OCT</span>
                        <span className="text-[16px] font-extrabold text-slate-800 leading-tight">24</span>
                      </div>
                      <div>
                        <h4 className="text-[13px] font-bold text-slate-800 mb-0.5">Physics Q&A</h4>
                        <p className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                          14:00 - 16:00 PM
                        </p>
                      </div>
                    </div>

                    {/* Event 2 */}
                    <div className="flex gap-4 items-center">
                      <div className="w-[46px] h-[48px] bg-[#FAFAFA] rounded-[12px] border border-slate-100 flex flex-col items-center justify-center flex-shrink-0 shadow-sm">
                        <span className="text-[9px] font-bold text-slate-400 tracking-wider">OCT</span>
                        <span className="text-[16px] font-extrabold text-slate-800 leading-tight">26</span>
                      </div>
                      <div>
                        <h4 className="text-[13px] font-bold text-slate-800 mb-0.5">Open Consultation</h4>
                        <p className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                          09:00 - 11:00 AM
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>

          </div>
          ) : (
            <LecturerProfileSettings user={user} />
          )}
        </div>
      </main>
    </div>
  )
}
