const MOCK_NAMESPACE = 'mock-namespace';

const mockApplications = [
  {
    apiVersion: 'appstudio.redhat.com/v1alpha1',
    kind: 'Application',
    metadata: { name: 'frontend-app', namespace: MOCK_NAMESPACE, uid: 'app-uid-001', creationTimestamp: '2025-12-01T10:00:00Z' },
    spec: { displayName: 'Frontend Application' },
    status: { conditions: [{ message: 'Application has been successfully created', reason: 'OK', status: 'True', type: 'Created' }] },
  },
  {
    apiVersion: 'appstudio.redhat.com/v1alpha1',
    kind: 'Application',
    metadata: { name: 'backend-api', namespace: MOCK_NAMESPACE, uid: 'app-uid-002', creationTimestamp: '2025-12-05T14:30:00Z' },
    spec: { displayName: 'Backend API Service' },
    status: { conditions: [{ message: 'Application has been successfully created', reason: 'OK', status: 'True', type: 'Created' }] },
  },
  {
    apiVersion: 'appstudio.redhat.com/v1alpha1',
    kind: 'Application',
    metadata: { name: 'data-pipeline', namespace: MOCK_NAMESPACE, uid: 'app-uid-003', creationTimestamp: '2026-01-10T09:15:00Z' },
    spec: { displayName: 'Data Pipeline' },
    status: { conditions: [{ message: 'Application has been successfully created', reason: 'OK', status: 'True', type: 'Created' }] },
  },
];

const mockComponents = [
  {
    apiVersion: 'appstudio.redhat.com/v1alpha1',
    kind: 'Component',
    metadata: { name: 'react-ui', namespace: MOCK_NAMESPACE, uid: 'comp-uid-001', creationTimestamp: '2025-12-01T10:30:00Z', annotations: { 'build.appstudio.openshift.io/status': '{"pac":{"state":"enabled","merge-url":""}}' } },
    spec: { application: 'frontend-app', build: { containerImage: 'quay.io/myorg/react-ui:latest' }, componentName: 'react-ui', resources: {}, source: { git: { url: 'https://github.com/myorg/react-ui.git', revision: 'main', context: './' } } },
    status: { conditions: [{ message: 'Component has been successfully created', reason: 'OK', status: 'True', type: 'Created' }], containerImage: 'quay.io/myorg/react-ui:sha-abc1234', gitops: { repositoryURL: 'https://github.com/myorg/gitops-config' } },
  },
  {
    apiVersion: 'appstudio.redhat.com/v1alpha1',
    kind: 'Component',
    metadata: { name: 'nginx-proxy', namespace: MOCK_NAMESPACE, uid: 'comp-uid-002', creationTimestamp: '2025-12-02T11:00:00Z', annotations: { 'build.appstudio.openshift.io/status': '{"pac":{"state":"enabled","merge-url":""}}' } },
    spec: { application: 'frontend-app', build: { containerImage: 'quay.io/myorg/nginx-proxy:latest' }, componentName: 'nginx-proxy', resources: {}, source: { git: { url: 'https://github.com/myorg/nginx-proxy.git', revision: 'main', context: './' } } },
    status: { conditions: [{ message: 'Component has been successfully created', reason: 'OK', status: 'True', type: 'Created' }], containerImage: 'quay.io/myorg/nginx-proxy:sha-def5678', gitops: { repositoryURL: 'https://github.com/myorg/gitops-config' } },
  },
  {
    apiVersion: 'appstudio.redhat.com/v1alpha1',
    kind: 'Component',
    metadata: { name: 'api-server', namespace: MOCK_NAMESPACE, uid: 'comp-uid-003', creationTimestamp: '2025-12-05T15:00:00Z', annotations: { 'build.appstudio.openshift.io/status': '{"pac":{"state":"enabled","merge-url":""}}' } },
    spec: { application: 'backend-api', build: { containerImage: 'quay.io/myorg/api-server:latest' }, componentName: 'api-server', resources: {}, source: { git: { url: 'https://github.com/myorg/api-server.git', revision: 'main', context: './' } } },
    status: { conditions: [{ message: 'Component has been successfully created', reason: 'OK', status: 'True', type: 'Created' }], containerImage: 'quay.io/myorg/api-server:sha-ghi9012', gitops: { repositoryURL: 'https://github.com/myorg/gitops-config' } },
  },
  {
    apiVersion: 'appstudio.redhat.com/v1alpha1',
    kind: 'Component',
    metadata: { name: 'worker-service', namespace: MOCK_NAMESPACE, uid: 'comp-uid-004', creationTimestamp: '2025-12-06T08:00:00Z', annotations: { 'build.appstudio.openshift.io/status': '{"pac":{"state":"enabled","merge-url":""}}' } },
    spec: { application: 'backend-api', build: { containerImage: 'quay.io/myorg/worker-service:latest' }, componentName: 'worker-service', resources: {}, source: { git: { url: 'https://github.com/myorg/worker-service.git', revision: 'develop', context: './' } } },
    status: { conditions: [{ message: 'Component has been successfully created', reason: 'OK', status: 'True', type: 'Created' }], containerImage: 'quay.io/myorg/worker-service:sha-jkl3456', gitops: { repositoryURL: 'https://github.com/myorg/gitops-config' } },
  },
  {
    apiVersion: 'appstudio.redhat.com/v1alpha1',
    kind: 'Component',
    metadata: { name: 'etl-processor', namespace: MOCK_NAMESPACE, uid: 'comp-uid-005', creationTimestamp: '2026-01-10T09:30:00Z', annotations: { 'build.appstudio.openshift.io/status': '{"pac":{"state":"enabled","merge-url":""}}' } },
    spec: { application: 'data-pipeline', build: { containerImage: 'quay.io/myorg/etl-processor:latest' }, componentName: 'etl-processor', resources: {}, source: { git: { url: 'https://github.com/myorg/etl-processor.git', revision: 'main', context: './' } } },
    status: { conditions: [{ message: 'Component has been successfully created', reason: 'OK', status: 'True', type: 'Created' }], containerImage: 'quay.io/myorg/etl-processor:sha-mno7890', gitops: { repositoryURL: 'https://github.com/myorg/gitops-config' } },
  },
];

