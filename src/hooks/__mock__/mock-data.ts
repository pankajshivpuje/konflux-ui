import dayjs from 'dayjs';
import { GitOpsRepo } from '../../components/GitOpsRegistration/GitOpsRegistrationPage';
import { PipelineRunLabel, PipelineRunType, PipelineRunEventType } from '../../consts/pipelinerun';
import { Issue, IssueSeverity, IssueState, IssueType } from '../../kite/issue-type';
import { ApplicationKind, ComponentKind, EventKind, PipelineRunKind, TaskRunKind, TektonResourceLabel } from '../../types';

// Toggle this flag to use mock data instead of live API calls
export const USE_MOCK_DATA = true;

const MOCK_NAMESPACE = 'mock-namespace';

export const mockApplications: ApplicationKind[] = [
  {
    apiVersion: 'appstudio.redhat.com/v1alpha1',
    kind: 'Application',
    metadata: {
      name: 'frontend-app',
      namespace: MOCK_NAMESPACE,
      uid: 'app-uid-001',
      creationTimestamp: '2025-12-01T10:00:00Z',
    },
    spec: {
      displayName: 'Frontend Application',
    },
    status: {
      conditions: [
        {
          message: 'Application has been successfully created',
          reason: 'OK',
          status: 'True',
          type: 'Created',
        },
      ],
    },
  },
  {
    apiVersion: 'appstudio.redhat.com/v1alpha1',
    kind: 'Application',
    metadata: {
      name: 'backend-api',
      namespace: MOCK_NAMESPACE,
      uid: 'app-uid-002',
      creationTimestamp: '2025-12-05T14:30:00Z',
    },
    spec: {
      displayName: 'Backend API Service',
    },
    status: {
      conditions: [
        {
          message: 'Application has been successfully created',
          reason: 'OK',
          status: 'True',
          type: 'Created',
        },
      ],
    },
  },
  {
    apiVersion: 'appstudio.redhat.com/v1alpha1',
    kind: 'Application',
    metadata: {
      name: 'data-pipeline',
      namespace: MOCK_NAMESPACE,
      uid: 'app-uid-003',
      creationTimestamp: '2026-01-10T09:15:00Z',
    },
    spec: {
      displayName: 'Data Pipeline',
    },
    status: {
      conditions: [
        {
          message: 'Application has been successfully created',
          reason: 'OK',
          status: 'True',
          type: 'Created',
        },
      ],
    },
  },
];

export const mockGitOpsRepos: GitOpsRepo[] = [
  {
    name: 'tenant-config-prod',
    repoUrl: 'https://github.com/myorg/tenant-config-prod.git',
    namespace: MOCK_NAMESPACE,
    status: 'Synced',
    lastSynced: '2026-03-18T08:30:00Z',
    registeredAt: '2025-11-15T10:00:00Z',
  },
  {
    name: 'team-alpha-config',
    repoUrl: 'https://gitlab.com/myorg/team-alpha-config.git',
    namespace: 'team-alpha',
    status: 'Synced',
    lastSynced: '2026-03-18T09:00:00Z',
    registeredAt: '2026-01-05T09:00:00Z',
  },
  {
    name: 'release-pipelines',
    repoUrl: 'https://github.com/myorg/release-pipelines.git',
    namespace: 'prod-releases',
    status: 'Error',
    lastSynced: '2026-03-16T18:00:00Z',
    registeredAt: '2026-02-20T11:00:00Z',
  },
];

