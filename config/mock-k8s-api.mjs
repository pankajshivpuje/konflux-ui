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
  {
    apiVersion: 'tekton.dev/v1',
    kind: 'PipelineRun',
    metadata: { name: 'frontend-app-nginx-proxy-build-def34', namespace: MOCK_NAMESPACE, uid: 'plr-uid-002', creationTimestamp: '2026-04-22T08:04:00Z', labels: { 'appstudio.openshift.io/application': 'frontend-app', 'appstudio.openshift.io/component': 'nginx-proxy', 'pipelines.appstudio.openshift.io/type': 'build' } },
    spec: { pipelineRef: { name: 'docker-build' }, params: [], workspaces: [] },
    status: { conditions: [{ type: 'Succeeded', status: 'True', reason: 'Succeeded', message: 'Tasks Completed: 6', lastTransitionTime: '2026-04-22T08:08:00Z' }], startTime: '2026-04-22T08:04:30Z', completionTime: '2026-04-22T08:08:00Z', pipelineSpec: { tasks: [] } },
  },
  {
    apiVersion: 'tekton.dev/v1',
    kind: 'PipelineRun',
    metadata: { name: 'backend-api-worker-service-build-jkl78', namespace: MOCK_NAMESPACE, uid: 'plr-uid-004', creationTimestamp: '2026-04-22T09:28:00Z', labels: { 'appstudio.openshift.io/application': 'backend-api', 'appstudio.openshift.io/component': 'worker-service', 'pipelines.appstudio.openshift.io/type': 'build' } },
    spec: { pipelineRef: { name: 'docker-build' }, params: [], workspaces: [] },
    status: { conditions: [{ type: 'Succeeded', status: 'True', reason: 'Succeeded', message: 'Tasks Completed: 6', lastTransitionTime: '2026-04-22T09:32:00Z' }], startTime: '2026-04-22T09:28:30Z', completionTime: '2026-04-22T09:32:00Z', pipelineSpec: { tasks: [] } },
  },
  {
    apiVersion: 'tekton.dev/v1',
    kind: 'PipelineRun',
    metadata: { name: 'data-pipeline-etl-processor-build-mno90', namespace: MOCK_NAMESPACE, uid: 'plr-uid-005', creationTimestamp: '2026-04-22T09:58:00Z', labels: { 'appstudio.openshift.io/application': 'data-pipeline', 'appstudio.openshift.io/component': 'etl-processor', 'pipelines.appstudio.openshift.io/type': 'build' } },
    spec: { pipelineRef: { name: 'docker-build' }, params: [], workspaces: [] },
    status: { conditions: [{ type: 'Succeeded', status: 'True', reason: 'Succeeded', message: 'Tasks Completed: 6', lastTransitionTime: '2026-04-22T10:02:00Z' }], startTime: '2026-04-22T09:58:30Z', completionTime: '2026-04-22T10:02:00Z', pipelineSpec: { tasks: [] } },
  },
];

