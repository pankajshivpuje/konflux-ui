import { screen } from '@testing-library/react';
import {
  renderWithQueryClientAndRouter,
  setupVirtualizerMock,
} from '~/unit-test-utils';
import { ApplicationSecurityTab } from '../ApplicationSecurityTab';
import { useApplicationVulnerabilities } from '../useApplicationVulnerabilities';

jest.mock('@tanstack/react-virtual', () => ({
  useVirtualizer: jest.fn(),
}));

jest.mock('../useApplicationVulnerabilities', () => ({ useApplicationVulnerabilities: jest.fn() }));
jest.mock('~/shared/providers/Namespace', () => ({ useNamespace: () => 'test-ns' }));
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ applicationName: 'frontend-app' }),
}));

const hookMock = useApplicationVulnerabilities as jest.Mock;

beforeEach(() => {
  setupVirtualizerMock();
});

describe('ApplicationSecurityTab', () => {
  it('renders summary counts, rows, and a Source link', () => {
    hookMock.mockReturnValue({
      rows: [
        {
          cveId: 'CVE-1',
          severity: 'critical',
          packageName: 'openssl',
          packageVersion: '3.0.5',
          fixedInVersion: '3.0.7',
          imageDigest: 'sha256:a',
          platform: 'linux/amd64',
          pipelineRunName: 'plr',
          taskRunName: 'plr-scan',
          buildComponentName: 'react-ui',
        },
      ],
      counts: { critical: 1, important: 0, moderate: 0, low: 0, unknown: 0 },
      componentStatuses: [{ componentName: 'react-ui', status: 'complete' }],
      totalComponents: 1,
      totalScanned: 1,
      loaded: true,
      settling: false,
      error: undefined,
    });

    renderWithQueryClientAndRouter(<ApplicationSecurityTab />);
    expect(screen.getByTestId('security-summary-critical')).toHaveTextContent('1');
    expect(screen.getByTestId('cve-link-CVE-1')).toBeInTheDocument();
    const sourceLink = screen.getByTestId('vuln-source-plr-scan');
    expect(sourceLink).toHaveAttribute(
      'href',
      expect.stringContaining('/taskruns/plr-scan/vulnerabilities'),
    );
  });
});