export const mockComponents: ComponentKind[] = [
  {
    apiVersion: 'appstudio.redhat.com/v1alpha1',
    kind: 'Component',
    metadata: {
      name: 'react-ui',
      namespace: MOCK_NAMESPACE,
      uid: 'comp-uid-001',
      creationTimestamp: '2025-12-01T10:30:00Z',
      annotations: {
        'build.appstudio.openshift.io/status': '{"pac":{"state":"enabled","merge-url":""}}',
      },
    },
    spec: {
      application: 'frontend-app',
      build: {
        containerImage: 'quay.io/myorg/react-ui:latest',
      },
      componentName: 'react-ui',
      resources: {},
      source: {
        git: {
          url: 'https://github.com/myorg/react-ui.git',
          revision: 'main',
          context: './',
        },
      },
    },
    status: {
      conditions: [
        {
          message: 'Component has been successfully created',
          reason: 'OK',
          status: 'True',
          type: 'Created',
        },
      ],
      containerImage: 'quay.io/myorg/react-ui:sha-abc1234',
      gitops: {
        repositoryURL: 'https://github.com/myorg/gitops-config',
      },
    },
  },
  {
    apiVersion: 'appstudio.redhat.com/v1alpha1',
    kind: 'Component',
    metadata: {
      name: 'nginx-proxy',
      namespace: MOCK_NAMESPACE,
      uid: 'comp-uid-002',
      creationTimestamp: '2025-12-02T11:00:00Z',
      annotations: {
        'build.appstudio.openshift.io/status': '{"pac":{"state":"enabled","merge-url":""}}',
      },
    },
    spec: {
      application: 'frontend-app',
      build: {
        containerImage: 'quay.io/myorg/nginx-proxy:latest',
      },
      componentName: 'nginx-proxy',
      resources: {},
      source: {
        git: {
          url: 'https://github.com/myorg/nginx-proxy.git',
          revision: 'main',
          context: './',
        },
      },
    },
    status: {
      conditions: [
        {
          message: 'Component has been successfully created',
          reason: 'OK',
          status: 'True',
          type: 'Created',
        },
      ],
      containerImage: 'quay.io/myorg/nginx-proxy:sha-def5678',
      gitops: {
        repositoryURL: 'https://github.com/myorg/gitops-config',
      },
    },
  },
  {
    apiVersion: 'appstudio.redhat.com/v1alpha1',
    kind: 'Component',
    metadata: {
      name: 'api-server',
      namespace: MOCK_NAMESPACE,
      uid: 'comp-uid-003',
      creationTimestamp: '2025-12-05T15:00:00Z',
      annotations: {
        'build.appstudio.openshift.io/status': '{"pac":{"state":"enabled","merge-url":""}}',
      },
    },
    spec: {
      application: 'backend-api',
      build: {
        containerImage: 'quay.io/myorg/api-server:latest',
      },
      componentName: 'api-server',
      resources: {},
      source: {
        git: {
          url: 'https://github.com/myorg/api-server.git',
          revision: 'main',
          context: './',
        },
      },
    },
    status: {
      conditions: [
        {
          message: 'Component has been successfully created',
          reason: 'OK',
          status: 'True',
          type: 'Created',
        },
      ],
      containerImage: 'quay.io/myorg/api-server:sha-ghi9012',
      gitops: {
        repositoryURL: 'https://github.com/myorg/gitops-config',
      },
    },
  },
  {
    apiVersion: 'appstudio.redhat.com/v1alpha1',
    kind: 'Component',
    metadata: {
      name: 'worker-service',
      namespace: MOCK_NAMESPACE,
      uid: 'comp-uid-004',
      creationTimestamp: '2025-12-06T08:00:00Z',
      annotations: {
        'build.appstudio.openshift.io/status': '{"pac":{"state":"enabled","merge-url":""}}',
      },
    },
    spec: {
      application: 'backend-api',
      build: {
        containerImage: 'quay.io/myorg/worker-service:latest',
      },
      componentName: 'worker-service',
      resources: {},
      source: {
        git: {
          url: 'https://github.com/myorg/worker-service.git',
          revision: 'develop',
          context: './',
        },
      },
    },
    status: {
      conditions: [
        {
          message: 'Component has been successfully created',
          reason: 'OK',
          status: 'True',
          type: 'Created',
        },
      ],
      containerImage: 'quay.io/myorg/worker-service:sha-jkl3456',
      gitops: {
        repositoryURL: 'https://github.com/myorg/gitops-config',
      },
    },
  },
  {
    apiVersion: 'appstudio.redhat.com/v1alpha1',
    kind: 'Component',
    metadata: {
      name: 'etl-processor',
      namespace: MOCK_NAMESPACE,
      uid: 'comp-uid-005',
      creationTimestamp: '2026-01-10T09:30:00Z',
      annotations: {
        'build.appstudio.openshift.io/status': '{"pac":{"state":"enabled","merge-url":""}}',
      },
    },
    spec: {
      application: 'data-pipeline',
      build: {
        containerImage: 'quay.io/myorg/etl-processor:latest',
      },
      componentName: 'etl-processor',
      resources: {},
      source: {
        git: {
          url: 'https://github.com/myorg/etl-processor.git',
          revision: 'main',
          context: './',
        },
      },
    },
    status: {
      conditions: [
        {
          message: 'Component has been successfully created',
          reason: 'OK',
          status: 'True',
          type: 'Created',
        },
      ],
      containerImage: 'quay.io/myorg/etl-processor:sha-mno7890',
      gitops: {
        repositoryURL: 'https://github.com/myorg/gitops-config',
      },
    },
  },
];

