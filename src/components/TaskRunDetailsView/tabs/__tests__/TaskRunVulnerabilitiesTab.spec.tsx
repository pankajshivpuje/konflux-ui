import '@testing-library/jest-dom';
import { screen } from '@testing-library/react';
import { useTaskRunV2 } from '~/hooks/useTaskRunsV2';
import { renderWithQueryClientAndRouter, setupVirtualizerMock } from '~/unit-test-utils';
import { CVE_SCAN_REPORT } from '~/utils/scan/scan-utils';
import TaskRunVulnerabilitiesTab from '../TaskRunVulnerabilitiesTab';

jest.mock('@tanstack/react-virtual', () => ({
  useVirtualizer: jest.fn(),
}));

jest.mock('~/hooks/useTaskRunsV2', () => ({ useTaskRunV2: jest.fn() }));
jest.mock('~/shared/providers/Namespace', () => ({
  useNamespace: () => 'test-ns',
  ...jest.requireActual('~/shared/providers/Namespace'),
}));

const useTaskRunV2Mock = useTaskRunV2 as jest.Mock;

const scanTr = (images: unknown[], succeeded = true) => ({
  apiVersion: 'tekton.dev/v1',
  kind: 'TaskRun',
  metadata: { name: 'scan', labels: { 'tekton.dev/pipelineRun': 'plr' } },
  status: {
    conditions: [
      { type: 'Succeeded', status: succeeded ? 'True' : 'False', reason: succeeded ? 'Succeeded' : 'Failed' },
    ],
    results: [{ name: CVE_SCAN_REPORT, value: JSON.stringify({ images }) }],
  },
});

beforeEach(() => {
  setupVirtualizerMock();
});

describe('TaskRunVulnerabilitiesTab', () => {
  it('renders rows for a single-image scan without an Image column', () => {
    useTaskRunV2Mock.mockReturnValue([
      scanTr([{ digest: 'sha256:a', platform: 'linux/amd64', vulnerabilities: [{ cveId: 'CVE-1', severity: 'critical', packageName: 'p', packageVersion: '1' }] }]),
      true,
      null,
    ]);
    renderWithQueryClientAndRouter(<TaskRunVulnerabilitiesTab />);
    expect(screen.getByTestId('cve-link-CVE-1')).toBeInTheDocument();
    expect(screen.queryByRole('columnheader', { name: /image/i })).not.toBeInTheDocument();
  });

  it('shows an Image column for multi-image scans', () => {
    useTaskRunV2Mock.mockReturnValue([
      scanTr([
        { digest: 'sha256:a', platform: 'linux/amd64', vulnerabilities: [{ cveId: 'CVE-1', severity: 'critical', packageName: 'p', packageVersion: '1' }] },
        { digest: 'sha256:b', platform: 'linux/arm64', vulnerabilities: [{ cveId: 'CVE-2', severity: 'low', packageName: 'q', packageVersion: '2' }] },
      ]),
      true,
      null,
    ]);
    renderWithQueryClientAndRouter(<TaskRunVulnerabilitiesTab />);
    expect(screen.getByRole('columnheader', { name: /image/i })).toBeInTheDocument();
  });

  it('renders a warning for a failed scan rather than an empty table', () => {
    useTaskRunV2Mock.mockReturnValue([scanTr([], false), true, null]);
    renderWithQueryClientAndRouter(<TaskRunVulnerabilitiesTab />);
    expect(screen.getByText(/scan failed/i)).toBeInTheDocument();
  });
});