const mockIntegrationTests = [
  {
    apiVersion: 'appstudio.redhat.com/v1beta2',
    kind: 'IntegrationTestScenario',
    metadata: { name: 'frontend-app-integration-test-1', namespace: MOCK_NAMESPACE, uid: 'its-uid-001', creationTimestamp: '2025-12-15T10:00:00Z', labels: { 'test.appstudio.openshift.io/optional': 'true' }, annotations: { 'app.kubernetes.io/display-name': 'Component Smoke Test' } },
    spec: {
      application: 'frontend-app',
      resolverRef: { resourceKind: 'pipeline', resolver: 'git', params: [{ name: 'url', value: 'https://github.com/konflux-ci/integration-examples.git' }, { name: 'revision', value: 'main' }, { name: 'pathInRepo', value: 'pipelines/integration_pipeline_pass.yaml' }] },
      contexts: [{ description: 'Application testing', name: 'application' }],
    },
    status: { conditions: [{ lastTransitionTime: '2025-12-15T10:00:00Z', message: 'Integration test scenario is valid', reason: 'Valid', status: 'True', type: 'IntegrationTestScenarioValid' }] },
  },
  {
    apiVersion: 'appstudio.redhat.com/v1beta2',
    kind: 'IntegrationTestScenario',
    metadata: { name: 'frontend-app-e2e-test', namespace: MOCK_NAMESPACE, uid: 'its-uid-002', creationTimestamp: '2025-12-20T14:00:00Z', annotations: { 'app.kubernetes.io/display-name': 'End-to-End Test Suite' } },
    spec: {
      application: 'frontend-app',
      resolverRef: { resourceKind: 'pipeline', resolver: 'git', params: [{ name: 'url', value: 'https://github.com/myorg/e2e-tests.git' }, { name: 'revision', value: 'main' }, { name: 'pathInRepo', value: '.tekton/e2e-pipeline.yaml' }] },
      contexts: [{ description: 'End-to-end testing', name: 'application' }],
    },
    status: { conditions: [{ lastTransitionTime: '2025-12-20T14:00:00Z', message: 'Integration test scenario is valid', reason: 'Valid', status: 'True', type: 'IntegrationTestScenarioValid' }] },
  },
  {
    apiVersion: 'appstudio.redhat.com/v1beta2',
    kind: 'IntegrationTestScenario',
    metadata: { name: 'backend-api-contract-test', namespace: MOCK_NAMESPACE, uid: 'its-uid-003', creationTimestamp: '2026-01-05T09:00:00Z', annotations: { 'app.kubernetes.io/display-name': 'API Contract Tests' } },
    spec: {
      application: 'backend-api',
      resolverRef: { resourceKind: 'pipeline', resolver: 'git', params: [{ name: 'url', value: 'https://github.com/myorg/contract-tests.git' }, { name: 'revision', value: 'main' }, { name: 'pathInRepo', value: '.tekton/contract-test.yaml' }] },
      contexts: [{ description: 'Contract testing', name: 'application' }],
    },
    status: { conditions: [{ lastTransitionTime: '2026-01-05T09:00:00Z', message: 'Integration test scenario is valid', reason: 'Valid', status: 'True', type: 'IntegrationTestScenarioValid' }] },
  },
];

