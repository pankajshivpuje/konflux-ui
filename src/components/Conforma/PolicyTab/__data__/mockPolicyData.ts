import dayjs from 'dayjs';
import { CONFORMA_RESULT_STATUS, UIConformaData } from '~/types/conforma';

const ruleTemplates = [
  {
    title: 'Missing CVE scan results',
    description:
      'The clair-scan task results have not been found in the SLSA Provenance attestation of the build pipeline.',
    msg: 'CVE scan results not found',
    solution: 'Ensure the clair-scan task is included in your build pipeline.',
    collection: ['minimal'],
  },
  {
    title: 'Missing SLSA provenance',
    description:
      'The SLSA Provenance attestation was not found. Build pipelines must produce SLSA provenance.',
    msg: 'SLSA Provenance attestation not found',
    solution: 'Use a Tekton Chains-enabled cluster for automatic SLSA provenance.',
    collection: ['slsa3'],
  },
  {
    title: 'Image signature verification failed',
    description:
      'The image signature could not be verified against any of the trusted keys configured in the policy.',
    msg: 'No matching signatures found',
    solution: 'Ensure images are signed with a key that matches the policy configuration.',
    collection: ['minimal'],
  },
  {
    title: 'No tasks run',
    description:
      'This policy enforces that at least one Task is present in the PipelineRun attestation.',
    msg: 'At least one task must be present.',
    solution: 'Add at least one task to the pipeline.',
    collection: ['minimal'],
  },
  {
    title: 'Allowed image registry',
    description: 'The container image must come from an allowed registry.',
    msg: 'Image registry is allowed.',
    solution: 'Use an allowed image registry.',
    collection: ['minimal'],
  },
  {
    title: 'Base image not from trusted source',
    description: 'The base image used in the build must originate from a trusted source.',
    msg: 'Base image source not trusted',
    solution: 'Switch to a base image from an approved registry.',
    collection: ['redhat'],
  },
  {
    title: 'Deprecated API usage detected',
    description: 'The build artifacts reference deprecated Kubernetes API versions.',
    msg: 'Deprecated API versions found in manifests',
    solution: 'Update manifests to use supported API versions.',
    collection: ['minimal'],
  },
  {
    title: 'SBOM completeness check',
    description: 'The SBOM must list all dependencies detected during the build.',
    msg: 'SBOM is complete and matches build output.',
    solution: 'Ensure the SBOM generation step runs after all dependencies are resolved.',
    collection: ['slsa3'],
  },
];

const componentNames = [
  'api-gateway',
  'auth-service',
  'user-service',
  'payment-processor',
  'notification-engine',
  'search-indexer',
  'analytics-collector',
  'cache-manager',
  'event-bus',
  'config-server',
  'logging-agent',
  'metrics-exporter',
  'rate-limiter',
  'load-balancer',
  'session-store',
  'file-uploader',
  'image-resizer',
  'email-sender',
  'sms-gateway',
  'webhook-relay',
  'scheduler-worker',
  'queue-consumer',
  'data-migrator',
  'schema-validator',
  'audit-logger',
  'secret-manager',
  'dns-resolver',
  'proxy-router',
  'token-service',
  'blob-storage',
  'pdf-generator',
  'report-builder',
  'compliance-checker',
  'identity-provider',
  'access-control',
  'feature-flags',
  'ab-testing',
  'cdn-manager',
  'ssl-terminator',
  'health-checker',
  'backup-agent',
  'restore-service',
  'migration-runner',
  'tenant-manager',
  'billing-engine',
  'invoice-generator',
  'subscription-handler',
  'usage-tracker',
];

const fakeDigest = (index: number): string => {
  const hex = (index * 2654435761 >>> 0).toString(16).padStart(8, '0');
  return `sha256:${hex}a1b2c3d4e5f6${hex}00112233445566778899aabb${hex}`;
};

const containerImageForComponent = (name: string, index: number): string =>
  `quay.io/myorg/${name}@${fakeDigest(index)}`;

