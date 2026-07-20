import { PipelineRunKind } from '~/types';

const createMockPipelineRun = (
  name: string,
  overrides: {
    status?: 'Succeeded' | 'Failed' | 'Running' | 'Cancelled';
    reason?: string;
    message?: string;
    creationTimestamp?: string;
    completionTime?: string;
    startTime?: string;
    component?: string;
    snapshot?: string;
    commitSha?: string;
    commitTitle?: string;
  } = {},
): PipelineRunKind => {
  const {
    status = 'Succeeded',
    reason = status,
    message = status === 'Succeeded'
      ? 'Tasks Completed: 4 (Failed: 0, Cancelled 0), Skipped: 0'
      : status === 'Failed'
        ? 'Tasks Completed: 4 (Failed: 1, Cancelled 0), Skipped: 0'
        : status === 'Running'
          ? 'Tasks Completed: 2 (Failed: 0, Cancelled 0), Skipped: 0'
          : 'PipelineRun was cancelled',
    creationTimestamp = '2025-07-10T14:30:00Z',
    completionTime,
    startTime = creationTimestamp,
    component = 'backend-api',
    snapshot = `my-app-oneone-${name.slice(-5)}`,
    commitSha = 'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2',
    commitTitle = 'Update application configuration',
  } = overrides;

  const statusBool = status === 'Succeeded' ? 'True' : status === 'Running' ? 'Unknown' : 'False';
  const isComplete = status !== 'Running';

  return {
    apiVersion: 'tekton.dev/v1',
    kind: 'PipelineRun',
    metadata: {
      name,
      namespace: 'pshivpuj-tenant',
      uid: `uid-${name}`,
      creationTimestamp,
      labels: {
        'appstudio.openshift.io/application': 'my-app-oneone',
        'appstudio.openshift.io/component': component,
        'appstudio.openshift.io/snapshot': snapshot,
        'test.appstudio.openshift.io/scenario': 'my-app-oneone-enterprise-contract',
        'pipelines.appstudio.openshift.io/type': 'test',
        'build.appstudio.redhat.com/pipeline': 'enterprise-contract',
        'tekton.dev/pipeline': 'enterprise-contract',
        'pipelinesascode.tekton.dev/sha': commitSha,
        'pipelinesascode.tekton.dev/sha-title': commitTitle,
        'pipelinesascode.tekton.dev/sender': 'pshivpuj',
        'pipelinesascode.tekton.dev/event-type': 'push',
        'pipelinesascode.tekton.dev/git-provider': 'github',
        'pipelinesascode.tekton.dev/url-org': 'redhat-appstudio',
        'pipelinesascode.tekton.dev/url-repository': 'my-app-oneone',
        'pipelinesascode.tekton.dev/branch': 'main',
        'pipelinesascode.tekton.dev/state': isComplete ? 'completed' : 'started',
      },
      annotations: {
        'pipelinesascode.tekton.dev/repo-url':
          'https://github.com/redhat-appstudio/my-app-oneone',
        'pipelinesascode.tekton.dev/sha-url': `https://github.com/redhat-appstudio/my-app-oneone/commit/${commitSha}`,
        'pipelinesascode.tekton.dev/sha-title': commitTitle,
      },
    },
    spec: {
      params: [
        {
          name: 'SNAPSHOT',
          value: JSON.stringify({
            application: 'my-app-oneone',
            components: [
              {
                name: component,
                containerImage: `quay.io/redhat-appstudio/${component}@sha256:abc123`,
              },
            ],
          }),
        },
      ],
      pipelineRef: {
        resolver: 'bundles',
        params: [
          {
            name: 'bundle',
            value: 'quay.io/enterprise-contract/ec-pipeline-bundle:latest',
          },
          { name: 'name', value: 'enterprise-contract' },
          { name: 'kind', value: 'Pipeline' },
        ],
      },
    },
    status: {
      startTime,
      ...(isComplete && completionTime ? { completionTime } : {}),
      ...(isComplete && !completionTime
        ? {
            completionTime: new Date(
              new Date(startTime).getTime() + 5 * 60 * 1000,
            ).toISOString(),
          }
        : {}),
      conditions: [
        {
          type: 'Succeeded',
          status: statusBool,
          lastTransitionTime: isComplete
            ? (completionTime ??
              new Date(new Date(startTime).getTime() + 5 * 60 * 1000).toISOString())
            : startTime,
          reason,
          message,
        },
      ],
      pipelineSpec: {
        tasks: [
          {
            name: 'verify-conforma',
            taskRef: {
              resolver: 'bundles',
              params: [
                {
                  name: 'bundle',
                  value: 'quay.io/enterprise-contract/ec-task-bundle:latest',
                },
                { name: 'name', value: 'verify-conforma' },
                { name: 'kind', value: 'Task' },
              ],
            },
          },
        ],
      },
    },
  } as unknown as PipelineRunKind;
};

