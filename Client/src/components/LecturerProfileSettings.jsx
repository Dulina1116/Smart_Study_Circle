import React, { useState } from 'react'
import { Camera, User, Contact, MapPin, Clock, Save, Loader2 } from 'lucide-react'

const API_ORIGIN = import.meta.env.VITE_API_ORIGIN || `${window.location.protocol}//${window.location.hostname}:5000`

const resolveImageUrl = (value) => {
  if (!value || typeof value !== 'string') return ''
  if (value.startsWith('http://') || value.startsWith('https://') || value.startsWith('data:') || value.startsWith('blob:')) return value
  if (value.startsWith('/')) return `${API_ORIGIN}${value}`
  if (value.startsWith('uploads/')) return `${API_ORIGIN}/${value}`
  if (value.startsWith('profile-')) return `${API_ORIGIN}/uploads/${value}`
  return value
}

export default function LecturerProfileSettings({ user }) {
  const [formData, setFormData] = useState({
    fullName: user?.fullName || "Dr. Aris Thorne",
    email: user?.email || "a.thorne@university.edu",
    department: user?.department || "Computer Science",
    designation: user?.designation || "Associate Professor",
    bio: user?.bio || "Research focus on AI and machine learning. 15 years of academic experience with over 40 published papers in international journals.",
    officeLocation: user?.officeLocation || "Building 4, Room 202",
    officeHours: user?.officeHours || "Mon-Wed, 2 PM - 4 PM"
  })

  const baseUrl = ''
  const token = localStorage.getItem('token')

  const [isLoading, setIsLoading] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewImage, setPreviewImage] = useState(resolveImageUrl(user?.profilePicture || user?.avatar || ''))
  const [isRemoved, setIsRemoved] = useState(false)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handlePhotoSelect = (e) => {
    const file = e.target.files[0]
    if (!file) return

    setSelectedFile(file)
    setIsRemoved(false)

    // Generate local preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreviewImage(reader.result)
    }
    reader.readAsDataURL(file)
  }

  const handlePhotoRemove = () => {
    setSelectedFile(null)
    setPreviewImage(null)
    setIsRemoved(true)
  }

  const handleSave = async () => {
    try {
      setIsLoading(true)
      const cleanToken = (token || '').replace(/[\r\n"]/g, '')

      // 1. Handle Photo Upload / Deletion first
      if (selectedFile) {
        const uploadData = new FormData()
        uploadData.append('image', selectedFile)
        const uploadRes = await fetch(`${baseUrl}/api/users/profile/photo`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${cleanToken}` },
          body: uploadData
        })
        if (!uploadRes.ok) {
          const uploadDataErr = await uploadRes.json().catch(() => ({}))
          throw new Error(uploadDataErr.message || 'Error uploading profile photo')
        }
      } else if (isRemoved && user?.profilePicture) {
        const removeRes = await fetch(`${baseUrl}/api/users/profile/photo`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${cleanToken}` }
        })
        if (!removeRes.ok) {
          const removeErr = await removeRes.json().catch(() => ({}))
          throw new Error(removeErr.message || 'Error removing profile photo')
        }
      }

      // 2. Handle Text Fields Update
      const res = await fetch(`${baseUrl}/api/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${cleanToken}`
        },
        body: JSON.stringify(formData)
      })

      const data = await res.json()
      if (res.ok) {
        localStorage.setItem('user', JSON.stringify(data))
        alert('Profile saved successfully!')
        window.location.reload() // Reload app to update dashboard picture & name globally
      } else {
        alert(data.message || 'Error saving profile')
      }
    } catch (err) {
      alert('Network error occurred while saving')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-[1200px] mx-auto text-slate-800 pb-10">
      <div className="mb-8 pl-1">
        <h2 className="text-[22px] font-extrabold text-slate-900 mb-1">Profile Settings</h2>
        <p className="text-[13px] text-slate-500 font-medium tracking-wide">Manage your academic identity and contact preferences.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Left Column - Photo Card */}
        <div className="w-full lg:w-[320px] bg-white rounded-[24px] p-8 shadow-[0_2px_15px_rgba(0,0,0,0.03)] border border-slate-50 flex flex-col items-center">

          <div className="relative mb-5 group">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-md bg-slate-100 flex items-center justify-center">
              {previewImage ? (
                <img src={previewImage} alt="Profile Preview" className="w-full h-full object-cover" />
              ) : (
                <User className="w-12 h-12 text-slate-300" />
              )}
            </div>

            <label className="absolute bottom-1 right-1 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center border border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer">
              <Camera className="w-[14px] h-[14px] text-slate-600" strokeWidth={2.5} />
              <input type="file" className="hidden" accept="image/*" onChange={handlePhotoSelect} />
            </label>
          </div>

          <h3 className="text-[17px] font-bold text-slate-900 leading-tight mb-1">{formData.fullName}</h3>
          <p className="text-[13px] font-medium text-slate-500 mb-8">{formData.designation}</p>

          <label className="w-full cursor-pointer flex justify-center items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white py-2.5 rounded-[12px] text-[13px] font-bold transition-all mb-3 shadow-sm shadow-teal-500/20">
            Upload New Photo
            <input type="file" className="hidden" accept="image/*" onChange={handlePhotoSelect} />
          </label>
          <button onClick={handlePhotoRemove} disabled={!previewImage} className="w-full bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 py-2.5 rounded-[12px] text-[13px] font-bold transition-colors disabled:opacity-50">
            Remove
          </button>
        </div>

        {/* Right Column - Forms */}
        <div className="flex-1 w-full space-y-6">

          {/* Academic Profile */}
          <div className="bg-white rounded-[24px] p-8 pb-10 shadow-[0_2px_15px_rgba(0,0,0,0.03)] border border-slate-50">
            <div className="flex items-center gap-2.5 mb-7">
              <User className="w-[18px] h-[18px] text-teal-600 stroke-[3]" />
              <h3 className="text-[15px] font-bold text-slate-900">Academic Profile</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6 mb-6">
              <div>
                <label className="block text-[10px] font-extrabold text-slate-400 tracking-[0.08em] uppercase mb-2">Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full border border-slate-200 rounded-[10px] px-4 py-2.5 text-[13px] font-semibold text-slate-800 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all shadow-sm"
                />
              </div>
              <div>
                <label className="block text-[10px] font-extrabold text-slate-400 tracking-[0.08em] uppercase mb-2">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full border border-slate-200 rounded-[10px] px-4 py-2.5 text-[13px] font-semibold text-slate-800 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all shadow-sm"
                />
              </div>
              <div>
                <label className="block text-[10px] font-extrabold text-slate-400 tracking-[0.08em] uppercase mb-2">Department</label>
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  placeholder="Enter department"
                  className="w-full border border-slate-200 rounded-[10px] px-4 py-2.5 text-[13px] font-semibold text-slate-800 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all bg-white shadow-sm"
                />
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-slate-400 tracking-[0.08em] uppercase mb-2">Designation</label>
                <input
                  type="text"
                  name="designation"
                  value={formData.designation}
                  onChange={handleChange}
                  className="w-full border border-slate-200 rounded-[10px] px-4 py-2.5 text-[13px] font-semibold text-slate-800 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all shadow-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-extrabold text-slate-400 tracking-[0.08em] uppercase mb-2">Academic Bio</label>
              <textarea
                rows="3"
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                className="w-full border border-slate-200 rounded-[10px] px-4 py-3 text-[13px] font-medium text-slate-700 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all resize-none shadow-sm leading-relaxed"
              ></textarea>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-[24px] p-8 pb-10 shadow-[0_2px_15px_rgba(0,0,0,0.03)] border border-slate-50">
            <div className="flex items-center gap-2.5 mb-7">
              <Contact className="w-[18px] h-[18px] text-teal-600 stroke-[3]" />
              <h3 className="text-[15px] font-bold text-slate-900">Contact Information</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
              <div>
                <label className="block text-[10px] font-extrabold text-slate-400 tracking-[0.08em] uppercase mb-2">Office Location</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                    <MapPin className="w-[15px] h-[15px] text-slate-400 stroke-[2.5]" />
                  </div>
                  <input
                    type="text"
                    name="officeLocation"
                    value={formData.officeLocation}
                    onChange={handleChange}
                    className="w-full border border-slate-200 rounded-[10px] pl-10 pr-4 py-2.5 text-[13px] font-semibold text-slate-800 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all shadow-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-extrabold text-slate-400 tracking-[0.08em] uppercase mb-2">Office Hours</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                    <Clock className="w-[15px] h-[15px] text-slate-400 stroke-[2.5]" />
                  </div>
                  <input
                    type="text"
                    name="officeHours"
                    value={formData.officeHours}
                    onChange={handleChange}
                    className="w-full border border-slate-200 rounded-[10px] pl-10 pr-4 py-2.5 text-[13px] font-semibold text-slate-800 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all shadow-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end pt-2">
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-6 py-2.5 rounded-[12px] text-[13px] font-bold transition-all shadow-sm shadow-teal-500/25 disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="w-[15px] h-[15px] animate-spin" /> : <Save className="w-[15px] h-[15px] stroke-[2.5]" />}
              Save Changes
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}