export const mockPipelineRuns: PipelineRunKind[] = [
  {
    apiVersion: 'tekton.dev/v1',
    kind: 'PipelineRun',
    metadata: {
      name: 'frontend-app-react-ui-build-abc12',
      namespace: MOCK_NAMESPACE,
      uid: 'plr-uid-001',
      creationTimestamp: '2026-04-22T08:00:00Z',
      labels: {
        [PipelineRunLabel.APPLICATION]: 'frontend-app',
        [PipelineRunLabel.COMPONENT]: 'react-ui',
        [PipelineRunLabel.PIPELINE_TYPE]: PipelineRunType.BUILD,
        [PipelineRunLabel.COMMIT_EVENT_TYPE_LABEL]: PipelineRunEventType.PUSH,
        [PipelineRunLabel.COMMIT_LABEL]: 'abc1234567890abcdef1234567890abcdef123456',
        [PipelineRunLabel.COMMIT_USER_LABEL]: 'dev-user',
        [PipelineRunLabel.COMMIT_REPO_URL_LABEL]: 'react-ui',
        [PipelineRunLabel.COMMIT_REPO_ORG_LABEL]: 'myorg',
      },
      annotations: {
        [PipelineRunLabel.COMMIT_SHA_TITLE_ANNOTATION]: 'feat: add new dashboard component',
        [PipelineRunLabel.COMMIT_FULL_REPO_URL_ANNOTATION]: 'https://github.com/myorg/react-ui',
      },
    },
    spec: {
      pipelineRef: { name: 'docker-build' },
      params: [],
      workspaces: [],
    },
    status: {
      conditions: [
        {
          type: 'Succeeded',
          status: 'True',
          reason: 'Succeeded',
          message: 'Tasks Completed: 6 (Skipped: 0), Cancelled 0',
          lastTransitionTime: '2026-04-22T08:12:00Z',
        },
      ],
      startTime: '2026-04-22T08:00:30Z',
      completionTime: '2026-04-22T08:12:00Z',
      pipelineSpec: { tasks: [] },
    },
  },
  {
    apiVersion: 'tekton.dev/v1',
    kind: 'PipelineRun',
    metadata: {
      name: 'frontend-app-react-ui-build-def34',
      namespace: MOCK_NAMESPACE,
      uid: 'plr-uid-002',
      creationTimestamp: '2026-04-21T15:30:00Z',
      labels: {
        [PipelineRunLabel.APPLICATION]: 'frontend-app',
        [PipelineRunLabel.COMPONENT]: 'react-ui',
        [PipelineRunLabel.PIPELINE_TYPE]: PipelineRunType.BUILD,
        [PipelineRunLabel.COMMIT_EVENT_TYPE_LABEL]: PipelineRunEventType.PULL,
        [PipelineRunLabel.COMMIT_LABEL]: 'def4567890abcdef1234567890abcdef12345678',
        [PipelineRunLabel.COMMIT_USER_LABEL]: 'dev-user',
        [PipelineRunLabel.COMMIT_REPO_URL_LABEL]: 'react-ui',
        [PipelineRunLabel.COMMIT_REPO_ORG_LABEL]: 'myorg',
        [PipelineRunLabel.PULL_REQUEST_NUMBER_LABEL]: '42',
      },
      annotations: {
        [PipelineRunLabel.COMMIT_SHA_TITLE_ANNOTATION]: 'fix: resolve routing issue on login page',
        [PipelineRunLabel.COMMIT_FULL_REPO_URL_ANNOTATION]: 'https://github.com/myorg/react-ui',
      },
    },
    spec: {
      pipelineRef: { name: 'docker-build' },
      params: [],
      workspaces: [],
    },
    status: {
      conditions: [
        {
          type: 'Succeeded',
          status: 'False',
          reason: 'Failed',
          message: 'Tasks Completed: 4 (Skipped: 0), Failed: 1, Cancelled 1',
          lastTransitionTime: '2026-04-21T15:45:00Z',
        },
      ],
      startTime: '2026-04-21T15:30:30Z',
      completionTime: '2026-04-21T15:45:00Z',
      pipelineSpec: { tasks: [] },
    },
  },
  {
    apiVersion: 'tekton.dev/v1',
    kind: 'PipelineRun',
    metadata: {
      name: 'backend-api-api-server-build-ghi56',
      namespace: MOCK_NAMESPACE,
      uid: 'plr-uid-003',
      creationTimestamp: '2026-04-22T09:15:00Z',
      labels: {
        [PipelineRunLabel.APPLICATION]: 'backend-api',
        [PipelineRunLabel.COMPONENT]: 'api-server',
        [PipelineRunLabel.PIPELINE_TYPE]: PipelineRunType.BUILD,
        [PipelineRunLabel.COMMIT_EVENT_TYPE_LABEL]: PipelineRunEventType.PUSH,
        [PipelineRunLabel.COMMIT_LABEL]: 'ghi7890abcdef1234567890abcdef1234567890ab',
        [PipelineRunLabel.COMMIT_USER_LABEL]: 'backend-dev',
        [PipelineRunLabel.COMMIT_REPO_URL_LABEL]: 'api-server',
        [PipelineRunLabel.COMMIT_REPO_ORG_LABEL]: 'myorg',
      },
      annotations: {
        [PipelineRunLabel.COMMIT_SHA_TITLE_ANNOTATION]: 'feat: add pagination to /api/v2/users',
        [PipelineRunLabel.COMMIT_FULL_REPO_URL_ANNOTATION]: 'https://github.com/myorg/api-server',
      },
    },
    spec: {
      pipelineRef: { name: 'docker-build' },
      params: [],
      workspaces: [],
    },
    status: {
      conditions: [
        {
          type: 'Succeeded',
          status: 'Unknown',
          reason: 'Running',
          message: 'Tasks Completed: 3 (Skipped: 0)',
          lastTransitionTime: '2026-04-22T09:20:00Z',
        },
      ],
      startTime: '2026-04-22T09:15:30Z',
      pipelineSpec: { tasks: [] },
    },
  },
  {
    apiVersion: 'tekton.dev/v1',
    kind: 'PipelineRun',
    metadata: {
      name: 'frontend-app-test-run-jkl78',
      namespace: MOCK_NAMESPACE,
      uid: 'plr-uid-004',
      creationTimestamp: '2026-04-22T07:00:00Z',
      labels: {
        [PipelineRunLabel.APPLICATION]: 'frontend-app',
        [PipelineRunLabel.COMPONENT]: 'react-ui',
        [PipelineRunLabel.PIPELINE_TYPE]: PipelineRunType.TEST,
        [PipelineRunLabel.COMMIT_EVENT_TYPE_LABEL]: PipelineRunEventType.PUSH,
        [PipelineRunLabel.COMMIT_LABEL]: 'abc1234567890abcdef1234567890abcdef123456',
        [PipelineRunLabel.COMMIT_USER_LABEL]: 'dev-user',
        [PipelineRunLabel.SNAPSHOT]: 'frontend-app-snapshot-001',
        [PipelineRunLabel.TEST_SERVICE_SCENARIO]: 'enterprise-contract',
      },
      annotations: {
        [PipelineRunLabel.COMMIT_SHA_TITLE_ANNOTATION]: 'feat: add new dashboard component',
        [PipelineRunLabel.COMMIT_FULL_REPO_URL_ANNOTATION]: 'https://github.com/myorg/react-ui',
      },
    },
    spec: {
      pipelineRef: { name: 'enterprise-contract' },
      params: [],
      workspaces: [],
    },
    status: {
      conditions: [
        {
          type: 'Succeeded',
          status: 'True',
          reason: 'Succeeded',
          message: 'Tasks Completed: 1 (Skipped: 0), Cancelled 0',
          lastTransitionTime: '2026-04-22T07:08:00Z',
        },
      ],
      startTime: '2026-04-22T07:00:30Z',
      completionTime: '2026-04-22T07:08:00Z',
      pipelineSpec: { tasks: [] },
    },
  },
  {
    apiVersion: 'tekton.dev/v1',
    kind: 'PipelineRun',
    metadata: {
      name: 'data-pipeline-etl-build-mno90',
      namespace: MOCK_NAMESPACE,
      uid: 'plr-uid-005',
      creationTimestamp: '2026-04-20T14:00:00Z',
      labels: {
        [PipelineRunLabel.APPLICATION]: 'data-pipeline',
        [PipelineRunLabel.COMPONENT]: 'etl-processor',
        [PipelineRunLabel.PIPELINE_TYPE]: PipelineRunType.BUILD,
        [PipelineRunLabel.COMMIT_EVENT_TYPE_LABEL]: PipelineRunEventType.PUSH,
        [PipelineRunLabel.COMMIT_LABEL]: 'mno1234567890abcdef1234567890abcdef123456',
        [PipelineRunLabel.COMMIT_USER_LABEL]: 'data-eng',
        [PipelineRunLabel.COMMIT_REPO_URL_LABEL]: 'etl-processor',
        [PipelineRunLabel.COMMIT_REPO_ORG_LABEL]: 'myorg',
      },
      annotations: {
        [PipelineRunLabel.COMMIT_SHA_TITLE_ANNOTATION]: 'refactor: optimize batch processing',
        [PipelineRunLabel.COMMIT_FULL_REPO_URL_ANNOTATION]:
          'https://github.com/myorg/etl-processor',
      },
    },
    spec: {
      pipelineRef: { name: 'docker-build' },
      params: [],
      workspaces: [],
    },
    status: {
      conditions: [
        {
          type: 'Succeeded',
          status: 'True',
          reason: 'Succeeded',
          message: 'Tasks Completed: 6 (Skipped: 0), Cancelled 0',
          lastTransitionTime: '2026-04-20T14:18:00Z',
        },
      ],
      startTime: '2026-04-20T14:00:30Z',
      completionTime: '2026-04-20T14:18:00Z',
      pipelineSpec: { tasks: [] },
    },
  },
  {
    apiVersion: 'tekton.dev/v1',
    kind: 'PipelineRun',
    metadata: {
      name: 'backend-api-worker-build-pqr12',
      namespace: MOCK_NAMESPACE,
      uid: 'plr-uid-006',
      creationTimestamp: '2026-04-22T10:00:00Z',
      labels: {
        [PipelineRunLabel.APPLICATION]: 'backend-api',
        [PipelineRunLabel.COMPONENT]: 'worker-service',
        [PipelineRunLabel.PIPELINE_TYPE]: PipelineRunType.BUILD,
        [PipelineRunLabel.COMMIT_EVENT_TYPE_LABEL]: PipelineRunEventType.PULL,
        [PipelineRunLabel.COMMIT_LABEL]: 'pqr1234567890abcdef1234567890abcdef123456',
        [PipelineRunLabel.COMMIT_USER_LABEL]: 'backend-dev',
        [PipelineRunLabel.COMMIT_REPO_URL_LABEL]: 'worker-service',
        [PipelineRunLabel.COMMIT_REPO_ORG_LABEL]: 'myorg',
        [PipelineRunLabel.PULL_REQUEST_NUMBER_LABEL]: '87',
      },
      annotations: {
        [PipelineRunLabel.COMMIT_SHA_TITLE_ANNOTATION]: 'feat: add retry logic for queue consumer',
        [PipelineRunLabel.COMMIT_FULL_REPO_URL_ANNOTATION]:
          'https://github.com/myorg/worker-service',
      },
    },
    spec: {
      pipelineRef: { name: 'docker-build' },
      params: [],
      workspaces: [],
    },
    status: {
      conditions: [
        {
          type: 'Succeeded',
          status: 'Unknown',
          reason: 'Running',
          message: 'Tasks Completed: 2 (Skipped: 0)',
          lastTransitionTime: '2026-04-22T10:05:00Z',
        },
      ],
      startTime: '2026-04-22T10:00:30Z',
      pipelineSpec: { tasks: [] },
    },
  },
];

