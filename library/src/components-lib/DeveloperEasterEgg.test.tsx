import { render, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { DeveloperEasterEgg } from './DeveloperEasterEgg'

function pressAltShift(code: string) {
  fireEvent.keyDown(window, { code, altKey: true, shiftKey: true })
}

describe('DeveloperEasterEgg', () => {
  let openSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    openSpy = vi.spyOn(window, 'open').mockImplementation(() => null)
  })

  afterEach(() => {
    openSpy.mockRestore()
  })

  it('opens the author site on Alt+Shift+L+K', () => {
    render(<DeveloperEasterEgg />)
    pressAltShift('KeyL')
    pressAltShift('KeyK')
    expect(openSpy).toHaveBeenCalledWith('https://lightxlk.github.io/', '_blank', 'noopener,noreferrer')
  })

  it('does not fire on Alt+Shift+L alone', () => {
    render(<DeveloperEasterEgg />)
    pressAltShift('KeyL')
    expect(openSpy).not.toHaveBeenCalled()
  })

  it('does not fire while focus is inside an input', () => {
    const { container } = render(
      <div>
        <input data-testid="field" />
        <DeveloperEasterEgg />
      </div>
    )
    const input = container.querySelector('input')!
    input.focus()
    fireEvent.keyDown(input, { code: 'KeyL', altKey: true, shiftKey: true })
    fireEvent.keyDown(input, { code: 'KeyK', altKey: true, shiftKey: true })
    expect(openSpy).not.toHaveBeenCalled()
  })
})
