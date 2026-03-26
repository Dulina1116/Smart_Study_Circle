import React, { useEffect, useMemo, useState } from 'react'
import { Copy, Edit, Eye, MessageCircle, Plus, Shield, Trash2, UserPlus, Users, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { clearAuth } from '../utils/authUtils'

const API_ORIGIN = import.meta.env.VITE_API_ORIGIN || `${window.location.protocol}//${window.location.hostname}:5000`
const API_BASE = `${API_ORIGIN}/api/circles`

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const requestWithTimeout = async (url, options = {}, timeoutMs = 20000, retries = 1) => {
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeoutMs)
    try {
      const res = await fetch(url, { ...options, signal: controller.signal })
      clearTimeout(timer)
      return res
    } catch (err) {
      clearTimeout(timer)
      const canRetry = err?.name === 'AbortError' || String(err?.message || '').includes('Failed to fetch')
      if (!canRetry || attempt === retries) {
        throw err
      }
      await wait(400 * (attempt + 1))
    }
  }
}

const createHeaders = () => {
  const token = (localStorage.getItem('token') || '').replace(/[\r\n"]/g, '')
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }
}

const parseResponse = async (res) => {
  const text = await res.text()
  let data = {}
  try {
    data = text ? JSON.parse(text) : {}
  } catch {
    data = { message: 'Unexpected server response.' }
  }

  if (res.status === 401) {
    console.error('Unauthorized access - clearing auth.')
    clearAuth()
    window.location.href = '/login'
    return data
  }

  if (!res.ok) {
    throw new Error(data.message || 'Request failed.')
  }

  return data
}

const initialCreateForm = {
  subject: '',
  moduleCode: '',
  semester: '',
  year: '1',
  visibility: 'public',
  description: '',
}

export default function StudentCirclesManager({ user, myCircles = [], discoverCircles = [], refreshCircles, isLoadingExternal = false }) {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [detailCircle, setDetailCircle] = useState(null)
  const [isDetailLoading, setIsDetailLoading] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editCircleId, setEditCircleId] = useState(null)
  const [editForm, setEditForm] = useState(initialCreateForm)
  const [createForm, setCreateForm] = useState(initialCreateForm)
  const [inviteCodeInput, setInviteCodeInput] = useState('')
  const [activeAction, setActiveAction] = useState('')

  const [coModeratorEmailByCircle, setCoModeratorEmailByCircle] = useState({})

  const myCircleMap = useMemo(() => {
    const map = new Map()
    myCircles.forEach((circle) => map.set(circle.id, circle))
    return map
  }, [myCircles])

  const discoverDisplayCircles = useMemo(() => {
    if (discoverCircles.length > 0) return discoverCircles
    return myCircles.filter((circle) => circle.visibility === 'public')
  }, [discoverCircles, myCircles])

  const loadCircles = async ({ silent = false } = {}) => {
    if (refreshCircles) {
      await refreshCircles(silent)
    }
  }

  useEffect(() => {
    // We don't need to load on mount anymore since parent handles it,
    // but if for some reason the data is missing, we could trigger refresh.
    if (myCircles.length === 0 && discoverCircles.length === 0 && !isLoadingExternal) {
      loadCircles()
    }
  }, [])

  const performAction = async (label, cb) => {
    setActiveAction(label)
    try {
      await cb()
      await loadCircles({ silent: true })
    } catch (err) {
      alert(err.message)
    } finally {
      setActiveAction('')
    }
  }

  const createCircle = async (e) => {
    e.preventDefault()

    if (!createForm.subject.trim() || !createForm.moduleCode.trim() || !createForm.semester.trim() || !createForm.year) {
      alert('Please fill all create-circle fields.')
      return
    }

    await performAction('create', async () => {
      const res = await fetch(API_BASE, {
        method: 'POST',
        headers: createHeaders(),
        body: JSON.stringify({
          subject: createForm.subject.trim(),
          moduleCode: createForm.moduleCode.trim(),
          semester: createForm.semester.trim(),
          year: Number(createForm.year),
          visibility: createForm.visibility,
          description: createForm.description.trim(),
        }),
      })
      await parseResponse(res)
      setShowCreateModal(false)
      setCreateForm(initialCreateForm)
    })
  }

  const joinByCode = async () => {
    if (!inviteCodeInput.trim()) {
      alert('Enter an invite code first.')
      return
    }

    await performAction('joinByCode', async () => {
      const res = await fetch(`${API_BASE}/join-by-code`, {
        method: 'POST',
        headers: createHeaders(),
        body: JSON.stringify({ inviteCode: inviteCodeInput.trim() }),
      })
      const data = await parseResponse(res)
      alert(data.message || 'Invite request sent successfully.')
      setInviteCodeInput('')
    })
  }

  const openChatPage = (circle) => {
    navigate(`/dashboard/student/circles/${circle.id}/chat`, {
      state: {
        circle,
      },
    })
  }

  const openCircleDetails = async (circleId) => {
    setIsDetailLoading(true)
    try {
      const res = await fetch(`${API_BASE}/${circleId}`, {
        headers: createHeaders(),
      })
      const data = await parseResponse(res)
      setDetailCircle(data.circle)
      setShowDetailsModal(true)
    } catch (err) {
      alert(err.message)
    } finally {
      setIsDetailLoading(false)
    }
  }

  const requestToJoin = async (circleId) => {
    await performAction(`join-${circleId}`, async () => {
      const res = await fetch(`${API_BASE}/${circleId}/request-join`, {
        method: 'POST',
        headers: createHeaders(),
      })
      const data = await parseResponse(res)
      alert(data.message)
    })
  }

  const respondToRequest = async (circleId, requestId, action) => {
    await performAction(`${action}-${requestId}`, async () => {
      const res = await fetch(`${API_BASE}/${circleId}/requests/${requestId}`, {
        method: 'POST',
        headers: createHeaders(),
        body: JSON.stringify({ action }),
      })
      const data = await parseResponse(res)
      alert(data.message)
    })
  }

  const assignCoModerator = async (circleId) => {
    const emailToAssign = String(coModeratorEmailByCircle[circleId] || '').trim().toLowerCase()
    if (!emailToAssign) {
      alert('Enter student email first.')
      return
    }

    await performAction(`assign-${circleId}`, async () => {
      const res = await fetch(`${API_BASE}/${circleId}/co-moderators`, {
        method: 'POST',
        headers: createHeaders(),
        body: JSON.stringify({ email: emailToAssign }),
      })
      const data = await parseResponse(res)
      alert(data.message)
      setCoModeratorEmailByCircle((prev) => ({ ...prev, [circleId]: '' }))
    })
  }

  const removeCoModerator = async (circleId, memberId) => {
    await performAction(`remove-mod-${memberId}`, async () => {
      const res = await fetch(`${API_BASE}/${circleId}/co-moderators/${memberId}`, {
        method: 'DELETE',
        headers: createHeaders(),
      })
      const data = await parseResponse(res)
      alert(data.message)
    })
  }

  const leaveCircle = async (circleId) => {
    await performAction(`leave-${circleId}`, async () => {
      const res = await fetch(`${API_BASE}/${circleId}/leave`, {
        method: 'POST',
        headers: createHeaders(),
      })
      const data = await parseResponse(res)
      alert(data.message)
    })
  }

  const deleteCircle = async (circleId) => {
    const confirmed = window.confirm('Are you sure you want to delete this study circle? This action cannot be undone.')
    if (!confirmed) return

    await performAction(`delete-${circleId}`, async () => {
      const res = await fetch(`${API_BASE}/${circleId}`, {
        method: 'DELETE',
        headers: createHeaders(),
      })
      const data = await parseResponse(res)
      alert(data.message)
      if (detailCircle?.id === circleId) {
        setShowDetailsModal(false)
        setDetailCircle(null)
      }
    })
  }

  const reportCircle = async (circleId) => {
    const reason = window.prompt('Report reason (required):')
    if (!reason || !reason.trim()) return

    const details = window.prompt('Additional details (optional):') || ''

    await performAction(`report-${circleId}`, async () => {
      const res = await fetch(`${API_BASE}/${circleId}/report`, {
        method: 'POST',
        headers: createHeaders(),
        body: JSON.stringify({ reason, details }),
      })
      const data = await parseResponse(res)
      alert(data.message)
    })
  }

  const copyInviteCode = async (code) => {
    try {
      await navigator.clipboard.writeText(code)
      alert('Invite code copied.')
    } catch {
      alert('Could not copy invite code.')
    }
  }

  const openEditCircle = (circle) => {
    setEditCircleId(circle.id)
    setEditForm({
      subject: circle.subject,
      moduleCode: circle.moduleCode,
      semester: circle.semester,
      year: String(circle.year),
      visibility: circle.visibility,
      description: circle.description || '',
    })
    setShowEditModal(true)
  }

  const updateCircle = async (e) => {
    e.preventDefault()

    if (!editForm.subject.trim() || !editForm.moduleCode.trim() || !editForm.semester.trim() || !editForm.year) {
      alert('Please fill all fields.')
      return
    }

    if (!editCircleId) return

    await performAction(`update-${editCircleId}`, async () => {
      const res = await fetch(`${API_BASE}/${editCircleId}`, {
        method: 'PUT',
        headers: createHeaders(),
        body: JSON.stringify({
          subject: editForm.subject.trim(),
          moduleCode: editForm.moduleCode.trim(),
          semester: editForm.semester.trim(),
          year: Number(editForm.year),
          visibility: editForm.visibility,
          description: editForm.description.trim(),
        }),
      })
      await parseResponse(res)
      setShowEditModal(false)
      setEditCircleId(null)
      setEditForm(initialCreateForm)
    })
  }

  // We only show a small spinner or overlay if INTERNAL loading (isLoading) is true (e.g. during an action).
  // isLoadingExternal is handled progressively.
  const isRefreshing = isLoading // Internal state from performAction

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-gray-900">Study Circles</h2>
        <div className="flex flex-wrap items-center gap-2">
          <input
            value={inviteCodeInput}
            onChange={(e) => setInviteCodeInput(e.target.value.toUpperCase())}
            placeholder="Invite code"
            className="h-10 rounded-lg border border-gray-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
          />
          <button
            type="button"
            onClick={joinByCode}
            disabled={activeAction === 'joinByCode'}
            className="h-10 px-4 rounded-lg text-sm font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700"
          >
            Request Private Circle
          </button>
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="h-10 px-4 rounded-lg text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white inline-flex items-center"
          >
            <Plus className="w-4 h-4 mr-1" /> Create Circle
          </button>
        </div>
        <p className="text-xs text-gray-500 w-full">Public circles can be joined directly. Invite code is only for private circles.</p>
      </div>

      {error ? (
        <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-sm text-red-700">{error}</div>
      ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 relative min-h-[100px]">
        {isRefreshing && (
          <div className="absolute inset-0 bg-white/40 z-10 flex items-center justify-center rounded-2xl backdrop-blur-[1px]">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {myCircles.length === 0 ? (
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm text-sm text-gray-500 lg:col-span-2">
            You are not in any circles yet. Create one or join with an invite code.
          </div>
        ) : (
          myCircles.map((circle) => {
            const isCreator = circle.myMembership?.isCreator
            const canModerate = isCreator || circle.myMembership?.isCoModerator

            return (
              <div key={circle.id} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold px-2 py-1 rounded-lg bg-blue-50 text-blue-600">{circle.moduleCode}</span>
                      <span className={`text-xs font-bold px-2 py-1 rounded-lg ${circle.visibility === 'public' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-700'}`}>
                        {circle.visibility}
                      </span>
                    </div>
                    <h3 className="mt-2 text-base font-bold text-gray-900">{circle.subject}</h3>
                    <p className="text-xs text-gray-500">{circle.semester} • {circle.year}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {canModerate ? (
                      <button
                        type="button"
                        onClick={() => openEditCircle(circle)}
                        className="w-8 h-8 rounded-full hover:bg-blue-50 text-blue-600 inline-flex items-center justify-center"
                        title="Edit circle"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => reportCircle(circle.id)}
                      className="text-xs font-semibold text-red-600 hover:text-red-700"
                    >
                      Report
                    </button>
                  </div>
                </div>

                <div className="text-sm text-gray-600">
                  Members: <span className="font-semibold text-gray-900">{circle.memberCount ?? circle.members.length}</span>
                </div>

                {circle.visibility === 'private' ? (
                  <div className="rounded-xl bg-gray-50 px-3 py-2 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[11px] text-gray-500">Private Invite Code</p>
                      <p className="font-mono text-sm font-bold text-gray-900 tracking-wider">{circle.inviteCode}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyInviteCode(circle.inviteCode)}
                      className="text-xs px-3 py-1.5 rounded-lg bg-white border border-gray-200 font-semibold text-gray-700 inline-flex items-center"
                    >
                      <Copy className="w-3.5 h-3.5 mr-1" /> Copy
                    </button>
                  </div>
                ) : (
                  <div className="rounded-xl bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700">
                    This is a public circle. Other students can join directly from Discover.
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => openCircleDetails(circle.id)}
                    disabled={isDetailLoading}
                    className="h-9 px-3 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 inline-flex items-center"
                  >
                    <Eye className="w-3.5 h-3.5 mr-1" /> See Details
                  </button>
                  <button
                    type="button"
                    onClick={() => openChatPage(circle)}
                    className="h-9 px-3 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 inline-flex items-center"
                  >
                    <MessageCircle className="w-3.5 h-3.5 mr-1" /> Open Chat Page
                  </button>
                </div>

                {canModerate ? (
                  <div className="space-y-2">
                    <h4 className="text-xs uppercase tracking-wide text-gray-400 font-bold">
                      Join Requests ({circle.pendingJoinRequests.length})
                    </h4>
                    {circle.pendingJoinRequests.length === 0 ? (
                      <p className="text-xs text-gray-500">No pending requests.</p>
                    ) : (
                      circle.pendingJoinRequests.map((req, idx) => (
                        <div key={req.id} className="rounded-lg border border-gray-100 p-3 flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-sm text-gray-800 truncate font-semibold">
                              #{idx + 1} {req.user.displayName || req.user.fullName || `Student ${String(req.user.id || '').slice(-4)}`}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {req.user.email || 'Email not available'}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => respondToRequest(circle.id, req.id, 'approve')}
                              disabled={activeAction === `approve-${req.id}`}
                              className="text-xs px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-700 font-semibold"
                            >
                              Accept
                            </button>
                            <button
                              type="button"
                              onClick={() => respondToRequest(circle.id, req.id, 'reject')}
                              disabled={activeAction === `reject-${req.id}`}
                              className="text-xs px-2.5 py-1 rounded-md bg-red-100 text-red-700 font-semibold"
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                ) : null}

                {isCreator ? (
                  <div className="space-y-2">
                    <h4 className="text-xs uppercase tracking-wide text-gray-400 font-bold">Co-Moderators</h4>
                    <div className="flex flex-wrap items-center gap-2">
                      <input
                        type="email"
                        value={coModeratorEmailByCircle[circle.id] || ''}
                        onChange={(e) => setCoModeratorEmailByCircle((prev) => ({ ...prev, [circle.id]: e.target.value }))}
                        placeholder="Student email"
                        className="h-9 rounded-lg border border-gray-200 px-2.5 text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => assignCoModerator(circle.id)}
                        disabled={activeAction === `assign-${circle.id}`}
                        className="h-9 px-3 rounded-lg text-xs font-semibold bg-blue-100 text-blue-700 inline-flex items-center"
                      >
                        <UserPlus className="w-3.5 h-3.5 mr-1" /> Assign
                      </button>
                    </div>
                    <p className="text-xs text-gray-500">Enter student email. They will be auto-joined and assigned as co-moderator (max 2).</p>

                    {circle.coModerators.length > 0 ? (
                      <div className="space-y-1">
                        {circle.coModerators.map((mod) => (
                          <div key={mod.id} className="text-xs rounded-lg bg-blue-50 text-blue-700 px-2 py-1 flex items-center justify-between">
                            <span className="inline-flex items-center"><Shield className="w-3 h-3 mr-1" /> {mod.displayName || mod.fullName || mod.email}</span>
                            <button
                              type="button"
                              onClick={() => removeCoModerator(circle.id, mod.id)}
                              className="text-blue-800 font-semibold"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-500">No co-moderators assigned.</p>
                    )}
                  </div>
                ) : null}

                {!isCreator ? (
                  <button
                    type="button"
                    onClick={() => leaveCircle(circle.id)}
                    disabled={activeAction === `leave-${circle.id}`}
                    className="text-xs font-semibold px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700"
                  >
                    Leave Circle
                  </button>
                ) : (
                  <div className="space-y-2">
                    <p className="text-xs text-gray-500">You are the creator of this circle.</p>
                    <button
                      type="button"
                      onClick={() => deleteCircle(circle.id)}
                      disabled={activeAction === `delete-${circle.id}`}
                      className="text-xs font-semibold px-3 py-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 inline-flex items-center"
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete Circle
                    </button>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <h3 className="text-base font-bold text-gray-900 mb-4 font-sans">Discover Public Circles</h3>
        {isLoadingExternal ? (
          <div className="space-y-3 animate-pulse">
            {[1, 2].map(i => (
              <div key={i} className="h-20 bg-gray-50 rounded-xl border border-gray-100"></div>
            ))}
          </div>
        ) : discoverDisplayCircles.length === 0 ? (
          <p className="text-sm text-gray-500">No public circles available right now.</p>
        ) : (
          <div className="space-y-3">
            {discoverDisplayCircles.map((circle) => {
              const alreadyJoined = myCircleMap.has(circle.id)
              return (
                <div key={circle.id} className="border border-gray-100 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold text-blue-600">{circle.moduleCode} • {circle.semester} {circle.year}</p>
                    <h4 className="font-bold text-gray-900">{circle.subject}</h4>
                    <p className="text-xs text-gray-500 inline-flex items-center">
                      <Users className="w-3.5 h-3.5 mr-1" /> {circle.memberCount ?? circle.members.length} members
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => reportCircle(circle.id)}
                      className="text-xs px-3 py-2 rounded-lg bg-red-50 text-red-700 font-semibold"
                    >
                      Report
                    </button>
                    <button
                      type="button"
                      onClick={() => requestToJoin(circle.id)}
                      disabled={alreadyJoined || activeAction === `join-${circle.id}`}
                      className="text-xs px-3 py-2 rounded-lg bg-blue-600 text-white font-semibold disabled:opacity-60"
                    >
                      {alreadyJoined ? 'Joined' : (circle.visibility === 'public' ? 'Join' : 'Request Join')}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {showCreateModal ? (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl border border-gray-100 shadow-xl p-6 relative">
            <button
              type="button"
              onClick={() => setShowCreateModal(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-gray-900 mb-5">Create Study Circle</h3>

            <form onSubmit={createCircle} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Subject</label>
                <input
                  value={createForm.subject}
                  onChange={(e) => setCreateForm((prev) => ({ ...prev, subject: e.target.value }))}
                  placeholder="e.g. Data Structures"
                  className="w-full h-11 rounded-lg border border-gray-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Module Code</label>
                  <input
                    value={createForm.moduleCode}
                    onChange={(e) => setCreateForm((prev) => ({ ...prev, moduleCode: e.target.value.toUpperCase() }))}
                    placeholder="CS101"
                    className="w-full h-11 rounded-lg border border-gray-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Semester</label>
                  <input
                    value={createForm.semester}
                    onChange={(e) => setCreateForm((prev) => ({ ...prev, semester: e.target.value }))}
                    placeholder="Semester 1"
                    className="w-full h-11 rounded-lg border border-gray-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Year</label>
                  <select
                    value={createForm.year}
                    onChange={(e) => setCreateForm((prev) => ({ ...prev, year: e.target.value }))}
                    className="w-full h-11 rounded-lg border border-gray-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="1">Year 1</option>
                    <option value="2">Year 2</option>
                    <option value="3">Year 3</option>
                    <option value="4">Year 4</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Visibility</label>
                  <select
                    value={createForm.visibility}
                    onChange={(e) => setCreateForm((prev) => ({ ...prev, visibility: e.target.value }))}
                    className="w-full h-11 rounded-lg border border-gray-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="public">Public</option>
                    <option value="private">Private</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Description <span className="text-xs text-gray-500">(optional)</span></label>
                <textarea
                  value={createForm.description}
                  onChange={(e) => setCreateForm((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Add a brief description of what this study circle is about..."
                  maxLength="250"
                  rows="3"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 resize-none"
                />
                <p className="text-xs text-gray-500 mt-1">{createForm.description.length}/250 characters</p>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="h-10 px-4 rounded-lg bg-gray-100 text-gray-700 text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={activeAction === 'create'}
                  className="h-10 px-4 rounded-lg bg-blue-600 text-white text-sm font-semibold"
                >
                  Create Circle
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {showEditModal ? (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl border border-gray-100 shadow-xl p-6 relative">
            <button
              type="button"
              onClick={() => {
                setShowEditModal(false)
                setEditCircleId(null)
                setEditForm(initialCreateForm)
              }}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-gray-900 mb-5">Edit Study Circle</h3>

            <form onSubmit={updateCircle} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Subject</label>
                <input
                  value={editForm.subject}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, subject: e.target.value }))}
                  placeholder="e.g. Data Structures"
                  className="w-full h-11 rounded-lg border border-gray-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Module Code</label>
                  <input
                    value={editForm.moduleCode}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, moduleCode: e.target.value.toUpperCase() }))}
                    placeholder="CS101"
                    className="w-full h-11 rounded-lg border border-gray-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Semester</label>
                  <input
                    value={editForm.semester}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, semester: e.target.value }))}
                    placeholder="Semester 1"
                    className="w-full h-11 rounded-lg border border-gray-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Year</label>
                  <select
                    value={editForm.year}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, year: e.target.value }))}
                    className="w-full h-11 rounded-lg border border-gray-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="1">Year 1</option>
                    <option value="2">Year 2</option>
                    <option value="3">Year 3</option>
                    <option value="4">Year 4</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Visibility</label>
                  <select
                    value={editForm.visibility}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, visibility: e.target.value }))}
                    className="w-full h-11 rounded-lg border border-gray-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="public">Public</option>
                    <option value="private">Private</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Description <span className="text-xs text-gray-500">(optional)</span></label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Add a brief description of what this study circle is about..."
                  maxLength="250"
                  rows="3"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 resize-none"
                />
                <p className="text-xs text-gray-500 mt-1">{editForm.description.length}/250 characters</p>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false)
                    setEditCircleId(null)
                    setEditForm(initialCreateForm)
                  }}
                  className="h-10 px-4 rounded-lg bg-gray-100 text-gray-700 text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={activeAction.startsWith('update-')}
                  className="h-10 px-4 rounded-lg bg-blue-600 text-white text-sm font-semibold"
                >
                  Update Circle
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {showDetailsModal ? (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-white rounded-2xl border border-gray-100 shadow-xl p-6 relative max-h-[85vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => {
                setShowDetailsModal(false)
                setDetailCircle(null)
              }}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-gray-900 mb-4">Study Circle Details</h3>

            {!detailCircle ? (
              <p className="text-sm text-gray-500">Loading details...</p>
            ) : (
              <div className="space-y-5">
                <div className="rounded-xl border border-gray-100 p-4 bg-gray-50">
                  <h4 className="text-lg font-bold text-gray-900">{detailCircle.subject}</h4>
                  <p className="text-sm text-gray-600 mt-1">{detailCircle.moduleCode} • {detailCircle.semester} • Year {detailCircle.year}</p>
                  <p className="text-xs font-semibold mt-2 text-gray-500 uppercase tracking-wide">Visibility: {detailCircle.visibility}</p>
                </div>

                <div className="rounded-xl border border-gray-100 p-4">
                  <h5 className="text-sm font-bold text-gray-800 mb-2">Owner</h5>
                  <p className="text-sm text-gray-700">{detailCircle.creator?.displayName || detailCircle.creator?.fullName || 'Owner'}</p>
                  <p className="text-xs text-gray-500">{detailCircle.creator?.email || 'Email not available'}</p>
                </div>

                <div className="rounded-xl border border-gray-100 p-4">
                  <h5 className="text-sm font-bold text-gray-800 mb-2">Co-Moderators ({detailCircle.coModerators?.length || 0})</h5>
                  {(detailCircle.coModerators || []).length === 0 ? (
                    <p className="text-sm text-gray-500">No co-moderators assigned.</p>
                  ) : (
                    <div className="space-y-2">
                      {(detailCircle.coModerators || []).map((member) => (
                        <div key={member.id} className="rounded-lg bg-blue-50 px-3 py-2">
                          <p className="text-sm font-semibold text-blue-800">{member.displayName || member.fullName || 'Student'}</p>
                          <p className="text-xs text-blue-700">{member.email || 'Email not available'}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="rounded-xl border border-gray-100 p-4">
                  <h5 className="text-sm font-bold text-gray-800 mb-2">Members ({detailCircle.memberCount || detailCircle.members?.length || 0})</h5>
                  {(detailCircle.members || []).length === 0 ? (
                    <p className="text-sm text-gray-500">No members found.</p>
                  ) : (
                    <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                      {(detailCircle.members || []).map((member) => (
                        <div key={member.id} className="rounded-lg bg-gray-50 px-3 py-2">
                          <p className="text-sm font-semibold text-gray-800">{member.displayName || member.fullName || 'Student'}</p>
                          <p className="text-xs text-gray-500">{member.email || 'Email not available'}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </section>
  )
}
