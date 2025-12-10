import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { api } from '../../services/api'

type ChallengeStatItem = {
  id: number
  title: string
  category: string
  difficulty: string
  success_rate: number
  attempts: number
  solves: number
}

type StatsData = {
  general_success_rate: number
  total_attempts: number
  successful_attempts: number
  average_attempts: number
  challenges_stats: ChallengeStatItem[]
}

export default function ValidationStats() {
  const { token } = useAuth()
  const [stats, setStats] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)
  
  // Filters
  const [categoryId, setCategoryId] = useState<string>('')
  const [difficultyId, setDifficultyId] = useState<string>('')
  const [teamId, setTeamId] = useState<string>('')
  
  // Filter options
  const [categories, setCategories] = useState<any[]>([])
  const [difficulties, setDifficulties] = useState<any[]>([])
  const [teams, setTeams] = useState<any[]>([])

  // Sorting state
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null)

  useEffect(() => {
    const fetchFilters = async () => {
      if (!token) return
      try {
        const [cats, diffs, teamsData] = await Promise.all([
          api.challenges.categories(token),
          fetch(`${import.meta.env.VITE_API_URL || ''}/api/v1/challenges/difficulties`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
          fetch(`${import.meta.env.VITE_API_URL || ''}/api/v1/admin/teams`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json())
        ])
        setCategories(cats)
        setDifficulties(diffs)
        setTeams(teamsData)
      } catch (err) {
        console.error('Failed to fetch filters', err)
      }
    }
    fetchFilters()
  }, [token])

  useEffect(() => {
    const fetchStats = async () => {
      if (!token) return
      setLoading(true)
      try {
        const params = new URLSearchParams()
        if (categoryId) params.append('category_id', categoryId)
        if (difficultyId) params.append('difficulty_id', difficultyId)
        if (teamId) params.append('team_id', teamId)

        const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/v1/admin/stats/challenges?${params.toString()}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        if (res.ok) {
            const data = await res.json()
            setStats(data)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [token, categoryId, difficultyId, teamId])

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc'
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })
  }

  const sortedStats = [...(stats?.challenges_stats || [])].sort((a, b) => {
    if (!sortConfig) return 0
    const { key, direction } = sortConfig
    
    let valA: any = a[key as keyof ChallengeStatItem]
    let valB: any = b[key as keyof ChallengeStatItem]

    if (key === 'failed') {
        valA = a.attempts - a.solves
        valB = b.attempts - b.solves
    } else if (key === 'avg_attempts') {
        valA = a.solves > 0 ? a.attempts / a.solves : 0
        valB = b.solves > 0 ? b.attempts / b.solves : 0
    }

    if (valA < valB) return direction === 'asc' ? -1 : 1
    if (valA > valB) return direction === 'asc' ? 1 : -1
    return 0
  })

  if (loading && !stats) {
    return <div className="flex justify-center p-8"><span className="loading loading-spinner loading-lg text-primary"></span></div>
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="grid grid-cols-1 gap-4 rounded-box bg-base-300 p-4 md:grid-cols-3">
        <div className="form-control">
          <label className="label"><span className="label-text">Category</span></label>
          <select className="select select-bordered w-full" value={categoryId} onChange={e => setCategoryId(e.target.value)}>
            <option value="">All Categories</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div className="form-control">
          <label className="label"><span className="label-text">Difficulty</span></label>
          <select className="select select-bordered w-full" value={difficultyId} onChange={e => setDifficultyId(e.target.value)}>
            <option value="">All Difficulties</option>
            {difficulties.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </div>
        <div className="form-control">
          <label className="label"><span className="label-text">Team</span></label>
          <select className="select select-bordered w-full" value={teamId} onChange={e => setTeamId(e.target.value)}>
            <option value="">All Teams</option>
            {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
        <div className="card bg-base-300 shadow-xl border border-base-content/5">
          <div className="card-body p-4">
            <h2 className="card-title text-xs opacity-70 text-base-content">General Success Rate</h2>
            <div className="flex items-end gap-2">
                <span className="text-3xl font-bold text-success">{stats?.general_success_rate.toFixed(1)}%</span>
            </div>
            <p className="text-[10px] opacity-50 text-base-content">{stats?.successful_attempts} / {stats?.total_attempts} attempts</p>
          </div>
        </div>
        <div className="card bg-base-300 shadow-xl border border-base-content/5">
          <div className="card-body p-4">
            <h2 className="card-title text-xs opacity-70 text-base-content">Avg Attempts/Solve</h2>
            <div className="flex items-end gap-2">
                <span className="text-3xl font-bold text-info">
                  {stats?.average_attempts && stats.average_attempts > 0 ? stats.average_attempts.toFixed(1) : '-'}
                </span>
            </div>
            <p className="text-[10px] opacity-50 text-base-content">Per solved challenge</p>
          </div>
        </div>
        <div className="card bg-base-300 shadow-xl border border-base-content/5">
          <div className="card-body p-4">
            <h2 className="card-title text-xs opacity-70 text-base-content">Total Submissions</h2>
            <div className="flex items-end gap-2">
                <span className="text-3xl font-bold text-secondary">{stats?.total_attempts}</span>
            </div>
            <p className="text-[10px] opacity-50 text-base-content">{stats?.successful_attempts} successful</p>
          </div>
        </div>
        <div className="card bg-base-300 shadow-xl border border-base-content/5">
          <div className="card-body p-4">
            <h2 className="card-title text-xs opacity-70 text-base-content">Solved Challenges</h2>
            <div className="flex items-end gap-2">
                <span className="text-3xl font-bold text-success">
                    {stats?.challenges_stats.filter(c => c.solves > 0).length}
                </span>
            </div>
            <p className="text-[10px] opacity-50 text-base-content">At least 1 solve</p>
          </div>
        </div>
        <div className="card bg-base-300 shadow-xl border border-base-content/5">
          <div className="card-body p-4">
            <h2 className="card-title text-xs opacity-70 text-base-content">Unsolved Challenges</h2>
            <div className="flex items-end gap-2">
                <span className="text-3xl font-bold text-error">
                    {stats?.challenges_stats.filter(c => c.solves === 0).length}
                </span>
            </div>
            <p className="text-[10px] opacity-50 text-base-content">0 solves</p>
          </div>
        </div>
      </div>

      {/* Stats Table */}
      <div className="rounded-box border border-base-content/5 bg-base-300 overflow-x-auto shadow-lg">
        <table className="table table-lg w-full">
          <thead className="bg-base-200 text-base uppercase tracking-wider text-base-content/70">
            <tr>
              <th className="pl-6 cursor-pointer hover:text-base-content hover:bg-base-100 transition-colors" onClick={() => handleSort('title')}>
                <div className="flex items-center gap-2">
                  Name 
                  {sortConfig?.key === 'title' && <span className="text-primary">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>}
                </div>
              </th>
              <th className="text-center cursor-pointer hover:text-base-content hover:bg-base-100 transition-colors" onClick={() => handleSort('category')}>
                <div className="flex items-center justify-center gap-2">
                  Category
                  {sortConfig?.key === 'category' && <span className="text-primary">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>}
                </div>
              </th>
              <th className="text-center cursor-pointer hover:text-base-content hover:bg-base-100 transition-colors" onClick={() => handleSort('difficulty')}>
                <div className="flex items-center justify-center gap-2">
                  Difficulty
                  {sortConfig?.key === 'difficulty' && <span className="text-primary">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>}
                </div>
              </th>
              <th className="text-center cursor-pointer hover:text-base-content hover:bg-base-100 transition-colors" onClick={() => handleSort('attempts')}>
                <div className="flex items-center justify-center gap-2">
                  Total Attempts
                  {sortConfig?.key === 'attempts' && <span className="text-primary">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>}
                </div>
              </th>
              <th className="text-center text-success cursor-pointer hover:text-success/80 hover:bg-base-100 transition-colors" onClick={() => handleSort('solves')}>
                <div className="flex items-center justify-center gap-2">
                  Successful
                  {sortConfig?.key === 'solves' && <span className="text-primary">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>}
                </div>
              </th>
              <th className="text-center text-error cursor-pointer hover:text-error/80 hover:bg-base-100 transition-colors" onClick={() => handleSort('failed')}>
                <div className="flex items-center justify-center gap-2">
                  Failed
                  {sortConfig?.key === 'failed' && <span className="text-primary">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>}
                </div>
              </th>
              <th className="text-center cursor-pointer hover:text-base-content hover:bg-base-100 transition-colors" onClick={() => handleSort('avg_attempts')}>
                <div className="flex items-center justify-center gap-2">
                  Avg Attempts
                  {sortConfig?.key === 'avg_attempts' && <span className="text-primary">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>}
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="text-lg">
            {sortedStats.map(c => (
              <tr key={c.id} className="hover border-b border-base-content/5 last:border-none transition-colors">
                <td className="font-bold pl-6 text-base-content">{c.title}</td>
                <td className="text-center">
                    <div className="badge badge-neutral badge-lg px-4 py-3 font-medium min-w-[100px] h-auto rounded-xl bg-base-100 border border-base-content/10 shadow-sm text-base-content">
                        {c.category}
                    </div>
                </td>
                <td className="text-center">
                    <div className={`badge badge-outline badge-lg font-medium ${
                        c.difficulty === 'Easy' ? 'badge-success' :
                        c.difficulty === 'Medium' ? 'badge-warning' :
                        c.difficulty === 'Hard' ? 'badge-error' : 'badge-info'
                    }`}>
                        {c.difficulty}
                    </div>
                </td>
                <td className="text-center font-mono">{c.attempts}</td>
                <td className="text-center font-mono text-success font-bold">{c.solves}</td>
                <td className="text-center font-mono text-error font-bold">{c.attempts - c.solves}</td>
                <td className="text-center font-mono opacity-80">
                    {c.solves > 0 ? (c.attempts / c.solves).toFixed(2) : '-'}
                </td>
              </tr>
            ))}
            {sortedStats.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center opacity-50 py-12 text-xl">No challenges found matching filters</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Visual Stats Collapsible */}
      <div className="collapse collapse-arrow bg-base-300 border border-base-content/5">
        <input type="checkbox" /> 
        <div className="collapse-title text-lg font-bold flex items-center gap-2 text-base-content">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
            Visual Success Rates
        </div>
        <div className="collapse-content">
            <div className="space-y-6 pt-4">
                {stats?.challenges_stats.map(challenge => (
                    <div key={challenge.id}>
                        <div className="flex justify-between mb-2 text-lg">
                            <span className="font-bold text-base-content">{challenge.title}</span>
                            <div className="flex gap-4">
                                <span className="text-[#36d399] font-mono" title="Successful Submissions">
                                    {challenge.success_rate.toFixed(1)}% ({challenge.solves}/{challenge.attempts})
                                </span>
                                <span className="text-[#ff5861] font-mono" title="Failed Submissions">
                                    {(100 - challenge.success_rate).toFixed(1)}% ({challenge.attempts - challenge.solves}/{challenge.attempts})
                                </span>
                            </div>
                        </div>
                        <div className="w-full h-4 bg-base-200 rounded-full overflow-hidden flex">
                            <div 
                                className="h-full bg-[#36d399] transition-all duration-500" 
                                style={{ width: `${challenge.success_rate}%` }}
                                title={`${challenge.success_rate.toFixed(1)}% Success`}
                            ></div>
                            <div 
                                className="h-full bg-[#ff5861] transition-all duration-500" 
                                style={{ width: `${100 - challenge.success_rate}%` }}
                                title={`${(100 - challenge.success_rate).toFixed(1)}% Failure`}
                            ></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  )
}