const generateComponentResults = (
  name: string,
  index: number,
): UIConformaData[] => {
  const results: UIConformaData[] = [];
  const seed = index * 7;
  const image = containerImageForComponent(name, index);

  if (index % 5 === 0) {
    results.push({
      ...ruleTemplates[0],
      status: CONFORMA_RESULT_STATUS.violations,
      timestamp: '2022-01-01T00:00:00Z',
      component: name,
      containerImage: image,
    });
    results.push({
      ...ruleTemplates[1],
      status: CONFORMA_RESULT_STATUS.violations,
      timestamp: '2022-01-01T00:00:00Z',
      component: name,
      containerImage: image,
    });
  } else if (index % 4 === 0) {
    results.push({
      ...ruleTemplates[2],
      status: CONFORMA_RESULT_STATUS.violations,
      timestamp: '2022-01-01T00:00:00Z',
      component: name,
      containerImage: image,
    });
  }

  if (index % 7 === 0) {
    results.push({
      ...ruleTemplates[5],
      status: CONFORMA_RESULT_STATUS.warnings,
      timestamp: dayjs().add(12, 'day').toISOString(),
      component: name,
      containerImage: image,
      daysUntilEvent: 12,
      warningType: 'upcoming-activation' as const,
    });
  } else if (index % 6 === 0) {
    results.push({
      title: 'CVE results threshold exception',
      description: 'Exception allowing CVE results above the critical threshold.',
      status: CONFORMA_RESULT_STATUS.warnings,
      timestamp: '2026-01-15T00:00:00Z',
      component: name,
      containerImage: image,
      msg: 'Exception granted - CVE count exceeds threshold but exception is active',
      solution: 'Fix all CVEs above the critical threshold before the exception expires.',
      collection: ['redhat'],
      effectiveUntil: dayjs().add(20, 'day').toISOString(),
      daysUntilEvent: 20,
      warningType: 'expiring-exception' as const,
    });
  }

  const successRules = [ruleTemplates[3], ruleTemplates[4], ruleTemplates[7]];
  const numSuccesses = 1 + (seed % 3);
  for (let i = 0; i < numSuccesses; i++) {
    results.push({
      ...successRules[i % successRules.length],
      status: CONFORMA_RESULT_STATUS.successes,
      component: name,
      containerImage: image,
    });
  }

  return results;
};

const generateMockResults = (): UIConformaData[] => {
  return componentNames.flatMap((name, i) => generateComponentResults(name, i));
};

