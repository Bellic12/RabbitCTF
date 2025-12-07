interface TeamJoinModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function TeamJoinModal({ isOpen, onClose }: TeamJoinModalProps) {
  if (!isOpen) return null

  return (
    <dialog className="modal modal-open">
      <div className="modal-box w-full max-w-md border border-white/10 bg-base-200 p-6 text-left">
        <button
          className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 text-white/60 hover:text-white"
          onClick={onClose}
        >
          ✕
        </button>
        
        <h3 className="text-xl font-bold text-white">Join Team</h3>
        <p className="mt-2 text-sm text-white/60">
          Enter the team password provided by your team captain to join their team.
        </p>

        <div className="mt-6 space-y-4">
          <div className="form-control w-full">
            <label className="label pb-2">
              <span className="label-text font-semibold text-white">Team Password</span>
            </label>
            <input
              type="password"
              placeholder="Enter the team password"
              className="input input-bordered w-full border-white/10 bg-base-300 text-white focus:border-primary focus:outline-none"
            />
          </div>
        </div>

        <div className="mt-8 flex gap-3">
          <button className="btn btn-outline flex-1 border-white/10 text-white hover:bg-white/5 hover:border-white/20" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-primary flex-1 text-black">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 mr-1">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
            </svg>
            Join Team
          </button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button onClick={onClose}>close</button>
      </form>
    </dialog>
  )
}