const createMockTaskRun = (
  name: string,
  pipelineRunName: string,
  pipelineTaskName: string,
  status: 'True' | 'False' | 'Unknown',
  reason: string,
  startTime: string,
  completionTime?: string,
): TaskRunKind => ({
  apiVersion: 'tekton.dev/v1',
  kind: 'TaskRun',
  metadata: {
    name,
    namespace: MOCK_NAMESPACE,
    uid: `tr-uid-${name}`,
    creationTimestamp: startTime,
    labels: {
      [TektonResourceLabel.pipelinerun]: pipelineRunName,
      [TektonResourceLabel.pipelineTask]: pipelineTaskName,
      [TektonResourceLabel.pipeline]: 'docker-build',
    },
  },
  spec: {
    taskRef: { name: pipelineTaskName },
  },
  status: {
    podName: `${name}-pod`,
    startTime,
    completionTime,
    conditions: [
      {
        type: 'Succeeded',
        status,
        reason,
        message: reason === 'Failed' ? 'Step failed' : 'All steps completed',
        lastTransitionTime: completionTime || startTime,
      },
    ],
    steps: [
      {
        container: 'step-build',
        name: 'build',
        ...(status === 'True' || status === 'False'
          ? {
              terminated: {
                containerID: `cri-o://${name}-container`,
                exitCode: status === 'True' ? 0 : 1,
                finishedAt: completionTime || startTime,
                reason: status === 'True' ? 'Completed' : 'Error',
                startedAt: startTime,
              },
            }
          : {
              running: { startedAt: startTime },
            }),
      },
    ],
  },
});

