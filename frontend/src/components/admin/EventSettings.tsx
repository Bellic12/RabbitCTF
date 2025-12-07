import { useState } from 'react'

export default function EventSettings() {
  const [rules, setRules] = useState('')

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
              className="textarea textarea-bordered h-48 w-full font-mono text-sm pb-8" 
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
        <div className="flex gap-2 mt-4">
          <button className="btn btn-primary">Save Rules</button>
          <button className="btn btn-outline">Preview</button>
          <button className="btn btn-outline">View History</button>
        </div>
      </div>
    </div>
  )
}
