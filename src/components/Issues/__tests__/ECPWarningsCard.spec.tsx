import { render, screen } from '@testing-library/react';
import { ECPWarningsCard } from '../ECPWarningsCard';

describe('ECPWarningsCard', () => {
  it('should render the card', () => {
    render(<ECPWarningsCard />);
    expect(screen.getByTestId('ecp-warnings-card')).toBeInTheDocument();
    expect(screen.getByText('ECP Policy Warnings')).toBeInTheDocument();
  });

  it('should display expiring and activating counts', () => {
    render(<ECPWarningsCard />);
    expect(screen.getByTestId('ecp-expiring-count')).toBeInTheDocument();
    expect(screen.getByTestId('ecp-activating-count')).toBeInTheDocument();
    expect(screen.getByText('Expiring exceptions')).toBeInTheDocument();
    expect(screen.getByText('Upcoming activations')).toBeInTheDocument();
  });

  it('should render warning items with countdown badges', () => {
    render(<ECPWarningsCard />);
    const items = screen.getAllByTestId('ecp-warning-card-item');
    expect(items.length).toBe(3);

    const badges = screen.getAllByTestId('ecp-warning-card-badge');
    expect(badges.length).toBe(3);
  });

  it('should show root policy label for inherited warnings', () => {
    render(<ECPWarningsCard />);
    expect(screen.getByText('Root policy')).toBeInTheDocument();
  });
});