export const mockTaskRuns: TaskRunKind[] = [
  // TaskRuns for frontend-app-react-ui-build-abc12 (Succeeded)
  createMockTaskRun('frontend-app-react-ui-build-abc12-init', 'frontend-app-react-ui-build-abc12', 'init', 'True', 'Succeeded', '2026-04-22T08:00:30Z', '2026-04-22T08:01:00Z'),
  createMockTaskRun('frontend-app-react-ui-build-abc12-clone', 'frontend-app-react-ui-build-abc12', 'clone-repository', 'True', 'Succeeded', '2026-04-22T08:01:00Z', '2026-04-22T08:02:30Z'),
  createMockTaskRun('frontend-app-react-ui-build-abc12-build', 'frontend-app-react-ui-build-abc12', 'build-container', 'True', 'Succeeded', '2026-04-22T08:02:30Z', '2026-04-22T08:08:00Z'),
  createMockTaskRun('frontend-app-react-ui-build-abc12-inspect', 'frontend-app-react-ui-build-abc12', 'inspect-image', 'True', 'Succeeded', '2026-04-22T08:08:00Z', '2026-04-22T08:09:30Z'),
  createMockTaskRun('frontend-app-react-ui-build-abc12-label', 'frontend-app-react-ui-build-abc12', 'label-check', 'True', 'Succeeded', '2026-04-22T08:09:30Z', '2026-04-22T08:10:30Z'),
  createMockTaskRun('frontend-app-react-ui-build-abc12-sbom', 'frontend-app-react-ui-build-abc12', 'show-sbom', 'True', 'Succeeded', '2026-04-22T08:10:30Z', '2026-04-22T08:12:00Z'),

  // TaskRuns for frontend-app-react-ui-build-def34 (Failed)
  createMockTaskRun('frontend-app-react-ui-build-def34-init', 'frontend-app-react-ui-build-def34', 'init', 'True', 'Succeeded', '2026-04-21T15:30:30Z', '2026-04-21T15:31:00Z'),
  createMockTaskRun('frontend-app-react-ui-build-def34-clone', 'frontend-app-react-ui-build-def34', 'clone-repository', 'True', 'Succeeded', '2026-04-21T15:31:00Z', '2026-04-21T15:32:30Z'),
  createMockTaskRun('frontend-app-react-ui-build-def34-build', 'frontend-app-react-ui-build-def34', 'build-container', 'True', 'Succeeded', '2026-04-21T15:32:30Z', '2026-04-21T15:38:00Z'),
  createMockTaskRun('frontend-app-react-ui-build-def34-inspect', 'frontend-app-react-ui-build-def34', 'inspect-image', 'True', 'Succeeded', '2026-04-21T15:38:00Z', '2026-04-21T15:39:30Z'),
  createMockTaskRun('frontend-app-react-ui-build-def34-label', 'frontend-app-react-ui-build-def34', 'label-check', 'False', 'Failed', '2026-04-21T15:39:30Z', '2026-04-21T15:42:00Z'),

  // TaskRuns for backend-api-api-server-build-ghi56 (Running)
  createMockTaskRun('backend-api-api-server-build-ghi56-init', 'backend-api-api-server-build-ghi56', 'init', 'True', 'Succeeded', '2026-04-22T09:15:30Z', '2026-04-22T09:16:00Z'),
  createMockTaskRun('backend-api-api-server-build-ghi56-clone', 'backend-api-api-server-build-ghi56', 'clone-repository', 'True', 'Succeeded', '2026-04-22T09:16:00Z', '2026-04-22T09:17:30Z'),
  createMockTaskRun('backend-api-api-server-build-ghi56-build', 'backend-api-api-server-build-ghi56', 'build-container', 'Unknown', 'Running', '2026-04-22T09:17:30Z'),
];

