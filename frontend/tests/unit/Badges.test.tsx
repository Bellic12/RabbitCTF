import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { DifficultyBadge, CategoryBadge } from '../../src/components/Badges'

describe('Badges Component', () => {
  describe('DifficultyBadge', () => {
    it('renders the correct text', () => {
      render(<DifficultyBadge difficulty="Easy" />)
      expect(screen.getByText('Easy')).toBeInTheDocument()
    })

    it('applies the correct class for Easy difficulty', () => {
      render(<DifficultyBadge difficulty="Easy" />)
      const badge = screen.getByText('Easy')
      expect(badge).toHaveClass('bg-emerald-500/10')
      expect(badge).toHaveClass('text-emerald-400')
    })

    it('applies the correct class for Hard difficulty', () => {
      render(<DifficultyBadge difficulty="Hard" />)
      const badge = screen.getByText('Hard')
      expect(badge).toHaveClass('bg-rose-500/10')
      expect(badge).toHaveClass('text-rose-400')
    })

    it('applies default class for unknown difficulty', () => {
      render(<DifficultyBadge difficulty="Unknown" />)
      const badge = screen.getByText('Unknown')
      expect(badge).toHaveClass('bg-white/10')
    })
  })

  describe('CategoryBadge', () => {
    it('renders the category name', () => {
      render(<CategoryBadge category="Web" />)
      expect(screen.getByText('Web')).toBeInTheDocument()
    })

    it('applies custom className', () => {
      render(<CategoryBadge category="Crypto" className="custom-class" />)
      const badge = screen.getByText('Crypto')
      expect(badge).toHaveClass('custom-class')
    })
  })
})
