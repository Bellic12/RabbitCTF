export default function EventSettings() {
  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-bold mb-4">Event Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text">Current Status</span>
            </label>
            <select className="select select-bordered bg-base-200 w-full max-w-xs">
              <option>Not Started</option>
              <option>Running</option>
              <option>Paused</option>
              <option>Ended</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text">Start Date & Time</span>
            </label>
            <input type="datetime-local" className="input input-bordered bg-base-200 w-full" defaultValue="2025-02-01T10:00" />
          </div>
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text">End Date & Time</span>
            </label>
            <input type="datetime-local" className="input input-bordered bg-base-200 w-full" defaultValue="2025-02-03T18:00" />
          </div>
        </div>
        <button className="btn btn-primary mt-6">Update Event Timing</button>
      </div>

      <div className="divider"></div>

      <div>
        <h3 className="text-lg font-bold mb-4">Rules & Guidelines</h3>
        <div className="form-control">
          <label className="label">
            <span className="label-text">Rules Content (Markdown supported)</span>
          </label>
          <textarea 
            className="textarea textarea-bordered h-48 font-mono text-sm" 
            placeholder="Enter competition rules in Markdown format..."
          ></textarea>
          <label className="label">
            <span className="label-text-alt text-white/40">Markdown formatting supported</span>
            <span className="label-text-alt text-white/40">0 / 10,000 characters</span>
          </label>
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
