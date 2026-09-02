import { screen } from '@testing-library/react';
import { FilterContextProvider } from '~/components/Filter/generic/FilterContext';
import { renderWithQueryClientAndRouter, setupVirtualizerMock } from '~/unit-test-utils';
import { AppVulnerabilityRow } from '../vulnerabilities-table-config';
import { VulnerabilitiesTable } from '../VulnerabilitiesTable';

jest.mock('@tanstack/react-virtual', () => ({
  useVirtualizer: jest.fn(),
}));

beforeEach(() => {
  setupVirtualizerMock();
});

const rows: AppVulnerabilityRow[] = [
  {
    cveId: 'CVE-2022-3602',
    severity: 'critical',
    packageName: 'openssl',
    packageVersion: '3.0.5',
    fixedInVersion: '3.0.7',
    imageDigest: 'sha256:a',
    platform: 'linux/amd64',
    pipelineRunName: 'plr',
    taskRunName: 'tr',
  },
  {
    cveId: 'CVE-2021-3803',
    severity: 'low',
    packageName: 'nth-check',
    packageVersion: '1.0.2',
    imageDigest: 'sha256:a',
    platform: 'linux/amd64',
    pipelineRunName: 'plr',
    taskRunName: 'tr',
  },
];

const renderTable = (props = {}) =>
  renderWithQueryClientAndRouter(
    <FilterContextProvider filterParams={['cveId', 'severity', 'package', 'status', 'image', 'pipelinerun']}>
      <VulnerabilitiesTable rows={rows} loaded {...props} />
    </FilterContextProvider>,
  );

describe('VulnerabilitiesTable', () => {
  it('renders a row per vulnerability with a CVE link', () => {
    renderTable();
    expect(screen.getByTestId('cve-link-CVE-2022-3602')).toBeInTheDocument();
    expect(screen.getByTestId('cve-link-CVE-2021-3803')).toBeInTheDocument();
  });

  it('shows the empty state when loaded with no rows', () => {
    renderWithQueryClientAndRouter(
      <FilterContextProvider filterParams={['cveId']}>
        <VulnerabilitiesTable rows={[]} loaded />
      </FilterContextProvider>,
    );
    expect(screen.getByText(/no vulnerabilities found/i)).toBeInTheDocument();
  });
});
