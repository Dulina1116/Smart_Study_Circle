import React, { useState } from 'react'
import { UploadCloud, Archive, Download, TrendingUp, Search, List, Grid, MoreVertical, FileText, Video, Link as LinkIcon, FileCode, CheckSquare, Square, ChevronLeft, ChevronRight, Plus, Star, ArrowUpRight, X, CheckCircle, GraduationCap, Clock, PieChart, File, Book, Activity, Edit, Trash2 } from 'lucide-react'

// Dummy Data mapped from the mock
const libraryData = [
  { id: 1, name: "Advanced React Patterns.pdf", subtitle: "2.4 MB • 42 pages", type: "pdf", module: "CS204", downloads: "1,240", impact: 94, impactColor: "bg-emerald-500 text-emerald-500", date: "Oct 12, 2023", iconBg: "bg-red-50 text-red-500", Icon: FileText },
  { id: 2, name: "Week 4: Sorting Algorithms", subtitle: "Video • 18:42 mins", type: "video", module: "CS101", downloads: "856", impact: 72, impactColor: "bg-amber-500 text-amber-500", date: "Sep 28, 2023", iconBg: "bg-blue-50 text-blue-500", Icon: Video },
  { id: 3, name: "Interaction Design Principles", subtitle: "nngroup.com • External", type: "link", module: "UX400", downloads: "2,104", impact: 98, impactColor: "bg-emerald-500 text-emerald-500", date: "Nov 05, 2023", iconBg: "bg-amber-50 text-amber-500", Icon: LinkIcon },
  { id: 4, name: "Workshop Starter Kits.zip", subtitle: "118 MB • Source Code", type: "zip", module: "CS204", downloads: "432", impact: 45, impactColor: "bg-slate-400 text-slate-500", date: "Nov 18, 2023", iconBg: "bg-purple-50 text-purple-500", Icon: FileCode }
]

