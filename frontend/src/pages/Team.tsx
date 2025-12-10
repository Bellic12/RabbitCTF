import { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api } from '../services/api'
import Footer from '../components/Footer'
import Navigation from '../components/Navigation'
import TeamCreateModal from '../components/TeamCreateModal'
import TeamJoinModal from '../components/TeamJoinModal'
import TeamStats from '../components/TeamStats'
import { ADMIN_ROLE_ID } from '../components/ProtectedRoute'

type TeamMember = {
  user_id: number
  username: string
  email: string
  is_captain: boolean
  joined_at: string
  score: number
}

type SolvedChallenge = {
  id: number
  title: string
  category_name: string
  points: number
  solved_at: string
}

type TeamDetail = {
  id: number
  name: string
  captain_id: number
  total_score: number
  created_at: string
  member_count: number
  captain_username: string
  members: TeamMember[]
  solved_challenges_count: number
  solved_challenges: SolvedChallenge[]
}

export default function TeamPage() {
  const { token, user } = useAuth()
  const [team, setTeam] = useState<TeamDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false)

  if (user?.role_id === ADMIN_ROLE_ID) {
    return <Navigate to="/admin" replace />
  }

  const fetchTeam = async () => {
    if (!token) return
    try {
      const data = await api.teams.me(token)
      setTeam(data)
    } catch (error) {
      console.error('Failed to fetch team:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTeam()
  }, [token])

  const handleLeaveTeam = async () => {
    if (!token || !confirm('Are you sure you want to leave the team?')) return
    try {
      await api.teams.leave(token)
      setTeam(null)
    } catch (error) {
      console.error('Failed to leave team:', error)
      alert('Failed to leave team')
    }
  }

  const handleDeleteTeam = async () => {
    if (!token || !confirm('Are you sure you want to delete the team? This action cannot be undone.')) return
    try {
      await api.teams.delete(token)
      setTeam(null)
    } catch (error) {
      console.error('Failed to delete team:', error)
      alert('Failed to delete team')
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-base-100 text-white">
        <Navigation />
        <main className="flex-1 flex items-center justify-center">
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </main>
        <Footer />
      </div>
    )
  }

  if (team) {
    return (
      <div className="flex min-h-screen flex-col bg-base-100 text-white">
        <Navigation />
        <main className="flex-1 p-6">
          <div className="mx-auto max-w-4xl space-y-8">
            {/* Team Header Card */}
            <div className="card bg-base-200 shadow-xl border border-base-300">
              <div className="card-body">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h1 className="card-title text-4xl font-bold text-white mb-2">{team.name}</h1>
                    <div className="flex gap-4 flex-wrap">
                      <div className="badge badge-primary badge-lg gap-2 p-4">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
                        </svg>
                        {team.member_count} members
                      </div>
                      <div className="badge badge-secondary badge-lg gap-2 p-4">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                        </svg>
                        {team.solved_challenges_count} solved
                      </div>
                    </div>
                  </div>
                  
                  <div className="stats bg-base-300 shadow">
                    <div className="stat place-items-center">
                      <div className="stat-title">Total Points</div>
                      <div className="stat-value text-primary">{team.total_score}</div>
                      <div className="stat-desc">Team Rank: #{team.id}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Team Statistics */}
            {team.solved_challenges && team.solved_challenges.length > 0 && (
              <TeamStats solvedChallenges={team.solved_challenges} />
            )}

            {/* Team Members List */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold px-1">Team Members</h2>
              <div className="grid gap-4">
                {team.members.map((member) => (
                  <div key={member.user_id} className="card bg-base-200 shadow-md hover:bg-base-300 transition-colors border border-base-300">
                    <div className="card-body flex-row items-center justify-between p-4 sm:p-6">
                      <div className="flex items-center gap-4">
                        <div className="avatar placeholder">
                          <div className="bg-neutral text-neutral-content rounded-full w-12 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                            </svg>
                          </div>
                        </div>
                        <div>
                          <div className="font-bold text-lg flex items-center gap-2">
                            {member.username}
                            {member.is_captain && (
                              <div className="badge badge-accent badge-sm p-3">Captain</div>
                            )}
                          </div>
                          <div className="text-sm opacity-60">{member.email}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono text-xl font-bold text-primary">{member.score}</div>
                        <div className="text-xs opacity-60">points</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Solved Challenges List */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold px-1">Solved Challenges</h2>
              <div className="grid gap-4">
                {team.solved_challenges && team.solved_challenges.length > 0 ? (
                  team.solved_challenges.map((challenge) => (
                    <div key={challenge.id} className="card bg-base-200 shadow-md hover:bg-base-300 transition-colors border border-base-300">
                      <div className="card-body flex-row items-center justify-between p-4 sm:p-6">
                        <div className="flex items-center gap-4">
                          <div className="bg-success/10 text-success rounded-full p-2 flex items-center justify-center w-12 h-12">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                            </svg>
                          </div>
                          <div>
                            <h3 className="font-bold text-lg text-white">{challenge.title}</h3>
                            <div className="flex gap-2 mt-1">
                              <span className="badge badge-sm badge-outline">{challenge.category_name}</span>
                              <span className="badge badge-sm badge-primary badge-outline">{challenge.points} pts</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right text-sm text-white/60">
                          <div>{new Date(challenge.solved_at).toLocaleDateString()}</div>
                          <div>{new Date(challenge.solved_at).toLocaleTimeString()}</div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="card bg-base-200 border border-base-300 p-8 text-center text-white/60">
                    No challenges solved yet. Get hacking!
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-base-100 text-white">
      <Navigation />

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-4xl space-y-12 text-center">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold">Team Management</h1>
            <p className="text-lg text-white/60">Create a new team or join an existing one</p>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            {/* Create Team Card */}
            <div className="card bg-base-200 border border-white/5 p-8 hover:border-primary/50 transition-colors shadow-xl">
              <div className="flex flex-col items-center gap-6">
                <div className="avatar placeholder">
                  <div className="bg-base-300 text-primary rounded-full w-24 flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-12 h-12"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                  </div>
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold">Create Team</h2>
                  <p className="text-white/60">Start a new team and invite your friends</p>
                </div>
                <button
                  className="btn btn-primary w-full mt-4"
                  onClick={() => setIsCreateModalOpen(true)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5 mr-2"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  Create Team
                </button>
              </div>
            </div>

            {/* Join Team Card */}
            <div className="card bg-base-200 border border-white/5 p-8 hover:border-primary/50 transition-colors shadow-xl">
              <div className="flex flex-col items-center gap-6">
                <div className="avatar placeholder">
                  <div className="bg-base-300 text-primary rounded-full w-24 flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-12 h-12"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                      />
                    </svg>
                  </div>
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold">Join Team</h2>
                  <p className="text-white/60">Join an existing team with a password</p>
                </div>
                <button
                  className="btn btn-outline w-full mt-4"
                  onClick={() => setIsJoinModalOpen(true)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5 mr-2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                    />
                  </svg>
                  Join Team
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <TeamCreateModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
        onSuccess={fetchTeam}
      />
      <TeamJoinModal 
        isOpen={isJoinModalOpen} 
        onClose={() => setIsJoinModalOpen(false)} 
        onSuccess={fetchTeam}
      />

      <Footer />
    </div>
  )
}