export const mockTaskRunLogs: Record<string, string> = {
  init: `[init] Spawning the CI environment
[init] Preparing workspace /workspace/source
[init] Setting up git credentials...
[init] Initializing task with parameters: IMAGE=quay.io/myorg/react-ui:latest
[init] \x1b[32mINFO\x1b[0m: Environment ready`,

  'clone-repository': `[clone-repository] Cloning repository https://github.com/myorg/react-ui.git
[clone-repository] + git clone --depth=1 --branch main https://github.com/myorg/react-ui.git /workspace/source
[clone-repository] Cloning into '/workspace/source'...
[clone-repository] \x1b[32mINFO\x1b[0m: remote: Enumerating objects: 247, done.
[clone-repository] \x1b[32mINFO\x1b[0m: remote: Counting objects: 100% (247/247), done.
[clone-repository] \x1b[32mINFO\x1b[0m: remote: Compressing objects: 100% (198/198), done.
[clone-repository] \x1b[32mINFO\x1b[0m: Receiving objects: 100% (247/247), 1.82 MiB | 12.34 MiB/s, done.
[clone-repository] \x1b[32mINFO\x1b[0m: Resolving deltas: 100% (89/89), done.
[clone-repository] + cd /workspace/source
[clone-repository] + git rev-parse HEAD
[clone-repository] abc1234567890abcdef1234567890abcdef123456
[clone-repository] \x1b[32mINFO\x1b[0m: Repository cloned successfully`,

  'build-container': `[build-container] STEP 1/10: FROM registry.access.redhat.com/ubi9/nodejs-18:latest AS builder
[build-container] Trying to pull registry.access.redhat.com/ubi9/nodejs-18:latest...
[build-container] Getting image source signatures
[build-container] Checking if image destination supports signatures
[build-container] Copying blob sha256:3a4e5f6a7b8c...
[build-container] Copying config sha256:9d8e7f6a5b4c...
[build-container] Writing manifest to image destination
[build-container] \x1b[32mINFO\x1b[0m: Base image pulled successfully
[build-container] STEP 2/10: WORKDIR /opt/app-root/src
[build-container] STEP 3/10: COPY package.json yarn.lock ./
[build-container] STEP 4/10: RUN yarn install --frozen-lockfile
[build-container] yarn install v1.22.19
[build-container] [1/4] Resolving packages...
[build-container] [2/4] Fetching packages...
[build-container] [3/4] Linking dependencies...
[build-container] \x1b[33mWARNING\x1b[0m: peer dependency "react@^18.0.0" is not satisfied by react@17.0.2
[build-container] [4/4] Building fresh packages...
[build-container] Done in 42.31s.
[build-container] STEP 5/10: COPY . .
[build-container] STEP 6/10: RUN yarn build
[build-container] yarn build v1.22.19
[build-container] webpack 5.88.0 compiled successfully in 18234 ms
[build-container] Done in 24.67s.
[build-container] STEP 7/10: FROM registry.access.redhat.com/ubi9/nginx-120:latest
[build-container] STEP 8/10: COPY --from=builder /opt/app-root/src/dist /opt/app-root/src
[build-container] STEP 9/10: EXPOSE 8080
[build-container] STEP 10/10: CMD ["nginx", "-g", "daemon off;"]
[build-container] \x1b[32mINFO\x1b[0m: Successfully built image
[build-container] \x1b[32mINFO\x1b[0m: Pushing image to quay.io/myorg/react-ui:sha-abc1234
[build-container] Getting image source signatures
[build-container] Copying blob sha256:a1b2c3d4e5f6...
[build-container] Writing manifest to image destination
[build-container] \x1b[32mINFO\x1b[0m: Image pushed successfully`,

  'inspect-image': `[inspect-image] Inspecting image quay.io/myorg/react-ui:sha-abc1234
[inspect-image] \x1b[32mINFO\x1b[0m: Image architecture: amd64
[inspect-image] \x1b[32mINFO\x1b[0m: Image OS: linux
[inspect-image] \x1b[32mINFO\x1b[0m: Image size: 182.4 MB
[inspect-image] \x1b[32mINFO\x1b[0m: Base image: registry.access.redhat.com/ubi9/nginx-120:latest
[inspect-image] \x1b[32mINFO\x1b[0m: No critical vulnerabilities found
[inspect-image] \x1b[33mWARNING\x1b[0m: 2 medium vulnerabilities detected (see SBOM for details)
[inspect-image] \x1b[32mINFO\x1b[0m: Image inspection complete`,

  'label-check': `[label-check] Checking required labels on image...
[label-check] \x1b[32mINFO\x1b[0m: Label "com.redhat.component" = "react-ui"
[label-check] \x1b[32mINFO\x1b[0m: Label "name" = "myorg/react-ui"
[label-check] \x1b[32mINFO\x1b[0m: Label "version" = "1.0.0"
[label-check] \x1b[32mINFO\x1b[0m: Label "release" = "1"
[label-check] \x1b[32mINFO\x1b[0m: All required labels present`,

  'label-check-failed': `[label-check] Checking required labels on image...
[label-check] \x1b[32mINFO\x1b[0m: Label "com.redhat.component" = "react-ui"
[label-check] \x1b[32mINFO\x1b[0m: Label "name" = "myorg/react-ui"
[label-check] \x1b[31mERROR\x1b[0m: Required label "version" is missing
[label-check] \x1b[31mERROR\x1b[0m: Required label "release" is missing
[label-check] \x1b[31mERROR\x1b[0m: Label check failed - 2 required labels missing
[label-check] \x1b[31mERROR\x1b[0m: Task "label-check" failed: step "build" exited with code 1`,

  'show-sbom': `[show-sbom] Generating SBOM for image quay.io/myorg/react-ui:sha-abc1234
[show-sbom] \x1b[32mINFO\x1b[0m: Using syft to generate SBOM...
[show-sbom] \x1b[32mINFO\x1b[0m: Scanning image layers...
[show-sbom] \x1b[32mINFO\x1b[0m: Found 142 packages
[show-sbom] \x1b[32mINFO\x1b[0m: SBOM format: CycloneDX JSON
[show-sbom] \x1b[32mINFO\x1b[0m: SBOM uploaded to artifact registry
[show-sbom] \x1b[32mINFO\x1b[0m: SBOM generation complete`,
};

const createMockEvent = (
  name: string,
  involvedKind: string,
  involvedName: string,
  reason: string,
  message: string,
  type: 'Normal' | 'Warning',
  lastTimestamp: string,
  sourceComponent?: string,
): EventKind => ({
  apiVersion: 'v1',
  kind: 'Event',
  metadata: {
    name,
    namespace: MOCK_NAMESPACE,
    uid: `event-uid-${name}`,
    creationTimestamp: lastTimestamp,
  },
  involvedObject: {
    apiVersion: involvedKind === 'Pod' ? 'v1' : 'tekton.dev/v1',
    kind: involvedKind,
    name: involvedName,
    namespace: MOCK_NAMESPACE,
  },
  reason,
  message,
  type,
  lastTimestamp,
  firstTimestamp: lastTimestamp,
  count: 1,
  source: {
    component: sourceComponent || 'kubelet',
  },
});

