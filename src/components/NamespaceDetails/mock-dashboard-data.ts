import { PipelineRunKind, ReleaseKind } from '~/types';
import { SeverityCounts } from './IssuesCard';

const now = Date.now();
const minutesAgo = (m: number) => new Date(now - m * 60_000).toISOString();

const makePLR = (
  name: string,
  namespace: string,
  type: 'build' | 'test',
  statusVal: 'True' | 'False' | 'Unknown',
  reason: string,
  createdMinAgo: number,
  durationSec: number,
  app: string,
  failReason?: string,
): PipelineRunKind =>
  ({
    apiVersion: 'tekton.dev/v1',
    kind: 'PipelineRun',
    metadata: {
      name,
      namespace,
      uid: `${name}-uid`,
      creationTimestamp: minutesAgo(createdMinAgo),
      labels: {
        'pipelines.appstudio.openshift.io/type': type,
        'appstudio.openshift.io/application': app,
      },
    },
    spec: {},
    status: {
      startTime: minutesAgo(createdMinAgo),
      completionTime:
        statusVal !== 'Unknown'
          ? new Date(new Date(minutesAgo(createdMinAgo)).getTime() + durationSec * 1000).toISOString()
          : undefined,
      conditions: [
        {
          type: 'Succeeded',
          status: statusVal,
          reason,
          ...(failReason ? { message: failReason } : {}),
        },
      ],
    },
  }) as unknown as PipelineRunKind;

const MOCK_BUILD_PLRS: PipelineRunKind[] = [
  makePLR('build-abc-1', 'team-alpha', 'build', 'True', 'Succeeded', 2, 252, 'frontend'),
  makePLR('build-abc-2', 'team-alpha', 'build', 'True', 'Succeeded', 15, 198, 'frontend'),
  makePLR('build-def-1', 'team-beta', 'build', 'False', 'Failed', 5, 150, 'api-service', 'OOMKilled: container exceeded memory limit'),
  makePLR('build-def-2', 'team-beta', 'build', 'True', 'Succeeded', 22, 310, 'api-service'),
  makePLR('build-ghi-1', 'staging-env', 'build', 'Unknown', 'Running', 1, 0, 'data-pipeline'),
  makePLR('build-ghi-2', 'staging-env', 'build', 'True', 'Succeeded', 30, 275, 'data-pipeline'),
  makePLR('build-jkl-1', 'prod-releases', 'build', 'True', 'Succeeded', 45, 420, 'web-app'),
  makePLR('build-jkl-2', 'prod-releases', 'build', 'False', 'Failed', 60, 90, 'web-app', 'Dockerfile syntax error at line 42'),
  makePLR('build-mno-1', 'team-alpha', 'build', 'True', 'Succeeded', 72, 330, 'backend'),
  makePLR('build-mno-2', 'mock-namespace', 'build', 'True', 'Succeeded', 90, 180, 'auth-svc'),
  makePLR('build-pqr-1', 'mock-namespace', 'build', 'Unknown', 'Running', 0, 0, 'auth-svc'),
  makePLR('build-pqr-2', 'mock-namespace', 'build', 'True', 'Succeeded', 120, 240, 'auth-svc'),
];

const MOCK_TEST_PLRS: PipelineRunKind[] = [
  makePLR('test-int-1', 'team-alpha', 'test', 'True', 'Succeeded', 3, 525, 'frontend'),
  makePLR('test-int-2', 'team-alpha', 'test', 'False', 'Failed', 10, 320, 'frontend', 'E2E test timeout: login flow exceeded 30s'),
  makePLR('test-int-3', 'team-beta', 'test', 'True', 'Succeeded', 8, 480, 'api-service'),
  makePLR('test-int-4', 'staging-env', 'test', 'Unknown', 'Running', 1, 0, 'data-pipeline'),
  makePLR('test-int-5', 'staging-env', 'test', 'True', 'Succeeded', 25, 610, 'data-pipeline'),
  makePLR('test-int-6', 'prod-releases', 'test', 'True', 'Succeeded', 35, 445, 'web-app'),
  makePLR('test-int-7', 'mock-namespace', 'test', 'True', 'Succeeded', 50, 380, 'auth-svc'),
  makePLR('test-int-8', 'mock-namespace', 'test', 'False', 'Failed', 65, 195, 'auth-svc', 'Assertion failed: expected 200 got 503'),
];

const makeRelease = (
  name: string,
  namespace: string,
  releasedStatus: 'True' | 'False' | 'Unknown',
  reason: string,
  createdMinAgo: number,
): ReleaseKind =>
  ({
    apiVersion: 'appstudio.redhat.com/v1alpha1',
    kind: 'Release',
    metadata: {
      name,
      namespace,
      uid: `${name}-uid`,
      creationTimestamp: minutesAgo(createdMinAgo),
    },
    spec: {
      releasePlan: `${name}-plan`,
    },
    status: {
      completionTime: releasedStatus !== 'Unknown' ? minutesAgo(createdMinAgo - 5) : undefined,
      conditions: [
        {
          type: 'Released',
          status: releasedStatus,
          reason,
        },
      ],
    },
  }) as unknown as ReleaseKind;

const MOCK_RELEASES: Record<string, ReleaseKind[]> = {
  'team-alpha': [
    makeRelease('release-alpha-1', 'team-alpha', 'True', 'Succeeded', 120),
    makeRelease('release-alpha-2', 'team-alpha', 'True', 'Succeeded', 240),
  ],
  'team-beta': [
    makeRelease('release-beta-1', 'team-beta', 'True', 'Succeeded', 60),
    makeRelease('release-beta-2', 'team-beta', 'False', 'Failed', 180),
  ],
  'staging-env': [
    makeRelease('release-staging-1', 'staging-env', 'Unknown', 'Progressing', 10),
  ],
  'prod-releases': [
    makeRelease('release-prod-1', 'prod-releases', 'True', 'Succeeded', 30),
    makeRelease('release-prod-2', 'prod-releases', 'True', 'Succeeded', 360),
    makeRelease('release-prod-3', 'prod-releases', 'True', 'Succeeded', 720),
  ],
  'mock-namespace': [
    makeRelease('release-mock-1', 'mock-namespace', 'True', 'Succeeded', 90),
  ],
};

const MOCK_ISSUE_COUNTS: Record<string, SeverityCounts> = {
  'team-alpha': { critical: 1, major: 3, minor: 5, info: 2 },
  'team-beta': { critical: 2, major: 2, minor: 4, info: 1 },
  'staging-env': { critical: 0, major: 1, minor: 3, info: 2 },
  'prod-releases': { critical: 1, major: 2, minor: 3, info: 1 },
  'mock-namespace': { critical: 0, major: 0, minor: 2, info: 3 },
};

export const useMockData = () => process.env.NODE_ENV === 'development';

export const getMockBuildPLRsForNamespace = (ns: string): PipelineRunKind[] =>
  MOCK_BUILD_PLRS.filter((plr) => plr.metadata.namespace === ns);

export const getMockTestPLRsForNamespace = (ns: string): PipelineRunKind[] =>
  MOCK_TEST_PLRS.filter((plr) => plr.metadata.namespace === ns);

export const getMockReleasesForNamespace = (ns: string): ReleaseKind[] =>
  MOCK_RELEASES[ns] ?? [];

export const getMockIssueCountsForNamespace = (ns: string): SeverityCounts =>
  MOCK_ISSUE_COUNTS[ns] ?? { critical: 0, major: 0, minor: 0, info: 0 };
