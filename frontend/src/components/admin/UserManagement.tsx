import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { api } from '../../services/api'
import { useToast } from '../../context/ToastContext'

type User = {
  id: number
  username: string
  email: string
  role_id: number
  created_at: string
}

type Team = {
  id: number
  name: string
  captain_id: number
  total_score: number
  created_at: string
}

export default function UserManagement() {
  const { token } = useAuth()
  const { showToast } = useToast()
  const [activeTab, setActiveTab] = useState<'users' | 'teams'>('users')
  const [users, setUsers] = useState<User[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'user' | 'team', id: number, name: string } | null>(null)

  const fetchData = async () => {
    if (!token) return
    setLoading(true)
    try {
      const [usersData, teamsData] = await Promise.all([
        api.admin.getUsers(token),
        api.admin.getTeams(token)
      ])
      setUsers(usersData)
      setTeams(teamsData)
    } catch (error) {
      console.error('Failed to fetch data:', error)
      showToast('Failed to load data', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [token])

  const handleDelete = async () => {
    if (!token || !deleteConfirm) return

    try {
      if (deleteConfirm.type === 'user') {
        await api.admin.deleteUser(token, deleteConfirm.id)
        showToast(`User ${deleteConfirm.name} deleted successfully`, 'success')
      } else {
        await api.admin.deleteTeam(token, deleteConfirm.id)
        showToast(`Team ${deleteConfirm.name} deleted successfully`, 'success')
      }
      fetchData()
      setDeleteConfirm(null)
    } catch (error) {
      console.error('Failed to delete:', error)
      showToast('Failed to delete item', 'error')
    }
  }

  if (loading) {
    return <div className="flex justify-center p-8"><span className="loading loading-spinner loading-lg"></span></div>
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="tabs tabs-boxed bg-base-300">
          <a 
            className={`tab ${activeTab === 'users' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            User Management
          </a>
          <a 
            className={`tab ${activeTab === 'teams' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('teams')}
          >
            Team Management
          </a>
        </div>
        <button className="btn btn-sm rounded-md border border-white/20 bg-transparent text-white hover:bg-white/5 transition-all" onClick={fetchData}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
          </svg>
          Refresh
        </button>
      </div>

      {activeTab === 'users' ? (
        <div className="space-y-4">
          {users.map(user => (
            <div key={user.id} className="card bg-black/20 border border-white/5">
              <div className="card-body p-4 flex-row items-center justify-between">
                <div>
                  <h4 className="font-bold flex items-center gap-2">
                    {user.username}
                    {user.role_id === 1 && <span className="badge badge-primary badge-xs">Admin</span>}
                  </h4>
                  <div className="text-sm text-white/60">
                    {user.email} • Joined: {new Date(user.created_at).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button 
                    className="btn btn-square btn-sm btn-ghost border border-white/10 text-error hover:bg-error/20"
                    onClick={() => setDeleteConfirm({ type: 'user', id: user.id, name: user.username })}
                    disabled={user.role_id === 1} // Prevent deleting admins easily
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
          {users.length === 0 && <div className="text-center text-white/40 py-8">No users found</div>}
        </div>
      ) : (
        <div className="space-y-4">
          {teams.map(team => (
            <div key={team.id} className="card bg-black/20 border border-white/5">
              <div className="card-body p-4 flex-row items-center justify-between">
                <div>
                  <h4 className="font-bold">{team.name}</h4>
                  <div className="text-sm text-white/60">
                    Score: {team.total_score} • Created: {new Date(team.created_at).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button 
                    className="btn btn-square btn-sm btn-ghost border border-white/10 text-error hover:bg-error/20"
                    onClick={() => setDeleteConfirm({ type: 'team', id: team.id, name: team.name })}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
          {teams.length === 0 && <div className="text-center text-white/40 py-8">No teams found</div>}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="modal modal-open">
          <div className="modal-box border border-error/20">
            <h3 className="font-bold text-lg text-error">Confirm Deletion</h3>
            <p className="py-4">
              Are you sure you want to delete the {deleteConfirm.type} <span className="font-bold">{deleteConfirm.name}</span>?
              <br />
              <span className="text-sm opacity-70 mt-2 block">
                This action cannot be undone. All associated data (submissions, etc.) will be permanently removed.
              </span>
            </p>
            <div className="modal-action">
              <button className="btn btn-outline rounded-md transition-all" onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button className="btn btn-error text-error-content rounded-md hover:brightness-75 transition-all border-none" onClick={handleDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
