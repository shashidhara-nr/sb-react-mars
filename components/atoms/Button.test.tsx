import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Button from './Button'

describe('Button Component', () => {
  it('renders button with children text', () => {
    render(<Button>Click Me</Button>)
    
    const button = screen.getByRole('button', { name: /click me/i })
    expect(button).toBeInTheDocument()
  })

  it('handles click events', async () => {
    const handleClick = jest.fn()
    const user = userEvent.setup()
    
    render(<Button onClick={handleClick}>Click Me</Button>)
    
    const button = screen.getByRole('button', { name: /click me/i })
    await user.click(button)
    
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('can be disabled', () => {
    render(<Button disabled>Disabled Button</Button>)
    
    const button = screen.getByRole('button', { name: /disabled button/i })
    expect(button).toBeDisabled()
  })

  it('accepts standard button HTML attributes', () => {
    render(
      <Button type="submit" data-testid="submit-btn">
        Submit
      </Button>
    )
    
    const button = screen.getByTestId('submit-btn')
    expect(button).toHaveAttribute('type', 'submit')
  })

  it('does not pass iconPosition to DOM', () => {
    render(<Button iconPosition="left">Button with Icon</Button>)
    
    const button = screen.getByRole('button')
    expect(button).not.toHaveAttribute('iconPosition')
  })
})
