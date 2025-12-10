import { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import { useAuth } from '../../context/AuthContext'

const markdownComponents = {
  h1: ({node, ...props}: any) => <h1 className="mb-4 mt-8 text-2xl font-bold text-white" {...props} />,
  h2: ({node, ...props}: any) => <h2 className="mb-4 mt-8 text-xl font-bold text-white" {...props} />,
  h3: ({node, ...props}: any) => <h3 className="mb-3 mt-6 text-lg font-bold text-white" {...props} />,
  ul: ({node, ...props}: any) => <ul className="list-disc space-y-3 pl-5 text-white/70" {...props} />,
  li: ({node, ...props}: any) => <li className="pl-1 leading-relaxed" {...props} />,
  p: ({node, ...props}: any) => <p className="mb-4 text-white/70" {...props} />,
  strong: ({node, ...props}: any) => <strong className="font-bold text-white" {...props} />,
}

export default function EventSettings() {
  const [rules, setRules] = useState('')
  const { token } = useAuth()
  const [loading, setLoading] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  // Config state
  const [config, setConfig] = useState({
    max_submission_attempts: 5,
    submission_time_window_seconds: 60,
    submission_block_minutes: 5
  })
  const [configLoading, setConfigLoading] = useState(false)
  const [configMessage, setConfigMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  useEffect(() => {
    const fetchRules = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/v1/rules/`)
        if (response.ok) {
          const data = await response.json()
          setRules(data.content_md)
        }
      } catch (error) {
        console.error('Failed to fetch rules:', error)
      }
    }
    
    const fetchConfig = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/v1/admin/config`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        if (response.ok) {
          const data = await response.json()
          setConfig({
            max_submission_attempts: data.max_submission_attempts,
            submission_time_window_seconds: data.submission_time_window_seconds,
            submission_block_minutes: data.submission_block_minutes
          })
        }
      } catch (error) {
        console.error('Failed to fetch config:', error)
      }
    }

    fetchRules()
    if (token) fetchConfig()
  }, [token])

  const handleSaveConfig = async () => {
    setConfigLoading(true)
    setConfigMessage(null)
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/v1/admin/config`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(config)
      })

      if (response.ok) {
        setConfigMessage({ type: 'success', text: 'Configuration updated successfully' })
      } else {
        setConfigMessage({ type: 'error', text: 'Failed to update configuration' })
      }
    } catch (error) {
      setConfigMessage({ type: 'error', text: 'An error occurred' })
    } finally {
      setConfigLoading(false)
    }
  }

  const handleSaveRules = async () => {
    setLoading(true)
    setMessage(null)
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/v1/rules/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content_md: rules })
      })

      if (response.ok) {
        setMessage({ type: 'success', text: 'Rules updated successfully' })
      } else {
        setMessage({ type: 'error', text: 'Failed to update rules' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-bold mb-4">Event Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <label className="form-control w-full">
            <div className="label">
              <span className="label-text">Current Status</span>
            </div>
            <select className="select select-bordered w-full">
              <option>Not Started</option>
              <option>Running</option>
              <option>Paused</option>
              <option>Ended</option>
            </select>
          </label>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <label className="form-control w-full">
            <div className="label">
              <span className="label-text">Start Date & Time</span>
            </div>
            <input
              type="datetime-local"
              className="input input-bordered w-full"
              defaultValue="2025-02-01T10:00"
            />
          </label>
          <label className="form-control w-full">
            <div className="label">
              <span className="label-text">End Date & Time</span>
            </div>
            <input
              type="datetime-local"
              className="input input-bordered w-full"
              defaultValue="2025-02-03T18:00"
            />
          </label>
        </div>
        <button className="btn btn-primary mt-6">Update Event Timing</button>
      </div>

      <div className="divider"></div>

      <div>
        <h3 className="text-lg font-bold mb-4">Submission Rate Limiting</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <label className="form-control w-full">
            <div className="label">
              <span className="label-text">Max Attempts</span>
              <span className="label-text-alt text-white/50">per window</span>
            </div>
            <input
              type="number"
              className="input input-bordered w-full"
              value={config.max_submission_attempts}
              onChange={(e) => setConfig({...config, max_submission_attempts: parseInt(e.target.value)})}
            />
          </label>
          <label className="form-control w-full">
            <div className="label">
              <span className="label-text">Time Window</span>
              <span className="label-text-alt text-white/50">seconds</span>
            </div>
            <input
              type="number"
              className="input input-bordered w-full"
              value={config.submission_time_window_seconds}
              onChange={(e) => setConfig({...config, submission_time_window_seconds: parseInt(e.target.value)})}
            />
          </label>
          <label className="form-control w-full">
            <div className="label">
              <span className="label-text">Block Duration</span>
              <span className="label-text-alt text-white/50">minutes</span>
            </div>
            <input
              type="number"
              className="input input-bordered w-full"
              value={config.submission_block_minutes}
              onChange={(e) => setConfig({...config, submission_block_minutes: parseInt(e.target.value)})}
            />
          </label>
        </div>
        <div className="flex items-center mt-6">
            <button 
                className="btn btn-primary h-12 rounded-md border-none px-6 text-sm font-semibold text-primary-content hover:brightness-75 transition-all disabled:opacity-50 disabled:bg-neutral disabled:text-neutral-content disabled:cursor-not-allowed"
                onClick={handleSaveConfig}
                disabled={configLoading}
            >
                {configLoading ? 'Saving...' : 'Update Rate Limits'}
            </button>
            {configMessage && (
                <span className={`ml-4 text-sm ${configMessage.type === 'success' ? 'text-success' : 'text-error'}`}>
                {configMessage.text}
                </span>
            )}
        </div>
      </div>

      <div className="divider"></div>

      <div>
        <h3 className="text-lg font-bold mb-4">
          Rules & Guidelines{' '}
          <span className="font-bold italic text-white/40 ml-2 text-base">
            (Markdown supported)
          </span>
        </h3>
        <div className="form-control w-full">
          <div className="relative w-full">
            <textarea 
              className="textarea textarea-bordered h-96 w-full font-mono text-sm pb-8" 
              placeholder="Enter competition rules in Markdown format..."
              value={rules}
              onChange={e => setRules(e.target.value)}
              maxLength={10000}
            ></textarea>
            <span className="absolute bottom-2 right-3 text-xs text-white/40 pointer-events-none">
              {rules.length} / 10,000 characters
            </span>
          </div>
        </div>
        <div className="flex gap-2 mt-4 items-center">
          <button 
            className="btn btn-primary" 
            onClick={handleSaveRules}
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Rules'}
          </button>
          <button 
            className="btn btn-outline"
            onClick={() => setShowPreview(true)}
          >
            Preview
          </button>
          {message && (
            <span className={`text-sm ${message.type === 'success' ? 'text-success' : 'text-error'}`}>
              {message.text}
            </span>
          )}
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="modal modal-open">
          <div className="modal-box w-11/12 max-w-5xl h-5/6 flex flex-col">
            <h3 className="font-bold text-lg mb-4">Rules Preview</h3>
            <div className="flex-1 overflow-y-auto rounded-box border border-base-300 bg-base-200 p-6">
              <article className="max-w-none">
                <ReactMarkdown components={markdownComponents}>
                  {rules}
                </ReactMarkdown>
              </article>
            </div>
            <div className="modal-action">
              <button className="btn" onClick={() => setShowPreview(false)}>
                Back to Edit
              </button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => setShowPreview(false)}></div>
        </div>
      )}
    </div>
  )
}
