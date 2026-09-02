import { renderHook } from '@testing-library/react';
import { useComponents } from '~/hooks/useComponents';
import { useTaskRunsV2 } from '~/hooks/useTaskRunsV2';
import { CVE_SCAN_REPORT } from '~/utils/scan/scan-utils';
import { useApplicationVulnerabilities } from '../useApplicationVulnerabilities';

jest.mock('~/hooks/useComponents', () => ({ useComponents: jest.fn() }));
jest.mock('~/hooks/useTaskRunsV2', () => ({ useTaskRunsV2: jest.fn() }));
jest.mock('~/shared/providers/Namespace', () => ({ useNamespace: () => 'test-ns' }));
jest.mock('~/feature-flags/hooks', () => ({ useIsOnFeatureFlag: () => false }));

const componentsMock = useComponents as jest.Mock;
const taskRunsMock = useTaskRunsV2 as jest.Mock;

const scanTr = (component: string, plr: string, ts: string, images: unknown[]) => ({
  apiVersion: 'tekton.dev/v1',
  kind: 'TaskRun',
  metadata: {
    name: `${plr}-scan`,
    uid: `${plr}-scan-uid`,
    creationTimestamp: ts,
    labels: {
      'appstudio.openshift.io/component': component,
      'tekton.dev/pipelineRun': plr,
    },
  },
  status: {
    conditions: [{ type: 'Succeeded', status: 'True', reason: 'Succeeded' }],
    results: [{ name: CVE_SCAN_REPORT, value: JSON.stringify({ images }) }],
  },
});

describe('useApplicationVulnerabilities', () => {
  it('aggregates latest-per-component rows with source tags and counts', () => {
    componentsMock.mockReturnValue([[{ metadata: { name: 'react-ui' } }], true, null]);
    taskRunsMock.mockReturnValue([
      [
        scanTr('react-ui', 'plr-old', '2026-01-01T00:00:00Z', [
          { digest: 'sha256:old', vulnerabilities: [{ cveId: 'CVE-OLD', severity: 'low', packageName: 'x', packageVersion: '1' }] },
        ]),
        scanTr('react-ui', 'plr-new', '2026-02-01T00:00:00Z', [
          { digest: 'sha256:new', vulnerabilities: [{ cveId: 'CVE-NEW', severity: 'critical', packageName: 'y', packageVersion: '2' }] },
        ]),
      ],
      true,
      null,
      () => {},
      {},
      { dataUpdatedAt: 0, isFetching: false, refetch: () => {} },
    ]);

    const { result } = renderHook(() => useApplicationVulnerabilities('frontend-app'));
    expect(result.current.rows.map((r) => r.cveId)).toEqual(['CVE-NEW']); // latest PLR only
    expect(result.current.rows[0].buildComponentName).toBe('react-ui');
    expect(result.current.rows[0].pipelineRunName).toBe('plr-new');
    expect(result.current.counts.critical).toBe(1);
    expect(result.current.totalScanned).toBe(1);
  });

  it('reports a component whose latest build was not scanned', () => {
    componentsMock.mockReturnValue([[{ metadata: { name: 'unscanned' } }], true, null]);
    taskRunsMock.mockReturnValue([[], true, null, () => {}, {}, { dataUpdatedAt: 0, isFetching: false, refetch: () => {} }]);
    const { result } = renderHook(() => useApplicationVulnerabilities('frontend-app'));
    expect(result.current.componentStatuses).toContainEqual(
      expect.objectContaining({ componentName: 'unscanned', status: 'not-scanned' }),
    );
    expect(result.current.totalScanned).toBe(0);
  });
});
