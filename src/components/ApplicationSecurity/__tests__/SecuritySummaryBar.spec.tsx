import { render, screen } from '@testing-library/react';
import { SecuritySummaryBar } from '../SecuritySummaryBar';

describe('SecuritySummaryBar', () => {
  it('renders per-severity counts and a scanned tally', () => {
    render(
      <SecuritySummaryBar
        counts={{ critical: 3, important: 2, moderate: 1, low: 4, unknown: 0 }}
        totalComponents={5}
        totalScanned={4}
      />,
    );
    expect(screen.getByTestId('security-summary-critical')).toHaveTextContent('3');
    expect(screen.getByTestId('security-summary-low')).toHaveTextContent('4');
    expect(screen.getByTestId('security-summary-scanned')).toHaveTextContent('4');
  });
});