// Per-image CVE scan reports from roxctl image-scan task. Each build run produces
// a CVEScanReport with an images array; each image has digest, pullSpec, platform,
// and vulnerabilities (cveId, severity, packageName, packageVersion, fixedInVersion).
const vulnReportByRun = {
  'frontend-app-react-ui-build-abc12': {
    images: [
      {
        digest: 'sha256:react-ui-amd64',
        pullSpec: 'quay.io/konflux/react-ui:latest',
        platform: 'linux/amd64',
        vulnerabilities: [
          { cveId: 'CVE-2024-21626', severity: 'critical', packageName: 'runc', packageVersion: '1.1.4', fixedInVersion: '1.1.12' },
          { cveId: 'CVE-2023-44487', severity: 'critical', packageName: 'nodejs', packageVersion: '18.16.0', fixedInVersion: '18.18.2' },
          { cveId: 'CVE-2022-3602', severity: 'critical', packageName: 'openssl', packageVersion: '3.0.5', fixedInVersion: '3.0.7' },
          { cveId: 'CVE-2024-4068', severity: 'important', packageName: 'braces', packageVersion: '3.0.2', fixedInVersion: '3.0.3' },
          { cveId: 'CVE-2023-45857', severity: 'important', packageName: 'axios', packageVersion: '1.4.0', fixedInVersion: '1.6.0' },
          { cveId: 'CVE-2023-26136', severity: 'moderate', packageName: 'tough-cookie', packageVersion: '4.1.2', fixedInVersion: '4.1.3' },
          { cveId: 'CVE-2024-28849', severity: 'low', packageName: 'follow-redirects', packageVersion: '1.15.4', fixedInVersion: '1.15.6' },
          { cveId: 'CVE-2023-28154', severity: 'low', packageName: 'webpack', packageVersion: '5.75.0', fixedInVersion: '5.76.0' },
          { cveId: 'CVE-2022-25883', severity: 'low', packageName: 'semver', packageVersion: '7.3.8', fixedInVersion: '7.5.2' },
          { cveId: 'CVE-2021-3803', severity: 'low', packageName: 'nth-check', packageVersion: '1.0.2' },
        ],
      },
      {
        digest: 'sha256:react-ui-arm64',
        pullSpec: 'quay.io/konflux/react-ui:latest',
        platform: 'linux/arm64',
        vulnerabilities: [
          { cveId: 'CVE-2024-21626', severity: 'critical', packageName: 'runc', packageVersion: '1.1.4', fixedInVersion: '1.1.12' },
          { cveId: 'CVE-2022-3602', severity: 'critical', packageName: 'openssl', packageVersion: '3.0.5', fixedInVersion: '3.0.7' },
        ],
      },
    ],
  },
  'frontend-app-nginx-proxy-build-def34': {
    images: [
      {
        digest: 'sha256:nginx-proxy',
        pullSpec: 'quay.io/konflux/nginx-proxy:latest',
        platform: 'linux/amd64',
        vulnerabilities: [
          { cveId: 'CVE-2023-44487', severity: 'moderate', packageName: 'nginx', packageVersion: '1.23.3', fixedInVersion: '1.25.3' },
          { cveId: 'CVE-2023-38545', severity: 'low', packageName: 'curl', packageVersion: '7.87.0', fixedInVersion: '8.4.0' },
          { cveId: 'CVE-2022-40674', severity: 'low', packageName: 'expat', packageVersion: '2.4.9' },
        ],
      },
    ],
  },
  'backend-api-api-server-build-ghi56': {
    images: [
      {
        digest: 'sha256:api-server',
        pullSpec: 'quay.io/konflux/api-server:latest',
        platform: 'linux/amd64',
        vulnerabilities: [
          { cveId: 'CVE-2023-39325', severity: 'important', packageName: 'golang.org/x/net', packageVersion: '0.7.0', fixedInVersion: '0.17.0' },
          { cveId: 'CVE-2023-29491', severity: 'low', packageName: 'ncurses', packageVersion: '6.3', fixedInVersion: '6.4' },
        ],
      },
    ],
  },
  'backend-api-worker-service-build-jkl78': { images: [] },
  'data-pipeline-etl-processor-build-mno90': {
    images: [
      {
        digest: 'sha256:etl-processor',
        pullSpec: 'quay.io/konflux/etl-processor:latest',
        platform: 'linux/amd64',
        vulnerabilities: [
          { cveId: 'CVE-2024-3651', severity: 'moderate', packageName: 'idna', packageVersion: '3.4', fixedInVersion: '3.7' },
          { cveId: 'CVE-2023-50782', severity: 'moderate', packageName: 'cryptography', packageVersion: '41.0.3', fixedInVersion: '42.0.0' },
          { cveId: 'CVE-2023-45803', severity: 'low', packageName: 'urllib3', packageVersion: '2.0.4', fixedInVersion: '2.0.7' },
          { cveId: 'CVE-2022-40897', severity: 'low', packageName: 'setuptools', packageVersion: '65.5.0', fixedInVersion: '65.5.1' },
          { cveId: 'CVE-2021-33503', severity: 'low', packageName: 'urllib3', packageVersion: '2.0.4' },
        ],
      },
    ],
  },
};

// Ecosystem each mock package belongs to, surfaced as the "Component source"
// column. Anything not listed falls back to 'OS'.
const COMPONENT_SOURCE_BY_PACKAGE = {
  nodejs: 'Node.js', braces: 'Node.js', axios: 'Node.js', 'tough-cookie': 'Node.js',
  'follow-redirects': 'Node.js', webpack: 'Node.js', semver: 'Node.js', 'nth-check': 'Node.js',
  'golang.org/x/net': 'Go',
  idna: 'Python', cryptography: 'Python', urllib3: 'Python', setuptools: 'Python',
};

// Decorate each vulnerability with the extended roxctl fields (description,
// component source, reference links, advisory) so the Vulnerabilities tab
// and its expandable-row detail have content. Real roxctl reports carry these
// natively; the mock derives them deterministically from the base entry.
const enrichVulnerability = (v) => ({
  ...v,
  description:
    v.description ??
    `${v.cveId}: a ${v.severity}-severity flaw in ${v.packageName} ${v.packageVersion}` +
      `${v.fixedInVersion ? `, addressed in ${v.fixedInVersion}` : ' with no fix currently available'}.`,
  componentSource: v.componentSource ?? COMPONENT_SOURCE_BY_PACKAGE[v.packageName] ?? 'OS',
  link: v.link ?? `https://nvd.nist.gov/vuln/detail/${v.cveId}`,
  // Advisory data only exists for the higher-severity CVEs in newer scans.
  ...(v.severity === 'critical' || v.severity === 'important'
    ? {
        advisory: v.advisory ?? `RHSA-2024:${v.cveId.slice(-4)}`,
        advisoryLink:
          v.advisoryLink ?? `https://access.redhat.com/errata/RHSA-2024:${v.cveId.slice(-4)}`,
      }
    : {}),
});