const backendApiResults: UIConformaData[] = [
    {
      title: 'Missing CVE scan results',
      description:
        'The clair-scan task results have not been found in the SLSA Provenance attestation of the build pipeline.',
      status: CONFORMA_RESULT_STATUS.violations,
      timestamp: '2022-01-01T00:00:00Z',
      component: 'api-server',
      containerImage: 'quay.io/myorg/api-server@sha256:a1b2c3d4e5f60011223344556677889900aabbccddeeff0011223344556677',
      msg: 'CVE scan results not found',
      solution:
        'Ensure the clair-scan task is included in your build pipeline and produces results in the expected format.',
      collection: ['minimal'],
    },
    {
      title: 'Missing SLSA provenance',
      description:
        'The SLSA Provenance attestation was not found. Build pipelines must produce SLSA provenance to meet supply chain security requirements.',
      status: CONFORMA_RESULT_STATUS.violations,
      timestamp: '2022-01-01T00:00:00Z',
      component: 'api-server',
      containerImage: 'quay.io/myorg/api-server@sha256:a1b2c3d4e5f60011223344556677889900aabbccddeeff0011223344556677',
      msg: 'SLSA Provenance attestation not found for image quay.io/myorg/api-server@sha256:a1b2c3d4e5f60011223344556677889900aabbccddeeff0011223344556677',
      solution:
        'Use a Tekton Chains-enabled cluster so that pipeline runs automatically generate SLSA provenance attestations.',
      collection: ['slsa3'],
    },
    {
      title: 'Image signature verification failed',
      description:
        'The image signature could not be verified against any of the trusted keys configured in the policy.',
      status: CONFORMA_RESULT_STATUS.violations,
      timestamp: '2022-01-01T00:00:00Z',
      component: 'worker',
      containerImage: 'quay.io/myorg/worker@sha256:def456789abc0011223344556677889900aabbccddeeff00112233445566aabb',
      msg: 'Image signature verification failed: no matching signatures found for quay.io/myorg/worker@sha256:def456789abc0011223344556677889900aabbccddeeff00112233445566aabb',
      solution: 'Ensure images are signed with a key that matches the policy configuration.',
      collection: ['minimal'],
    },
    {
      title: 'CVE results threshold exception',
      description:
        'Exception allowing CVE results above the critical threshold. This exception was granted to allow time for remediation of existing critical CVEs.',
      status: CONFORMA_RESULT_STATUS.warnings,
      timestamp: '2026-01-15T00:00:00Z',
      component: 'api-server',
      containerImage: 'quay.io/myorg/api-server@sha256:a1b2c3d4e5f60011223344556677889900aabbccddeeff0011223344556677',
      msg: 'Exception granted - CVE count exceeds threshold but exception is active',
      solution:
        'Fix all CVEs above the critical threshold before the exception expires, or request an extension.',
      collection: ['redhat'],
      effectiveUntil: dayjs().add(15, 'day').toISOString(),
      daysUntilEvent: 15,
      warningType: 'expiring-exception' as const,
    },
    {
      title: 'SLSA v1.0 provenance format required',
      description:
        'New SLSA provenance verification requiring v1.0 format. All build pipelines must produce SLSA v1.0 provenance attestations.',
      status: CONFORMA_RESULT_STATUS.warnings,
      timestamp: dayjs().add(10, 'day').toISOString(),
      component: 'worker',
      containerImage: 'quay.io/myorg/worker@sha256:def456789abc0011223344556677889900aabbccddeeff00112233445566aabb',
      msg: 'New policy rule - SLSA v1.0 provenance format will be required',
      solution:
        'Update your build pipeline to produce SLSA v1.0 provenance attestations. See https://slsa.dev/spec/v1.0/ for details.',
      collection: ['slsa3'],
      daysUntilEvent: 10,
      warningType: 'upcoming-activation' as const,
    },
    {
      title: 'Hermetic build required',
      description:
        'Root policy requires all builds to be hermetic. This rule is inherited from the organization-wide root policy and applies to all derived policies.',
      status: CONFORMA_RESULT_STATUS.warnings,
      timestamp: dayjs().add(30, 'day').toISOString(),
      component: 'api-server',
      containerImage: 'quay.io/myorg/api-server@sha256:a1b2c3d4e5f60011223344556677889900aabbccddeeff0011223344556677',
      msg: 'New root policy rule - hermetic builds will be required',
      solution:
        'Configure your build pipeline for hermetic builds. See https://konflux-ci.dev/docs/how-tos/configuring/hermetic-builds/',
      collection: ['redhat'],
      daysUntilEvent: 30,
      warningType: 'upcoming-activation' as const,
      policySource: 'root' as const,
    },
    {
      title: 'No tasks run',
      description:
        'This policy enforces that at least one Task is present in the PipelineRun attestation.',
      status: CONFORMA_RESULT_STATUS.successes,
      component: 'api-server',
      containerImage: 'quay.io/myorg/api-server@sha256:a1b2c3d4e5f60011223344556677889900aabbccddeeff0011223344556677',
      collection: ['minimal'],
    },
    {
      title: 'Allowed image registry',
      description: 'The container image must come from an allowed registry.',
      status: CONFORMA_RESULT_STATUS.successes,
      component: 'api-server',
      containerImage: 'quay.io/myorg/api-server@sha256:a1b2c3d4e5f60011223344556677889900aabbccddeeff0011223344556677',
      collection: ['minimal'],
    },
    {
      title: 'No tasks run',
      description:
        'This policy enforces that at least one Task is present in the PipelineRun attestation.',
      status: CONFORMA_RESULT_STATUS.successes,
      component: 'worker',
      containerImage: 'quay.io/myorg/worker@sha256:def456789abc0011223344556677889900aabbccddeeff00112233445566aabb',
      collection: ['minimal'],
    },
    {
      title: 'Allowed image registry',
      description: 'The container image must come from an allowed registry.',
      status: CONFORMA_RESULT_STATUS.successes,
      component: 'worker',
      containerImage: 'quay.io/myorg/worker@sha256:def456789abc0011223344556677889900aabbccddeeff00112233445566aabb',
      collection: ['minimal'],
    },
    {
      title: 'No tasks run',
      description:
        'This policy enforces that at least one Task is present in the PipelineRun attestation.',
      status: CONFORMA_RESULT_STATUS.successes,
      component: 'auth-service',
      containerImage: 'quay.io/myorg/auth-service@sha256:88991a2b3c4d5e6f0011223344556677889900aabbccddeeff001122334455',
      collection: ['minimal'],
    },
    {
      title: 'Allowed image registry',
      description: 'The container image must come from an allowed registry.',
      status: CONFORMA_RESULT_STATUS.successes,
      component: 'auth-service',
      containerImage: 'quay.io/myorg/auth-service@sha256:88991a2b3c4d5e6f0011223344556677889900aabbccddeeff001122334455',
      collection: ['minimal'],
    },
    {
      title: 'Missing CVE scan results',
      description:
        'The clair-scan task results have not been found in the SLSA Provenance attestation of the build pipeline.',
      status: CONFORMA_RESULT_STATUS.successes,
      component: 'auth-service',
      containerImage: 'quay.io/myorg/auth-service@sha256:88991a2b3c4d5e6f0011223344556677889900aabbccddeeff001122334455',
      collection: ['minimal'],
    },
];

export const mockPolicyResults: Record<string, UIConformaData[]> = {
  'backend-api': backendApiResults,
  'my-app-oneone': backendApiResults,
  'frontend-app': generateMockResults(),
};
