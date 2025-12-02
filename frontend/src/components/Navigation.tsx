import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navigation() {
  const { user, logout, isAuthenticated, isLoading } = useAuth()
  const links = [
    { label: 'Home', to: '/' },
    { label: 'Challenges', to: '/challenges' },
    { label: 'Leaderboard', to: '/leaderboard' },
    { label: 'Rules', to: '/rules' },
    { label: 'Admin', to: '/admin' },
  ]

  return (
    <header className="border-b border-white/5 bg-base-100/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <div className="flex items-center gap-2 text-lg font-semibold text-white">
          <FlagIcon />
          RabbitCTF
        </div>

        <nav className="hidden items-center gap-6 md:flex">
          {links.map(link => (
            <NavLink
              className={({ isActive }) =>
                `text-sm font-medium transition-colors ${
                  isActive ? 'text-primary' : 'text-white/60 hover:text-white'
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
          {isLoading ? (
            <div className="h-8 w-20 animate-pulse rounded-full bg-white/5"></div>
          ) : isAuthenticated && user ? (
            <div className="dropdown dropdown-end">
              <div
                tabIndex={0}
                role="button"
                className="btn btn-ghost btn-sm gap-2 rounded-full border border-white/10 font-normal text-white hover:bg-white/5"
              >
                <span>{user.username}</span>
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
                className="menu dropdown-content z-[1] mt-3 w-52 rounded-box bg-base-200 p-2 shadow-lg ring-1 ring-white/10"
              >
                <li>
                  <Link to="/profile" className="text-white hover:text-primary">
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
                className="btn btn-sm rounded-full border-none bg-primary text-black hover:bg-secondary"
                to="/register"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

function FlagIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24">
      <path
        className="stroke-current"
        d="M6 4v16M6 4h11.2a1 1 0 01.8 1.6L16 9l2 2.4a1 1 0 01-.8 1.6H6"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.6}
      />
    </svg>
  )
}
