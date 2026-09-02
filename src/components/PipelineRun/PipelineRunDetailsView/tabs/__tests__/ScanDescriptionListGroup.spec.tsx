import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useIsOnFeatureFlag } from '~/feature-flags/hooks';
import { PipelineRunLabel } from '~/consts/pipelinerun';
import { PipelineRunKind, TaskRunKind } from '~/types';
import { mockUseNamespaceHook, renderWithQueryClientAndRouter } from '~/unit-test-utils';
import { CVE_SCAN_RESULT } from '~/utils/scan/scan-utils';
import ScanDescriptionListGroup from '../ScanDescriptionListGroup';

jest.mock('~/feature-flags/hooks', () => ({
  ...jest.requireActual('~/feature-flags/hooks'),
  useIsOnFeatureFlag: jest.fn(),
}));

const isOnFeatureFlagMock = useIsOnFeatureFlag as jest.Mock;

// Factory for feature-flag tests (has APPLICATION label so scanLinkPath works)
const scanTaskRun = (name: string, application = 'my-app') =>
  ({
    apiVersion: 'tekton.dev/v1',
    kind: 'TaskRun',
    metadata: {
      name,
      uid: `${name}-uid`,
      namespace: 'test-ns',
      labels: {
        [PipelineRunLabel.APPLICATION]: application,
        'tekton.dev/pipelineTask': name,
      },
    },
    status: {
      results: [
        {
          name: CVE_SCAN_RESULT,
          value: JSON.stringify({
            vulnerabilities: { critical: 1, high: 2, medium: 0, low: 0, unknown: 0 },
          }),
        },
      ],
    },
  }) as never;

describe('ScanDescriptionListGroup', () => {
  mockUseNamespaceHook('team');

  beforeEach(() => {
    isOnFeatureFlagMock.mockReturnValue(false);
  });

  // Data for pipelineRun-context log-link tests
  const parent: PipelineRunKind = {
    apiVersion: 'tekton.dev/v1',
    kind: 'PipelineRun',
    metadata: { name: 'build', namespace: 'team' },
    spec: {},
  };
  const task: TaskRunKind = {
    apiVersion: 'tekton.dev/v1',
    kind: 'TaskRun',
    metadata: { name: 'scan', namespace: 'team' },
    spec: {},
    status: {
      results: [{ name: CVE_SCAN_RESULT, value: JSON.stringify({ vulnerabilities: { high: 2 } }) }],
    },
  };

  it.each([
    [undefined, '/ns/team/pipelineruns/build/taskruns/scan/logs'],
    ['app', '/ns/team/applications/app/taskruns/scan/logs'],
  ])('links scan logs using the parent application context %s', (application, path) => {
    renderWithQueryClientAndRouter(
      <dl>
        <ScanDescriptionListGroup
          taskRuns={[task]}
          pipelineRun={{
            ...parent,
            metadata: {
              ...parent.metadata,
              labels: application ? { [PipelineRunLabel.APPLICATION]: application } : undefined,
            },
          }}
          showLogsLink
        />
      </dl>,
    );
    expect(screen.getByRole('link', { name: 'View logs' })).toHaveAttribute('href', path);
  });

  it('links every scan task in the popover to its nested logs', async () => {
    const user = userEvent.setup();
    renderWithQueryClientAndRouter(
      <dl>
        <ScanDescriptionListGroup
          taskRuns={[task, { ...task, metadata: { ...task.metadata, name: 'scan-two' } }]}
          pipelineRun={parent}
          showLogsLink
          popoverAppendTo={false}
        />
      </dl>,
    );
    await user.click(screen.getByRole('button', { name: 'View logs' }));
    expect(
      screen.getAllByRole('link', { name: 'View logs' }).map((link) => link.getAttribute('href')),
    ).toEqual([
      '/ns/team/pipelineruns/build/taskruns/scan/logs',
      '/ns/team/pipelineruns/build/taskruns/scan-two/logs',
    ]);
  });

  it('omits logs links without an application or parent run', () => {
    renderWithQueryClientAndRouter(
      <dl>
        <ScanDescriptionListGroup taskRuns={[task]} showLogsLink />
      </dl>,
    );
    expect(screen.queryByRole('link', { name: 'View logs' })).not.toBeInTheDocument();
  });

  // Vulnerabilities-link toggle tests
  describe('vulnerabilities link toggle', () => {
    beforeEach(() => {
      mockUseNamespaceHook('test-ns');
      isOnFeatureFlagMock.mockReturnValue(false);
    });

    it('renders "View logs" linking to the logs tab when the flag is off', () => {
      renderWithQueryClientAndRouter(
        <ScanDescriptionListGroup taskRuns={[scanTaskRun('scan-tr')]} showLogsLink showVulnerabilitiesLink />,
      );

      const link = screen.getByRole('link', { name: 'View logs' });
      expect(link).toHaveAttribute('href', expect.stringContaining('/scan-tr/logs'));
      expect(screen.queryByText('View vulnerabilities')).not.toBeInTheDocument();
    });

    it('renders "View vulnerabilities" linking to the vulnerabilities tab when the flag is on', () => {
      isOnFeatureFlagMock.mockReturnValue(true);

      renderWithQueryClientAndRouter(
        <ScanDescriptionListGroup taskRuns={[scanTaskRun('scan-tr')]} showLogsLink showVulnerabilitiesLink />,
      );

      const link = screen.getByRole('link', { name: 'View vulnerabilities' });
      expect(link).toHaveAttribute('href', expect.stringContaining('/scan-tr/vulnerabilities'));
      expect(screen.queryByText('View logs')).not.toBeInTheDocument();
    });

    it('keeps "View logs" when showVulnerabilitiesLink is not set even if the flag is on', () => {
      isOnFeatureFlagMock.mockReturnValue(true);

      renderWithQueryClientAndRouter(
        <ScanDescriptionListGroup taskRuns={[scanTaskRun('scan-tr')]} showLogsLink />,
      );

      const link = screen.getByRole('link', { name: 'View logs' });
      expect(link).toHaveAttribute('href', expect.stringContaining('/scan-tr/logs'));
      expect(screen.queryByText('View vulnerabilities')).not.toBeInTheDocument();
    });

    it('renders a popover trigger with the vulnerabilities label for multiple scan task runs when the flag is on', () => {
      isOnFeatureFlagMock.mockReturnValue(true);

      renderWithQueryClientAndRouter(
        <ScanDescriptionListGroup
          taskRuns={[scanTaskRun('scan-tr-a'), scanTaskRun('scan-tr-b')]}
          showLogsLink
          showVulnerabilitiesLink
        />,
      );

      expect(screen.getByTestId('view-logs-popover-trigger-test-id')).toHaveTextContent(
        'View vulnerabilities',
      );
    });
  });
});