export default function LecturerResourceLibrary() {
  const [showModal, setShowModal] = useState(false)
  const [viewState, setViewState] = useState('list') // 'list' | 'uploaded'
  const [showToast, setShowToast] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [resources, setResources] = useState([])
  
  const totalResources = resources.length;
  const totalDownloads = resources.reduce((sum, res) => sum + (res.downloads || 0), 0);
  const formatDownloads = (num) => num >= 1000 ? (num / 1000).toFixed(1) + 'k' : num;
  const avgImpactScore = Math.min(99, 85 + (totalDownloads * 1.5)).toFixed(0);

  const [formData, setFormData] = useState({
    title: 'Week 5 Lecture Notes',
    module: 'Physics 101',
    type: 'PDF',
    tags: 'lecture, notes, physics',
    description: 'Core concepts for week 5'
  })

  const fetchResources = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('http://localhost:5000/api/lecturer-resources', {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setResources(Array.isArray(data) ? data : [])
      }
    } catch (err) {
      console.error(err)
    }
  }

  React.useEffect(() => {
    fetchResources()
  }, [])

  const handleUploadClick = () => {
    setEditingId(null)
    setFormData({
      title: 'Week 5 Lecture Notes',
      module: 'Physics 101',
      type: 'PDF',
      tags: 'lecture, notes, physics',
      description: 'Core concepts for week 5'
    })
    setSelectedFile(null)
    setShowModal(true)
  }

  const handleResourceClick = (resource) => {
    setSelectedFile({
      name: resource.title || resource.fileName,
      size: resource.size || 0,
      type: resource.type || 'PDF',
      module: resource.module || 'General',
      description: resource.description || 'No description provided.',
      createdAt: resource.createdAt,
      downloads: resource.downloads || 0
    })
    setViewState('uploaded')
  }

  const handleEditClick = (resource) => {
    setEditingId(resource._id)
    setFormData({
      title: resource.title || resource.fileName,
      module: resource.module || 'Physics 101',
      type: resource.type || 'PDF',
      tags: resource.tags || 'lecture, notes, physics',
      description: resource.description || 'Core concepts for week 5'
    })
    setSelectedFile(null)
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this resource?")) return;
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`http://localhost:5000/api/lecturer-resources/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) fetchResources()
    } catch(err) {
      console.error(err)
    }
  }
  
  const handleUploadSubmit = async () => {
    try {
      const token = localStorage.getItem('token');
      let url = 'http://localhost:5000/api/lecturer-resources';
      let method = 'POST';
      let body;

      if (editingId) {
        url = `http://localhost:5000/api/lecturer-resources/${editingId}`;
        method = 'PUT';
        body = JSON.stringify(formData);
      } else {
        if (!selectedFile) {
          alert("Please select a file to upload.");
          return;
        }
        body = new FormData();
        body.append('file', selectedFile);
        body.append('title', formData.title);
        body.append('module', formData.module);
        body.append('type', formData.type);
        body.append('tags', formData.tags);
        body.append('description', formData.description);
      }

      const headers = { Authorization: `Bearer ${token}` };
      if (editingId) headers['Content-Type'] = 'application/json';

      const res = await fetch(url, { method, headers, body });

      if (res.ok) {
        await fetchResources()
        setShowModal(false)
        setShowToast(true)
        setTimeout(() => setShowToast(false), 3000)
      } else {
        const errData = await res.json();
        alert(errData.message || "Failed to process resource");
      }
    } catch (err) {
      console.error(err);
      alert("Error processing resource");
    }
  }

  const getFileSize = (bytes) => {
    if (!bytes) return "4.2 MB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  }

  const getFileType = (name) => {
    if (!name) return "PDF";
    const parts = name.split('.');
    return parts.length > 1 ? parts.pop().toUpperCase() : "FILE";
  }

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

  return (
    <div className="w-full max-w-[1400px] mx-auto text-slate-800 pb-10 relative">
      
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 md:translate-x-0 md:left-auto md:right-8 bg-teal-600 text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-3 z-50 animate-fade-in">
          <CheckCircle className="w-5 h-5 text-teal-200" />
          <span className="text-sm font-bold tracking-wide">Resource is available to students<br/><span className="text-xs font-normal text-teal-100">Assigned to selected study circles</span></span>
        </div>
      )}

      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm font-medium mb-3">
        <span className="text-slate-500">Dashboard</span>
        <span className="text-slate-400">&gt;</span>
        <span className={`cursor-pointer transition-colors ${viewState === 'list' ? 'text-teal-600' : 'text-slate-500 hover:text-slate-700'}`} onClick={() => setViewState('list')}>Resource Library</span>
        {viewState === 'uploaded' && (
          <>
            <span className="text-slate-400">&gt;</span>
            <span className="text-teal-600">Details</span>
          </>
        )}
      </div>

      {viewState === 'list' && (
        <>
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8">
            <div className="max-w-xl">
              <h1 className="text-3xl font-extrabold text-slate-900 mb-2 tracking-tight">Resource Library</h1>
              <p className="text-sm text-slate-500 font-medium leading-relaxed">
                Central hub for managing instructional materials, reading lists, and tracking student engagement metrics across your modules.
              </p>
            </div>
            
            <button onClick={handleUploadClick} className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-xl text-sm font-bold transition-all shadow-sm shadow-teal-500/20 whitespace-nowrap mt-2 md:mt-0">
              <UploadCloud className="w-4 h-4" strokeWidth={2.5}/>
              Upload Resource
            </button>
          </div>

          {/* Top Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-2xl p-6 shadow-[0_2px_15px_rgba(0,0,0,0.03)] border border-slate-50 flex items-center gap-5">
              <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center shrink-0">
                <Archive className="w-6 h-6 text-teal-600" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Resources</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-slate-900 leading-none">{totalResources}</span>
                  <span className="text-xs font-bold text-emerald-500 bg-emerald-50 px-1.5 py-0.5 rounded-md">+5%</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-[0_2px_15px_rgba(0,0,0,0.03)] border border-slate-50 flex items-center gap-5">
              <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center shrink-0">
                <Download className="w-6 h-6 text-teal-600" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Downloads</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-slate-900 leading-none">{formatDownloads(totalDownloads)}</span>
                  <span className="text-xs font-bold text-emerald-500 bg-emerald-50 px-1.5 py-0.5 rounded-md">+12%</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-[0_2px_15px_rgba(0,0,0,0.03)] border border-slate-50 flex items-center gap-5">
              <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center shrink-0">
                <TrendingUp className="w-6 h-6 text-teal-600" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Avg. Impact Score</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-slate-900 leading-none">{avgImpactScore}%</span>
                  <span className="text-xs font-bold text-emerald-500 bg-emerald-50 px-1.5 py-0.5 rounded-md">+2.4%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Table Area */}
          <div className="bg-white rounded-[20px] shadow-[0_2px_15px_rgba(0,0,0,0.03)] border border-slate-50 mb-8 overflow-hidden">
            
            {/* Controls Toolbar */}
            <div className="p-4 border-b border-slate-100 flex flex-col lg:flex-row items-center justify-between gap-4 bg-white">
              <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
                {/* Search */}
                <div className="relative w-full sm:w-64">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Filter by name or keywords..."
                    className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 w-full transition-all text-slate-700"
                  />
                </div>

                {/* Selects */}
                <select className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 cursor-pointer w-full sm:w-auto outline-none appearance-none pr-8 relative">
                  <option>All Modules</option>
                  <option>CS204</option>
                  <option>CS101</option>
                </select>
                
                <select className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 cursor-pointer w-full sm:w-auto outline-none appearance-none pr-8">
                  <option>File Type</option>
                  <option>PDF</option>
                  <option>Video</option>
                </select>
              </div>

              <div className="flex items-center gap-3 w-full lg:w-auto justify-end">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest hidden sm:block">Display:</span>
                <div className="flex bg-slate-50 rounded-lg p-1 border border-slate-100">
                  <button className="p-1.5 bg-teal-50 rounded text-teal-600 shadow-sm">
                    <List className="w-[18px] h-[18px]" strokeWidth={2.5}/>
                  </button>
                  <button className="p-1.5 text-slate-400 hover:text-slate-600 transition-colors">
                    <Grid className="w-[18px] h-[18px]" strokeWidth={2.5}/>
                  </button>
                </div>
              </div>
            </div>

            {/* Table View */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[900px]">
                <thead>
                  <tr>
                    <th className="px-6 py-4 border-b border-slate-100 w-12 text-center text-slate-300">
                      <Square className="w-4 h-4 mx-auto" strokeWidth={2} />
                    </th>
                    <th className="px-6 py-4 border-b border-slate-100 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest w-[35%]">
                      Resource Name
                    </th>
                    <th className="px-6 py-4 border-b border-slate-100 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                      Module
                    </th>
                    <th className="px-6 py-4 border-b border-slate-100 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                      Downloads
                    </th>
                    <th className="px-6 py-4 border-b border-slate-100 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest w-[150px]">
                      Impact Score
                    </th>
                    <th className="px-6 py-4 border-b border-slate-100 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                      Date Added
                    </th>
                    <th className="px-6 py-4 border-b border-slate-100 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest text-center">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {resources.length > 0 ? resources.map((item, idx) => {
                    return (
                      <tr key={item._id} className="group hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-5 border-b border-slate-50 text-center">
                          <div className="flex justify-center">
                            <button className="text-slate-300 hover:text-slate-400 transition-colors">
                              <Square className="w-4 h-4" strokeWidth={2}/>
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-5 border-b border-slate-50">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 shrink-0 flex items-center justify-center rounded-xl bg-blue-50 text-blue-500">
                              <FileText className="w-5 h-5" strokeWidth={2.5}/>
                            </div>
                            <div>
                              <p onClick={() => handleResourceClick(item)} className="text-[13px] font-bold text-slate-900 group-hover:text-teal-700 transition-colors cursor-pointer mb-0.5 leading-tight">
                                {item.title || item.fileName}
                              </p>
                              <p className="text-[11px] font-medium text-slate-500">
                                {getFileSize(item.size)} • {item.type}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5 border-b border-slate-50">
                          <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2.5 py-1 rounded-full border border-slate-200 shadow-sm">
                            {item.module || "General"}
                          </span>
                        </td>
                        <td className="px-6 py-5 border-b border-slate-50">
                          <p className="text-[14px] font-extrabold text-slate-800">
                            {item.downloads || 0}
                          </p>
                        </td>
                        <td className="px-6 py-5 border-b border-slate-50">
                          <div className="flex items-center gap-3">
                            <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full rounded-full bg-emerald-500" style={{ width: '100%' }} />
                            </div>
                            <span className="text-[12px] font-bold text-emerald-500">
                              New
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-5 border-b border-slate-50">
                          <p className="text-[13px] font-medium text-slate-500">
                            {new Date(item.createdAt).toLocaleDateString()}
                          </p>
                        </td>
                        <td className="px-6 py-5 border-b border-slate-50 text-center">
                          <a href={`http://localhost:5000${item.filePath}`} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-colors inline-flex mx-1" title="Download">
                            <Download className="w-4 h-4" />
                          </a>
                          <button onClick={() => handleEditClick(item)} className="text-slate-400 hover:text-blue-600 p-1 rounded-full hover:bg-slate-100 transition-colors inline-flex mx-1" title="Edit">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(item._id)} className="text-slate-400 hover:text-red-500 p-1 rounded-full hover:bg-slate-100 transition-colors inline-flex mx-1" title="Delete">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    )
                  }) : (
                    <tr>
                      <td colSpan="7" className="text-center py-8 text-[13px] font-bold text-slate-400">No resources found. Upload one!</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-white rounded-b-[20px]">
              <span className="text-[12px] font-medium text-slate-500">
                Showing <strong className="text-slate-800">{totalResources > 0 ? 1 : 0}-{totalResources}</strong> of <strong className="text-slate-800">{totalResources}</strong> resources
              </span>
              <div className="flex items-center gap-1.5">
                <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors">
                  <ChevronLeft className="w-4 h-4" strokeWidth={2.5}/>
                </button>
                <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-teal-600 text-white font-bold text-[13px] shadow-sm shadow-teal-600/20">
                  1
                </button>
                <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-600 font-bold text-[13px] hover:bg-slate-50 transition-colors">
                  2
                </button>
                <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-600 font-bold text-[13px] hover:bg-slate-50 transition-colors">
                  3
                </button>
                <span className="w-8 h-8 flex items-center justify-center text-slate-400 font-bold text-[13px]">...</span>
                <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-600 font-bold text-[13px] hover:bg-slate-50 transition-colors">
                  12
                </button>
                <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors">
                  <ChevronRight className="w-4 h-4" strokeWidth={2.5}/>
                </button>
              </div>
            </div>
          </div>

          {/* High Performance Suggestions */}
          <div className="mb-4">
            <h2 className="text-[17px] font-bold text-slate-900 leading-tight">High Performance Suggestions</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-teal-50/60 rounded-[20px] p-6 border border-teal-100/50 hover:border-teal-200 transition-colors relative overflow-hidden group cursor-pointer">
              <div className="absolute -bottom-6 -right-6 text-teal-100/40 transition-transform group-hover:scale-110 group-hover:-rotate-6">
                <TrendingUp className="w-32 h-32" />
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-1.5 mb-3">
                  <TrendingUp className="w-3.5 h-3.5 text-teal-600" strokeWidth={3}/>
                  <span className="text-[10px] font-extrabold text-teal-600 uppercase tracking-widest">Trending</span>
                </div>
                <h3 className="text-[15px] font-bold text-slate-900 mb-1">Python Data Analytics</h3>
                <p className="text-[12px] font-medium text-slate-500 mb-5">High engagement this week (+40%)</p>
                <button className="text-[12px] font-bold text-teal-600 flex items-center gap-1 hover:text-teal-800 transition-colors">
                  View analytics <ArrowUpRight className="w-3 h-3" strokeWidth={3}/>
                </button>
              </div>
            </div>

            <div className="bg-emerald-50/60 rounded-[20px] p-6 border border-emerald-100/50 hover:border-emerald-200 transition-colors relative overflow-hidden group cursor-pointer">
              <div className="absolute -bottom-4 -right-4 text-emerald-100/50 transition-transform group-hover:scale-110">
                <Star className="w-28 h-28" />
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-1.5 mb-3">
                  <Star className="w-3.5 h-3.5 text-emerald-500 fill-emerald-500" strokeWidth={3}/>
                  <span className="text-[10px] font-extrabold text-emerald-600 uppercase tracking-widest">Top Rated</span>
                </div>
                <h3 className="text-[15px] font-bold text-slate-900 mb-1">UI Research Papers</h3>
                <p className="text-[12px] font-medium text-slate-500 mb-5">4.9/5 stars average student rating</p>
                <button className="text-[12px] font-bold text-emerald-600 flex items-center gap-1 hover:text-emerald-800 transition-colors">
                  Read feedback <ArrowUpRight className="w-3 h-3" strokeWidth={3}/>
                </button>
              </div>
            </div>

            <div className="rounded-[20px] p-6 border-2 border-dashed border-slate-200 bg-slate-50/50 flex flex-col items-center justify-center hover:bg-slate-50 transition-colors hover:border-teal-200 cursor-pointer group min-h-[160px]">
              <div className="w-10 h-10 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center mb-3 group-hover:border-teal-200 group-hover:bg-teal-50 transition-colors">
                <Plus className="w-5 h-5 text-slate-400 group-hover:text-teal-600 transition-colors" strokeWidth={2.5}/>
              </div>
              <span className="text-[13px] font-bold text-slate-600 group-hover:text-slate-900">Create Collection</span>
            </div>
          </div>
        </>
      )}

      {viewState === 'uploaded' && (
        <>
          {/* Header 2nd UI */}
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8">
            <div className="max-w-xl">
              <h1 className="text-3xl font-extrabold text-slate-900 mb-2 tracking-tight">Study Circle Resources</h1>
              <p className="text-sm text-slate-500 font-medium leading-relaxed">
                Manage your Lecturer Dashboard materials, reading lists, and verify resources for your assigned study circles.
              </p>
            </div>
            
            <div className="flex bg-slate-50 rounded-lg p-1 border border-slate-100 mt-4 md:mt-0">
              <button className="flex items-center gap-2 bg-teal-50 hover:bg-teal-100 text-teal-600 px-5 py-2.5 rounded-[12px] text-[13px] font-bold transition-colors">
                <List className="w-4 h-4"/> Filter
              </button>
              <button onClick={handleUploadClick} className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-[12px] text-[13px] font-bold transition-colors ml-2 shadow-sm">
                <UploadCloud className="w-4 h-4"/> Upload Resource
              </button>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-6 mb-8">
             {/* Left Column -> Main Card */}
             <div className="flex-1 bg-white rounded-2xl p-6 shadow-sm border border-slate-100 relative">
               <span className="absolute top-6 right-6 bg-teal-50 text-teal-600 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full">
                 ● Recently Uploaded
               </span>
               <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600 mb-6">
                 <FileText className="w-6 h-6" />
               </div>
               <h2 className="text-2xl font-bold text-slate-900 mb-3">{selectedFile ? selectedFile.name : "Week 5 Lecture Notes"}</h2>
               <p className="text-sm text-slate-500 leading-relaxed font-medium mb-6 max-w-lg">
                 {selectedFile && selectedFile.description ? selectedFile.description : "In-depth exploration of advanced scholastic theories and methodology for the second semester curriculum."}
               </p>
               <div className="flex flex-wrap items-center gap-2 mb-10">
                 <span className="bg-slate-50 border border-slate-100 text-slate-600 text-[10px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5"><GraduationCap className="w-3 h-3 text-teal-500"/> Module: {selectedFile ? selectedFile.module : "CS101"}</span>
                 <span className="bg-slate-50 border border-slate-100 text-slate-600 text-[10px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5"><File className="w-3 h-3 text-teal-500"/> {selectedFile ? getFileType(selectedFile.name) : "PDF"} ({selectedFile ? getFileSize(selectedFile.size) : "4.2 MB"})</span>
                 <span className="bg-slate-50 border border-slate-100 text-slate-600 text-[10px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5"><Clock className="w-3 h-3 text-teal-500"/> {selectedFile && selectedFile.createdAt ? new Date(selectedFile.createdAt).toLocaleDateString() : "Uploaded Today"}</span>
                 <span className="bg-teal-50 text-teal-700 text-[10px] font-bold px-3 py-1.5 rounded-full">Visible to Students</span>
                 <span className="bg-emerald-50 text-emerald-600 text-[10px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1"><CheckCircle className="w-3 h-3"/> Verified</span>
               </div>
               <div className="flex items-center justify-between border-t border-slate-100 pt-5 mt-auto">
                 <div className="flex gap-2">
                   <button className="text-slate-500 hover:bg-slate-50 px-4 py-2 rounded-lg text-sm font-bold transition-colors">View</button>
                   <button className="text-slate-500 hover:bg-slate-50 px-4 py-2 rounded-lg text-sm font-bold transition-colors">Edit</button>
                   <button className="text-red-500 hover:bg-red-50 px-4 py-2 rounded-lg text-sm font-bold transition-colors">Delete</button>
                 </div>
                 <button className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2.5 rounded-[10px] font-bold text-sm shadow-sm transition-colors">Assign to Circle</button>
               </div>
             </div>

             {/* Right Column -> Health Card replacement */}
             <div className="w-full lg:w-80 bg-teal-600 rounded-2xl p-6 shadow-sm text-white flex flex-col items-start justify-center relative overflow-hidden">
               <div className="relative z-10 w-full">
                 <h3 className="text-lg font-bold mb-1">Module Coverage</h3>
                 <p className="text-xs text-teal-100 mb-6 font-medium">Resources assigned to active study circles</p>
                 <div className="flex items-baseline gap-1 mb-4">
                   <span className="text-5xl font-extrabold tracking-tight">85</span>
                   <span className="text-xl font-medium text-teal-100">%</span>
                 </div>
                 <div className="w-full h-1 bg-teal-800/50 rounded-full overflow-hidden mb-12">
                   <div className="h-full bg-white w-[85%] rounded-full"></div>
                 </div>
                 <div className="flex items-center justify-between w-full border-t border-teal-500 pt-4">
                   <p className="text-xs font-semibold text-teal-50">12 Verified Resources</p>
                   <ArrowUpRight className="w-4 h-4 text-teal-100"/>
                 </div>
               </div>
             </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
            <div className="bg-slate-50 rounded-[20px] p-5 shadow-sm border border-slate-100 hover:shadow-md transition-shadow cursor-pointer">
              <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-600 flex items-center justify-center mb-4"><Book className="w-4 h-4"/></div>
              <h4 className="text-[15px] font-bold text-slate-900 mb-2">Math Quiz 1</h4>
              <p className="text-[11px] text-slate-500 font-medium mb-6 line-clamp-2">Differential calculus principles and application-based problem sets for...</p>
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-bold text-slate-400 flex items-center gap-1"><Download className="w-3 h-3"/> 142</p>
                <span className="text-[9px] font-extrabold bg-slate-200 text-slate-500 px-2 py-0.5 rounded shadow-sm">DOCX</span>
              </div>
            </div>
            <div className="bg-slate-50 rounded-[20px] p-5 shadow-sm border border-slate-100 hover:shadow-md transition-shadow cursor-pointer">
              <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-600 flex items-center justify-center mb-4"><Activity className="w-4 h-4"/></div>
              <h4 className="text-[15px] font-bold text-slate-900 mb-2">Bio Lab Report</h4>
              <p className="text-[11px] text-slate-500 font-medium mb-6 line-clamp-2">Cellular respiration findings from the Q3 experimental cohort. Peer-...</p>
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-bold text-slate-400 flex items-center gap-1"><Download className="w-3 h-3"/> 89</p>
                <span className="text-[9px] font-extrabold bg-slate-200 text-slate-500 px-2 py-0.5 rounded shadow-sm">PDF</span>
              </div>
            </div>
            <div className="bg-slate-50 rounded-[20px] p-5 shadow-sm border border-slate-100 hover:shadow-md transition-shadow cursor-pointer">
              <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-600 flex items-center justify-center mb-4"><FileText className="w-4 h-4"/></div>
              <h4 className="text-[15px] font-bold text-slate-900 mb-2">Hist 202 Thesis</h4>
              <p className="text-[11px] text-slate-500 font-medium mb-6 line-clamp-2">Modern European social movements during the early 20th century. Archiv...</p>
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-bold text-slate-400 flex items-center gap-1"><Download className="w-3 h-3"/> 56</p>
                <span className="text-[9px] font-extrabold bg-slate-200 text-slate-500 px-2 py-0.5 rounded shadow-sm">DOCX</span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-[2px] p-4">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-xl overflow-hidden animate-scale-in">
            <div className="p-8">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-2xl font-bold text-[#0F3F6E]">{editingId ? 'Edit Resource' : 'Upload New Resource'}</h3>
                <button onClick={() => setShowModal(false)} className="text-slate-400 hover:bg-slate-100 hover:text-slate-600 p-2 rounded-full transition-colors">
                  <X className="w-5 h-5"/>
                </button>
              </div>
              <p className="text-[13px] text-slate-500 font-medium mb-8">Add academic material to your personal archive.</p>

              <div className="grid grid-cols-2 gap-x-5 gap-y-6 mb-6">
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-500 tracking-widest uppercase mb-2">Title</label>
                  <input type="text" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full bg-slate-100 border-none rounded-xl px-4 py-3 text-[13px] font-semibold text-slate-700 focus:ring-2 focus:ring-blue-500/20 outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-500 tracking-widest uppercase mb-2">Module</label>
                  <input type="text" value={formData.module} onChange={(e) => setFormData({...formData, module: e.target.value})} className="w-full bg-slate-100 border-none rounded-xl px-4 py-3 text-[13px] font-semibold text-slate-700 focus:ring-2 focus:ring-blue-500/20 outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-500 tracking-widest uppercase mb-2">Type</label>
                  <select value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})} className="w-full bg-slate-100 border-none rounded-xl px-4 py-3 text-[13px] font-semibold text-slate-700 focus:ring-2 focus:ring-blue-500/20 outline-none appearance-none">
                    <option>PDF</option>
                    <option>DOCX</option>
                    <option>MP4</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-500 tracking-widest uppercase mb-2">Tags</label>
                  <input type="text" value={formData.tags} onChange={(e) => setFormData({...formData, tags: e.target.value})} className="w-full bg-slate-100 border-none rounded-xl px-4 py-3 text-[13px] font-semibold text-slate-700 focus:ring-2 focus:ring-blue-500/20 outline-none" />
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-[10px] font-extrabold text-slate-500 tracking-widest uppercase mb-2">Description</label>
                <textarea rows="2" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full bg-slate-100 border-none rounded-xl px-4 py-3 text-[13px] font-medium text-slate-700 focus:ring-2 focus:ring-blue-500/20 outline-none resize-none"></textarea>
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-slate-500 tracking-widest uppercase mb-2">File Attachment</label>
                <label className="border-2 border-dashed border-slate-200 bg-slate-50/50 rounded-2xl p-8 flex flex-col items-center justify-center gap-2 hover:bg-slate-50 transition-colors cursor-pointer text-center block w-full relative">
                  <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={handleFileChange} />
                  
                  {selectedFile ? (
                    <div className="bg-[#E6EFFF] text-teal-600 px-4 py-2 rounded-lg inline-flex items-center gap-2 font-bold text-[13px] shadow-sm mb-1">
                      <FileText className="w-4 h-4 shrink-0"/> <span className="truncate max-w-[200px]">{selectedFile.name}</span> <CheckCircle className="w-3.5 h-3.5 ml-1 text-teal-600 shrink-0" strokeWidth={3}/>
                    </div>
                  ) : (
                    <div className="w-12 h-12 bg-white border border-slate-200 shadow-sm rounded-full flex items-center justify-center mb-1">
                      <UploadCloud className="w-5 h-5 text-slate-400" strokeWidth={2.5} />
                    </div>
                  )}

                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    {selectedFile ? 'Click or drag to change file' : 'Click to browse or drag and drop'}
                  </span>
                </label>
              </div>
            </div>

            <div className="bg-slate-50 p-6 flex items-center justify-end gap-3 border-t border-slate-100">
              <button onClick={() => setShowModal(false)} className="px-6 py-2.5 text-[13px] font-bold text-slate-600 hover:text-slate-900 transition-colors">Cancel</button>
              <button onClick={handleUploadSubmit} className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-2.5 rounded-xl text-[13px] font-bold shadow-sm transition-colors">{editingId ? 'Save Changes' : 'Upload Resource'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
