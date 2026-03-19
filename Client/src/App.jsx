import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Register from './pages/Register'
import Verify from './pages/Verify'
import Interests from './pages/Interests'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import AdminLogin from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashboard'
import StudentDashboard from './pages/StudentDashboard'
import LecturerDashboard from './pages/LecturerDashboard'
import { getUser } from './utils/authUtils'

/** Redirects unauthenticated users away from protected admin routes */
function ProtectedAdminRoute({ children }) {
  if (sessionStorage.getItem('adminAuth') !== 'true') {
    return <Navigate to="/admin" replace />
  }
  return children
}

/**
 * Redirects to /login if the user isn't authenticated.
 * Optionally enforces a specific role — if the stored role doesn't match,
 * redirects to the correct dashboard instead of the requested one.
 */
function ProtectedRoute({ role, children }) {
  const user = getUser()
  const token = localStorage.getItem('token')

  if (!token || !user) return <Navigate to="/login" replace />

  if (role && user.role !== role) {
    // Wrong role — send to the right dashboard
    return <Navigate to={`/dashboard/${user.role}`} replace />
  }

  return children
}

function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        {/* Public */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify" element={<Verify />} />
        <Route path="/interests" element={<Interests />} />

        {/* Admin */}
        <Route path="/admin" element={<AdminLogin />} />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedAdminRoute>
              <AdminDashboard />
            </ProtectedAdminRoute>
          }
        />

        {/* Role-based dashboards */}
        <Route
          path="/dashboard/student"
          element={
            <ProtectedRoute role="student">
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/lecturer"
          element={
            <ProtectedRoute role="lecturer">
              <LecturerDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App