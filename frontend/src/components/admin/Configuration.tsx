export default function Configuration() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold mb-4">Team Configuration</h3>
        <div className="form-control w-full">
          <label className="label">
            <span className="label-text">Maximum Team Size</span>
          </label>
          <input type="number" className="input input-bordered w-full" defaultValue="5" />
        </div>
      </div>

      <div className="divider"></div>

      <div>
        <h3 className="text-lg font-bold mb-4">Flag Submission Limits</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text">Max Attempts</span>
            </label>
            <input type="number" className="input input-bordered w-full" defaultValue="5" />
          </div>
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text">Time Window (seconds)</span>
            </label>
            <input type="number" className="input input-bordered w-full" defaultValue="60" />
          </div>
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text">Block Duration (minutes)</span>
            </label>
            <input type="number" className="input input-bordered w-full" defaultValue="5" />
          </div>
        </div>
      </div>

      <div className="divider"></div>

      <div>
        <h3 className="text-lg font-bold mb-4">Discord Integration</h3>
        <div className="form-control w-full mb-4">
          <label className="label">
            <span className="label-text">Webhook URL</span>
          </label>
          <input type="text" className="input input-bordered w-full" placeholder="https://discord.com/api/webhooks/..." />
        </div>
        <button className="btn btn-primary">Test Connection</button>
      </div>

      <div className="divider"></div>

      <div className="border border-error/20 rounded-lg p-6 bg-error/5">
        <h3 className="text-lg font-bold text-error mb-2">Danger Zone</h3>
        <p className="text-sm text-white/60 mb-4">Reset competition data. This action cannot be undone.</p>
        <button className="btn btn-error btn-outline btn-sm">Reset Competition</button>
      </div>
    </div>
  )
}
