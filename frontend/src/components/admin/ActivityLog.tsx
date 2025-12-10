import { useEffect, useState, useMemo } from 'react'
import { api } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import SearchBar from '../SearchBar'

interface SubmissionLog {
  id: number
  user_id: number
  username: string
  team_id: number
  team_name: string
  challenge_id: number
  challenge_title: string
  category_name: string
  submitted_flag: string
  is_correct: boolean
  submitted_at: string
}

export default function ActivityLog() {
  const { token } = useAuth()
  const [logs, setLogs] = useState<SubmissionLog[]>([])
  const [loading, setLoading] = useState(true)
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        if (token) {
          // Fetch a larger batch to allow effective client-side filtering
          const data = await api.admin.getSubmissions(token, { limit: 500 })
          setLogs(data)
        }
      } catch (error) {
        console.error('Failed to fetch submissions:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchLogs()
    // Poll every 30 seconds
    const interval = setInterval(fetchLogs, 30000)
    return () => clearInterval(interval)
  }, [token])

  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const matchTerm = 
        log.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.team_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.challenge_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.submitted_flag.toLowerCase().includes(searchTerm.toLowerCase())

      return matchTerm
    })
  }, [logs, searchTerm])

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  if (loading) {
    return <div className="text-center py-4 text-white/60">Loading activity...</div>
  }

  return (
    <div>
      <h3 className="text-lg font-bold mb-6">Recent Submissions</h3>
      
      <div className="mb-6">
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search submissions (user, team, challenge, flag)..."
          className="bg-base-200"
        />
      </div>

      <div className="space-y-4">
        {filteredLogs.map(log => (
          <div
            key={log.id}
            className="flex items-start gap-4 p-4 rounded-lg bg-black/20 border border-white/5"
          >
            <div className={`mt-1 ${log.is_correct ? 'text-success' : 'text-error'}`}>
              {log.is_correct ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
              )}
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <h4 className="font-bold text-sm">
                  {log.is_correct ? 'Challenge Solved' : 'Failed Attempt'}
                </h4>
                <span className="text-xs text-white/40">{formatTime(log.submitted_at)}</span>
              </div>
              <p className="text-sm text-white/60 mt-1">
                <span className="text-white font-medium">{log.username}</span> (Team: {log.team_name}) 
                submitted on <span className="text-white font-medium">{log.challenge_title}</span>
              </p>
              <div className="mt-2 text-xs bg-black/40 p-2 rounded border border-white/5 font-mono text-white/80 break-all">
                Flag: {log.submitted_flag}
              </div>
            </div>
          </div>
        ))}
        {filteredLogs.length === 0 && (
          <div className="text-center py-4 text-white/40">No submissions found matching filters</div>
        )}
      </div>
    </div>
  )
}
