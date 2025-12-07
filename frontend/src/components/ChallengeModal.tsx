import { useState } from 'react'
import type { FormEvent } from 'react'
import type { Challenge } from '../types/challenge'

interface ChallengeModalProps {
  challenge: Challenge
  onClose: () => void
}

interface SubmissionResponse {
  is_correct: boolean
  score_awarded: number
  message: string
  status: string
  is_first_blood: boolean
}

export default function ChallengeModal({ challenge, onClose }: ChallengeModalProps) {
  const [tab, setTab] = useState<'details' | 'history'>('details')
  const [flagValue, setFlagValue] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submissionResult, setSubmissionResult] = useState<SubmissionResponse | null>(null)
  const [error, setError] = useState('')

  const handleSubmitFlag = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setSubmissionResult(null)

    if (!flagValue.trim()) {
      setError('Please enter a flag')
      return
    }

    setIsSubmitting(true)

    try {
      const token = localStorage.getItem('token')

      if (!token) {
        setError('You must be logged in to submit flags')
        setIsSubmitting(false)
        return
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL || ''}/api/v1/submissions/submit`,
        {
          body: JSON.stringify({
            challenge_id: challenge.id,
            submitted_flag_hash: flagValue,
          }),
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          method: 'POST',
        }
      )

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}))
        setError(payload.detail ?? 'Failed to submit flag')
        setIsSubmitting(false)
        return
      }

      const data = await response.json()
      setSubmissionResult(data)

      if (data.is_correct) {
        setFlagValue('')
      }
    } catch (caught) {
      setError('Unable to reach the submission service')
      console.error('Flag submission failed', caught)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <dialog className="modal modal-open">
      <div className="modal-box w-11/12 max-w-2xl border border-white/10 bg-base-200 text-base-content p-0 overflow-hidden">
        {/* Header / Close Button */}
        <div className="relative p-8 pb-0">
          <button
            aria-label="Close"
            className="btn btn-sm btn-circle absolute right-6 top-6 border border-white/10 bg-base-300 text-white hover:border-primary hover:text-primary"
            onClick={onClose}
            type="button"
          >
            ×
          </button>

          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm font-semibold text-white/70">
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  challenge.difficulty === 'Easy'
                    ? 'bg-emerald-500/10 text-emerald-400'
                    : challenge.difficulty === 'Medium'
                      ? 'bg-amber-500/10 text-amber-400'
                      : 'bg-rose-500/10 text-rose-400'
                }`}
              >
                {challenge.difficulty}
              </span>
              <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1 text-xs uppercase tracking-wide text-white/60">
                {challenge.category}
              </span>
              <span className="text-primary">{challenge.points} points</span>
              <span className="text-white/40">{challenge.solves} solves</span>
            </div>

            <h2 className="text-2xl font-bold">{challenge.title}</h2>
          </div>

          <div className="mt-6 flex gap-6 border-b border-white/10 text-sm font-medium text-white/60">
            <button
              className={`pb-3 transition ${tab === 'details' ? 'border-b-2 border-primary text-white' : 'hover:text-white'}`}
              onClick={() => setTab('details')}
              type="button"
            >
              Challenge Details
            </button>
            <button
              className={`pb-3 transition ${tab === 'history' ? 'border-b-2 border-primary text-white' : 'hover:text-white'}`}
              onClick={() => setTab('history')}
              type="button"
            >
              Solve History ({challenge.solveHistory?.length ?? 0})
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 pt-0">
          {tab === 'details' ? (
            <div className="mt-6 space-y-6 text-sm text-white/70">
              <section>
                <h3 className="text-sm font-semibold uppercase tracking-wide text-white/50">
                  Description
                </h3>
                <p className="mt-2 text-white/70">{challenge.description}</p>
              </section>

              {challenge.tags.length > 0 && (
                <section>
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-white/50">
                    Tags
                  </h3>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {challenge.tags.map(tag => (
                      <span
                        className="rounded-full border border-white/10 bg-black/30 px-3 py-1 text-xs text-white/60"
                        key={tag}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </section>
              )}

              {challenge.files && challenge.files.length > 0 && (
                <section className="space-y-3">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-white/50">
                    Files
                  </h3>
                  <div className="rounded-2xl border border-white/10 bg-black/20">
                    {challenge.files.map(file => (
                      <div
                        className="flex items-center justify-between gap-4 px-4 py-3 text-white/70"
                        key={file.name}
                      >
                        <div className="space-y-1">
                          <p className="text-sm text-white">{file.name}</p>
                          <p className="text-xs text-white/40">{file.size}</p>
                        </div>
                        <a
                          className="btn btn-sm rounded-full border-none bg-primary text-black hover:bg-secondary"
                          href={file.url}
                        >
                          Download
                        </a>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {challenge.connectionInfo && (
                <section className="space-y-3">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-white/50">
                    Connection Info
                  </h3>
                  <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/30 px-4 py-3">
                    <code className="flex-1 text-sm text-white/80">{challenge.connectionInfo}</code>
                    <button
                      className="btn btn-sm rounded-full border-none bg-white/10 text-white hover:bg-white/20"
                      onClick={() => navigator.clipboard.writeText(challenge.connectionInfo ?? '')}
                      type="button"
                    >
                      Copy
                    </button>
                  </div>
                </section>
              )}

              <section className="space-y-3">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-white/50">
                  Submit Flag
                </h3>

                {/* Success Alert */}
                {submissionResult?.is_correct && (
                  <div className="flex items-center gap-3 rounded-2xl border border-emerald-500/50 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
                    <SuccessIcon />
                    <div>
                      <p className="font-semibold">{submissionResult.message}</p>
                      {submissionResult.is_first_blood && (
                        <p className="text-xs mt-1">🩸 First Blood!</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Incorrect Alert */}
                {submissionResult && !submissionResult.is_correct && (
                  <div className="flex items-center gap-3 rounded-2xl border border-rose-500/50 bg-rose-500/10 px-4 py-3 text-sm text-rose-400">
                    <AlertIcon />
                    <span>{submissionResult.message}</span>
                  </div>
                )}

                {/* Error Alert */}
                {error.length > 0 && (
                  <div className="flex items-center gap-3 rounded-2xl border border-error-content bg-error px-4 py-3 text-sm text-error-content">
                    <AlertIcon />
                    <span>{error}</span>
                  </div>
                )}

                <form className="flex flex-col gap-3 md:flex-row" onSubmit={handleSubmitFlag}>
                  <input
                    className="h-12 flex-1 rounded-2xl border border-white/15 bg-base-300 px-4 text-sm text-white focus:border-primary focus:outline-none disabled:opacity-50"
                    disabled={isSubmitting}
                    onChange={event => setFlagValue(event.target.value)}
                    placeholder="flag{...}"
                    type="text"
                    value={flagValue}
                  />
                  <button
                    className="btn h-12 rounded-full border-none bg-primary px-6 text-sm font-semibold text-black hover:bg-secondary disabled:opacity-50"
                    disabled={isSubmitting}
                    type="submit"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit'}
                  </button>
                </form>
              </section>
            </div>
          ) : (
            <div className="mt-6 space-y-3">
              {challenge.solveHistory && challenge.solveHistory.length > 0 ? (
                <div className="space-y-3">
                  {challenge.solveHistory.map((entry, index) => (
                    <div
                      className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/70"
                      key={`${entry.team}-${index}`}
                    >
                      <div>
                        <p className="text-sm font-semibold text-white">{entry.team}</p>
                        <p className="text-xs text-white/40">{entry.submittedAt}</p>
                      </div>
                      <span className="text-primary">{entry.points} pts</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-white/10 bg-black/20 p-6 text-center text-white/50">
                  No solves have been recorded yet.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button onClick={onClose}>close</button>
      </form>
    </dialog>
  )
}

function AlertIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        className="stroke-current"
        d="M12 8v5m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.6}
      />
    </svg>
  )
}

function SuccessIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        className="stroke-current"
        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.6}
      />
    </svg>
  )
}
