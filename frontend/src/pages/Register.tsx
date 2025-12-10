import { type FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import Footer from '../components/Footer'
import Navigation from '../components/Navigation'

type ErrorResponse = {
  detail?: string
}

export default function RegisterPage() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')

    if (username.length < 3) {
      setError('Username must be at least 3 characters long')
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long')
      return
    }

    if (!/[A-Z]/.test(password)) {
      setError('Password must contain at least one uppercase letter')
      return
    }

    if (!/[0-9]/.test(password)) {
      setError('Password must contain at least one digit')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    // # Registration example

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || ''}api/v1/auth/register`, {
        body: JSON.stringify({ email, password, password_confirm: confirmPassword, username }),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      })

      if (!response.ok) {
        const payload = (await response.json().catch(() => ({}))) as ErrorResponse
        setError(payload.detail ?? 'Unable to create the account')
        return
      }

      void navigate('/login', { state: { registrationSuccess: true } })
    } catch {
      setError('Unable to reach the registration service')
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-base-100">
      <Navigation />
      <div className="flex flex-1 items-center justify-center px-6 py-16 md:px-10">
        <div className="w-full max-w-xl rounded-[32px] border border-white/10 bg-base-200 px-8 py-12 text-white shadow-[0_35px_80px_-45px_rgba(0,0,0,0.9)] md:px-12">
          <div className="text-center">
            <div className="mb-8 flex items-center justify-center gap-4 text-3xl font-semibold text-white">
              <FlagIcon />
              RabbitCTF
            </div>

            <h1 className="text-4xl font-bold">Register</h1>
            <p className="mt-2 text-sm text-white/60">Create an account to join the competition</p>
          </div>

          <form className="mt-10 space-y-6" onSubmit={e => void handleSubmit(e)}>
            <div className="text-left">
              <label className="text-sm font-semibold text-white/70" htmlFor="username">
                Username
              </label>
              <input
                id="username"
                className="mt-2 h-12 w-full rounded-2xl border border-white/15 bg-base-300 px-4 text-white transition focus:border-primary focus:outline-none"
                onChange={event => setUsername(event.target.value)}
                placeholder="Choose a username"
                required
                type="text"
                value={username}
              />
            </div>

            <div className="text-left">
              <label className="text-sm font-semibold text-white/70" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                className="mt-2 h-12 w-full rounded-2xl border border-white/15 bg-base-300 px-4 text-white transition focus:border-primary focus:outline-none"
                onChange={event => setEmail(event.target.value)}
                placeholder="your.email@example.com"
                required
                type="email"
                value={email}
              />
            </div>

            <div className="text-left">
              <label className="text-sm font-semibold text-white/70" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                className="mt-2 h-12 w-full rounded-2xl border border-white/15 bg-base-300 px-4 text-white transition focus:border-primary focus:outline-none"
                onChange={event => setPassword(event.target.value)}
                placeholder="Create a password"
                required
                type="password"
                value={password}
              />
            </div>

            <div className="text-left">
              <label className="text-sm font-semibold text-white/70" htmlFor="confirmPassword">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                className="mt-2 h-12 w-full rounded-2xl border border-white/15 bg-base-300 px-4 text-white transition focus:border-primary focus:outline-none"
                onChange={event => setConfirmPassword(event.target.value)}
                placeholder="Confirm your password"
                required
                type="password"
                value={confirmPassword}
              />
            </div>

            {error.length > 0 && (
              <div className="flex items-center gap-3 rounded-2xl border border-error-content bg-error px-4 py-3 text-sm text-error-content">
                <AlertIcon />
                <span>{error}</span>
              </div>
            )}

            <button
              className="btn h-12 w-full rounded-full border-none bg-primary text-base font-semibold text-black hover:bg-secondary"
              type="submit"
            >
              Register
            </button>
          </form>

          <div className="mt-10 text-center text-sm text-white/60">
            Already have an account?{' '}
            <Link className="text-primary hover:underline" to="/login">
              Login here
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

function FlagIcon() {
  return (
    <svg aria-hidden="true" className="h-11 w-11 text-primary" fill="none" viewBox="0 0 24 24">
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
