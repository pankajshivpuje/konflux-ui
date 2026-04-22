import { screen } from '@testing-library/react';
import { CONFORMA_RESULT_STATUS, UIConformaData } from '~/types/conforma';
import { routerRenderer } from '../../../utils/test-utils';
import { ECPWarningBanner } from '../ECPWarningBanner';
import '@testing-library/jest-dom';

const makeWarning = (
  warningType: 'expiring-exception' | 'upcoming-activation',
  daysUntilEvent: number,
  title: string,
): UIConformaData => ({
  title,
  description: `Description for ${title}`,
  status: CONFORMA_RESULT_STATUS.warnings,
  component: 'test-component',
  warningType,
  daysUntilEvent,
  solution: `Fix ${title}`,
  collection: ['test-collection'],
});

describe('ECPWarningBanner', () => {
  it('should render nothing when no warnings', () => {
    const { container } = routerRenderer(<ECPWarningBanner warnings={[]} />);
    expect(container.querySelector('[data-test="ecp-warning-banner"]')).toBeNull();
  });

  it('should render expiring exception warning', () => {
    const warnings = [makeWarning('expiring-exception', 15, 'CVE threshold')];
    routerRenderer(<ECPWarningBanner warnings={warnings} />);

    expect(screen.getByTestId('ecp-warning-banner')).toBeInTheDocument();
    expect(screen.getByText(/Builds will start failing in 15 days/)).toBeInTheDocument();
    expect(screen.getByText(/Policy rule:/)).toBeInTheDocument();
    expect(screen.getByText(/Remediation:/)).toBeInTheDocument();
  });

  it('should render upcoming activation warning', () => {
    const warnings = [makeWarning('upcoming-activation', 10, 'SLSA v1.0')];
    routerRenderer(<ECPWarningBanner warnings={warnings} />);

    expect(screen.getByText(/New policy rule "SLSA v1.0" activates in 10 days/)).toBeInTheDocument();
  });

  it('should render multiple warnings', () => {
    const warnings = [
      makeWarning('expiring-exception', 15, 'CVE threshold'),
      makeWarning('upcoming-activation', 10, 'SLSA v1.0'),
    ];
    routerRenderer(<ECPWarningBanner warnings={warnings} />);

    const alerts = screen.getAllByTestId(/ecp-warning-alert/);
    expect(alerts).toHaveLength(2);
  });

  it('should display collection information', () => {
    const warnings = [makeWarning('expiring-exception', 5, 'Test rule')];
    routerRenderer(<ECPWarningBanner warnings={warnings} />);

    expect(screen.getByText(/Collection: test-collection/)).toBeInTheDocument();
  });
});
