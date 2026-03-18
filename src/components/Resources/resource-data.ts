export type ResourceType = 'documentation' | 'tutorial' | 'how-to' | 'quickstart';

export type Resource = {
  name: string;
  displayName: string;
  description: string;
  url: string;
  type: ResourceType;
  provider: string;
  category: string;
  durationMinutes?: number;
  enabled: boolean;
};

export const DOC_TYPE_LABELS: Record<ResourceType, string> = {
  documentation: 'Documentation',
  tutorial: 'Tutorial',
  'how-to': 'How-to',
  quickstart: 'Quick start',
};

export const DOC_TYPE_COLORS: Record<ResourceType, string> = {
  documentation: 'blue',
  tutorial: 'green',
  'how-to': 'orange',
  quickstart: 'purple',
};

export const getDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
};

export const HARDCODED_RESOURCES: Resource[] = [
  {
    name: 'getting-started-with-konflux',
    displayName: 'Getting started with Konflux',
    description:
      'Learn how to set up your first application in Konflux, configure pipelines, and deploy your code. This guide walks you through the basic concepts and workflows.',
    url: 'https://konflux-ci.dev/docs/getting-started/',
    type: 'documentation',
    provider: 'Konflux',
    category: 'Getting Started',
    durationMinutes: 15,
    enabled: true,
  },
  {
    name: 'creating-applications',
    displayName: 'Creating applications',
    description:
      'Step-by-step instructions for creating and managing applications in Konflux. Learn about application components, build pipelines, and deployment strategies.',
    url: 'https://konflux-ci.dev/docs/how-tos/creating/',
    type: 'how-to',
    provider: 'Konflux',
    category: 'Getting Started',
    durationMinutes: 10,
    enabled: true,
  },
  {
    name: 'configuring-builds',
    displayName: 'Configuring build pipelines',
    description:
      'Configure and customize build pipelines for your applications. Understand Tekton pipeline concepts, custom tasks, and how to optimize your build process.',
    url: 'https://konflux-ci.dev/docs/how-tos/configuring-builds/',
    type: 'how-to',
    provider: 'Konflux',
    category: 'Pipelines',
    durationMinutes: 20,
    enabled: true,
  },
  {
    name: 'tekton-pipelines-tutorial',
    displayName: 'Tekton pipelines tutorial',
    description:
      'An interactive tutorial covering Tekton pipeline fundamentals. Build, test, and deploy a sample application using Tekton tasks and pipelines in Konflux.',
    url: 'https://tekton.dev/docs/getting-started/pipelines/',
    type: 'tutorial',
    provider: 'Tekton',
    category: 'Pipelines',
    durationMinutes: 30,
    enabled: true,
  },
  {
    name: 'enterprise-contract-docs',
    displayName: 'Enterprise Contract policies',
    description:
      'Understand how Enterprise Contract policies work to verify your software supply chain. Learn to define, customize, and enforce policies for your releases.',
    url: 'https://enterprisecontract.dev/docs/',
    type: 'documentation',
    provider: 'Enterprise Contract',
    category: 'Security',
    durationMinutes: 25,
    enabled: true,
  },
  {
    name: 'managing-releases',
    displayName: 'Managing releases',
    description:
      'Learn how to create and manage release plans, configure release pipelines, and track the status of your releases through the release lifecycle.',
    url: 'https://konflux-ci.dev/docs/how-tos/releases/',
    type: 'how-to',
    provider: 'Konflux',
    category: 'Releases',
    durationMinutes: 15,
    enabled: true,
  },
  {
    name: 'integration-tests-guide',
    displayName: 'Setting up integration tests',
    description:
      'Configure integration tests to validate your application components work together. Define test scenarios, manage test environments, and analyze results.',
    url: 'https://konflux-ci.dev/docs/how-tos/testing/',
    type: 'how-to',
    provider: 'Konflux',
    category: 'Testing',
    durationMinutes: 20,
    enabled: true,
  },
  {
    name: 'supply-chain-security',
    displayName: 'Supply chain security overview',
    description:
      'An overview of supply chain security features in Konflux, including SLSA compliance, signed attestations, and provenance tracking for build artifacts.',
    url: 'https://konflux-ci.dev/docs/concepts/supply-chain-security/',
    type: 'documentation',
    provider: 'Konflux',
    category: 'Security',
    durationMinutes: 20,
    enabled: true,
  },
  {
    name: 'gitops-deployment-tutorial',
    displayName: 'GitOps deployment tutorial',
    description:
      'Follow this tutorial to deploy your application using GitOps principles. Learn how Konflux integrates with Argo CD for automated, declarative deployments.',
    url: 'https://konflux-ci.dev/docs/how-tos/deploying/',
    type: 'tutorial',
    provider: 'Konflux',
    category: 'Deployment',
    durationMinutes: 45,
    enabled: true,
  },
  {
    name: 'quick-start-first-app',
    displayName: 'Quick start: Your first application',
    description:
      'A quick start guide that walks you through creating your first application, importing source code, and triggering your first build in just a few minutes.',
    url: '#',
    type: 'quickstart',
    provider: 'Konflux',
    category: 'Getting Started',
    durationMinutes: 5,
    enabled: true,
  },
  {
    name: 'user-access-management',
    displayName: 'User access and permissions',
    description:
      'Learn how to manage user access, roles, and permissions within your Konflux workspace. Configure RBAC policies to control who can view and modify resources.',
    url: 'https://konflux-ci.dev/docs/how-tos/user-access/',
    type: 'documentation',
    provider: 'Konflux',
    category: 'Administration',
    durationMinutes: 10,
    enabled: true,
  },
  {
    name: 'sigstore-cosign-signing',
    displayName: 'Container signing with Sigstore',
    description:
      'How to use Sigstore and Cosign to sign your container images in Konflux build pipelines. Ensure image integrity and establish trust in your supply chain.',
    url: 'https://docs.sigstore.dev/',
    type: 'documentation',
    provider: 'Sigstore',
    category: 'Security',
    enabled: false,
  },
  {
    name: 'troubleshooting-builds',
    displayName: 'Troubleshooting failed builds',
    description:
      'Common build failures and how to resolve them. Debug pipeline run errors, inspect task logs, and understand error messages to get your builds passing.',
    url: 'https://konflux-ci.dev/docs/how-tos/troubleshooting/',
    type: 'how-to',
    provider: 'Konflux',
    category: 'Pipelines',
    durationMinutes: 15,
    enabled: true,
  },
  {
    name: 'renovate-dependency-updates',
    displayName: 'Automated dependency updates',
    description:
      'Set up Renovate for automated dependency updates in your Konflux components. Keep your dependencies current and reduce security vulnerabilities.',
    url: 'https://konflux-ci.dev/docs/how-tos/configuring-builds/renovate/',
    type: 'tutorial',
    provider: 'Konflux',
    category: 'Pipelines',
    durationMinutes: 20,
    enabled: true,
  },
  {
    name: 'konflux-architecture',
    displayName: 'Konflux architecture overview',
    description:
      'Understand the architecture of Konflux, including how components interact, the role of Tekton, Enterprise Contract, and the overall platform design.',
    url: 'https://konflux-ci.dev/docs/concepts/architecture/',
    type: 'documentation',
    provider: 'Konflux',
    category: 'Getting Started',
    durationMinutes: 30,
    enabled: true,
  },
];
