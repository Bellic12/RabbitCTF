import { useState } from 'react'

import { useAuth } from '../context/AuthContext'
import { api } from '../services/api'

type TeamCreateModalProps = {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function TeamCreateModal({ isOpen, onClose, onSuccess }: TeamCreateModalProps) {
  const { token } = useAuth()
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (!token) return

    if (password !== passwordConfirm) {
      setError('Passwords do not match')
      return
    }

    setIsLoading(true)
    setError('')
    try {
      await api.teams.create(token, { name, password, password_confirm: passwordConfirm })
      onSuccess()
      onClose()
    } catch (err) {
      setError('Failed to create team')
    } finally {
      setIsLoading(false)
    }
  }

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

        <h3 className="text-xl font-bold text-white">Create New Team</h3>
        <p className="mt-2 text-sm text-white/60">
          Fill in the details below to create your team. You'll be set as the team captain.
        </p>

        {error && <div className="mt-4 text-error text-sm">{error}</div>}

        <div className="mt-6 space-y-4">
          <div className="form-control w-full">
            <label className="label pb-2">
              <span className="label-text font-semibold text-white">Team Name</span>
            </label>
            <input
              type="text"
              placeholder="Enter your team name"
              className="input input-bordered w-full border-white/10 bg-base-300 text-white focus:border-primary focus:outline-none"
              value={name}
              onChange={e => setName(e.target.value)}
            />
            <label className="label">
              <span className="label-text-alt text-xs text-white/40">3-50 characters</span>
            </label>
          </div>

          <div className="form-control w-full">
            <label className="label pb-2">
              <span className="label-text font-semibold text-white">Team Password</span>
            </label>
            <input
              type="password"
              placeholder="Create a secure team password"
              className="input input-bordered w-full border-white/10 bg-base-300 text-white focus:border-primary focus:outline-none"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
            <label className="label">
              <span className="label-text-alt text-xs text-white/40">
                Required - Share this with team members to join
              </span>
            </label>
          </div>

          <div className="form-control w-full">
            <label className="label pb-2">
              <span className="label-text font-semibold text-white">Confirm Password</span>
            </label>
            <input
              type="password"
              placeholder="Confirm team password"
              className="input input-bordered w-full border-white/10 bg-base-300 text-white focus:border-primary focus:outline-none"
              value={passwordConfirm}
              onChange={e => setPasswordConfirm(e.target.value)}
            />
          </div>
        </div>

        <div className="mt-8 flex gap-3">
          <button
            className="btn btn-outline flex-1 border-white/10 text-white hover:bg-white/5 hover:border-white/20 rounded-md transition-all"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="btn btn-primary flex-1 text-primary-content rounded-md hover:brightness-75 transition-all border-none"
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="loading loading-spinner"></span>
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-5 h-5 mr-1"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Create Team
              </>
            )}
          </button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button onClick={onClose}>close</button>
      </form>
    </dialog>
  )
}
