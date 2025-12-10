import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import RegisterPage from '../../src/pages/Register'
import { BrowserRouter } from 'react-router-dom'

const mockNavigate = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

// Mock child components
vi.mock('../../src/components/Navigation', () => ({
  default: () => <div data-testid="mock-navigation">Navigation</div>,
}))

vi.mock('../../src/components/Footer', () => ({
  default: () => <div data-testid="mock-footer">Footer</div>,
}))

global.fetch = vi.fn()

describe('RegisterPage Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('validates password complexity', async () => {
    render(
      <BrowserRouter>
        <RegisterPage />
      </BrowserRouter>
    )

    const usernameInput = screen.getByLabelText(/username/i)
    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/^password$/i)
    const confirmInput = screen.getByLabelText(/confirm password/i)
    const submitButton = screen.getByRole('button', { name: /register/i })

    fireEvent.change(usernameInput, { target: { value: 'newuser' } })
    fireEvent.change(emailInput, { target: { value: 'test@test.com' } })
    
    // Weak password (no uppercase, no digit)
    fireEvent.change(passwordInput, { target: { value: 'weakpass' } })
    fireEvent.change(confirmInput, { target: { value: 'weakpass' } })
    
    fireEvent.click(submitButton)

    expect(await screen.findByText(/password must contain at least one uppercase letter/i)).toBeInTheDocument()
  })

  it('validates password match', async () => {
    render(
      <BrowserRouter>
        <RegisterPage />
      </BrowserRouter>
    )

    const usernameInput = screen.getByLabelText(/username/i)
    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/^password$/i)
    const confirmInput = screen.getByLabelText(/confirm password/i)
    const submitButton = screen.getByRole('button', { name: /register/i })

    fireEvent.change(usernameInput, { target: { value: 'validuser' } })
    fireEvent.change(emailInput, { target: { value: 'valid@email.com' } })
    fireEvent.change(passwordInput, { target: { value: 'StrongPass1' } })
    fireEvent.change(confirmInput, { target: { value: 'StrongPass2' } })
    
    fireEvent.click(submitButton)

    expect(await screen.findByText(/passwords do not match/i)).toBeInTheDocument()
  })

  it('submits form successfully', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 1, username: 'newuser' }),
    })

    render(
      <BrowserRouter>
        <RegisterPage />
      </BrowserRouter>
    )

    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'newuser' } })
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@test.com' } })
    fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: 'StrongPass1' } })
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'StrongPass1' } })
    
    fireEvent.click(screen.getByRole('button', { name: /register/i }))

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('api/v1/auth/register'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            email: 'test@test.com',
            password: 'StrongPass1',
            password_confirm: 'StrongPass1',
            username: 'newuser'
          })
        })
      )
    })

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/login', expect.anything())
    })
  })
})