export const mockIntegrationTestPipelineRuns: Record<string, PipelineRunKind[]> = {
  'my-app-oneone-enterprise-contract': [
    createMockPipelineRun('my-app-oneone-ec-run-success-1', {
      status: 'Succeeded',
      creationTimestamp: '2025-07-15T10:20:00Z',
      component: 'backend-api',
      commitSha: 'f1e2d3c4b5a6f1e2d3c4b5a6f1e2d3c4b5a6f1e2',
      commitTitle: 'feat: add new API endpoint for user profiles',
    }),
    createMockPipelineRun('my-app-oneone-ec-run-failed-1', {
      status: 'Failed',
      reason: 'Failed',
      message: 'Tasks Completed: 4 (Failed: 1, Cancelled 0), Skipped: 0',
      creationTimestamp: '2025-07-14T16:45:00Z',
      component: 'frontend-app',
      commitSha: 'b2c3d4e5f6a7b2c3d4e5f6a7b2c3d4e5f6a7b2c3',
      commitTitle: 'fix: resolve auth token refresh issue',
    }),
    createMockPipelineRun('my-app-oneone-ec-run-running-1', {
      status: 'Running',
      reason: 'Running',
      creationTimestamp: '2025-07-15T14:00:00Z',
      startTime: '2025-07-15T14:00:30Z',
      component: 'backend-api',
      commitSha: 'c3d4e5f6a7b8c3d4e5f6a7b8c3d4e5f6a7b8c3d4',
      commitTitle: 'chore: update dependency versions',
    }),
    createMockPipelineRun('my-app-oneone-ec-run-success-2', {
      status: 'Succeeded',
      creationTimestamp: '2025-07-13T09:15:00Z',
      component: 'backend-api',
      commitSha: 'd4e5f6a7b8c9d4e5f6a7b8c9d4e5f6a7b8c9d4e5',
      commitTitle: 'refactor: simplify database connection pooling',
    }),
    createMockPipelineRun('my-app-oneone-ec-run-cancelled-1', {
      status: 'Cancelled',
      reason: 'CancelledRunFinally',
      message: 'PipelineRun was cancelled',
      creationTimestamp: '2025-07-12T11:30:00Z',
      component: 'frontend-app',
      commitSha: 'e5f6a7b8c9d0e5f6a7b8c9d0e5f6a7b8c9d0e5f6',
      commitTitle: 'test: add integration test coverage',
    }),
    createMockPipelineRun('my-app-oneone-ec-run-success-3', {
      status: 'Succeeded',
      creationTimestamp: '2025-07-11T08:00:00Z',
      component: 'worker-service',
      commitSha: 'a7b8c9d0e1f2a7b8c9d0e1f2a7b8c9d0e1f2a7b8',
      commitTitle: 'feat: implement message queue consumer',
    }),
    createMockPipelineRun('my-app-oneone-ec-run-failed-2', {
      status: 'Failed',
      reason: 'Failed',
      message: 'Tasks Completed: 3 (Failed: 2, Cancelled 0), Skipped: 1',
      creationTimestamp: '2025-07-10T15:20:00Z',
      component: 'backend-api',
      commitSha: 'b8c9d0e1f2a3b8c9d0e1f2a3b8c9d0e1f2a3b8c9',
      commitTitle: 'fix: handle edge case in data validation',
    }),
    createMockPipelineRun('my-app-oneone-ec-run-success-4', {
      status: 'Succeeded',
      creationTimestamp: '2025-07-09T12:45:00Z',
      component: 'frontend-app',
      commitSha: 'c9d0e1f2a3b4c9d0e1f2a3b4c9d0e1f2a3b4c9d0',
      commitTitle: 'feat: add dark mode support to dashboard',
    }),
  ],
};
