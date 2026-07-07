import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { KonfluxStatus } from '~/types/konflux-status';
import { OutageBanner } from '../OutageBanner';

const mockUseKonfluxStatus = jest.fn<[KonfluxStatus | null, boolean, unknown], []>();

jest.mock('~/hooks/useKonfluxStatus', () => ({
  useKonfluxStatus: () => mockUseKonfluxStatus(),
}));

describe('OutageBanner', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render nothing when status is null', () => {
    mockUseKonfluxStatus.mockReturnValue([null, true, undefined]);
    const { container } = render(<OutageBanner />);
    expect(container).toBeEmptyDOMElement();
  });

  it('should render nothing when status is operational', () => {
    mockUseKonfluxStatus.mockReturnValue([
      { status: 'operational', statusPageUrl: 'https://status.redhat.com' },
      true,
      undefined,
    ]);
    const { container } = render(<OutageBanner />);
    expect(container).toBeEmptyDOMElement();
  });

  it('should render warning alert when status is degraded', () => {
    mockUseKonfluxStatus.mockReturnValue([
      {
        status: 'degraded',
        message: 'Pipeline builds are slow',
        statusPageUrl: 'https://status.redhat.com',
      },
      true,
      undefined,
    ]);
    render(<OutageBanner />);

    const banner = screen.getByTestId('outage-banner');
    expect(banner).toBeInTheDocument();
    expect(screen.getByText('Konflux is experiencing issues')).toBeInTheDocument();
    expect(screen.getByText(/Pipeline builds are slow/)).toBeInTheDocument();
  });

  it('should render danger alert when status is outage', () => {
    mockUseKonfluxStatus.mockReturnValue([
      {
        status: 'outage',
        message: 'Major outage in progress',
        statusPageUrl: 'https://status.redhat.com',
      },
      true,
      undefined,
    ]);
    render(<OutageBanner />);

    const banner = screen.getByTestId('outage-banner');
    expect(banner).toBeInTheDocument();
    expect(screen.getByText(/Major outage in progress/)).toBeInTheDocument();
  });

  it('should show default message when no custom message is provided', () => {
    mockUseKonfluxStatus.mockReturnValue([
      { status: 'degraded', statusPageUrl: 'https://status.redhat.com' },
      true,
      undefined,
    ]);
    render(<OutageBanner />);

    expect(
      screen.getByText(/Consider waiting before retrying failed pipeline runs/),
    ).toBeInTheDocument();
  });

  it('should show status page link', () => {
    mockUseKonfluxStatus.mockReturnValue([
      {
        status: 'outage',
        statusPageUrl: 'https://status.redhat.com',
      },
      true,
      undefined,
    ]);
    render(<OutageBanner />);

    const link = screen.getByRole('link', { name: /View status page/i });
    expect(link).toHaveAttribute('href', 'https://status.redhat.com');
  });
});
