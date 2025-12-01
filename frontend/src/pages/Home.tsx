import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Example stats, later to be fetched from the backend and database

const stats = [
  { icon: TrophyIcon, label: 'Total Points', value: '250' },
  { icon: ShieldIcon, label: 'Challenges', value: '42' },
  { icon: TeamIcon, label: 'Teams Registered', value: '128' },
];

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#04090f] text-white">
      <Navigation />

      <main className="flex-1 bg-[#04090f]">
        <div className="mx-auto flex max-w-6xl flex-col gap-16 px-6 py-20 text-center">
          <section className="space-y-6">
            <h1 className="text-5xl font-bold">
              RabbitCTF <span className="text-[#0edbc5]">2025</span>
            </h1>
            <p className="text-lg text-white/60">
              Test your cybersecurity skills in our competitive capture the flag challenge platform
            </p>

            <div className="w-full rounded-[34px] border border-white/10 bg-[#061120] px-6 py-12 shadow-[0_35px_80px_-45px_rgba(0,0,0,0.9)] md:px-12">
              <div className="flex justify-center">
                <span className="rounded-full border border-white/10 bg-black/30 px-6 py-1 text-sm font-semibold text-white/70">
                  • Event Finished
                </span>
              </div>
              <div className="mt-8 flex flex-wrap justify-center gap-4">
                <Link
                  className="btn h-12 w-48 rounded-full border-none bg-[#0edbc5] text-base font-semibold text-black hover:bg-[#10f0d6]"
                  to="/challenges"
                >
                  View Challenges
                </Link>
                <Link
                  className="btn h-12 w-48 rounded-full border border-white/20 bg-transparent text-base font-semibold text-white hover:bg-white/5"
                  to="/leaderboard"
                >
                  View Leaderboard
                </Link>
              </div>
            </div>
          </section>

          <section className="grid w-full gap-6 md:grid-cols-3">
            {stats.map((item) => (
              <div
                className="rounded-[28px] border border-white/10 bg-[#061120] px-8 py-10 text-left shadow-[0_25px_60px_-45px_rgba(0,0,0,0.9)]"
                key={item.label}
              >
                <div className="flex items-center gap-3 text-[#0edbc5]">
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

      <footer className="border-t border-white/5 bg-[#03070d] py-6 text-center text-xs text-white/50">
        RabbitCTF 2025 – Powered by Equipo Alfa Buena Maravilla Onda Dinamita Escuadrón Lobo
      </footer>
    </div>
  );
}

function Navigation() {
  const { user, logout, isAuthenticated } = useAuth();
  const links = [
    { label: 'Home', to: '/' },
    { label: 'Challenges', to: '/challenges' },
    { label: 'Leaderboard', to: '/leaderboard' },
    { label: 'Rules', to: '/rules' },
    { label: 'Admin', to: '/admin' },
  ];

  return (
    <header className="border-b border-white/5 bg-[#03070d]/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <div className="flex items-center gap-2 text-lg font-semibold text-white">
          <FlagIcon />
          RabbitCTF
        </div>

        <nav className="hidden items-center gap-6 md:flex">
          {links.map((link) => (
            <NavLink
              className={({ isActive }) =>
                `text-sm font-medium transition-colors ${
                  isActive ? 'text-[#0edbc5]' : 'text-white/60 hover:text-white'
                }`
              }
              end={link.to === '/'}
              key={link.to}
              to={link.to}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {isAuthenticated && user ? (
            <div className="dropdown dropdown-end">
              <div
                tabIndex={0}
                role="button"
                className="btn btn-ghost btn-sm gap-2 rounded-full border border-white/10 font-normal text-white hover:bg-white/5"
              >
                {user.username}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4 opacity-50"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </div>
              <ul
                tabIndex={0}
                className="menu dropdown-content z-[1] mt-3 w-52 rounded-box bg-[#061120] p-2 shadow-lg ring-1 ring-white/10"
              >
                <li>
                  <Link to="/profile" className="text-white hover:text-[#0edbc5]">
                    Profile
                  </Link>
                </li>
                <li>
                  <button onClick={logout} className="text-error hover:bg-error/10">
                    Logout
                  </button>
                </li>
              </ul>
            </div>
          ) : (
            <>
              <Link
                className="btn btn-sm rounded-full border border-white/20 bg-transparent text-white hover:bg-white/5"
                to="/login"
              >
                Login
              </Link>
              <Link
                className="btn btn-sm rounded-full border-none bg-[#0edbc5] text-black hover:bg-[#10f0d6]"
                to="/register"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

function FlagIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5 text-[#0edbc5]" fill="none" viewBox="0 0 24 24">
      <path
        className="stroke-current"
        d="M6 4v16M6 4h11.2a1 1 0 01.8 1.6L16 9l2 2.4a1 1 0 01-.8 1.6H6"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.6}
      />
    </svg>
  );
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
  );
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
  );
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
  );
}
