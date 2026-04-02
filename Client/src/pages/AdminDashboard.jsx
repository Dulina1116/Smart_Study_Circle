import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  GraduationCap,
  LayoutDashboard,
  Users,
  UsersRound,
  ShieldAlert,
  Settings,
  LogOut,
  Bell,
  HelpCircle,
  Search,
  UserCircle
} from "lucide-react";

import AdminOverview from "../components/admin/AdminOverview";
import AdminUserManagement from "../components/admin/AdminUserManagement";
import AdminCircleManagement from "../components/admin/AdminCircleManagement";
import AdminContentModeration from "../components/admin/AdminContentModeration";
import AdminSystemSettings from "../components/admin/AdminSystemSettings";

const navigation = [
  { name: 'Overview', id: 'overview', icon: LayoutDashboard },
  { name: 'User Management', id: 'users', icon: Users },
  { name: 'Circle Management', id: 'circles', icon: UsersRound },
  { name: 'Content Moderation', id: 'moderation', icon: ShieldAlert },
  { name: 'System Settings', id: 'settings', icon: Settings },
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState("overview");

  useEffect(() => {
    if (sessionStorage.getItem("adminAuth") !== "true") {
      navigate("/admin", { replace: true });
    }
  }, [navigate]);

  const handleLogout = () => {
    sessionStorage.removeItem("adminAuth");
    navigate("/", { replace: true });
  };

  const getSearchPlaceholder = () => {
     switch (currentView) {
        case 'users': return 'Search students, faculty...';
        case 'circles': return 'Search circles...';
        case 'moderation': return 'Search moderation queue...';
        default: return 'Search system logs...';
     }
  };

  const renderContent = () => {
    switch (currentView) {
      case "overview": return <AdminOverview />;
      case "users": return <AdminUserManagement />;
      case "circles": return <AdminCircleManagement />;
      case "moderation": return <AdminContentModeration />;
      case "settings": return <AdminSystemSettings />;
      default: return <AdminOverview />;
    }
  };

  return (
    <div className="flex h-screen bg-[#F8F9FA] overflow-hidden font-sans">
      
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 border-r border-gray-100 bg-white flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-20">
         <div className="p-6">
            <div className="flex items-center gap-3 mb-2 cursor-pointer group" onClick={() => navigate('/')}>
               <div className="w-8 h-8 rounded-xl bg-[linear-gradient(135deg,#0f766e,#14b8a6)] flex items-center justify-center text-white shadow-lg shadow-[rgba(15,118,110,0.35)] group-hover:scale-105 transition-transform">
                  <GraduationCap className="w-5 h-5" />
               </div>
               <div className="flex flex-col">
                 <span className="text-sm font-extrabold bg-clip-text text-transparent bg-[linear-gradient(135deg,#0f766e,#14b8a6)] tracking-tight">Smart Study Circle</span>
                 <span className="text-[9px] font-bold text-[var(--dash-muted)] uppercase tracking-widest">Admin Dashboard</span>
               </div>
            </div>
         </div>

         <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto">
            {navigation.map((item) => {
               const isActive = currentView === item.id;
               return (
                  <button
                     key={item.name}
                     onClick={() => setCurrentView(item.id)}
                     className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-200 group ${
                        isActive 
                           ? "bg-[var(--dash-accent-soft)] text-[var(--dash-accent)] shadow-[0_12px_24px_rgba(15,118,110,0.18)] border border-[rgba(15,118,110,0.1)]" 
                           : "text-[var(--dash-muted)] hover:bg-[var(--dash-surface-2)] hover:text-[var(--dash-ink)] border border-transparent"
                     }`}
                  >
                     {isActive && <div className="absolute left-0 w-1 h-6 bg-[var(--dash-accent)] rounded-r-full"></div>}
                     <item.icon className={`w-5 h-5 ${isActive ? "text-[var(--dash-accent)]" : "text-gray-400 group-hover:text-gray-600"}`} />
                     {item.name}
                  </button>
               );
            })}
         </nav>

         <div className="p-4 border-t border-gray-50">
            <button
               onClick={handleLogout}
               className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors group"
            >
               <LogOut className="w-5 h-5 text-gray-400 group-hover:text-rose-500" />
               Logout
            </button>
            <div className="mt-4 px-4 py-3 bg-[var(--dash-ink)] rounded-xl flex items-center gap-3 text-white border border-gray-800 shadow-xl">
               <img src="https://i.pravatar.cc/150?u=a042581f4e29026024d" alt="Admin" className="w-8 h-8 rounded-lg object-cover border border-gray-700" />
               <div className="flex flex-col">
                  <span className="text-xs font-bold text-white">Admin Panel</span>
                  <span className="text-[9px] text-[var(--dash-muted)] font-medium">Super Administrator</span>
               </div>
            </div>
         </div>
      </aside>

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
         {/* Top Navigation */}
         <header className="h-16 bg-white border-b border-[var(--dash-border)] flex items-center justify-between px-8 z-10 sticky top-0 shadow-sm">
            <div className="flex items-center gap-4 flex-1">
               <span className="text-lg font-bold text-[var(--dash-accent)] hidden md:block">Smart Study Circle</span>
               <div className="relative w-full max-w-md md:ml-6 group">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-[var(--dash-accent)] transition-colors" />
                  <input 
                     type="text" 
                     placeholder={getSearchPlaceholder()}
                     className="w-full bg-[var(--dash-surface-2)] hover:bg-gray-100 focus:bg-white text-sm border border-transparent focus:border-[var(--dash-accent)] focus:ring-4 focus:ring-[var(--dash-accent-soft)] rounded-xl py-2 pl-10 pr-4 outline-none transition-all text-[var(--dash-ink)] font-medium placeholder:text-gray-400"
                  />
               </div>
            </div>

            <div className="flex items-center gap-3">
               <button className="relative w-9 h-9 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-xl transition-colors">
                  <span className="absolute top-2 right-2.5 w-1.5 h-1.5 bg-rose-500 rounded-full"></span>
                  <Bell className="w-5 h-5" />
               </button>
               {currentView === 'settings' ? (
                  <button className="w-9 h-9 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-xl transition-colors">
                     <HelpCircle className="w-5 h-5" />
                  </button>
               ) : (
                  <button className="w-9 h-9 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-xl transition-colors">
                     <Settings className="w-5 h-5" />
                  </button>
               )}
               <div className="w-px h-6 bg-gray-200 mx-1"></div>
               <button className="flex items-center gap-2 text-gray-700 font-semibold text-sm hover:opacity-80 transition-opacity p-1">
                  <img src="https://i.pravatar.cc/150?u=a042581f4e29026024d" alt="Profile" className="w-8 h-8 rounded-xl object-cover border border-gray-100 shadow-sm" />
               </button>
            </div>
         </header>

         {/* Scrollable Main Area */}
         <main className="flex-1 overflow-y-auto bg-[var(--dash-bg)] p-8 pb-20 relative">
             <div className="w-full max-w-7xl mx-auto z-10 relative">
               {renderContent()}
             </div>
             
             {/* Decorative Background Elements */}
             <div className="fixed top-0 right-0 w-[800px] h-[800px] bg-[rgba(15,118,110,0.02)] rounded-full blur-[120px] pointer-events-none -z-0 translate-x-1/3 -translate-y-1/3"></div>
             <div className="fixed bottom-0 left-64 w-[600px] h-[600px] bg-[rgba(245,158,11,0.02)] rounded-full blur-[100px] pointer-events-none -z-0 -translate-x-1/2 translate-y-1/2"></div>
         </main>
      </div>
    </div>
  );
}