const enrichReport = (report) => ({
  images: (report?.images ?? []).map((image) => ({
    ...image,
    vulnerabilities: (image.vulnerabilities ?? []).map(enrichVulnerability),
  })),
});

// Reports with the extended fields applied; used to build the scan TaskRun results.
const enrichedReportByRun = Object.fromEntries(
  Object.entries(vulnReportByRun).map(([run, report]) => [run, enrichReport(report)]),
);

// Aggregate the detailed per-image report into the ScanResults count shape the
// PipelineRun list's "Fixable vulnerabilities" column reads from the
// CVE_SCAN_RESULT task result. Maps roxctl severities to the Clair vocabulary
// the ScanResults type uses (important -> high, moderate -> medium).
const SEVERITY_TO_SCAN_COUNT = { critical: 'critical', important: 'high', moderate: 'medium', low: 'low', unknown: 'unknown' };
const toScanResult = (report) => {
  const vulnerabilities = { critical: 0, high: 0, medium: 0, low: 0, unknown: 0 };
  (report?.images ?? []).forEach((image) => {
    (image.vulnerabilities ?? []).forEach((v) => {
      const key = SEVERITY_TO_SCAN_COUNT[v.severity] ?? 'unknown';
      vulnerabilities[key] += 1;
    });
  });
  return { vulnerabilities };
};

// Build the results array for a scan TaskRun: the detailed per-image report
// (drives the Vulnerabilities tab) plus the aggregate counts (drives the list).
const scanTaskRunResults = (runName) => {
  const report = enrichedReportByRun[runName] ?? { images: [] };
  return [
    { name: 'CVE_SCAN_RESULT', value: JSON.stringify(toScanResult(report)) },
    { name: 'CVE_SCAN_REPORT', value: JSON.stringify(report) },
  ];
};

