import { GitOpsRepo } from '../../components/GitOpsRegistration/GitOpsRegistrationPage';
import { ApplicationKind, ComponentKind } from '../../types';

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
    name: 'platform-gitops',
    repoUrl: 'https://github.com/myorg/platform-gitops.git',
    namespace: MOCK_NAMESPACE,
    status: 'OutOfSync',
    lastSynced: '2026-03-17T22:15:00Z',
    registeredAt: '2025-12-01T14:30:00Z',
  },
  {
    name: 'team-alpha-config',
    repoUrl: 'https://gitlab.com/myorg/team-alpha-config.git',
    namespace: MOCK_NAMESPACE,
    status: 'Synced',
    lastSynced: '2026-03-18T09:00:00Z',
    registeredAt: '2026-01-05T09:00:00Z',
  },
  {
    name: 'staging-environment',
    repoUrl: 'https://github.com/myorg/staging-environment.git',
    namespace: MOCK_NAMESPACE,
    status: 'Pending',
    registeredAt: '2026-03-18T07:45:00Z',
  },
  {
    name: 'release-pipelines',
    repoUrl: 'https://github.com/myorg/release-pipelines.git',
    namespace: MOCK_NAMESPACE,
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
