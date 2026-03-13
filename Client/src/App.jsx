import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Register from './pages/Register'
import Verify from './pages/Verify'
import Interests from './pages/Interests'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'

function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify" element={<Verify />} />
        <Route path="/interests" element={<Interests />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App