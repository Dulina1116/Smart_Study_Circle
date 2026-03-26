import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Register() {
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'student',
  })

  const [errors, setErrors]         = useState({})
  const [showPw, setShowPw]         = useState(false)
  const [loading, setLoading]       = useState(false)
  const [pwStrength, setPwStrength] = useState(null)   // null = no bar yet

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    if (e.target.name === 'password') checkStrength(e.target.value)
  }

  // ── FIX: score=0 now maps to a real "Too Short" level; bar only shown when pw non-empty ──
  const checkStrength = (pw) => {
    if (!pw) { setPwStrength(null); return }

    let score = 0
    if (pw.length >= 8)          score++
    if (pw.length >= 12)         score++
    if (/[A-Z]/.test(pw))        score++
    if (/[0-9]/.test(pw))        score++
    if (/[^A-Za-z0-9]/.test(pw)) score++

    const levels = [
      { width: '10%', color: '#ef4444', label: 'Too Short'  },  // score = 0
      { width: '20%', color: '#ef4444', label: 'Very Weak'  },  // score = 1
      { width: '40%', color: '#f97316', label: 'Weak'       },  // score = 2
      { width: '60%', color: '#eab308', label: 'Fair'       },  // score = 3
      { width: '80%', color: '#22c55e', label: 'Strong'     },  // score = 4
      { width: '100%',color: '#00b8a9', label: 'Very Strong'},  // score = 5
    ]

    setPwStrength(levels[Math.min(score, 5)])
  }

  const validate = () => {
    const e = {}
    if (!formData.fullName.trim())
      e.fullName = '⚠ Full name is required.'
    else if (formData.fullName.trim().length < 3)
      e.fullName = '⚠ At least 3 characters required.'

    if (!formData.email.trim())
      e.email = '⚠ Email is required.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      e.email = '⚠ Enter a valid email address.'

    if (!formData.password)
      e.password = '⚠ Password is required.'
    else if (formData.password.length < 8)
      e.password = '⚠ Minimum 8 characters required.'

    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)

      localStorage.setItem('tempEmail', formData.email)
      navigate('/verify')
    } catch (err) {
      setErrors({ api: err.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-screen overflow-hidden font-body">

      {/* ── LEFT PANEL ── */}
      <div className="w-[42%] min-w-[320px] flex flex-col justify-between px-10 py-9"
        style={{ background: 'linear-gradient(155deg, #00b8a9, #007a6e)' }}>

        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-lg bg-white"
            style={{ color: '#00b8a9' }}>✦</div>
          <span className="font-bold text-white text-sm">Smart Study Circle</span>
        </div>

        {/* Hero */}
        <div className="flex flex-col gap-4">
          <h1 className="text-4xl font-extrabold text-white leading-tight font-head">
            Unlock Your<br/>
            <span className="text-white/80">Academic Potential</span>
          </h1>
          <p className="text-sm leading-relaxed text-white/70">
            Join over 50,000 students from top universities globally.
            Collaborate on projects, share insights, and excel together.
          </p>

          <div className="flex flex-col gap-3 mt-2">
            {[
              { icon: '👥', title: 'Study Circles',
                desc: 'Join real-time peer groups for your modules.' },
              { icon: '📊', title: 'AI Insights',
                desc: 'Track your learning progress with smart analytics.' },
            ].map((f) => (
              <div key={f.title}
                className="flex items-center gap-4 p-4 rounded-2xl border border-white/20
                  bg-white/10 backdrop-blur-sm transition-all hover:bg-white/20">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center
                  text-xl flex-shrink-0 bg-white/20">
                  {f.icon}
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">{f.title}</h4>
                  <p className="text-xs mt-0.5 text-white/70">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Trusted */}
        <div className="flex items-center gap-3 pt-4 border-t border-white/20">
          <div className="flex">
            {[11, 22, 33].map((n) => (
              <img key={n} src={`https://i.pravatar.cc/36?img=${n}`} alt="s"
                className="w-8 h-8 rounded-full border-2 border-white -ml-2 first:ml-0"/>
            ))}
          </div>
          <p className="text-xs text-white/70">
            Trusted by students at{' '}
            <strong className="text-white">Stanford, MIT &amp; Oxford</strong>
          </p>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="flex-1 overflow-y-auto flex flex-col px-14 py-9 gap-6 bg-[#f8f9fa]">

        {/* Steps */}
        <div className="flex items-center self-end">
          {['ACCOUNT', 'VERIFICATION', 'INTERESTS'].map((s, i) => (
            <div key={s} className="flex items-center">
              <div className="flex flex-col items-center gap-1">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center
                  font-bold text-sm border-2 transition-all ${
                  i === 0
                    ? 'bg-[#00b8a9] border-[#00b8a9] text-white shadow-[0_0_0_4px_rgba(0,184,169,0.2)]'
                    : 'bg-white border-gray-200 text-gray-400'
                }`}>{i + 1}</div>
                <span className={`text-[0.58rem] font-bold tracking-widest ${
                  i === 0 ? 'text-[#00b8a9]' : 'text-gray-400'
                }`}>{s}</span>
              </div>
              {i < 2 && <div className="w-16 h-0.5 mx-2 mb-5 bg-gray-200"/>}
            </div>
          ))}
        </div>

        {/* Form */}
        <div className="max-w-[460px] w-full">
          <div className="mb-7">
            <h2 className="text-3xl font-extrabold text-[#1a1a2e] mb-1 font-head">
              Create Account
            </h2>
            <p className="text-sm text-gray-500">
              Start your journey to smarter learning today.
            </p>
          </div>

          <form onSubmit={handleSubmit} noValidate>

            {/* Full Name */}
            <div className="mb-5">
              <label className="block text-sm font-semibold text-[#1a1a2e] mb-2">
                Full Name
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">👤</span>
                <input type="text" name="fullName" value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  className={`w-full pl-10 pr-4 py-3 rounded-2xl text-sm text-[#1a1a2e]
                    outline-none border bg-white transition-all
                    focus:border-[#00b8a9] focus:shadow-[0_0_0_3px_rgba(0,184,169,0.15)] ${
                    errors.fullName ? 'border-red-400' : 'border-gray-200'
                  }`}/>
              </div>
              {errors.fullName &&
                <p className="text-red-500 text-xs mt-1 font-medium">{errors.fullName}</p>}
            </div>

            {/* Email */}
            <div className="mb-5">
              <label className="block text-sm font-semibold text-[#1a1a2e] mb-2">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2
                  font-bold text-gray-400 text-base">@</span>
                <input type="email" name="email" value={formData.email}
                  onChange={handleChange}
                  placeholder="name@example.com"
                  className={`w-full pl-10 pr-4 py-3 rounded-2xl text-sm text-[#1a1a2e]
                    outline-none border bg-white transition-all
                    focus:border-[#00b8a9] focus:shadow-[0_0_0_3px_rgba(0,184,169,0.15)] ${
                    errors.email ? 'border-red-400' : 'border-gray-200'
                  }`}/>
              </div>
              {errors.email &&
                <p className="text-red-500 text-xs mt-1 font-medium">{errors.email}</p>}
            </div>

            {/* Password */}
            <div className="mb-5">
              <label className="block text-sm font-semibold text-[#1a1a2e] mb-2">
                Create Password
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔒</span>
                <input type={showPw ? 'text' : 'password'} name="password"
                  value={formData.password} onChange={handleChange}
                  placeholder="Min. 8 characters"
                  className={`w-full pl-10 pr-10 py-3 rounded-2xl text-sm text-[#1a1a2e]
                    outline-none border bg-white transition-all
                    focus:border-[#00b8a9] focus:shadow-[0_0_0_3px_rgba(0,184,169,0.15)] ${
                    errors.password ? 'border-red-400' : 'border-gray-200'
                  }`}/>
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2
                    text-gray-400 hover:text-[#00b8a9] transition-colors">
                  {showPw ? (
                    // Eye-off icon
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18"
                      viewBox="0 0 24 24" fill="none" stroke="currentColor"
                      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8
                        a18.45 18.45 0 0 1 5.06-5.94"/>
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8
                        a18.5 18.5 0 0 1-2.16 3.19"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    // Eye icon
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18"
                      viewBox="0 0 24 24" fill="none" stroke="currentColor"
                      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>

              {/* ── Strength bar: only renders when pwStrength is not null ── */}
              {pwStrength && (
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex-1 h-1.5 rounded-full bg-gray-200 overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-300"
                      style={{ width: pwStrength.width, background: pwStrength.color }}/>
                  </div>
                  <span className="text-[0.7rem] font-semibold min-w-[64px] text-right"
                    style={{ color: pwStrength.color }}>{pwStrength.label}</span>
                </div>
              )}

              {errors.password &&
                <p className="text-red-500 text-xs mt-1 font-medium">{errors.password}</p>}
            </div>

            {/* Role */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-[#1a1a2e] mb-2">
                Join as a
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'student',  icon: '🎓', label: 'Student'  },
                  { value: 'lecturer', icon: '🧑‍🏫', label: 'Lecturer' },
                ].map((r) => (
                  <button key={r.value} type="button"
                    onClick={() => setFormData({ ...formData, role: r.value })}
                    className={`flex flex-col items-center gap-2 py-4 rounded-2xl
                      border-2 transition-all ${
                      formData.role === r.value
                        ? 'border-[#00b8a9] bg-[#e0f7f5] shadow-[0_0_0_3px_rgba(0,184,169,0.15)]'
                        : 'border-gray-200 bg-white hover:border-[#00b8a9]/50'
                    }`}>
                    <span className="text-2xl">{r.icon}</span>
                    <strong className={`text-sm font-semibold ${
                      formData.role === r.value ? 'text-[#00b8a9]' : 'text-[#1a1a2e]'
                    }`}>{r.label}</strong>
                  </button>
                ))}
              </div>
            </div>

            {errors.api && (
              <p className="text-red-500 text-sm text-center mb-3">{errors.api}</p>
            )}

            {/* Submit */}
            <button type="submit" disabled={loading}
              className="w-full py-4 rounded-2xl font-bold text-sm text-white
                flex items-center justify-center gap-2 transition-all duration-200
                hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-70
                disabled:cursor-not-allowed"
              style={{ background: 'linear-gradient(135deg, #00b8a9, #007a6e)' }}>
              {loading ? '⏳ Creating Account...' : <>Create Account <span>→</span></>}
            </button>

          </form>

          <p className="text-center text-[0.7rem] tracking-widest mt-5
            leading-loose text-gray-400">
            ALREADY HAVE AN ACCOUNT?<br/>
            <a href="/login"
              className="text-[#00b8a9] font-bold text-sm hover:underline">
              Log in to your account
            </a>
          </p>
          <p className="text-center text-[0.68rem] mt-3 leading-relaxed text-gray-400">
            By signing up, you agree to our{' '}
            <a href="#" className="text-[#00b8a9] hover:underline">Terms of Service</a>
            {' '}and{' '}
            <a href="#" className="text-[#00b8a9] hover:underline">Privacy Policy</a>.
          </p>
        </div>
      </div>
    </div>
  )
}