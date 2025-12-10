import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import LoginPage from '../../src/pages/Login'
import { BrowserRouter } from 'react-router-dom'

// Mock hooks
const mockLogin = vi.fn()
const mockNavigate = vi.fn()

// Mock child components to avoid context dependencies (like ToastProvider)
vi.mock('../../src/components/Navigation', () => ({
  default: () => <div data-testid="mock-navigation">Navigation</div>,
}))

vi.mock('../../src/components/Footer', () => ({
  default: () => <div data-testid="mock-footer">Footer</div>,
}))

vi.mock('../../src/context/AuthContext', () => ({
  useAuth: () => ({
    login: mockLogin,
  }),
}))

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ state: null }),
  }
})

// Mock fetch
global.fetch = vi.fn()

describe('LoginPage Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders login form', () => {
    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    )
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument()
  })

  it('shows error on empty submission or short username', async () => {
    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    )
    
    const usernameInput = screen.getByLabelText(/username/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: /login/i })

    // Fill with short username to bypass 'required' but trigger length check
    fireEvent.change(usernameInput, { target: { value: 'ab' } })
    fireEvent.change(passwordInput, { target: { value: 'pass' } })
    
    fireEvent.click(submitButton)

    expect(await screen.findByText(/invalid username or password/i)).toBeInTheDocument()
  })

  it('calls login API and redirects on success', async () => {
    // Mock successful API response
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ access_token: 'fake-token', token_type: 'bearer' }),
    })

    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    )

    const usernameInput = screen.getByLabelText(/username/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: /login/i })

    fireEvent.change(usernameInput, { target: { value: 'testuser' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/auth/login'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ password: 'password123', username: 'testuser' }),
        })
      )
    })

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('fake-token')
    })
  })

  it('displays error message on API failure', async () => {
    // Mock failed API response
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ detail: 'Wrong credentials' }),
    })

    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    )

    const usernameInput = screen.getByLabelText(/username/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: /login/i })

    fireEvent.change(usernameInput, { target: { value: 'wronguser' } })
    fireEvent.change(passwordInput, { target: { value: 'wrongpass' } })
    fireEvent.click(submitButton)

    expect(await screen.findByText('Wrong credentials')).toBeInTheDocument()
    expect(mockLogin).not.toHaveBeenCalled()
  })
})
