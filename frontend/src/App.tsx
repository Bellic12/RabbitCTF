import { Navigate, Route, Routes, useNavigate, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'

import ProtectedRoute, { ADMIN_ROLE_ID } from './components/ProtectedRoute'
import AdminPage from './pages/Admin'
import ChallengesPage from './pages/Challenges'
import HomePage from './pages/Home'
import LeaderboardPage from './pages/Leaderboard'
import LoginPage from './pages/Login'
import RegisterPage from './pages/Register'
import RulesPage from './pages/Rules'
import TeamPage from './pages/Team'
import SetupPage from './pages/Setup'

export default function App() {
  const navigate = useNavigate()
  const location = useLocation()
  const [isCheckingSetup, setIsCheckingSetup] = useState(true)

  useEffect(() => {
    const checkSetup = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/v1/setup/status`)
        if (response.ok) {
          const data = await response.json()
          if (!data.is_setup_completed) {
             if (location.pathname !== '/setup') {
                navigate('/setup')
             }
          } else {
             if (location.pathname === '/setup') {
                navigate('/')
             }
          }
        }
      } catch (error) {
        console.error("Failed to check setup status", error)
      } finally {
        setIsCheckingSetup(false)
      }
    }
    
    checkSetup()
  }, [navigate, location.pathname])

  if (isCheckingSetup) {
      return <div className="flex h-screen items-center justify-center bg-base-100">
          <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
  }

  return (
    // Define application routes

    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/rules" element={<RulesPage />} />
      <Route path="/leaderboard" element={<LeaderboardPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/setup" element={<SetupPage />} />

      {/* Protected Routes (Authenticated Users) */}
      <Route element={<ProtectedRoute />}>
        <Route path="/challenges" element={<ChallengesPage />} />
        <Route path="/team" element={<TeamPage />} />
        <Route path="/teams/:id" element={<TeamPage />} />
      </Route>

      {/* Admin Routes */}
      <Route element={<ProtectedRoute requiredRole={ADMIN_ROLE_ID} />}>
        <Route path="/admin" element={<AdminPage />} />
      </Route>

      <Route path="*" element={<Navigate replace to="/" />} />
    </Routes>
  )
}
