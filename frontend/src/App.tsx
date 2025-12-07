import { Navigate, Route, Routes } from 'react-router-dom'

import ProtectedRoute, { ADMIN_ROLE_ID } from './components/ProtectedRoute'
import AdminPage from './pages/Admin'
import ChallengesPage from './pages/Challenges'
import HomePage from './pages/Home'
import LeaderboardPage from './pages/Leaderboard'
import LoginPage from './pages/Login'
import RegisterPage from './pages/Register'
import RulesPage from './pages/Rules'
import TeamPage from './pages/Team'

export default function App() {
  return (
    // Define application routes

    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/rules" element={<RulesPage />} />
      <Route path="/leaderboard" element={<LeaderboardPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected Routes (Authenticated Users) */}
      <Route element={<ProtectedRoute />}>
        <Route path="/challenges" element={<ChallengesPage />} />
        <Route path="/team" element={<TeamPage />} />
      </Route>

      {/* Admin Routes */}
      <Route element={<ProtectedRoute requiredRole={ADMIN_ROLE_ID} />}>
        <Route path="/admin" element={<AdminPage />} />
      </Route>

      <Route path="*" element={<Navigate replace to="/" />} />
    </Routes>
  )
}
