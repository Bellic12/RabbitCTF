import { useState, useEffect } from 'react'
import type { FormEvent } from 'react'

import type { Challenge } from '../types/challenge'

type ChallengeModalProps = {
  challenge: Challenge
  onClose: () => void
  onSuccess: () => void
}

type SubmissionResponse = {
  is_correct: boolean
  score_awarded: number
  message: string
  status: string
  is_first_blood: boolean
}

interface ChallengeFile {
  id: number
  name: string
  size: string
  type: string
  url: string
}

const buildDownload = async (fileUrl: string, fileName: string) => {
  const token = localStorage.getItem('token')
  if (!token) {
    throw new Error('Not authenticated')
  }

  const res = await fetch(`${import.meta.env.VITE_API_URL || ''}${fileUrl}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })

  if (!res.ok) {
    throw new Error('Download failed')
  }

  const blob = await res.blob()
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  document.body.appendChild(a)
  a.click()
  a.remove()
  window.URL.revokeObjectURL(url)
}

export default function ChallengeModal({ challenge, onClose, onSuccess }: ChallengeModalProps) {
  const [tab, setTab] = useState<'details' | 'history'>('details')
  const [flagValue, setFlagValue] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submissionResult, setSubmissionResult] = useState<SubmissionResponse | null>(null)
  const [error, setError] = useState('')
  const [files, setFiles] = useState<ChallengeFile[]>([])
  const [isLoadingFiles, setIsLoadingFiles] = useState(true)

  useEffect(() => {
    fetchChallengeFiles()
  }, [challenge.id])

  const fetchChallengeFiles = async () => {
    setIsLoadingFiles(true)
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const response = await fetch(
        `${import.meta.env.VITE_API_URL || ''}/api/v1/challenges/${challenge.id}/files`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )

      if (response.ok) {
        const data = await response.json()
        setFiles(data)
      }
    } catch (error) {
      console.error('Failed to fetch challenge files:', error)
    } finally {
      setIsLoadingFiles(false)
    }
  }

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
            submitted_flag: flagValue,
          }),
          headers: {
            Authorization: `Bearer ${token}`,
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
        onSuccess()
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

        <div className="p-8 pt-0">
          {tab === 'details' ? (
            <div className="mt-6 space-y-6 text-sm text-white/70">
              <section>
                <h3 className="text-sm font-semibold uppercase tracking-wide text-white/50">
                  Description
                </h3>
                <p className="mt-2 text-white/70">{challenge.description}</p>
              </section>

              {challenge.tags && challenge.tags.length > 0 && (
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

              {(files.length > 0 || isLoadingFiles) && (
                <section className="space-y-3">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-white/50">
                    Files
                  </h3>
                  <div className="rounded-2xl border border-white/10 bg-black/20">
                    {isLoadingFiles ? (
                      <div className="flex items-center justify-center px-4 py-6">
                        <span className="loading loading-spinner loading-md text-primary"></span>
                      </div>
                    ) : files.length > 0 ? (
                      files.map((file, index) => (
                        <div
                          className={`flex items-center justify-between gap-4 px-4 py-3 text-white/70 ${
                            index < files.length - 1 ? 'border-b border-white/10' : ''
                          }`}
                          key={file.id}
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <div className="space-y-1 min-w-0">
                              <p className="text-sm text-white truncate">{file.name}</p>
                              <p className="text-xs text-white/40">{file.size}</p>
                            </div>
                          </div>
                          <button
                            className="btn btn-sm rounded-full border-none bg-primary text-black hover:bg-secondary flex-shrink-0"
                            onClick={async () => {
                              try {
                                await buildDownload(file.url, file.name)
                              } catch (err) {
                                console.error('Download failed', err)
                                setError('Unable to download file. Are you logged in?')
                              }
                            }}
                            type="button"
                          >
                            Download
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-3 text-center text-white/40 text-sm">
                        No files available
                      </div>
                    )}
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

                {challenge.status === 'solved' ? (
                  <div className="flex items-center gap-6 rounded-2xl border border-emerald-500/50 bg-emerald-500/10 px-6 py-6 text-emerald-400">
                    <div className="flex-1">
                      <h4 className="text-xl font-bold">Challenge Solved!</h4>
                      <p className="mt-1 text-base opacity-90">
                        {challenge.solvedBy 
                          ? `Solved by ${challenge.solvedBy}` 
                          : 'Your team has already solved this challenge.'}
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
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

                    {submissionResult && !submissionResult.is_correct && (
                      <div className="flex items-center gap-3 rounded-2xl border border-rose-500/50 bg-rose-500/10 px-4 py-3 text-sm text-rose-400">
                        <AlertIcon />
                        <span>{submissionResult.message}</span>
                      </div>
                    )}

                    {error.length > 0 && (
                      <div className="flex items-center gap-3 rounded-2xl border border-error-content bg-error px-4 py-3 text-sm text-error-content">
                        <AlertIcon />
                        <span>{error}</span>
                      </div>
                    )}

                    {!submissionResult?.is_correct && (
                      <div className="flex flex-col gap-3 md:flex-row">
                        <input
                          className="h-12 flex-1 rounded-2xl border border-white/15 bg-base-300 px-4 text-sm text-white focus:border-primary focus:outline-none disabled:opacity-50"
                          disabled={isSubmitting}
                          onChange={event => setFlagValue(event.target.value)}
                          placeholder="flag{...}"
                          type="text"
                          value={flagValue}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !isSubmitting) {
                              handleSubmitFlag(e as any)
                            }
                          }}
                        />
                        <button
                          className="btn h-12 rounded-full border-none bg-primary px-6 text-sm font-semibold text-black hover:bg-secondary disabled:opacity-50"
                          disabled={isSubmitting}
                          type="button"
                          onClick={(e) => handleSubmitFlag(e as any)}
                        >
                          {isSubmitting ? 'Submitting...' : 'Submit'}
                        </button>
                      </div>
                    )}
                  </>
                )}
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
      <div className="modal-backdrop bg-black/50" onClick={onClose}></div>
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

function SuccessIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12l2 4 4-6m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  )
}