export const mockPolicyIssues: Issue[] = [
  {
    id: 'policy-issue-1',
    title: 'CVE results threshold exception expiring in 15 days',
    description:
      'The exception for rule "CVE results threshold exception" (cve.cve_results_limit) expires soon. Fix all CVEs above the critical threshold before the exception expires, or request an extension from prodsec and releng.',
    severity: IssueSeverity.MAJOR,
    issueType: IssueType.POLICY,
    state: IssueState.ACTIVE,
    detectedAt: dayjs().subtract(1, 'day').toISOString(),
    namespace: MOCK_NAMESPACE,
    scope: {
      resourceType: 'policy',
      resourceName: 'cve.cve_results_limit',
      resourceNamespace: MOCK_NAMESPACE,
    },
    links: [
      {
        id: 'link-policy-1',
        title: 'Policy Rule Documentation',
        url: 'https://redhat-appstudio.github.io/docs.stonesoup.io/ec-policies/release_policy.html',
        issueId: 'policy-issue-1',
      },
    ],
    relatedFrom: [],
    relatedTo: [],
    createdAt: dayjs().subtract(1, 'day').toISOString(),
    updatedAt: dayjs().subtract(1, 'day').toISOString(),
  },
  {
    id: 'policy-issue-2',
    title: 'New policy rule "SLSA v1.0 Provenance Required" activates in 10 days',
    description:
      'New SLSA provenance verification requiring v1.0 format will become active. Update your build pipeline to produce SLSA v1.0 provenance attestations.',
    severity: IssueSeverity.INFO,
    issueType: IssueType.POLICY,
    state: IssueState.ACTIVE,
    detectedAt: dayjs().subtract(2, 'day').toISOString(),
    namespace: MOCK_NAMESPACE,
    scope: {
      resourceType: 'policy',
      resourceName: 'slsa.new_provenance_check',
      resourceNamespace: MOCK_NAMESPACE,
    },
    links: [
      {
        id: 'link-policy-2',
        title: 'SLSA v1.0 Specification',
        url: 'https://slsa.dev/spec/v1.0/',
        issueId: 'policy-issue-2',
      },
    ],
    relatedFrom: [],
    relatedTo: [],
    createdAt: dayjs().subtract(2, 'day').toISOString(),
    updatedAt: dayjs().subtract(2, 'day').toISOString(),
  },
];

