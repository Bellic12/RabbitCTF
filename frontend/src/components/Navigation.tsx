import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom'

import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { ADMIN_ROLE_ID } from './ProtectedRoute'
import EventTimer from './EventTimer'

export default function Navigation() {
  const { user, logout, isAuthenticated, isLoading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const { showToast } = useToast()

  const handleLogout = () => {
    logout()
    showToast('Logged out successfully', 'success')
    navigate('/')
  }

  const links = [
    { label: 'Home', to: '/', public: true },
    { label: 'Rules', to: '/rules', public: true },
    { label: 'Leaderboard', to: '/leaderboard', public: true },
    { label: 'Challenges', to: '/challenges', public: false },
    { label: 'Team', to: '/team', public: false, excludeAdmin: true },
    { label: 'Admin', to: '/admin', adminOnly: true },
  ]

  const visibleLinks = links.filter(link => {
    if (link.public) return true
    if (!isAuthenticated) return false
    if (link.adminOnly) return user?.role_id === ADMIN_ROLE_ID
    if (link.excludeAdmin && user?.role_id === ADMIN_ROLE_ID) return false
    return true
  })

  return (
    <header className="border-b border-white/5 bg-base-100/95 backdrop-blur relative z-50">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <div className="flex items-center gap-2 text-lg font-semibold text-white">
          <div className="dropdown md:hidden">
            <div tabIndex={0} role="button" className="btn btn-ghost btn-circle btn-sm text-white">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h7"
                />
              </svg>
            </div>
            <ul
              tabIndex={0}
              className="menu menu-sm dropdown-content bg-base-100 rounded-box z-10 mt-3 w-52 p-2 shadow"
            >
              {visibleLinks.map(link => (
                <li key={`mobile-${link.to}`}>
                  <NavLink
                    className={({ isActive }) =>
                      isActive ? 'text-primary' : 'text-white/80 hover:text-white'
                    }
                    end={link.to === '/'}
                    to={link.to}
                  >
                    {link.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
          <img src="/UqbarUN_Isotype.svg" alt="RabbitCTF Logo" className="h-8 w-8" />
          RabbitCTF
        </div>

        <nav className="hidden items-center gap-6 md:flex">
          {visibleLinks.map(link => (
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
          {location.pathname !== '/' && <EventTimer />}
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
                className="menu dropdown-content z-[50] mt-3 w-52 rounded-box bg-base-200 p-2 shadow-lg ring-1 ring-white/10"
              >
                <li>
                  <Link to="/profile" className="text-white hover:text-primary">
                    Profile
                  </Link>
                </li>
                <li>
                  <button onClick={handleLogout} className="text-error hover:bg-error/10">
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
