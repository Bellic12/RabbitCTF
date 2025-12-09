import { useState } from 'react'

import Footer from '../components/Footer'
import Navigation from '../components/Navigation'
import TeamCreateModal from '../components/TeamCreateModal'
import TeamJoinModal from '../components/TeamJoinModal'

export default function TeamPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false)

  return (
    <div className="flex min-h-screen flex-col bg-base-100 text-white">
      <Navigation />

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-4xl space-y-12 text-center">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold">Team Management</h1>
            <p className="text-lg text-white/60">Create a new team or join an existing one</p>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            {/* Create Team Card */}
            <div className="card bg-base-200 border border-white/5 p-8 hover:border-primary/50 transition-colors">
              <div className="flex flex-col items-center gap-6">
                <div className="h-16 w-16 rounded-full bg-base-300 flex items-center justify-center text-primary">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-8 h-8"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold">Create Team</h2>
                  <p className="text-white/60">Start a new team and invite your friends</p>
                </div>
                <button
                  className="btn btn-primary w-full mt-4"
                  onClick={() => setIsCreateModalOpen(true)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5 mr-2"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  Create Team
                </button>
              </div>
            </div>

            {/* Join Team Card */}
            <div className="card bg-base-200 border border-white/5 p-8 hover:border-primary/50 transition-colors">
              <div className="flex flex-col items-center gap-6">
                <div className="h-16 w-16 rounded-full bg-base-300 flex items-center justify-center text-primary">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-8 h-8"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                    />
                  </svg>
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold">Join Team</h2>
                  <p className="text-white/60">Join an existing team with a password</p>
                </div>
                <button
                  className="btn btn-outline w-full mt-4"
                  onClick={() => setIsJoinModalOpen(true)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5 mr-2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                    />
                  </svg>
                  Join Team
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <TeamCreateModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />
      <TeamJoinModal isOpen={isJoinModalOpen} onClose={() => setIsJoinModalOpen(false)} />

      <Footer />
    </div>
  )
}
