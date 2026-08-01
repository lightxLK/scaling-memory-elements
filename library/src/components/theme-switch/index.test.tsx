import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import Switch from './index'

describe('Switch', () => {
  it('renders the checkbox input that drives the toggle', () => {
    render(<Switch />)
    expect(screen.getByRole('checkbox', { hidden: true })).toBeInTheDocument()
  })
})
