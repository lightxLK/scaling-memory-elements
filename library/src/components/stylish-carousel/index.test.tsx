import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import StylishCarousel from './index'

const items = [
  { src: '/fixtures/one.jpg', title: 'One' },
  { src: '/fixtures/two.jpg', title: 'Two' },
  { src: '/fixtures/three.jpg', title: 'Three' },
]

describe('StylishCarousel', () => {
  it('renders its labeled region with the fixture slides', () => {
    render(<StylishCarousel items={items} />)
    expect(screen.getByRole('region', { name: 'Stylish Carousel' })).toBeInTheDocument()
  })
})