const mockTaskRuns = [
  {
    apiVersion: 'tekton.dev/v1',
    kind: 'TaskRun',
    metadata: { name: 'frontend-app-react-ui-build-abc12-init', namespace: MOCK_NAMESPACE, uid: 'tr-uid-001', creationTimestamp: '2026-04-22T08:00:30Z', labels: { 'tekton.dev/pipelineRun': 'frontend-app-react-ui-build-abc12', 'tekton.dev/pipelineTask': 'init', 'appstudio.openshift.io/application': 'frontend-app', 'appstudio.openshift.io/component': 'react-ui' } },
    spec: { taskRef: { name: 'init' } },
    status: { podName: 'init-pod', startTime: '2026-04-22T08:00:30Z', completionTime: '2026-04-22T08:01:00Z', conditions: [{ type: 'Succeeded', status: 'True', reason: 'Succeeded' }], steps: [], results: scanTaskRunResults('frontend-app-react-ui-build-abc12') },
  },
  {
    apiVersion: 'tekton.dev/v1',
    kind: 'TaskRun',
    metadata: { name: 'frontend-app-nginx-proxy-build-def34-scan', namespace: MOCK_NAMESPACE, uid: 'tr-uid-002', creationTimestamp: '2026-04-22T08:05:00Z', labels: { 'tekton.dev/pipelineRun': 'frontend-app-nginx-proxy-build-def34', 'tekton.dev/pipelineTask': 'scan', 'appstudio.openshift.io/application': 'frontend-app', 'appstudio.openshift.io/component': 'nginx-proxy' } },
    spec: { taskRef: { name: 'scan-image' } },
    status: { podName: 'scan-pod-002', startTime: '2026-04-22T08:05:00Z', completionTime: '2026-04-22T08:06:00Z', conditions: [{ type: 'Succeeded', status: 'True', reason: 'Succeeded' }], steps: [], results: scanTaskRunResults('frontend-app-nginx-proxy-build-def34') },
  },
  {
    apiVersion: 'tekton.dev/v1',
    kind: 'TaskRun',
    metadata: { name: 'backend-api-api-server-build-ghi56-scan', namespace: MOCK_NAMESPACE, uid: 'tr-uid-003', creationTimestamp: '2026-04-22T09:20:00Z', labels: { 'tekton.dev/pipelineRun': 'backend-api-api-server-build-ghi56', 'tekton.dev/pipelineTask': 'scan', 'appstudio.openshift.io/application': 'backend-api', 'appstudio.openshift.io/component': 'api-server' } },
    spec: { taskRef: { name: 'scan-image' } },
    status: { podName: 'scan-pod-003', startTime: '2026-04-22T09:20:00Z', completionTime: '2026-04-22T09:21:00Z', conditions: [{ type: 'Succeeded', status: 'True', reason: 'Succeeded' }], steps: [], results: scanTaskRunResults('backend-api-api-server-build-ghi56') },
  },
  {
    apiVersion: 'tekton.dev/v1',
    kind: 'TaskRun',
    metadata: { name: 'backend-api-worker-service-build-jkl78-scan', namespace: MOCK_NAMESPACE, uid: 'tr-uid-004', creationTimestamp: '2026-04-22T09:30:00Z', labels: { 'tekton.dev/pipelineRun': 'backend-api-worker-service-build-jkl78', 'tekton.dev/pipelineTask': 'scan', 'appstudio.openshift.io/application': 'backend-api', 'appstudio.openshift.io/component': 'worker-service' } },
    spec: { taskRef: { name: 'scan-image' } },
    status: { podName: 'scan-pod-004', startTime: '2026-04-22T09:30:00Z', completionTime: '2026-04-22T09:31:00Z', conditions: [{ type: 'Succeeded', status: 'True', reason: 'Succeeded' }], steps: [], results: scanTaskRunResults('backend-api-worker-service-build-jkl78') },
  },
  {
    apiVersion: 'tekton.dev/v1',
    kind: 'TaskRun',
    metadata: { name: 'data-pipeline-etl-processor-build-mno90-scan', namespace: MOCK_NAMESPACE, uid: 'tr-uid-005', creationTimestamp: '2026-04-22T10:00:00Z', labels: { 'tekton.dev/pipelineRun': 'data-pipeline-etl-processor-build-mno90', 'tekton.dev/pipelineTask': 'scan', 'appstudio.openshift.io/application': 'data-pipeline', 'appstudio.openshift.io/component': 'etl-processor' } },
    spec: { taskRef: { name: 'scan-image' } },
    status: { podName: 'scan-pod-005', startTime: '2026-04-22T10:00:00Z', completionTime: '2026-04-22T10:01:00Z', conditions: [{ type: 'Succeeded', status: 'True', reason: 'Succeeded' }], steps: [], results: scanTaskRunResults('data-pipeline-etl-processor-build-mno90') },
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

  // Emulate the Tekton Results records API. The PipelineRun list's "Fixable
  // vulnerabilities" column reads scan results from tekton-results (not the k8s
  // TaskRun API), because a task result is only present on completed runs. Only
  // the CVE scan TaskRun records are emulated; other record/log queries return
  // empty (the client treats that the same as the previous 404).
  const CVE_SCAN_RESULT_FIELDS = [
    'CLAIR_SCAN_RESULT',
    'CLAIR_SCAN_RESULTS',
    'CVE_SCAN_RESULT',
    'TEKTON_SCAN_RESULTS',
    'SCAN_OUTPUT',
  ];
  app.get('/api/k8s/plugins/tekton-results/*', (req, res) => {
    const path = req.originalUrl.split('?')[0];
    if (!path.endsWith('/records')) {
      return res.status(404).json({ kind: 'Status', apiVersion: 'v1', status: 'Failure', message: `not found: ${path}`, code: 404 });
    }
    const filter = typeof req.query.filter === 'string' ? req.query.filter : '';
    const isScanTaskRunQuery =
      /TaskRun/.test(filter) && CVE_SCAN_RESULT_FIELDS.some((f) => filter.includes(f));
    if (!isScanTaskRunQuery) {
      return res.json({ nextPageToken: null, records: [] });
    }
    // Scan TaskRuns carry a CVE_SCAN_RESULT result. Restrict to the PipelineRuns
    // named in the label filter (their names appear verbatim in the filter string).
    const scanTaskRuns = mockTaskRuns.filter((tr) =>
      (tr.status?.results ?? []).some((r) => CVE_SCAN_RESULT_FIELDS.includes(r.name)),
    );
    const matched = scanTaskRuns.filter((tr) => {
      const plr = tr.metadata?.labels?.['tekton.dev/pipelineRun'];
      return plr && filter.includes(plr);
    });
    const records = matched.map((tr) => ({
      name: `${tr.metadata.namespace}/results/${tr.metadata.uid}/records/${tr.metadata.uid}`,
      uid: tr.metadata.uid,
      data: {
        type: 'tekton.dev/v1.TaskRun',
        value: Buffer.from(JSON.stringify(tr)).toString('base64'),
      },
    }));
    return res.json({ nextPageToken: null, records });
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
