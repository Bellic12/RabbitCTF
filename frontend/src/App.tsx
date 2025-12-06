import { Navigate, Route, Routes } from 'react-router-dom'
import ChallengesPage from './pages/Challenges'
import HomePage from './pages/Home'
import LeaderboardPage from './pages/Leaderboard'
import LoginPage from './pages/Login'
import RegisterPage from './pages/Register'

export default function App() {
  return (
    // Define application routes

    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/challenges" element={<ChallengesPage />} />
      <Route path="/leaderboard" element={<LeaderboardPage />} />
      <Route path="/" element={<HomePage />} />
      <Route path="*" element={<Navigate replace to="/" />} />
    </Routes>
  )
}
