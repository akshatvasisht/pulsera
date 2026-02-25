import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import Home from './page'

describe('Home Page', () => {
  it('renders the main heading', () => {
    render(<Home />)
    expect(screen.getByText(/Your family circle/i)).toBeInTheDocument()
  })

  it('renders the Try Now button', () => {
    render(<Home />)
    const button = screen.getByRole('link', { name: /Try Now/i })
    expect(button).toBeInTheDocument()
    expect(button).toHaveAttribute('href', '/dashboard')
  })

  it('renders the tagline', () => {
    render(<Home />)
    expect(screen.getByText(/Wearable Care for Families/i)).toBeInTheDocument()
  })
})
