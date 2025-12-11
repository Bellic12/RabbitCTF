import { useState, useEffect } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../services/api'

export default function Setup() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    // Check if setup is already completed
    checkSetupStatus()
  }, [])

  const checkSetupStatus = async () => {
    try {
      const data = await api.setup.status()
      if (data.is_setup_completed) {
        navigate('/login')
      }
    } catch (err) {
      console.error('Failed to check setup status', err)
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    if (password !== passwordConfirm) {
      setError('Passwords do not match')
      setIsLoading(false)
      return
    }

    try {
      await api.setup.admin({
        username,
        email,
        password,
        password_confirm: passwordConfirm,
      })
      // Setup successful
      navigate('/login', { state: { message: 'Administrator created successfully. Please login.' } })
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-base-100 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-primary">RabbitCTF</h1>
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-white">
            Initial Setup
          </h2>
          <p className="mt-2 text-sm text-white/60">
            Create the first administrator account to get started.
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="alert alert-error text-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <span>{error}</span>
            </div>
          )}
          
          <div className="space-y-4 rounded-md shadow-sm">
            <div>
              <label htmlFor="username" className="sr-only">Username</label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="input input-bordered w-full bg-base-200 focus:border-primary focus:outline-none"
                placeholder="Admin Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="email" className="sr-only">Email address</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="input input-bordered w-full bg-base-200 focus:border-primary focus:outline-none"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="input input-bordered w-full bg-base-200 focus:border-primary focus:outline-none"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password-confirm" className="sr-only">Confirm Password</label>
              <input
                id="password-confirm"
                name="password-confirm"
                type="password"
                required
                className="input input-bordered w-full bg-base-200 focus:border-primary focus:outline-none"
                placeholder="Confirm Password"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary w-full text-primary-content rounded-md hover:brightness-75 transition-all border-none"
            >
              {isLoading ? <span className="loading loading-spinner"></span> : 'Create Administrator'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
