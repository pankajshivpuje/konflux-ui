import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { CONFORMA_RESULT_STATUS, UIConformaData } from '~/types/conforma';
import { ECPWarningBanner } from '../ECPWarningBanner';

const makeWarning = (
  overrides: Partial<UIConformaData> = {},
): UIConformaData => ({
  title: 'Test rule',
  description: 'Test description',
  status: CONFORMA_RESULT_STATUS.warnings,
  component: 'test-component',
  msg: 'Test message',
  ...overrides,
});

describe('ECPWarningBanner', () => {
  it('renders nothing when no warnings have warningType', () => {
    const { container } = render(
      <ECPWarningBanner warnings={[makeWarning()]} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders nothing when warnings array is empty', () => {
    const { container } = render(<ECPWarningBanner warnings={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders alert with correct count for single warning', () => {
    render(
      <ECPWarningBanner
        warnings={[
          makeWarning({
            warningType: 'expiring-exception',
            daysUntilEvent: 15,
          }),
        ]}
      />,
    );
    expect(screen.getByTestId('ecp-warning-banner')).toBeInTheDocument();
    expect(
      screen.getByText('1 upcoming policy change requires attention'),
    ).toBeInTheDocument();
  });

  it('renders alert with correct count for multiple warnings', () => {
    render(
      <ECPWarningBanner
        warnings={[
          makeWarning({ warningType: 'expiring-exception', daysUntilEvent: 15 }),
          makeWarning({ warningType: 'upcoming-activation', daysUntilEvent: 10 }),
        ]}
      />,
    );
    expect(
      screen.getByText('2 upcoming policy changes require attention'),
    ).toBeInTheDocument();
  });

  it('shows expiring-exception message text after expanding', async () => {
    const user = userEvent.setup();
    render(
      <ECPWarningBanner
        warnings={[
          makeWarning({
            title: 'CVE threshold exception',
            warningType: 'expiring-exception',
            daysUntilEvent: 15,
            solution: 'Fix CVEs before expiration',
          }),
        ]}
      />,
    );

    await user.click(screen.getByText('Show details'));
    expect(
      screen.getByText(
        'Exception expires in 15 days — builds will start failing',
      ),
    ).toBeInTheDocument();
    expect(screen.getByText('Expires in 15d')).toBeInTheDocument();
    expect(
      screen.getByText(/Fix CVEs before expiration/),
    ).toBeInTheDocument();
  });

  it('shows upcoming-activation message text after expanding', async () => {
    const user = userEvent.setup();
    render(
      <ECPWarningBanner
        warnings={[
          makeWarning({
            title: 'SLSA v1.0 required',
            warningType: 'upcoming-activation',
            daysUntilEvent: 10,
          }),
        ]}
      />,
    );

    await user.click(screen.getByText('Show details'));
    expect(
      screen.getByText(
        'New policy rule activates in 10 days — ensure compliance',
      ),
    ).toBeInTheDocument();
    expect(screen.getByText('Activates in 10d')).toBeInTheDocument();
  });

  it('filters out warnings without warningType from display', () => {
    render(
      <ECPWarningBanner
        warnings={[
          makeWarning({ warningType: 'expiring-exception', daysUntilEvent: 15 }),
          makeWarning(),
        ]}
      />,
    );
    expect(
      screen.getByText('1 upcoming policy change requires attention'),
    ).toBeInTheDocument();
  });

  it('shows inherited label for root policy warnings', async () => {
    const user = userEvent.setup();
    render(
      <ECPWarningBanner
        warnings={[
          makeWarning({
            title: 'Hermetic build required',
            warningType: 'upcoming-activation',
            daysUntilEvent: 30,
            policySource: 'root',
          }),
        ]}
      />,
    );

    await user.click(screen.getByText('Show details'));
    expect(screen.getByTestId('ecp-inherited-label')).toBeInTheDocument();
    expect(screen.getByText('Inherited from root policy')).toBeInTheDocument();
  });

  it('does not show inherited label for non-root warnings', async () => {
    const user = userEvent.setup();
    render(
      <ECPWarningBanner
        warnings={[
          makeWarning({
            warningType: 'expiring-exception',
            daysUntilEvent: 15,
          }),
        ]}
      />,
    );

    await user.click(screen.getByText('Show details'));
    expect(screen.queryByTestId('ecp-inherited-label')).not.toBeInTheDocument();
  });
});
