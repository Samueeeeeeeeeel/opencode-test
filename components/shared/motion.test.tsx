import { render, screen } from '@testing-library/react';
import { FadeIn, fadeInProps, slideUpProps } from './motion';

jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
      <div data-testid="motion-div" {...props}>
        {children}
      </div>
    ),
  },
}));

describe('FadeIn', () => {
  it('renders children', () => {
    render(
      <FadeIn>
        <span>Content</span>
      </FadeIn>
    );
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('applies className', () => {
    const { container } = render(
      <FadeIn className="custom-class">
        <span>Content</span>
      </FadeIn>
    );
    expect(container.firstChild).toHaveClass('custom-class');
  });
});

describe('fadeInProps', () => {
  it('has correct initial and animate values', () => {
    expect(fadeInProps.initial).toEqual({ opacity: 0, y: 10 });
    expect(fadeInProps.animate).toEqual({ opacity: 1, y: 0 });
    expect(fadeInProps.transition).toEqual({ duration: 0.3 });
  });
});

describe('slideUpProps', () => {
  it('has correct initial and animate values', () => {
    expect(slideUpProps.initial).toEqual({ opacity: 0, y: 20 });
    expect(slideUpProps.animate).toEqual({ opacity: 1, y: 0 });
    expect(slideUpProps.transition).toEqual({ duration: 0.4 });
  });
});
