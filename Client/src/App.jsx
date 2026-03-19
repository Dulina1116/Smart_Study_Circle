import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Register from './pages/Register'
import Verify from './pages/Verify'
import Interests from './pages/Interests'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import AdminLogin from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashboard'

/** Redirects unauthenticated users away from protected admin routes */
function ProtectedAdminRoute({ children }) {
  if (sessionStorage.getItem('adminAuth') !== 'true') {
    return <Navigate to="/admin" replace />
  }
  return children
}

function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify" element={<Verify />} />
        <Route path="/interests" element={<Interests />} />
        <Route path="/admin" element={<AdminLogin />} />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedAdminRoute>
              <AdminDashboard />
            </ProtectedAdminRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App