const mockPipelineRuns = [
  {
    apiVersion: 'tekton.dev/v1',
    kind: 'PipelineRun',
    metadata: { name: 'frontend-app-react-ui-build-abc12', namespace: MOCK_NAMESPACE, uid: 'plr-uid-001', creationTimestamp: '2026-04-22T08:00:00Z', labels: { 'appstudio.openshift.io/application': 'frontend-app', 'appstudio.openshift.io/component': 'react-ui', 'pipelines.appstudio.openshift.io/type': 'build' } },
    spec: { pipelineRef: { name: 'docker-build' }, params: [], workspaces: [] },
    status: { conditions: [{ type: 'Succeeded', status: 'True', reason: 'Succeeded', message: 'Tasks Completed: 6', lastTransitionTime: '2026-04-22T08:12:00Z' }], startTime: '2026-04-22T08:00:30Z', completionTime: '2026-04-22T08:12:00Z', pipelineSpec: { tasks: [] } },
  },
  {
    apiVersion: 'tekton.dev/v1',
    kind: 'PipelineRun',
    metadata: { name: 'backend-api-api-server-build-ghi56', namespace: MOCK_NAMESPACE, uid: 'plr-uid-003', creationTimestamp: '2026-04-22T09:15:00Z', labels: { 'appstudio.openshift.io/application': 'backend-api', 'appstudio.openshift.io/component': 'api-server', 'pipelines.appstudio.openshift.io/type': 'build' } },
    spec: { pipelineRef: { name: 'docker-build' }, params: [], workspaces: [] },
    status: { conditions: [{ type: 'Succeeded', status: 'Unknown', reason: 'Running', message: 'Tasks Completed: 3', lastTransitionTime: '2026-04-22T09:20:00Z' }], startTime: '2026-04-22T09:15:30Z', pipelineSpec: { tasks: [] } },
  },
];

const mockTaskRuns = [
  {
    apiVersion: 'tekton.dev/v1',
    kind: 'TaskRun',
    metadata: { name: 'frontend-app-react-ui-build-abc12-init', namespace: MOCK_NAMESPACE, uid: 'tr-uid-001', creationTimestamp: '2026-04-22T08:00:30Z', labels: { 'tekton.dev/pipelineRun': 'frontend-app-react-ui-build-abc12', 'tekton.dev/pipelineTask': 'init' } },
    spec: { taskRef: { name: 'init' } },
    status: { podName: 'init-pod', startTime: '2026-04-22T08:00:30Z', completionTime: '2026-04-22T08:01:00Z', conditions: [{ type: 'Succeeded', status: 'True', reason: 'Succeeded' }], steps: [] },
  },
];

const mockKonfluxPublicInfo = {
  apiVersion: 'v1',
  kind: 'ConfigMap',
  metadata: { name: 'konflux-public-info', namespace: 'konflux-info', uid: 'cm-uid-001' },
  data: {
    'info.json': JSON.stringify({
      integrations: { github: { app_url: 'https://github.com/apps/konflux-staging' } },
    }),
  },
};

const mockNamespaces = [
  { apiVersion: 'v1', kind: 'Namespace', metadata: { name: MOCK_NAMESPACE, uid: 'ns-uid-001', labels: { 'konflux.ci/type': 'user' } } },
];