export const mockEventsByPipelineRun: Record<string, EventKind[]> = {
  'frontend-app-react-ui-build-abc12': [
    createMockEvent('evt-abc12-1', 'Pod', 'frontend-app-react-ui-build-abc12-init-pod', 'Scheduled', 'Successfully assigned mock-namespace/frontend-app-react-ui-build-abc12-init-pod to ip-10-0-168-42.ec2.internal', 'Normal', '2026-04-22T08:00:30Z', 'default-scheduler'),
    createMockEvent('evt-abc12-2', 'Pod', 'frontend-app-react-ui-build-abc12-init-pod', 'Pulling', 'Pulling image "registry.access.redhat.com/ubi9/buildah:latest"', 'Normal', '2026-04-22T08:00:32Z'),
    createMockEvent('evt-abc12-1', 'Pod', 'frontend-app-react-ui-build-abc12-init-pod', 'Pulled', 'Successfully pulled image "registry.access.redhat.com/ubi9/buildah:latest" in 2.45s (2.45s including waiting). Image size: 306577844 bytes.', 'Normal', '2026-04-22T08:00:35Z'),
    createMockEvent('evt-abc12-2', 'Pod', 'frontend-app-react-ui-build-abc12-init-pod', 'Created', 'Created container: step-init', 'Normal', '2026-04-22T08:00:36Z'),
    createMockEvent('evt-abc12-3', 'Pod', 'frontend-app-react-ui-build-abc12-init-pod', 'Started', 'Started container step-init', 'Normal', '2026-04-22T08:00:37Z'),
    createMockEvent('evt-abc12-4', 'Pod', 'frontend-app-react-ui-build-abc12-init-pod', 'AddedInterface', 'Add eth0 [10.131.0.78/23] from ovn-kubernetes', 'Normal', '2026-04-22T08:00:38Z', 'multus'),
    createMockEvent('evt-abc12-5', 'Pod', 'frontend-app-react-ui-build-abc12-build-pod', 'Scheduled', 'Successfully assigned mock-namespace/frontend-app-react-ui-build-abc12-build-pod to ip-10-0-168-42.ec2.internal', 'Normal', '2026-04-22T08:02:30Z', 'default-scheduler'),
    createMockEvent('evt-abc12-6', 'Pod', 'frontend-app-react-ui-build-abc12-build-pod', 'Pulling', 'Pulling image "quay.io/konflux-ci/buildah:latest"', 'Normal', '2026-04-22T08:02:32Z'),
    createMockEvent('evt-abc12-7', 'Pod', 'frontend-app-react-ui-build-abc12-build-pod', 'Pulled', 'Successfully pulled image "quay.io/konflux-ci/buildah:latest" in 3.12s. Image size: 306577844 bytes.', 'Normal', '2026-04-22T08:02:36Z'),
    createMockEvent('evt-abc12-8', 'Pod', 'frontend-app-react-ui-build-abc12-build-pod', 'Created', 'Created container: step-build', 'Normal', '2026-04-22T08:02:37Z'),
    createMockEvent('evt-abc12-9', 'Pod', 'frontend-app-react-ui-build-abc12-build-pod', 'Started', 'Started container step-build', 'Normal', '2026-04-22T08:02:38Z'),
    createMockEvent('evt-abc12-10', 'PipelineRun', 'frontend-app-react-ui-build-abc12', 'Succeeded', 'PipelineRun "frontend-app-react-ui-build-abc12" completed successfully', 'Normal', '2026-04-22T08:12:00Z', 'tekton-pipelines-controller'),
  ],
  'frontend-app-react-ui-build-def34': [
    createMockEvent('evt-def34-1', 'Pod', 'frontend-app-react-ui-build-def34-init-pod', 'Scheduled', 'Successfully assigned mock-namespace/frontend-app-react-ui-build-def34-init-pod to ip-10-0-212-18.ec2.internal', 'Normal', '2026-04-21T15:30:30Z', 'default-scheduler'),
    createMockEvent('evt-def34-2', 'Pod', 'frontend-app-react-ui-build-def34-init-pod', 'Pulled', 'Successfully pulled image "registry.access.redhat.com/ubi9/buildah:latest" in 1.89s.', 'Normal', '2026-04-21T15:30:33Z'),
    createMockEvent('evt-def34-3', 'Pod', 'frontend-app-react-ui-build-def34-init-pod', 'Created', 'Created container: step-init', 'Normal', '2026-04-21T15:30:34Z'),
    createMockEvent('evt-def34-4', 'Pod', 'frontend-app-react-ui-build-def34-init-pod', 'Started', 'Started container step-init', 'Normal', '2026-04-21T15:30:35Z'),
    createMockEvent('evt-def34-5', 'Pod', 'frontend-app-react-ui-build-def34-label-pod', 'Scheduled', 'Successfully assigned mock-namespace/frontend-app-react-ui-build-def34-label-pod to ip-10-0-212-18.ec2.internal', 'Normal', '2026-04-21T15:39:30Z', 'default-scheduler'),
    createMockEvent('evt-def34-6', 'Pod', 'frontend-app-react-ui-build-def34-label-pod', 'Created', 'Created container: step-build', 'Normal', '2026-04-21T15:39:32Z'),
    createMockEvent('evt-def34-7', 'Pod', 'frontend-app-react-ui-build-def34-label-pod', 'Started', 'Started container step-build', 'Normal', '2026-04-21T15:39:33Z'),
    createMockEvent('evt-def34-8', 'Pod', 'frontend-app-react-ui-build-def34-label-pod', 'BackOff', 'Back-off restarting failed container step-build in pod frontend-app-react-ui-build-def34-label-pod', 'Warning', '2026-04-21T15:42:00Z'),
    createMockEvent('evt-def34-9', 'PipelineRun', 'frontend-app-react-ui-build-def34', 'Failed', 'PipelineRun "frontend-app-react-ui-build-def34" failed: task "label-check" failed', 'Warning', '2026-04-21T15:45:00Z', 'tekton-pipelines-controller'),
  ],
  'backend-api-api-server-build-ghi56': [
    createMockEvent('evt-ghi56-1', 'Pod', 'backend-api-api-server-build-ghi56-init-pod', 'Scheduled', 'Successfully assigned mock-namespace/backend-api-api-server-build-ghi56-init-pod to ip-10-0-168-42.ec2.internal', 'Normal', '2026-04-22T09:15:30Z', 'default-scheduler'),
    createMockEvent('evt-ghi56-2', 'Pod', 'backend-api-api-server-build-ghi56-init-pod', 'Pulled', 'Successfully pulled image "registry.access.redhat.com/ubi9/buildah:latest" in 2.1s.', 'Normal', '2026-04-22T09:15:33Z'),
    createMockEvent('evt-ghi56-3', 'Pod', 'backend-api-api-server-build-ghi56-init-pod', 'Created', 'Created container: step-init', 'Normal', '2026-04-22T09:15:34Z'),
    createMockEvent('evt-ghi56-4', 'Pod', 'backend-api-api-server-build-ghi56-init-pod', 'Started', 'Started container step-init', 'Normal', '2026-04-22T09:15:35Z'),
    createMockEvent('evt-ghi56-5', 'Pod', 'backend-api-api-server-build-ghi56-build-pod', 'Scheduled', 'Successfully assigned mock-namespace/backend-api-api-server-build-ghi56-build-pod to ip-10-0-168-42.ec2.internal', 'Normal', '2026-04-22T09:17:30Z', 'default-scheduler'),
    createMockEvent('evt-ghi56-6', 'Pod', 'backend-api-api-server-build-ghi56-build-pod', 'Pulling', 'Pulling image "quay.io/konflux-ci/buildah:latest"', 'Normal', '2026-04-22T09:17:32Z'),
    createMockEvent('evt-ghi56-7', 'Pod', 'backend-api-api-server-build-ghi56-build-pod', 'Pulled', 'Successfully pulled image "quay.io/konflux-ci/buildah:latest" in 2.8s.', 'Normal', '2026-04-22T09:17:36Z'),
    createMockEvent('evt-ghi56-8', 'Pod', 'backend-api-api-server-build-ghi56-build-pod', 'Created', 'Created container: step-build', 'Normal', '2026-04-22T09:17:37Z'),
    createMockEvent('evt-ghi56-9', 'Pod', 'backend-api-api-server-build-ghi56-build-pod', 'Started', 'Started container step-build', 'Normal', '2026-04-22T09:17:38Z'),
    createMockEvent('evt-ghi56-10', 'PipelineRun', 'backend-api-api-server-build-ghi56', 'Running', 'PipelineRun "backend-api-api-server-build-ghi56" is running', 'Normal', '2026-04-22T09:20:00Z', 'tekton-pipelines-controller'),
  ],
};
