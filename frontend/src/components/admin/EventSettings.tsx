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
    fetchRules()
  }, [])

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
            <input type="datetime-local" className="input input-bordered w-full" defaultValue="2025-02-01T10:00" />
          </label>
          <label className="form-control w-full">
            <div className="label">
              <span className="label-text">End Date & Time</span>
            </div>
            <input type="datetime-local" className="input input-bordered w-full" defaultValue="2025-02-03T18:00" />
          </label>
        </div>
        <button className="btn btn-primary mt-6">Update Event Timing</button>
      </div>

      <div className="divider"></div>

      <div>
        <h3 className="text-lg font-bold mb-4">
          Rules & Guidelines <span className="font-bold italic text-white/40 ml-2 text-base">(Markdown supported)</span>
        </h3>
        <div className="form-control w-full">
          <div className="relative w-full">
            <textarea 
              className="textarea textarea-bordered h-96 w-full font-mono text-sm pb-8" 
              placeholder="Enter competition rules in Markdown format..."
              value={rules}
              onChange={(e) => setRules(e.target.value)}
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