// Registry: key = "group/version/plural"
const registry = {
  'appstudio.redhat.com/v1alpha1/applications': mockApplications,
  'appstudio.redhat.com/v1alpha1/components': mockComponents,
  'appstudio.redhat.com/v1beta2/integrationtestscenarios': mockIntegrationTests,
  'appstudio.redhat.com/v1alpha1/integrationtestscenarios': mockIntegrationTests,
  'tekton.dev/v1/pipelineruns': mockPipelineRuns,
  'tekton.dev/v1/taskruns': mockTaskRuns,
  'appstudio.redhat.com/v1alpha1/releases': [],
  'appstudio.redhat.com/v1alpha1/releaseplans': [],
  'appstudio.redhat.com/v1alpha1/releaseplanadmissions': [],
  'appstudio.redhat.com/v1alpha1/snapshots': [],
  'appstudio.redhat.com/v1alpha1/snapshotenvironmentbindings': [],
  'appstudio.redhat.com/v1alpha1/environments': [],
  'appstudio.redhat.com/v1beta1/imagerepositories': [],
  'rbac.authorization.k8s.io/v1/rolebindings': [],
  'rbac.authorization.k8s.io/v1/roles': [],
  'core/v1/secrets': [],
  'core/v1/configmaps': [mockKonfluxPublicInfo],
  'core/v1/namespaces': mockNamespaces,
  'core/v1/serviceaccounts': [],
  'results.tekton.dev/v1alpha2/logs': [],
};

// /api/k8s/apis/{group}/{version}/namespaces/{ns}/{plural}[/{name}]
const NAMESPACED_APIS_RE = /^\/api\/k8s\/apis\/([^/]+)\/([^/]+)\/namespaces\/([^/]+)\/([^/]+?)(?:\/([^/?]+))?(?:\?.*)?$/;
// /api/k8s/api/v1/namespaces/{ns}/{plural}[/{name}]
const NAMESPACED_CORE_RE = /^\/api\/k8s\/api\/v1\/namespaces\/([^/]+)\/([^/]+?)(?:\/([^/?]+))?(?:\?.*)?$/;
// /api/k8s/api/v1/{plural} (cluster-scoped like namespaces)
const CLUSTER_CORE_RE = /^\/api\/k8s\/api\/v1\/([^/?]+)(?:\?.*)?$/;
// /api/k8s/apis/{group}/{version}/{plural} (cluster-scoped)
const CLUSTER_APIS_RE = /^\/api\/k8s\/apis\/([^/]+)\/([^/]+)\/([^/?]+)(?:\?.*)?$/;

function parseUrl(url) {
  const path = url.split('?')[0];
  let match;

  match = path.match(NAMESPACED_APIS_RE);
  if (match) {
    return { group: match[1], version: match[2], ns: match[3], plural: match[4], name: match[5] };
  }

  match = path.match(NAMESPACED_CORE_RE);
  if (match) {
    return { group: 'core', version: 'v1', ns: match[1], plural: match[2], name: match[3] };
  }

  match = path.match(CLUSTER_CORE_RE);
  if (match) {
    return { group: 'core', version: 'v1', ns: null, plural: match[1], name: null };
  }

  match = path.match(CLUSTER_APIS_RE);
  if (match) {
    return { group: match[1], version: match[2], ns: null, plural: match[3], name: null };
  }

  return null;
}

function makeListResponse(items, group, version, kind) {
  const apiVersion = group === 'core' ? 'v1' : `${group}/${version}`;
  return {
    apiVersion,
    kind: `${kind}List`,
    metadata: { resourceVersion: '1', continue: '' },
    items,
  };
}

function kindFromPlural(plural) {
  const map = {
    applications: 'Application',
    components: 'Component',
    integrationtestscenarios: 'IntegrationTestScenario',
    pipelineruns: 'PipelineRun',
    taskruns: 'TaskRun',
    releases: 'Release',
    releaseplans: 'ReleasePlan',
    releaseplanadmissions: 'ReleasePlanAdmission',
    snapshots: 'Snapshot',
    snapshotenvironmentbindings: 'SnapshotEnvironmentBinding',
    environments: 'Environment',
    imagerepositories: 'ImageRepository',
    rolebindings: 'RoleBinding',
    roles: 'Role',
    secrets: 'Secret',
    configmaps: 'ConfigMap',
    namespaces: 'Namespace',
    serviceaccounts: 'ServiceAccount',
    selfsubjectaccessreviews: 'SelfSubjectAccessReview',
  };
  return map[plural] || plural.charAt(0).toUpperCase() + plural.slice(1);
}

