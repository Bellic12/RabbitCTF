import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { api } from '../../services/api'

export default function Configuration() {
  const { token } = useAuth()
  const [config, setConfig] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  useEffect(() => {
    const fetchConfig = async () => {
      if (!token) return
      try {
        const data = await api.admin.getConfig(token)
        setConfig(data)
      } catch (error) {
        console.error('Failed to fetch config:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchConfig()
  }, [token])

  const handleSave = async () => {
    if (!token || !config) return
    setSaving(true)
    setMessage({ type: '', text: '' })
    try {
      await api.admin.updateConfig(token, config)
      setMessage({ type: 'success', text: 'Configuration updated successfully' })
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update configuration' })
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setConfig((prev: any) => ({
      ...prev,
      [field]: parseInt(value) || 0
    }))
  }

  if (loading) return <div>Loading configuration...</div>

  return (
    <div className="space-y-6">
      {message.text && (
        <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-error'}`}>
          <span>{message.text}</span>
        </div>
      )}

      <div>
        <h3 className="text-lg font-bold mb-4">Team Configuration</h3>
        <label className="form-control w-full">
          <div className="label">
            <span className="label-text">Maximum Team Size</span>
          </div>
          <input 
            type="number" 
            className="input input-bordered w-full" 
            value={config?.max_team_size || 4}
            onChange={(e) => handleChange('max_team_size', e.target.value)}
          />
        </label>
      </div>

      <div className="divider"></div>

      <div>
        <h3 className="text-lg font-bold mb-4">Flag Submission Limits</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <label className="form-control w-full">
            <div className="label">
              <span className="label-text">Max Attempts</span>
            </div>
            <input 
              type="number" 
              className="input input-bordered w-full" 
              value={config?.max_submission_attempts || 5}
              onChange={(e) => handleChange('max_submission_attempts', e.target.value)}
            />
          </label>
          <label className="form-control w-full">
            <div className="label">
              <span className="label-text">Time Window (seconds)</span>
            </div>
            <input 
              type="number" 
              className="input input-bordered w-full" 
              value={config?.submission_time_window_seconds || 60}
              onChange={(e) => handleChange('submission_time_window_seconds', e.target.value)}
            />
          </label>
          <label className="form-control w-full">
            <div className="label">
              <span className="label-text">Block Duration (minutes)</span>
            </div>
            <input 
              type="number" 
              className="input input-bordered w-full" 
              value={config?.submission_block_minutes || 5}
              onChange={(e) => handleChange('submission_block_minutes', e.target.value)}
            />
          </label>
        </div>
      </div>

      <div className="flex justify-end">
        <button 
          className="btn btn-primary" 
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Save Configuration'}
        </button>
      </div>

      <div className="divider"></div>

      <div className="border border-error/20 rounded-lg p-6 bg-error/5">
        <h3 className="text-lg font-bold text-error mb-2">Danger Zone</h3>
        <p className="text-sm text-white/60 mb-4">
          Reset competition data. This action cannot be undone.
        </p>
        <button className="btn btn-error btn-outline btn-sm">Reset Competition</button>
      </div>
    </div>
  )
}
