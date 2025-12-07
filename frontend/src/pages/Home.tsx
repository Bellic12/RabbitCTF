import { Link } from 'react-router-dom'
import Navigation from '../components/Navigation'
import Footer from '../components/Footer'
import { useStats } from '../hooks/useStats'

export default function HomePage() {
  const { stats } = useStats()
  
  const statsDisplay = [
    { icon: TrophyIcon, label: 'Total Points', value: stats.totalPoints.toString() },
    { icon: ShieldIcon, label: 'Challenges', value: stats.challengesCount.toString() },
    { icon: TeamIcon, label: 'Teams Registered', value: stats.teamsCount.toString() },
  ]

  return (
    <div className="flex min-h-screen flex-col bg-base-100 text-white">
      <Navigation />

      <main className="flex-1 bg-base-100">
        <div className="mx-auto flex max-w-6xl flex-col gap-16 px-6 py-20 text-center">
          <section className="space-y-6">
            <h1 className="text-5xl font-bold">
              RabbitCTF <span className="text-primary">2025</span>
            </h1>
            <p className="text-lg text-white/60">
              Test your cybersecurity skills in our competitive capture the flag challenge platform
            </p>

            <div className="w-full rounded-box border border-white/10 bg-base-200 px-6 py-12 shadow-[0_35px_80px_-45px_rgba(0,0,0,0.9)] md:px-12">
              <div className="flex justify-center">
                <span className="rounded-full border border-white/10 bg-black/30 px-6 py-1 text-sm font-semibold text-white/70">
                  • Event Finished
                </span>
              </div>
              <div className="mt-8 flex flex-wrap justify-center gap-4">
                <Link
                  className="btn h-12 w-48 border-none bg-primary text-base font-semibold text-black hover:bg-secondary"
                  to="/challenges"
                >
                  View Challenges
                </Link>
                <Link
                  className="btn h-12 w-48 border border-white/20 bg-transparent text-base font-semibold text-white hover:bg-white/5"
                  to="/leaderboard"
                >
                  View Leaderboard
                </Link>
              </div>
            </div>
          </section>

          <section className="grid w-full gap-6 md:grid-cols-3">
            {statsDisplay.map(item => (
              <div
                className="rounded-box border border-white/10 bg-base-200 px-8 py-10 text-left shadow-[0_25px_60px_-45px_rgba(0,0,0,0.9)]"
                key={item.label}
              >
                <div className="flex items-center gap-3 text-primary">
                  <item.icon />
                  <span className="text-xs uppercase tracking-widest text-white/40">
                    {item.label}
                  </span>
                </div>
                <p className="mt-8 text-4xl font-bold">{item.value}</p>
              </div>
            ))}
          </section>
        </div>
      </main>

      <Footer />
    </div>
  )
}

function TrophyIcon() {
  return (
    <svg aria-hidden="true" className="h-6 w-6" fill="none" viewBox="0 0 24 24">
      <path
        className="stroke-current"
        d="M8 4h8v2.5a3.5 3.5 0 01-3 3.46V12h2a3 3 0 013 3v1h-4v3H10v-3H6v-1a3 3 0 013-3h2V9.96a3.5 3.5 0 01-3-3.46V4zM5 4h3v2H6a1 1 0 01-1-1V4zm11 0h3v1a1 1 0 01-1 1h-2V4z"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.4}
      />
    </svg>
  )
}

function ShieldIcon() {
  return (
    <svg aria-hidden="true" className="h-6 w-6" fill="none" viewBox="0 0 24 24">
      <path
        className="stroke-current"
        d="M12 3l7 3v5.9c0 4.5-3 8.6-7 9.8-4-1.2-7-5.3-7-9.8V6l7-3z"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.4}
      />
    </svg>
  )
}

function TeamIcon() {
  return (
    <svg aria-hidden="true" className="h-6 w-6" fill="none" viewBox="0 0 24 24">
      <path
        className="stroke-current"
        d="M9 7a4 4 0 118 0 4 4 0 01-8 0zm-4 14a7 7 0 0114 0H5zm-1-7a3 3 0 110-6 3 3 0 010 6zm16 0a3 3 0 110-6 3 3 0 010 6z"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.4}
      />
    </svg>
  )
}
