import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { KonfluxStatus } from '~/types/konflux-status';
import { StatusIndicator } from '../StatusIndicator';

const mockUseKonfluxStatus = jest.fn<[KonfluxStatus | null, boolean, unknown], []>();

jest.mock('~/hooks/useKonfluxStatus', () => ({
  useKonfluxStatus: () => mockUseKonfluxStatus(),
}));

describe('StatusIndicator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render nothing when status is not loaded', () => {
    mockUseKonfluxStatus.mockReturnValue([null, false, undefined]);
    const { container } = render(<StatusIndicator />);
    expect(container).toBeEmptyDOMElement();
  });

  it('should render nothing when status data is null', () => {
    mockUseKonfluxStatus.mockReturnValue([null, true, undefined]);
    const { container } = render(<StatusIndicator />);
    expect(container).toBeEmptyDOMElement();
  });

  it('should render nothing on error with no data', () => {
    mockUseKonfluxStatus.mockReturnValue([null, true, new Error('not found')]);
    const { container } = render(<StatusIndicator />);
    expect(container).toBeEmptyDOMElement();
  });

  it('should render operational status icon', () => {
    mockUseKonfluxStatus.mockReturnValue([
      { status: 'operational', statusPageUrl: 'https://status.redhat.com' },
      true,
      undefined,
    ]);
    render(<StatusIndicator />);

    const button = screen.getByTestId('status-indicator-button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('aria-label', 'System status: operational');
  });

  it('should render degraded status icon', () => {
    mockUseKonfluxStatus.mockReturnValue([
      {
        status: 'degraded',
        message: 'Pipeline service degraded',
        statusPageUrl: 'https://status.redhat.com',
      },
      true,
      undefined,
    ]);
    render(<StatusIndicator />);

    const button = screen.getByTestId('status-indicator-button');
    expect(button).toHaveAttribute('aria-label', 'System status: degraded');
  });

  it('should render outage status icon', () => {
    mockUseKonfluxStatus.mockReturnValue([
      {
        status: 'outage',
        message: 'Major outage in progress',
        statusPageUrl: 'https://status.redhat.com',
      },
      true,
      undefined,
    ]);
    render(<StatusIndicator />);

    const button = screen.getByTestId('status-indicator-button');
    expect(button).toHaveAttribute('aria-label', 'System status: outage');
  });

  it('should show popover with status details on click', async () => {
    mockUseKonfluxStatus.mockReturnValue([
      {
        status: 'degraded',
        message: 'Pipeline service degraded',
        lastUpdated: '2026-07-06T12:00:00Z',
        statusPageUrl: 'https://status.redhat.com',
      },
      true,
      undefined,
    ]);
    render(<StatusIndicator />);

    const button = screen.getByTestId('status-indicator-button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('System Status')).toBeInTheDocument();
      expect(screen.getByText('Degraded performance')).toBeInTheDocument();
      expect(screen.getByText('Pipeline service degraded')).toBeInTheDocument();
    });
  });

  it('should show service breakdown in popover', async () => {
    mockUseKonfluxStatus.mockReturnValue([
      {
        status: 'degraded',
        statusPageUrl: 'https://status.redhat.com',
        services: [
          { name: 'Pipeline Service', status: 'degraded', message: 'Slow builds' },
          { name: 'Image Registry', status: 'operational' },
        ],
      },
      true,
      undefined,
    ]);
    render(<StatusIndicator />);

    const button = screen.getByTestId('status-indicator-button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('Pipeline Service')).toBeInTheDocument();
      expect(screen.getByText('Image Registry')).toBeInTheDocument();
    });
  });

  it('should show external link to status page', async () => {
    mockUseKonfluxStatus.mockReturnValue([
      {
        status: 'operational',
        statusPageUrl: 'https://status.redhat.com',
      },
      true,
      undefined,
    ]);
    render(<StatusIndicator />);

    const button = screen.getByTestId('status-indicator-button');
    fireEvent.click(button);

    await waitFor(() => {
      const link = screen.getByRole('link', { name: /View status page/i });
      expect(link).toHaveAttribute('href', 'https://status.redhat.com');
    });
  });
});
