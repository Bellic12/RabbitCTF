import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import CreateChallengeModal from './CreateChallengeModal'
import EditChallengeModal from './EditChallengeModal'

interface Challenge {
  id: number
  title: string
  description: string
  category_id: number
  category_name: string
  difficulty_id: number
  difficulty_name: string
  is_draft: boolean
  created_at: string
  score_config?: {
    base_score: number
    scoring_mode: string
    decay_factor?: number
    min_score?: number
  }
  rule_config?: {
    attempt_limit: number
    is_case_sensitive: boolean
  }
  visibility_config?: {
    is_visible: boolean
  }
}

export default function ChallengeManagement() {
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedChallengeId, setSelectedChallengeId] = useState<number | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const { token } = useAuth()

  useEffect(() => {
    if (token) {
      fetchChallenges()
    }
  }, [token])

  const fetchChallenges = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/v1/challenges/admin/all`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setChallenges(data)
      }
    } catch (error) {
      console.error('Failed to fetch challenges:', error)
    }
  }

  const handleDeleteChallenge = async (challengeId: number) => {
    if (!confirm('Are you sure you want to delete this challenge?')) return

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || ''}/api/v1/challenges/admin/${challengeId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )

      if (response.ok) {
        setSuccess('Challenge deleted successfully!')
        fetchChallenges()
      } else {
        const payload = await response.json().catch(() => ({}))
        setError(payload.detail ?? 'Failed to delete challenge')
      }
    } catch (error) {
      setError('Unable to delete challenge')
      console.error('Delete challenge failed:', error)
    }
  }

  const handleToggleVisibility = async (challengeId: number) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || ''}/api/v1/challenges/admin/${challengeId}/toggle-visibility`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )

      if (response.ok) {
        setSuccess('Challenge visibility toggled!')
        fetchChallenges()
        setTimeout(() => setSuccess(''), 3000)
      } else {
        const payload = await response.json().catch(() => ({}))
        setError(payload.detail ?? 'Failed to toggle visibility')
        setTimeout(() => setError(''), 3000)
      }
    } catch (error) {
      setError('Unable to toggle visibility')
      console.error('Toggle visibility failed:', error)
      setTimeout(() => setError(''), 3000)
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold">Challenge Management</h3>
        <button 
          className="btn btn-primary btn-sm gap-2"
          onClick={() => setIsCreateModalOpen(true)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          New Challenge
        </button>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="alert alert-success mb-4">
          <span>{success}</span>
          <button onClick={() => setSuccess('')} className="btn btn-sm btn-ghost">×</button>
        </div>
      )}
      {error && (
        <div className="alert alert-error mb-4">
          <span>{error}</span>
          <button onClick={() => setError('')} className="btn btn-sm btn-ghost">×</button>
        </div>
      )}
      
      <div className="space-y-4">
        {challenges.map(challenge => (
          <div key={challenge.id} className="card bg-black/20 border border-white/5">
            <div className="card-body p-4 flex-row items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-bold">{challenge.title}</h4>
                  {challenge.is_draft && (
                    <span className="badge badge-sm badge-warning">Draft</span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-sm text-white/60">
                  {challenge.visibility_config?.is_visible ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-success">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-4 h-4 text-white/40"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                      />
                    </svg>
                  )}
                  <span className="badge badge-sm badge-outline">{challenge.category_name}</span>
                  <span className="badge badge-sm badge-outline">{challenge.difficulty_name}</span>
                  <span>{challenge.score_config?.base_score || 0} pts</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button 
                  className="btn btn-square btn-sm btn-ghost border border-white/10"
                  onClick={() => handleToggleVisibility(challenge.id)}
                  title="Toggle Visibility"
                >
                  {challenge.visibility_config?.is_visible ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  )}
                </button>
                <button 
                  className="btn btn-square btn-sm btn-ghost border border-white/10"
                  onClick={() => {
                    setSelectedChallengeId(challenge.id)
                    setIsEditModalOpen(true)
                  }}
                  title="Edit Challenge"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                  </svg>
                </button>
                <button 
                  className="btn btn-square btn-sm btn-ghost border border-white/10"
                  onClick={() => handleDeleteChallenge(challenge.id)}
                  title="Delete Challenge"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Challenge Modal */}
      <CreateChallengeModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
        onCreate={() => {
          setSuccess('Challenge created successfully!')
          fetchChallenges()
          setTimeout(() => setSuccess(''), 3000)
        }}
      />

      <EditChallengeModal
        isOpen={isEditModalOpen}
        challengeId={selectedChallengeId}
        onClose={() => {
          setIsEditModalOpen(false)
          setSelectedChallengeId(null)
        }}
        onUpdated={() => {
          setSuccess('Challenge updated successfully!')
          fetchChallenges()
          setTimeout(() => setSuccess(''), 3000)
        }}
      />
    </div>
  )
}
