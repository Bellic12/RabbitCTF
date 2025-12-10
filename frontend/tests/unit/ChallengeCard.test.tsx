import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import ChallengeCard from '../../src/components/ChallengeCard'
import type { Challenge } from '../../src/types/challenge'

const mockChallenge: Challenge = {
  id: 1,
  title: 'Test Challenge',
  description: 'Description',
  points: 500,
  difficulty: 'Hard',
  category: 'Web',
  tags: ['sql', 'injection'],
  solves: 10,
  status: 'unsolved',
  files: [],
  hints: []
}

describe('ChallengeCard Component', () => {
  it('renders challenge details correctly', () => {
    render(<ChallengeCard challenge={mockChallenge} onClick={() => {}} />)
    
    expect(screen.getByText('Test Challenge')).toBeInTheDocument()
    expect(screen.getByText('500')).toBeInTheDocument()
    expect(screen.getByText('10 solves')).toBeInTheDocument()
    expect(screen.getByText('Hard')).toBeInTheDocument()
    expect(screen.getByText('sql')).toBeInTheDocument()
    expect(screen.getByText('injection')).toBeInTheDocument()
  })

  it('calls onClick handler when clicked', () => {
    const handleClick = vi.fn()
    render(<ChallengeCard challenge={mockChallenge} onClick={handleClick} />)
    
    const button = screen.getByRole('button')
    fireEvent.click(button)
    
    expect(handleClick).toHaveBeenCalledTimes(1)
    expect(handleClick).toHaveBeenCalledWith(mockChallenge)
  })

  it('applies solved styles when status is solved', () => {
    const solvedChallenge = { ...mockChallenge, status: 'solved' as const }
    render(<ChallengeCard challenge={solvedChallenge} onClick={() => {}} />)
    
    const button = screen.getByRole('button')
    expect(button).toHaveClass('border-emerald-500/40')
    expect(screen.getByText('Test Challenge').parentElement).toHaveClass('text-emerald-400')
  })
})
