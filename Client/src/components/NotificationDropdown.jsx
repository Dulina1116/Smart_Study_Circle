import React, { useEffect, useRef, useState } from 'react'
import { Bell, Check, CheckCheck, Info, UserPlus, BookOpen, X } from 'lucide-react'

// Use relative paths so Vite proxy forwards them to localhost:5000
const API = '/api/notifications'

const getToken = () => (localStorage.getItem('token') || '').replace(/[\r\n"]/g, '')

const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${getToken()}`,
})

const timeAgo = (iso) => {
  try {
    const diff = (Date.now() - new Date(iso).getTime()) / 1000
    if (diff < 60) return 'Just now'
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    return `${Math.floor(diff / 86400)}d ago`
  } catch { return '' }
}

const iconFor = (type) => {
  switch (type) {
    case 'invite': return <UserPlus className="w-4 h-4" />
    case 'resource': return <BookOpen className="w-4 h-4" />
    default: return <Info className="w-4 h-4" />
  }
}

const colorFor = (type) => {
  switch (type) {
    case 'invite': return 'bg-teal-100 text-teal-600'
    case 'resource': return 'bg-blue-100 text-blue-600'
    default: return 'bg-slate-100 text-slate-500'
  }
}

export default function NotificationDropdown() {
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState(null)
  const ref = useRef(null)

  const unread = notifications.filter((n) => !n.read).length

  // ----- fetch -----
  const fetchNotifications = async () => {
    const token = getToken()
    if (!token) return            // not logged in yet — skip silently
    setLoading(true)
    try {
      const res = await fetch(API, { headers: authHeaders() })
      if (res.ok) {
        const data = await res.json()
        setNotifications(Array.isArray(data) ? data : data.notifications || [])
      } else {
        console.warn('Notifications API returned', res.status)
      }
    } catch (err) {
      console.error('Notification fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  // ----- mark one as read -----
  const markRead = async (id) => {
    setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, read: true } : n)))
    try {
      await fetch(`${API}/${id}/read`, { method: 'PATCH', headers: authHeaders() })
    } catch { /* silent */ }
  }

  // ----- mark all as read -----
  const markAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    try {
      await fetch(`${API}/read-all`, { method: 'PATCH', headers: authHeaders() })
    } catch { /* silent */ }
  }

  // ----- perform an action on a notification (join / deny / remind) -----
  const performNotificationAction = async (id, action) => {
    setActionLoading(`${id}:${action}`)
    try {
      const res = await fetch(`${API}/${id}/action`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ action }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.message || 'Notification action failed')

      // update local state
      setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, read: true } : n)))

      // If user joined, notify other parts of the app to refresh circles
      if (data.joined && data.circleId) {
        try {
          window.dispatchEvent(new CustomEvent('circle:joined', { detail: { circleId: data.circleId, circleType: data.circleType } }))
        } catch (e) {
          // ignore
        }
      }
    } catch (err) {
      console.error('Notification action error:', err)
      alert(err.message || 'Failed to perform action')
    } finally {
      setActionLoading(null)
    }
  }

  // fetch on open
  useEffect(() => {
    if (open) fetchNotifications()
  }, [open])

  // close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // poll every 30s
  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative" ref={ref}>
      {/* Bell Button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative text-slate-500 hover:text-slate-700 transition-colors focus:outline-none"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[16px] h-4 bg-red-500 rounded-full border-2 border-white flex items-center justify-center">
            <span className="text-[9px] font-bold text-white leading-none">{unread > 9 ? '9+' : unread}</span>
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {open && (
        <div className="absolute right-0 top-10 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Notifications</h3>
              {unread > 0 && <p className="text-[11px] text-slate-500">{unread} unread</p>}
            </div>
            <div className="flex items-center gap-2">
              {unread > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-[11px] font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  Mark all read
                </button>
              )}
              <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-50">
            {loading ? (
              <div className="p-6 text-center text-sm text-slate-400">Loading…</div>
            ) : notifications.length === 0 ? (
              <div className="p-8 flex flex-col items-center gap-2 text-center">
                <Bell className="w-8 h-8 text-slate-200" />
                <p className="text-sm font-semibold text-slate-400">No notifications yet</p>
                <p className="text-[11px] text-slate-300">You'll be notified about circle invites, resources, and more.</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n._id}
                  onClick={() => markRead(n._id)}
                  className={`flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors ${n.read ? 'bg-white hover:bg-slate-50' : 'bg-teal-50/40 hover:bg-teal-50'}`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${colorFor(n.type)}`}>
                    {iconFor(n.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-[13px] leading-snug ${n.read ? 'text-slate-600' : 'font-semibold text-slate-800'}`}>
                      {n.message}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{timeAgo(n.createdAt)}</p>

                    {/* Invite actions */}
                    {n.type === 'invite' && !n.read && (
                      <div className="flex items-center gap-2 mt-3">
                        <button
                          onClick={(e) => { e.stopPropagation(); performNotificationAction(n._id, 'join') }}
                          disabled={actionLoading === `${n._id}:join`}
                          className="text-xs px-2 py-1 rounded-md bg-emerald-100 text-emerald-700 font-semibold"
                        >
                          {actionLoading === `${n._id}:join` ? 'Joining...' : 'Join'}
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); performNotificationAction(n._id, 'deny') }}
                          disabled={actionLoading === `${n._id}:deny`}
                          className="text-xs px-2 py-1 rounded-md bg-red-100 text-red-700 font-semibold"
                        >
                          {actionLoading === `${n._id}:deny` ? 'Processing...' : 'Deny'}
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); performNotificationAction(n._id, 'remind') }}
                          disabled={actionLoading === `${n._id}:remind`}
                          className="text-xs px-2 py-1 rounded-md bg-slate-100 text-slate-700 font-semibold"
                        >
                          {actionLoading === `${n._id}:remind` ? 'Snoozing...' : 'Remind me later'}
                        </button>
                      </div>
                    )}
                  </div>

                  {!n.read && (
                    <button
                      onClick={(e) => { e.stopPropagation(); markRead(n._id) }}
                      className="text-teal-500 hover:text-teal-700 mt-1 shrink-0"
                      title="Mark as read"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>

          {notifications.length > 0 && (
            <div className="px-4 py-2.5 border-t border-slate-100 text-center">
              <button
                onClick={() => { setNotifications([]); setOpen(false) }}
                className="text-[11px] font-semibold text-slate-400 hover:text-slate-600"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
