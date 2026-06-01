import { render, screen } from '@testing-library/react';
import { CONFORMA_RESULT_STATUS } from '~/types/conforma';
import { mockUseNamespaceHook } from '~/unit-test-utils/mock-namespace';
import { ConformaExpandedRowContent } from '../ConformaExpandedRowContent';

const rowContent = {
  title: 'dummyTitle',
  status: CONFORMA_RESULT_STATUS.violations,
  component: 'component-1',
  description: 'dummy description',
  msg: 'Fail',
  timestamp: '2022-01-01T00:00:00Z',
  collection: ['abcd', 'efg'],
};

const invalidContent = {
  title: null,
  status: null,
  component: null,
  description: null,
  msg: null,
  timestamp: null,
  collection: null,
};

const expiringExceptionContent = {
  title: 'CVE threshold',
  status: CONFORMA_RESULT_STATUS.warnings,
  component: 'component-1',
  description: 'CVE threshold exception',
  msg: 'Warning',
  warningType: 'expiring-exception' as const,
  effectiveUntil: '2026-07-01T00:00:00Z',
  daysUntilEvent: 15,
};

const upcomingActivationContent = {
  title: 'SLSA v1.0',
  status: CONFORMA_RESULT_STATUS.warnings,
  component: 'component-1',
  description: 'SLSA requirement',
  msg: 'Warning',
  warningType: 'upcoming-activation' as const,
  timestamp: '2026-07-01T00:00:00Z',
  daysUntilEvent: 10,
};

describe('ConformaExpandedRowContent', () => {
  mockUseNamespaceHook('test-ns');

  it('should render the component', () => {
    render(<ConformaExpandedRowContent obj={rowContent} />);
    screen.getByText('Effective from');
    screen.getByText('Collection');
    screen.getByText('abcd, efg');
    screen.getByText('Rule Description');
    screen.getByText('dummy description');
  });

  it('should not render the component', () => {
    render(<ConformaExpandedRowContent obj={invalidContent} />);
    expect(screen.queryByText('Effective from')).not.toBeInTheDocument();
    expect(screen.queryByText('Collection')).not.toBeInTheDocument();
  });

  it('should render expiring-exception countdown', () => {
    render(<ConformaExpandedRowContent obj={expiringExceptionContent} />);
    screen.getByText('Exception expires');
    screen.getByText('Expires in 15d');
    expect(screen.queryByText('Effective from')).not.toBeInTheDocument();
  });

  it('should render upcoming-activation countdown', () => {
    render(<ConformaExpandedRowContent obj={upcomingActivationContent} />);
    screen.getByText('Activates on');
    screen.getByText('Activates in 10d');
    expect(screen.queryByText('Effective from')).not.toBeInTheDocument();
  });

  it('should render policy source label for root policy warnings', () => {
    render(
      <ConformaExpandedRowContent
        obj={{
          ...upcomingActivationContent,
          policySource: 'root' as const,
        }}
      />,
    );
    screen.getByText('Policy source');
    screen.getByTestId('policy-source-label');
    screen.getByText('Inherited from root policy');
  });

  it('should not render policy source label for non-root warnings', () => {
    render(<ConformaExpandedRowContent obj={upcomingActivationContent} />);
    expect(screen.queryByText('Policy source')).not.toBeInTheDocument();
  });
});
