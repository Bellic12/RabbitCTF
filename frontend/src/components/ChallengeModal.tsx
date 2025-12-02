import { useState } from 'react'
import type { Challenge } from '../types/challenge'

interface ChallengeModalProps {
  challenge: Challenge
  onClose: () => void
}

export default function ChallengeModal({ challenge, onClose }: ChallengeModalProps) {
  const [tab, setTab] = useState<'details' | 'history'>('details')

  return (
    <dialog className="modal modal-open">
      <div className="modal-box w-11/12 max-w-2xl border border-white/10 bg-[#061120] text-white p-0 overflow-hidden">
        {/* Header / Close Button */}
        <div className="relative p-8 pb-0">
          <button
            aria-label="Close"
            className="btn btn-sm btn-circle absolute right-6 top-6 border border-white/10 bg-[#040d1a] text-white hover:border-[#0edbc5] hover:text-[#0edbc5]"
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
              <span className="text-[#0edbc5]">{challenge.points} points</span>
              <span className="text-white/40">{challenge.solves} solves</span>
            </div>

            <h2 className="text-2xl font-bold">{challenge.title}</h2>
          </div>

          <div className="mt-6 flex gap-6 border-b border-white/10 text-sm font-medium text-white/60">
            <button
              className={`pb-3 transition ${tab === 'details' ? 'border-b-2 border-[#0edbc5] text-white' : 'hover:text-white'}`}
              onClick={() => setTab('details')}
              type="button"
            >
              Challenge Details
            </button>
            <button
              className={`pb-3 transition ${tab === 'history' ? 'border-b-2 border-[#0edbc5] text-white' : 'hover:text-white'}`}
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
                          className="btn btn-sm rounded-full border-none bg-[#0edbc5] text-black hover:bg-[#10f0d6]"
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
                <form className="flex flex-col gap-3 md:flex-row">
                  <input
                    className="h-12 flex-1 rounded-2xl border border-white/15 bg-[#040d1a] px-4 text-sm text-white focus:border-[#0edbc5] focus:outline-none"
                    placeholder="flag{...}"
                    type="text"
                  />
                  <button
                    className="btn h-12 rounded-full border-none bg-[#0edbc5] px-6 text-sm font-semibold text-black hover:bg-[#10f0d6]"
                    type="submit"
                  >
                    Submit
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
                      <span className="text-[#0edbc5]">{entry.points} pts</span>
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