export function setupMockK8sMiddleware(app) {
  console.log('[mock-k8s-api] Mock K8s API middleware enabled');

  // Mock OAuth2 userinfo for authentication bypass
  app.get('/oauth2/userinfo', (_req, res) => {
    res.json({
      email: 'mock-user@example.com',
      user: 'mock-user',
      preferredUsername: 'mock-user',
    });
  });

  // Handle SelfSubjectAccessReview (RBAC) - always allow
  app.post('/api/k8s/apis/authorization.k8s.io/v1/selfsubjectaccessreviews', (_req, res) => {
    res.json({
      apiVersion: 'authorization.k8s.io/v1',
      kind: 'SelfSubjectAccessReview',
      status: { allowed: true, reason: 'Mock mode: all access granted' },
    });
  });

  // Handle write operations (POST/PUT/PATCH/DELETE) — echo back success
  app.post('/api/k8s/*', (req, res) => {
    const parsed = parseUrl(req.originalUrl);
    if (!parsed) return res.status(404).json({ kind: 'Status', apiVersion: 'v1', status: 'Failure', message: 'not found', code: 404 });
    let body = '';
    req.on('data', (chunk) => { body += chunk; });
    req.on('end', () => {
      try {
        const resource = JSON.parse(body);
        resource.metadata = resource.metadata || {};
        resource.metadata.uid = resource.metadata.uid || `mock-${Date.now()}`;
        resource.metadata.creationTimestamp = resource.metadata.creationTimestamp || new Date().toISOString();
        resource.metadata.resourceVersion = '1';
        res.status(201).json(resource);
      } catch {
        res.status(201).json({ kind: kindFromPlural(parsed.plural), metadata: { name: 'mock-created', resourceVersion: '1' } });
      }
    });
  });

  app.put('/api/k8s/*', (req, res) => {
    let body = '';
    req.on('data', (chunk) => { body += chunk; });
    req.on('end', () => {
      try { res.json(JSON.parse(body)); } catch { res.json({}); }
    });
  });

  app.patch('/api/k8s/*', (req, res) => {
    let body = '';
    req.on('data', (chunk) => { body += chunk; });
    req.on('end', () => {
      try { res.json(JSON.parse(body)); } catch { res.json({}); }
    });
  });

  app.delete('/api/k8s/*', (_req, res) => {
    res.json({ kind: 'Status', apiVersion: 'v1', status: 'Success', code: 200 });
  });

  // Handle GET (list and get)
  app.get('/api/k8s/*', (req, res) => {
    const parsed = parseUrl(req.originalUrl);
    if (!parsed) {
      return res.status(404).json({ kind: 'Status', apiVersion: 'v1', status: 'Failure', message: `unknown path: ${req.originalUrl}`, code: 404 });
    }

    const { group, version, ns, plural, name } = parsed;
    const key = `${group}/${version}/${plural}`;
    let items = registry[key] || [];

    // Filter by namespace if applicable
    if (ns && items.length > 0) {
      items = items.filter((item) => !item.metadata?.namespace || item.metadata.namespace === ns);
    }

    const kind = kindFromPlural(plural);

    if (name) {
      // GET single resource
      const item = items.find((i) => i.metadata?.name === name);
      if (item) {
        return res.json(item);
      }
      return res.status(404).json({
        kind: 'Status', apiVersion: 'v1', status: 'Failure',
        message: `${plural} "${name}" not found`, reason: 'NotFound', code: 404,
      });
    }

    // LIST
    return res.json(makeListResponse(items, group, version, kind));
  });

  // Catch WebSocket upgrade attempts on /wss/k8s — just ignore them
  app.get('/wss/k8s/*', (_req, res) => {
    res.status(400).json({ kind: 'Status', apiVersion: 'v1', status: 'Failure', message: 'WebSocket not available in mock mode', code: 400 });
  });
}
